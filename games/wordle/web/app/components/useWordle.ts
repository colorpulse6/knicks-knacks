"use client";

import { useState, useCallback, useEffect } from "react";
import { getDailyWord, isValidWord } from "./words";

export type LetterState = "correct" | "present" | "absent" | "empty" | "tbd";

export interface TileData {
  letter: string;
  state: LetterState;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const initialStats: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
};

function loadStats(): GameStats {
  if (typeof window === "undefined") return initialStats;
  const saved = localStorage.getItem("wordle-stats");
  return saved ? JSON.parse(saved) : initialStats;
}

function saveStats(stats: GameStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("wordle-stats", JSON.stringify(stats));
}

function loadGameState(): {
  guesses: string[];
  lastPlayed: string | null;
} | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem("wordle-game-state");
  return saved ? JSON.parse(saved) : null;
}

function saveGameState(guesses: string[], date: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    "wordle-game-state",
    JSON.stringify({ guesses, lastPlayed: date })
  );
}

export function useWordle() {
  const [solution, setSolution] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [stats, setStats] = useState<GameStats>(initialStats);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const word = getDailyWord();
    setSolution(word);
    setStats(loadStats());

    const today = new Date().toISOString().split("T")[0];
    const savedState = loadGameState();

    if (savedState && savedState.lastPlayed === today) {
      setGuesses(savedState.guesses);
      if (savedState.guesses.includes(word)) {
        setGameOver(true);
        setWon(true);
      } else if (savedState.guesses.length >= MAX_GUESSES) {
        setGameOver(true);
      }
    }
  }, []);

  const showMessage = useCallback((msg: string, duration = 1500) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  }, []);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setShake(true);
      showMessage("Not enough letters");
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (!isValidWord(currentGuess)) {
      setShake(true);
      showMessage("Not in word list");
      setTimeout(() => setShake(false), 500);
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess("");

    const today = new Date().toISOString().split("T")[0];
    saveGameState(newGuesses, today);

    if (currentGuess === solution) {
      setGameOver(true);
      setWon(true);
      const newStats = {
        ...stats,
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon + 1,
        currentStreak: stats.currentStreak + 1,
        maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
        guessDistribution: stats.guessDistribution.map((count, i) =>
          i === newGuesses.length - 1 ? count + 1 : count
        ),
      };
      setStats(newStats);
      saveStats(newStats);
      showMessage("Excellent!", 2000);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      const newStats = {
        ...stats,
        gamesPlayed: stats.gamesPlayed + 1,
        currentStreak: 0,
        guessDistribution: [...stats.guessDistribution],
      };
      setStats(newStats);
      saveStats(newStats);
      showMessage(solution, 3000);
    }
  }, [currentGuess, guesses, solution, stats, showMessage]);

  const addLetter = useCallback(
    (letter: string) => {
      if (gameOver) return;
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + letter.toUpperCase());
      }
    },
    [currentGuess, gameOver]
  );

  const removeLetter = useCallback(() => {
    if (gameOver) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameOver]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver) return;
      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE" || key === "DELETE") {
        removeLetter();
      } else if (/^[A-Z]$/.test(key.toUpperCase())) {
        addLetter(key);
      }
    },
    [gameOver, submitGuess, removeLetter, addLetter]
  );

  const getLetterStates = useCallback((): Map<string, LetterState> => {
    const states = new Map<string, LetterState>();

    guesses.forEach((guess) => {
      guess.split("").forEach((letter, i) => {
        if (solution[i] === letter) {
          states.set(letter, "correct");
        } else if (
          solution.includes(letter) &&
          states.get(letter) !== "correct"
        ) {
          states.set(letter, "present");
        } else if (!states.has(letter)) {
          states.set(letter, "absent");
        }
      });
    });

    return states;
  }, [guesses, solution]);

  const getTileState = useCallback(
    (guess: string, position: number): LetterState => {
      const letter = guess[position];
      if (!letter) return "empty";

      if (solution[position] === letter) return "correct";

      const solutionLetters = solution.split("");
      const guessLetters = guess.split("");

      // Count how many of this letter are in the solution
      const letterInSolution = solutionLetters.filter(
        (l) => l === letter
      ).length;

      // Count how many are already marked correct
      const correctCount = guessLetters.filter(
        (l, i) => l === letter && solutionLetters[i] === letter
      ).length;

      // Count how many present we've already assigned before this position
      let presentCount = 0;
      for (let i = 0; i < position; i++) {
        if (
          guessLetters[i] === letter &&
          solutionLetters[i] !== letter &&
          solutionLetters.includes(letter)
        ) {
          presentCount++;
        }
      }

      if (
        solutionLetters.includes(letter) &&
        correctCount + presentCount < letterInSolution
      ) {
        return "present";
      }

      return "absent";
    },
    [solution]
  );

  const getBoard = useCallback((): TileData[][] => {
    const board: TileData[][] = [];

    for (let i = 0; i < MAX_GUESSES; i++) {
      const row: TileData[] = [];
      if (i < guesses.length) {
        // Completed guess
        for (let j = 0; j < WORD_LENGTH; j++) {
          row.push({
            letter: guesses[i][j],
            state: getTileState(guesses[i], j),
          });
        }
      } else if (i === guesses.length) {
        // Current guess
        for (let j = 0; j < WORD_LENGTH; j++) {
          row.push({
            letter: currentGuess[j] || "",
            state: currentGuess[j] ? "tbd" : "empty",
          });
        }
      } else {
        // Empty row
        for (let j = 0; j < WORD_LENGTH; j++) {
          row.push({ letter: "", state: "empty" });
        }
      }
      board.push(row);
    }

    return board;
  }, [guesses, currentGuess, getTileState]);

  return {
    board: getBoard(),
    letterStates: getLetterStates(),
    handleKeyPress,
    gameOver,
    won,
    stats,
    shake,
    message,
    currentRow: guesses.length,
  };
}
