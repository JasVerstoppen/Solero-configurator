
import React, { useState, useMemo, useCallback } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { ImageViewer } from './components/ImageViewer';
import { type Configuration, type ParasolInstance } from './types';
import { DEFAULT_CONFIGURATION, OPTIONS_DATA } from './constants';

const getImageUrl = (item: ParasolInstance): string => {
  const config = item.config;
  const baseUrl = 'https://shop.parasols.nl/configurator-test/Basto/';
  const { size, clothColor, baseType, heaters, lux, tegels, afdekplaat, wielen } = config;

  let folderAndFileSuffix: string = baseType;

  if (baseType === 'tegelstandaardzilver') {
      let suffix = 'tegelstandaardzilver';
      if (afdekplaat) {
          suffix = 'tegelstandaardzilver-afdekplaatzilver';
      } else if (tegels) {
          suffix = 'tegelstandaardzilver-tegels';
      }
      if (wielen) {
          suffix += '-wielen75mm';
      }
      folderAndFileSuffix = suffix;
  } else if (baseType === 'veiligheidstandaard') {
      if (tegels) {
          folderAndFileSuffix += '-tegels';
      }
  }
  
  const folder = `Basto-${size}/${folderAndFileSuffix}/`;
  let fileName = `Basto-${size}-${clothColor}`;
  
  if (heaters !== '0') fileName += `-${heaters}heliosa`;
  if (lux) fileName += '-lux';
  if (folderAndFileSuffix !== 'zonder-voet') fileName += `-${folderAndFileSuffix}`;

  fileName += '.png';
  return baseUrl + folder + fileName;
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
        size, clothColor, baseType, heaters, lux, tegels, 
        afdekplaat, wielen, protectiveCover, gutterEnabled, gutterLength 
    } = config;

    total += OPTIONS_DATA.size.options.find(o => o.value === size)?.price || 0;
    total += OPTIONS_DATA.clothColor.options.find(o => o.value === clothColor)?.price || 0;
    total += OPTIONS_DATA.baseType.options.find(o => o.value === baseType)?.price || 0;
    total += OPTIONS_DATA.heaters.options.find(o => o.value === heaters)?.price || 0;
    if (lux) total += OPTIONS_DATA.lux.price;
    if (tegels) total += OPTIONS_DATA.tegels.price;
    if (afdekplaat) total += OPTIONS_DATA.afdekplaat.price;
    if (wielen) total += OPTIONS_DATA.wielen.price;
    if (protectiveCover) total += OPTIONS_DATA.protectiveCover.price;

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
      
      // Auto-switch & Compatibility logic
      if (nextConfig.size === '5x5' && nextConfig.baseType === 'tegelstandaardzilver') {
        nextConfig.baseType = 'zonder-voet';
      }
      const isTegelsCompatible = 
        (nextConfig.size === '4x4' && (nextConfig.baseType === 'tegelstandaardzilver' || nextConfig.baseType === 'veiligheidstandaard')) ||
        (nextConfig.size === '5x5' && nextConfig.baseType === 'veiligheidstandaard');
      if (!isTegelsCompatible) nextConfig.tegels = false;
      const isAfdekplaatCompatible = nextConfig.size === '4x4' && nextConfig.baseType === 'tegelstandaardzilver';
      if (!isAfdekplaatCompatible) nextConfig.afdekplaat = false;
      const isWielenCompatible = nextConfig.size === '4x4' && nextConfig.baseType === 'tegelstandaardzilver';
      if (!isWielenCompatible) nextConfig.wielen = false;

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
