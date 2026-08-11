"use client";
import React from "react";
import {
  Terminal,
  TerminalBody,
  TerminalInput,
  TerminalPrompt,
  TerminalBodyContent,
  TerminalProvider,
  useTerminal,
} from "@/components/chatcn/system/terminal";

// Shows the working directory so `cd` has a visible effect.
function Prompt() {
  const { cwd } = useTerminal();
  return (
    <TerminalPrompt className="font-mono flex items-center gap-1">
      <span>
        <span className="text-secondary">gaurav</span>
        <span className="text-muted-foreground">@</span>
        <span className="text-primary">ubuntu</span>
      </span>
      <span className="text-muted-foreground">
        {cwd.length ? `~/${cwd.join("/")}` : "~"}
      </span>
      <span className="text-muted-foreground">$</span>
    </TerminalPrompt>
  );
}

function TerminalContent() {
  return (
    <Terminal className="w-full h-full font-mono text-sm sm:text-md shadow-xl flex flex-col">
      <TerminalBody className="bg-card/95 flex-1 flex flex-col backdrop-blur-xs">
        <TerminalBodyContent prompt={<Prompt />} />

        <div className="flex gap-2">
          <Prompt />
          <TerminalInput />
        </div>
      </TerminalBody>
    </Terminal>
  );
}

export const TerminalUI = () => {
  return (
    <div className="h-full w-full flex items-stretch">
      <TerminalProvider initialState="normal">
        <TerminalContent />
      </TerminalProvider>
    </div>
  );
};
