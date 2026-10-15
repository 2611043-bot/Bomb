import React, { useState, useEffect, useRef } from 'react';
import { BombState, Difficulty, PlayerRole, RoomState, SocketMessage } from './types/game';
import { generateBomb } from './utils/generator';
import { DefuserView } from './components/DefuserView';
import { ManualView } from './components/ManualView';
import { LobbyView } from './components/LobbyView';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { soundManager } from './utils/audio';
import {
  Bomb,
  BookOpen,
  Volume2,
  VolumeX,
  Split,
  RotateCcw,
  Home,
  Users,
  Radio
} from 'lucide-react';

export const App: React.FC = () => {
  // Query parameters check (?room=XYZ&role=manual)
  const urlParams = new URLSearchParams(window.location.search);
  const paramRoom = urlParams.get('room') || '';
  const paramRole = (urlParams.get('role') as PlayerRole) || 'defuser';

  const [inGame, setInGame] = useState(false);
  const [playMode, setPlayMode] = useState<'solo' | 'multi'>('solo');
  const [activeView, setActiveView] = useState<'defuser' | 'manual' | 'split'>('defuser');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [roomId, setRoomId] = useState<string>(paramRoom);
  const [myRole, setMyRole] = useState<PlayerRole>(paramRole);

  const [bomb, setBomb] = useState<BombState | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [muted, setMuted] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Setup BroadcastChannel for fallback tab-to-tab sync
  useEffect(() => {
    try {
      const bc = new BroadcastChannel('bomb-defusal-room');
      broadcastRef.current = bc;
      bc.onmessage = (event) => {
        const msg = event.data as SocketMessage;
        handleIncomingMessage(msg);
      };
      return () => bc.close();
    } catch (e) {
      // BroadcastChannel not supported
    }
  }, [roomId, myRole]);

  // Connect to WebSocket if in multiplayer mode
  const connectWebSocket = (rId: string, role: PlayerRole) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        const joinMsg: SocketMessage = {
          type: 'JOIN',
          roomId: rId,
          role,
          name: role === 'defuser' ? '解除班' : '分析班'
        };
        ws.send(JSON.stringify(joinMsg));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as SocketMessage;
          handleIncomingMessage(msg);
        } catch (err) {
          console.error(err);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket connection error, using local fallback:', err);
      };
    } catch (err) {
      console.warn('Could not connect to WebSocket, using BroadcastChannel fallback');
    }
  };

  const handleIncomingMessage = (msg: SocketMessage) => {
    if (msg.type === 'STATE_UPDATE') {
      if (msg.room && msg.room.bomb) {
        setBomb(msg.room.bomb);
        if (msg.room.bomb.status === 'exploded') {
          soundManager.playExplosion();
          setGameOverReason('起爆しました');
        } else if (msg.room.bomb.status === 'defused') {
          soundManager.playSuccess();
        }
      }
    }
  };

  const broadcastMessage = (msg: SocketMessage) => {
    // Send over WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
    // Also send over BroadcastChannel
    if (broadcastRef.current) {
      broadcastRef.current.postMessage(msg);
    }
  };

  // Timer Tick Loop
  useEffect(() => {
    if (!bomb || bomb.status !== 'running') {
      clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setBomb((prev) => {
        if (!prev || prev.status !== 'running') return prev;

        const nextTime = Math.max(0, prev.remainingTime - 1);
        const isUrgent = nextTime <= 60;
        soundManager.playTick(isUrgent);

        if (nextTime <= 0) {
          soundManager.playExplosion();
          setGameOverReason('制限時間超過：タイムアップ');
          const explodedBomb: BombState = { ...prev, remainingTime: 0, status: 'exploded' };
          if (playMode === 'multi') {
            broadcastMessage({
              type: 'STATE_UPDATE',
              room: {
                roomId,
                bomb: explodedBomb,
                players: [],
                difficulty,
                chatMessages: []
              }
            });
          }
          return explodedBomb;
        }

        return { ...prev, remainingTime: nextTime };
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [bomb?.status, playMode, roomId, difficulty]);

  // Start Solo Game
  const handleStartSolo = (diff: Difficulty) => {
    setDifficulty(diff);
    setPlayMode('solo');
    setMyRole('solo');
    setActiveView('defuser');
    const newBomb = generateBomb(diff);
    newBomb.status = 'running';
    newBomb.startedAt = Date.now();
    setBomb(newBomb);
    setInGame(true);
  };

  // Start Multiplayer Game
  const handleJoinRoom = (rId: string, role: PlayerRole, diff: Difficulty) => {
    setDifficulty(diff);
    setPlayMode('multi');
    setRoomId(rId);
    setMyRole(role);
    setActiveView(role === 'manual' ? 'manual' : 'defuser');

    connectWebSocket(rId, role);

    const newBomb = generateBomb(diff);
    newBomb.status = 'running';
    newBomb.startedAt = Date.now();
    setBomb(newBomb);
    setInGame(true);

    // Broadcast new room state
    broadcastMessage({
      type: 'STATE_UPDATE',
      room: {
        roomId: rId,
        bomb: newBomb,
        players: [],
        difficulty: diff,
        chatMessages: []
      }
    });
  };

  // Handle Strike
  const handleStrike = () => {
    if (!bomb || bomb.status !== 'running') return;
    const nextStrikes = bomb.strikes + 1;
    soundManager.playStrike();

    if (nextStrikes >= bomb.maxStrikes) {
      soundManager.playExplosion();
      setGameOverReason('許容ミス数（ストライクリミット）到達');
      const explodedBomb: BombState = {
        ...bomb,
        strikes: nextStrikes,
        status: 'exploded'
      };
      setBomb(explodedBomb);
      if (playMode === 'multi') {
        broadcastMessage({
          type: 'STATE_UPDATE',
          room: { roomId, bomb: explodedBomb, players: [], difficulty, chatMessages: [] }
        });
      }
    } else {
      const updatedBomb: BombState = { ...bomb, strikes: nextStrikes };
      setBomb(updatedBomb);
      if (playMode === 'multi') {
        broadcastMessage({
          type: 'STATE_UPDATE',
          room: { roomId, bomb: updatedBomb, players: [], difficulty, chatMessages: [] }
        });
      }
    }
  };

  // Handle Defuse (Victory)
  const handleDefuse = () => {
    if (!bomb || bomb.status !== 'running') return;
    soundManager.playSuccess();
    const defusedBomb: BombState = { ...bomb, status: 'defused' };
    setBomb(defusedBomb);
    if (playMode === 'multi') {
      broadcastMessage({
        type: 'STATE_UPDATE',
        room: { roomId, bomb: defusedBomb, players: [], difficulty, chatMessages: [] }
      });
    }
  };

  // Update bomb from interactions
  const handleUpdateBomb = (updatedBomb: BombState) => {
    setBomb(updatedBomb);
    if (playMode === 'multi') {
      broadcastMessage({
        type: 'STATE_UPDATE',
        room: { roomId, bomb: updatedBomb, players: [], difficulty, chatMessages: [] }
      });
    }
  };

  const handleRestart = () => {
    const newBomb = generateBomb(difficulty);
    newBomb.status = 'running';
    newBomb.startedAt = Date.now();
    setBomb(newBomb);
    if (playMode === 'multi') {
      broadcastMessage({
        type: 'STATE_UPDATE',
        room: { roomId, bomb: newBomb, players: [], difficulty, chatMessages: [] }
      });
    }
  };

  const handleReturnToLobby = () => {
    setInGame(false);
    setBomb(null);
    clearInterval(timerIntervalRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundManager.setMuted(next);
  };

  // Format elapsed clear time
  const getClearTimeStr = () => {
    if (!bomb) return '00:00';
    const elapsed = bomb.totalTime - bomb.remainingTime;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}分${secs}秒`;
  };

  return (
    <div className="min-h-screen bg-[#0e1017] text-gray-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-[#151722] border-b border-[#282d3d] px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div
            onClick={handleReturnToLobby}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Bomb size={18} />
            </div>
            <div>
              <span className="font-mono font-black text-sm tracking-wider text-white block">
                BOMB DEFUSAL PROTOCOL
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {playMode === 'solo' ? '1人練習モード' : `ルーム: ${roomId} (${myRole === 'defuser' ? '解除班' : '分析班'})`}
              </span>
            </div>
          </div>
        </div>

        {/* View Switchers (available in solo mode or split mode) */}
        {inGame && (
          <div className="flex items-center gap-1.5 bg-[#1f2331] p-1 rounded-lg border border-[#343b50]">
            <button
              onClick={() => setActiveView('defuser')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'defuser'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Bomb size={14} />
              <span>爆弾 (解除班)</span>
            </button>

            <button
              onClick={() => setActiveView('manual')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'manual'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen size={14} />
              <span>指示書 (マニュアル)</span>
            </button>

            <button
              onClick={() => setActiveView('split')}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold hidden md:flex items-center gap-1.5 transition-all ${
                activeView === 'split'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="左右同時表示"
            >
              <Split size={14} />
              <span>同時表示</span>
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {inGame && (
            <button
              onClick={handleRestart}
              className="p-2 rounded-lg bg-[#242938] hover:bg-[#2f3549] border border-[#373e54] text-gray-300"
              title="最初からやり直す"
            >
              <RotateCcw size={16} />
            </button>
          )}

          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-[#242938] hover:bg-[#2f3549] border border-[#373e54] text-gray-300"
            title={muted ? '音声ON' : 'ミュート'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {inGame && (
            <button
              onClick={handleReturnToLobby}
              className="p-2 rounded-lg bg-[#242938] hover:bg-[#2f3549] border border-[#373e54] text-gray-300"
              title="ロビーに戻る"
            >
              <Home size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 p-4 md:p-6 flex flex-col justify-center">
        {!inGame ? (
          <LobbyView
            onStartSolo={handleStartSolo}
            onJoinRoom={handleJoinRoom}
            initialRoomId={paramRoom}
            initialRole={paramRole}
          />
        ) : (
          <div className="w-full">
            {activeView === 'defuser' && bomb && (
              <DefuserView
                bomb={bomb}
                onUpdateBomb={handleUpdateBomb}
                onStrike={handleStrike}
                onExplode={() => {
                  soundManager.playExplosion();
                  setGameOverReason('作戦失敗');
                  setBomb({ ...bomb, status: 'exploded' });
                }}
                onDefuse={handleDefuse}
              />
            )}

            {activeView === 'manual' && <ManualView />}

            {activeView === 'split' && bomb && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <div>
                  <DefuserView
                    bomb={bomb}
                    onUpdateBomb={handleUpdateBomb}
                    onStrike={handleStrike}
                    onExplode={() => {
                      soundManager.playExplosion();
                      setGameOverReason('作戦失敗');
                      setBomb({ ...bomb, status: 'exploded' });
                    }}
                    onDefuse={handleDefuse}
                  />
                </div>
                <div className="sticky top-20">
                  <ManualView />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Game Over Modal */}
      {bomb && bomb.status === 'exploded' && (
        <GameOverModal onRestart={handleRestart} reason={gameOverReason} />
      )}

      {/* Victory Modal */}
      {bomb && bomb.status === 'defused' && (
        <VictoryModal
          onRestart={handleRestart}
          clearTimeStr={getClearTimeStr()}
          strikes={bomb.strikes}
        />
      )}

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-gray-500 font-mono border-t border-[#1b1e2a]">
        極秘：爆弾解除プロトコル © 2026 - 解除班とマニュアル班の協力型脱出ゲーム
      </footer>
    </div>
  );
};
