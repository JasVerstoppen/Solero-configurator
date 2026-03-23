
import { type Configuration, type OptionsData, type BackgroundOption } from './types';

export const DEFAULT_CONFIGURATION: Configuration = {
  size: '4x4',
  clothColor: 'charcoal',
  baseType: 'zonder-voet',
  heaters: '0',
  lux: false,
  tegels: false,
  afdekplaat: false,
  wielen: false,
  protectiveCover: true,
  background: 'none',
  gutterEnabled: false,
  gutterLength: '300',
  gutterColor: 'zwart',
};

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'none',
    label: 'Geen',
    url: null,
    thumbnail: 'https://placehold.co/100x100/e2e8f0/64748b?text=Geen',
  },
  {
    id: 'garden-1',
    label: 'Tuin 1',
    url: 'https://shop.parasols.nl/configurator-test/Basto/Background/background-basto-1.png',
    thumbnail: 'https://shop.parasols.nl/configurator-test/Basto/Background/background-basto-1.png',
  }
];

export const OPTIONS_DATA: OptionsData = {
  basePrice: 2199.00,
  size: {
    label: 'Afmeting',
    options: [
      { value: '4x4', label: 'Basto 4x4', price: 0 },
      { value: '5x5', label: 'Basto 5x5', price: 300.00 },
    ],
  },
  clothColor: {
    label: 'Doekkleur',
    options: [
        { value: 'charcoal', label: 'Charcoal', price: 0, colorCode: '#36454F' },
        { value: 'marine', label: 'Marine', price: 0, colorCode: '#000080' },
        { value: 'parelwit', label: 'Parelwit', price: 0, colorCode: '#F8F8FF' },
        { value: 'platinumgrijs', label: 'Platinumgrijs', price: 0, colorCode: '#a9a9a9' },
        { value: 'rood', label: 'Rood', price: 0, colorCode: '#FF0000' },
        { value: 'spa', label: 'Spa', price: 0, colorCode: '#A9D7D1' },
        { value: 'taupe', label: 'Taupe', price: 0, colorCode: '#483C32' },
        { value: 'zand', label: 'Zand', price: 0, colorCode: '#C2B280' },
        { value: 'zwart', label: 'Zwart', price: 0, colorCode: '#000000' },
    ],
  },
  baseType: {
    label: 'Voettype',
    options: [
      { value: 'zonder-voet', label: 'Zonder voet', price: 0 },
      { value: 'grondanker', label: 'Grondanker', price: 199.00 },
      { value: 'tegelstandaardzilver', label: 'Tegelstandaard', price: 325.00 },
      { value: 'veiligheidstandaard', label: 'Veiligheidstandaard', price: 399.00 },
    ],
  },
  heaters: {
      label: 'Heliosa Heaters',
      options: [
        { value: '0', label: 'Geen', price: 0 },
        { value: '1', label: '1 Heater', price: 249.00 },
        { value: '2', label: '2 Heaters', price: 498.00 },
        { value: '3', label: '3 Heaters', price: 747.00 },
        { value: '4', label: '4 Heaters', price: 996.00 },
      ]
  },
  lux: { label: 'LUX LED Verlichting', price: 199.99 },
  tegels: { label: 'Met Tegels', price: 111.32 },
  afdekplaat: { label: 'Met Afdekplaat', price: 189.00 },
  wielen: { label: '75mm Zwenkwielen', price: 98.00 },
  protectiveCover: { label: 'Beschermhoes', price: 0 },
  gutter: {
    basePrice: 149.00,
    lengths: [
      { value: '300', label: '300 cm', price: 0 },
      { value: '330', label: '330 cm', price: 15.00 },
      { value: '350', label: '350 cm', price: 25.00 },
      { value: '400', label: '400 cm', price: 45.00 },
      { value: '500', label: '500 cm', price: 85.00 },
    ],
    colors: [
      { value: 'zwart', label: 'Zwart', price: 0, colorCode: '#000000' },
      { value: 'wit', label: 'Wit', price: 0, colorCode: '#FFFFFF' },
      { value: 'grijs', label: 'Grijs', price: 0, colorCode: '#808080' },
      { value: 'taupe', label: 'Taupe', price: 0, colorCode: '#483C32' },
    ]
  }
};
