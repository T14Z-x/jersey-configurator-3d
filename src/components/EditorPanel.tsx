import React, { useRef, useState } from 'react';
import {
  ArrowLeftRight,
  BookmarkPlus,
  Shuffle,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ATHLETIC_SWATCHES,
  BUILTIN_LOGOS,
  COLLARS,
  COLOR_THEMES,
  CUTS,
  FABRICS,
  FONTS,
  LOGO_SLOTS,
  PATTERNS,
  SLEEVES,
  SPORTS,
} from '../data/presets';
import {
  EditorTab,
  JerseyConfig,
  LogoPlacement,
  LogoSlot,
  PatternId,
  SavedDesign,
  SportId,
  TextCurve,
} from '../types/jersey';
import { ColorPickerRow } from './ColorPickerRow';

interface EditorPanelProps {
  activeTab: EditorTab;
  config: JerseyConfig;
  onChange: (next: JerseyConfig) => void;
  savedDesigns: SavedDesign[];
  onSaveDesign: (name: string) => void;
  onLoadDesign: (design: SavedDesign) => void;
  onDeleteDesign: (id: string) => void;
  onFocusBack?: () => void;
  onFocusFront?: () => void;
}

const PatternPreviewSvg: React.FC<{
  id: PatternId;
  primary: string;
  secondary: string;
  accent: string;
}> = ({ id, primary, secondary, accent }) => {
  return (
    <svg viewBox="0 0 80 88" className="w-full h-16 rounded-md overflow-hidden bg-zinc-950">
      <defs>
        <clipPath id={`clip-${id}`}>
          <path d="M22 8 L32 4 Q40 12 48 4 L58 8 L74 22 L66 36 L58 30 V82 H22 V30 L14 36 L6 22 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        <rect width="80" height="88" fill={primary} />
        {id === 'pinstripes' &&
          [14, 22, 30, 38, 46, 54, 62].map((x) => (
            <rect key={x} x={x} y={0} width={2} height={88} fill={secondary} />
          ))}
        {id === 'raglan-classic' && (
          <>
            <polygon points="0,0 30,0 0,40" fill={secondary} />
            <polygon points="80,0 50,0 80,40" fill={secondary} />
            <line x1="30" y1="0" x2="0" y2="40" stroke={accent} strokeWidth="2.5" />
            <line x1="50" y1="0" x2="80" y2="40" stroke={accent} strokeWidth="2.5" />
          </>
        )}
        {id === 'hoops' && (
          <>
            <rect x="0" y="24" width="80" height="12" fill={secondary} />
            <rect x="0" y="48" width="80" height="12" fill={secondary} />
            <rect x="0" y="22" width="80" height="2" fill={accent} />
            <rect x="0" y="60" width="80" height="2" fill={accent} />
          </>
        )}
        {id === 'chevron' && (
          <>
            <polygon points="10,20 40,46 70,20 70,32 40,58 10,32" fill={secondary} />
            <polygon points="10,36 40,62 70,36 70,41 40,67 10,41" fill={accent} />
          </>
        )}
        {id === 'sash' && (
          <polygon
            points="18,0 32,0 66,88 52,88"
            fill={secondary}
            stroke={accent}
            strokeWidth="2"
          />
        )}
        {id === 'side-panels' && (
          <>
            <rect x="20" y="0" width="8" height="88" fill={secondary} />
            <rect x="52" y="0" width="8" height="88" fill={secondary} />
            <rect x="28" y="0" width="2.5" height="88" fill={accent} />
            <rect x="49.5" y="0" width="2.5" height="88" fill={accent} />
          </>
        )}
        {id === 'gradient' && (
          <>
            <defs>
              <linearGradient id="grad-prev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primary} />
                <stop offset="100%" stopColor={secondary} />
              </linearGradient>
            </defs>
            <rect width="80" height="88" fill="url(#grad-prev)" />
          </>
        )}
        {id === 'geometric' && (
          <>
            <polygon points="10,44 38,66 10,88" fill={secondary} opacity="0.65" />
            <polygon points="70,40 44,68 70,88" fill={secondary} opacity="0.55" />
            <polygon points="24,62 56,56 40,88" fill={accent} opacity="0.65" />
          </>
        )}
        {id === 'bolts' && (
          <>
            <polygon points="16,46 34,30 34,38 16,54" fill={secondary} />
            <polygon points="16,58 34,42 34,50 16,66" fill={secondary} />
            <polygon points="64,46 46,30 46,38 64,54" fill={secondary} />
            <polygon points="64,58 46,42 46,50 64,66" fill={secondary} />
            <rect x="0" y="76" width="80" height="4" fill={accent} />
          </>
        )}
      </g>
      <path
        d="M22 8 L32 4 Q40 12 48 4 L58 8 L74 22 L66 36 L58 30 V82 H22 V30 L14 36 L6 22 Z"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export const EditorPanel: React.FC<EditorPanelProps> = ({
  activeTab,
  config,
  onChange,
  savedDesigns,
  onSaveDesign,
  onLoadDesign,
  onDeleteDesign,
  onFocusBack,
  onFocusFront,
}) => {
  const [selectedLogoSlot, setSelectedLogoSlot] = useState<LogoSlot>('left-chest');
  const [saveName, setSaveName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSportChange = (sportId: SportId) => {
    const meta = SPORTS.find((s) => s.id === sportId);
    if (!meta) return;
    onChange({
      ...config,
      sport: sportId,
      collar: meta.defaultCollar,
      sleeve: meta.defaultSleeve,
      pattern: meta.defaultPattern,
      teamName: {
        ...config.teamName,
        text: meta.defaultTeam,
      },
    });
  };

  const handleSwapColors = () => {
    onChange({
      ...config,
      colors: {
        ...config.colors,
        primary: config.colors.secondary,
        secondary: config.colors.primary,
      },
    });
  };

  const handleRandomizeColors = () => {
    const pick = () =>
      ATHLETIC_SWATCHES[Math.floor(Math.random() * ATHLETIC_SWATCHES.length)].hex;
    const primary = pick();
    let secondary = pick();
    while (secondary === primary) secondary = pick();
    const accent = pick();
    onChange({
      ...config,
      colors: {
        primary,
        secondary,
        accent,
        collar: primary,
        buttons: secondary,
      },
    });
  };

  const addLogo = (name: string, src: string) => {
    const newLogo: LogoPlacement = {
      id: `logo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      slot: selectedLogoSlot,
      name,
      src,
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
      opacity: 1.0,
    };
    onChange({
      ...config,
      logos: [...config.logos, newLogo],
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        addLogo(file.name.replace(/\.[^.]+$/, ''), reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const updateLogo = (id: string, patch: Partial<LogoPlacement>) => {
    onChange({
      ...config,
      logos: config.logos.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  };

  const removeLogo = (id: string) => {
    onChange({
      ...config,
      logos: config.logos.filter((l) => l.id !== id),
    });
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-6">
      {/* SPORT & CUT TAB */}
      {activeTab === 'sport' && (
        <>
          <section className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Select Sport
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {SPORTS.map((s) => {
                const active = config.sport === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSportChange(s.id)}
                    className={`text-left p-2.5 rounded-xl border transition ${
                      active
                        ? 'bg-rose-600/15 border-rose-500 text-white shadow-sm'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{s.name}</span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        ${s.basePrice}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      {s.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. Cut / Gender Fit
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {CUTS.map((c) => {
                const active = config.cut === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onChange({ ...config, cut: c.id })}
                    className={`py-2 px-2 rounded-lg border text-center transition ${
                      active
                        ? 'bg-rose-600 border-rose-500 text-white font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <div className="text-xs font-semibold">{c.name}</div>
                    <div className="text-[10px] opacity-75 mt-0.5 truncate">
                      {c.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              3. Collar & Neckline
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {COLLARS.map((col) => {
                const active = config.collar === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => onChange({ ...config, collar: col.id })}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium text-left transition ${
                      active
                        ? 'bg-zinc-100 text-zinc-950 border-white font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    {col.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              4. Sleeve Style
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {SLEEVES.map((sl) => {
                const active = config.sleeve === sl.id;
                return (
                  <button
                    key={sl.id}
                    onClick={() => onChange({ ...config, sleeve: sl.id })}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-medium text-left transition ${
                      active
                        ? 'bg-zinc-100 text-zinc-950 border-white font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    {sl.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              5. Performance Fabric
            </h3>
            <div className="space-y-1.5">
              {FABRICS.map((f) => {
                const active = config.fabric === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onChange({ ...config, fabric: f.id })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition ${
                      active
                        ? 'bg-rose-600/15 border-rose-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <span className="font-semibold">{f.name}</span>
                    <span className="text-[11px] text-zinc-400">{f.gsm}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <div>
              <div className="text-xs font-semibold text-zinc-200">
                Accent Piping & Trim
              </div>
              <div className="text-[11px] text-zinc-400">
                Placket, cuff & hem piping lines
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...config, piping: !config.piping })}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                config.piping ? 'bg-rose-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  config.piping ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </section>
        </>
      )}

      {/* PATTERN / DESIGN TAB */}
      {activeTab === 'pattern' && (
        <section className="space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Sublimation Templates
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Choose a pro pattern layout. Colors update live in 3D.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {PATTERNS.map((p) => {
              const active = config.pattern === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onChange({ ...config, pattern: p.id })}
                  className={`p-2 rounded-xl border text-left transition group ${
                    active
                      ? 'bg-rose-600/15 border-rose-500 ring-1 ring-rose-500/40'
                      : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <PatternPreviewSvg
                    id={p.id}
                    primary={config.colors.primary}
                    secondary={config.colors.secondary}
                    accent={config.colors.accent}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-100 truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {p.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* COLORS TAB */}
      {activeTab === 'colors' && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSwapColors}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-medium text-zinc-200 transition"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Swap Primary/Sec
            </button>
            <button
              onClick={handleRandomizeColors}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-medium text-zinc-200 transition"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Randomize
            </button>
          </div>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Pro Team Palettes
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() =>
                    onChange({
                      ...config,
                      colors: { ...theme.colors },
                    })
                  }
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition"
                >
                  <span className="text-xs font-medium text-zinc-200 truncate">
                    {theme.name}
                  </span>
                  <div className="flex -space-x-1">
                    <span
                      className="w-4 h-4 rounded-full border border-white/25"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/25"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/25"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="space-y-5 pt-2 border-t border-zinc-800/80">
            <ColorPickerRow
              label="Primary Base"
              value={config.colors.primary}
              onChange={(hex) =>
                onChange({
                  ...config,
                  colors: { ...config.colors, primary: hex },
                })
              }
            />
            <ColorPickerRow
              label="Secondary / Pattern"
              value={config.colors.secondary}
              onChange={(hex) =>
                onChange({
                  ...config,
                  colors: { ...config.colors, secondary: hex },
                })
              }
            />
            <ColorPickerRow
              label="Accent & Piping"
              value={config.colors.accent}
              onChange={(hex) =>
                onChange({
                  ...config,
                  colors: { ...config.colors, accent: hex },
                })
              }
            />
            <ColorPickerRow
              label="Collar & Placket"
              value={config.colors.collar}
              onChange={(hex) =>
                onChange({
                  ...config,
                  colors: { ...config.colors, collar: hex },
                })
              }
            />
            {(config.collar === 'baseball-full' || config.collar === 'henley-2') && (
              <ColorPickerRow
                label="Buttons"
                value={config.colors.buttons}
                onChange={(hex) =>
                  onChange({
                    ...config,
                    colors: { ...config.colors, buttons: hex },
                  })
                }
              />
            )}
          </div>
        </>
      )}

      {/* TEXT & NUMBERS TAB */}
      {activeTab === 'text' && (
        <div className="space-y-6">
          {/* FRONT TEAM NAME */}
          <section className="space-y-3 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onFocusFront}
                className="text-xs font-bold uppercase tracking-wider text-zinc-200 hover:text-rose-400 transition"
              >
                Front Team Name
              </button>
              <input
                type="checkbox"
                checked={config.teamName.enabled}
                onChange={(e) =>
                  onChange({
                    ...config,
                    teamName: { ...config.teamName, enabled: e.target.checked },
                  })
                }
                className="accent-rose-600 w-4 h-4"
              />
            </div>

            {config.teamName.enabled && (
              <div className="space-y-3">
                <input
                  type="text"
                  maxLength={16}
                  value={config.teamName.text}
                  onFocus={onFocusFront}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      teamName: { ...config.teamName, text: e.target.value },
                    })
                  }
                  placeholder="TEAM NAME"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={config.teamName.font}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        teamName: {
                          ...config.teamName,
                          font: e.target.value as JerseyConfig['teamName']['font'],
                        },
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-200"
                  >
                    {FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={config.teamName.curve}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        teamName: {
                          ...config.teamName,
                          curve: e.target.value as TextCurve,
                        },
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-200"
                  >
                    <option value="arch">Arched</option>
                    <option value="straight">Straight</option>
                    <option value="slanted">Slanted Script</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 flex justify-between">
                      <span>Size</span>
                      <span>{Math.round(config.teamName.size * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.65"
                      max="1.45"
                      step="0.05"
                      value={config.teamName.size}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          teamName: {
                            ...config.teamName,
                            size: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 flex justify-between">
                      <span>Vertical Pos</span>
                      <span>{config.teamName.offsetY}</span>
                    </label>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="2"
                      value={config.teamName.offsetY}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          teamName: {
                            ...config.teamName,
                            offsetY: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <ColorPickerRow
                  label="Text Fill"
                  value={config.teamName.color}
                  compact
                  onChange={(hex) =>
                    onChange({
                      ...config,
                      teamName: { ...config.teamName, color: hex },
                    })
                  }
                />
                <ColorPickerRow
                  label="Outline"
                  value={config.teamName.outlineColor}
                  compact
                  onChange={(hex) =>
                    onChange({
                      ...config,
                      teamName: { ...config.teamName, outlineColor: hex },
                    })
                  }
                />
              </div>
            )}
          </section>

          {/* FRONT NUMBER */}
          <section className="space-y-3 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onFocusFront}
                className="text-xs font-bold uppercase tracking-wider text-zinc-200 hover:text-rose-400 transition"
              >
                Front Number
              </button>
              <input
                type="checkbox"
                checked={config.frontNumber.enabled}
                onChange={(e) =>
                  onChange({
                    ...config,
                    frontNumber: {
                      ...config.frontNumber,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="accent-rose-600 w-4 h-4"
              />
            </div>

            {config.frontNumber.enabled && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={config.frontNumber.text}
                    onFocus={onFocusFront}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        frontNumber: {
                          ...config.frontNumber,
                          text: e.target.value,
                        },
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white"
                  />
                  <select
                    value={config.frontNumber.placement ?? 'left-chest'}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        frontNumber: {
                          ...config.frontNumber,
                          placement: e.target.value as 'left-chest' | 'center-below',
                        },
                      })
                    }
                    className="px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-200"
                  >
                    <option value="left-chest">Left Chest (Baseball)</option>
                    <option value="center-below">Center Below Name</option>
                  </select>
                </div>
                <ColorPickerRow
                  label="Number Color"
                  value={config.frontNumber.color}
                  compact
                  onChange={(hex) =>
                    onChange({
                      ...config,
                      frontNumber: { ...config.frontNumber, color: hex },
                    })
                  }
                />
              </div>
            )}
          </section>

          {/* BACK PLAYER NAME & NUMBER */}
          <section className="space-y-3 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onFocusBack}
                className="text-xs font-bold uppercase tracking-wider text-zinc-200 hover:text-rose-400 transition"
              >
                Back Player Name & #
              </button>
              <button
                type="button"
                onClick={onFocusBack}
                className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                View Back
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                maxLength={14}
                value={config.playerName.text}
                onFocus={onFocusBack}
                onChange={(e) =>
                  onChange({
                    ...config,
                    playerName: {
                      ...config.playerName,
                      enabled: true,
                      text: e.target.value,
                    },
                  })
                }
                placeholder="PLAYER"
                className="col-span-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white"
              />
              <input
                type="text"
                maxLength={3}
                value={config.backNumber.text}
                onFocus={onFocusBack}
                onChange={(e) =>
                  onChange({
                    ...config,
                    backNumber: {
                      ...config.backNumber,
                      enabled: true,
                      text: e.target.value,
                    },
                  })
                }
                placeholder="24"
                className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white text-center font-bold"
              />
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.playerName.enabled}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      playerName: {
                        ...config.playerName,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="accent-rose-600"
                />
                Show Name
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.backNumber.enabled}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      backNumber: {
                        ...config.backNumber,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="accent-rose-600"
                />
                Show Back #
              </label>
            </div>

            <ColorPickerRow
              label="Back Fill Color"
              value={config.backNumber.color}
              compact
              onChange={(hex) =>
                onChange({
                  ...config,
                  playerName: { ...config.playerName, color: hex },
                  backNumber: { ...config.backNumber, color: hex },
                })
              }
            />
            <ColorPickerRow
              label="Back Outline"
              value={config.backNumber.outlineColor}
              compact
              onChange={(hex) =>
                onChange({
                  ...config,
                  backNumber: { ...config.backNumber, outlineColor: hex },
                })
              }
            />
          </section>
        </div>
      )}

      {/* LOGOS & GRAPHICS TAB */}
      {activeTab === 'logos' && (
        <div className="space-y-5">
          <section className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Placement Zone
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {LOGO_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedLogoSlot(slot.id)}
                  className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium transition ${
                    selectedLogoSlot === slot.id
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. Upload Custom Logo (PNG / SVG)
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-zinc-700 hover:border-rose-500 bg-zinc-900/50 hover:bg-rose-600/10 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4 text-rose-400" />
              Upload Logo to{' '}
              {LOGO_SLOTS.find((s) => s.id === selectedLogoSlot)?.label}
            </button>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              3. Built-In Pro Emblems
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {BUILTIN_LOGOS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addLogo(item.name, item.src)}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-500 flex flex-col items-center gap-1.5 transition"
                >
                  <img
                    src={item.src}
                    alt={item.name}
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-[10px] text-zinc-300 truncate w-full text-center">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {config.logos.length > 0 && (
            <section className="space-y-2.5 pt-2 border-t border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Active Logos ({config.logos.length})
              </h3>
              <div className="space-y-2.5">
                {config.logos.map((logo) => (
                  <div
                    key={logo.id}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={logo.src}
                          alt={logo.name}
                          className="w-7 h-7 rounded bg-zinc-950 p-0.5 object-contain"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-zinc-100 truncate">
                            {logo.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {LOGO_SLOTS.find((s) => s.id === logo.slot)?.label}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeLogo(logo.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
                        title="Remove logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 flex justify-between">
                          <span>Scale</span>
                          <span>{Math.round(logo.scale * 100)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="1.8"
                          step="0.05"
                          value={logo.scale}
                          onChange={(e) =>
                            updateLogo(logo.id, {
                              scale: parseFloat(e.target.value),
                            })
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 flex justify-between">
                          <span>Y Offset</span>
                          <span>{logo.offsetY}</span>
                        </label>
                        <input
                          type="range"
                          min="-35"
                          max="35"
                          step="1"
                          value={logo.offsetY}
                          onChange={(e) =>
                            updateLogo(logo.id, {
                              offsetY: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* SAVED DESIGNS TAB */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Save Current Design
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g. Maroon Home Kit"
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={() => {
                  onSaveDesign(
                    saveName.trim() ||
                      `${config.teamName.text || config.sport} Kit`
                  );
                  setSaveName('');
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Saved Locker ({savedDesigns.length})
            </h3>
            {savedDesigns.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-500">
                No saved kits yet. Save your current 3D jersey to compare home,
                away, and alternate editions.
              </div>
            ) : (
              <div className="space-y-2">
                {savedDesigns.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition"
                  >
                    {d.thumbnail ? (
                      <img
                        src={d.thumbnail}
                        alt={d.name}
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-950 border border-zinc-800"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-800" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-zinc-100 truncate">
                        {d.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 capitalize">
                        {d.config.sport} • {d.config.cut} •{' '}
                        {new Date(d.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => onLoadDesign(d)}
                      className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-rose-600 text-xs font-medium text-zinc-200 hover:text-white transition"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDeleteDesign(d.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
