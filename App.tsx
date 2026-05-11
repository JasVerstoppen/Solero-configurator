
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { ImageViewer } from './components/ImageViewer';
import { type Configuration, type ParasolInstance } from './types';
import { DEFAULT_CONFIGURATION, OPTIONS_DATA } from './constants';
import { TRANSLATIONS, type Language } from './translations';
import { getImageUrl } from './lib/imageUtils';

function App() {
  const [lang, setLang] = useState<Language>(() => {
    const path = window.location.pathname;
    if (path.includes('/de')) return 'de';
    if (path.includes('/es')) return 'es';
    return 'nl';
  });

  const t = TRANSLATIONS[lang];

  const [items, setItems] = useState<ParasolInstance[]>(() => {
    // Check URL parameters for pre-selected model
    const params = new URLSearchParams(window.location.search);
    const modelParam = params.get('model')?.toLowerCase();
    
    // Default config with potential size override
    const initialConfig = { ...DEFAULT_CONFIGURATION };
    if (modelParam === 'duo') {
      initialConfig.size = 'duo-520x250';
    }
    
    return [
      { id: '1', label: `${t.parasol} 1`, config: initialConfig }
    ];
  });
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
    if (config.installationService) total += OPTIONS_DATA.installationService.price;

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
      return { ...item, config: { ...item.config, ...updates } };
    }));
  }, [activeId]);

  const handleAddParasol = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const count = items.length + 1;
    const label = `${t.parasol} ${count}`;
    
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

  const handleUpdateBackground = useCallback((bg: BackgroundId) => {
    setItems(prev => prev.map(item => ({
      ...item,
      config: { ...item.config, background: bg }
    })));
  }, []);

  const imageUrl = useMemo(() => getImageUrl(activeItem), [activeItem]);

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row bg-[#f8f9fa] overflow-hidden">
      <section className="absolute top-0 left-0 right-0 h-[40dvh] lg:relative lg:inset-auto lg:h-full lg:flex-1 bg-white z-30 overflow-hidden">
        <ImageViewer 
          imageUrl={imageUrl} 
          currentBackground={activeItem.config.background}
          onBackgroundChange={handleUpdateBackground}
        />
        
        {/* Language Toggle in viewer for visibility */}
        <div className="absolute top-4 left-4 z-50 flex gap-2">
          <button 
            onClick={() => setLang('nl')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'nl' ? 'bg-[#c8813f] text-white' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
          >
            NL
          </button>
          <button 
            onClick={() => setLang('de')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'de' ? 'bg-[#c8813f] text-white' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
          >
            DE
          </button>
          <button 
            onClick={() => setLang('es')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${lang === 'es' ? 'bg-[#c8813f] text-white' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
          >
            ES
          </button>
        </div>
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
          lang={lang}
        />
      </section>
    </div>
  );
}

export default App;
