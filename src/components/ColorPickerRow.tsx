import React from 'react';
import { ATHLETIC_SWATCHES } from '../data/presets';

interface ColorPickerRowProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  compact?: boolean;
}

export const ColorPickerRow: React.FC<ColorPickerRowProps> = ({
  label,
  value,
  onChange,
  compact = false,
}) => {
  const swatches = compact ? ATHLETIC_SWATCHES.slice(0, 12) : ATHLETIC_SWATCHES;
  const swatchName = ATHLETIC_SWATCHES.find(
    (s) => s.hex.toLowerCase() === value.toLowerCase()
  )?.name;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer bg-zinc-900 border border-zinc-700/80 rounded-md px-2 py-0.5 hover:border-zinc-500 transition">
          <span
            className="w-3.5 h-3.5 rounded-sm border border-white/20"
            style={{ backgroundColor: value }}
          />
          <span className="text-[11px] text-zinc-300">
            {swatchName ?? <span className="font-mono uppercase">{value}</span>}
          </span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
      <div className="grid grid-cols-9 gap-1.5">
        {swatches.map((s) => {
          const active = s.hex.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={s.slug}
              type="button"
              title={`${s.name} (${s.hex})`}
              onClick={() => onChange(s.hex)}
              className={`h-6 w-full rounded-md border transition-transform ${
                active
                  ? 'ring-2 ring-rose-500 ring-offset-1 ring-offset-zinc-950 scale-105 border-white'
                  : 'border-white/15 hover:scale-110'
              }`}
              style={{ backgroundColor: s.hex }}
            />
          );
        })}
      </div>
    </div>
  );
};
