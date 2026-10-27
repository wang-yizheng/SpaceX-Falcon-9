import { useState, useCallback, useRef, useEffect } from 'react';
import FalconScene from './components/FalconScene';
import { RocketModule } from './utils/rocket';

const MODULE_LIST = [
  { name: 'Payload Fairing', nameCN: '有效载荷整流罩', color: '#ffffff', icon: '🔺' },
  { name: 'Second Stage LOX Tank', nameCN: '二级液氧贮箱', color: '#e8f0f8', icon: '💧' },
  { name: 'Second Stage RP-1 Tank', nameCN: '二级煤油贮箱', color: '#f0f0f0', icon: '🛢️' },
  { name: 'Merlin Vacuum Engine', nameCN: 'Merlin真空发动机', color: '#555555', icon: '🔥' },
  { name: 'Interstage', nameCN: '级间段', color: '#333333', icon: '🔗' },
  { name: 'First Stage LOX Tank', nameCN: '一级液氧贮箱', color: '#e0e8f0', icon: '💧' },
  { name: 'First Stage RP-1 Tank', nameCN: '一级煤油贮箱', color: '#e8e8e8', icon: '🛢️' },
  { name: 'Engine Section (9x Merlin)', nameCN: '发动机舱 (Octaweb)', color: '#444444', icon: '🚀' },
  { name: 'Grid Fins', nameCN: '栅格翼', color: '#555555', icon: '✦' },
];

function App() {
  const [selectedModule, setSelectedModule] = useState<RocketModule | null>(null);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const [selectedSubIdx, setSelectedSubIdx] = useState<number | null>(null);
  const [explodeProgress, setExplodeProgress] = useState(0);
  const [isExploded, setIsExploded] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const animRef = useRef<number>(0);
  const targetExplode = useRef(0);

  const handleModuleSelect = useCallback((module: RocketModule | null) => {
    setSelectedModule(module);
    setSelectedSubIdx(null);
    if (module) {
      const idx = MODULE_LIST.findIndex((m) => m.name === module.name);
      setSelectedModuleIndex(idx >= 0 ? idx : null);
    } else {
      setSelectedModuleIndex(null);
    }
  }, []);

  const toggleExplode = useCallback(() => {
    // Cycle: 0% -> 100% -> 200% -> 0%
    const current = targetExplode.current;
    let next: number;
    if (current < 0.5) {
      next = 1;
    } else if (current < 1.5) {
      next = 2;
    } else {
      next = 0;
    }
    targetExplode.current = next;
    setIsExploded(next > 0.5);
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
    <div className="w-screen h-screen overflow-hidden bg-[#050510] relative font-sans">
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
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="pointer-events-auto">
            <h1 className="text-white text-xl sm:text-2xl font-bold tracking-wider flex items-center gap-2">
              <span className="text-blue-400">SpaceX</span>
              <span className="text-gray-400 font-light">|</span>
              <span>Falcon 9</span>
            </h1>
            <p className="text-gray-500 text-xs tracking-wide mt-0.5">
              Interactive 3D Teardown · 交互式3D结构拆解
            </p>
          </div>
          <div className="pointer-events-auto flex gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-white text-xs rounded-lg backdrop-blur-md border border-white/10 transition-all"
            >
              {showInfo ? '◉ 隐藏面板' : '○ 显示面板'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-end justify-between px-4 sm:px-6 py-4 gap-4">
          {/* Explode Controls */}
          <div className="pointer-events-auto flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={toggleExplode}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all backdrop-blur-md border ${
                isExploded
                  ? 'bg-blue-500/20 border-blue-400/40 text-blue-200 shadow-lg shadow-blue-500/10'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/15'
              }`}
            >
              {explodeProgress < 0.5 ? '⊖ 拆解' : explodeProgress < 1.5 ? '⊘ 展示内部' : '⊕ 组装复位'}
            </button>
            <div className="bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-gray-400 text-[10px] uppercase tracking-wider">拆解程度</label>
                <span className="text-blue-400 text-[10px] font-mono">{Math.round(explodeProgress * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={explodeProgress * 100}
                onChange={(e) => {
                  const val = Number(e.target.value) / 100;
                  targetExplode.current = val;
                  setIsExploded(val > 0.5);
                }}
                className="w-32 sm:w-40 h-1.5 rounded-full outline-none cursor-pointer"
              />
              <div className="flex justify-between mt-1.5 text-[9px] text-gray-600">
                <span>组装</span>
                <span>分离</span>
                <span>内部结构</span>
              </div>
            </div>
          </div>

          {/* Module List */}
          {showInfo && (
            <div className="pointer-events-auto bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-3 max-w-[280px] hidden sm:block">
              <h3 className="text-white text-xs font-medium mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                9大模块 · 点击选择
              </h3>
              <div className="grid grid-cols-1 gap-0.5 max-h-52 overflow-y-auto pr-1">
                {MODULE_LIST.map((mod, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedModuleIndex(idx);
                      setSelectedSubIdx(null);
                      const mockModule: RocketModule = {
                        name: mod.name,
                        nameCN: mod.nameCN,
                        description: getModuleDescription(idx),
                        mesh: null as any,
                        basePosition: null as any,
                        explodeOffset: null as any,
                        subModules: getSubModules(idx),
                        color: parseInt(mod.color.replace('#', ''), 16),
                      };
                      setSelectedModule(mockModule);
                    }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[11px] transition-all ${
                      selectedModuleIndex === idx
                        ? 'bg-blue-500/15 text-blue-200 border border-blue-400/20'
                        : 'hover:bg-white/5 text-gray-400 border border-transparent'
                    }`}
                  >
                    <span className="text-[10px] w-4 text-center">{mod.icon}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/20"
                      style={{ backgroundColor: mod.color }}
                    />
                    <span className="truncate">{mod.nameCN}</span>
                    <span className="text-[9px] text-gray-600 ml-auto font-mono">{String(idx + 1).padStart(2, '0')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Module Info Panel (right side) */}
      {selectedModule && showInfo && (
        <div className="absolute top-16 right-4 sm:right-6 z-10 w-64 sm:w-72 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-white font-bold text-base leading-tight">
                  {selectedModule.nameCN}
                </h2>
                <p className="text-gray-500 text-[10px] mt-0.5 font-mono">{selectedModule.name}</p>
              </div>
              <button
                onClick={() => { setSelectedModule(null); setSelectedModuleIndex(null); setSelectedSubIdx(null); }}
                className="text-gray-600 hover:text-white transition-colors text-lg leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
              >
                ×
              </button>
            </div>
            {selectedModuleIndex !== null && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] text-gray-600 uppercase tracking-wider">Module</span>
                <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">
                  {String(selectedModuleIndex + 1).padStart(2, '0')} / 09
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/20 to-transparent" />

          {/* Description */}
          <div className="p-4 pt-3">
            <p className="text-gray-300 text-xs leading-relaxed">
              {selectedModule.description}
            </p>
          </div>

          {/* Sub-modules */}
          {selectedModule.subModules && selectedModule.subModules.length > 0 && (
            <>
              <div className="mx-4 h-px bg-white/5" />
              <div className="p-4 pt-3">
                <h4 className="text-gray-400 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-blue-400 rounded-full" />
                  内部结构详情
                  {explodeProgress >= 1.5 && (
                    <span className="ml-auto text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      已展示
                    </span>
                  )}
                </h4>
                <div className="space-y-1">
                  {selectedModule.subModules.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSubIdx(selectedSubIdx === idx ? null : idx)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition-all ${
                        selectedSubIdx === idx
                          ? 'bg-blue-500/20 text-blue-200 border border-blue-400/20'
                          : 'hover:bg-white/5 text-gray-400 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-gray-600">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="font-medium">{sub.nameCN}</span>
                        <span className="ml-auto text-[9px] text-gray-600">{sub.name}</span>
                      </div>
                      {selectedSubIdx === idx && (
                        <div className="mt-1.5 pl-5 space-y-1">
                          <p className="text-[10px] text-gray-400 leading-relaxed">
                            {sub.description}
                          </p>
                          {explodeProgress < 1.5 && (
                            <p className="text-[9px] text-amber-400/70 italic">
                              💡 拆解至200%可查看此结构
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions + Phase Indicator */}
      <div className="absolute top-16 left-4 sm:left-6 z-10 pointer-events-none space-y-2">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-3 text-[10px] text-gray-600 space-y-1">
          <p>🖱️ 拖拽旋转 · 滚轮缩放</p>
          <p>👆 点击模块查看详情</p>
          <p>⊖ 拆解 → 展示内部结构</p>
        </div>
        {/* Phase indicator */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-3 text-[10px]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${explodeProgress < 0.5 ? 'bg-green-400' : 'bg-green-400/30'}`} />
            <span className={explodeProgress < 0.5 ? 'text-green-400' : 'text-gray-600'}>组装</span>
          </div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${explodeProgress >= 0.5 && explodeProgress < 1.5 ? 'bg-blue-400' : 'bg-blue-400/30'}`} />
            <span className={explodeProgress >= 0.5 && explodeProgress < 1.5 ? 'text-blue-400' : 'text-gray-600'}>模块分离</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${explodeProgress >= 1.5 ? 'bg-amber-400' : 'bg-amber-400/30'}`} />
            <span className={explodeProgress >= 1.5 ? 'text-amber-400' : 'text-gray-600'}>内部结构</span>
          </div>
          {explodeProgress >= 1.5 && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <p className="text-[9px] text-amber-400/80 leading-relaxed">
                ✨ 外壳已淡出<br/>
                内部结构完全可见
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rocket Stats */}
      {showInfo && (
        <div className="absolute top-40 sm:top-48 left-4 sm:left-6 z-10 pointer-events-none hidden md:block">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/5 p-3 text-[10px] space-y-1.5">
            <h4 className="text-gray-500 font-medium text-[10px] uppercase tracking-wider">Falcon 9 Specs</h4>
            <div className="space-y-0.5">
              <StatRow label="高度" value="70 m" />
              <StatRow label="直径" value="3.7 m" />
              <StatRow label="起飞质量" value="605 t" />
              <StatRow label="LEO运力" value="22.8 t" />
              <StatRow label="GTO运力" value="8.3 t" />
              <StatRow label="一级推力" value="7,607 kN" />
              <StatRow label="发动机" value="9×Merlin 1D" />
              <StatRow label="一级比冲" value="282 s" />
              <StatRow label="二级比冲" value="348 s" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-400 font-mono">{value}</span>
    </div>
  );
}

function getModuleDescription(index: number): string {
  const descriptions = [
    '碳纤维/铝蜂窝夹层结构，保护载荷免受气动加热和声振。两半铰接分离，内衬蜂窝吸能结构。配备4个气动推杆和分离铰链。',
    '铝锂合金焊接贮箱，储存过冷液氧（-196°C）。内设4道防荡板，中心供液管路，配备液位传感器和增压系统接口。',
    '铝锂合金贮箱，储存RP-1火箭级煤油。内设3道防荡板和氦气增压瓶，底部配备主出口阀。',
    '二级专用Merlin 1D Vacuum，大面积喷管（膨胀比165:1），比冲348s。采用烧蚀冷却+再生冷却组合方案，涡轮泵转速>20000rpm。',
    '碳纤维复合材料结构，连接一级和二级。内装12个分离锁紧机构和6个气动推杆。配备3组线缆通道用于级间信号传输。',
    '储存约123吨过冷液氧。采用共底结构与RP-1箱分隔，内设6道防荡板。底部配备吸液蓄能器和3个预冷阀。外覆MLI隔热层。',
    '储存约287吨RP-1煤油。内设5道防荡板和3个氦气增压瓶。底部配备大口径出口阀，通过主供液管向9台发动机供燃料。',
    'Octaweb集成推力结构，搭载9台Merlin 1D发动机（8+1布局）。每台推力845kN，总推力7,607kN。配备LOX/燃料双歧管、热防护罩。冗余设计可关闭2台发动机仍完成任务。',
    '4个可折叠钛合金栅格翼，用于一级回收再入气动控制。每个翼面由精密钛合金格栅构成，配备独立液压伺服驱动器，提供俯仰/偏航/滚转控制。',
  ];
  return descriptions[index] || '';
}

function getSubModules(index: number) {
  const allSubs = [
    // 0: Fairing
    [
      { name: 'Outer Shell', nameCN: '外壳体', description: '碳纤维面板+铝蜂窝芯夹层结构，厚度约25mm，承受气动载荷和声振环境' },
      { name: 'Inner Stiffeners', nameCN: '纵向加强筋', description: '12根纵向承力筋条，提供结构刚度和载荷传递路径' },
      { name: 'Separation Hinges', nameCN: '分离铰链', description: '两半整流罩的铰接机构，允许展开分离后安全脱离' },
      { name: 'Pneumatic Pushers', nameCN: '气动推杆', description: '4个分离推杆，提供初始分离速度，确保整流罩安全脱离' },
      { name: 'Payload Adapter', nameCN: '载荷适配器', description: '与卫星/飞船对接的标准接口环，传递载荷和信号' },
    ],
    // 1: S2 LOX
    [
      { name: 'Tank Shell', nameCN: '箱体外壁', description: '铝锂合金2195，摩擦搅拌焊接，承受低温液氧环境（-196°C）' },
      { name: 'Anti-slosh Baffles', nameCN: '防荡板', description: '4道环形挡板，抑制推进剂晃动，保持飞行稳定性' },
      { name: 'Feed Line', nameCN: '供液管路', description: '中心主供液管，直径约150mm，通向Merlin真空发动机' },
      { name: 'Pressurization System', nameCN: '增压系统', description: '氦气增压管路，维持箱内压力，确保发动机稳定供液' },
      { name: 'Level Sensors', nameCN: '液位传感器', description: '3个电容式液位探头，实时监测液氧液位' },
    ],
    // 2: S2 RP-1
    [
      { name: 'Tank Shell', nameCN: '箱体外壁', description: '铝锂合金结构，储存RP-1火箭级煤油' },
      { name: 'Baffles', nameCN: '防荡板', description: '3道防晃挡板，抑制煤油晃动' },
      { name: 'He Pressurization Bottle', nameCN: '氦气增压瓶', description: '复合材料缠绕COPV气瓶，提供箱内增压' },
      { name: 'Outlet Valve', nameCN: '出口阀', description: '主燃料出口阀，控制煤油流向发动机' },
    ],
    // 3: Merlin Vacuum
    [
      { name: 'Gimbal Mount', nameCN: '万向节支架', description: '双向摆动±6°，控制飞行姿态，配备液压伺服作动器' },
      { name: 'Combustion Chamber', nameCN: '燃烧室', description: '镍合金铸造，内嵌再生冷却通道，工作温度3300K' },
      { name: 'Injector Plate', nameCN: '喷注器', description: '同轴离心式喷注单元阵列，确保燃料和氧化剂充分混合' },
      { name: 'Nozzle Bell', nameCN: '喷管', description: '大面积比烧蚀喷管，膨胀比165:1，优化真空性能' },
      { name: 'Turbopump', nameCN: '涡轮泵', description: '离心泵+轴流涡轮，转速>20000rpm，提供高压推进剂' },
      { name: 'Gas Generator', nameCN: '燃气发生器', description: '富燃预燃室，产生燃气驱动涡轮，废气从侧面排出' },
    ],
    // 4: Interstage
    [
      { name: 'Composite Shell', nameCN: '复合材料壳体', description: '碳纤维缠绕+蜂窝夹层，轻质高强结构' },
      { name: 'Separation Collets', nameCN: '分离锁紧机构', description: '12个爆炸螺栓/锁紧器，确保一级二级可靠分离' },
      { name: 'Pneumatic Pushers', nameCN: '气动推杆', description: '6个弹簧/气动分离推杆，提供分离初速度' },
      { name: 'Structural Columns', nameCN: '承力柱', description: '8根纵向承力柱，传递推力和弯矩载荷' },
      { name: 'Wiring Harness', nameCN: '线缆通道', description: '3组级间信号/电力线缆，传输控制指令和传感器数据' },
    ],
    // 5: F1 LOX
    [
      { name: 'Tank Shell', nameCN: '箱体外壁', description: '铝锂合金，薄壁整体环焊，储存123吨过冷液氧' },
      { name: 'Common Bulkhead', nameCN: '共底', description: '与RP-1箱共享的凹形隔底，节省结构重量' },
      { name: 'Anti-slosh Baffles', nameCN: '防荡板', description: '6道环形挡板，抑制液氧晃动' },
      { name: 'Main Feed Line', nameCN: '主供液管', description: '大口径中心供液管路，向9台发动机供液' },
      { name: 'Chill Valves', nameCN: '预冷阀', description: '3个发动机预冷排放阀，发射前排空管路冷气' },
      { name: 'MLI Insulation', nameCN: 'MLI隔热层', description: '多层反射隔热毯，减少液氧气化损失' },
    ],
    // 6: F1 RP-1
    [
      { name: 'Tank Shell', nameCN: '箱体外壁', description: '铝锂合金结构，储存287吨RP-1煤油' },
      { name: 'Common Bulkhead', nameCN: '共底（上）', description: '与LOX箱共享的凸形隔底，优化结构效率' },
      { name: 'He Bottles', nameCN: '氦气瓶', description: '3个COPV复合气瓶，提供箱内增压气体' },
      { name: 'Baffles', nameCN: '防荡板', description: '5道防晃结构，保持飞行稳定性' },
      { name: 'Outlet Valve', nameCN: '主出口阀', description: '大口径燃料出口，向发动机供应煤油' },
    ],
    // 7: Engine Section
    [
      { name: 'Octaweb Structure', nameCN: 'Octaweb推力结构', description: '集成式推力承载框架，简化管路布局，提高可靠性' },
      { name: '9x Merlin Engines', nameCN: '9台Merlin 1D', description: '8+1布局，每台845kN海平面推力，总推力7,607kN' },
      { name: 'LOX Manifold', nameCN: 'LOX歧管', description: '环形氧化剂分配器，均匀分配液氧至各发动机' },
      { name: 'Fuel Manifold', nameCN: '燃料歧管', description: '燃料分配环管，确保煤油供应稳定' },
      { name: 'Heat Shield', nameCN: '热防护罩', description: '底部防热裙板，保护结构免受发动机热辐射' },
    ],
    // 8: Grid Fins
    [
      { name: 'Titanium Lattice', nameCN: '钛合金格栅', description: '精密铸造钛合金网格翼面，耐高温耐腐蚀，提供精确气动控制' },
      { name: 'Hinge Mechanism', nameCN: '铰链机构', description: '折叠/展开铰链，发射时折叠贴附箭体，再入时展开' },
      { name: 'Hydraulic Actuator', nameCN: '液压驱动器', description: '独立伺服液压缸，快速响应控制指令，调整翼面角度' },
      { name: 'Mounting Ring', nameCN: '安装环', description: '与箭体连接的承载环，传递气动载荷至箭体结构' },
    ],
  ];
  return allSubs[index] || [];
}

export default App;
