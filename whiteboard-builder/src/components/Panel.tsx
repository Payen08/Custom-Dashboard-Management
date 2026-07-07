import React from 'react';
import { RobotStatus } from './widgets/RobotStatus';
import { Tasks } from './widgets/Tasks';
import { Map3D } from './widgets/Map3D';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  w?: number;
  h?: number;
  type?: string;
  config?: any;
  selected?: boolean;
  isPreview?: boolean;
  onRemove: () => void;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(({ id, w, h, type, config, selected, isPreview, onRemove, style, className, children, ...rest }, ref) => {
  const renderContent = () => {
    switch (type) {
      case 'robot-status':
        return <RobotStatus config={config} />;
      case 'tasks':
        return <Tasks config={config} />;
      case 'map-3d':
        return <Map3D config={config} />;
      default:
        return (
          <div className="flex-1 p-4 flex items-center justify-center text-[24px] font-bold text-[#d1d5db]">
             {w && h ? `${w}x${h}` : 'Widget'}
          </div>
        );
    }
  };

  return (
    <div 
      ref={ref} 
      style={style} 
      className={`bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border ${selected ? 'border-[#0066cc] ring-2 ring-[#0066cc]/20' : 'border-transparent'} ${!isPreview ? 'hover:border-[#0066cc]/50 cursor-pointer' : ''} flex flex-col group transition-all duration-200 overflow-hidden ${className || ''}`} 
      {...rest}
    >
      {!isPreview && (
        <div className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onMouseDown={(e) => e.stopPropagation()} 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="text-gray-400 hover:text-[#ff3b30] bg-white/80 backdrop-blur shadow-sm hover:bg-red-50 w-6 h-6 flex items-center justify-center rounded-full transition-colors text-[14px] leading-none"
            title="Remove Panel"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className={`flex-1 p-5 ${!isPreview ? 'panel-drag-handle cursor-grab active:cursor-grabbing' : ''} flex flex-col min-h-0 overflow-hidden pointer-events-none`}>
        <div className="pointer-events-auto h-full flex flex-col min-h-0 w-full">
          {renderContent()}
        </div>
      </div>
      
      {children}
    </div>
  );
});
Panel.displayName = 'Panel';
