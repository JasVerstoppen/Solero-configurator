
export type Size = '4x4' | '5x5';

export type ClothColor = 'charcoal' | 'marine' | 'parelwit' | 'platinumgrijs' | 'rood' | 'spa' | 'taupe' | 'zand' | 'zwart';

export type BaseType = 'zonder-voet' | 'grondanker' | 'tegelstandaardzilver' | 'veiligheidstandaard';

export type Heaters = '0' | '1' | '2' | '3' | '4';

export type BackgroundId = 'none' | 'garden-1';

export type GutterColor = 'zwart' | 'wit' | 'grijs' | 'taupe';
export type GutterLength = '300' | '330' | '350' | '400' | '500';

export interface Configuration {
  size: Size;
  clothColor: ClothColor;
  baseType: BaseType;
  heaters: Heaters;
  lux: boolean;
  tegels: boolean;
  afdekplaat: boolean;
  wielen: boolean;
  protectiveCover: boolean;
  background: BackgroundId;
  // Gutter integrated into parasol config
  gutterEnabled: boolean;
  gutterLength: GutterLength;
  gutterColor: GutterColor;
}

export interface ParasolInstance {
  id: string;
  label: string;
  config: Configuration;
}

// ConfigItem is now synonymous with ParasolInstance for this project
export type ConfigItem = ParasolInstance;

export interface Option<T> {
  value: T;
  label: string;
  price: number;
}

export interface ColorOption extends Option<string> {
  colorCode: string;
}

export interface BackgroundOption {
  id: BackgroundId;
  label: string;
  url: string | null;
  thumbnail: string;
}

export interface OptionsData {
  basePrice: number;
  size: { label: string; options: Option<Size>[] };
  clothColor: { label: string; options: ColorOption[] };
  baseType: { label: string; options: Option<BaseType>[] };
  heaters: { label: string; options: Option<Heaters>[] };
  lux: { label: string; price: number };
  tegels: { label: string; price: number };
  afdekplaat: { label: string; price: number };
  wielen: { label: string; price: number };
  protectiveCover: { label: string; price: number };
  gutter: {
    basePrice: number;
    lengths: Option<GutterLength>[];
    colors: ColorOption[];
  };
}
