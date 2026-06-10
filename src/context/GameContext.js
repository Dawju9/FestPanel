import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const GameContext = createContext(null);

const INITIAL_PLAYER = {
  playerId: null,
  nickname: '',
  createdAt: null,
  totalPoints: 0,
  completedLevels: [],
  badges: [],
  levelStats: {},
  currentStreak: 0,
  longestStreak: 0,
};

const LEVELS = {
  1: {
    id: 1,
    name: 'Łatwy',
    rooms: [
      { id: '1-1', name: 'Mały pokój', width: 3, length: 4, obstacles: [], window: 'top' },
      { id: '1-2', name: 'Korytarz', width: 2, length: 5, obstacles: [], window: 'top' },
      { id: '1-3', name: 'Pokój gościnny', width: 3.5, length: 4, obstacles: [], window: 'left' },
      { id: '1-4', name: 'Balkon', width: 2.5, length: 3, obstacles: [], window: 'top' },
    ],
  },
  2: {
    id: 2,
    name: 'Średni',
    rooms: [
      { id: '2-1', name: 'Salon', width: 4, length: 5, obstacles: [{ x: 1, y: 1, w: 1, h: 1 }], window: 'top' },
      { id: '2-2', name: 'Sypialnia', width: 3.5, length: 4.5, obstacles: [], window: 'left' },
      { id: '2-3', name: 'Kuchnia', width: 3, length: 4, obstacles: [{ x: 0, y: 0, w: 1.5, h: 0.8 }], window: 'top' },
    ],
  },
  3: {
    id: 3,
    name: 'Trudny',
    rooms: [
      { id: '3-1', name: 'Duży salon', width: 5, length: 6, obstacles: [{ x: 2, y: 2, w: 1, h: 1 }, { x: 0, y: 3, w: 0.5, h: 1.5 }], window: 'top' },
      { id: '3-2', name: 'Salon z aneksem', width: 4.5, length: 5.5, obstacles: [{ x: 2, y: 0, w: 2, h: 2 }], window: 'left' },
      { id: '3-3', name: 'Przedpokój', width: 2, length: 6, obstacles: [], window: 'top' },
    ],
  },
};

const BADGES = [
  { id: 'first_room', name: 'Pierwsze kroki', condition: (stats) => stats.completedLevels.length >= 1, icon: '🏠' },
  { id: 'master_13', name: 'Mistrz 1/3', condition: (stats) => stats.bonuses13Count >= 10, icon: '📐' },
  { id: 'speed_demon', name: 'Szybki Montaż', condition: (stats) => stats.fastCompletions >= 1, icon: '⚡' },
  { id: 'saver', name: 'Oszczędny', condition: (stats) => stats.highMaterialEfficiency >= 1, icon: '🎯' },
  { id: 'streak_5', name: 'Seria', condition: (stats) => stats.longestStreak >= 5, icon: '🔥' },
  { id: 'professional', name: 'Zawodowiec', condition: (stats) => stats.completedLevels.filter(l => l.startsWith('1-')).length >= 4, icon: '⭐' },
  { id: 'expert', name: 'Ekspert', condition: (stats) => stats.completedLevels.filter(l => l.startsWith('2-')).length >= 3, icon: '🌟' },
  { id: 'master_panel', name: 'Mistrz Paneli', condition: (stats) => stats.completedLevels.length >= 30, icon: '👑' },
  { id: 'grand_master', name: 'Wielki Mistrz', condition: (stats) => stats.badges.length >= 8, icon: '🏆' },
];

const PANEL_WIDTH = 0.2;
const PANEL_LENGTH = 1.2;

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${JSON.stringify(value)};expires=${expires};path=/;SameSite=Lax`;
}

export function GameProvider({ children }) {
  const [player, setPlayer] = useState(INITIAL_PLAYER);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [placedPanels, setPlacedPanels] = useState([]);
  const [gameState, setGameState] = useState('idle');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showNickModal, setShowNickModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [lastBadge, setLastBadge] = useState(null);
  const [bonuses13Count, setBonuses13Count] = useState(0);
  const [fastCompletions, setFastCompletions] = useState(0);
  const [highMaterialEfficiency, setHighMaterialEfficiency] = useState(0);

  useEffect(() => {
    const saved = getCookie('floorgame_player');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlayer(parsed);
        if (!parsed.nickname) {
          setShowNickModal(true);
        }
      } catch (e) {
        setShowNickModal(true);
      }
    } else {
      setShowNickModal(true);
    }
  }, []);

  useEffect(() => {
    if (player.playerId) {
      setCookie('floorgame_player', player);
    }
  }, [player]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const savePlayer = useCallback((updates) => {
    setPlayer(prev => {
      const newStats = { ...prev, ...updates };
      const badgeStats = {
        completedLevels: newStats.completedLevels,
        badges: newStats.badges,
        longestStreak: newStats.longestStreak,
        bonuses13Count: bonuses13Count,
        fastCompletions: fastCompletions,
        highMaterialEfficiency: highMaterialEfficiency,
      };
      const newBadges = BADGES.filter(b => !newStats.badges.includes(b.id) && b.condition(badgeStats));
      if (newBadges.length > 0) {
        newStats.badges = [...newStats.badges, ...newBadges.map(b => b.id)];
        setLastBadge(newBadges[0]);
      }
      return newStats;
    });
  }, [bonuses13Count, fastCompletions, highMaterialEfficiency]);

  const setNickname = useCallback((nickname) => {
    const newPlayer = {
      ...player,
      playerId: player.playerId || uuidv4(),
      nickname: nickname.trim(),
      createdAt: player.createdAt || Date.now(),
    };
    setPlayer(newPlayer);
    setShowNickModal(false);
  }, [player]);

  const startLevel = useCallback((levelId, roomId) => {
    const level = LEVELS[levelId];
    if (!level) return;
    const room = level.rooms.find(r => r.id === roomId);
    if (!room) return;
    setCurrentLevel(levelId);
    setCurrentRoom(room);
    setPlacedPanels([]);
    setTimer(0);
    setIsTimerRunning(true);
    setGameState('playing');
  }, []);

  const placePanel = useCallback((panel) => {
    setPlacedPanels(prev => [...prev, { ...panel, id: Date.now() }]);
  }, []);

  const removePanel = useCallback((panelId) => {
    setPlacedPanels(prev => prev.filter(p => p.id !== panelId));
  }, []);

  const validatePlacement = useCallback((newPanel, allPanels) => {
    const issues = [];
    if (newPanel.row === 0) {
      issues.push('valid_start');
    }
    const prevPanels = allPanels.filter(p => p.row === newPanel.row - 1);
    if (prevPanels.length > 0) {
      const expectedOffset = (newPanel.row % 3) * (PANEL_LENGTH / 3);
      const actualOffset = newPanel.col * PANEL_WIDTH - (prevPanels[0]?.col * PANEL_WIDTH || 0);
      const offsetDiff = Math.abs(actualOffset - expectedOffset);
      if (offsetDiff > 0.1) {
        issues.push('wrong_offset');
      } else {
        issues.push('valid_13');
      }
    }
    return issues;
  }, []);

  const calculateScore = useCallback(() => {
    if (!currentRoom) return { points: 0, stars: 0, materials: 0 };
    const roomArea = currentRoom.width * currentRoom.length;
    const panelArea = PANEL_WIDTH * PANEL_LENGTH;
    const usedArea = placedPanels.length * panelArea;
    const materials = Math.min(100, Math.round((usedArea / roomArea) * 100));
    let points = currentLevel * 100;
    const hasValid13 = placedPanels.some(p => p.isValid13);
    const hasValidZakladki = placedPanels.every(p => p.hasZakladki);
    if (hasValid13) {
      points += 50;
      setBonuses13Count(c => c + 1);
    }
    if (hasValidZakladki) points += 30;
    if (timer < 30) {
      points += 20;
      setFastCompletions(c => c + 1);
    }
    if (materials > 95) {
      points += 40;
      setHighMaterialEfficiency(c => c + 1);
    }
    const stars = (hasValid13 && timer < 45 && materials > 95) ? 3 : (hasValid13 || timer < 60) ? 2 : 1;
    return { points, stars, materials };
  }, [currentRoom, currentLevel, placedPanels, timer]);

  const completeLevel = useCallback(() => {
    setIsTimerRunning(false);
    const result = calculateScore();
    const levelKey = `${currentLevel}-${currentRoom.id}`;
    savePlayer({
      totalPoints: player.totalPoints + result.points,
      completedLevels: [...new Set([...player.completedLevels, levelKey])],
      levelStats: {
        ...player.levelStats,
        [levelKey]: {
          points: result.points,
          time: timer,
          materials: result.materials,
          stars: result.stars,
          date: Date.now(),
        },
      },
      currentStreak: result.stars >= 2 ? player.currentStreak + 1 : 0,
      longestStreak: Math.max(player.longestStreak, result.stars >= 2 ? player.currentStreak + 1 : 0),
    });
    setGameState('completed');
    return result;
  }, [calculateScore, currentLevel, currentRoom, timer, player, savePlayer]);

  const resetLevel = useCallback(() => {
    setPlacedPanels([]);
    setTimer(0);
    setIsTimerRunning(true);
    setGameState('playing');
  }, []);

  const getBadgeById = useCallback((id) => {
    return BADGES.find(b => b.id === id);
  }, []);

  const value = {
    player,
    levels: LEVELS,
    currentLevel,
    currentRoom,
    placedPanels,
    gameState,
    timer,
    isTimerRunning,
    showNickModal,
    showProfileModal,
    lastBadge,
    setNickname,
    startLevel,
    placePanel,
    removePanel,
    validatePlacement,
    completeLevel,
    resetLevel,
    setShowNickModal,
    setShowProfileModal,
    setLastBadge,
    getBadgeById,
    calculateScore,
    savePlayer,
    PANEL_WIDTH,
    PANEL_LENGTH,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameContext;