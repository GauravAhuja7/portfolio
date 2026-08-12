"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// Below this a swipe counts as a tap.
const SWIPE_THRESHOLD = 40;

type LoginManagerProps = {
  wallpaper?: string;
  portal?: boolean;
  // Off by default: the password is printed on screen, so it secures nothing
  // and only costs a first-time visitor a keyboard. The `lock` command turns
  // it back on for people who want to see it.
  requirePassword?: boolean;
  onLogin?: () => void;
};

export function LoginManager({
  wallpaper = "/images/image.png",
  portal = false,
  requirePassword = false,
  onLogin,
}: LoginManagerProps) {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => {
      setMounted(false);
      clearTimeout(timer);
    };
  }, []);

  const enter = useCallback(() => {
    if (active) return;
    if (requirePassword) {
      setActive(true);
    } else {
      onLogin?.();
    }
  }, [active, requirePassword, onLogin]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!active && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [active, enter]);

  const handleScreenTap = () => enter();

  // Swipe up to unlock, the way a phone lock screen does — the first screen
  // already animates upward, so the gesture matches the motion.
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || active) return;
    const t = e.changedTouches[0];
    const dy = t.clientY - start.y;
    const dx = t.clientX - start.x;
    // Upward, and more vertical than horizontal.
    if (dy < -SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
      enter();
    }
  };

  if (!mounted) return null;

  const content = (
    <div
      className={cn(
        "absolute inset-0 z-[9998] h-full w-full bg-cover bg-center bg-no-repeat transition-opacity duration-500 overflow-hidden",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{ backgroundImage: `url(${wallpaper})` }}
      onClick={handleScreenTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={cn(
          "absolute inset-0 z-10 bg-black/40",
          active && "backdrop-blur-md"
        )}
      />

      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div
            key="first"
            initial={{ y: 0 }}
            animate={{ y: active ? "-100%" : 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-10"
          >
            <FirstScreen />
          </motion.div>
        ) : (
          <div className="absolute inset-0 z-40">
            <PasswordScreen onLogin={onLogin} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return portal ? createPortal(content, document.body) : content;
}

export function FirstScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="h-full w-full flex flex-col items-center text-white relative px-6">
      <div className="flex flex-col items-center space-y-3 mt-20">
        <div className="text-6xl font-bold">{formatTime(currentTime)}</div>
        <div className="text-lg">{formatDate(currentTime)}</div>
      </div>

      {/* Without this the first thing a visitor sees is an anonymous clock —
          no clue whose site it is or whether they're in the right place. */}
      <div className="flex flex-col items-center gap-4 mt-14 text-center">
        <Image
          src="/images/gaurav.jpg"
          alt="Gaurav Ahuja"
          width={128}
          height={128}
          priority
          className="size-24 sm:size-32 rounded-full object-cover ring-2 ring-white/40 shadow-xl"
        />
        <p className="text-2xl sm:text-3xl font-semibold">Gaurav Ahuja</p>
      </div>

      <p className="text-lg italic text-white/70 absolute bottom-10 text-center">
        <span className="hidden sm:inline">
          Press &quot;Space&quot; or &quot;Enter&quot; to continue
        </span>
        <span className="sm:hidden">Swipe up or tap to continue</span>
      </p>
    </div>
  );
}

export function PasswordScreen({ onLogin }: { onLogin?: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (password === "gaurav") {
      onLogin?.();
    } else {
      setError(true);
      setPassword("");
      setTimeout(() => setError(false), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center text-white relative">
      <div className="flex flex-col items-center space-y-4">
        <Image
          src="/images/gaurav.jpg"
          alt="Gaurav Ahuja"
          width={96}
          height={96}
          className="size-24 rounded-full object-cover ring-2 ring-white/40"
        />
        <span className="text-2xl font-semibold">gaurav</span>
        <Input
          type="password"
          autoFocus
          className={cn(
            "p-2 transition-all",
            error && "border-red-500 animate-shake"
          )}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors sm:hidden"
        >
          Unlock
        </button>
        <p className="text-sm text-primary/60 mt-3 font-light italic hidden sm:block">
          Press Enter to unlock
        </p>
        <p className="text-sm text-primary/60 fixed bottom-0 mb-10 font-light italic">
          password: gaurav
        </p>
      </div>
    </div>
  );
}
