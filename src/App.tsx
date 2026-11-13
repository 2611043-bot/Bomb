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
  // Query parameters check (?room=XYZ&role=manual&server=192.168.1.10:3000)
  const urlParams = new URLSearchParams(window.location.search);
  const paramRoom = urlParams.get('room') || '';
  const paramRole = (urlParams.get('role') as PlayerRole) || 'defuser';
  const paramServer = urlParams.get('server') || '';

  const [inGame, setInGame] = useState(false);
  const [playMode, setPlayMode] = useState<'solo' | 'multi'>('solo');
  const [activeView, setActiveView] = useState<'defuser' | 'manual' | 'split'>('defuser');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [roomId, setRoomId] = useState<string>(paramRoom);
  const [myRole, setMyRole] = useState<PlayerRole>(paramRole);
  const [serverHost, setServerHost] = useState<string>(
    paramServer || (typeof window !== 'undefined' ? window.location.host : 'localhost:3000')
  );

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

  // Keep WebSocket connection alive with periodic ping
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 25000);
    return () => clearInterval(pingInterval);
  }, []);

  // Connect to WebSocket if in multiplayer mode
  const connectWebSocket = (rId: string, role: PlayerRole, hostAddress?: string) => {
    const rawHost = hostAddress || serverHost || (typeof window !== 'undefined' ? window.location.host : 'localhost:3000');
    const cleanHost = rawHost.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${cleanHost}/ws`;

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

        // If I already have an active bomb, announce it to the newly opened socket
        if (bomb && bomb.status === 'running') {
          ws.send(JSON.stringify({
            type: 'STATE_UPDATE',
            room: {
              roomId: rId,
              bomb,
              players: [],
              difficulty,
              chatMessages: []
            }
          }));
        }
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
        if (msg.room.difficulty) {
          setDifficulty(msg.room.difficulty);
        }
        if (msg.room.bomb.status === 'exploded') {
          soundManager.playExplosion();
          setGameOverReason('作戦失敗：起爆しました');
        } else if (msg.room.bomb.status === 'defused') {
          soundManager.playSuccess();
        }
      }
    } else if (msg.type === 'JOIN') {
      // If someone joined and I am the defuser, send them current state
      if (bomb && bomb.status === 'running') {
        broadcastMessage({
          type: 'STATE_UPDATE',
          room: {
            roomId,
            bomb,
            players: [],
            difficulty,
            chatMessages: []
          }
        });
      }
    }
  };

  const broadcastMessage = (msg: SocketMessage) => {
    // Send over WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
    // Also send over BroadcastChannel for same-browser tabs
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

    // In multiplayer, only defuser advances the timer; manual gets sync via STATE_UPDATE
    if (playMode === 'multi' && myRole === 'manual') {
      clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setBomb((prev) => {
        if (!prev || prev.status !== 'running') return prev;

        const nextTime = Math.max(0, prev.remainingTime - 1);
        const isUrgent = nextTime <= 60;
        soundManager.playTick(isUrgent);

        const updatedBomb: BombState = {
          ...prev,
          remainingTime: nextTime,
          status: nextTime <= 0 ? 'exploded' : prev.status
        };

        if (nextTime <= 0) {
          soundManager.playExplosion();
          setGameOverReason('制限時間超過：タイムアップ');
        }

        if (playMode === 'multi') {
          broadcastMessage({
            type: 'STATE_UPDATE',
            room: {
              roomId,
              bomb: updatedBomb,
              players: [],
              difficulty,
              chatMessages: []
            }
          });
        }

        return updatedBomb;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [bomb?.status, playMode, myRole, roomId, difficulty]);

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
  const handleJoinRoom = (rId: string, role: PlayerRole, diff: Difficulty, hostAddress?: string) => {
    setDifficulty(diff);
    setPlayMode('multi');
    setRoomId(rId);
    setMyRole(role);
    setActiveView(role === 'manual' ? 'manual' : 'defuser');

    connectWebSocket(rId, role, hostAddress);

    if (role === 'defuser') {
      const newBomb = generateBomb(diff);
      newBomb.status = 'running';
      newBomb.startedAt = Date.now();
      setBomb(newBomb);
      setInGame(true);

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
    } else {
      // Manual player waits for or receives the existing bomb state
      setInGame(true);
    }
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
              onClick={() => handleRestart()}
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
            initialServerHost={paramServer || (typeof window !== 'undefined' ? window.location.host : '')}
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

            {activeView === 'manual' && (
              <div className="flex flex-col gap-4">
                {/* Live Tactical Monitor for Analyst in Multiplayer */}
                {playMode === 'multi' && bomb && (
                  <div className="max-w-5xl mx-auto w-full bg-[#151824] border-2 border-[#2f3549] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-gray-300 font-bold">解除班と暗号通信中</span>
                      <span className="text-gray-500">| ルーム: {roomId}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Timer */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">残り時間:</span>
                        <span className={`font-black text-sm px-2 py-0.5 rounded bg-black/50 border ${
                          bomb.remainingTime <= 60 ? 'text-red-500 border-red-500 animate-pulse' : 'text-emerald-400 border-[#2f364a]'
                        }`}>
                          {Math.floor(bomb.remainingTime / 60)}:{(bomb.remainingTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* Strikes */}
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">ミス:</span>
                        <span className="font-bold text-red-500 bg-red-950/40 px-2 py-0.5 rounded border border-red-800">
                          {'X '.repeat(bomb.strikes).trim() || 'なし'} ({bomb.strikes}/{bomb.maxStrikes})
                        </span>
                      </div>

                      {/* Remaining Modules */}
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">残り:</span>
                        <span className="text-amber-400 font-bold">
                          {bomb.modules.filter(m => !m.isSolved).length} / {bomb.modules.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Waiting State if defuser hasn't connected or initialized bomb */}
                {playMode === 'multi' && !bomb && (
                  <div className="max-w-md mx-auto my-12 bg-[#171a25] border border-[#30374b] rounded-xl p-8 text-center space-y-4 shadow-2xl">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
                    <h3 className="font-mono font-bold text-lg text-white">解除班の通信待機中…</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-mono">
                      ルームID: <strong className="text-amber-400">{roomId}</strong><br />
                      解除班（相手）が爆弾を起動すると、リアルタイムに通信が同期されます。<br />
                      下のマニュアルを先に読んで作戦の予習をしておきましょう！
                    </p>
                  </div>
                )}

                <ManualView />
              </div>
            )}

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
        <GameOverModal onRestart={() => handleRestart()} reason={gameOverReason} />
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
