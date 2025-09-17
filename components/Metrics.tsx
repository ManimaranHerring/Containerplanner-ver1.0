"use client";
import { Container, Solution } from "../lib/types";

export default function Metrics({ container, solution }: { container: Container; solution: Solution }) {
  return (
    <div className="card">
      <div className="flex flex-wrap gap-6">
        <Metric label="Volume Utilization" value={`${solution.utilization.toFixed(1)} %`} />
        <Metric label="Weight Utilization" value={`${solution.weightUtilization.toFixed(1)} %`} />
        <Metric label="Total Weight" value={`${solution.totalWeight.toFixed(1)} kg`} />
        <Metric label="Center of Gravity"
                value={solution.centerOfGravity
                  ? `${solution.centerOfGravity.x.toFixed(1)}, ${solution.centerOfGravity.y.toFixed(1)}, ${solution.centerOfGravity.z.toFixed(1)}`
                  : "-"} />
        <Metric label="Unplaced Items" value={`${solution.unplaced.length}`} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="hcard min-w-[200px]">
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}
