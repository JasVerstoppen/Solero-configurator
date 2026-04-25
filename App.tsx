
import React, { useState, useMemo, useCallback } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { ImageViewer } from './components/ImageViewer';
import { type Configuration, type ParasolInstance } from './types';
import { DEFAULT_CONFIGURATION, OPTIONS_DATA } from './constants';

const getImageUrl = (item: ParasolInstance): string => {
  const config = item.config;
  const baseUrl = 'https://parasols-shop.com/configurator-test/Bravo/';
  const { frameColor, clothColor, baseType } = config;

  // Frame prefix: Zilvergrijs (silver) -> "5t-", Zwart (black) -> ""
  const framePrefix = frameColor === 'silver' ? '5t-' : '';
  
  // Base suffix logic based on analyzed file list
  let baseSuffix = '';
  if (baseType === 'grey-base') {
    baseSuffix = '-base';
  } else if (baseType === 'grey-base-wheels') {
    baseSuffix = '-base-wheels';
  } else if (baseType === 'black-base' || baseType === 'black-base-wheels') {
    // Determine if we use "baseblack" or "blackbase"
    // The user's list has some inconsistencies:
    // e.g., "5t-quattro-sand-blackbase.png" vs "quattro-sand-baseblack.png"
    let baseName = 'baseblack'; // Default for most grey, olive, red, taupe, white, whiteblue
    
    if (clothColor === 'black') {
      baseName = 'blackbase';
    } else if (clothColor === 'sand') {
      if (frameColor === 'silver') baseName = 'blackbase';
      else baseName = 'baseblack';
    }
    
    const wheelsSuffix = baseType.includes('wheels') ? '-wheels' : '';
    baseSuffix = `-${baseName}${wheelsSuffix}`;
  } else if (baseType === 'anchor') {
    baseSuffix = '-anchor';
  }

  const fileName = `${framePrefix}quattro-${clothColor}${baseSuffix}.png`;
  return baseUrl + fileName;
};

const OrientationHint: React.FC = () => {
  return (
    <div className="orientation-hint fixed bottom-6 left-6 z-[100] pointer-events-none">
      <div className="bg-black/70 backdrop-blur-md text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white/10 animate-fade-in">
        <div className="relative w-8 h-12 border-2 border-white/40 rounded-md animate-rotate-device shrink-0">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-white/40 rounded-full"></div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 border border-white/40 rounded-full"></div>
        </div>
        <div className="pr-2">
            <p className="text-sm font-bold leading-tight">Draai uw tablet</p>
            <p className="text-[10px] text-white/60 leading-tight mt-0.5">Draai naar portrait voor configuratie</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [items, setItems] = useState<ParasolInstance[]>([
    { id: '1', label: 'Parasol 1', config: { ...DEFAULT_CONFIGURATION } }
  ]);
  const [activeId, setActiveId] = useState<string>('1');

  const activeItem = useMemo(() => 
    items.find(i => i.id === activeId) || items[0],
    [items, activeId]
  );

  const calculatePrice = (item: ParasolInstance) => {
    const config = item.config;
    let total = OPTIONS_DATA.basePrice;
    const { 
        size, frameColor, clothColor, baseType, heaters, 
        protectiveCover, ledEnabled, gutterEnabled, gutterLength 
    } = config;

    total += OPTIONS_DATA.size.options.find(o => o.value === size)?.price || 0;
    total += OPTIONS_DATA.frameColor.options.find(o => o.value === frameColor)?.price || 0;
    total += OPTIONS_DATA.clothColor.options.find(o => o.value === clothColor)?.price || 0;
    total += OPTIONS_DATA.baseType.options.find(o => o.value === baseType)?.price || 0;
    total += OPTIONS_DATA.heaters.options.find(o => o.value === heaters)?.price || 0;
    if (protectiveCover) total += OPTIONS_DATA.protectiveCover.price;
    if (ledEnabled) total += OPTIONS_DATA.led.price;

    // Gutter price calculation
    if (gutterEnabled) {
        total += OPTIONS_DATA.gutter.basePrice;
        total += OPTIONS_DATA.gutter.lengths.find(l => l.value === gutterLength)?.price || 0;
    }

    return total;
  };

  const projectTotalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + calculatePrice(item), 0);
  }, [items]);

  const handleUpdateActive = useCallback((updates: Partial<Configuration>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== activeId) return item;
      
      const nextConfig = { ...item.config, ...updates };
      
      // Auto-switch & Compatibility logic can be added here if needed for Bravo
      
      return { ...item, config: nextConfig };
    }));
  }, [activeId]);

  const handleAddParasol = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const count = items.length + 1;
    const label = `Parasol ${count}`;
    
    setItems(prev => [
      ...prev,
      { id: newId, label, config: { ...DEFAULT_CONFIGURATION, background: activeItem.config.background } }
    ]);
    setActiveId(newId);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
    if (activeId === id) {
      setActiveId(items.find(i => i.id !== id)?.id || '');
    }
  };

  const imageUrl = useMemo(() => getImageUrl(activeItem), [activeItem]);

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row bg-[#f8f9fa] overflow-hidden">
      <OrientationHint />
      
      <section className="absolute top-0 left-0 right-0 h-[40dvh] lg:relative lg:inset-auto lg:h-full lg:flex-1 bg-white z-30 overflow-hidden">
        <ImageViewer 
          imageUrl={imageUrl} 
          currentBackground={activeItem.config.background}
          onBackgroundChange={(bg) => handleUpdateActive({ background: bg })}
        />
      </section>
      
      <section className="absolute top-[40dvh] bottom-0 left-0 right-0 lg:relative lg:inset-auto lg:h-full lg:w-[420px] bg-white z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.12)] lg:shadow-2xl overflow-hidden">
        <ConfigPanel
          parasols={items}
          activeId={activeId}
          onSwitchActive={setActiveId}
          onAddParasol={handleAddParasol}
          onRemoveParasol={handleRemoveItem}
          onConfigurationChange={handleUpdateActive}
          totalPrice={projectTotalPrice}
        />
      </section>
    </div>
  );
}

export default App;
