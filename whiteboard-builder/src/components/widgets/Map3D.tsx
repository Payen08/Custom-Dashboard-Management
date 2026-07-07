import React from 'react';
import { Maximize2, Settings2 } from 'lucide-react';

export function Map3D({ config }: { config?: any }) {
  return (
    <div className="flex flex-col min-h-0 h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-[15px] font-bold text-gray-800">实时地图与机器人状态</h3>
        <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 bg-[#1a1c1e] rounded-xl relative overflow-hidden flex items-center justify-center">
        {/* Mock 3D Grid Background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', 
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg) scale(2)',
            transformOrigin: 'center 80%'
          }}
        ></div>

        {/* Mock Robot Arm Graphic */}
        <div className="relative z-10 w-48 h-48 opacity-80 flex flex-col items-center justify-end drop-shadow-2xl">
           <div className="w-32 h-16 bg-white rounded-t-lg relative border-b-8 border-gray-300">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-24 bg-gray-200 -translate-y-full origin-bottom rotate-12 rounded-t flex items-start justify-center">
                <div className="w-6 h-32 bg-[#4285f4] -translate-y-[90%] origin-bottom -rotate-45 rounded flex items-start justify-center">
                   <div className="w-12 h-8 bg-[#1a73e8] -translate-y-full rounded flex items-center justify-center gap-1">
                      <div className="w-2 h-4 bg-gray-800 rounded-b"></div>
                      <div className="w-2 h-4 bg-gray-800 rounded-b"></div>
                   </div>
                </div>
             </div>
           </div>
        </div>

        {/* Top Left Buttons */}
        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <button className="px-3 py-1.5 bg-gray-800/60 hover:bg-gray-700 text-green-400 text-[12px] font-medium rounded border border-gray-600/50 backdrop-blur-sm transition-colors">上电</button>
          <button className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-[12px] font-medium rounded border border-green-500/30 backdrop-blur-sm transition-colors">使能</button>
        </div>

        {/* Top Right Config */}
        <div className="absolute top-4 right-4 z-20">
          <button className="w-10 h-10 bg-gray-800/60 hover:bg-gray-700 text-gray-300 rounded border border-gray-600/50 backdrop-blur-sm flex flex-col items-center justify-center gap-0.5 transition-colors">
            <Settings2 className="w-4 h-4" />
            <span className="text-[9px]">配置</span>
          </button>
        </div>

        {/* Bottom Left Coordinates */}
        <div className="absolute bottom-4 left-4 z-20 text-[10px] font-mono text-gray-400 leading-relaxed">
          <div>J1 0.000000</div>
          <div>J2 -1.570796</div>
          <div>J3 2.356194</div>
          <div className="mt-2 text-gray-500">X / Y / Z</div>
          <div className="text-gray-300">1.2541 / 3.4215 / 0.5214</div>
        </div>
      </div>
    </div>
  );
}
