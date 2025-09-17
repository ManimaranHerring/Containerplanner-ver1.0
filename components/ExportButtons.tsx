"use client";
import { Container, Solution } from "../lib/types";
import { exportCSV, exportPDF } from "../lib/export";

export default function ExportButtons({ container, solution }: { container: Container; solution: Solution }) {
  return (
    <div className="flex gap-3">
      <button className="bg-green-600 text-white px-4 py-2 rounded-2xl"
        onClick={()=>exportCSV(solution.placements)}>Export CSV</button>
      <button className="bg-purple-600 text-white px-4 py-2 rounded-2xl"
        onClick={()=>exportPDF(container, solution)}>Export PDF</button>
    </div>
  );
}
