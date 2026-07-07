import React from 'react';
import { PanelItem } from '../types';

interface RightSidebarProps {
  selectedPanel: PanelItem | null;
  updateConfig: (config: any) => void;
  updateSize: (w: number, h: number) => void;
}

export function RightSidebar({ selectedPanel, updateConfig, updateSize }: RightSidebarProps) {
  const renderConfig = () => {
    if (!selectedPanel) {
      return (
        <div className="text-[13px] text-gray-500 text-center py-8 border border-dashed border-gray-200 rounded-lg">
          选中面板以配置内容
        </div>
      );
    }

    const renderSizeControls = () => (
      <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-gray-100">
        <div className="text-[12px] font-semibold text-gray-800">尺寸 (Size)</div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[11px] text-gray-500">宽度 (W)</label>
            <input 
              type="number" 
              min={1} 
              max={12} 
              value={selectedPanel.w} 
              onChange={e => updateSize(parseInt(e.target.value) || selectedPanel.w, selectedPanel.h)}
              className="border border-gray-200 rounded px-2 py-1.5 text-[13px] w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[11px] text-gray-500">高度 (H)</label>
            <input 
              type="number" 
              min={1} 
              value={selectedPanel.h} 
              onChange={e => updateSize(selectedPanel.w, parseInt(e.target.value) || selectedPanel.h)}
              className="border border-gray-200 rounded px-2 py-1.5 text-[13px] w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    );

    if (selectedPanel.type === 'robot-status') {
      const config = selectedPanel.config || {};
      const toggles = [
        { key: 'showChassis', label: '底盘' },
        { key: 'showArm', label: '机械臂' },
        { key: 'showGripper', label: '夹爪' },
        { key: 'showCamera', label: '相机' },
        { key: 'showLidar', label: '激光雷达' },
        { key: 'showComm', label: '通讯模块' },
        { key: 'showIO', label: 'I/O模块' },
      ];

      return (
        <div className="flex flex-col">
          {renderSizeControls()}
          <div className="flex flex-col gap-4">
            <div className="text-[12px] font-semibold text-gray-800 mb-2">组件显隐 (Components)</div>
            
            <div className="flex flex-col gap-3">
              {toggles.map(t => {
                const isActive = config[t.key] !== false;
                return (
                  <label key={t.key} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[13px] text-gray-700">{t.label}</span>
                    <div className={`w-9 h-5 rounded-full transition-colors relative ${isActive ? 'bg-[#34c759]' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isActive} 
                        onChange={(e) => updateConfig({ [t.key]: e.target.checked })} 
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {renderSizeControls()}
        <div className="text-[13px] text-gray-500 text-center py-8 border border-dashed border-gray-200 rounded-lg">
          此组件暂无配置项
        </div>
      </div>
    );
  };

  return (
    <div className="w-[280px] bg-[#ffffff] border-l border-[#e5e7eb] flex flex-col h-full shrink-0 z-10 relative overflow-y-auto">
      <div className="p-6 flex flex-col gap-8">
        <div>
          <div className="text-[11px] font-bold text-[#86868b] uppercase tracking-[1px] mb-4">内容配置</div>
          {renderConfig()}
        </div>

        <div>
          <div className="text-[11px] font-bold text-[#86868b] uppercase tracking-[1px] mb-4">LAYOUT PROPERTIES</div>
          <div className="text-[13px] flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[#86868b]">Grid Columns</span>
              <span className="text-[#1d1d1f] font-semibold bg-gray-50 px-2 py-1 rounded">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#86868b]">Gap Spacing</span>
              <span className="text-[#1d1d1f] font-semibold bg-gray-50 px-2 py-1 rounded">24px</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#86868b]">Snap to Grid</span>
              <span className="text-[#34c759] font-semibold bg-green-50 px-2 py-1 rounded">ON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
