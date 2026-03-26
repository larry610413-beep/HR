import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  LayoutGrid, 
  Upload, 
  Trash2, 
  Play, 
  RefreshCw,
  UserPlus,
  FileText,
  CheckCircle2
} from 'lucide-react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Participant, Group } from './types';

const initialNames = [
  '陳冠廷', '林家宇', '黃建宏', '張雅婷', '李怡君',
  '王志明', '吳佳穎', '劉淑芬', '蔡宗翰', '楊宗憲',
  '許文龍', '鄭凱文', '洪詩婷', '邱柏翰', '曾彥廷',
  '廖家豪', '賴冠宇', '徐浩恩', '莊子軒', '郭盈秀'
];
const defaultParticipants: Participant[] = initialNames.map((name, i) => ({
  id: `default-${i}`,
  name
}));

export default function App() {
  const [activeTab, setActiveTab] = useState<'list' | 'draw' | 'group'>('list');
  const [participants, setParticipants] = useState<Participant[]>(defaultParticipants);
  const [inputText, setInputText] = useState('');
  
  // Lucky Draw States
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'individual' | 'group'>('individual');
  const [winner, setWinner] = useState<Participant | null>(null);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [drawHistory, setDrawHistory] = useState<Participant[]>([]);
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number>(1);
  
  // Grouping States
  const [groupSize, setGroupSize] = useState<number>(3);
  const [groups, setGroups] = useState<Group[]>([]);

  // Handle CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const newNames: string[] = [];
        results.data.forEach((row: any) => {
          // Assume the first column contains the name
          const name = Object.values(row)[0] as string;
          if (name && name.trim()) {
            newNames.push(name.trim());
          }
        });
        addNames(newNames);
      },
      header: false,
      skipEmptyLines: true,
    });
  };

  const addNames = (names: string[]) => {
    const newParticipants = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name
    }));
    setParticipants(prev => [...prev, ...newParticipants]);
  };

  const handlePasteNames = () => {
    const names = inputText.split('\n').map(n => n.trim()).filter(n => n !== '');
    if (names.length > 0) {
      addNames(names);
      setInputText('');
    }
  };

  const clearParticipants = () => {
    setParticipants([]);
    setDrawHistory([]);
    setWinner(null);
    setGroups([]);
  };

  // Lucky Draw Logic
  const startDraw = () => {
    if (drawMode === 'individual') {
      if (participants.length === 0) return;
      
      let pool = [...participants];
      if (!allowRepeat) {
        pool = pool.filter(p => !drawHistory.find(h => h.id === p.id));
      }

      if (pool.length === 0) {
        alert('所有人都已中獎！');
        return;
      }

      setIsDrawing(true);
      setWinner(null);

      // Animation logic
      let counter = 0;
      const duration = 3000; // 3 seconds
      const interval = 100;
      const totalSteps = duration / interval;

      const timer = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * pool.length);
        setDisplayNames([pool[randomIndex].name]);
        counter++;

        if (counter >= totalSteps) {
          clearInterval(timer);
          const finalWinner = pool[Math.floor(Math.random() * pool.length)];
          setWinner(finalWinner);
          setIsDrawing(false);
          setDrawHistory(prev => [...prev, finalWinner]);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }, interval);
    } else {
      if (groups.length === 0) {
        alert('請先進行分組！');
        return;
      }
      
      const targetGroup = groups.find(g => g.id === selectedGroupId) || groups[0];
      
      let pool = [...targetGroup.members];
      if (!allowRepeat) {
        pool = pool.filter(p => !drawHistory.find(h => h.id === p.id));
      }

      if (pool.length === 0) {
        alert(`第 ${targetGroup.id} 組的所有人都已中獎！`);
        return;
      }

      setIsDrawing(true);
      setWinner(null);

      let counter = 0;
      const duration = 3000;
      const interval = 100;
      const totalSteps = duration / interval;

      const timer = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * pool.length);
        setDisplayNames([pool[randomIndex].name]);
        counter++;

        if (counter >= totalSteps) {
          clearInterval(timer);
          const finalWinner = pool[Math.floor(Math.random() * pool.length)];
          const winnerRecord = { ...finalWinner, name: `[第${targetGroup.id}組] ${finalWinner.name}` };
          setWinner(finalWinner);
          setIsDrawing(false);
          setDrawHistory(prev => [...prev, winnerRecord]);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }, interval);
    }
  };

  // Grouping Logic
  const generateGroups = () => {
    if (participants.length === 0) return;
    
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push({
        id: Math.floor(i / groupSize) + 1,
        members: shuffled.slice(i, i + groupSize)
      });
    }
    
    setGroups(newGroups);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Users className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">HR 抽籤與分組工具</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
            目前人數: {participants.length}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-gray-200 p-1 rounded-xl mb-8 w-fit">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <FileText size={18} />
            名單管理
          </button>
          <button 
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'draw' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Trophy size={18} />
            獎品抽籤
          </button>
          <button 
            onClick={() => setActiveTab('group')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'group' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <LayoutGrid size={18} />
            自動分組
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'list' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserPlus size={20} className="text-indigo-600" />
                  新增名單
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      貼上姓名 (每行一個)
                    </label>
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="例如：&#10;王小明&#10;李小華&#10;張大同"
                      className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handlePasteNames}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      確認加入
                    </button>
                    <label className="flex-1 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <Upload size={18} />
                      上傳 CSV
                      <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* List Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users size={20} className="text-indigo-600" />
                    目前名單
                  </h2>
                  <button 
                    onClick={clearParticipants}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="清除所有名單"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {participants.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                      <Users size={48} strokeWidth={1} className="mb-4 opacity-20" />
                      <p>尚未加入任何名單</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {participants.map((p, idx) => (
                        <div key={p.id} className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-sm flex items-center justify-between group">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-[10px] text-gray-300 font-mono w-4">#{idx + 1}</span>
                            <span className="truncate">{p.name}</span>
                          </div>
                          <button 
                            onClick={() => setParticipants(prev => prev.filter(item => item.id !== p.id))}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="刪除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'draw' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-indigo-50 p-4 rounded-full">
                    <Trophy size={48} className="text-indigo-600" />
                  </div>
                </div>
                
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                    <button 
                      onClick={() => { setDrawMode('individual'); setWinner(null); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${drawMode === 'individual' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      個人抽籤
                    </button>
                    <button 
                      onClick={() => { 
                        setDrawMode('group'); 
                        setWinner(null); 
                        if (groups.length > 0 && !groups.find(g => g.id === selectedGroupId)) {
                          setSelectedGroupId(groups[0].id);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${drawMode === 'group' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      分組抽籤
                    </button>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">幸運大抽籤</h2>
                <div className="flex justify-center items-center gap-2 mb-8 text-gray-500">
                  <span>點擊下方按鈕開始抽取幸運兒</span>
                  {drawMode === 'group' && groups.length > 0 && (
                    <select 
                      value={selectedGroupId} 
                      onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                      className="bg-white border border-gray-200 text-sm rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>第 {g.id} 組</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Animation Area */}
                <div className="h-32 flex items-center justify-center mb-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    {isDrawing ? (
                      <motion.div
                        key="drawing"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-4xl font-bold text-indigo-600"
                      >
                        {displayNames[0]}
                      </motion.div>
                    ) : winner ? (
                      <motion.div
                        key="winner"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <span className="text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-1">恭喜中獎！</span>
                        <span className="text-5xl font-black text-indigo-700">{winner.name}</span>
                      </motion.div>
                    ) : (
                      <div className="text-gray-300 font-medium">準備就緒</div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center gap-6 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-10 h-6 rounded-full transition-colors relative ${allowRepeat ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={allowRepeat}
                          onChange={() => setAllowRepeat(!allowRepeat)}
                        />
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allowRepeat ? 'left-5' : 'left-1'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-600">允許重複中獎</span>
                    </label>
                  </div>

                  <button 
                    onClick={startDraw}
                    disabled={isDrawing || (drawMode === 'individual' ? participants.length === 0 : groups.length === 0)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3"
                  >
                    {isDrawing ? <RefreshCw className="animate-spin" /> : <Play fill="currentColor" />}
                    {isDrawing ? '正在抽取...' : '開始抽籤'}
                  </button>
                </div>
              </div>

              {/* History */}
              {drawHistory.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">中獎記錄</h3>
                  <div className="flex flex-wrap gap-2">
                    {drawHistory.map((h, i) => (
                      <div key={i} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold border border-indigo-100 flex items-center gap-2">
                        <span className="opacity-50 text-xs">{drawHistory.length - i}</span>
                        {h.name}
                      </div>
                    )).reverse()}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'group' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-xl">
                    <LayoutGrid className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">自動分組設定</h2>
                    <p className="text-sm text-gray-500">設定每組人數，系統將隨機分配名單</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">每組人數:</span>
                    <input 
                      type="number" 
                      min="1"
                      max={participants.length}
                      value={groupSize}
                      onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                      className="w-16 bg-transparent font-bold text-indigo-600 outline-none text-center"
                    />
                  </div>
                  <button 
                    onClick={generateGroups}
                    disabled={participants.length === 0}
                    className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md"
                  >
                    開始分組
                  </button>
                </div>
              </div>

              {/* Groups Display */}
              {groups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groups.map((group) => (
                    <motion.div 
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: group.id * 0.05 }}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          第 {group.id} 組
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{group.members.length} 人</span>
                      </div>
                      <div className="space-y-2">
                        {group.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-indigo-300" />
                            <span className="text-sm font-medium text-gray-700">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-gray-400">
                  <LayoutGrid size={64} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="font-medium">尚未進行分組</p>
                  <p className="text-sm">設定人數並點擊「開始分組」</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto p-6 text-center text-gray-400 text-xs border-t border-gray-100 mt-12">
        &copy; 2026 HR 抽籤與分組工具 | 專業、快速、公平
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
}
