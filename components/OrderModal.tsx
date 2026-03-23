
import React, { useState } from 'react';
import { type Configuration, type ParasolInstance } from '../types';
import { OPTIONS_DATA } from '../constants';

interface OrderModalProps {
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

const PAYMENT_METHODS = [
  { id: 'ideal', label: 'iDEAL', icon: '🏦', logo: 'https://cdn.worldvectorlogo.com/logos/ideal.svg' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️', logo: 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg' },
  { id: 'creditcard', label: 'Creditcard', icon: '💳', logo: 'https://t4.ftcdn.net/jpg/04/06/75/39/360_F_406753914_SFSBhjhp6kbHblNiUFZ1MXHcuEKe7e7P.jpg' },
  { id: 'overboeking', label: 'Overboeking', icon: '🏢', logo: '' },
  { id: 'klarna', label: 'Klarna', icon: '💗', logo: 'https://cdn.worldvectorlogo.com/logos/klarna.svg' },
];

export const OrderModal: React.FC<OrderModalProps> = ({ parasols, totalPrice, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    billingAddress: '',
    billingZip: '',
    billingCity: '',
    billingCountry: 'Nederland',
    differentShipping: false,
    shippingAddress: '',
    shippingZip: '',
    shippingCity: '',
    paymentMethod: 'ideal',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
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

    let itemsText = "";
    const itemDetails: Record<string, string> = {};

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

      const itemText = `Model: Solero Basto
Afmeting: ${sizeLabel}
Doekkleur: ${colorLabel}
Voettype: ${baseLabel}
ACCESSOIRES: ${acc.length > 0 ? acc.join(', ') : 'Geen'}`;

      const key = `Parasol ${idx + 1}`;
      itemDetails[key] = itemText;
      itemsText += `${key}:\n${itemText}\n\n`;
    });

    const totalPriceStr = totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 });
    const paymentLabel = PAYMENT_METHODS.find(m => m.id === formData.paymentMethod)?.label;

    const fullEmailText = `NIEUWE ONLINE BESTELLING: Solero Basto
======================================

KLANTGEGEVENS:
Naam: ${formData.firstName} ${formData.lastName}
E-mail: ${formData.email}
Telefoon: ${formData.phone}

FACTUURADRES:
${formData.billingAddress}
${formData.billingZip} ${formData.billingCity}
${formData.billingCountry}

VERZENDADRES:
${formData.differentShipping ? `${formData.shippingAddress}\n${formData.shippingZip} ${formData.shippingCity}` : 'Gelijk aan factuuradres'}

BETAALMETHODE: ${paymentLabel}

BESTELDE ITEMS:
${itemsText}
TOTAALBEDRAG: € ${totalPriceStr} (incl. BTW)

OPMERKINGEN: ${formData.notes || 'Geen'}`;

    const payload = {
      customer: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.billingAddress,
        zip: formData.billingZip,
        city: formData.billingCity,
        message: formData.notes
      },
      config: {
        model: 'Online Bestelling Solero Basto',
        ...itemDetails,
        totalPrice: totalPriceStr,
        paymentMethod: paymentLabel
      },
      fullEmailText: fullEmailText,
      type: 'ORDER'
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
        throw new Error(result.error || 'Fout bij verwerken bestelling.');
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
        <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-3">Bestelling Geplaatst!</h3>
          <p className="text-gray-600 mb-10 text-sm leading-relaxed">
            Bedankt voor uw bestelling. We hebben een bevestiging gestuurd naar <strong>{formData.email}</strong>.<br/>We gaan direct voor u aan de slag!
          </p>
          <button onClick={onClose} className="w-full bg-[#008000] hover:bg-[#006400] text-white font-black py-4 rounded-2xl transition-all shadow-lg uppercase tracking-widest">Afronden</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#f8f9fa] w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">
        
        <header className="bg-white px-8 py-6 border-b border-gray-100 shrink-0 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Online Bestellen</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">Veilig & Snel afrekenen</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-50 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 custom-scrollbar overscroll-contain">
          {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100">{error}</div>}

          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-[#c8813f] uppercase tracking-widest border-b border-orange-100 pb-2">1. Klantgegevens</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Voornaam *</label>
                <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#008000] outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Achternaam *</label>
                <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#008000] outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">E-mailadres *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#008000] outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Telefoonnummer *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#008000] outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-[#c8813f] uppercase tracking-widest border-b border-orange-100 pb-2">2. Adres</h4>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Adres (Straat + Huisnr) *</label>
                <input required name="billingAddress" value={formData.billingAddress} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#008000] outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Postcode *</label>
                  <input required name="billingZip" value={formData.billingZip} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#008000] outline-none transition-all" />
                </div>
                <div className="col-span-1 lg:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Woonplaats *</label>
                  <input required name="billingCity" value={formData.billingCity} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#008000] outline-none transition-all" />
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl">
                <input type="checkbox" id="diffShip" name="differentShipping" checked={formData.differentShipping} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-[#008000] focus:ring-0" />
                <label htmlFor="diffShip" className="text-xs font-bold text-gray-700 cursor-pointer">Verzendadres is anders dan factuuradres</label>
              </div>

              {formData.differentShipping && (
                <div className="space-y-5 pt-4 border-t border-dashed animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Verzendadres *</label>
                    <input required name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#008000] outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Postcode *</label>
                      <input required name="shippingZip" value={formData.shippingZip} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#008000] outline-none transition-all" />
                    </div>
                    <div className="col-span-1 lg:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Woonplaats *</label>
                      <input required name="shippingCity" value={formData.shippingCity} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#008000] outline-none transition-all" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-[#c8813f] uppercase tracking-widest border-b border-orange-100 pb-2">3. Betaalmethode</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, paymentMethod: m.id }))}
                  className={`group relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                    formData.paymentMethod === m.id 
                      ? 'bg-white border-[#008000] shadow-md ring-4 ring-green-50' 
                      : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="h-10 lg:h-12 w-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {m.logo ? (
                      <img src={m.logo} alt={m.label} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-2xl lg:text-3xl">{m.icon}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{m.label}</span>
                  {formData.paymentMethod === m.id && (
                    <div className="absolute top-2 right-2">
                       <div className="w-3 h-3 bg-[#008000] rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                          </svg>
                       </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-orange-50/50 p-6 lg:p-8 rounded-[32px] border border-orange-100 shadow-sm space-y-8">
            <h5 className="text-[10px] font-black text-[#c8813f] uppercase tracking-widest border-b border-orange-200/50 pb-2">Order Overzicht ({parasols.length} items)</h5>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {parasols.map((p) => {
                const itemPrice = calculateItemPrice(p);
                const config = p.config;
                
                return (
                  <div key={p.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-orange-100/50 shadow-sm">
                    <img src={getThumbnailUrl(p)} alt={p.label} className="w-20 h-20 object-contain bg-gray-50 rounded-xl p-2 shrink-0 border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{p.label}</h5>
                        <span className="text-xs font-black text-[#008000] tabular-nums">€{itemPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="space-y-1 text-[10px] text-gray-500 font-medium">
                        <p className="flex items-center gap-2">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-bold">
                                {OPTIONS_DATA.size.options.find(o => o.value === config.size)?.label}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="font-bold text-gray-600">
                                {OPTIONS_DATA.clothColor.options.find(o => o.value === config.clothColor)?.label}
                            </span>
                        </p>
                        <p className="truncate">Voet: <span className="text-gray-700">{OPTIONS_DATA.baseType.options.find(o => o.value === config.baseType)?.label}</span></p>
                        
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {config.heaters !== '0' && (
                                <span className="bg-orange-100/50 text-[#c8813f] px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase">{config.heaters}x Heaters</span>
                            )}
                            {config.lux && <span className="bg-orange-100/50 text-[#c8813f] px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase">LED</span>}
                            {config.gutterEnabled && (
                                <span className="bg-blue-100/50 text-blue-600 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase">Regengoot {OPTIONS_DATA.gutter.lengths.find(l => l.value === config.gutterLength)?.label}</span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t-2 border-dashed border-orange-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Totaalbedrag</span>
                  <span className="text-[9px] text-gray-400 font-medium italic leading-none">Inclusief BTW</span>
                </div>
                <span className="text-2xl lg:text-3xl font-black text-[#008000] tabular-nums">€{totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>

            <button 
              type="submit" 
              disabled={isSending}
              className={`w-full bg-[#008000] hover:bg-[#006400] text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-green-900/10 active:scale-95 flex items-center justify-center gap-3 text-sm`}
            >
              {isSending ? 'Verwerken...' : 'Nu Bestellen & Betalen'}
              {!isSending && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
