"use client";
import { useState, useEffect, useRef } from "react";
import StatusBar from "@/components/status-bar";
import { TerminalUI } from "@/components/terminal";
import FileManager from "@/components/file-manager";
import { WebPet } from "@/components/web-pet";
import { LoginManager } from "@/components/chatcn/system/login-manager";
import { ApplicationManager } from "@/components/chatcn/system/app-manager";
import Browser from "@/components/chatcn/system/browser";
import { useStore } from "@/store/useStore";
import { Kbd } from "@/components/ui/kbd";
import { LayoutGrid } from "lucide-react";
import {
  DockviewReact,
  DockviewReadyEvent,
  IDockviewPanelProps,
  IDockviewPanel,
  DockviewTheme,
} from "dockview";
import "dockview/dist/styles/dockview.css";

const customTheme: DockviewTheme = {
  name: "custom-theme",
  className: "dockview-theme-minimal",
  gap: 8,
};

const components = {
  terminal: () => {
    return (
      <div className="h-full w-full">
        <TerminalUI />
      </div>
    );
  },
  browser: (props: IDockviewPanelProps<{ url?: string }>) => {
    return (
      <div className="h-full w-full">
        <Browser defaultUrl={props.params?.url} />
      </div>
    );
  },
  "file-manager": () => {
    return (
      <div className="h-full w-full">
        <FileManager />
      </div>
    );
  },
};

export default function Page() {
  const [isMobile, setIsMobile] = useState(false);
  const { apps, closeApp, wallpaper, setAppManagerOpen, locked, requirePassword, unlock } =
    useStore();
  // login-manager isn't a dockview panel, so it doesn't count as a window.
  const anyOpen = Boolean(
    apps.terminal || apps.browser || apps["file-manager"],
  );
  const apiRef = useRef<DockviewReadyEvent | null>(null);
  const panelRefs = useRef<Map<string, boolean>>(new Map());

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const addPanelWithPosition = (
    api: DockviewReadyEvent["api"],
    id: string,
    component: string,
    title: string,
    params: Record<string, unknown>,
    referencePanel?: IDockviewPanel,
    defaultDirection?: "below" | "right",
  ) => {
    const position = referencePanel
      ? {
          referencePanel,
          direction: isMobile ? ("within" as const) : defaultDirection,
        }
      : undefined;

    api.addPanel({
      id,
      component,
      title,
      params,
      position,
    });
  };

  const onReady = (event: DockviewReadyEvent) => {
    apiRef.current = event;

    event.api.onDidRemovePanel((panel) => {
      const panelId = panel.id;
      const appType = panelId.replace("panel_", "") as
        | "terminal"
        | "browser"
        | "file-manager";

      if (
        appType === "terminal" ||
        appType === "browser" ||
        appType === "file-manager"
      ) {
        panelRefs.current.delete(appType);
        closeApp(appType);
      }
    });

    if (apps.terminal) {
      event.api.addPanel({
        id: "panel_terminal",
        component: "terminal",
        title: "Terminal",
        params: {},
      });
      panelRefs.current.set("terminal", true);
    }

    if (apps.browser) {
      const terminalPanel = event.api.getPanel("panel_terminal");
      addPanelWithPosition(
        event.api,
        "panel_browser",
        "browser",
        "Browser",
        { url: "https://www.google.com/webhp?igu=1" },
        terminalPanel,
        "below",
      );
      panelRefs.current.set("browser", true);
    }

    if (apps["file-manager"]) {
      const browserPanel = event.api.getPanel("panel_browser");
      const terminalPanel = event.api.getPanel("panel_terminal");
      const referencePanel = browserPanel || terminalPanel;

      addPanelWithPosition(
        event.api,
        "panel_file-manager",
        "file-manager",
        "File Manager",
        {},
        referencePanel,
        "right",
      );
      panelRefs.current.set("file-manager", true);
    }
  };

  useEffect(() => {
    if (locked || !apiRef.current) return;

    const appTypes: Array<"terminal" | "browser" | "file-manager"> = [
      "terminal",
      "browser",
      "file-manager",
    ];

    appTypes.forEach((appType) => {
      const isOpen = apps[appType];
      const panelExists = panelRefs.current.get(appType);

      if (isOpen && !panelExists) {
        const panels = apiRef.current!.api.panels;
        const referencePanel = panels.length > 0 ? panels[0] : undefined;

        apiRef.current!.api.addPanel({
          id: `panel_${appType}`,
          component: appType,
          title:
            appType === "file-manager"
              ? "File Manager"
              : appType.charAt(0).toUpperCase() + appType.slice(1),
          params:
            appType === "browser"
              ? { url: "https://www.google.com/webhp?igu=1" }
              : {},
          position: referencePanel
            ? { referencePanel, direction: isMobile ? "center" : "right" }
            : undefined,
        });
        panelRefs.current.set(appType, true);
      } else if (!isOpen && panelExists) {
        // Remove panel
        const panel = apiRef.current!.api.getPanel(`panel_${appType}`);
        if (panel) {
          apiRef.current!.api.removePanel(panel);
          panelRefs.current.delete(appType);
        }
      }
    });
  }, [locked, apps, isMobile]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ApplicationManager />
      {locked ? (
        <LoginManager
          portal={true}
          wallpaper={wallpaper}
          requirePassword={requirePassword}
          onLogin={unlock}
        />
      ) : (
        <>
          <div className="flex-none">
            <StatusBar />
          </div>

          <div className="flex-1 overflow-hidden p-2 relative">
            <WebPet animal="panda" color="black" speed={3.6} scale={0.55} />
            <DockviewReact
              onReady={onReady}
              components={components}
              theme={customTheme}
              className="h-full w-full"
            />

            {/* Closing every panel otherwise leaves a blank screen with no
                hint that Ctrl+K exists. */}
            {!anyOpen && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Everything sits on one opaque card — muted text directly on
                    the wallpaper was unreadable against a bright photo. */}
                <div className="pointer-events-auto flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-8 py-6 shadow-xl">
                  <p className="text-card-foreground text-sm font-medium">
                    No windows open
                  </p>
                  <button
                    onClick={() => setAppManagerOpen(true)}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    <LayoutGrid className="size-4" />
                    Open apps
                  </button>
                  {/* card-foreground/80 rather than muted-foreground: at this
                      size muted only reaches 4.4:1 on the card, just under AA. */}
                  <p className="text-card-foreground/80 text-xs">
                    or press <Kbd>Ctrl</Kbd>+<Kbd>k</Kbd>
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
