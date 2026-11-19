import {
  CollarStyle,
  CutId,
  FabricType,
  FontId,
  JerseyConfig,
  LogoSlot,
  PatternId,
  SleeveStyle,
  SportId,
} from '../types/jersey';

export interface SwatchColor {
  name: string;
  slug: string;
  hex: string;
}

export const ATHLETIC_SWATCHES: SwatchColor[] = [
  { name: 'Maroon', slug: 'maroon', hex: '#6E1324' },
  { name: 'Crimson', slug: 'crimson', hex: '#B91C1C' },
  { name: 'Scarlet', slug: 'scarlet', hex: '#DC2626' },
  { name: 'Navy', slug: 'navy', hex: '#132247' },
  { name: 'Royal Blue', slug: 'royal', hex: '#1D4ED8' },
  { name: 'Sky Blue', slug: 'sky', hex: '#38BDF8' },
  { name: 'Teal', slug: 'teal', hex: '#0D9488' },
  { name: 'Forest Green', slug: 'forest', hex: '#14532D' },
  { name: 'Kelly Green', slug: 'kelly', hex: '#16A34A' },
  { name: 'Athletic Gold', slug: 'gold', hex: '#EAB308' },
  { name: 'Vegas Gold', slug: 'vegas-gold', hex: '#C5A059' },
  { name: 'Blaze Orange', slug: 'orange', hex: '#EA580C' },
  { name: 'Purple', slug: 'purple', hex: '#6B21A8' },
  { name: 'White', slug: 'white', hex: '#F8FAFC' },
  { name: 'Cream', slug: 'cream', hex: '#F3ECD8' },
  { name: 'Silver', slug: 'silver', hex: '#CBD5E1' },
  { name: 'Charcoal', slug: 'charcoal', hex: '#334155' },
  { name: 'Jet Black', slug: 'black', hex: '#111317' },
];

export const COLOR_THEMES = [
  {
    name: 'Maroon Classic',
    colors: {
      primary: '#6E1324',
      secondary: '#F8FAFC',
      accent: '#C5A059',
      collar: '#6E1324',
      buttons: '#F8FAFC',
    },
  },
  {
    name: 'Navy & Gold',
    colors: {
      primary: '#132247',
      secondary: '#EAB308',
      accent: '#F8FAFC',
      collar: '#132247',
      buttons: '#EAB308',
    },
  },
  {
    name: 'Blackout Crimson',
    colors: {
      primary: '#111317',
      secondary: '#DC2626',
      accent: '#F8FAFC',
      collar: '#DC2626',
      buttons: '#DC2626',
    },
  },
  {
    name: 'Forest & Cream',
    colors: {
      primary: '#14532D',
      secondary: '#F3ECD8',
      accent: '#C5A059',
      collar: '#14532D',
      buttons: '#F3ECD8',
    },
  },
  {
    name: 'Pinstripe Home',
    colors: {
      primary: '#F8FAFC',
      secondary: '#132247',
      accent: '#DC2626',
      collar: '#132247',
      buttons: '#132247',
    },
  },
  {
    name: 'Royal Storm',
    colors: {
      primary: '#1D4ED8',
      secondary: '#111317',
      accent: '#38BDF8',
      collar: '#111317',
      buttons: '#F8FAFC',
    },
  },
];

export interface SportMeta {
  id: SportId;
  name: string;
  tagline: string;
  basePrice: number;
  defaultCollar: CollarStyle;
  defaultSleeve: SleeveStyle;
  defaultPattern: PatternId;
  defaultTeam: string;
}

export const SPORTS: SportMeta[] = [
  {
    id: 'baseball',
    name: 'Baseball',
    tagline: 'Button-down & raglan diamond kits',
    basePrice: 54,
    defaultCollar: 'baseball-full',
    defaultSleeve: 'short',
    defaultPattern: 'pinstripes',
    defaultTeam: 'TITANS',
  },
  {
    id: 'basketball',
    name: 'Basketball',
    tagline: 'Pro sleeveless court singlets',
    basePrice: 46,
    defaultCollar: 'v-neck',
    defaultSleeve: 'sleeveless',
    defaultPattern: 'side-panels',
    defaultTeam: 'METRO',
  },
  {
    id: 'soccer',
    name: 'Soccer',
    tagline: 'Lightweight sublimated match tops',
    basePrice: 48,
    defaultCollar: 'v-neck',
    defaultSleeve: 'short',
    defaultPattern: 'chevron',
    defaultTeam: 'UNITED FC',
  },
  {
    id: 'rugby',
    name: 'Rugby',
    tagline: 'Heavy-duty reinforced match jerseys',
    basePrice: 58,
    defaultCollar: 'polo',
    defaultSleeve: 'short',
    defaultPattern: 'hoops',
    defaultTeam: 'BARBARIANS',
  },
];

export const CUTS: { id: CutId; name: string; desc: string }[] = [
  { id: 'men', name: "Men's", desc: 'Athletic tapered cut' },
  { id: 'women', name: "Women's", desc: 'Contoured tailored fit' },
  { id: 'youth', name: 'Youth', desc: 'Junior pro proportions' },
];

export const COLLARS: { id: CollarStyle; name: string }[] = [
  { id: 'baseball-full', name: 'Full Button' },
  { id: 'henley-2', name: '2-Button Henley' },
  { id: 'v-neck', name: 'Pro V-Neck' },
  { id: 'crew', name: 'Crew Neck' },
  { id: 'polo', name: 'Rugby Polo' },
];

export const SLEEVES: { id: SleeveStyle; name: string }[] = [
  { id: 'short', name: 'Short Sleeve' },
  { id: 'raglan', name: 'Raglan' },
  { id: 'long', name: 'Long Sleeve' },
  { id: 'sleeveless', name: 'Sleeveless' },
];

export const FABRICS: { id: FabricType; name: string; gsm: string }[] = [
  { id: 'pro-mesh', name: 'Pro Mesh', gsm: '165 GSM Breathable' },
  { id: 'micro-interlock', name: 'Micro Interlock', gsm: '180 GSM Smooth' },
  { id: 'pique', name: 'Performance Pique', gsm: '220 GSM Textured' },
  { id: 'matte-poly', name: 'Matte Poly Elite', gsm: '150 GSM Aero' },
];

export const PATTERNS: { id: PatternId; name: string; tag: string }[] = [
  { id: 'solid', name: 'Classic Solid', tag: 'Clean' },
  { id: 'pinstripes', name: 'Pro Pinstripes', tag: 'Baseball' },
  { id: 'raglan-classic', name: 'Raglan Contrast', tag: 'Heritage' },
  { id: 'hoops', name: 'Chest Hoops', tag: 'Rugby' },
  { id: 'chevron', name: 'V-Chevron', tag: 'Dynamic' },
  { id: 'sash', name: 'Diagonal Sash', tag: 'Club' },
  { id: 'side-panels', name: 'Pro Side Panels', tag: 'Court' },
  { id: 'gradient', name: 'Sublimation Fade', tag: 'Modern' },
  { id: 'geometric', name: 'Geo Shatter', tag: 'Esports' },
  { id: 'bolts', name: 'Velocity Stripes', tag: 'Speed' },
];

export const FONTS: { id: FontId; name: string; cssFamily: string }[] = [
  { id: 'athletic', name: 'Athletic Block', cssFamily: '"Oswald", Impact, sans-serif' },
  { id: 'varsity', name: 'Varsity Slab', cssFamily: '"Graduate", Georgia, serif' },
  { id: 'condensed', name: 'Pro Condensed', cssFamily: '"Bebas Neue", Impact, sans-serif' },
  { id: 'script', name: 'Classic Script', cssFamily: '"Pacifico", cursive' },
  { id: 'modern', name: 'Modern Sans', cssFamily: '"Inter", system-ui, sans-serif' },
];

export const LOGO_SLOTS: { id: LogoSlot; label: string }[] = [
  { id: 'left-chest', label: 'Left Chest' },
  { id: 'right-chest', label: 'Right Chest' },
  { id: 'center-chest', label: 'Center Chest' },
  { id: 'left-sleeve', label: 'Left Sleeve' },
  { id: 'right-sleeve', label: 'Right Sleeve' },
  { id: 'back-neck', label: 'Back Locker Tag' },
];

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const BUILTIN_LOGOS: { id: string; name: string; src: string }[] = [
  {
    id: 'shield-crest',
    name: 'Pro Shield Crest',
    src: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <path d="M60 8 L104 24 V60 C104 88 84 106 60 114 C36 106 16 88 16 60 V24 Z" fill="#111317" stroke="#EAB308" stroke-width="6"/>
      <path d="M60 18 L94 30 V59 C94 81 79 96 60 103 C41 96 26 81 26 59 V30 Z" fill="#6E1324"/>
      <polygon points="60,34 66,50 83,50 69,60 74,76 60,66 46,76 51,60 37,50 54,50" fill="#F8FAFC"/>
    </svg>`),
  },
  {
    id: 'baseball-diamond',
    name: 'Diamond Club',
    src: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <polygon points="60,8 112,60 60,112 8,60" fill="#F8FAFC" stroke="#111317" stroke-width="6"/>
      <circle cx="60" cy="60" r="28" fill="#F8FAFC" stroke="#DC2626" stroke-width="4"/>
      <path d="M44 40 Q56 60 44 80 M76 40 Q64 60 76 80" fill="none" stroke="#DC2626" stroke-width="3.5" stroke-dasharray="4 3"/>
    </svg>`),
  },
  {
    id: 'lightning-bolt',
    name: 'Strike Bolt',
    src: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="52" fill="#132247" stroke="#38BDF8" stroke-width="6"/>
      <polygon points="68,16 32,64 56,64 48,104 88,52 62,52" fill="#EAB308" stroke="#111317" stroke-width="3"/>
    </svg>`),
  },
  {
    id: 'crown-elite',
    name: 'Royal Crown',
    src: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <path d="M14 86 L24 38 L46 62 L60 28 L74 62 L96 38 L106 86 Z" fill="#EAB308" stroke="#111317" stroke-width="5" stroke-linejoin="round"/>
      <rect x="16" y="88" width="88" height="14" rx="4" fill="#111317"/>
      <circle cx="60" cy="24" r="6" fill="#F8FAFC"/>
      <circle cx="24" cy="34" r="5" fill="#F8FAFC"/>
      <circle cx="96" cy="34" r="5" fill="#F8FAFC"/>
    </svg>`),
  },
  {
    id: 'wings-emblem',
    name: 'Apex Wings',
    src: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <path d="M10 42 L48 54 L60 28 L72 54 L110 42 L94 68 L102 82 L60 94 L18 82 L26 68 Z" fill="#F8FAFC" stroke="#111317" stroke-width="5" stroke-linejoin="round"/>
      <polygon points="60,44 68,66 60,82 52,66" fill="#DC2626"/>
    </svg>`),
  },
  {
    id: 'dyo-badge',
    name: 'DYO Pro Mark',
    src: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect x="10" y="28" width="100" height="64" rx="12" fill="#111317" stroke="#F8FAFC" stroke-width="5"/>
      <text x="60" y="72" text-anchor="middle" font-family="Impact, sans-serif" font-size="38" fill="#F8FAFC" letter-spacing="3">DYO</text>
    </svg>`),
  },
];

export const DEFAULT_JERSEY_CONFIG: JerseyConfig = {
  sport: 'baseball',
  cut: 'men',
  collar: 'baseball-full',
  sleeve: 'short',
  fabric: 'pro-mesh',
  pattern: 'pinstripes',
  piping: true,
  colors: {
    primary: '#6E1324', // Maroon — matches the BLK link!
    secondary: '#F8FAFC',
    accent: '#C5A059',
    collar: '#6E1324',
    buttons: '#F8FAFC',
  },
  teamName: {
    enabled: true,
    text: 'TITANS',
    font: 'varsity',
    curve: 'arch',
    color: '#F8FAFC',
    outlineColor: '#C5A059',
    outlineWidth: 4,
    size: 1.0,
    offsetY: 0,
  },
  frontNumber: {
    enabled: true,
    text: '24',
    font: 'athletic',
    color: '#F8FAFC',
    outlineColor: '#C5A059',
    outlineWidth: 3,
    size: 1.0,
    placement: 'left-chest',
  },
  playerName: {
    enabled: true,
    text: 'MILLER',
    font: 'athletic',
    curve: 'arch',
    color: '#F8FAFC',
    outlineColor: '#111317',
    outlineWidth: 2,
    size: 1.0,
  },
  backNumber: {
    enabled: true,
    text: '24',
    font: 'athletic',
    color: '#F8FAFC',
    outlineColor: '#C5A059',
    outlineWidth: 5,
    size: 1.0,
  },
  logos: [
    {
      id: 'default-sleeve-logo',
      slot: 'left-sleeve',
      name: 'Pro Shield Crest',
      src: BUILTIN_LOGOS[0].src,
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
      opacity: 1,
    },
  ],
};

export function findColorSlug(hex: string): string {
  const lower = hex.toLowerCase();
  const match = ATHLETIC_SWATCHES.find((s) => s.hex.toLowerCase() === lower);
  return match ? match.slug : lower.replace('#', '');
}
