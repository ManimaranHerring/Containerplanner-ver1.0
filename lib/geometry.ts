import { Placement } from "./types";

export function aabbOverlap(a: Placement, b: Placement): boolean {
  const ax2 = a.pos.x + a.dims[0], ay2 = a.pos.y + a.dims[1], az2 = a.pos.z + a.dims[2];
  const bx2 = b.pos.x + b.dims[0], by2 = b.pos.y + b.dims[1], bz2 = b.pos.z + b.dims[2];
  const overlap =
    a.pos.x < bx2 && ax2 > b.pos.x &&
    a.pos.y < by2 && ay2 > b.pos.y &&
    a.pos.z < bz2 && az2 > b.pos.z;
  return overlap;
}

export function fitsWithin(
  dims: [number, number, number],
  space: [number, number, number]
): boolean {
  return dims[0] <= space[0] && dims[1] <= space[1] && dims[2] <= space[2];
}
