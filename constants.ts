
import { type Configuration, type OptionsData, type BackgroundOption } from './types';

export const DEFAULT_CONFIGURATION: Configuration = {
  size: '520x520',
  frameColor: 'silver',
  clothColor: 'grey',
  baseType: 'none',
  heaters: '0',
  protectiveCover: true,
  background: 'none',
  ledEnabled: true,
  gutterEnabled: true,
  gutterLength: '300',
  gutterColor: 'grijs',
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
  basePrice: 0,
  size: {
    label: 'Afmeting',
    options: [
      { value: '520x520', label: 'Basto 520x520', price: 0 },
      { value: '620x620', label: 'Basto 620x620', price: 0 },
    ],
  },
  frameColor: {
    label: 'Frame kleur',
    options: [
      { value: 'silver', label: 'Zilvergrijs', price: 0 },
      { value: 'black', label: 'Zwart', price: 0 },
    ],
  },
  clothColor: {
    label: 'Doekkleur',
    options: [
        { value: 'grey', label: 'Platinumgrijs', price: 0, colorCode: '#A9A9A9' },
        { value: 'olive', label: 'Olijf', price: 0, colorCode: '#808000' },
        { value: 'red', label: 'Rood', price: 0, colorCode: '#FF0000' },
        { value: 'sand', label: 'Zand', price: 0, colorCode: '#E6D2B5' },
        { value: 'taupe', label: 'Taupe', price: 0, colorCode: '#483C32' },
        { value: 'white', label: 'Parelwit', price: 0, colorCode: '#F8F8FF' },
        { value: 'whiteblue', label: 'Wit Blauw gestreept', price: 0, colorCode: 'repeating-linear-gradient(45deg, #ffffff, #ffffff 5px, #000080 5px, #000080 10px)' },
        { value: 'black', label: 'Zwart', price: 0, colorCode: '#000000' },
    ],
  },
  baseType: {
    label: 'Voettype',
    options: [
      { value: 'none', label: 'Zonder voet', price: 0 },
      { value: 'grey-base', label: 'Grijze voet', price: 0 },
      { value: 'grey-base-wheels', label: 'Grijze voet op wielen', price: 0 },
      { value: 'black-base', label: 'Zwarte voet', price: 0 },
      { value: 'black-base-wheels', label: 'Zwarte voet op wielen', price: 0 },
      { value: 'anchor', label: 'Grondanker', price: 0 },
    ],
  },
  heaters: {
      label: 'Heliosa Heaters',
      options: [
        { value: '0', label: 'Geen', price: 0 },
        { value: '1', label: '1 Heater', price: 0 },
        { value: '2', label: '2 Heaters', price: 0 },
        { value: '3', label: '3 Heaters', price: 0 },
        { value: '4', label: '4 Heaters', price: 0 },
      ]
  },
  protectiveCover: { label: 'Beschermhoes', price: 0 },
  led: { label: 'Geïntegreerde LED verlichting op accu', price: 0 },
  gutter: {
    label: 'Regengoten',
    basePrice: 0,
    lengths: [
      { value: '300', label: '300 cm', price: 0 },
      { value: '330', label: '330 cm', price: 0 },
      { value: '350', label: '350 cm', price: 0 },
      { value: '400', label: '400 cm', price: 0 },
      { value: '500', label: '500 cm', price: 0 },
    ],
    colors: [
      { value: 'zwart', label: 'Zwart', price: 0, colorCode: '#000000' },
      { value: 'wit', label: 'Wit', price: 0, colorCode: '#FFFFFF' },
      { value: 'grijs', label: 'Grijs', price: 0, colorCode: '#808080' },
      { value: 'taupe', label: 'Taupe', price: 0, colorCode: '#483C32' },
    ]
  }
};
