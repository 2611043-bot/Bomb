import React, { useState } from 'react';
import { Difficulty, PlayerRole } from '../types/game';
import { Bomb, BookOpen, Users, User, Shield, Volume2, Sparkles, Copy, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LobbyViewProps {
  onStartSolo: (diff: Difficulty) => void;
  onJoinRoom: (roomId: string, role: PlayerRole, diff: Difficulty) => void;
  initialRoomId?: string;
  initialRole?: PlayerRole;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  onStartSolo,
  onJoinRoom,
  initialRoomId = '',
  initialRole = 'defuser'
}) => {
  const [mode, setMode] = useState<'solo' | 'multi'>('solo');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [roomId, setRoomId] = useState(
    initialRoomId || `ROOM-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [selectedRole, setSelectedRole] = useState<PlayerRole>(initialRole);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const oppRole = selectedRole === 'defuser' ? 'manual' : 'defuser';
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}&role=${oppRole}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStart = () => {
    soundManager.playButtonClick();
    if (mode === 'solo') {
      onStartSolo(difficulty);
    } else {
      onJoinRoom(roomId, selectedRole, difficulty);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#181a24] border-4 border-[#303648] rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
      {/* Title */}
      <div className="text-center space-y-2 border-b border-[#2b3142] pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/50 text-red-400 text-xs font-mono font-bold tracking-wider mb-1">
          <Bomb size={14} />
          BOMB DEFUSAL CO-OP PROTOCOL
        </div>
        <h1 className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white">
          極秘作戦：爆弾解除
        </h1>
        <p className="text-sm text-gray-400">
          「解除班」と「分析班（マニュアル）」の2人で協力し、爆発を防げ！
        </p>
      </div>

      {/* Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
          プレイモード選択
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('solo')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              mode === 'solo'
                ? 'bg-[#222736] border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                : 'bg-[#151720] border-[#2e3344] text-gray-400 hover:border-gray-500'
            }`}
          >
            <User size={24} className={mode === 'solo' ? 'text-red-400' : ''} />
            <span className="font-bold font-mono text-sm text-white">1人練習モード</span>
            <span className="text-[11px] text-gray-400 text-center">
              爆弾とマニュアルを自由に切替または同時表示
            </span>
          </button>

          <button
            onClick={() => setMode('multi')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
              mode === 'multi'
                ? 'bg-[#222736] border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                : 'bg-[#151720] border-[#2e3344] text-gray-400 hover:border-gray-500'
            }`}
          >
            <Users size={24} className={mode === 'multi' ? 'text-red-400' : ''} />
            <span className="font-bold font-mono text-sm text-white">2人協力プレイ</span>
            <span className="text-[11px] text-gray-400 text-center">
              別端末や別タブで「解除班」と「指示書」を分担
            </span>
          </button>
        </div>
      </div>

      {/* Multiplayer Role & Room settings */}
      {mode === 'multi' && (
        <div className="bg-[#13151c] border border-[#2b3042] rounded-xl p-4 space-y-4 animate-in fade-in">
          <div>
            <label className="text-xs font-mono font-bold text-gray-400 block mb-1">
              あなたの担当役割
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedRole('defuser')}
                className={`py-3 px-4 rounded-lg border flex items-center justify-center gap-2 font-mono font-bold text-xs transition-all ${
                  selectedRole === 'defuser'
                    ? 'bg-red-700 border-red-400 text-white shadow'
                    : 'bg-[#1d202b] border-[#373e52] text-gray-400 hover:text-white'
                }`}
              >
                <Bomb size={16} />
                💣 解除班 (爆弾を操作)
              </button>

              <button
                onClick={() => setSelectedRole('manual')}
                className={`py-3 px-4 rounded-lg border flex items-center justify-center gap-2 font-mono font-bold text-xs transition-all ${
                  selectedRole === 'manual'
                    ? 'bg-blue-700 border-blue-400 text-white shadow'
                    : 'bg-[#1d202b] border-[#373e52] text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen size={16} />
                📋 分析班 (マニュアルを読む)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-bold text-gray-400">
              ルームID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={e => setRoomId(e.target.value.toUpperCase())}
                className="bg-[#1f2330] border border-[#373e52] rounded-lg px-3 py-2 font-mono text-sm font-bold text-white flex-1 focus:outline-none focus:border-red-500 uppercase tracking-wider"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-lg bg-[#272d3d] hover:bg-[#343b4f] border border-[#414a60] text-gray-200 text-xs font-mono flex items-center gap-1.5"
                title="相方に送るリンクをコピー"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'コピー完了' : '相手の招待URL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Selection */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
          作戦難易度
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'easy', label: '初級', time: '6分', mod: '3モジュール', desc: '導線/ボタン/キー' },
            { id: 'normal', label: '中級', time: '5分', mod: '5モジュール', desc: '+サイモン/モールス' },
            { id: 'hard', label: '上級', time: '5分', mod: '6モジュール', desc: '+パスワード' },
            { id: 'nightmare', label: '悪夢', time: '4分', mod: '7モジュール', desc: '1ミス即死+迷路' }
          ].map(d => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id as Difficulty)}
              className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                difficulty === d.id
                  ? 'bg-[#252b3b] border-red-500 text-white shadow'
                  : 'bg-[#151720] border-[#2e3344] text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="font-mono font-bold text-xs text-white flex items-center justify-between">
                <span>{d.label}</span>
                <span className="text-[10px] text-gray-400">{d.time}</span>
              </div>
              <div className="text-[10px] text-amber-400 font-mono mt-1 font-semibold">{d.mod}</div>
              <div className="text-[9px] text-gray-500 mt-0.5">{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-black text-lg tracking-widest shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-transform active:scale-98 flex items-center justify-center gap-2"
      >
        <Sparkles size={20} />
        任務開始 (START MISSION)
      </button>
    </div>
  );
};
