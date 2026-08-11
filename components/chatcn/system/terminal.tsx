import { cn } from "@/lib/utils";
import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { TerminalIntro } from "@/components/renders/terminal-intro";
import { useStore } from "@/store/useStore";
import { runCommand, CLEAR, EXIT, HelpOutput } from "@/lib/commands";
import Link from "next/link";

type TerminalState = "normal" | "minimize" | "maximize";

type TerminalEntry = {
  command: string;
  output: React.ReactNode | string;
};

type TerminalContextType = {
  terminalState: TerminalState;
  setTerminalState: React.Dispatch<React.SetStateAction<TerminalState>>;
  terminalHistory: TerminalEntry[];
  setTerminalHistory: React.Dispatch<React.SetStateAction<TerminalEntry[]>>;
  cwd: string[];
  setCwd: React.Dispatch<React.SetStateAction<string[]>>;
};

const TerminalContext = createContext<TerminalContextType>({
  terminalState: "normal",
  setTerminalState: () => {},
  terminalHistory: [],
  setTerminalHistory: () => {},
  cwd: [],
  setCwd: () => {},
});

type TerminalProviderProps = {
  children: ReactNode;
  initialState?: TerminalState;
};

export function TerminalProvider({
  children,
  initialState = "normal",
}: TerminalProviderProps) {
  const [terminalState, setTerminalState] =
    useState<TerminalState>(initialState);
  const [cwd, setCwd] = useState<string[]>([]);
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([
    {
      command: "",
      output: <TerminalIntro />,
    },
    {
      command: "help",
      output: <HelpOutput />,
    },
    {
      command: "",
      output: (
        <div className="border w-fit p-2 rounded mt-2 flex items-center gap-1">
          <Info className="size-4" />
          Components here used are from
          <Link
            href="https://chatcn.me"
            target="_blank"
            className="text-primary underline"
          >
            chatcn.me
          </Link>
          ✨
        </div>
      ),
    },
  ]);

  return (
    <TerminalContext.Provider
      value={{
        terminalState,
        setTerminalState,
        terminalHistory,
        setTerminalHistory,
        cwd,
        setCwd,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within a TerminalProvider");
  }
  return context;
}

type TerminalProps = {
  children: ReactNode;
  className?: string;
};

function getTerminalPositionClasses(state: TerminalState): string {
  switch (state) {
    case "maximize":
      return "fixed inset-0 w-screen h-screen z-[9999] rounded-none text-md";
    case "minimize":
      return "fixed bottom-3 left-1/2 -translate-x-1/2 h-auto z-[9999] cursor-pointer";
    case "normal":
    default:
      return "relative h-auto";
  }
}

export function Terminal({ children, className }: TerminalProps) {
  const { terminalState, setTerminalState } = useContext(TerminalContext);

  const handleClick = () => {
    if (terminalState === "minimize") {
      setTerminalState("normal");
    }
  };

  const content = (
    <div
      onClick={handleClick}
      className={cn(
        "flex flex-col border rounded overflow-auto",
        terminalState === "maximize" ? "" : className,
        getTerminalPositionClasses(terminalState)
      )}
    >
      {children}
    </div>
  );

  if (terminalState === "maximize" || terminalState === "minimize") {
    return createPortal(content, document.body);
  }
  return content;
}

type TerminalHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function TerminalHeader({ children, className }: TerminalHeaderProps) {
  return (
    <header className={cn("p-3 bg-muted rounded rounded-b-none", className)}>
      {children}
    </header>
  );
}

export function TerminalInput() {
  const { setTerminalHistory, cwd, setCwd } = useContext(TerminalContext);
  const [inputValue, setInputValue] = useState<string>("");
  // Commands the user has typed, for `history` and the arrow keys.
  const [entered, setEntered] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const {
    closeApp,
    openApp,
    setTheme,
    setAppManagerOpen,
    setContactOpen,
    setGamesOpen,
  } = useStore();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Up/down walk back through what you've typed, like a real shell.
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (!entered.length) return;
      event.preventDefault();
      const next =
        event.key === "ArrowUp"
          ? historyIndex === null
            ? entered.length - 1
            : Math.max(0, historyIndex - 1)
          : historyIndex === null
            ? null
            : historyIndex + 1;

      if (next === null || next >= entered.length) {
        setHistoryIndex(null);
        setInputValue("");
      } else {
        setHistoryIndex(next);
        setInputValue(entered[next]);
      }
      return;
    }

    if (event.key !== "Enter") return;

    const command = inputValue.trim();
    setHistoryIndex(null);

    if (!command) {
      setTerminalHistory((prev) => [...prev, { command: "", output: "" }]);
      setInputValue("");
      return;
    }

    const output = runCommand(command, {
      cwd,
      setCwd,
      openApp,
      setTheme,
      setAppManagerOpen,
      setContactOpen,
      setGamesOpen,
      history: entered,
    });

    setEntered((prev) => [...prev, command]);

    if (output === CLEAR) {
      setTerminalHistory([]);
      setInputValue("");
      return;
    }
    if (output === EXIT) {
      closeApp("terminal");
      return;
    }

    setTerminalHistory((prev) => [...prev, { command, output }]);
    setInputValue("");
  };

  return (
    <input
      onKeyDown={handleKeyDown}
      onChange={(e) => setInputValue(e.target.value)}
      value={inputValue}
      className="flex-1 bg-transparent text-md outline-none border-none caret-amber-300"
      type="text"
      autoFocus
    />
  );
}

type TerminalPromptProps = {
  children: React.ReactNode;
  className?: string;
};
export function TerminalPrompt({ children, className }: TerminalPromptProps) {
  return <div className={cn(className)}>{children}</div>;
}

type TerminalBodyProps = {
  children: ReactNode;
  className?: string;
};

export function TerminalBody({ children, className }: TerminalBodyProps) {
  const { terminalState } = useContext(TerminalContext);

  if (terminalState === "minimize") {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-muted rounded-none rounded-b p-3 overflow-y-auto",
        terminalState === "maximize" ? "flex-1" : className
      )}
    >
      {children}
    </div>
  );
}

type TerminalBodyContentProps = {
  className?: string;
  prompt?: ReactNode;
};

export function TerminalBodyContent({
  className,
  prompt,
}: TerminalBodyContentProps) {
  const { terminalHistory } = useContext(TerminalContext);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  return (
    <div className={cn("space-y-3", className)}>
      {terminalHistory.map((entry, index) => (
        <div key={index}>
          <div className="flex gap-2">
            {prompt}
            <span>{entry.command}</span>
          </div>
          {entry.output && entry.output !== "CLEAR" && (
            <div className="text-md">{entry.output}</div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
