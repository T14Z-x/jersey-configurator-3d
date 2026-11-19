export type SportId = 'baseball' | 'basketball' | 'soccer' | 'rugby';

export type CutId = 'men' | 'women' | 'youth';

export type CollarStyle =
  | 'baseball-full'
  | 'henley-2'
  | 'v-neck'
  | 'crew'
  | 'polo';

export type SleeveStyle = 'short' | 'raglan' | 'long' | 'sleeveless';

export type FabricType = 'pro-mesh' | 'micro-interlock' | 'pique' | 'matte-poly';

export type PatternId =
  | 'solid'
  | 'pinstripes'
  | 'raglan-classic'
  | 'hoops'
  | 'chevron'
  | 'sash'
  | 'side-panels'
  | 'gradient'
  | 'geometric'
  | 'bolts';

export type FontId = 'athletic' | 'varsity' | 'condensed' | 'script' | 'modern';

export type TextCurve = 'straight' | 'arch' | 'slanted';

export type LogoSlot =
  | 'left-chest'
  | 'right-chest'
  | 'center-chest'
  | 'left-sleeve'
  | 'right-sleeve'
  | 'back-neck';

export interface LogoPlacement {
  id: string;
  slot: LogoSlot;
  name: string;
  src: string; // data URL or built-in SVG data URL
  scale: number; // 0.5 to 1.8
  offsetX: number; // -40 to 40
  offsetY: number; // -40 to 40
  opacity: number; // 0.2 to 1
}

export interface JerseyColors {
  primary: string;
  secondary: string;
  accent: string;
  collar: string;
  buttons: string;
}

export interface TeamTextConfig {
  enabled: boolean;
  text: string;
  font: FontId;
  curve: TextCurve;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  size: number; // 0.6 to 1.5
  offsetY: number; // -30 to 30
}

export interface NumberConfig {
  enabled: boolean;
  text: string;
  font: FontId;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  size: number;
  placement?: 'left-chest' | 'center-below';
}

export interface PlayerNameConfig {
  enabled: boolean;
  text: string;
  font: FontId;
  curve: TextCurve;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  size: number;
}

export interface JerseyConfig {
  sport: SportId;
  cut: CutId;
  collar: CollarStyle;
  sleeve: SleeveStyle;
  fabric: FabricType;
  pattern: PatternId;
  piping: boolean;
  colors: JerseyColors;
  teamName: TeamTextConfig;
  frontNumber: NumberConfig;
  playerName: PlayerNameConfig;
  backNumber: NumberConfig;
  logos: LogoPlacement[];
}

export type CameraPreset = 'front' | 'back' | 'left' | 'right' | 'three-quarter';

export type BackdropMode = 'studio-dark' | 'studio-light' | 'arena';

export type EditorTab =
  | 'sport'
  | 'pattern'
  | 'colors'
  | 'text'
  | 'logos'
  | 'saved';

export interface RosterEntry {
  id: string;
  playerName: string;
  number: string;
  size: 'YXS' | 'YS' | 'YM' | 'YL' | 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL';
  cut: CutId;
  qty: number;
}

export interface SavedDesign {
  id: string;
  name: string;
  createdAt: string;
  thumbnail: string;
  config: JerseyConfig;
}
