
import React from 'react';
import { type Option } from '../types';

interface RadioButtonGroupProps<T extends string> {
  options: Option<T>[];
  selectedValue: T;
  name: string;
  onChange: (value: T) => void;
  disabledOptions?: T[];
}

export const RadioButtonGroup = <T extends string>({
  options,
  selectedValue,
  name,
  onChange,
  disabledOptions = [],
}: RadioButtonGroupProps<T>) => {
  return (
    <div className="flex flex-wrap gap-x-1 lg:gap-x-1.5 gap-y-1.5 lg:gap-y-2">
      {options.map((option) => {
        const isDisabled = disabledOptions.includes(option.value);
        const isSelected = selectedValue === option.value;
        return (
          <div key={option.value} className="relative flex">
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              disabled={isDisabled}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className={`
                relative z-10 inline-flex flex-col items-center justify-center px-2 py-1 lg:px-3 lg:py-1.5 text-center min-w-[60px] lg:min-w-[75px] rounded-md border transition-all duration-200 select-none
                ${
                  isSelected
                    ? 'bg-[#c8813f] border-[#c8813f] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }
                ${
                  isDisabled
                    ? 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'cursor-pointer'
                }
              `}
            >
              <span className="text-[10px] lg:text-[11px] font-bold leading-tight">{option.label}</span>
              {option.price > 0 && (
                <span className={`text-[8px] lg:text-[9px] mt-0.5 font-medium ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  + €{option.price.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
                </span>
              )}
            </label>
          </div>
        );
      })}
    </div>
  );
};
