import type { ReactNode } from "react";
import type { FileNode } from "@/hooks/useFileManager";
import type { AppType } from "@/store/useStore";
import type { ThemeId } from "@/lib/themes";
import { FILE_TREE } from "@/lib/file-tree";
import { THEME_LIST, isThemeId } from "@/lib/themes";

// Sentinels the input handler acts on rather than printing.
export const CLEAR = "CLEAR";
export const EXIT = "EXIT";

export type CommandContext = {
  cwd: string[];
  setCwd: (path: string[]) => void;
  openApp: (app: AppType) => void;
  setTheme: (theme: ThemeId) => void;
  setAppManagerOpen: (open: boolean) => void;
  setContactOpen: (open: boolean) => void;
  setGamesOpen: (open: boolean) => void;
  history: string[];
};

export type Command = {
  description: string;
  usage?: string;
  hidden?: boolean;
  run: (args: string[], ctx: CommandContext) => ReactNode | string;
};

/* ---------------------------------------------------------------- helpers */

function nodesAt(path: string[]): FileNode[] | null {
  let nodes = FILE_TREE;
  for (const part of path) {
    const next = nodes.find((n) => n.name === part && n.type === "folder");
    if (!next?.children) return null;
    nodes = next.children;
  }
  return nodes;
}

function prettyPath(path: string[]): string {
  return path.length ? `~/${path.join("/")}` : "~";
}

function resolve(cwd: string[], target: string): string[] | null {
  if (target === "~" || target === "/") return [];
  const parts = target.split("/").filter(Boolean);
  const next = target.startsWith("/") || target.startsWith("~") ? [] : [...cwd];
  for (const part of parts) {
    if (part === "~") continue;
    if (part === ".") continue;
    if (part === "..") {
      next.pop();
      continue;
    }
    next.push(part);
  }
  return nodesAt(next) ? next : null;
}

function Line({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

// Generated from the registry, so help can never drift out of sync with the
// commands that actually exist. Hidden ones are left for people to find.
export function HelpOutput() {
  return (
    <div className="space-y-1">
      <p>Available commands:</p>
      <div className="ml-4 grid grid-cols-[auto_1fr] gap-x-4">
        {Object.entries(COMMANDS)
          .filter(([, c]) => !c.hidden)
          .map(([name, c]) => (
            <div key={name} className="contents">
              <span className="text-primary">{c.usage ?? name}</span>
              <span className="text-muted-foreground">{c.description}</span>
            </div>
          ))}
      </div>
      <p className="text-muted-foreground pt-1">
        Tab-free zone, but ↑/↓ walks your history and Ctrl+K opens the launcher.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- commands */

export const COMMANDS: Record<string, Command> = {
  help: {
    description: "list every command",
    run: () => <HelpOutput />,
  },

  ls: {
    description: "list what's in the current directory",
    usage: "ls [dir]",
    run: (args, ctx) => {
      const path = args[0] ? resolve(ctx.cwd, args[0]) : ctx.cwd;
      if (!path) return `ls: ${args[0]}: no such directory`;
      const nodes = nodesAt(path);
      if (!nodes) return `ls: ${args[0]}: no such directory`;
      if (!nodes.length) return "(empty)";
      return (
        <div className="flex flex-wrap gap-x-4">
          {nodes.map((n) => (
            <span
              key={n.name}
              className={n.type === "folder" ? "text-primary" : ""}
            >
              {n.name}
              {n.type === "folder" ? "/" : ""}
            </span>
          ))}
        </div>
      );
    },
  },

  cd: {
    description: "change directory",
    usage: "cd <dir>",
    run: (args, ctx) => {
      const target = args[0] ?? "~";
      const path = resolve(ctx.cwd, target);
      if (!path) return `cd: ${target}: no such directory`;
      ctx.setCwd(path);
      return "";
    },
  },

  pwd: {
    description: "print the current directory",
    run: (_args, ctx) => prettyPath(ctx.cwd),
  },

  cat: {
    description: "print a file",
    usage: "cat <file>",
    run: (args, ctx) => {
      if (!args[0]) return "cat: missing file name";
      const nodes = nodesAt(ctx.cwd) ?? [];
      const file = nodes.find((n) => n.name === args[0] && n.type === "file");
      if (!file) return `cat: ${args[0]}: no such file`;
      if (file.src)
        return (
          <Line>
            {file.name} → {file.src}
          </Line>
        );
      return file.render ?? `cat: ${args[0]}: nothing to show`;
    },
  },

  open: {
    description: "open an app in a new pane",
    usage: "open <terminal|browser|files>",
    run: (args, ctx) => {
      const alias: Record<string, AppType> = {
        terminal: "terminal",
        browser: "browser",
        files: "file-manager",
        "file-manager": "file-manager",
        filemanager: "file-manager",
      };
      const app = alias[(args[0] ?? "").toLowerCase()];
      if (!app) return "usage: open <terminal|browser|files>";
      ctx.openApp(app);
      return `opening ${args[0]}...`;
    },
  },

  theme: {
    description: "switch colour theme",
    usage: "theme [name]",
    run: (args, ctx) => {
      if (!args[0])
        return (
          <div>
            <p>Available themes:</p>
            <div className="ml-4">
              {THEME_LIST.map((t) => (
                <div key={t.id} className="text-primary">
                  {t.id}
                </div>
              ))}
            </div>
          </div>
        );
      if (!isThemeId(args[0])) return `theme: ${args[0]}: unknown theme`;
      ctx.setTheme(args[0]);
      return `theme set to ${args[0]}`;
    },
  },

  contact: {
    description: "send me a message",
    run: (_args, ctx) => {
      ctx.setContactOpen(true);
      return "opening the message box...";
    },
  },

  apps: {
    description: "open the application launcher",
    run: (_args, ctx) => {
      ctx.setAppManagerOpen(true);
      return "";
    },
  },

  games: {
    description: "play something",
    run: (_args, ctx) => {
      ctx.setGamesOpen(true);
      return "opening games...";
    },
  },

  echo: {
    description: "print text back",
    usage: "echo <text>",
    run: (args) => args.join(" "),
  },

  date: {
    description: "current date and time",
    run: () => new Date().toString(),
  },

  history: {
    description: "commands you've run",
    run: (_args, ctx) =>
      ctx.history.length ? (
        <div>
          {ctx.history.map((h, i) => (
            <div key={i}>
              <span className="text-muted-foreground mr-3">{i + 1}</span>
              {h}
            </div>
          ))}
        </div>
      ) : (
        "no history yet"
      ),
  },

  whoami: {
    description: "who is this guy",
    run: () => (
      <div>
        Hi, I&apos;m Gaurav — CSE grad from IIT Mandi, backend engineer at
        Joveo. I like{" "}
        <span className="text-blue-500">distributed systems</span>, and I build
        with <span className="text-blue-500">LLMs</span> on the side.
      </div>
    ),
  },

  clear: { description: "clear the screen", run: () => CLEAR },
  exit: { description: "close the terminal", run: () => EXIT },

  /* ---- easter eggs ---- */

  sudo: {
    description: "elevate privileges",
    hidden: true,
    run: (args) =>
      args.length
        ? `nice try. ${args.join(" ")} is not in the sudoers file. This incident will be reported.`
        : "usage: sudo <command you are definitely not allowed to run>",
  },

  rm: {
    description: "remove files",
    hidden: true,
    run: (args) =>
      args.join(" ").includes("-rf") && args.join(" ").includes("/")
        ? "you know what, go ahead. it's a portfolio site, worst case I redeploy 🙂"
        : "rm: permission denied (this filesystem is read-only, and imaginary)",
  },

  vim: {
    description: "open vim",
    hidden: true,
    run: () => "vim opened. good luck getting out. (hint: try `exit`)",
  },

  coffee: {
    description: "brew coffee",
    hidden: true,
    run: () => "418 I'm a teapot ☕",
  },

  hireme: {
    description: "the pitch",
    hidden: true,
    run: (_args, ctx) => {
      ctx.setContactOpen(true);
      return "excellent decision. opening the message box...";
    },
  },
};

/* ------------------------------------------------------------ suggestions */

// Damerau-Levenshtein (optimal string alignment), used only to suggest a
// near-miss on an unknown command. Plain Levenshtein charges 2 for a swapped
// pair, which is the commonest typo there is — "cta" would then match "cd"
// as readily as "cat". Counting a transposition as 1 fixes that.
function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

export function closestCommand(input: string): string | null {
  let best: string | null = null;
  let bestScore = Infinity;
  for (const name of Object.keys(COMMANDS)) {
    const score = distance(input, name);
    if (score < bestScore) {
      bestScore = score;
      best = name;
    }
  }
  // Only suggest when it's plausibly a typo, not a totally different word.
  return bestScore <= Math.max(2, Math.floor(input.length / 3)) ? best : null;
}

export function runCommand(
  line: string,
  ctx: CommandContext,
): ReactNode | string {
  const [name, ...args] = line.trim().split(/\s+/);
  if (!name) return "";
  const command = COMMANDS[name.toLowerCase()];
  if (command) return command.run(args, ctx);

  const suggestion = closestCommand(name.toLowerCase());
  return suggestion
    ? `command not found: ${name} — did you mean \`${suggestion}\`?`
    : `command not found: ${name}`;
}
