import React from 'react';

const MODULE_GROUPS = [
  {
    title: '业务组件 (BUSINESS)',
    modules: [
      { type: 'robot-status', label: '机器人状态', w: 3, h: 7 },
      { type: 'map-3d', label: '实时地图', w: 6, h: 5 },
      { type: 'tasks', label: '任务列表', w: 3, h: 7 },
    ]
  },
  {
    title: '布局组件 (LAYOUT)',
    modules: [
      { type: 'empty-2x2', label: '空白方块 (2x2)', w: 2, h: 2 },
      { type: 'empty-4x2', label: '空白长条 (4x2)', w: 4, h: 2 },
    ]
  }
];

export function Sidebar({ onDragStart }: { onDragStart: (e: React.DragEvent<HTMLDivElement>, item: { w: number, h: number, type: string }) => void }) {
  return (
    <div className="w-[280px] bg-[#ffffff] border-r border-[#e5e7eb] flex flex-col h-full shrink-0 z-10 relative overflow-y-auto">
      <div className="p-6 flex flex-col gap-8">
        {MODULE_GROUPS.map((group, idx) => (
          <div key={idx}>
            <div className="text-[11px] font-bold text-[#86868b] uppercase tracking-[1px] mb-4">{group.title}</div>
            <div className="grid grid-cols-2 gap-4">
              {group.modules.map((mod) => (
                <div
                  key={mod.type}
                  draggable
                  unselectable="on"
                  onDragStart={(e) => onDragStart(e, mod)}
                  className="bg-white border-[1.5px] border-dashed border-[#d1d5db] rounded-[10px] flex flex-col items-center justify-center p-4 cursor-grab active:cursor-grabbing hover:border-[#3b82f6] hover:bg-[#eff6ff] transition-all group aspect-square shadow-sm"
                >
                  <div className="bg-[#e5e7eb] rounded-[4px] mb-3 group-hover:bg-[#93c5fd] transition-colors" style={{ width: Math.min(mod.w * 14, 50), height: Math.min(mod.h * 14, 50) }}></div>
                  <div className="text-[12px] text-[#4b5563] font-medium pointer-events-none text-center leading-tight">
                    {mod.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
