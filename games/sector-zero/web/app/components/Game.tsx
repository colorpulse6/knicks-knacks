"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GameScreen,
  PowerUpType,
  type GameState,
  type Keys,
} from "./engine/types";
import { createGameState, updateGame, togglePause } from "./engine/gameEngine";
import { drawGame, drawStarMap, drawIntroCrawl, INTRO_TOTAL_FRAMES } from "./engine/renderer";
import { AudioEngine } from "./engine/audio";
import {
  loadSave,
  saveSave,
  updateLevelResult,
  calculateCreditsEarned,
  getPlayerName,
  updateSectorZeroProfile,
  type SaveData,
} from "./engine/save";
import { WORLD_NAMES, getWorldLevelCount } from "./engine/levels";
import { preloadAll } from "./engine/sprites";
import {
  type StarMapState,
  createStarMapState,
  updateStarMap,
  resetStarMapKeys,
} from "./engine/starMap";
import {
  type CockpitHubState,
  createCockpitState,
  updateCockpit,
  resetCockpitKeys,
  getCockpitTouchHotspot,
  COCKPIT_HOTSPOTS,
} from "./engine/cockpit";
import { checkQuestCompletion, type QuestCheckData } from "./engine/sideQuests";
import { drawCockpit } from "./engine/cockpitRenderer";
import {
  drawPreChoice, drawChoiceScreen, drawEnding, drawCredits,
  PRE_CHOICE_TOTAL_FRAMES, DESTROY_TOTAL_FRAMES, MERGE_TOTAL_FRAMES,
  getCreditsFrameCount,
  type EndingChoice,
} from "./engine/ending";
import DevPanel from "./DevPanel";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [showCockpit, setShowCockpit] = useState(false);
  const [cockpitState, setCockpitState] = useState<CockpitHubState>(createCockpitState());
  const [showMap, setShowMap] = useState(false);
  const [starMapState, setStarMapState] = useState<StarMapState>(createStarMapState());
  const [saveData, setSaveData] = useState<SaveData>(loadSave());
  const [endingPhase, setEndingPhase] = useState<"off" | "pre-choice" | "choice" | "ending" | "credits">("off");
  const [endingChoice, setEndingChoice] = useState<EndingChoice>(null);
  const [choiceHover, setChoiceHover] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playerName, setPlayerName] = useState("Guest");

  const keysRef = useRef<Keys>({
    left: false,
    right: false,
    up: false,
    down: false,
    shoot: false,
    bomb: false,
  });
  const touchPosRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<AudioEngine | null>(null);
  const introFrameRef = useRef(0);
  const endingFrameRef = useRef(0);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new AudioEngine();
    }
    audioRef.current.init();
    return audioRef.current;
  }, []);

  const finishIntro = useCallback(() => {
    setShowIntro(false);
    setShowCockpit(true);
    setGameState(null);
    resetCockpitKeys();
    introFrameRef.current = 0;
    // Mark intro as seen
    const updated = { ...saveData, introSeen: true };
    saveSave(updated);
    setSaveData(updated);
  }, [saveData]);

  const openMap = useCallback(() => {
    const audio = ensureAudio();
    audio.switchMusic("menu");
    setShowStartScreen(false);
    if (!saveData.introSeen) {
      introFrameRef.current = 0;
      setShowIntro(true);
    } else {
      setShowCockpit(true);
      setGameState(null);
      resetCockpitKeys();
    }
  }, [ensureAudio, saveData.introSeen]);

  const startLevel = useCallback(
    (world: number, level: number) => {
      const audio = ensureAudio();
      audio.switchMusic("game");
      setShowMap(false);
      setGameState(createGameState(world, level, saveData.upgrades));
    },
    [ensureAudio, saveData.upgrades]
  );

  const returnToCockpit = useCallback(() => {
    setGameState(null);
    setEndingPhase("off");
    setEndingChoice(null);
    setShowCockpit(true);
    setSaveData(loadSave());
    resetCockpitKeys();
    audioRef.current?.switchMusic("menu");
  }, []);

  const startEnding = useCallback(() => {
    setGameState(null);
    setEndingPhase("pre-choice");
    setEndingChoice(null);
    setChoiceHover(0);
    endingFrameRef.current = 0;
  }, []);

  const advanceEnding = useCallback(() => {
    if (endingPhase === "pre-choice") {
      setEndingPhase("choice");
      setChoiceHover(0);
    } else if (endingPhase === "ending") {
      setEndingPhase("credits");
      endingFrameRef.current = 0;
    } else if (endingPhase === "credits") {
      returnToCockpit();
    }
  }, [endingPhase, returnToCockpit]);

  const confirmChoice = useCallback((choice: EndingChoice) => {
    setEndingChoice(choice);
    setEndingPhase("ending");
    endingFrameRef.current = 0;
  }, []);

  const restartGame = useCallback(() => {
    const audio = ensureAudio();
    audio.switchMusic("game");
    if (gameState) {
      updateSectorZeroProfile(gameState.score);
    }
    setGameState(createGameState(gameState?.currentWorld ?? 1, gameState?.currentLevel ?? 1, saveData.upgrades));
  }, [gameState, ensureAudio, saveData.upgrades]);

  const nextLevel = useCallback(() => {
    if (!gameState) return;

    // Save level result
    const stars =
      gameState.deaths === 0 && gameState.kills / Math.max(1, gameState.totalEnemies) >= 0.8
        ? 3
        : gameState.deaths === 0
          ? 2
          : 1;
    let newSave = updateLevelResult(saveData, gameState.currentWorld, gameState.currentLevel, gameState.score, stars, gameState.xp);

    // Check side quest completion
    const questData: QuestCheckData = {
      world: gameState.currentWorld,
      level: gameState.currentLevel,
      kills: gameState.kills,
      totalEnemies: gameState.totalEnemies,
      deaths: gameState.deaths,
      frameCount: gameState.frameCount,
      playerHp: gameState.player.hp,
      playerMaxHp: gameState.player.maxHp,
    };
    const questResult = checkQuestCompletion(newSave, questData);
    newSave = questResult.newSave;

    saveSave(newSave);
    setSaveData(newSave);

    const maxLevels = getWorldLevelCount(gameState.currentWorld);
    const nextLv = gameState.currentLevel + 1;

    if (nextLv <= maxLevels) {
      // Next level in same world
      setGameState(createGameState(gameState.currentWorld, nextLv, saveData.upgrades));
    } else {
      // World complete — try advancing to next world
      let nextWorld = gameState.currentWorld + 1;
      // Skip worlds with no levels
      while (nextWorld <= 8 && getWorldLevelCount(nextWorld) === 0) {
        nextWorld++;
      }
      if (nextWorld <= 8 && getWorldLevelCount(nextWorld) > 0) {
        setGameState(createGameState(nextWorld, 1, saveData.upgrades));
      } else {
        // All worlds complete — play ending sequence
        startEnding();
      }
    }
  }, [gameState, saveData, returnToCockpit, startEnding]);

  const handleDevAction = useCallback(
    (action: string) => {
      if (action.startsWith("goto-level:")) {
        const [, w, l] = action.split(":");
        ensureAudio();
        setShowStartScreen(false);
        setShowMap(false);
        const newState = createGameState(Number(w), Number(l), saveData.upgrades);
        const wasInvincible = gameState?.devInvincible ?? false;
        setGameState({ ...newState, devInvincible: wasInvincible });
        return;
      }

      setGameState((prev) => {
        if (!prev) return null;
        switch (action) {
          case "toggle-invincible":
            return { ...prev, devInvincible: !prev.devInvincible };
          case "max-weapon":
            return { ...prev, player: { ...prev.player, weaponLevel: 5 } };
          case "add-life":
            return { ...prev, lives: prev.lives + 1 };
          case "full-hp":
            return { ...prev, player: { ...prev.player, hp: prev.player.maxHp } };
          case "skip-wave":
            return {
              ...prev,
              enemies: [],
              enemyBullets: [],
              currentWave: Math.min(prev.currentWave + 1, prev.totalWaves),
              waveDelay: 10,
            };
          case "kill-enemies":
            return { ...prev, enemies: [], enemyBullets: [] };
          case "skip-briefing":
            return prev.screen === GameScreen.BRIEFING
              ? { ...prev, briefingTimer: 0 }
              : prev;
          case "spawn-boss": {
            if (prev.boss) return prev;
            return {
              ...prev,
              screen: GameScreen.BOSS_INTRO,
              bossIntroTimer: 180,
              enemies: [],
              enemyBullets: [],
              currentWave: prev.totalWaves,
            };
          }
          case "spawn-powerup": {
            const types = Object.values(PowerUpType);
            const type = types[Math.floor(Math.random() * types.length)];
            const pu = {
              id: Date.now(),
              type,
              x: prev.player.x + prev.player.width / 2 - 12,
              y: prev.player.y - 60,
              width: 24,
              height: 24,
              vy: 1.5,
            };
            return { ...prev, powerUps: [...prev.powerUps, pu] };
          }
          default:
            return prev;
        }
      });
    },
    [gameState?.devInvincible, ensureAudio]
  );

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowLeft":
        case "a":
          keysRef.current.left = true;
          break;
        case "ArrowRight":
        case "d":
          keysRef.current.right = true;
          break;
        case "ArrowUp":
        case "w":
          keysRef.current.up = true;
          if (endingPhase === "choice") setChoiceHover(0);
          break;
        case "ArrowDown":
        case "s":
          keysRef.current.down = true;
          if (endingPhase === "choice") setChoiceHover(1);
          break;
        case " ":
          keysRef.current.shoot = true;
          break;
        case "b":
          keysRef.current.bomb = true;
          break;
        case "Enter":
          if (showStartScreen) {
            openMap();
          } else if (showIntro) {
            finishIntro();
          } else if (endingPhase === "pre-choice" || endingPhase === "ending" || endingPhase === "credits") {
            advanceEnding();
          } else if (endingPhase === "choice") {
            confirmChoice(choiceHover === 0 ? "destroy" : "merge");
          } else if (showCockpit) {
            keysRef.current.shoot = true;
          } else if (showMap) {
            keysRef.current.shoot = true;
          } else if (gameState?.screen === GameScreen.BRIEFING) {
            setGameState((prev) => prev ? { ...prev, briefingTimer: 0 } : null);
          } else if (gameState?.screen === GameScreen.GAME_OVER) {
            returnToCockpit();
          } else if (gameState?.screen === GameScreen.LEVEL_COMPLETE) {
            nextLevel();
          }
          break;
        case "Escape":
          if (showCockpit) {
            setShowCockpit(false);
            setShowStartScreen(true);
          } else if (showMap) {
            setShowMap(false);
            setShowCockpit(true);
            resetCockpitKeys();
          } else if (gameState?.screen === GameScreen.PAUSED) {
            returnToCockpit();
          } else if (gameState?.screen === GameScreen.GAME_OVER || gameState?.screen === GameScreen.LEVEL_COMPLETE) {
            returnToCockpit();
          } else if (gameState?.screen === GameScreen.PLAYING || gameState?.screen === GameScreen.BOSS_FIGHT) {
            setGameState((prev) => (prev ? togglePause(prev) : null));
          }
          break;
        case "p":
          if (gameState && gameState.screen === GameScreen.PLAYING) {
            setGameState((prev) => (prev ? togglePause(prev) : null));
          } else if (gameState?.screen === GameScreen.PAUSED) {
            setGameState((prev) => (prev ? togglePause(prev) : null));
          }
          break;
        case "m":
          if (audioRef.current) {
            const nowMuted = audioRef.current.toggleMute();
            setMuted(nowMuted);
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
          keysRef.current.left = false;
          break;
        case "ArrowRight":
        case "d":
          keysRef.current.right = false;
          break;
        case "ArrowUp":
        case "w":
          keysRef.current.up = false;
          break;
        case "ArrowDown":
        case "s":
          keysRef.current.down = false;
          break;
        case " ":
          keysRef.current.shoot = false;
          break;
        case "b":
          keysRef.current.bomb = false;
          break;
        case "Enter":
          keysRef.current.shoot = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showStartScreen, showIntro, endingPhase, choiceHover, showCockpit, showMap, gameState, openMap, finishIntro, advanceEnding, confirmChoice, restartGame, nextLevel, returnToCockpit]);

  // Touch input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchPosRef.current = getCanvasPos(touch.clientX, touch.clientY);
      if (!showCockpit) {
        keysRef.current.shoot = true;
        // Two-finger tap activates bomb
        if (e.touches.length >= 2) {
          keysRef.current.bomb = true;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchPosRef.current = getCanvasPos(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchPosRef.current = null;
      keysRef.current.shoot = false;
      keysRef.current.bomb = false;

      if (showStartScreen) {
        openMap();
      } else if (showIntro) {
        finishIntro();
      } else if (endingPhase === "choice") {
        // Detect which choice was tapped
        const touch = e.changedTouches[0];
        if (touch) {
          const pos = getCanvasPos(touch.clientX, touch.clientY);
          if (pos.y >= 320 && pos.y < 420) {
            confirmChoice("destroy");
          } else if (pos.y >= 460 && pos.y < 560) {
            confirmChoice("merge");
          }
        }
      } else if (endingPhase === "pre-choice" || endingPhase === "ending" || endingPhase === "credits") {
        advanceEnding();
      } else if (showCockpit) {
        const touch = e.changedTouches[0];
        if (touch) {
          const pos = getCanvasPos(touch.clientX, touch.clientY);
          if (cockpitState.screen === "hub") {
            const hotspotIndex = getCockpitTouchHotspot(pos.x, pos.y);
            if (hotspotIndex >= 0) {
              const hotspot = COCKPIT_HOTSPOTS[hotspotIndex];
              if (hotspot.id === "starmap") {
                setShowCockpit(false);
                setShowMap(true);
                resetStarMapKeys();
              } else {
                setCockpitState(prev => ({ ...prev, screen: hotspot.id, selectedHotspot: hotspotIndex }));
              }
            }
          } else {
            // In sub-screen, tap to go back to hub
            setCockpitState(prev => ({ ...prev, screen: "hub" }));
          }
        }
      } else if (gameState?.screen === GameScreen.BRIEFING) {
        setGameState((prev) => prev ? { ...prev, briefingTimer: 0 } : null);
      } else if (gameState?.screen === GameScreen.GAME_OVER) {
        returnToCockpit();
      } else if (gameState?.screen === GameScreen.LEVEL_COMPLETE) {
        nextLevel();
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [showStartScreen, showIntro, endingPhase, showCockpit, cockpitState.screen, showMap, gameState, openMap, finishIntro, advanceEnding, confirmChoice, restartGame, nextLevel, returnToCockpit]);

  // Intro crawl loop
  useEffect(() => {
    if (!showIntro) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const introLoop = () => {
      introFrameRef.current += 1;
      drawIntroCrawl(ctx, introFrameRef.current);

      if (introFrameRef.current >= INTRO_TOTAL_FRAMES) {
        finishIntro();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(introLoop);
    };

    animationFrameRef.current = requestAnimationFrame(introLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showIntro, finishIntro]);

  // Ending sequence loop (pre-choice, choice, ending, credits)
  useEffect(() => {
    if (endingPhase === "off") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const endingLoop = () => {
      endingFrameRef.current += 1;
      const frame = endingFrameRef.current;

      if (endingPhase === "pre-choice") {
        drawPreChoice(ctx, frame);
        if (frame >= PRE_CHOICE_TOTAL_FRAMES) {
          setEndingPhase("choice");
          setChoiceHover(0);
          return;
        }
      } else if (endingPhase === "choice") {
        drawChoiceScreen(ctx, frame, choiceHover);
      } else if (endingPhase === "ending") {
        drawEnding(ctx, frame, endingChoice);
        const totalFrames = endingChoice === "destroy" ? DESTROY_TOTAL_FRAMES : MERGE_TOTAL_FRAMES;
        if (frame >= totalFrames) {
          setEndingPhase("credits");
          endingFrameRef.current = 0;
          return;
        }
      } else if (endingPhase === "credits") {
        drawCredits(ctx, frame, endingChoice);
        if (frame >= getCreditsFrameCount(endingChoice)) {
          returnToCockpit();
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(endingLoop);
    };

    animationFrameRef.current = requestAnimationFrame(endingLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [endingPhase, endingChoice, choiceHover, advanceEnding, returnToCockpit]);

  // Star map loop
  useEffect(() => {
    if (!showMap) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mapLoop = () => {
      const { newState, action } = updateStarMap(starMapState, keysRef.current, saveData);
      setStarMapState(newState);

      if (action.type === "select-level" && action.world && action.level) {
        startLevel(action.world, action.level);
        return;
      }
      if (action.type === "back") {
        setShowMap(false);
        setShowCockpit(true);
        resetCockpitKeys();
        return;
      }

      drawStarMap(ctx, newState, saveData);
      animationFrameRef.current = requestAnimationFrame(mapLoop);
    };

    animationFrameRef.current = requestAnimationFrame(mapLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showMap, starMapState, saveData, startLevel]);

  // Cockpit hub loop
  useEffect(() => {
    if (!showCockpit) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cockpitLoop = () => {
      const { newState, action } = updateCockpit(cockpitState, keysRef.current, saveData);
      setCockpitState(newState);

      // Play cockpit audio events
      for (const event of newState.audioEvents) {
        audioRef.current?.play(event);
      }

      if (action.type === "open-starmap") {
        setShowCockpit(false);
        setShowMap(true);
        resetStarMapKeys();
        return;
      }

      if (action.type === "save-updated" && action.save) {
        saveSave(action.save);
        setSaveData(action.save);
      }

      drawCockpit(ctx, newState, action.type === "save-updated" && action.save ? action.save : saveData);
      animationFrameRef.current = requestAnimationFrame(cockpitLoop);
    };

    animationFrameRef.current = requestAnimationFrame(cockpitLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showCockpit, cockpitState, saveData]);

  // Game loop
  useEffect(() => {
    if (!gameState || showStartScreen || showCockpit || showMap) return;
    const activeScreens = [GameScreen.PLAYING, GameScreen.BOSS_FIGHT, GameScreen.BOSS_INTRO, GameScreen.BRIEFING];
    if (!activeScreens.includes(gameState.screen)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = () => {
      const newState = updateGame(
        gameState,
        keysRef.current,
        touchPosRef.current?.x ?? null,
        touchPosRef.current?.y ?? null
      );

      // Play audio events
      for (const event of newState.audioEvents) {
        audioRef.current?.play(event);
      }

      // Save on level auto-advance (non-boss levels)
      if (gameState.levelCompleteTimer > 0 && newState.levelCompleteTimer <= 0 && newState.currentLevel !== gameState.currentLevel) {
        const stars =
          gameState.deaths === 0 && gameState.kills / Math.max(1, gameState.totalEnemies) >= 0.8
            ? 3
            : gameState.deaths === 0
              ? 2
              : 1;
        let advSave = updateLevelResult(saveData, gameState.currentWorld, gameState.currentLevel, gameState.score, stars, gameState.xp);
        const advQuestData: QuestCheckData = {
          world: gameState.currentWorld,
          level: gameState.currentLevel,
          kills: gameState.kills,
          totalEnemies: gameState.totalEnemies,
          deaths: gameState.deaths,
          frameCount: gameState.frameCount,
          playerHp: gameState.player.hp,
          playerMaxHp: gameState.player.maxHp,
        };
        advSave = checkQuestCompletion(advSave, advQuestData).newSave;
        saveSave(advSave);
        setSaveData(advSave);
      }

      setGameState(newState);
      drawGame(ctx, newState);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, showStartScreen, showCockpit, showMap, saveData]);

  // Auto-trigger ending when game engine sets ENDING screen (final boss defeated)
  useEffect(() => {
    if (gameState?.screen === GameScreen.ENDING && endingPhase === "off") {
      // Save the final level result before transitioning
      const stars =
        gameState.deaths === 0 && gameState.kills / Math.max(1, gameState.totalEnemies) >= 0.8
          ? 3
          : gameState.deaths === 0
            ? 2
            : 1;
      let finalSave = updateLevelResult(saveData, gameState.currentWorld, gameState.currentLevel, gameState.score, stars, gameState.xp);
      const questData: QuestCheckData = {
        world: gameState.currentWorld,
        level: gameState.currentLevel,
        kills: gameState.kills,
        totalEnemies: gameState.totalEnemies,
        deaths: gameState.deaths,
        frameCount: gameState.frameCount,
        playerHp: gameState.player.hp,
        playerMaxHp: gameState.player.maxHp,
      };
      finalSave = checkQuestCompletion(finalSave, questData).newSave;
      saveSave(finalSave);
      setSaveData(finalSave);
      startEnding();
    }
  }, [gameState?.screen, endingPhase, gameState, saveData, startEnding]);

  // Draw non-playing screens
  useEffect(() => {
    if (!gameState || showStartScreen || showCockpit || showMap) return;
    const loopScreens = [GameScreen.PLAYING, GameScreen.BOSS_FIGHT, GameScreen.BOSS_INTRO, GameScreen.BRIEFING];
    if (loopScreens.includes(gameState.screen)) return;
    // ENDING screen is handled by the ending sequence, not drawGame
    if (gameState.screen === GameScreen.ENDING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawGame(ctx, gameState);
  }, [gameState, showStartScreen, showCockpit, showMap]);

  // Save on game over
  useEffect(() => {
    if (gameState?.screen === GameScreen.GAME_OVER) {
      updateSectorZeroProfile(gameState.score);
    }
  }, [gameState?.screen, gameState?.score]);

  // Load player name and preload sprites
  useEffect(() => {
    setPlayerName(getPlayerName());
    setSaveData(loadSave());
    preloadAll();
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-white/10"
        style={{
          maxHeight: "100vh",
          maxWidth: "100vw",
          objectFit: "contain",
        }}
      />

      {/* Start Screen */}
      {showStartScreen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white">
          <h1
            className="text-5xl font-bold mb-2 tracking-[0.3em]"
            style={{
              background: "linear-gradient(135deg, #44ccff, #aa44ff, #ff4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SECTOR ZERO
          </h1>
          <p className="text-gray-600 text-sm mb-1 tracking-wider">
            THE LAST PILOT OF SECTOR ZERO
          </p>
          <p className="text-gray-700 text-xs mb-8">{playerName}</p>

          <div className="text-center mb-8 text-gray-400 text-sm space-y-1">
            <p>Arrow Keys / WASD to move</p>
            <p>SPACE to shoot</p>
            <p>P to pause &middot; M to mute</p>
          </div>

          <button
            onClick={openMap}
            className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 text-lg hover:bg-cyan-400 hover:text-black transition-colors tracking-wider"
          >
            START MISSION
          </button>
        </div>
      )}

      {/* Paused Overlay */}
      {gameState?.screen === GameScreen.PAUSED && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4 tracking-wider">PAUSED</h2>
            <p className="text-gray-500 text-sm mb-6">
              {WORLD_NAMES[gameState.currentWorld - 1]} &mdash; Level {gameState.currentLevel}
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => setGameState((prev) => (prev ? togglePause(prev) : null))}
                className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 text-lg hover:bg-cyan-400 hover:text-black transition-colors tracking-wider w-56"
              >
                RESUME
              </button>
              <button
                onClick={returnToCockpit}
                className="px-8 py-3 border-2 border-gray-600 text-gray-400 text-lg hover:bg-gray-600 hover:text-white transition-colors tracking-wider w-56"
              >
                RETURN TO HUB
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-4">ESC to return to hub</p>
          </div>
        </div>
      )}

      {/* Level Complete Overlay (boss levels only) */}
      {gameState?.screen === GameScreen.LEVEL_COMPLETE && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <h2
            className="text-4xl font-bold mb-4 tracking-wider"
            style={{
              background: "linear-gradient(135deg, #FFD700, #FF6600)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LEVEL COMPLETE
          </h2>
          <div className="text-center mb-6 space-y-2">
            <p className="text-2xl">
              Score: <span className="text-yellow-400 font-bold">{gameState.score}</span>
            </p>
            <p className="text-gray-400">
              Kills: {gameState.kills}/{gameState.totalEnemies} &middot; Deaths: {gameState.deaths}
            </p>
            {gameState.maxCombo >= 3 && (
              <p className="text-yellow-500">Max Combo: {gameState.maxCombo}x</p>
            )}
            <div className="flex justify-center gap-2 mt-2">
              {[1, 2, 3].map((star) => {
                const earned =
                  star === 1 ? true :
                  star === 2 ? gameState.deaths === 0 :
                  gameState.deaths === 0 && gameState.kills / Math.max(1, gameState.totalEnemies) >= 0.8;
                return (
                  <span
                    key={star}
                    className={`text-3xl ${earned ? "text-yellow-400" : "text-gray-700"}`}
                  >
                    &#9733;
                  </span>
                );
              })}
            </div>
            <p className="text-lg mt-3" style={{ color: "#44ff88" }}>
              +{calculateCreditsEarned(
                gameState.score,
                gameState.deaths === 0 && gameState.kills / Math.max(1, gameState.totalEnemies) >= 0.8 ? 3 :
                  gameState.deaths === 0 ? 2 : 1,
                gameState.currentWorld
              )} CREDITS
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={nextLevel}
              className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 text-lg hover:bg-cyan-400 hover:text-black transition-colors tracking-wider"
            >
              NEXT LEVEL
            </button>
            <button
              onClick={returnToCockpit}
              className="px-6 py-4 border-2 border-gray-600 text-gray-400 text-lg hover:bg-gray-600 hover:text-white transition-colors tracking-wider"
            >
              HUB
            </button>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState?.screen === GameScreen.GAME_OVER && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white">
          <h2 className="text-5xl font-bold mb-4 text-red-500 tracking-wider">GAME OVER</h2>
          <div className="text-center mb-8 space-y-2">
            <p className="text-2xl">
              Score: <span className="text-yellow-400 font-bold">{gameState.score}</span>
            </p>
            <p className="text-gray-400">
              {WORLD_NAMES[gameState.currentWorld - 1]} &mdash; Level {gameState.currentLevel}
            </p>
            <p className="text-gray-500 text-sm">
              Kills: {gameState.kills} &middot; Max Combo: {gameState.maxCombo}x
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={restartGame}
              className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 text-lg hover:bg-cyan-400 hover:text-black transition-colors tracking-wider"
            >
              TRY AGAIN
            </button>
            <button
              onClick={returnToCockpit}
              className="px-6 py-4 border-2 border-gray-600 text-gray-400 text-lg hover:bg-gray-600 hover:text-white transition-colors tracking-wider"
            >
              HUB
            </button>
          </div>
        </div>
      )}

      {/* Mute button */}
      {(gameState || showCockpit || showMap || endingPhase !== "off") && !showStartScreen && (
        <button
          onClick={() => {
            if (audioRef.current) {
              const nowMuted = audioRef.current.toggleMute();
              setMuted(nowMuted);
            }
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors text-sm z-10"
          title="Toggle sound (M)"
        >
          {muted ? "MUTE" : "SND"}
        </button>
      )}

      {/* Dev Panel — development only */}
      {process.env.NODE_ENV === "development" && (
        <DevPanel gameState={gameState} onAction={handleDevAction} />
      )}
    </div>
  );
}
