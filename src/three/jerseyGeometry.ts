import * as THREE from 'three';
import { CollarStyle, CutId, SleeveStyle, SportId } from '../types/jersey';

export interface JerseyGeometryParts {
  torso: THREE.BufferGeometry;
  innerLining: THREE.BufferGeometry;
  leftSleeve: THREE.BufferGeometry | null;
  rightSleeve: THREE.BufferGeometry | null;
  collar: THREE.BufferGeometry;
  placket: THREE.BufferGeometry | null;
  buttons: THREE.Vector3[];
}

function getCutProfile(cut: CutId) {
  switch (cut) {
    case 'women':
      return {
        height: 1.52,
        shoulderW: 0.48,
        chestW: 0.45,
        waistW: 0.365,
        hipW: 0.445,
        chestDepth: 0.245,
        waistDepth: 0.19,
        sleeveScale: 0.88,
      };
    case 'youth':
      return {
        height: 1.38,
        shoulderW: 0.44,
        chestW: 0.41,
        waistW: 0.39,
        hipW: 0.405,
        chestDepth: 0.21,
        waistDepth: 0.195,
        sleeveScale: 0.86,
      };
    case 'men':
    default:
      return {
        height: 1.62,
        shoulderW: 0.56,
        chestW: 0.505,
        waistW: 0.455,
        hipW: 0.47,
        chestDepth: 0.255,
        waistDepth: 0.22,
        sleeveScale: 1.0,
      };
  }
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Evaluates a point on the sculpted torso shell.
 * t: 0 (bottom hem) -> 1 (top shoulder/neck)
 * theta: 0 -> 2*PI (0 = left side, PI/2 = front center, PI = right side, 3PI/2 = back center)
 */
function sampleTorsoPoint(
  t: number,
  theta: number,
  cut: CutId,
  sport: SportId,
  collar: CollarStyle,
  inset = 0
): THREE.Vector3 {
  const p = getCutProfile(cut);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  // Width profile from hem (t=0) -> waist (t=0.38) -> chest (t=0.72) -> shoulder/neck (t=1.0)
  let rx: number;
  if (t < 0.38) {
    const k = smoothstep(0, 0.38, t);
    rx = THREE.MathUtils.lerp(p.hipW, p.waistW, k);
  } else if (t < 0.78) {
    const k = smoothstep(0.38, 0.78, t);
    rx = THREE.MathUtils.lerp(p.waistW, p.chestW, k);
  } else if (t < 0.91) {
    const k = smoothstep(0.78, 0.91, t);
    rx = THREE.MathUtils.lerp(p.chestW, p.shoulderW * 0.92, k);
  } else {
    // Taper inward from shoulder cap to neck opening
    const k = smoothstep(0.91, 1.0, t);
    rx = THREE.MathUtils.lerp(p.shoulderW * 0.92, p.shoulderW * 0.38, k);
  }

  // Depth profile (front-to-back thickness)
  let rz: number;
  if (t < 0.4) {
    const k = smoothstep(0, 0.4, t);
    rz = THREE.MathUtils.lerp(p.waistDepth * 1.05, p.waistDepth, k);
  } else if (t < 0.8) {
    const k = smoothstep(0.4, 0.8, t);
    rz = THREE.MathUtils.lerp(p.waistDepth, p.chestDepth, k);
  } else {
    const k = smoothstep(0.8, 1.0, t);
    rz = THREE.MathUtils.lerp(p.chestDepth, p.chestDepth * 0.58, k);
  }

  // Anatomical chest & back fullness
  const frontFactor = Math.max(0, sinT);
  const backFactor = Math.max(0, -sinT);
  const chestBand = Math.exp(-Math.pow((t - 0.68) / 0.19, 2));
  const chestBoost = (cut === 'women' ? 0.042 : 0.025) * chestBand * Math.pow(frontFactor, 1.5);
  const backBoost = 0.018 * Math.exp(-Math.pow((t - 0.72) / 0.2, 2)) * Math.pow(backFactor, 1.5);

  // Subtle superellipse squaring so the torso has athletic shoulders & flat front/back planes
  const absCos = Math.abs(cosT);
  const absSin = Math.abs(sinT);
  const power = 0.88; // slightly squared oval
  const sx = Math.sign(-cosT) * Math.pow(absCos, power) * (rx - inset);
  const sz = Math.sign(sinT) * Math.pow(absSin, power) * (rz + chestBoost + backBoost - inset);

  // Vertical Y coordinate
  let y = (t - 0.5) * p.height;

  // Curved baseball shirttail hem (dips lower in front/back, higher at sides)
  if (sport === 'baseball') {
    const hemInfluence = Math.pow(1 - t, 3);
    const scoop = (absSin * 0.075 - 0.03) * hemInfluence;
    y -= scoop;
  }

  // Shoulder slope near top
  const shoulderSlope = smoothstep(0.75, 1.0, t) * (1 - absCos * 0.25);
  y += shoulderSlope * 0.035;

  // Neckline cutout dip on front center & subtle dip on back center
  const topInfluence = Math.pow(smoothstep(0.78, 1.0, t), 2.2);
  if (sinT > 0) {
    // Front neck opening
    const centerFocus = Math.pow(sinT, collar === 'v-neck' ? 3.5 : 2.2);
    let dip = 0.14;
    if (collar === 'v-neck') dip = 0.21;
    else if (collar === 'baseball-full' || collar === 'henley-2') dip = 0.155;
    else if (collar === 'polo') dip = 0.165;
    else if (collar === 'crew') dip = 0.125;
    y -= dip * centerFocus * topInfluence;
  } else {
    // Back neck subtle scoop
    const backFocus = Math.pow(-sinT, 2.2);
    y -= 0.045 * backFocus * topInfluence;
  }

  // Subtle organic cloth drape ripple near bottom hem
  const drape = Math.sin(theta * 5 + 0.6) * 0.006 * Math.pow(1 - t, 2);

  return new THREE.Vector3(sx, y, sz + drape * sinT);
}

function buildTorsoGeometry(
  cut: CutId,
  sport: SportId,
  collar: CollarStyle,
  inset = 0,
  flipWinding = false
): THREE.BufferGeometry {
  const segU = 96;
  const segV = 56;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= segV; j++) {
    const t = j / segV;
    for (let i = 0; i <= segU; i++) {
      const u = i / segU;
      const theta = u * Math.PI * 2;
      const pt = sampleTorsoPoint(t, theta, cut, sport, collar, inset);
      positions.push(pt.x, pt.y, pt.z);
      uvs.push(u, t);
    }
  }

  const stride = segU + 1;
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * stride + i;
      const b = j * stride + (i + 1);
      const c = (j + 1) * stride + (i + 1);
      const d = (j + 1) * stride + i;
      if (flipWinding) {
        indices.push(a, c, b);
        indices.push(a, d, c);
      } else {
        indices.push(a, b, c);
        indices.push(a, c, d);
      }
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Builds a sculpted left or right sleeve seamlessly emerging from the shoulder.
 * side = -1 (viewer left / wearer right) or +1 (viewer right / wearer left)
 */
function buildSleeveGeometry(
  side: -1 | 1,
  cut: CutId,
  sleeveStyle: SleeveStyle
): THREE.BufferGeometry | null {
  if (sleeveStyle === 'sleeveless') return null;

  const p = getCutProfile(cut);
  const length = sleeveStyle === 'long' ? 0.92 * p.sleeveScale : 0.44 * p.sleeveScale;
  const segLen = 24;
  const segRad = 36;

  const shoulderX = side * (p.shoulderW * 0.76);
  const shoulderY = p.height * 0.375;
  const baseRadiusY = (cut === 'women' ? 0.17 : 0.195) * p.sleeveScale;
  const baseRadiusZ = (cut === 'women' ? 0.16 : 0.18) * p.sleeveScale;
  const cuffRadius = (sleeveStyle === 'long' ? 0.095 : 0.145) * p.sleeveScale;

  // Natural downward sleeve angle (approx 36 degrees)
  const angle = 0.5;
  const dirX = side * Math.cos(angle);
  const dirY = -Math.sin(angle);

  // Perpendicular in XY plane
  const upX = -side * Math.sin(angle);
  const upY = -Math.cos(angle); // wait: let's keep up pointing +Yish:
  const perpX = side * Math.sin(angle);
  const perpY = Math.cos(angle);
  void upX;
  void upY;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= segLen; j++) {
    const s = j / segLen; // 0 = shoulder seam, 1 = sleeve cuff
    // Slight natural elbow curve for long sleeves
    const bendZ = sleeveStyle === 'long' ? Math.sin(s * Math.PI) * 0.045 : 0.01 * s;
    const cx = shoulderX + dirX * (s * length);
    const cy = shoulderY + dirY * (s * length) - Math.pow(s, 2) * 0.03;
    const cz = bendZ;

    // Taper radius smoothly from shoulder cap to cuff
    const ry = THREE.MathUtils.lerp(baseRadiusY, cuffRadius, Math.pow(s, 0.85));
    const rz = THREE.MathUtils.lerp(baseRadiusZ, cuffRadius * 0.96, Math.pow(s, 0.85));

    // Slightly flared shoulder cap overlap at s=0 so it merges cleanly into torso
    const capPull = (1 - smoothstep(0, 0.25, s)) * 0.06;

    for (let i = 0; i <= segRad; i++) {
      const u = i / segRad;
      const phi = u * Math.PI * 2;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      // Offset around sleeve cross-section
      const localUp = cosP * ry;
      const localZ = sinP * rz;

      // Pull shoulder top inward toward neck for organic raglan/set-in merge
      const x = cx + perpX * localUp - side * capPull * (0.5 + 0.5 * cosP);
      const y = cy + perpY * localUp + capPull * 0.35 * Math.max(0, cosP);
      const z = cz + localZ;

      positions.push(x, y, z);
      // Map u cleanly so outer face of sleeve (cosP ≈ 1) is centered at u = 0.5
      uvs.push(u, 1 - s);
    }
  }

  const stride = segRad + 1;
  for (let j = 0; j < segLen; j++) {
    for (let i = 0; i < segRad; i++) {
      const a = j * stride + i;
      const b = j * stride + (i + 1);
      const c = (j + 1) * stride + (i + 1);
      const d = (j + 1) * stride + i;
      if (side === -1) {
        indices.push(a, c, b);
        indices.push(a, d, c);
      } else {
        indices.push(a, b, c);
        indices.push(a, c, d);
      }
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Builds a 3D collar band following the exact top neckline of the torso.
 */
function buildCollarGeometry(
  cut: CutId,
  sport: SportId,
  collar: CollarStyle
): THREE.BufferGeometry {
  const segU = 72;
  const segV = collar === 'polo' ? 10 : 6;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const bandHeight = collar === 'polo' ? 0.085 : 0.042;
  const bandThick = collar === 'polo' ? 0.022 : 0.015;

  for (let j = 0; j <= segV; j++) {
    const v = j / segV; // 0 = base attached to torso, 1 = outer/top edge of collar
    for (let i = 0; i <= segU; i++) {
      const u = i / segU;
      const theta = u * Math.PI * 2;
      const basePt = sampleTorsoPoint(0.995, theta, cut, sport, collar, -0.004);

      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      let px = basePt.x;
      let py = basePt.y;
      let pz = basePt.z;

      if (collar === 'polo') {
        // Folded rugby polo collar: rises up then folds outward & down
        const fold = v < 0.45 ? v / 0.45 : 1 - (v - 0.45) / 0.55;
        const flare = v < 0.45 ? v * 0.01 : 0.01 + (v - 0.45) * 0.085;
        // Leave front placket opening gap near theta = PI/2
        const frontOpen = Math.max(0, sinT - 0.82) / 0.18;
        const openScale = 1 - frontOpen * 0.7;

        px += -cosT * flare * openScale;
        pz += sinT * flare * openScale;
        py += fold * bandHeight * openScale - (v > 0.45 ? (v - 0.45) * 0.03 : 0);
      } else {
        // Ribbed athletic collar band
        const arch = Math.sin(v * Math.PI);
        px += -cosT * (bandThick * arch);
        pz += sinT * (bandThick * arch);
        py += v * bandHeight;
      }

      positions.push(px, py, pz);
      uvs.push(u, v);
    }
  }

  const stride = segU + 1;
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * stride + i;
      const b = j * stride + (i + 1);
      const c = (j + 1) * stride + (i + 1);
      const d = (j + 1) * stride + i;
      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Builds the raised center-front baseball button placket & 3D button positions.
 */
function buildPlacketAndButtons(
  cut: CutId,
  sport: SportId,
  collar: CollarStyle
): { placket: THREE.BufferGeometry | null; buttons: THREE.Vector3[] } {
  if (collar !== 'baseball-full' && collar !== 'henley-2') {
    return { placket: null, buttons: [] };
  }

  const isFull = collar === 'baseball-full';
  const tStart = isFull ? 0.01 : 0.64;
  const tEnd = 0.96;
  const halfWidth = 0.024;
  const segV = 32;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    const t = THREE.MathUtils.lerp(tStart, tEnd, v);
    const center = sampleTorsoPoint(t, Math.PI / 2, cut, sport, collar, -0.006);

    positions.push(center.x - halfWidth, center.y, center.z);
    positions.push(center.x + halfWidth, center.y, center.z);
    uvs.push(0, v, 1, v);
  }

  for (let j = 0; j < segV; j++) {
    const a = j * 2;
    const b = j * 2 + 1;
    const c = (j + 1) * 2 + 1;
    const d = (j + 1) * 2;
    indices.push(a, b, c);
    indices.push(a, c, d);
  }

  const placket = new THREE.BufferGeometry();
  placket.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  placket.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  placket.setIndex(indices);
  placket.computeVertexNormals();

  // Compute 3D button positions along front placket
  const buttonCount = isFull ? 6 : 2;
  const buttons: THREE.Vector3[] = [];
  for (let k = 0; k < buttonCount; k++) {
    const frac = isFull ? 0.14 + (k / (buttonCount - 1)) * 0.72 : 0.72 + k * 0.14;
    const pt = sampleTorsoPoint(frac, Math.PI / 2, cut, sport, collar, -0.011);
    buttons.push(pt);
  }

  return { placket, buttons };
}

export function buildJerseyGeometry(
  cut: CutId,
  sport: SportId,
  collar: CollarStyle,
  sleeve: SleeveStyle
): JerseyGeometryParts {
  const torso = buildTorsoGeometry(cut, sport, collar, 0, false);
  const innerLining = buildTorsoGeometry(cut, sport, collar, 0.008, true);
  const leftSleeve = buildSleeveGeometry(-1, cut, sleeve);
  const rightSleeve = buildSleeveGeometry(1, cut, sleeve);
  const collarGeom = buildCollarGeometry(cut, sport, collar);
  const { placket, buttons } = buildPlacketAndButtons(cut, sport, collar);

  return {
    torso,
    innerLining,
    leftSleeve,
    rightSleeve,
    collar: collarGeom,
    placket,
    buttons,
  };
}
