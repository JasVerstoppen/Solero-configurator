
import React, { useState } from 'react';
import { type Configuration, type ParasolInstance } from '../types';
import { OPTIONS_DATA } from '../constants';

interface QuoteModalProps {
  parasols: ParasolInstance[];
  totalPrice: number;
  onClose: () => void;
}

const getThumbnailUrl = (item: ParasolInstance): string => {
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

export const QuoteModal: React.FC<QuoteModalProps> = ({ parasols, totalPrice, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    zip: '',
    city: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateItemPrice = (item: ParasolInstance) => {
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

    if (gutterEnabled) {
        total += OPTIONS_DATA.gutter.basePrice;
        total += OPTIONS_DATA.gutter.lengths.find(l => l.value === gutterLength)?.price || 0;
    }
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    const itemDetails: Record<string, string> = {};
    let itemsText = "";

    parasols.forEach((p, idx) => {
      const config = p.config;
      const sizeLabel = OPTIONS_DATA.size.options.find(o => o.value === config.size)?.label;
      const colorLabel = OPTIONS_DATA.clothColor.options.find(o => o.value === config.clothColor)?.label;
      const baseLabel = OPTIONS_DATA.baseType.options.find(o => o.value === config.baseType)?.label;
      
      const acc = [
        config.heaters !== '0' ? `${config.heaters}x Heliosa Heaters` : null,
        config.lux ? 'LUX LED Verlichting' : null,
        config.tegels ? 'Inclusief Tegels' : null,
        config.afdekplaat ? 'Met Afdekplaat' : null,
        config.wielen ? 'Met 75mm Zwenkwielen' : null,
        config.protectiveCover ? 'Inclusief Beschermhoes' : null,
        config.gutterEnabled ? `Regengoot (${OPTIONS_DATA.gutter.lengths.find(l => l.value === config.gutterLength)?.label}, ${OPTIONS_DATA.gutter.colors.find(c => c.value === config.gutterColor)?.label})` : null,
      ].filter(Boolean);

      const itemText = `Model: Solero Basto\nAfmeting: ${sizeLabel}\nDoekkleur: ${colorLabel}\nVoettype: ${baseLabel}\nACCESSOIRES: ${acc.length > 0 ? acc.join(', ') : 'Geen'}`;

      const key = `Parasol ${idx + 1}`;
      itemDetails[key] = itemText;
      itemsText += `${key}:\n${itemText}\n\n`;
    });

    const totalPriceStr = totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 });

    const fullEmailText = `KLANTGEGEVENS:\nNaam: ${formData.name}\nE-mail: ${formData.email}\nTelefoon: ${formData.phone}\n\n${itemsText}PRIJSINDICATIE: € ${totalPriceStr} (incl. BTW)\n\nOPMERKING: ${formData.message || 'Geen'}`;

    const payload = {
      customer: formData,
      config: {
        model: 'Solero Configurator Project',
        ...itemDetails,
        totalPrice: totalPriceStr
      },
      fullEmailText: fullEmailText
    };

    try {
      const response = await fetch('/api/submit-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Fout bij verzenden.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verbindingsfout.');
    } finally {
      setIsSending(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Aanvraag ontvangen!</h3>
          <p className="text-gray-600 mb-8 text-sm">Bedankt! We hebben uw aanvraag ontvangen en nemen spoedig contact op.</p>
          <button onClick={onClose} className="w-full bg-[#c8813f] hover:bg-[#a66b34] text-white font-bold py-4 rounded-xl">Sluiten</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <header className="px-6 py-5 border-b flex items-center justify-between shrink-0 bg-white">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Project offerte</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-50 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-bold">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Naam *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c8813f]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">E-mail *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c8813f]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Telefoon *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c8813f]" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Adres (Straat + Nr)</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c8813f]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Postcode</label>
                <input type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c8813f]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Woonplaats</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c8813f]" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Opmerkingen</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows={2} className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c8813f] resize-none"></textarea>
            </div>
          </div>

          <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 shadow-sm">
            <h4 className="text-[10px] font-black text-[#c8813f] uppercase tracking-widest mb-4 border-b border-orange-200/50 pb-2">
              Project Overzicht ({parasols.length} items)
            </h4>
            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {parasols.map((p, idx) => {
                return (
                  <div key={p.id} className="flex gap-4 p-3 bg-white rounded-xl border border-orange-100/50 hover:border-orange-200 transition-colors shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0 relative flex items-center justify-center">
                        <img 
                            src={getThumbnailUrl(p)} 
                            alt={p.label} 
                            className="w-full h-full object-contain p-1"
                        />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{p.label}</h5>
                        <span className="text-xs font-black text-[#008000]">€{calculateItemPrice(p).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="space-y-1 text-[10px] text-gray-500 font-medium">
                        <p className="flex items-center gap-2">
                           <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-bold">{OPTIONS_DATA.size.options.find(o => o.value === p.config.size)?.label}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                           <span className="font-bold text-gray-600">{OPTIONS_DATA.clothColor.options.find(o => o.value === p.config.clothColor)?.label}</span>
                        </p>
                        {p.config.gutterEnabled && (
                            <p className="flex items-center gap-2 text-blue-600 font-bold">
                                <span>+ Regengoot {OPTIONS_DATA.gutter.lengths.find(l => l.value === p.config.gutterLength)?.label}</span>
                            </p>
                        )}
                        <p className="truncate">Voet: <span className="text-gray-700">{OPTIONS_DATA.baseType.options.find(o => o.value === p.config.baseType)?.label}</span></p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-5 pt-4 border-t-2 border-dashed border-orange-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Project Totaal</span>
                <span className="text-[9px] text-gray-400 font-medium italic leading-none">Inclusief BTW</span>
              </div>
              <span className="text-xl font-black text-[#008000] tabular-nums">€{totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button type="submit" disabled={isSending} className="w-full bg-[#c8813f] text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg active:scale-95 transition-all hover:bg-[#a66b34] text-sm">
            {isSending ? 'Versturen...' : 'Bevestig & Offerte Aanvragen'}
          </button>
        </form>
      </div>
    </div>
  );
};
