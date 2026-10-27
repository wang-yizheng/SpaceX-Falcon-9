import { useState, useCallback, useRef, useEffect } from 'react';
import FalconScene from './components/FalconScene';
import { RocketModule } from './utils/rocket';

const MODULE_LIST = [
  { name: 'Payload Fairing', nameCN: '有效载荷整流罩', color: '#ffffff' },
  { name: 'Second Stage LOX Tank', nameCN: '二级液氧贮箱', color: '#e8f0f8' },
  { name: 'Second Stage RP-1 Tank', nameCN: '二级煤油贮箱', color: '#f0f0f0' },
  { name: 'Merlin Vacuum Engine', nameCN: 'Merlin真空发动机', color: '#555555' },
  { name: 'Interstage', nameCN: '级间段', color: '#333333' },
  { name: 'First Stage LOX Tank', nameCN: '一级液氧贮箱', color: '#e0e8f0' },
  { name: 'First Stage RP-1 Tank', nameCN: '一级煤油贮箱', color: '#e8e8e8' },
  { name: 'Engine Section (9x Merlin)', nameCN: '发动机舱', color: '#444444' },
  { name: 'Grid Fins', nameCN: '栅格翼', color: '#555555' },
];

function App() {
  const [selectedModule, setSelectedModule] = useState<RocketModule | null>(null);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [explodeProgress, setExplodeProgress] = useState(0);
  const [isExploded, setIsExploded] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const animRef = useRef<number>(0);
  const targetExplode = useRef(0);

  const handleModuleSelect = useCallback((module: RocketModule | null) => {
    setSelectedModule(module);
    if (module) {
      const idx = MODULE_LIST.findIndex((m) => m.name === module.name);
      setSelectedModuleIndex(idx >= 0 ? idx : null);
    } else {
      setSelectedModuleIndex(null);
    }
  }, []);

  const toggleExplode = useCallback(() => {
    setIsExploded((prev) => {
      const next = !prev;
      targetExplode.current = next ? 1 : 0;
      return next;
    });
  }, []);

  // Smooth explode animation
  useEffect(() => {
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      setExplodeProgress((prev) => {
        const target = targetExplode.current;
        const diff = target - prev;
        if (Math.abs(diff) < 0.001) return target;
        return prev + diff * 0.06;
      });
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a1a] relative font-sans">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <FalconScene
          onModuleSelect={handleModuleSelect}
          explodeProgress={explodeProgress}
          selectedModuleIndex={selectedModuleIndex}
        />
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="pointer-events-auto">
            <h1 className="text-white text-2xl font-bold tracking-wider">
              <span className="text-blue-400">SpaceX</span> Falcon 9
            </h1>
            <p className="text-gray-400 text-sm tracking-wide">交互式3D结构拆解</p>
          </div>
          <div className="pointer-events-auto flex gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg backdrop-blur-sm border border-white/10 transition-all"
            >
              {showInfo ? '隐藏面板' : '显示面板'}
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-end justify-between px-6 py-4">
          {/* Explode Control */}
          <div className="pointer-events-auto flex flex-col gap-3">
            <button
              onClick={toggleExplode}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all backdrop-blur-sm border ${
                isExploded
                  ? 'bg-blue-500/30 border-blue-400/50 text-blue-200 shadow-lg shadow-blue-500/20'
                  : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isExploded ? '⊕ 组装' : '⊖ 拆解'}
            </button>
            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-3">
              <label className="text-gray-400 text-xs mb-1 block">拆解程度</label>
              <input
                type="range"
                min="0"
                max="100"
                value={explodeProgress * 100}
                onChange={(e) => {
                  const val = Number(e.target.value) / 100;
                  targetExplode.current = val;
                  setIsExploded(val > 0.5);
                }}
                className="w-40 h-1.5 appearance-none bg-white/20 rounded-full outline-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow-lg"
              />
            </div>
          </div>

          {/* Module Legend */}
          {showInfo && (
            <div className="pointer-events-auto bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4 max-w-xs">
              <h3 className="text-white text-sm font-medium mb-2">模块列表 (点击选择)</h3>
              <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                {MODULE_LIST.map((mod, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedModuleIndex(idx);
                      // Create a mock module for display
                      const mockModule: RocketModule = {
                        name: mod.name,
                        nameCN: mod.nameCN,
                        description: getModuleDescription(idx),
                        mesh: null as any,
                        basePosition: null as any,
                        explodeOffset: null as any,
                        color: parseInt(mod.color.replace('#', ''), 16),
                      };
                      setSelectedModule(mockModule);
                    }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-all ${
                      selectedModuleIndex === idx
                        ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                        : 'hover:bg-white/5 text-gray-300 border border-transparent'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20"
                      style={{ backgroundColor: mod.color }}
                    />
                    <span className="truncate">{mod.nameCN}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Module Info Panel */}
      {selectedModule && showInfo && (
        <div className="absolute top-20 right-6 z-10 w-72 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                {selectedModule.nameCN}
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">{selectedModule.name}</p>
            </div>
            <button
              onClick={() => {
                setSelectedModule(null);
                setSelectedModuleIndex(null);
              }}
              className="text-gray-500 hover:text-white transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-blue-500/50 to-transparent mb-3" />
          <p className="text-gray-300 text-sm leading-relaxed">
            {selectedModule.description}
          </p>
          {selectedModuleIndex !== null && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">模块编号</span>
              <span className="text-xs text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">
                {String(selectedModuleIndex + 1).padStart(2, '0')} / 09
              </span>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-20 left-6 z-10 pointer-events-none">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-3 text-xs text-gray-500 space-y-1">
          <p>🖱️ 拖拽旋转 | 滚轮缩放</p>
          <p>👆 点击模块查看详情</p>
          <p>⊖ 拆解/组装查看结构</p>
        </div>
      </div>

      {/* Rocket Stats */}
      {showInfo && (
        <div className="absolute top-48 left-6 z-10 pointer-events-none">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-3 text-xs space-y-2">
            <h4 className="text-gray-400 font-medium">Falcon 9 参数</h4>
            <div className="space-y-1">
              <StatRow label="高度" value="70 m" />
              <StatRow label="直径" value="3.7 m" />
              <StatRow label="起飞质量" value="605 t" />
              <StatRow label="LEO运力" value="22.8 t" />
              <StatRow label="GTO运力" value="8.3 t" />
              <StatRow label="一级推力" value="7,607 kN" />
              <StatRow label="发动机" value="9×Merlin 1D" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-mono">{value}</span>
    </div>
  );
}

function getModuleDescription(index: number): string {
  const descriptions = [
    '保护卫星/飞船免受气动加热和声学振动。由两半组成，在入轨后分离。高度约6.8m，直径3.7m。',
    '二级液氧贮箱，储存液态氧（LOX）作为氧化剂。在真空环境下为Merlin真空发动机提供推进剂。',
    '二级RP-1（火箭级煤油）贮箱。与液氧贮箱共同组成二级推进系统。',
    '二级Merlin Vacuum发动机，专为真空环境优化。喷口面积大，比冲348秒。提供二级全部推力。',
    '连接一级和二级的结构件。内含分离推杆和12个气动分离系统。一级关机后，级间段分离暴露二级发动机。',
    '一级液氧贮箱，储存约123吨液态氧。采用过冷推进剂以增加密度，提高运载能力。',
    '一级RP-1煤油贮箱，储存约287吨火箭级煤油。与液氧箱共同组成一级推进系统。',
    'Octaweb推力结构，搭载9台Merlin 1D发动机。每台海平面推力845kN，总推力7,607kN。采用冗余设计，可关闭部分发动机仍完成任务。',
    '4个钛合金栅格翼，用于一级回收时的气动控制。在再入大气层时提供精确的姿态控制和着陆精度。',
  ];
  return descriptions[index] || '';
}

export default App;
