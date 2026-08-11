"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GRID_SIZE = 20;
const MAX_CELL_SIZE = 20;
const MIN_CELL_SIZE = 11;
// Below this a swipe is treated as a tap, not a direction.
const SWIPE_THRESHOLD = 24;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

type Position = {
  x: number;
  y: number;
};

type Direction = {
  x: number;
  y: number;
};

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef(direction);
  // The board is square and cell-based, so it has to be sized from the space
  // it actually gets — a fixed 20px cell overflowed every phone.
  const [cellSize, setCellSize] = useState(MAX_CELL_SIZE);
  const sizerRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Update direction ref when direction changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const el = sizerRef.current;
    if (!el) return;
    const measure = () => {
      const available = el.clientWidth;
      if (!available) return;
      const size = Math.floor(available / GRID_SIZE);
      setCellSize(Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, size)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Single entry point for keyboard and swipe. Writes the ref immediately so
  // two inputs inside one tick can't combine into a reversal onto itself.
  const changeDirection = useCallback((x: number, y: number) => {
    const current = directionRef.current;
    if (x !== 0 && current.x !== 0) return;
    if (y !== 0 && current.y !== 0) return;
    directionRef.current = { x, y };
    setDirection({ x, y });
  }, []);

  const generateFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 15, y: 15 });
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
    setIsPaused(false);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  };

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // Check self collision
      if (
        prevSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isPaused, food, generateFood]);

  // Game loop
  useEffect(() => {
    if (isPlaying && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, isPaused, moveSnake]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      const key = e.key;

      // Prevent reverse direction
      if (key === "ArrowUp") {
        changeDirection(0, -1);
      } else if (key === "ArrowDown") {
        changeDirection(0, 1);
      } else if (key === "ArrowLeft") {
        changeDirection(-1, 0);
      } else if (key === "ArrowRight") {
        changeDirection(1, 0);
      } else if (key === " ") {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, gameOver, changeDirection]);

  const isCellSnake = (x: number, y: number) => {
    return snake.some((segment) => segment.x === x && segment.y === y);
  };

  const isCellFood = (x: number, y: number) => {
    return food.x === x && food.y === y;
  };

  const isCellHead = (x: number, y: number) => {
    return snake[0]?.x === x && snake[0]?.y === y;
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Snake Game</span>
          <span className="text-2xl font-bold">Score: {score}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Game Board — sizer measures the space, board sizes itself to fit */}
        <div ref={sizerRef} className="w-full flex justify-center">
        <div
          className="border-2 border-primary rounded-lg overflow-hidden shadow-lg touch-none select-none"
          style={{
            width: GRID_SIZE * cellSize,
            height: GRID_SIZE * cellSize,
          }}
          onTouchStart={(e) => {
            const t = e.touches[0];
            touchStart.current = { x: t.clientX, y: t.clientY };
          }}
          onTouchEnd={(e) => {
            const start = touchStart.current;
            if (!start) return;
            touchStart.current = null;
            if (!isPlaying || gameOver) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - start.x;
            const dy = t.clientY - start.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
            if (Math.abs(dx) > Math.abs(dy)) {
              changeDirection(dx > 0 ? 1 : -1, 0);
            } else {
              changeDirection(0, dy > 0 ? 1 : -1);
            }
          }}
        >
          <div
            className="grid bg-secondary/20"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${cellSize}px)`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isSnake = isCellSnake(x, y);
              const isFood = isCellFood(x, y);
              const isHead = isCellHead(x, y);

              return (
                <div
                  key={index}
                  className={`border border-secondary/10 transition-colors ${
                    isHead
                      ? "bg-green-600"
                      : isSnake
                      ? "bg-green-500"
                      : isFood
                      ? "bg-red-500 rounded-full"
                      : ""
                  }`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                  }}
                />
              );
            })}
          </div>
        </div>
        </div>

        {/* Game Controls */}
        <div className="flex flex-col items-center gap-4 w-full">
          {!isPlaying && !gameOver && (
            <Button onClick={startGame} size="lg" className="w-full max-w-xs">
              Start Game
            </Button>
          )}

          {isPlaying && !gameOver && (
            <Button onClick={togglePause} size="lg" className="w-full max-w-xs">
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}

          {gameOver && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xl font-bold text-destructive">Game Over!</p>
              <p className="text-muted-foreground">Final Score: {score}</p>
              <Button onClick={startGame} size="lg" className="w-full max-w-xs">
                Play Again
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground text-center space-y-1">
            <p className="hidden sm:block">
              Use arrow keys to control the snake
            </p>
            <p className="hidden sm:block">Press Space to pause/resume</p>
            <p className="sm:hidden">Swipe on the board to steer</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
