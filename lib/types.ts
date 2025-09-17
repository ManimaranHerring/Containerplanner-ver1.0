export type Vec3 = { x: number; y: number; z: number };

export type Orientation = [number, number, number]; // dims in x,y,z order

export type Container = {
  L: number; // length (x)
  W: number; // width (y)
  H: number; // height (z)
  maxWeight: number;
  clearance: number; // padding between items
};

export type SKU = {
  id: string;
  name: string;
  L: number;
  W: number;
  H: number;
  weight: number;
  qty: number;
  uprightOnly?: boolean; // orientation constraint
  fragile?: boolean;     // prefer top
  stackLimit?: number;   // max stacked items of same sku
};

export type ItemInstance = SKU & { instanceId: string; };

export type Placement = {
  instanceId: string;
  skuId: string;
  name: string;
  pos: Vec3;           // lower-left-bottom corner
  dims: Orientation;   // oriented dims
  weight: number;
  locked?: boolean;    // manual lock
};

export type Solution = {
  placements: Placement[];
  unplaced: ItemInstance[];
  utilization: number;
  weightUtilization: number;
  centerOfGravity: Vec3 | null;
  totalWeight: number;
};
