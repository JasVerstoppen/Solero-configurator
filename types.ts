
export type Size = '520x520' | '620x620';

export type FrameColor = 'silver' | 'black';

export type ClothColor = 'grey' | 'olive' | 'red' | 'taupe' | 'white' | 'whiteblue' | 'black' | 'sand';

export type BaseType = 'none' | 'grey-base' | 'grey-base-wheels' | 'black-base' | 'black-base-wheels' | 'anchor';

export type Heaters = '0' | '1' | '2' | '3' | '4';

export type BackgroundId = 'none' | 'garden-1';

export type GutterColor = 'zwart' | 'wit' | 'grijs' | 'taupe';
export type GutterLength = '300' | '330' | '350' | '400' | '500';

export interface Configuration {
  size: Size;
  frameColor: FrameColor;
  clothColor: ClothColor;
  baseType: BaseType;
  heaters: Heaters;
  protectiveCover: boolean;
  background: BackgroundId;
  ledEnabled: boolean;
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
  frameColor: { label: string; options: Option<FrameColor>[] };
  clothColor: { label: string; options: ColorOption[] };
  baseType: { label: string; options: Option<BaseType>[] };
  heaters: { label: string; options: Option<Heaters>[] };
  protectiveCover: { label: string; price: number };
  led: { label: string; price: number };
  gutter: {
    label: string;
    basePrice: number;
    lengths: Option<GutterLength>[];
    colors: ColorOption[];
  };
}
