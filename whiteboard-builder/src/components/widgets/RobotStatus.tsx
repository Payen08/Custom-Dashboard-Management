import React from 'react';
import { User, Clock, CheckSquare, TrendingUp, Settings, Cpu, Grip, Video, Disc, Wifi, ToggleLeft } from 'lucide-react';

export function RobotStatus({ config = {} }: { config?: any }) {
  const metrics = [
    { icon: User, value: '11.45', unit: 'km', label: '今日里程' },
    { icon: Clock, value: '4.2', unit: 'h', label: '运行时长' },
    { icon: CheckSquare, value: '88', unit: '%', label: '任务完成率' },
    { icon: TrendingUp, value: '0.8', unit: 'm/s', label: '平均速度' },
  ];

  const components = [
    { icon: Settings, label: '底盘', key: 'showChassis' },
    { icon: Cpu, label: '机械臂', key: 'showArm' },
    { icon: Grip, label: '夹爪', key: 'showGripper' },
    { icon: Video, label: '相机', key: 'showCamera' },
    { icon: Disc, label: '激光雷达', key: 'showLidar' },
    { icon: Wifi, label: '通讯模块', key: 'showComm' },
    { icon: ToggleLeft, label: 'I/O模块', key: 'showIO' },
  ];

  const visibleComponents = components.filter(c => config[c.key] !== false);

  return (
    <div className="flex flex-col min-h-0 h-full overflow-hidden">
      <div className="grid grid-cols-4 gap-2 mb-6 shrink-0">
        {metrics.map((m, i) => (
          <div key={i} className="flex flex-col items-center justify-center relative">
            <m.icon className="w-4 h-4 text-gray-400 mb-2" />
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-gray-800">{m.value}</span>
              <span className="text-[10px] text-gray-500">{m.unit}</span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1">{m.label}</span>
            {i !== metrics.length - 1 && (
              <div className="absolute right-0 top-1/4 h-1/2 w-px bg-gray-100"></div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-1">
        {visibleComponents.map((c, i) => (
          <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <c.icon className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
              <span className="text-[14px] text-gray-700">{c.label}</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-[11px] text-green-700 font-medium tracking-wide">正常</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
