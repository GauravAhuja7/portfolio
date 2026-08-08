"use client";

import { useEffect, useState } from "react";

type Info = { label: string; value: string };

// Rendered on the server, and kept for any field the browser can't report.
// WM and Terminal have no web equivalent, so they always show these — which
// is also what keeps the block reading as an i3 box rather than a spec sheet.
const FALLBACK: Info[] = [
  { label: "OS", value: "Ubuntu 24.04.3 LTS x86_64" },
  { label: "Host", value: "Nitro AN515-57 V1.17" },
  { label: "Uptime", value: "10 mins" },
  { label: "WM", value: "i3" },
  { label: "Terminal", value: "tmux" },
  { label: "CPU", value: "11th Gen Intel i5-11400H (12) @ 4.500GHz" },
];

const FALLBACK_HOSTNAME = "ubuntu";

// Only ever reports an architecture the user agent literally states. Safari
// and Chrome both still claim "Intel Mac OS X" on Apple Silicon, so guessing
// would be worse than saying nothing.
function detectOS(ua: string): { name: string; hostname: string } | null {
  const arch = /(x86_64|aarch64|arm64)/.exec(ua)?.[1] ?? "";
  const suffix = arch ? ` ${arch}` : "";

  if (/Windows NT 10/.test(ua)) return { name: "Windows 10", hostname: "windows" };
  if (/Windows/.test(ua)) return { name: "Windows", hostname: "windows" };
  if (/CrOS/.test(ua)) return { name: `ChromeOS${suffix}`, hostname: "chromeos" };
  if (/Android/.test(ua)) return { name: "Android", hostname: "android" };
  if (/(iPhone|iPad|iPod)/.test(ua)) return { name: "iOS", hostname: "ios" };
  if (/Mac OS X/.test(ua)) return { name: "macOS", hostname: "macos" };
  if (/(Linux|X11)/.test(ua)) return { name: `Linux${suffix}`, hostname: "linux" };
  return null;
}

// Order matters: Edge and Opera both also match Chrome's token.
function detectBrowser(ua: string): string | null {
  const checks: Array<[string, RegExp]> = [
    ["Edge", /Edg\/(\d+)/],
    ["Opera", /OPR\/(\d+)/],
    ["Firefox", /Firefox\/(\d+)/],
    ["Chrome", /Chrome\/(\d+)/],
    ["Safari", /Version\/(\d+).*Safari/],
  ];
  for (const [name, re] of checks) {
    const match = re.exec(ua);
    if (match) return `${name} ${match[1]}`;
  }
  return null;
}

function detectCPU(): string | null {
  const cores = navigator.hardwareConcurrency;
  if (!cores) return null;
  return `${cores} core${cores === 1 ? "" : "s"}`;
}

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

// Time since the page was opened — the closest honest analogue to uptime.
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return plural(seconds, "sec");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return plural(minutes, "min");
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest
    ? `${plural(hours, "hour")}, ${plural(rest, "min")}`
    : plural(hours, "hour");
}

export function TerminalIntro() {
  const [detected, setDetected] = useState<Record<string, string>>({});
  const [hostname, setHostname] = useState(FALLBACK_HOSTNAME);

  useEffect(() => {
    const ua = navigator.userAgent;
    const os = detectOS(ua);
    const browser = detectBrowser(ua);
    const cpu = detectCPU();

    const base: Record<string, string> = {};
    if (os) base.OS = os.name;
    if (browser) base.Host = browser;
    if (cpu) base.CPU = cpu;
    if (os) setHostname(os.hostname);

    if (typeof performance === "undefined") {
      setDetected(base);
      return;
    }

    // Only re-render when the rendered string actually changes.
    const tick = () =>
      setDetected((prev) => {
        const next = formatUptime(performance.now());
        return prev.Uptime === next ? prev : { ...base, Uptime: next };
      });

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const systemInfo = FALLBACK.map((item) => ({
    label: item.label,
    value: detected[item.label] ?? item.value,
  }));

  return (
    <div className="flex gap-4 flex-col md:flex-row">
      {/* Follows the active theme's wallpaper via the CSS variable, so it
          can't drift out of sync the way a hardcoded src would. */}
      <div
        aria-hidden
        className="opacity-70 md:w-50 h-50 border w-full bg-cover bg-center"
        style={{ backgroundImage: "var(--wallpaper)" }}
      />

      <div className="hidden md:block">
        <p className="text-primary">gaurav@{hostname}</p>
        <p>--------------</p>
        {systemInfo.map((info) => (
          <div key={info.label} className="flex space-x-2">
            <span className="text-secondary">{info.label}:</span>{" "}
            <p className="text-primary">{info.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
