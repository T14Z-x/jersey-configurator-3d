import React, { useMemo, useState } from 'react';
import { CheckCircle2, Download, Plus, Trash2, Users, X } from 'lucide-react';
import { SPORTS } from '../data/presets';
import { CutId, JerseyConfig, RosterEntry } from '../types/jersey';

interface RosterQuoteModalProps {
  open: boolean;
  onClose: () => void;
  config: JerseyConfig;
  snapshot: string;
  onExportSpecSheet: () => void;
}

const SIZES: RosterEntry['size'][] = [
  'YXS',
  'YS',
  'YM',
  'YL',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
];

export const RosterQuoteModal: React.FC<RosterQuoteModalProps> = ({
  open,
  onClose,
  config,
  snapshot,
  onExportSpecSheet,
}) => {
  const [roster, setRoster] = useState<RosterEntry[]>([
    { id: '1', playerName: config.playerName.text || 'MILLER', number: config.backNumber.text || '24', size: 'L', cut: config.cut, qty: 1 },
    { id: '2', playerName: 'CARTER', number: '7', size: 'M', cut: config.cut, qty: 1 },
    { id: '3', playerName: 'REYES', number: '12', size: 'XL', cut: config.cut, qty: 1 },
  ]);

  const [contact, setContact] = useState({
    clubName: config.teamName.text || '',
    fullName: '',
    email: '',
    notes: '',
  });
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const sportMeta = SPORTS.find((s) => s.id === config.sport) ?? SPORTS[0];

  const pricing = useMemo(() => {
    const totalQty = roster.reduce((sum, r) => sum + Math.max(1, r.qty), 0);
    let discount = 0;
    if (totalQty >= 50) discount = 0.3;
    else if (totalQty >= 25) discount = 0.2;
    else if (totalQty >= 10) discount = 0.1;

    const unitPrice = +(sportMeta.basePrice * (1 - discount)).toFixed(2);
    const subtotal = +(unitPrice * totalQty).toFixed(2);
    return { totalQty, discount, unitPrice, subtotal };
  }, [roster, sportMeta.basePrice]);

  if (!open) return null;

  const addRow = () => {
    setRoster((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        playerName: '',
        number: String(prev.length + 1),
        size: 'L',
        cut: config.cut,
        qty: 1,
      },
    ]);
  };

  const addTeamPack = () => {
    const starterNames = [
      ['BROOKS', '3', 'M'],
      ['DIAZ', '9', 'L'],
      ['WALKER', '15', 'L'],
      ['PATEL', '18', 'XL'],
      ['COLE', '21', 'M'],
      ['KIM', '33', 'S'],
      ['FOSTER', '44', '2XL'],
    ] as const;
    setRoster((prev) => [
      ...prev,
      ...starterNames.map(([name, num, size], idx) => ({
        id: `pack-${Date.now()}-${idx}`,
        playerName: name,
        number: num,
        size,
        cut: config.cut,
        qty: 1,
      })),
    ]);
  };

  const updateRow = (id: string, patch: Partial<RosterEntry>) => {
    setRoster((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    setRoster((prev) => prev.filter((r) => r.id !== id));
  };

  const downloadCsv = () => {
    const headers = ['Player Name', 'Number', 'Size', 'Cut', 'Qty'];
    const lines = [
      headers.join(','),
      ...roster.map((r) =>
        [r.playerName, r.number, r.size, r.cut, r.qty]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(config.teamName.text || 'team').toLowerCase()}-roster.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refId = `T14Z-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setSubmittedRef(refId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Team Roster & Production Quote
              </h2>
              <p className="text-xs text-zinc-400">
                {sportMeta.name} • {config.cut.toUpperCase()} • Tiered bulk discounts (10+ 10% off, 25+ 20% off, 50+ 30% off)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {submittedRef ? (
            <div className="py-10 text-center space-y-4 max-w-md mx-auto">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">
                Quote Request Prepared!
              </h3>
              <p className="text-sm text-zinc-400">
                Reference <span className="font-mono text-white font-semibold">{submittedRef}</span> for{' '}
                <strong>{pricing.totalQty}</strong> custom {sportMeta.name.toLowerCase()} jerseys
                (est. <strong className="text-emerald-400">${pricing.subtotal.toFixed(2)}</strong>).
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  onClick={onExportSpecSheet}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                >
                  Open Production Spec Sheet
                </button>
                <button
                  onClick={downloadCsv}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold"
                >
                  Download Roster CSV
                </button>
                <button
                  onClick={() => {
                    setSubmittedRef(null);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Back to 3D Studio
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Roster Table */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Player Roster ({pricing.totalQty} units)
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addTeamPack}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
                    >
                      + Add 7 Players
                    </button>
                    <button
                      type="button"
                      onClick={downloadCsv}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" /> CSV
                    </button>
                    <button
                      type="button"
                      onClick={addRow}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" /> Row
                    </button>
                  </div>
                </div>

                <div className="border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-2.5 text-left">Player Name</th>
                        <th className="py-2 px-2 text-center w-16">#</th>
                        <th className="py-2 px-2 text-left w-20">Size</th>
                        <th className="py-2 px-2 text-left w-24">Cut</th>
                        <th className="py-2 px-2 text-center w-14">Qty</th>
                        <th className="py-2 px-2 w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {roster.map((row) => (
                        <tr key={row.id} className="bg-zinc-950/60">
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.playerName}
                              onChange={(e) =>
                                updateRow(row.id, { playerName: e.target.value })
                              }
                              placeholder="NAME"
                              className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              maxLength={3}
                              value={row.number}
                              onChange={(e) =>
                                updateRow(row.id, { number: e.target.value })
                              }
                              className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white text-center font-mono"
                            />
                          </td>
                          <td className="p-1.5">
                            <select
                              value={row.size}
                              onChange={(e) =>
                                updateRow(row.id, {
                                  size: e.target.value as RosterEntry['size'],
                                })
                              }
                              className="w-full px-1.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200"
                            >
                              {SIZES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1.5">
                            <select
                              value={row.cut}
                              onChange={(e) =>
                                updateRow(row.id, {
                                  cut: e.target.value as CutId,
                                })
                              }
                              className="w-full px-1.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 capitalize"
                            >
                              <option value="men">Men&apos;s</option>
                              <option value="women">Women&apos;s</option>
                              <option value="youth">Youth</option>
                            </select>
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              min={1}
                              max={99}
                              value={row.qty}
                              onChange={(e) =>
                                updateRow(row.id, {
                                  qty: Math.max(1, parseInt(e.target.value, 10) || 1),
                                })
                              }
                              className="w-full px-1.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-white text-center"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              className="text-zinc-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Summary & Contact Form */}
              <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                  {snapshot && (
                    <img
                      src={snapshot}
                      alt="Design Preview"
                      className="w-16 h-16 rounded-lg object-cover bg-zinc-950 border border-zinc-800"
                    />
                  )}
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Unit Price</span>
                      <span className="text-white font-semibold">
                        ${pricing.unitPrice.toFixed(2)}
                        {pricing.discount > 0 && (
                          <span className="ml-1 text-emerald-400">
                            (-{Math.round(pricing.discount * 100)}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Quantity</span>
                      <span className="text-white font-semibold">
                        {pricing.totalQty} jerseys
                      </span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-zinc-800 text-sm font-bold text-white">
                      <span>Estimated Total</span>
                      <span className="text-rose-400">
                        ${pricing.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <input
                    required
                    type="text"
                    placeholder="Club / Team Name"
                    value={contact.clubName}
                    onChange={(e) =>
                      setContact({ ...contact, clubName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Your Full Name"
                    value={contact.fullName}
                    onChange={(e) =>
                      setContact({ ...contact, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={contact.email}
                    onChange={(e) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="Special instructions (deadline, sponsor vector files, etc.)"
                    value={contact.notes}
                    onChange={(e) =>
                      setContact({ ...contact, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-950/50 transition"
                >
                  Submit Quote Request
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
