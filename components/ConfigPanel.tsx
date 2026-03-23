
import React, { useState } from 'react';
import { type Configuration, type ParasolInstance } from '../types';
import { OPTIONS_DATA } from '../constants';
import { OptionSection } from './OptionSection';
import { RadioButtonGroup } from './RadioButtonGroup';
import { ColorSelector } from './ColorSelector';
import { QuoteModal } from './QuoteModal';
import { OrderModal } from './OrderModal';

interface ConfigPanelProps {
  parasols: ParasolInstance[];
  activeId: string;
  onSwitchActive: (id: string) => void;
  onAddParasol: () => void;
  onRemoveParasol: (id: string) => void;
  onConfigurationChange: (newConfig: Partial<Configuration>) => void;
  totalPrice: number;
}

const AccessoryCheckbox: React.FC<{
    id: string;
    label: string;
    price: number;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}> = ({ id, label, price, checked, onChange, disabled = false }) => (
    <div className="flex items-center justify-between py-0.5 px-0.5">
        <div className="flex items-center">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="h-3.5 w-3.5 lg:h-4.5 lg:w-4.5 text-[#c8813f] border-gray-300 rounded focus:ring-0 cursor-pointer"
            />
            <label htmlFor={id} className={`ml-2 text-[11px] lg:text-xs font-semibold text-gray-800 ${disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-[#c8813f]'}`}>
                {label}
            </label>
        </div>
        <span className={`text-[9px] lg:text-xs font-bold ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            + €{price.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
        </span>
    </div>
);

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  parasols,
  activeId,
  onSwitchActive,
  onAddParasol,
  onRemoveParasol,
  onConfigurationChange,
  totalPrice,
}) => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const activeItem = parasols.find(p => p.id === activeId) || parasols[0];
  const configuration = activeItem.config;
  
  const { size, baseType, gutterEnabled } = configuration;

  const availableBases = size === '5x5'
    ? OPTIONS_DATA.baseType.options.filter(opt => opt.value !== 'tegelstandaardzilver')
    : OPTIONS_DATA.baseType.options;

  const isTegelsCompatible = 
    (size === '4x4' && (baseType === 'tegelstandaardzilver' || baseType === 'veiligheidstandaard')) ||
    (size === '5x5' && baseType === 'veiligheidstandaard');

  const isAfdekplaatCompatible = size === '4x4' && baseType === 'tegelstandaardzilver';
  const isWielenCompatible = size === '4x4' && baseType === 'tegelstandaardzilver';

  const wheelOptions = [
    { value: 'nee', label: 'Geen', price: 0 },
    { value: 'ja', label: OPTIONS_DATA.wielen.label, price: OPTIONS_DATA.wielen.price },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden isolate">
      {/* Ultra Compact Header */}
      <header className="px-5 py-3 lg:px-6 lg:py-5 border-b border-gray-100 bg-white shrink-0 z-50">
          <div className="flex items-center justify-between mb-4 lg:mb-5">
              <div className="flex flex-col gap-0">
                <img src="https://shop.parasols.nl/media/queldorei/shopper/logo.png" alt="Solero" className="h-4 lg:h-6 object-contain object-left" />
                <h2 className="text-[7px] lg:text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Project Configurator</h2>
              </div>
              <div className="text-right">
                <p className="text-base lg:text-2xl font-black text-[#008000] tabular-nums leading-none">
                  €{totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[7px] lg:text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Project Totaal</p>
              </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {parasols.map((p) => (
              <div key={p.id} className="relative group shrink-0">
                <button
                  onClick={() => onSwitchActive(p.id)}
                  className={`px-3 py-1.5 lg:px-4 lg:py-2.5 rounded-lg text-[9px] lg:text-[11px] font-black transition-all border ${
                    activeId === p.id 
                      ? 'bg-slate-800 border-slate-800 text-white shadow-md -translate-y-0.5' 
                      : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                  }`}
                >
                  {p.label}
                </button>
                {parasols.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveParasol(p.id); }}
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110 active:scale-90`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            <button 
              onClick={onAddParasol}
              className={`w-8 h-8 lg:w-11 lg:h-11 rounded-lg border-2 border-dashed border-gray-200 text-gray-300 hover:border-slate-400 hover:text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center shrink-0 active:scale-95`}
              title="Voeg parasol toe"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
      </header>

      {/* Main Options Area */}
      <div className="flex-1 overflow-y-auto px-5 py-3 lg:px-6 lg:py-6 space-y-6 lg:space-y-8 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1 lg:pb-1.5">
            <h3 className="text-[8px] lg:text-[10px] font-black text-[#c8813f] uppercase tracking-widest">
                Configuratie: {activeItem.label}
            </h3>
        </div>

        <OptionSection title={OPTIONS_DATA.size.label}>
          <RadioButtonGroup
            name="size"
            options={OPTIONS_DATA.size.options}
            selectedValue={configuration.size}
            onChange={(value) => onConfigurationChange({ size: value })}
          />
        </OptionSection>

        <OptionSection title={OPTIONS_DATA.clothColor.label}>
          <ColorSelector
            options={OPTIONS_DATA.clothColor.options}
            selectedValue={configuration.clothColor}
            onChange={(value) => onConfigurationChange({ clothColor: value })}
          />
        </OptionSection>

        <OptionSection title={OPTIONS_DATA.baseType.label}>
            <RadioButtonGroup
                name="baseType"
                options={availableBases}
                selectedValue={configuration.baseType}
                onChange={(value) => onConfigurationChange({ baseType: value })}
            />
        </OptionSection>

        {(isTegelsCompatible || isAfdekplaatCompatible || isWielenCompatible) && (
            <OptionSection title="Voet opties">
                <div className="space-y-3 lg:space-y-4">
                    {isTegelsCompatible && (
                        <AccessoryCheckbox
                            id="tegels"
                            label={OPTIONS_DATA.tegels.label}
                            price={OPTIONS_DATA.tegels.price}
                            checked={configuration.tegels}
                            onChange={(value) => onConfigurationChange({ tegels: value })}
                        />
                    )}
                    {isAfdekplaatCompatible && (
                        <AccessoryCheckbox
                            id="afdekplaat"
                            label={OPTIONS_DATA.afdekplaat.label}
                            price={OPTIONS_DATA.afdekplaat.price}
                            checked={configuration.afdekplaat}
                            onChange={(value) => onConfigurationChange({ afdekplaat: value })}
                        />
                    )}
                    {isWielenCompatible && (
                        <div className="pt-1">
                             <label className="text-[7px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 lg:mb-2">Zwenkwielen</label>
                            <RadioButtonGroup
                                name="wielen"
                                options={wheelOptions}
                                selectedValue={configuration.wielen ? 'ja' : 'nee'}
                                onChange={(value) => onConfigurationChange({ wielen: value === 'ja' })}
                            />
                        </div>
                    )}
                </div>
            </OptionSection>
        )}
        
        <OptionSection title="Extra Comfort">
            <div className="space-y-5 lg:space-y-6">
                <AccessoryCheckbox
                    id="lux"
                    label={OPTIONS_DATA.lux.label}
                    price={OPTIONS_DATA.lux.price}
                    checked={configuration.lux}
                    onChange={(value) => onConfigurationChange({ lux: value })}
                />
                <div className="space-y-2 lg:space-y-3">
                    <label className="text-[7px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-widest">Heaters</label>
                    <RadioButtonGroup
                        name="heaters"
                        options={OPTIONS_DATA.heaters.options}
                        selectedValue={configuration.heaters}
                        onChange={(value) => onConfigurationChange({ heaters: value })}
                    />
                </div>
                <AccessoryCheckbox
                    id="protectiveCover"
                    label={OPTIONS_DATA.protectiveCover.label}
                    price={OPTIONS_DATA.protectiveCover.price}
                    checked={configuration.protectiveCover}
                    onChange={(value) => onConfigurationChange({ protectiveCover: value })}
                />
            </div>
        </OptionSection>

        {/* Integrated Gutter Section */}
        <OptionSection title="Regengoot">
            <div className="space-y-4">
                <AccessoryCheckbox
                    id="gutterEnabled"
                    label="Regengoot toevoegen"
                    price={OPTIONS_DATA.gutter.basePrice}
                    checked={gutterEnabled}
                    onChange={(value) => onConfigurationChange({ gutterEnabled: value })}
                />
                
                {gutterEnabled && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-5 animate-fade-in">
                        <div>
                            <label className="text-[7px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Lengte Goot</label>
                            <RadioButtonGroup
                                name="gutterLength"
                                options={OPTIONS_DATA.gutter.lengths}
                                selectedValue={configuration.gutterLength}
                                onChange={(value) => onConfigurationChange({ gutterLength: value })}
                            />
                        </div>
                        <div>
                            <label className="text-[7px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Kleur Goot</label>
                            <ColorSelector
                                options={OPTIONS_DATA.gutter.colors}
                                selectedValue={configuration.gutterColor}
                                onChange={(value) => onConfigurationChange({ gutterColor: value })}
                            />
                        </div>
                        <div className="pt-2 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                             <p className="text-[9px] font-bold text-gray-400 uppercase italic">Wordt tussen twee parasols geplaatst</p>
                        </div>
                    </div>
                )}
            </div>
        </OptionSection>
        
        <div className="h-4 pointer-events-none opacity-0">.</div>
      </div>
      
      {/* Footer */}
      <footer className="px-3 py-2 lg:px-6 lg:py-3 border-t border-gray-100 bg-gray-50 shrink-0 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex flex-row gap-1.5 lg:gap-3">
            <button
                type="button"
                onClick={() => setIsOrderModalOpen(true)}
                className="flex-1 bg-[#008000] hover:bg-[#006400] text-white font-black uppercase tracking-wider py-2.5 lg:py-3 px-1 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 lg:h-3.5 lg:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-[8px] lg:text-[10px] whitespace-nowrap">Direct bestellen</span>
            </button>

            <button
                type="button"
                onClick={() => setIsQuoteModalOpen(true)}
                className="flex-1 bg-white border border-[#c8813f] text-[#c8813f] hover:bg-orange-50 font-black uppercase tracking-wider py-2.5 lg:py-3 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97] shadow-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 lg:h-3.5 lg:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[8px] lg:text-[10px] whitespace-nowrap">Project offerte</span>
            </button>
        </div>
      </footer>

      {isQuoteModalOpen && (
        <QuoteModal 
          parasols={parasols} 
          totalPrice={totalPrice} 
          onClose={() => setIsQuoteModalOpen(false)} 
        />
      )}

      {isOrderModalOpen && (
        <OrderModal 
          parasols={parasols} 
          totalPrice={totalPrice} 
          onClose={() => setIsOrderModalOpen(false)} 
        />
      )}
    </div>
  );
};
