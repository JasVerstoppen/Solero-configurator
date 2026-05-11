import { type ParasolInstance } from './types';

export const getImageUrl = (item: ParasolInstance): string => {
  const config = item.config;
  const isDuo = config.size.startsWith('duo-');
  const baseUrl = isDuo 
    ? 'https://shop.parasols.nl/configurator-test/Bravo/duo/'
    : 'https://shop.parasols.nl/configurator-test/Bravo/';
    
  const { frameColor, clothColor, baseType } = config;

  // Rule: 5t- prefix is zilvergrijs (silver), otherwise black (no prefix).
  const framePrefix = frameColor === 'silver' ? '5t-' : '';
  
  const colorMapping: Record<string, string> = {
    'black': 'black',
    'platinum': 'grey',
    'white': 'white',
    'olive': 'olive',
    'red': 'red',
    'sand': 'sand',
    'taupe': 'taupe',
    'whiteblue': 'whiteblue'
  };
  const colorName = colorMapping[clothColor] || 'grey';

  // Base suffix logic for both Single and Duo images
  let baseSuffix = '';
  if (baseType === 'grey-base') {
    baseSuffix = '-base';
  } else if (baseType === 'grey-base-wheels') {
    baseSuffix = '-base-wheels';
  } else if (baseType === 'anchor') {
    baseSuffix = '-anchor';
  } else if (baseType === 'black-base' || baseType === 'black-base-wheels') {
    // Patterns found in list: black and sand use "blackbase", others use "baseblack"
    const baseName = (colorName === 'black' || colorName === 'sand') ? 'blackbase' : 'baseblack';
    const wheelsPart = baseType.includes('wheels') ? '-wheels' : '';
    baseSuffix = `-${baseName}${wheelsPart}`;
  }

  // Final construction
  return baseUrl + `${framePrefix}quattro-${colorName}${baseSuffix}.png`;
};
