import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { GameProvider, useGame } from '../context/GameContext';
import ProfileWidget from '../components/FloorGame/ProfileWidget';
import NickModal from '../components/FloorGame/NickModal';
import LevelMenu from '../components/FloorGame/LevelMenu';
import GameBoard from '../components/FloorGame/GameBoard';
import LevelComplete from '../components/FloorGame/LevelComplete';
import BadgeModal from '../components/FloorGame/BadgeModal';
import ProfileModal from '../components/FloorGame/ProfileModal';
import Toast from '../components/Toast';
import '../styles/floorgame.css';

function GameContent() {
  const {
    player,
    currentRoom,
    gameState,
    timer,
    showNickModal,
    showProfileModal,
    lastBadge,
    setShowNickModal,
    setShowProfileModal,
    setLastBadge,
  } = useGame();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="floorgame-container">
      <Head>
        <title>Układanie Paneli Podłogowych - FestPanel Gra</title>
        <meta name="description" content="Naucz się układać panele podłogowe metodą 1/3. Gra edukacyjna dla profesjonalistów." />
      </Head>

      <header className="floorgame-header">
        <h1 className="floorgame-title">
          🏠 Układanie <span>Paneli Podłogowych</span>
        </h1>
        <div className="game-info-bar">
          {gameState === 'playing' && (
            <div className="game-stat">
              <span className="game-stat-icon">⏱️</span>
              <span className="game-stat-value">{formatTime(timer)}</span>
            </div>
          )}
          <div className="game-stat">
            <span className="game-stat-icon">⭐</span>
            <span className="game-stat-value">{player.totalPoints} pkt</span>
          </div>
          <div className="game-stat">
            <span className="game-stat-icon">🎯</span>
            <span className="game-stat-value">{player.completedLevels.length}/30</span>
          </div>
        </div>
      </header>

      <main className="floorgame-main">
        {!currentRoom ? (
          <LevelMenu />
        ) : (
          <GameBoard />
        )}
      </main>

      <ProfileWidget />

      {showNickModal && <NickModal />}
      {showProfileModal && <ProfileModal />}
      {gameState === 'completed' && <LevelComplete />}
      {lastBadge && <BadgeModal badge={lastBadge} onClose={() => setLastBadge(null)} />}

      <Toast />
    </div>
  );
}

export default function FloorgamePage() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}