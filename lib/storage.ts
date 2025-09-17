import { Container, SKU } from "./types";

const K = "cubemaster_demo_job";

export function saveJob(container: Container, skus: SKU[]) {
  const payload = { container, skus };
  localStorage.setItem(K, JSON.stringify(payload));
}

export function loadJob(): { container: Container; skus: SKU[] } | null {
  const raw = localStorage.getItem(K);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearJob() {
  localStorage.removeItem(K);
}
