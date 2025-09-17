import { v4 as uuid } from "uuid";
import { Container, ItemInstance, Orientation, Placement, SKU, Solution } from "./types";
import { aabbOverlap, fitsWithin } from "./geometry";
import { centerOfGravity, totalWeight, volumeUtilization, weightUtilization } from "./metrics";

/**
 * MVP greedy "shelf" (layer/row) packer with simple orientation handling.
 * - Sort items by volume desc (fragile last so they land on top layer).
 * - Place items into rows (x), rows into layers (y), layers stack upward (z).
 * - Enforces container bounds, uprightOnly, and simple clearance padding.
 * - After initial pass, performs a light "nudge" pass to close small gaps.
 */
export function solve(container: Container, skus: SKU[]): Solution {
  const clearance = container.clearance ?? 0;

  // Expand SKUs into item instances
  const items: ItemInstance[] = [];
  for (const s of skus) {
    for (let i = 0; i < s.qty; i++) {
      items.push({ ...s, instanceId: uuid() });
    }
  }

  // Sort: big first; fragile later so they trend to higher layers
  items.sort((a, b) => {
    const va = a.L * a.W * a.H;
    const vb = b.L * b.W * b.H;
    if (!!a.fragile !== !!b.fragile) return a.fragile ? 1 : -1;
    return vb - va;
  });

  const placements: Placement[] = [];
  const unplaced: ItemInstance[] = [];

  let z = 0; // current layer base
  let layerHeight = 0;

  let y = 0; // current row base in layer
  let rowDepth = 0;

  let x = 0; // current cursor in row

  function resetRow() { x = 0; rowDepth = 0; }
  function newRow() { y += rowDepth + clearance; resetRow(); }
  function newLayer() { z += layerHeight + clearance; y = 0; layerHeight = 0; resetRow(); }

  for (const it of items) {
    const orientations = allowedOrientations(it);
    let placed = false;

    retry:
    for (let pass = 0; pass < 3 && !placed; pass++) {
      // try current position → if not fit, new row → if not, new layer
      for (const dims of orientations) {
        const d: Orientation = [
          dims[0] + clearance,
          dims[1] + clearance,
          dims[2] + clearance
        ];
        // If item itself is bigger than container, give up immediately
        if (!fitsWithin([dims[0], dims[1], dims[2]], [container.L, container.W, container.H])) {
          continue;
        }
        // Try to place at current cursor; if doesn't fit in row, move row/layer
        let tries = 0;
        while (tries < 3) {
          if (z + d[2] <= container.H && y + d[1] <= container.W && x + d[0] <= container.L) {
            const placement: Placement = {
              instanceId: it.instanceId,
              skuId: it.id,
              name: it.name,
              pos: { x, y, z },
              dims: dims,
              weight: it.weight
            };
            // collision check vs existing placements
            if (!placements.some(p => aabbOverlap(p, placement))) {
              placements.push(placement);
              // advance cursors
              x += d[0];
              rowDepth = Math.max(rowDepth, d[1]);
              layerHeight = Math.max(layerHeight, d[2]);
              placed = true;
              break retry;
            }
          }
          // Advance strategy per try
          if (tries === 0) { // new row
            newRow();
          } else if (tries === 1) { // new layer
            newLayer();
          }
          tries++;
        }
      }
      // If still not placed and we haven't moved up, force new layer and try again
      if (!placed && pass === 0) newLayer();
    }
    if (!placed) unplaced.push(it);
  }

  // Light compaction pass (x-axis nudge left)
  placements.sort((a, b) => a.pos.x - b.pos.x);
  for (const p of placements) {
    let bestX = p.pos.x;
    for (let nx = Math.max(0, p.pos.x - 50); nx <= p.pos.x; nx += 5) {
      const candidate = { ...p, pos: { ...p.pos, x: nx } };
      if (candidate.pos.x < 0) continue;
      if (placements.every(q => q === p || !aabbOverlap(q, candidate))) {
        bestX = nx;
      }
    }
    p.pos.x = bestX;
  }

  // Final metrics
  const util = volumeUtilization(container, placements);
  const w = totalWeight(placements);
  const wUtil = weightUtilization(container.maxWeight, w);
  const cog = centerOfGravity(placements);

  return {
    placements,
    unplaced,
    utilization: util,
    weightUtilization: wUtil,
    centerOfGravity: cog,
    totalWeight: w
  };
}

function allowedOrientations(sku: SKU): Orientation[] {
  const o: Orientation[] = [
    [sku.L, sku.W, sku.H],
    [sku.L, sku.H, sku.W],
    [sku.W, sku.L, sku.H],
    [sku.W, sku.H, sku.L],
    [sku.H, sku.L, sku.W],
    [sku.H, sku.W, sku.L]
  ];
  return sku.uprightOnly ? [[sku.L, sku.W, sku.H]] : o;
}
