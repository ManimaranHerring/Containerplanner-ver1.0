"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Placement, Container } from "../lib/types";
import { aabbOverlap } from "../lib/geometry";
import { useState } from "react";

type Props = {
  container: Container;
  placements: Placement[];
  onUpdate: (p: Placement) => void;
};

export default function Scene3D({ container, placements, onUpdate }: Props) {
  // scale mm -> meters for Three (1 unit = 1 cm here)
  const S = 0.01;

  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="h-[540px] rounded-2xl bg-white shadow">
      <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 10, 7]} intensity={0.8} />
        <gridHelper args={[10, 10, "#ccc", "#eee"]} />
        <axesHelper args={[1]} />

        {/* Container wireframe */}
        <group position={[0, 0, 0]}>
          <mesh position={[
            (container.L*S)/2,
            (container.W*S)/2,
            (container.H*S)/2
          ]}>
            <boxGeometry args={[container.L*S, container.W*S, container.H*S]} />
            <meshBasicMaterial color="black" wireframe />
          </mesh>
        </group>

        {placements.map(p => {
          const isSel = selected === p.instanceId;
          return (
            <mesh
              key={p.instanceId}
              position={[
                (p.pos.x + p.dims[0]/2) * S,
                (p.pos.y + p.dims[1]/2) * S,
                (p.pos.z + p.dims[2]/2) * S
              ]}
              onClick={(e) => { e.stopPropagation(); setSelected(p.instanceId); }}
              onPointerMissed={() => setSelected(null)}
            >
              <boxGeometry args={[p.dims[0]*S, p.dims[1]*S, p.dims[2]*S]} />
              <meshStandardMaterial
                roughness={0.7}
                metalness={0.05}
                color={isSel ? "#60a5fa" : "#93c5fd"}
              />
              <Html center distanceFactor={20}>
                <div className="text-[10px] bg-white/80 rounded px-1 py-0.5 shadow">
                  {p.name}
                </div>
              </Html>
            </mesh>
          );
        })}

        <OrbitControls makeDefault />
      </Canvas>

      {selected && (
        <div className="p-3 border-t text-sm flex gap-2 items-center">
          <span className="font-semibold">Selected:</span>
          <span className="mr-4">{placements.find(p => p.instanceId === selected)?.name}</span>
          <ManualNudge
            placement={placements.find(p => p.instanceId === selected)!}
            placements={placements}
            container={container}
            onUpdate={(np) => { onUpdate(np); }}
          />
        </div>
      )}
    </div>
  );
}

function ManualNudge({
  placement, placements, container, onUpdate
}: {
  placement: Placement;
  placements: Placement[];
  container: Container;
  onUpdate: (p: Placement) => void;
}) {
  const [x, setX] = useState(placement.pos.x);
  const [y, setY] = useState(placement.pos.y);
  const [z, setZ] = useState(placement.pos.z);
  const [ok, setOk] = useState(true);

  function test(np: Placement): boolean {
    // within container
    if (np.pos.x < 0 || np.pos.y < 0 || np.pos.z < 0) return false;
    if (np.pos.x + np.dims[0] > container.L) return false;
    if (np.pos.y + np.dims[1] > container.W) return false;
    if (np.pos.z + np.dims[2] > container.H) return false;
    // collision
    for (const q of placements) {
      if (q.instanceId === np.instanceId) continue;
      if (aabbOverlap(np, q)) return false;
    }
    return true;
  }

  return (
    <div className="flex items-center gap-2">
      <label>X</label>
      <input type="number" className="w-24" value={x} onChange={(e)=>setX(Number(e.target.value))} />
      <label>Y</label>
      <input type="number" className="w-24" value={y} onChange={(e)=>setY(Number(e.target.value))} />
      <label>Z</label>
      <input type="number" className="w-24" value={z} onChange={(e)=>setZ(Number(e.target.value))} />
      <button
        className={`px-3 py-2 rounded-lg ${ok ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
        onClick={()=>{
          const np = {...placement, pos: {x, y, z}};
          const feasible = test(np);
          setOk(feasible);
          if (feasible) onUpdate(np);
        }}
      >
        Apply
      </button>
      {!ok && <span className="text-red-600">Overlap or out of bounds</span>}
    </div>
  );
}
