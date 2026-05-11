
import React, { useState } from 'react';
import { type Configuration, type ParasolInstance } from '../types';
import { OPTIONS_DATA } from '../constants';
import { TRANSLATIONS, type Language } from '../translations';
import { OptionSection } from './OptionSection';
import { RadioButtonGroup } from './RadioButtonGroup';
import { ColorSelector } from './ColorSelector';
import { QuoteModal } from './QuoteModal';

interface ConfigPanelProps {
  parasols: ParasolInstance[];
  activeId: string;
  onSwitchActive: (id: string) => void;
  onAddParasol: () => void;
  onRemoveParasol: (id: string) => void;
  onConfigurationChange: (newConfig: Partial<Configuration>) => void;
  totalPrice: number;
  lang: Language;
}

const AccessoryCheckbox: React.FC<{
    id: string;
    label: string;
    price: number;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    hidePrice?: boolean;
}> = ({ id, label, price, checked, onChange, disabled = false, hidePrice = false }) => (
    <div className={`flex items-center justify-between py-0.5 px-0.5 ${disabled ? 'opacity-70' : ''}`}>
        <div className="flex items-center">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                disabled={disabled}
                className={`h-3.5 w-3.5 lg:h-4.5 lg:w-4.5 ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-[#c8813f] cursor-pointer'} border-gray-300 rounded focus:ring-0`}
            />
            <label htmlFor={id} className={`ml-2 text-[11px] lg:text-xs font-semibold ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800 cursor-pointer hover:text-[#c8813f]'}`}>
                {label}
            </label>
        </div>
        {!hidePrice && (
            <span className={`text-[9px] lg:text-xs font-bold text-gray-700`}>
                {price === 0 ? t.free : `+ €${price.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            </span>
        )}
    </div>
); export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  parasols,
  activeId,
  onSwitchActive,
  onAddParasol,
  onRemoveParasol,
  onConfigurationChange,
  totalPrice,
  lang,
}) => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const activeItem = parasols.find(p => p.id === activeId) || parasols[0];
  const configuration = activeItem.config;
  
  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden isolate">
      {/* Ultra Compact Header */}
      <header className="px-5 py-3 lg:px-6 lg:py-5 border-b border-gray-100 bg-white shrink-0 z-50">
          <div className="flex items-center justify-between mb-4 lg:mb-5">
              <div className="flex flex-col gap-0">
                <img src="https://shop.parasols.nl/media/queldorei/shopper/logo.png" alt="Solero" className="h-4 lg:h-6 object-contain object-left" />
                <h2 className="text-[7px] lg:text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">{t.title}</h2>
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
              title={t.addParasol}
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
                {t.configuration}: {activeItem.label}
            </h3>
        </div>

        <OptionSection title={t.size}>
          <RadioButtonGroup
            name="size"
            options={OPTIONS_DATA.size.options}
            selectedValue={configuration.size}
            onChange={(value) => onConfigurationChange({ size: value })}
          />
        </OptionSection>

        <OptionSection title={t.frameColor}>
          <RadioButtonGroup
            name="frameColor"
            options={OPTIONS_DATA.frameColor.options.map(o => ({ ...o, label: t.labels[o.value as keyof typeof t.labels] || o.label }))}
            selectedValue={configuration.frameColor}
            onChange={(value) => onConfigurationChange({ frameColor: value })}
          />
        </OptionSection>

        <OptionSection title={t.clothColor}>
          <ColorSelector
            options={OPTIONS_DATA.clothColor.options.map(o => ({ ...o, label: t.labels[o.value as keyof typeof t.labels] || o.label }))}
            selectedValue={configuration.clothColor}
            onChange={(value) => onConfigurationChange({ clothColor: value })}
          />
        </OptionSection>

        <OptionSection title={t.baseType}>
            <RadioButtonGroup
                name="baseType"
                options={OPTIONS_DATA.baseType.options.map(o => {
                  if (o.value === 'none') return { ...o, label: t.labels.none };
                  if (o.value === 'anchor') return { ...o, label: t.labels.anchor };
                  
                  // Construction: Voet/Fuß + Kleur + [op wielen/met Rollen]
                  const isGrey = o.value.includes('grey');
                  const hasWheels = o.value.includes('wheels');
                  const colorLabel = isGrey ? t.labels.grey : t.labels.black;
                  const wheelLabel = hasWheels ? ` ${t.labels.wheels}` : '';
                  
                  return { ...o, label: `${t.labels.base} ${colorLabel}${wheelLabel}` };
                })}
                selectedValue={configuration.baseType}
                onChange={(value) => onConfigurationChange({ baseType: value })}
            />
        </OptionSection>
        
        <OptionSection title={t.accessories}>
            <div className="space-y-5 lg:space-y-6">
                <div className="space-y-2 lg:space-y-3">
                    <label className="text-[7px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.heaters}</label>
                    <RadioButtonGroup
                        name="heaters"
                        options={OPTIONS_DATA.heaters.options.map(o => {
                          if (o.value === '0') return { ...o, label: t.labels.none };
                          const count = o.value;
                          let label = '';
                          if (lang === 'de') {
                            label = `${count} ${t.heaters_unit}`;
                          } else if (lang === 'es') {
                            label = `${count} ${t.heaters_unit}${count === '1' ? '' : 'es'}`;
                          } else {
                            label = `${count} ${t.heaters_unit}${count === '1' ? '' : 's'}`;
                          }
                          return { ...o, label };
                        })}
                        selectedValue={configuration.heaters}
                        onChange={(value) => onConfigurationChange({ heaters: value })}
                    />
                </div>
                
                <AccessoryCheckbox
                    id="ledEnabled"
                    label={t.labels.led}
                    price={OPTIONS_DATA.led.price}
                    checked={configuration.ledEnabled}
                    onChange={(value) => onConfigurationChange({ ledEnabled: value })}
                    disabled={true}
                    hidePrice={true}
                />

                <AccessoryCheckbox
                    id="protectiveCover"
                    label={t.labels.protectiveCover}
                    price={OPTIONS_DATA.protectiveCover.price}
                    checked={configuration.protectiveCover}
                    onChange={(value) => onConfigurationChange({ protectiveCover: value })}
                    hidePrice={true}
                />

                <AccessoryCheckbox
                    id="gutterEnabled"
                    label={t.labels.gutter}
                    price={OPTIONS_DATA.gutter.basePrice}
                    checked={configuration.gutterEnabled}
                    onChange={(value) => onConfigurationChange({ gutterEnabled: value })}
                    hidePrice={true}
                />

                <AccessoryCheckbox
                    id="installationService"
                    label={t.labels.installation}
                    price={OPTIONS_DATA.installationService.price}
                    checked={configuration.installationService}
                    onChange={(value) => onConfigurationChange({ installationService: value })}
                    hidePrice={true}
                />
            </div>
        </OptionSection>
        
        <div className="h-4 pointer-events-none opacity-0">.</div>
      </div>
      
      {/* Footer */}
      <footer className="px-5 py-3 lg:px-6 lg:py-4 border-t border-gray-100 bg-gray-50 shrink-0 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex w-full">
            <button
                type="button"
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full bg-[#c8813f] hover:bg-[#b07038] text-white font-black uppercase tracking-[0.1em] py-3.5 lg:py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2.5 touch-manipulation active:scale-[0.98] shadow-md hover:shadow-lg"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[10px] lg:text-xs whitespace-nowrap">{t.quote}</span>
            </button>
        </div>
      </footer>

      {isQuoteModalOpen && (
        <QuoteModal 
          parasols={parasols} 
          totalPrice={totalPrice} 
          onClose={() => setIsQuoteModalOpen(false)} 
          lang={lang}
        />
      )}
    </div>
  );
};
