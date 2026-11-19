import * as THREE from 'three';
import { FONTS } from '../data/presets';
import { FabricType, FontId, JerseyConfig, LogoPlacement, TextCurve } from '../types/jersey';

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement | null> {
  const cached = imageCache.get(src);
  if (cached && cached.complete) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function getFontFamily(font: FontId): string {
  return FONTS.find((f) => f.id === font)?.cssFamily ?? 'Impact, sans-serif';
}

function drawStyledText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  fontSize: number,
  font: FontId,
  fill: string,
  outline: string,
  outlineWidth: number,
  curve: TextCurve = 'straight',
  letterSpacing = 2
) {
  if (!text.trim()) return;
  const family = getFontFamily(font);
  ctx.save();
  ctx.font = `700 ${fontSize}px ${family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  const chars = Array.from(text);

  if (curve === 'arch' && chars.length > 1) {
    // True circular arch text
    const radius = fontSize * 5.2;
    const widths = chars.map((ch) => ctx.measureText(ch).width + letterSpacing);
    const totalWidth = widths.reduce((a, b) => a + b, 0);
    const totalAngle = totalWidth / radius;
    let currentAngle = -totalAngle / 2;

    ctx.translate(cx, cy + radius * 0.92);
    for (let i = 0; i < chars.length; i++) {
      const charAngle = widths[i] / radius;
      const midAngle = currentAngle + charAngle / 2;
      ctx.save();
      ctx.rotate(midAngle);
      ctx.translate(0, -radius);
      if (outlineWidth > 0) {
        ctx.strokeStyle = outline;
        ctx.lineWidth = outlineWidth * 2;
        ctx.strokeText(chars[i], 0, 0);
      }
      ctx.fillStyle = fill;
      ctx.fillText(chars[i], 0, 0);
      ctx.restore();
      currentAngle += charAngle;
    }
  } else {
    ctx.translate(cx, cy);
    if (curve === 'slanted') {
      ctx.rotate(-0.14);
      ctx.transform(1, 0, -0.15, 1, 0, 0);
    }
    if (outlineWidth > 0) {
      ctx.strokeStyle = outline;
      ctx.lineWidth = outlineWidth * 2;
      ctx.strokeText(text, 0, 0);
    }
    ctx.fillStyle = fill;
    ctx.fillText(text, 0, 0);
  }

  ctx.restore();
}

function drawTorsoPattern(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  config: JerseyConfig
) {
  const { primary, secondary, accent } = config.colors;
  const halfW = W / 2;

  // Base fill
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, W, H);

  // Helper to apply identical or mirrored pattern to Front [0..halfW] and Back [halfW..W]
  const drawOnPanel = (offsetX: number, isFront: boolean) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(offsetX, 0, halfW, H);
    ctx.clip();
    ctx.translate(offsetX, 0);

    switch (config.pattern) {
      case 'pinstripes': {
        ctx.fillStyle = secondary;
        const spacing = 36;
        for (let x = 18; x < halfW; x += spacing) {
          ctx.fillRect(x - 3, 0, 6, H);
        }
        break;
      }

      case 'raglan-classic': {
        // Diagonal raglan shoulder yoke cuts on top-left and top-right
        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(halfW * 0.28, 0);
        ctx.lineTo(0, H * 0.36);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(halfW, 0);
        ctx.lineTo(halfW * 0.72, 0);
        ctx.lineTo(halfW, H * 0.36);
        ctx.closePath();
        ctx.fill();

        // Accent raglan piping
        ctx.strokeStyle = accent;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(halfW * 0.28, 0);
        ctx.lineTo(0, H * 0.36);
        ctx.moveTo(halfW * 0.72, 0);
        ctx.lineTo(halfW, H * 0.36);
        ctx.stroke();
        break;
      }

      case 'hoops': {
        // Bold horizontal rugby/athletic hoops
        ctx.fillStyle = secondary;
        const bands = [
          [0.24, 0.13],
          [0.5, 0.13],
          [0.76, 0.11],
        ];
        for (const [yFrac, hFrac] of bands) {
          ctx.fillRect(0, H * yFrac, halfW, H * hFrac);
          ctx.fillStyle = accent;
          ctx.fillRect(0, H * yFrac - 8, halfW, 8);
          ctx.fillRect(0, H * (yFrac + hFrac), halfW, 8);
          ctx.fillStyle = secondary;
        }
        break;
      }

      case 'chevron': {
        // Sharp V-chevron across upper chest / back
        const yTop = H * 0.22;
        const yTip = H * 0.5;
        const thickness = H * 0.14;

        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.moveTo(0, yTop);
        ctx.lineTo(halfW / 2, yTip);
        ctx.lineTo(halfW, yTop);
        ctx.lineTo(halfW, yTop + thickness);
        ctx.lineTo(halfW / 2, yTip + thickness);
        ctx.lineTo(0, yTop + thickness);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(0, yTop + thickness + 12);
        ctx.lineTo(halfW / 2, yTip + thickness + 12);
        ctx.lineTo(halfW, yTop + thickness + 12);
        ctx.lineTo(halfW, yTop + thickness + 34);
        ctx.lineTo(halfW / 2, yTip + thickness + 34);
        ctx.lineTo(0, yTop + thickness + 34);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'sash': {
        // Diagonal club sash from shoulder to opposite hip
        ctx.fillStyle = secondary;
        ctx.beginPath();
        if (isFront) {
          ctx.moveTo(halfW * 0.12, 0);
          ctx.lineTo(halfW * 0.34, 0);
          ctx.lineTo(halfW * 0.94, H);
          ctx.lineTo(halfW * 0.72, H);
        } else {
          ctx.moveTo(halfW * 0.66, 0);
          ctx.lineTo(halfW * 0.88, 0);
          ctx.lineTo(halfW * 0.28, H);
          ctx.lineTo(halfW * 0.06, H);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = accent;
        ctx.lineWidth = 10;
        ctx.stroke();
        break;
      }

      case 'side-panels': {
        // Sleek basketball/athletic side gusset panels
        const panelW = halfW * 0.15;
        ctx.fillStyle = secondary;
        ctx.fillRect(0, 0, panelW, H);
        ctx.fillRect(halfW - panelW, 0, panelW, H);

        ctx.fillStyle = accent;
        ctx.fillRect(panelW, 0, 14, H);
        ctx.fillRect(halfW - panelW - 14, 0, 14, H);
        break;
      }

      case 'gradient': {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.52, primary);
        grad.addColorStop(1, secondary);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, halfW, H);

        // Subtle halftone horizontal speed lines near bottom
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.28;
        for (let i = 0; i < 8; i++) {
          const y = H * (0.64 + i * 0.042);
          ctx.fillRect(0, y, halfW, 3 + i * 2);
        }
        ctx.globalAlpha = 1;
        break;
      }

      case 'geometric': {
        // Low-poly esports / modern sublimation shards
        const shards: [number, number, number, number, number, number, string, number][] = [
          [0, 0, halfW * 0.45, 0, halfW * 0.2, H * 0.35, secondary, 0.22],
          [halfW * 0.55, 0, halfW, 0, halfW * 0.82, H * 0.42, secondary, 0.18],
          [0, H * 0.48, halfW * 0.38, H * 0.72, 0, H, secondary, 0.34],
          [halfW, H * 0.45, halfW * 0.62, H * 0.78, halfW, H, secondary, 0.3],
          [halfW * 0.22, H * 0.65, halfW * 0.78, H * 0.55, halfW * 0.5, H, accent, 0.26],
          [0, H * 0.78, halfW * 0.5, H, 0, H, accent, 0.38],
        ];
        for (const [x1, y1, x2, y2, x3, y3, col, alpha] of shards) {
          ctx.fillStyle = col;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x3, y3);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;
      }

      case 'bolts': {
        // Velocity diagonal racing stripes on sides
        ctx.fillStyle = secondary;
        for (let k = 0; k < 3; k++) {
          const yOff = H * (0.52 + k * 0.09);
          ctx.beginPath();
          ctx.moveTo(0, yOff);
          ctx.lineTo(halfW * 0.3, yOff - 95);
          ctx.lineTo(halfW * 0.3, yOff - 55);
          ctx.lineTo(0, yOff + 40);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(halfW, yOff);
          ctx.lineTo(halfW * 0.7, yOff - 95);
          ctx.lineTo(halfW * 0.7, yOff - 55);
          ctx.lineTo(halfW, yOff + 40);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = accent;
        ctx.fillRect(0, H * 0.91, halfW, 14);
        break;
      }

      case 'solid':
      default:
        break;
    }

    // Optional athletic piping (center placket piping on baseball, hem trim)
    if (config.piping) {
      ctx.fillStyle = accent;
      // Bottom hem piping
      ctx.fillRect(0, H - 16, halfW, 8);
      // Baseball front placket double piping
      if (isFront && (config.collar === 'baseball-full' || config.collar === 'henley-2')) {
        const endY = config.collar === 'baseball-full' ? H : H * 0.38;
        ctx.fillRect(halfW / 2 - 22, 0, 5, endY);
        ctx.fillRect(halfW / 2 + 17, 0, 5, endY);
      }
    }

    // Subtle realistic side-seam shadow & hem stitch line
    const sideGradL = ctx.createLinearGradient(0, 0, 48, 0);
    sideGradL.addColorStop(0, 'rgba(0,0,0,0.22)');
    sideGradL.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sideGradL;
    ctx.fillRect(0, 0, 48, H);

    const sideGradR = ctx.createLinearGradient(halfW - 48, 0, halfW, 0);
    sideGradR.addColorStop(0, 'rgba(0,0,0,0)');
    sideGradR.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = sideGradR;
    ctx.fillRect(halfW - 48, 0, 48, H);

    // Subtle double-needle bottom hem stitch
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, H - 24);
    ctx.lineTo(halfW, H - 24);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  };

  drawOnPanel(0, true);
  drawOnPanel(halfW, false);
}

async function drawTorsoLogos(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  logos: LogoPlacement[]
) {
  const halfW = W / 2;

  for (const logo of logos) {
    if (logo.slot === 'left-sleeve' || logo.slot === 'right-sleeve') continue;
    const img = await loadImage(logo.src);
    if (!img) continue;

    let cx = halfW * 0.5;
    let cy = H * 0.34;
    let baseSize = 110;

    if (logo.slot === 'left-chest') {
      // Wearer's left chest = viewer's right side of front panel
      cx = halfW * 0.68;
      cy = H * 0.28;
      baseSize = 95;
    } else if (logo.slot === 'right-chest') {
      cx = halfW * 0.32;
      cy = H * 0.28;
      baseSize = 95;
    } else if (logo.slot === 'center-chest') {
      cx = halfW * 0.5;
      cy = H * 0.42;
      baseSize = 155;
    } else if (logo.slot === 'back-neck') {
      cx = halfW + halfW * 0.5;
      cy = H * 0.14;
      baseSize = 72;
    }

    const size = baseSize * logo.scale;
    const x = cx + logo.offsetX * 2.5 - size / 2;
    const y = cy + logo.offsetY * 2.5 - size / 2;

    ctx.save();
    ctx.globalAlpha = logo.opacity;
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  }
}

export async function renderTorsoCanvas(
  canvas: HTMLCanvasElement,
  config: JerseyConfig
): Promise<void> {
  const W = 2048;
  const H = 1024;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const halfW = W / 2;
  drawTorsoPattern(ctx, W, H, config);

  // Logos behind or alongside text
  await drawTorsoLogos(ctx, W, H, config.logos);

  // Front Team Name
  if (config.teamName.enabled && config.teamName.text.trim()) {
    const tn = config.teamName;
    drawStyledText(
      ctx,
      tn.text,
      halfW * 0.5,
      H * 0.35 + tn.offsetY * 2.2,
      Math.round(86 * tn.size),
      tn.font,
      tn.color,
      tn.outlineColor,
      tn.outlineWidth,
      tn.curve
    );
  }

  // Front Number
  if (config.frontNumber.enabled && config.frontNumber.text.trim()) {
    const fn = config.frontNumber;
    const isLeftChest = fn.placement === 'left-chest';
    const cx = isLeftChest ? halfW * 0.67 : halfW * 0.5;
    const cy = isLeftChest ? H * 0.46 : H * 0.52;
    drawStyledText(
      ctx,
      fn.text,
      cx,
      cy,
      Math.round((isLeftChest ? 82 : 112) * fn.size),
      fn.font,
      fn.color,
      fn.outlineColor,
      fn.outlineWidth,
      'straight'
    );
  }

  // Back Player Name
  if (config.playerName.enabled && config.playerName.text.trim()) {
    const pn = config.playerName;
    drawStyledText(
      ctx,
      pn.text.toUpperCase(),
      halfW + halfW * 0.5,
      H * 0.24,
      Math.round(64 * pn.size),
      pn.font,
      pn.color,
      pn.outlineColor,
      pn.outlineWidth,
      pn.curve
    );
  }

  // Back Number (Large athletic back numeral)
  if (config.backNumber.enabled && config.backNumber.text.trim()) {
    const bn = config.backNumber;
    drawStyledText(
      ctx,
      bn.text,
      halfW + halfW * 0.5,
      H * 0.52,
      Math.round(240 * bn.size),
      bn.font,
      bn.color,
      bn.outlineColor,
      bn.outlineWidth,
      'straight'
    );
  }
}

export async function renderSleeveCanvas(
  canvas: HTMLCanvasElement,
  config: JerseyConfig,
  side: 'left-sleeve' | 'right-sleeve'
): Promise<void> {
  const W = 512;
  const H = 512;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { primary, secondary, accent } = config.colors;
  const useSecondarySleeve =
    config.sleeve === 'raglan' || config.pattern === 'raglan-classic';

  ctx.fillStyle = useSecondarySleeve ? secondary : primary;
  ctx.fillRect(0, 0, W, H);

  if (config.pattern === 'pinstripes' && !useSecondarySleeve) {
    ctx.fillStyle = secondary;
    for (let x = 16; x < W; x += 36) {
      ctx.fillRect(x - 2, 0, 5, H);
    }
  } else if (config.pattern === 'hoops') {
    ctx.fillStyle = secondary;
    ctx.fillRect(0, H * 0.45, W, H * 0.22);
  } else if (config.pattern === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, primary);
    grad.addColorStop(1, secondary);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Sleeve cuff trim / piping
  if (config.piping) {
    ctx.fillStyle = useSecondarySleeve ? primary : secondary;
    ctx.fillRect(0, H - 44, W, 24);
    ctx.fillStyle = accent;
    ctx.fillRect(0, H - 20, W, 14);
  }

  // Sleeve logos
  const sleeveLogos = config.logos.filter((l) => l.slot === side);
  for (const logo of sleeveLogos) {
    const img = await loadImage(logo.src);
    if (!img) continue;
    const size = 128 * logo.scale;
    // Outer top surface of sleeve corresponds to u ≈ 0.0 / 1.0 (cosP=1), so draw at x = 0 and wrap or center at x = W*0.5?
    // Wait: at phi=0, cosP=1 (top outer shoulder). Let's draw at both edges or center at u=0.5?
    // Actually in buildSleeveGeometry: cosP=1 is outer top (+up), phi=0 -> u=0 and u=1.
    // Drawing centered at x = 0 (wrapped to W) places it cleanly on the outer bicep!
    const drawAt = (centerX: number) => {
      ctx.save();
      ctx.globalAlpha = logo.opacity;
      ctx.drawImage(
        img,
        centerX + logo.offsetX * 1.5 - size / 2,
        H * 0.48 + logo.offsetY * 1.5 - size / 2,
        size,
        size
      );
      ctx.restore();
    };
    drawAt(0);
    drawAt(W);
  }
}

export function createFabricBumpTexture(fabric: FabricType): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  if (fabric === 'pro-mesh') {
    // Micro athletic honeycomb mesh dots
    for (let y = 0; y < size; y += 8) {
      for (let x = 0; x < size; x += 8) {
        const ox = (y / 8) % 2 === 0 ? 0 : 4;
        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.arc(x + ox, y, 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b8b8b8';
        ctx.fillRect(x + ox - 1, y + 3, 2, 1);
      }
    }
  } else if (fabric === 'micro-interlock') {
    // Fine vertical jersey knit ribs
    for (let x = 0; x < size; x += 4) {
      ctx.fillStyle = x % 8 === 0 ? '#9c9c9c' : '#6c6c6c';
      ctx.fillRect(x, 0, 2, size);
    }
  } else if (fabric === 'pique') {
    // Waffle/pique diamond weave
    for (let y = 0; y < size; y += 6) {
      for (let x = 0; x < size; x += 6) {
        const bright = ((x + y) / 6) % 2 === 0;
        ctx.fillStyle = bright ? '#b4b4b4' : '#585858';
        ctx.fillRect(x, y, 3, 3);
      }
    }
  } else {
    // Matte poly: ultra-subtle micro-grain
    for (let y = 0; y < size; y += 4) {
      for (let x = 0; x < size; x += 4) {
        const v = 122 + ((x * 13 + y * 7) % 14);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 4, 4);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.needsUpdate = true;
  return tex;
}
