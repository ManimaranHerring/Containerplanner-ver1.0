import { Container, Placement, Vec3 } from "./types";

export function volumeUtilization(container: Container, placements: Placement[]): number {
  const cVol = container.L * container.W * container.H;
  const used = placements.reduce((s, p) => s + p.dims[0]*p.dims[1]*p.dims[2], 0);
  return cVol === 0 ? 0 : (used / cVol) * 100;
}

export function totalWeight(placements: Placement[]): number {
  return placements.reduce((s, p) => s + p.weight, 0);
}

export function weightUtilization(max: number, current: number): number {
  return max === 0 ? 0 : (current / max) * 100;
}

export function centerOfGravity(placements: Placement[]): Vec3 | null {
  const tw = totalWeight(placements);
  if (tw === 0) return null;
  let cx = 0, cy = 0, cz = 0;
  for (const p of placements) {
    const cxp = p.pos.x + p.dims[0] / 2;
    const cyp = p.pos.y + p.dims[1] / 2;
    const czp = p.pos.z + p.dims[2] / 2;
    cx += cxp * p.weight;
    cy += cyp * p.weight;
    cz += czp * p.weight;
  }
  return { x: cx / tw, y: cy / tw, z: cz / tw };
}
