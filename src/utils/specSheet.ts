import { COLLARS, CUTS, FABRICS, PATTERNS, SLEEVES, SPORTS } from '../data/presets';
import { JerseyConfig } from '../types/jersey';

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function openPrintableSpecSheet(
  config: JerseyConfig,
  frontImg: string,
  backImg: string,
  shareUrl: string
) {
  const sportName = SPORTS.find((s) => s.id === config.sport)?.name ?? config.sport;
  const cutName = CUTS.find((c) => c.id === config.cut)?.name ?? config.cut;
  const collarName = COLLARS.find((c) => c.id === config.collar)?.name ?? config.collar;
  const sleeveName = SLEEVES.find((s) => s.id === config.sleeve)?.name ?? config.sleeve;
  const fabricMeta = FABRICS.find((f) => f.id === config.fabric);
  const patternName = PATTERNS.find((p) => p.id === config.pattern)?.name ?? config.pattern;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>DYO Studio Production Spec Sheet — ${config.teamName.text || 'Custom Jersey'}</title>
  <style>
    * { box-sizing: border-box; font-family: Inter, system-ui, -apple-system, sans-serif; }
    body { margin: 0; padding: 32px; background: #f4f4f5; color: #18181b; }
    .sheet { max-width: 960px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 35px rgba(0,0,0,0.08); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #18181b; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: 800; letter-spacing: 0.04em; }
    .badge { background: #6E1324; color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .views { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .view-card { border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background: #18181b; text-align: center; }
    .view-card img { width: 100%; height: 340px; object-fit: contain; display: block; }
    .view-label { background: #f4f4f5; color: #3f3f46; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .section h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; margin: 0 0 10px; border-bottom: 1px solid #e4e4e7; padding-bottom: 6px; }
    .kv { display: flex; justify-content: space-between; font-size: 14px; padding: 5px 0; border-bottom: 1px dashed #f4f4f5; }
    .swatches { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
    .swatch { text-align: center; font-size: 11px; }
    .swatch-box { height: 36px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.15); margin-bottom: 4px; }
    .url { margin-top: 24px; padding: 12px; background: #f4f4f5; border-radius: 8px; font-size: 11px; word-break: break-all; color: #52525b; }
    @media print { body { background: #fff; padding: 0; } .sheet { box-shadow: none; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="title">DYO STUDIO — PRODUCTION SPEC SHEET</div>
        <div style="font-size:13px;color:#71717a;margin-top:4px;">Generated ${new Date().toLocaleDateString()} • ${sportName} ${cutName} Custom Jersey</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span class="badge">${sportName}</span>
        <button class="no-print" onclick="window.print()" style="background:#18181b;color:#fff;border:none;padding:8px 14px;border-radius:8px;font-weight:600;cursor:pointer;">Print / Save PDF</button>
      </div>
    </div>

    <div class="views">
      <div class="view-card">
        <img src="${frontImg}" alt="Front View" />
        <div class="view-label">Front View</div>
      </div>
      <div class="view-card">
        <img src="${backImg}" alt="Back View" />
        <div class="view-label">Back View</div>
      </div>
    </div>

    <div class="grid">
      <div class="section">
        <h3>Garment Specification</h3>
        <div class="kv"><span>Sport</span><strong>${sportName}</strong></div>
        <div class="kv"><span>Cut / Fit</span><strong>${cutName}</strong></div>
        <div class="kv"><span>Collar Style</span><strong>${collarName}</strong></div>
        <div class="kv"><span>Sleeve Style</span><strong>${sleeveName}</strong></div>
        <div class="kv"><span>Fabric</span><strong>${fabricMeta?.name ?? config.fabric} (${fabricMeta?.gsm ?? ''})</strong></div>
        <div class="kv"><span>Sublimation Pattern</span><strong>${patternName}</strong></div>
        <div class="kv"><span>Accent Piping</span><strong>${config.piping ? 'Enabled' : 'None'}</strong></div>
      </div>

      <div class="section">
        <h3>Typography & Branding</h3>
        <div class="kv"><span>Team Name</span><strong>${config.teamName.enabled ? `${config.teamName.text} (${config.teamName.font}, ${config.teamName.curve})` : 'Disabled'}</strong></div>
        <div class="kv"><span>Front Number</span><strong>${config.frontNumber.enabled ? `#${config.frontNumber.text} (${config.frontNumber.placement})` : 'Disabled'}</strong></div>
        <div class="kv"><span>Back Player Name</span><strong>${config.playerName.enabled ? config.playerName.text : 'Disabled'}</strong></div>
        <div class="kv"><span>Back Number</span><strong>${config.backNumber.enabled ? `#${config.backNumber.text}` : 'Disabled'}</strong></div>
        <div class="kv"><span>Logos Placed</span><strong>${config.logos.length} graphic(s)</strong></div>

        <h3 style="margin-top:16px;">Color Swatches</h3>
        <div class="swatches">
          <div class="swatch"><div class="swatch-box" style="background:${config.colors.primary}"></div>Primary<br/><code>${config.colors.primary}</code></div>
          <div class="swatch"><div class="swatch-box" style="background:${config.colors.secondary}"></div>Secondary<br/><code>${config.colors.secondary}</code></div>
          <div class="swatch"><div class="swatch-box" style="background:${config.colors.accent}"></div>Accent<br/><code>${config.colors.accent}</code></div>
          <div class="swatch"><div class="swatch-box" style="background:${config.colors.collar}"></div>Collar<br/><code>${config.colors.collar}</code></div>
          <div class="swatch"><div class="swatch-box" style="background:${config.colors.buttons}"></div>Buttons<br/><code>${config.colors.buttons}</code></div>
        </div>
      </div>
    </div>

    <div class="url"><strong>Shareable Design Link:</strong> ${shareUrl}</div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
  }
}
