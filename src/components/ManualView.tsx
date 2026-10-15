import React, { useState } from 'react';
import { KEYPAD_COLUMNS, MORSE_WORDS, MORSE_ALPHABET, PASSWORD_WORDS } from '../utils/generator';
import { MAZES } from '../utils/mazes';
import {
  BookOpen,
  Search,
  Printer,
  ShieldAlert,
  HelpCircle,
  FileText,
  Key,
  Radio,
  Lock,
  Grid,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const ManualView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('intro');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scratchpad notes state
  const [scratchSerial, setScratchSerial] = useState('');
  const [scratchBatteries, setScratchBatteries] = useState('0');
  const [scratchIndicator, setScratchIndicator] = useState('NONE');
  const [scratchStrikes, setScratchStrikes] = useState('0');
  const [scratchPasswordFilter, setScratchPasswordFilter] = useState('');

  const tabs = [
    { id: 'intro', label: '基本心得', icon: ShieldAlert },
    { id: 'wires', label: '1. 導線', icon: FileText },
    { id: 'button', label: '2. ビッグボタン', icon: AlertTriangle },
    { id: 'keypad', label: '3. キーパッド', icon: Key },
    { id: 'simon', label: '4. サイモン', icon: CheckCircle2 },
    { id: 'morse', label: '5. モールス信号', icon: Radio },
    { id: 'password', label: '6. パスワード', icon: Lock },
    { id: 'maze', label: '7. 迷路', icon: Grid },
    { id: 'scratchpad', label: '分析官ツール', icon: BookOpen },
  ];

  const filteredTabs = tabs.filter(t =>
    t.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#faf8f2] text-gray-900 rounded-xl shadow-2xl border-4 border-[#3d4451] overflow-hidden flex flex-col min-h-[750px]">
      {/* Top Classified Header */}
      <div className="bg-[#1f242d] text-gray-100 p-4 border-b-4 border-red-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-red-700 text-white font-mono font-black px-2 py-1 text-xs tracking-widest uppercase rounded">
            TOP SECRET
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono tracking-wider flex items-center gap-2 text-white">
              <BookOpen size={20} className="text-red-500" />
              極秘：爆弾解除プロトコル 指示書
            </h1>
            <p className="text-xs text-gray-400 font-mono">
              第7機動部隊 分析官専用マニュアル (バージョン 3.2.0)
            </p>
          </div>
        </div>

        {/* Search & Print */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="モジュール検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#2c3340] border border-gray-600 rounded text-xs pl-8 pr-3 py-1.5 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded bg-[#2c3340] hover:bg-[#3a4354] border border-gray-600 text-gray-200"
            title="印刷 / PDF保存"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-56 bg-[#ebe7df] border-r border-[#d4cebd] p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
          {filteredTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded font-mono text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-700 text-white shadow'
                    : 'text-gray-700 hover:bg-[#ddd7c8]'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Manual Content Pages */}
        <div className="flex-1 p-6 md:p-8 bg-[#fdfcf9] overflow-y-auto max-h-[800px]">
          {/* TAB 0: INTRO */}
          {activeTab === 'intro' && (
            <div className="space-y-6">
              <div className="border-b-2 border-red-700 pb-3">
                <h2 className="text-2xl font-bold font-mono tracking-wide text-gray-900">
                  解除班への指示手順・基本心得
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  注意：分析官は爆弾の画面を直接見てはならない。解除者との「対話」のみで解除を導け。
                </p>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-sm text-amber-900 space-y-2">
                <p className="font-bold flex items-center gap-2">
                  <AlertTriangle size={18} />
                  最優先確認事項 (解除者にまず質問すること)：
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>シリアルナンバー (S/N)</strong>：末尾は偶数か奇数か？ 母音(A, E, I, O, U)を含むか？</li>
                  <li><strong>バッテリーの本数</strong>：爆弾のケースに何本刺さっているか？</li>
                  <li><strong>点灯インジケーター</strong>：緑ランプが付いている略称は何か？(例: CAR, FRK)</li>
                  <li><strong>ポートの種類</strong>：DVI、Parallel、PS/2などがあるか？</li>
                </ul>
              </div>

              <div className="space-y-3 text-sm text-gray-800 leading-relaxed">
                <h3 className="font-bold text-base text-gray-900 border-b pb-1">ゲームのルール</h3>
                <p>1. 爆弾には複数のモジュールが取り付けられている。</p>
                <p>2. モジュールの右上にあるLEDが緑色になれば、そのモジュールは解除完了である。</p>
                <p>3. すべてのモジュールのLEDを緑色に点灯させれば<strong>作戦成功</strong>となる。</p>
                <p>4. 間違えた操作を行うと<strong>ミス（STRIKE）</strong>となり、警告ブザーが鳴り赤い「X」が点灯する。制限ストライク数（通常3回）に達するか、タイマーが00:00になると<strong>爆発（作戦失敗）</strong>する。</p>
              </div>
            </div>
          )}

          {/* TAB 1: WIRES */}
          {activeTab === 'wires' && (
            <div className="space-y-6">
              <div className="border-b-2 border-red-700 pb-2">
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-widest">
                  MODULE SPEC 01
                </span>
                <h2 className="text-2xl font-bold font-mono">導線モジュール (Wires)</h2>
              </div>

              <p className="text-sm text-gray-700">
                導線は3本〜6本あります。上から順に1本目、2本目…と数えます。以下の条件を上から順に確認し、最初に当てはまった条件の導線を<strong>1本だけ切断</strong>してください。
              </p>

              {/* 3 wires */}
              <div className="border border-gray-300 rounded p-4 bg-white shadow-sm space-y-2">
                <h3 className="font-bold font-mono text-base text-red-700">導線が3本の場合</h3>
                <ul className="text-sm space-y-1.5 list-disc list-inside text-gray-800">
                  <li>赤の導線がない場合、<strong>2本目</strong>の導線を切断する。</li>
                  <li>そうでなく、最後の導線が白の場合、<strong>最後の導線</strong>を切断する。</li>
                  <li>そうでなく、青の導線が2本以上ある場合、<strong>最後の青の導線</strong>を切断する。</li>
                  <li>それ以外の場合、<strong>最後の導線</strong>を切断する。</li>
                </ul>
              </div>

              {/* 4 wires */}
              <div className="border border-gray-300 rounded p-4 bg-white shadow-sm space-y-2">
                <h3 className="font-bold font-mono text-base text-red-700">導線が4本の場合</h3>
                <ul className="text-sm space-y-1.5 list-disc list-inside text-gray-800">
                  <li>赤の導線が2本以上あり、かつシリアル末尾が奇数の場合、<strong>最後の赤の導線</strong>を切断する。</li>
                  <li>そうでなく、最後の導線が黄色で赤の導線がない場合、<strong>1本目</strong>の導線を切断する。</li>
                  <li>そうでなく、青の導線がちょうど1本だけある場合、<strong>1本目</strong>の導線を切断する。</li>
                  <li>そうでなく、黄色の導線が2本以上ある場合、<strong>最後の導線</strong>を切断する。</li>
                  <li>それ以外の場合、<strong>2本目</strong>の導線を切断する。</li>
                </ul>
              </div>

              {/* 5 wires */}
              <div className="border border-gray-300 rounded p-4 bg-white shadow-sm space-y-2">
                <h3 className="font-bold font-mono text-base text-red-700">導線が5本の場合</h3>
                <ul className="text-sm space-y-1.5 list-disc list-inside text-gray-800">
                  <li>最後の導線が黒で、かつシリアル末尾が奇数の場合、<strong>4本目</strong>の導線を切断する。</li>
                  <li>そうでなく、赤の導線がちょうど1本かつ黄色の導線が2本以上ある場合、<strong>1本目</strong>の導線を切断する。</li>
                  <li>そうでなく、黒の導線がない場合、<strong>2本目</strong>の導線を切断する。</li>
                  <li>それ以外の場合、<strong>1本目</strong>の導線を切断する。</li>
                </ul>
              </div>

              {/* 6 wires */}
              <div className="border border-gray-300 rounded p-4 bg-white shadow-sm space-y-2">
                <h3 className="font-bold font-mono text-base text-red-700">導線が6本の場合</h3>
                <ul className="text-sm space-y-1.5 list-disc list-inside text-gray-800">
                  <li>黄色の導線がなく、かつシリアル末尾が奇数の場合、<strong>3本目</strong>の導線を切断する。</li>
                  <li>そうでなく、黄色の導線が1本かつ白の導線が2本以上ある場合、<strong>4本目</strong>の導線を切断する。</li>
                  <li>そうでなく、赤の導線がない場合、<strong>最後の導線</strong>を切断する。</li>
                  <li>それ以外の場合、<strong>4本目</strong>の導線を切断する。</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: BIG BUTTON */}
          {activeTab === 'button' && (
            <div className="space-y-6">
              <div className="border-b-2 border-red-700 pb-2">
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-widest">
                  MODULE SPEC 02
                </span>
                <h2 className="text-2xl font-bold font-mono">ビッグボタン (The Button)</h2>
              </div>

              <div className="space-y-4 text-sm text-gray-800">
                <p>
                  ボタンの色とラベル（中止、起爆、保持、押す）を確認してください。以下の条件を上から順に確認し、<strong>短く押して離す</strong>か、<strong>長押し（ホールド）する</strong>かを決定します。
                </p>

                <div className="bg-white border rounded p-4 shadow-sm space-y-2">
                  <h3 className="font-bold text-red-700 font-mono">操作の判定手順：</h3>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>ボタンが<strong>青色</strong>で、ラベルが<strong>「中止」</strong>の場合、<strong>長押しする</strong>。</li>
                    <li><strong>バッテリーが2本以上</strong>あり、ラベルが<strong>「起爆」</strong>の場合、<strong>短く押して離す</strong>。</li>
                    <li>ボタンが<strong>白色</strong>で、点灯インジケーター<strong>「CAR」</strong>がある場合、<strong>長押しする</strong>。</li>
                    <li><strong>バッテリーが3本以上</strong>あり、点灯インジケーター<strong>「FRK」</strong>がある場合、<strong>短く押して離す</strong>。</li>
                    <li>ボタンが<strong>黄色</strong>の場合、<strong>長押しする</strong>。</li>
                    <li>ボタンが<strong>赤色</strong>で、ラベルが<strong>「保持」</strong>の場合、<strong>短く押して離す</strong>。</li>
                    <li><strong>上記のいずれにも当てはまらない場合、長押しする。</strong></li>
                  </ol>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded space-y-2">
                  <h3 className="font-bold text-amber-900 font-mono">長押しした場合の「離すタイミング」：</h3>
                  <p className="text-xs text-amber-800">
                    ボタンを長押しすると、右側のストリップ（帯状ランプ）が点灯します。その色に応じて、<strong>タイマーのいずれかの桁</strong>に指定の数字が表示された瞬間にボタンを離してください。
                  </p>
                  <table className="w-full text-left border-collapse text-xs mt-2 bg-white rounded border">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="p-2 border-r">点灯したストリップの色</th>
                        <th className="p-2">ボタンを離すタイマーの数字</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-2 font-bold text-blue-600 border-r">青のストリップ</td>
                        <td className="p-2">タイマーのいずれかの桁に <strong>4</strong> がある時</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-gray-700 border-r">白のストリップ</td>
                        <td className="p-2">タイマーのいずれかの桁に <strong>1</strong> がある時</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-amber-500 border-r">黄色のストリップ</td>
                        <td className="p-2">タイマーのいずれかの桁に <strong>5</strong> がある時</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-red-600 border-r">赤（その他の色）のストリップ</td>
                        <td className="p-2">タイマーのいずれかの桁に <strong>1</strong> がある時</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KEYPAD */}
          {activeTab === 'keypad' && (
            <div className="space-y-6">
              <div className="border-b-2 border-red-700 pb-2">
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-widest">
                  MODULE SPEC 03
                </span>
                <h2 className="text-2xl font-bold font-mono">古代文字キーパッド (Keypad)</h2>
              </div>

              <p className="text-sm text-gray-700">
                4つのボタンに刻印された記号を確認してください。下の6つの列のうち、<strong>4つの記号すべてが含まれている列が1つだけ存在します</strong>。その列の中で、<strong>上から下へ出現する順番通り</strong>にボタンを押してください。
              </p>

              {/* 6 Columns Grid */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
                {KEYPAD_COLUMNS.map((col, cIdx) => (
                  <div
                    key={`col-manual-${cIdx}`}
                    className="border-2 border-gray-300 rounded bg-white p-2 flex flex-col items-center shadow-sm"
                  >
                    <span className="text-[10px] font-mono font-bold text-gray-500 mb-2 border-b w-full text-center pb-1">
                      列 {cIdx + 1}
                    </span>
                    <div className="space-y-3 my-1">
                      {col.map((sym, sIdx) => (
                        <div
                          key={`sym-${cIdx}-${sIdx}`}
                          className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-xl font-serif text-gray-800 bg-[#f8f9fa]"
                        >
                          {sym}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SIMON */}
          {activeTab === 'simon' && (
            <div className="space-y-6">
              <div className="border-b-2 border-red-700 pb-2">
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-widest">
                  MODULE SPEC 04
                </span>
                <h2 className="text-2xl font-bold font-mono">カラーシーケンス・サイモン (Simon Says)</h2>
              </div>

              <p className="text-sm text-gray-700">
                中央のパネルが点滅します。シリアルナンバーに母音（A, E, I, O, U）があるかどうか、および<strong>現在のミス（ストライク）の数</strong>によって、押すべきボタンの色が変換されます。
              </p>

              {/* Case 1: Has Vowel */}
              <div className="bg-white border rounded p-4 shadow-sm space-y-3">
                <h3 className="font-bold text-red-700 font-mono text-sm">
                  シリアルナンバーに母音 (A, E, I, O, U) が「ある」場合
                </h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="border p-2 rounded bg-gray-50">
                    <span className="font-bold block border-b pb-1 mb-1 text-center">ストライク 0</span>
                    <p>赤点滅 → <strong className="text-blue-600">青を押す</strong></p>
                    <p>青点滅 → <strong className="text-red-600">赤を押す</strong></p>
                    <p>緑点滅 → <strong className="text-amber-500">黄を押す</strong></p>
                    <p>黄点滅 → <strong className="text-emerald-600">緑を押す</strong></p>
                  </div>
                  <div className="border p-2 rounded bg-gray-50">
                    <span className="font-bold block border-b pb-1 mb-1 text-center">ストライク 1</span>
                    <p>赤点滅 → <strong className="text-amber-500">黄を押す</strong></p>
                    <p>青点滅 → <strong className="text-emerald-600">緑を押す</strong></p>
                    <p>緑点滅 → <strong className="text-blue-600">青を押す</strong></p>
                    <p>黄点滅 → <strong className="text-red-600">赤を押す</strong></p>
                  </div>
                  <div className="border p-2 rounded bg-gray-50">
                    <span className="font-bold block border-b pb-1 mb-1 text-center">ストライク 2</span>
                    <p>赤点滅 → <strong className="text-emerald-600">緑を押す</strong></p>
                    <p>青点滅 → <strong className="text-red-600">赤を押す</strong></p>
                    <p>緑点滅 → <strong className="text-amber-500">黄を押す</strong></p>
                    <p>黄点滅 → <strong className="text-blue-600">青を押す</strong></p>
                  </div>
                </div>
              </div>

              {/* Case 2: No Vowel */}
              <div className="bg-white border rounded p-4 shadow-sm space-y-3">
                <h3 className="font-bold text-gray-700 font-mono text-sm">
                  シリアルナンバーに母音 (A, E, I, O, U) が「ない」場合
                </h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="border p-2 rounded bg-gray-50">
                    <span className="font-bold block border-b pb-1 mb-1 text-center">ストライク 0</span>
                    <p>赤点滅 → <strong className="text-blue-600">青を押す</strong></p>
                    <p>青点滅 → <strong className="text-amber-500">黄を押す</strong></p>
                    <p>緑点滅 → <strong className="text-emerald-600">緑を押す</strong></p>
                    <p>黄点滅 → <strong className="text-red-600">赤を押す</strong></p>
                  </div>
                  <div className="border p-2 rounded bg-gray-50">
                    <span className="font-bold block border-b pb-1 mb-1 text-center">ストライク 1</span>
                    <p>赤点滅 → <strong className="text-red-600">赤を押す</strong></p>
                    <p>青点滅 → <strong className="text-blue-600">青を押す</strong></p>
                    <p>緑点滅 → <strong className="text-amber-500">黄を押す</strong></p>
                    <p>黄点滅 → <strong className="text-emerald-600">緑を押す</strong></p>
                  </div>
                  <div className="border p-2 rounded bg-gray-50">
                    <span className="font-bold block border-b pb-1 mb-1 text-center">ストライク 2</span>
                    <p>赤点滅 → <strong className="text-amber-500">黄を押す</strong></p>
                    <p>青点滅 → <strong className="text-emerald-600">緑を押す</strong></p>
                    <p>緑点滅 → <strong className="text-blue-600">青を押す</strong></p>
                    <p>黄点滅 → <strong className="text-red-600">赤を押す</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MORSE */}
          {activeTab === 'morse' && (
            <div className="space-y-6">
              <div className="border-b-2 border-red-700 pb-2">
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-widest">
                  MODULE SPEC 05
                </span>
                <h2 className="text-2xl font-bold font-mono">モールス信号 (Morse Code)</h2>
              </div>

              <p className="text-sm text-gray-700">
                ランプの点滅からモールス信号を解読し、対応する英単語を特定してください。その後、下の周波数表に従って周波数を合わせ、<strong>TX (送信)</strong> ボタンを押します。
              </p>

              {/* Table of Words and Frequencies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded bg-white p-3 shadow-sm">
                  <h3 className="font-bold font-mono text-sm text-red-700 mb-2 border-b pb-1">
                    単語と送信周波数
                  </h3>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-1.5">単語</th>
                        <th className="p-1.5 text-right">周波数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-mono">
                      {MORSE_WORDS.map(entry => (
                        <tr key={entry.word} className="hover:bg-amber-50">
                          <td className="p-1.5 font-bold tracking-wider">{entry.word}</td>
                          <td className="p-1.5 text-right text-red-700 font-bold">
                            {entry.freq.toFixed(3)} MHz
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Morse Alphabet Reference */}
                <div className="border rounded bg-white p-3 shadow-sm">
                  <h3 className="font-bold font-mono text-sm text-gray-700 mb-2 border-b pb-1">
                    モールス符号早見表 (・: 短点 / －: 長点)
                  </h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-mono">
                    {Object.entries(MORSE_ALPHABET).map(([char, code]) => (
                      <div key={char} className="flex justify-between border-b border-gray-100 py-0.5 px-1">
                        <span className="font-bold">{char}</span>
                        <span className="text-gray-600">{code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PASSWORD */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <div className="border-b-2 border-red-700 pb-2">
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-widest">
                  MODULE SPEC 06
                </span>
                <h2 className="text-2xl font-bold font-mono">パスワード (Password)</h2>
              </div>

              <p className="text-sm text-gray-700">
                5つのダイヤルにある文字から構成できる<strong>5文字の有効な英単語</strong>は、以下の35個の候補リストの中に<strong>1つだけ</strong>存在します。各位置の候補文字を照合して絞り込み、一致した単語に合わせて SUBMIT を押してください。
              </p>

              <div className="bg-white border rounded p-4 shadow-sm">
                <h3 className="font-bold font-mono text-sm text-red-700 mb-3 border-b pb-1">
                  パスワード有効候補単語一覧 (全35語)
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-xs font-mono font-bold tracking-wider">
                  {PASSWORD_WORDS.map(word => (
                    <div
                      key={word}
                      className="p-2 border rounded bg-gray-50 text-center hover:bg-amber-100 transition-colors"
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MAZE */}
          {activeTab === 'maze' && (
            <div className="space-y-6">
              <div className="border-b-2 border-red-700 pb-2">
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-widest">
                  MODULE SPEC 07
                </span>
                <h2 className="text-2xl font-bold font-mono">迷路 (Maze)</h2>
              </div>

              <p className="text-sm text-gray-700">
                画面上の<strong>2つの緑色の円（マーカー）</strong>の座標を解除者に確認し、下の9つの迷路の中から合致するマップを特定してください。壁に当たるとミスになるため、分析官がルートを案内して赤い光を星印（ゴール）まで導きます。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {MAZES.map((maze, idx) => (
                  <div key={`maze-ref-${idx}`} className="border rounded bg-white p-3 shadow-sm flex flex-col items-center">
                    <span className="text-xs font-mono font-bold text-red-700 mb-2">
                      迷路 {idx + 1}
                    </span>
                    <div className="text-[10px] text-gray-500 font-mono mb-2">
                      マーカー: ({maze.markers[0][0] + 1}, {maze.markers[0][1] + 1}) & ({maze.markers[1][0] + 1}, {maze.markers[1][1] + 1})
                    </div>
                    {/* Visual mini-maze representation */}
                    <div className="w-28 h-28 bg-[#111] grid grid-cols-6 grid-rows-6 p-0.5 rounded border">
                      {Array.from({ length: 36 }).map((_, cIdx) => {
                        const x = cIdx % 6;
                        const y = Math.floor(cIdx / 6);
                        const isMarker = maze.markers.some(m => m[0] === x && m[1] === y);
                        return (
                          <div
                            key={`mini-${idx}-${cIdx}`}
                            className="bg-[#222] flex items-center justify-center border-[0.5px] border-[#333]"
                          >
                            {isMarker && (
                              <div className="w-2 h-2 rounded-full border border-emerald-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: SCRATCHPAD TOOLS */}
          {activeTab === 'scratchpad' && (
            <div className="space-y-6">
              <div className="border-b-2 border-red-700 pb-2">
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-widest">
                  FIELD WORKBENCH
                </span>
                <h2 className="text-2xl font-bold font-mono">分析官インタラクティブ・メモ</h2>
              </div>

              {/* Status Tracker */}
              <div className="bg-white border rounded p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-gray-600 block mb-1">
                    シリアルナンバー
                  </label>
                  <input
                    type="text"
                    placeholder="例: E37K89"
                    value={scratchSerial}
                    onChange={e => setScratchSerial(e.target.value.toUpperCase())}
                    className="w-full border rounded px-2 py-1 font-mono text-sm uppercase font-bold"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    母音: {/[AEIOU]/.test(scratchSerial) ? 'あり' : 'なし'} | 末尾: {parseInt(scratchSerial.slice(-1) || '0', 10) % 2 === 1 ? '奇数' : '偶数'}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-gray-600 block mb-1">
                    バッテリー本数
                  </label>
                  <select
                    value={scratchBatteries}
                    onChange={e => setScratchBatteries(e.target.value)}
                    className="w-full border rounded px-2 py-1 font-mono text-sm"
                  >
                    <option value="0">0本</option>
                    <option value="1">1本</option>
                    <option value="2">2本</option>
                    <option value="3">3本以上</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-gray-600 block mb-1">
                    点灯インジケーター
                  </label>
                  <select
                    value={scratchIndicator}
                    onChange={e => setScratchIndicator(e.target.value)}
                    className="w-full border rounded px-2 py-1 font-mono text-sm"
                  >
                    <option value="NONE">なし</option>
                    <option value="CAR">CAR</option>
                    <option value="FRK">FRK</option>
                    <option value="SND">SND</option>
                    <option value="NSA">NSA</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-gray-600 block mb-1">
                    現在のストライク数
                  </label>
                  <select
                    value={scratchStrikes}
                    onChange={e => setScratchStrikes(e.target.value)}
                    className="w-full border rounded px-2 py-1 font-mono text-sm"
                  >
                    <option value="0">0回</option>
                    <option value="1">1回</option>
                    <option value="2">2回</option>
                  </select>
                </div>
              </div>

              {/* Password Filter Tool */}
              <div className="bg-white border rounded p-4 shadow-sm space-y-3">
                <h3 className="font-bold font-mono text-sm text-red-700">
                  パスワード絞り込みアシスタント
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="候補文字 (例: 1文字目に A または B を含むなど)"
                    value={scratchPasswordFilter}
                    onChange={e => setScratchPasswordFilter(e.target.value.toUpperCase())}
                    className="border rounded px-3 py-1.5 text-xs font-mono flex-1 uppercase"
                  />
                  <button
                    onClick={() => setScratchPasswordFilter('')}
                    className="text-xs text-gray-500 underline"
                  >
                    クリア
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {PASSWORD_WORDS.filter(w =>
                    scratchPasswordFilter === '' || w.includes(scratchPasswordFilter)
                  ).map(w => (
                    <span
                      key={w}
                      className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-xs font-mono font-bold text-amber-900"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
