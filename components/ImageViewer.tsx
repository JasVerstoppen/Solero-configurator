import React, { useState, useEffect, useMemo } from 'react';
import { BACKGROUND_OPTIONS } from '../constants';
import { type BackgroundId } from '../types';

interface ImageViewerProps {
  imageUrl: string;
  currentBackground: BackgroundId;
  onBackgroundChange: (id: BackgroundId) => void;
}

const ZOOM_LEVELS = [0.75, 1.0, 1.25, 1.5];

const Spinner: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div className="animate-spin rounded-full h-10 w-10 lg:h-16 lg:w-16 border-t-2 border-b-2 border-[#c8813f] bg-white/40 p-1 rounded-full shadow-lg"></div>
  </div>
);

const FallbackImage: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 z-10">
        <div className="text-center text-gray-500 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 lg:h-12 lg:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-xs lg:text-sm font-medium">Visualisatie niet beschikbaar</p>
        </div>
    </div>
)

export const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, currentBackground, onBackgroundChange }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [displayUrl, setDisplayUrl] = useState(imageUrl);
  const [zoomIndex, setZoomIndex] = useState(1); // Default to 100% (index 1 of [0.75, 1.0, 1.25, 1.5])

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setDisplayUrl(imageUrl);
      setIsLoading(false);
      setHasError(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
  }, [imageUrl]);

  const handleZoomIn = () => {
    setZoomIndex(prev => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
  };

  const handleZoomOut = () => {
    setZoomIndex(prev => Math.max(prev - 1, 0));
  };

  const currentZoom = ZOOM_LEVELS[zoomIndex];

  const selectedBg = useMemo(() => 
    BACKGROUND_OPTIONS.find(bg => bg.id === currentBackground),
    [currentBackground]
  );

  return (
    <div className="relative flex-1 bg-white flex items-center justify-center h-full overflow-hidden transition-colors duration-500">
      {/* Subtle Logo Watermark */}
      <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-20 opacity-30 pointer-events-none">
        <img src="https://shop.parasols.nl/media/queldorei/shopper/logo.png" alt="" className="h-6 lg:h-10 object-contain grayscale brightness-50" />
      </div>

      {/* Background Selector UI */}
      <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-30 flex flex-col gap-2 lg:gap-3">
        <h4 className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/60 px-1 rounded w-fit">Achtergrond</h4>
        <div className="flex gap-2">
            {BACKGROUND_OPTIONS.map((bg) => (
                <button
                    key={bg.id}
                    onClick={() => onBackgroundChange(bg.id)}
                    className={`group relative w-10 h-10 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-sm
                        ${currentBackground === bg.id ? 'border-[#c8813f] ring-2 ring-orange-50 scale-105' : 'border-white hover:border-gray-300 hover:scale-105'}
                    `}
                    title={bg.label}
                >
                    <img 
                        src={bg.thumbnail} 
                        alt={bg.label} 
                        className="w-full h-full object-cover"
                    />
                </button>
            ))}
        </div>
      </div>

      {/* Zoom Controls UI - Compact & Subtle on mobile */}
      <div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 z-[60] flex items-center gap-0.5 lg:gap-1 bg-white/80 lg:bg-white/90 backdrop-blur-md p-1 lg:p-1.5 rounded-full shadow-lg lg:shadow-xl border border-gray-100/50 lg:border-gray-100 transition-all duration-300">
        <button 
          onClick={handleZoomOut}
          disabled={zoomIndex === 0}
          className={`p-1.5 lg:p-2 rounded-full transition-all duration-200 ${zoomIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 active:scale-90'}`}
          aria-label="Uitzoomen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
          </svg>
        </button>
        
        <div className="px-1.5 lg:px-2 min-w-[42px] lg:min-w-[60px] text-center">
            <span className="text-[10px] lg:text-xs font-black text-gray-900 tabular-nums">
                {Math.round(currentZoom * 100)}%
            </span>
        </div>

        <button 
          onClick={handleZoomIn}
          disabled={zoomIndex === ZOOM_LEVELS.length - 1}
          className={`p-1.5 lg:p-2 rounded-full transition-all duration-200 ${zoomIndex === ZOOM_LEVELS.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 active:scale-90'}`}
          aria-label="Inzoomen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="relative w-full h-full flex items-center justify-center bg-gray-50/50">
        {isLoading && <Spinner />}
        
        {/* Background Layer */}
        {selectedBg?.url && (
            <div 
              className="absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out pointer-events-none origin-center"
              style={{ transform: `scale(${1 + (currentZoom - 1) * 0.15})` }}
            >
                <img
                    src={selectedBg.url}
                    alt="Scene background"
                    className="w-full h-full object-cover"
                />
            </div>
        )}

        {/* Parasol Layer */}
        {!hasError ? (
            <div 
              className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-500 ease-in-out origin-center"
              style={{ transform: `scale(${currentZoom})` }}
            >
                <img
                    src={displayUrl}
                    alt="Solero Basto Parasol"
                    className={`object-contain w-full h-full p-6 lg:p-12 drop-shadow-2xl transition-opacity duration-300 ${isLoading ? 'opacity-80' : 'opacity-100'}`}
                />
            </div>
        ) : (
            <FallbackImage />
        )}
      </div>

      {/* Product Tag Badge */}
      <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 z-30 pointer-events-none">
          <div className="bg-white/70 lg:bg-white/80 backdrop-blur-sm px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full shadow-sm border border-gray-100/30 lg:border-gray-100">
              <span className="text-[8px] lg:text-[10px] font-bold text-gray-900 tracking-wider uppercase">SOLERO BASTO</span>
          </div>
      </div>
    </div>
  );
};