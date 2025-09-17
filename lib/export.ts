import { jsPDF } from "jspdf";
import Papa from "papaparse";
import { Container, Placement, Solution } from "./types";

export function exportCSV(placements: Placement[]) {
  const rows = placements.map(p => ({
    instanceId: p.instanceId,
    skuId: p.skuId,
    name: p.name,
    x: p.pos.x, y: p.pos.y, z: p.pos.z,
    L: p.dims[0], W: p.dims[1], H: p.dims[2],
    weight: p.weight
  }));
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  download(url, "packing_plan.csv");
}

export function exportPDF(container: Container, solution: Solution) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(16);
  doc.text("CubeMaster Packing Plan", 12, 16);
  doc.setFontSize(10);
  doc.text(`Container: ${container.L}x${container.W}x${container.H} mm   Max Weight: ${container.maxWeight} kg`, 12, 24);
  doc.text(`Utilization: ${solution.utilization.toFixed(1)}%   Weight Utilization: ${solution.weightUtilization.toFixed(1)}%`, 12, 30);

  doc.setFontSize(11);
  let y = 40;
  doc.text("Placements:", 12, y); y += 6;
  doc.setFontSize(9);
  const header = ["Item", "x", "y", "z", "L", "W", "H", "kg"];
  doc.text(header.join("   "), 12, y); y += 5;

  for (const p of solution.placements.slice(0, 40)) {
    const row = [
      p.name, p.pos.x, p.pos.y, p.pos.z, p.dims[0], p.dims[1], p.dims[2], p.weight
    ].join("   ");
    doc.text(String(row), 12, y);
    y += 5;
    if (y > 190) { doc.addPage(); y = 20; }
  }

  doc.save("packing_plan.pdf");
}

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
