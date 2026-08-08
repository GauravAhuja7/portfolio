"use client";
import React, { useState } from "react";
import ReactCardFlip from "react-card-flip";
import { Gem, Bomb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CellType = "diamond" | "bomb";
type Status = "playing" | "won" | "lost";

interface Cell {
  type: CellType;
  revealed: boolean;
}

const SIZE = 3;
// Set this to 0 to force a guaranteed win — handy for eyeballing the win
// screen without playing 36 rounds.
const BOMB_COUNT = 2;
const DIAMOND_COUNT = SIZE * SIZE - BOMB_COUNT;

const createGrid = (): Cell[][] => {
  const bombPositions = new Set<number>();
  while (bombPositions.size < BOMB_COUNT) {
    bombPositions.add(Math.floor(Math.random() * SIZE * SIZE));
  }

  const grid: Cell[][] = [];
  for (let i = 0; i < SIZE; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < SIZE; j++) {
      const position = i * SIZE + j;
      row.push({
        type: bombPositions.has(position) ? "bomb" : "diamond",
        revealed: false,
      });
    }
    grid.push(row);
  }
  return grid;
};

const revealAll = (grid: Cell[][]) =>
  grid.map((row) => row.map((cell) => ({ ...cell, revealed: true })));

interface GameCellProps {
  cell: Cell;
  onClick: () => void;
  disabled: boolean;
}

function GameCell({ cell, onClick, disabled }: GameCellProps) {
  return (
    <ReactCardFlip flipDirection="horizontal" isFlipped={cell.revealed}>
      <Card
        onClick={disabled ? undefined : onClick}
        className={`w-24 h-24 flex items-center justify-center p-0 ${
          disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-accent"
        }`}
      >
        <span className="text-3xl text-muted-foreground/30">?</span>
      </Card>

      <Card
        className={`w-24 h-24 flex items-center justify-center p-0 ${
          cell.type === "bomb"
            ? "bg-destructive/10 border-destructive"
            : "bg-primary/10 border-primary"
        }`}
      >
        {cell.type === "bomb" ? (
          <Bomb className="w-10 h-10 text-destructive" />
        ) : (
          <Gem className="w-10 h-10 text-primary" />
        )}
      </Card>
    </ReactCardFlip>
  );
}

export function DiamondGame() {
  const [grid, setGrid] = useState<Cell[][]>(createGrid);
  const [status, setStatus] = useState<Status>("playing");
  const [score, setScore] = useState(0);
  // Bumped on every reset so the cards remount unflipped. Without it the
  // flip-back animation runs against the freshly generated grid, which shows
  // the new bomb positions for the length of the animation.
  const [round, setRound] = useState(0);

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (status !== "playing" || grid[rowIndex][colIndex].revealed) return;

    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    newGrid[rowIndex][colIndex].revealed = true;

    if (newGrid[rowIndex][colIndex].type === "bomb") {
      setGrid(revealAll(newGrid));
      setStatus("lost");
      return;
    }

    const nextScore = score + 1;
    setScore(nextScore);

    if (nextScore === DIAMOND_COUNT) {
      setGrid(revealAll(newGrid));
      setStatus("won");
      return;
    }

    setGrid(newGrid);
  };

  const resetGame = () => {
    setGrid(createGrid());
    setStatus("playing");
    setScore(0);
    setRound((r) => r + 1);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Diamond Hunt</h1>
        <p className="text-muted-foreground text-sm">
          Find all {DIAMOND_COUNT} diamonds, avoid the bombs!
        </p>
      </div>

      <div className="text-xl font-semibold">
        Score:{" "}
        <span className="text-primary">
          {score}/{DIAMOND_COUNT}
        </span>
      </div>

      {status === "lost" && (
        <div className="text-lg font-bold text-destructive">Game Over!</div>
      )}

      {status === "won" && (
        <div className="text-lg font-bold text-primary">
          You win! Found all {DIAMOND_COUNT} 🎉
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {grid.map((row, i) =>
          row.map((cell, j) => (
            <GameCell
              key={`${round}-${i}-${j}`}
              cell={cell}
              onClick={() => handleCellClick(i, j)}
              disabled={status !== "playing"}
            />
          ))
        )}
      </div>

      <Button onClick={resetGame} size="lg" className="gap-2">
        <RotateCcw className="w-4 h-4" />
        New Game
      </Button>
    </div>
  );
}
