
import React from 'react';
import { type ColorOption } from '../types';

interface ColorSelectorProps<T extends string> {
  options: ColorOption[];
  selectedValue: T;
  onChange: (value: T) => void;
  disabledOptions?: T[];
}

// Fixed: Made ColorSelector generic to support both ClothColor and GutterColor
export const ColorSelector = <T extends string>({ 
  options, 
  selectedValue, 
  onChange, 
  disabledOptions = [] 
}: ColorSelectorProps<T>) => {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-4 lg:gap-4">
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        const isDisabled = disabledOptions.includes(option.value as T);
        return (
          <div key={option.value} className="flex flex-col items-center gap-1">
            <button
              type="button"
              title={`${option.label}${option.price > 0 ? ` (+ €${option.price})` : ''}`}
              onClick={() => !isDisabled && onChange(option.value as T)}
              disabled={isDisabled}
              className={`w-8 h-8 lg:w-11 lg:h-11 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#c8813f] relative
                ${isSelected ? 'border-[#c8813f] scale-110 shadow-sm' : 'border-gray-200'}
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
              `}
              style={{ background: option.colorCode }}
            >
              <span className="sr-only">{option.label}</span>
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-[#c8813f] text-white rounded-full p-0.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 lg:h-3 lg:w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
            <span className={`text-[7px] lg:text-[8px] font-bold uppercase tracking-tight text-center max-w-[50px] lg:max-w-[60px] leading-tight ${isSelected ? 'text-[#c8813f]' : 'text-gray-400'}`}>
              {option.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
