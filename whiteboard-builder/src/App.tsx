import React, { useState } from 'react';
import RGL, { Layout, LayoutItem } from 'react-grid-layout/legacy';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { Panel } from './components/Panel';
import { PanelItem } from './types';

export default function App() {
  const [panels, setPanels] = useState<PanelItem[]>([
    { i: 'panel-robot-status', x: 0, y: 0, w: 3, h: 7, type: 'robot-status', config: { showChassis: true, showArm: true, showGripper: true, showCamera: true, showLidar: true, showComm: true, showIO: true } },
    { i: 'panel-map-3d', x: 3, y: 0, w: 6, h: 5, type: 'map-3d' },
    { i: 'panel-tasks', x: 9, y: 0, w: 3, h: 7, type: 'tasks' },
  ]);
  const [droppingItem, setDroppingItem] = useState<LayoutItem>({ i: '__dropping-elem__', w: 1, h: 1, x: -1, y: -1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  
  const handleDragStart = (e: React.DragEvent, item: { w: number, h: number, type: string }) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    setDroppingItem({ i: '__dropping-elem__', w: item.w, h: item.h, x: -1, y: -1 });
  };

  const onDrop = (newLayout: Layout, layoutItem: LayoutItem, e: Event) => {
    e.preventDefault();
    const dragEvent = e as unknown as DragEvent;
    
    let itemData = { w: droppingItem.w, h: droppingItem.h, type: 'new' };
    if (dragEvent?.dataTransfer) {
      try {
        const data = dragEvent.dataTransfer.getData('text/plain');
        if (data) {
          itemData = JSON.parse(data);
        }
      } catch (err) {
        console.error("Failed to parse dropped data", err);
      }
    }
    
    const newId = `panel-${Date.now().toString()}`;
    const newPanel: PanelItem = {
      i: newId,
      x: layoutItem.x,
      y: layoutItem.y,
      w: itemData.w,
      h: itemData.h,
      type: itemData.type,
    };
    
    setPanels(prev => [...prev, newPanel]);
  };

  const onLayoutChange = (newLayout: Layout) => {
    setPanels(prev => prev.map(p => {
      const match = newLayout.find(l => l.i === p.i);
      if (match) {
        return { ...p, x: match.x, y: match.y, w: match.w, h: match.h };
      }
      return p;
    }));
  };
  
  const removePanel = (id: string) => {
    setPanels(prev => prev.filter(p => p.i !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updatePanelConfig = (id: string, newConfig: any) => {
    setPanels(prev => prev.map(p => p.i === id ? { ...p, config: { ...p.config, ...newConfig } } : p));
  };

  const updatePanelSize = (id: string, w: number, h: number) => {
    setPanels(prev => prev.map(p => p.i === id ? { ...p, w, h } : p));
  };

  const fillEmptySpaces = () => {
    let maxH = 0;
    panels.forEach(p => {
      if (p.y + p.h > maxH) {
        maxH = p.y + p.h;
      }
    });

    if (maxH === 0) return;

    let currentPanels = JSON.parse(JSON.stringify(panels)) as PanelItem[];
    let changed = true;

    while (changed) {
      changed = false;
      const grid = Array.from({ length: maxH }, () => Array(12).fill(false));
      
      currentPanels.forEach(p => {
        for (let y = p.y; y < p.y + p.h; y++) {
          for (let x = p.x; x < p.x + p.w; x++) {
            if (y < maxH && x < 12) {
              grid[y][x] = true;
            }
          }
        }
      });

      for (let p of currentPanels) {
        // Try expand right
        if (p.x + p.w < 12) {
          let canExpandRight = true;
          for (let y = p.y; y < p.y + p.h; y++) {
            if (grid[y][p.x + p.w]) {
              canExpandRight = false;
              break;
            }
          }
          if (canExpandRight) {
            p.w += 1;
            changed = true;
            break;
          }
        }

        // Try expand left
        if (p.x > 0) {
          let canExpandLeft = true;
          for (let y = p.y; y < p.y + p.h; y++) {
            if (grid[y][p.x - 1]) {
              canExpandLeft = false;
              break;
            }
          }
          if (canExpandLeft) {
            p.x -= 1;
            p.w += 1;
            changed = true;
            break;
          }
        }

        // Try expand bottom
        if (p.y + p.h < maxH) {
          let canExpandBottom = true;
          for (let x = p.x; x < p.x + p.w; x++) {
            if (grid[p.y + p.h][x]) {
              canExpandBottom = false;
              break;
            }
          }
          if (canExpandBottom) {
            p.h += 1;
            changed = true;
            break;
          }
        }

        // Try expand top
        if (p.y > 0) {
          let canExpandTop = true;
          for (let x = p.x; x < p.x + p.w; x++) {
            if (grid[p.y - 1][x]) {
              canExpandTop = false;
              break;
            }
          }
          if (canExpandTop) {
            p.y -= 1;
            p.h += 1;
            changed = true;
            break;
          }
        }
      }
    }

    setPanels(currentPanels);
  };

  return (
    <div className="flex h-screen w-full bg-[#f5f5f7] text-[#1d1d1f] font-sans overflow-hidden">
      {!isPreview && <Sidebar onDragStart={handleDragStart} />}
      
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {!isPreview && (
          <header className="h-16 bg-[#ffffff] border-b border-[#e5e7eb] flex items-center justify-between px-6 shrink-0">
             <div className="flex items-center gap-3">
               <h1 className="text-[18px] font-semibold">Dashboard Builder</h1>
               <span className="bg-[#f0f0f5] text-[#0066cc] text-[11px] px-2 py-0.5 rounded uppercase tracking-[0.5px]">Beta</span>
             </div>
             <div className="flex gap-3">
               <button onClick={fillEmptySpaces} className="px-4 py-2 border border-[#d1d5db] rounded-md bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">自动填补空白</button>
               <button onClick={() => { setSelectedId(null); setIsPreview(true); }} className="px-4 py-2 border border-[#d1d5db] rounded-md bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">Preview</button>
               <button className="px-5 py-2 bg-[#0066cc] hover:bg-[#0055aa] text-white border-none rounded-md text-[13px] font-medium cursor-pointer transition-colors">Save Layout</button>
             </div>
          </header>
        )}
        
        <div className={`flex-1 overflow-auto bg-[#e5e7eb] ${isPreview ? 'p-0' : 'p-8'}`} onClick={() => setSelectedId(null)}>
          <div className={`w-[1440px] mx-auto shrink-0 min-h-[900px] relative grid-bg bg-[#f5f5f7] ${isPreview ? '' : 'shadow-sm border border-[#d1d5db] rounded-xl'}`} style={{ padding: '32px' }}>
            <RGL
              className="layout"
              layout={panels}
              cols={12}
              rowHeight={60}
              width={1374}
              margin={[24, 24]}
              containerPadding={[0, 0]}
              isDroppable={!isPreview}
              isDraggable={!isPreview}
              isResizable={!isPreview}
              droppingItem={droppingItem}
              onDrop={onDrop}
              onLayoutChange={onLayoutChange}
              draggableHandle=".panel-drag-handle"
              compactType="vertical"
              useCSSTransforms={true}
            >
              {panels.map(p => (
                <Panel 
                  key={p.i} 
                  id={p.i} 
                  w={p.w}
                  h={p.h}
                  type={p.type}
                  config={p.config}
                  selected={selectedId === p.i}
                  isPreview={isPreview}
                  data-grid={{ x: p.x, y: p.y, w: p.w, h: p.h }} 
                  onRemove={() => removePanel(p.i)} 
                  onClick={(e) => {
                    if (!isPreview) {
                      e.stopPropagation();
                      setSelectedId(p.i);
                    }
                  }}
                />
              ))}
            </RGL>
            {isPreview && (
              <button 
                onClick={() => setIsPreview(false)}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-800 text-white rounded-full shadow-xl hover:bg-gray-700 transition-colors font-medium flex items-center gap-2 z-50"
              >
                退出预览
              </button>
            )}
          </div>
        </div>
      </div>
      {!isPreview && (
        <RightSidebar 
          selectedPanel={panels.find(p => p.i === selectedId) || null} 
          updateConfig={(config) => selectedId && updatePanelConfig(selectedId, config)} 
          updateSize={(w, h) => selectedId && updatePanelSize(selectedId, w, h)}
        />
      )}
    </div>
  );
}