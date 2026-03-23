
import React from 'react';

interface OptionSectionProps {
  title: string;
  children: React.ReactNode;
}

export const OptionSection: React.FC<OptionSectionProps> = ({ title, children }) => {
  return (
    <div className="border-b border-gray-100 pb-4 lg:pb-5 last:border-b-0 last:pb-0">
      <h3 className="text-[9px] lg:text-[11px] font-bold text-gray-800 mb-2 lg:mb-2.5 uppercase tracking-widest">
        {title}
      </h3>
      {children}
    </div>
  );
};
