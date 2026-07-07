import React from 'react';
import { Navigation, Activity, X } from 'lucide-react';

export function Tasks({ config }: { config?: any }) {
  return (
    <div className="flex flex-col min-h-0 h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <h3 className="text-[15px] font-bold text-gray-800">正在执行的任务</h3>
        <span className="text-gray-500 text-sm">(2)</span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-2">
        {/* Task 1 */}
        <div className="bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-xl p-4 flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-gray-800 mb-2">[移动]前往充电点充电</div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">运行中</span>
                <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">来源于天工</span>
              </div>
            </div>
          </div>
          <button className="w-full py-2 bg-[#b92b36] hover:bg-[#a0222d] text-white rounded-lg text-[13px] font-medium flex items-center justify-center gap-1 transition-colors">
            <X className="w-4 h-4" />
            取消
          </button>
        </div>

        {/* Task 2 */}
        <div className="bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-xl p-4 flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-gray-800 mb-2">[移动]前往目标点位</div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">运行中</span>
                <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">来源于百川</span>
              </div>
            </div>
          </div>
          <button className="w-full py-2 bg-[#b92b36] hover:bg-[#a0222d] text-white rounded-lg text-[13px] font-medium flex items-center justify-center gap-1 transition-colors">
            <X className="w-4 h-4" />
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
