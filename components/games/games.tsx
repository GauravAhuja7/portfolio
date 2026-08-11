"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DiamondGame } from "./diamond";
import SnakeGame from "../snake-game";

const GAMES = [
  { id: "diamond", label: "Diamond Hunt" },
  { id: "snake", label: "Snake" },
] as const;

type GameId = (typeof GAMES)[number]["id"];

export function Games() {
  const [active, setActive] = useState<GameId>("diamond");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center gap-2">
        {GAMES.map((game) => (
          <Button
            key={game.id}
            size="sm"
            variant={active === game.id ? "default" : "outline"}
            onClick={() => setActive(game.id)}
          >
            {game.label}
          </Button>
        ))}
      </div>

      {/* Vertical scroll only — the board sizes itself to the width it gets,
          so a horizontal scroller would just let it overflow instead. */}
      <div className="max-h-[70vh] overflow-y-auto">
        {active === "diamond" ? <DiamondGame /> : <SnakeGame />}
      </div>
    </div>
  );
}
