"use client";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import Scene3D from "../components/Scene3D";
import Metrics from "../components/Metrics";
import ExportButtons from "../components/ExportButtons";
import { Container, SKU, Solution, Placement } from "../lib/types";
import { solve } from "../lib/packing";
import { saveJob, loadJob, clearJob } from "../lib/storage";

export default function Page() {
  const [container, setContainer] = useState<Container>({
    L: 1200, W: 1000, H: 1200, maxWeight: 1000, clearance: 5
  });
  const [skus, setSkus] = useState<SKU[]>([
    { id: uuid(), name: "Box A", L: 400, W: 300, H: 300, weight: 10, qty: 4 },
    { id: uuid(), name: "Box B", L: 600, W: 400, H: 250, weight: 14, qty: 3, uprightOnly: true },
    { id: uuid(), name: "Fragile C", L: 300, W: 300, H: 200, weight: 6, qty: 4, fragile: true }
  ]);

  const solution: Solution = useMemo(() => solve(container, skus), [container, skus]);

  useEffect(() => {
    const loaded = loadJob();
    if (loaded) { setContainer(loaded.container); setSkus(loaded.skus); }
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CubeMaster Demo</h1>
        <div className="flex gap-2">
          <button className="bg-gray-200 px-3 py-2 rounded-xl"
            onClick={()=>saveJob(container, skus)}>Save Job</button>
          <button className="bg-gray-200 px-3 py-2 rounded-xl"
            onClick={()=>{ const j=loadJob(); if(j){setContainer(j.container); setSkus(j.skus);} }}>Load</button>
          <button className="bg-gray-200 px-3 py-2 rounded-xl"
            onClick={()=>{ clearJob(); }}>Clear Saved</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-5">
          <div className="card section">
            <h2 className="font-semibold">Container / Shipper</h2>
            <div className="grid grid-cols-2 gap-3">
              <LabeledNumber label="Length (mm)" value={container.L} onChange={v=>setContainer({...container, L:v})}/>
              <LabeledNumber label="Width (mm)"  value={container.W} onChange={v=>setContainer({...container, W:v})}/>
              <LabeledNumber label="Height (mm)" value={container.H} onChange={v=>setContainer({...container, H:v})}/>
              <LabeledNumber label="Max Weight (kg)" value={container.maxWeight} onChange={v=>setContainer({...container, maxWeight:v})}/>
              <LabeledNumber label="Clearance (mm)" value={container.clearance} onChange={v=>setContainer({...container, clearance:v})}/>
            </div>
          </div>

          <div className="card section">
            <h2 className="font-semibold">SKUs</h2>
            <div className="space-y-3">
              {skus.map((s, idx)=>(
                <div key={s.id} className="border rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <input className="w-[55%]" value={s.name} onChange={e=>editSKU(s.id,{name:e.target.value})}/>
                    <button className="text-red-600" onClick={()=>removeSKU(s.id)}>Delete</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <LabeledNumber label="L (mm)" value={s.L} onChange={v=>editSKU(s.id,{L:v})}/>
                    <LabeledNumber label="W (mm)" value={s.W} onChange={v=>editSKU(s.id,{W:v})}/>
                    <LabeledNumber label="H (mm)" value={s.H} onChange={v=>editSKU(s.id,{H:v})}/>
                    <LabeledNumber label="Weight (kg)" value={s.weight} onChange={v=>editSKU(s.id,{weight:v})}/>
                    <LabeledNumber label="Qty" value={s.qty} onChange={v=>editSKU(s.id,{qty:v})}/>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={s.uprightOnly || false}
                        onChange={e=>editSKU(s.id,{uprightOnly:e.target.checked})}/>
                      Upright only
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={s.fragile || false}
                        onChange={e=>editSKU(s.id,{fragile:e.target.checked})}/>
                      Fragile (prefer top)
                    </label>
                  </div>
                </div>
              ))}
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl" onClick={addSKU}>+ Add SKU</button>
            </div>
          </div>

          <div className="card section">
            <h2 className="font-semibold">Exports</h2>
            <ExportButtons container={container} solution={solution}/>
            <p className="text-xs text-gray-500">
              CSV: placement list • PDF: summary sheet for client sign-off
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <Scene3D
            container={container}
            placements={solution.placements}
            onUpdate={(np: Placement)=>{
              // write back manual nudge
              const idx = solution.placements.findIndex(p => p.instanceId === np.instanceId);
              if (idx >= 0) {
                // Replace inside SKUs? Not needed: placements derive from solve();
                // For MVP we keep a local override by re-embedding into skus via "lock" and re-solve for others is out of scope.
                // So we'll just mutate in-place for visualization:
                solution.placements[idx] = np;
              }
            }}
          />
          <Metrics container={container} solution={solution}/>
          <div className="text-sm text-gray-600">
            <strong>Notes:</strong> This MVP uses a greedy layer/row heuristic for fast demos. For larger instances or higher packing quality, you can
            later swap the solver with a metaheuristic or MIP/OR-Tools backend. :contentReference[oaicite:1]{index=1}
          </div>
        </div>
      </div>
    </div>
  );

  function addSKU() {
    setSkus(prev => [...prev, {
      id: uuid(), name: "New SKU", L: 300, W: 300, H: 300, weight: 10, qty: 1
    }]);
  }
  function removeSKU(id: string) {
    setSkus(prev => prev.filter(s=>s.id!==id));
  }
  function editSKU(id: string, patch: Partial<SKU>) {
    setSkus(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }
}

function LabeledNumber({ label, value, onChange }: { label: string; value: number; onChange: (v:number)=>void }) {
  return (
    <label className="flex flex-col gap-1">
      <span>{label}</span>
      <input type="number" value={value} onChange={(e)=>onChange(Number(e.target.value))}/>
    </label>
  );
}
