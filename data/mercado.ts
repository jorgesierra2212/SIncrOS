import { seeded } from './mock/core';

// Datos ilustrativos del dominio Mercado, ETRM y Riesgo
export const MONTHS = ['ene-25', 'feb-25', 'mar-25', 'abr-25', 'may-25', 'jun-25', 'jul-25', 'ago-25', 'sep-25', 'oct-25', 'nov-25', 'dic-25', 'ene-26', 'feb-26', 'mar-26', 'abr-26', 'may-26', 'jun-26', 'jul-26', 'ago-26', 'sep-26', 'oct-26'];
export const BOLSA = [530, 430, 215, 140, 120, 110, 120, 210, 300, 150, 180, 280, 210, 105, 190, 240, 490, 560, 800, 946, 905, 690];
export const EMBALSE = [62, 55, 48, 52, 63, 71, 78, 80, 76, 74, 77, 72, 64, 56, 50, 55, 66, 74, 79, 79, 71, 64];
export const HIDRO = [5100, 4900, 5700, 5600, 6000, 5650, 6050, 5900, 5650, 6050, 5750, 5900, 5900, 5400, 5750, 5600, 5600, 5200, 5100, 4800, 4500, 4700];
export const TERMO = [1500, 1100, 800, 750, 700, 750, 760, 850, 950, 700, 800, 900, 800, 600, 1000, 1000, 1400, 1500, 1900, 2250, 2443, 2100];
export const MARKET = MONTHS.map((m, i) => ({ mes: m, bolsa: BOLSA[i], embalse: EMBALSE[i], hidraulica: HIDRO[i], termica: TERMO[i], escasez: 1172 }));

export const EMBALSE_TRAMOS = [
  { tramo: '30–40 %', precio: 338 },
  { tramo: '40–50 %', precio: 220 },
  { tramo: '50–60 %', precio: 220 },
  { tramo: '60–70 %', precio: 232 },
  { tramo: '70–80 %', precio: 150 },
  { tramo: '80–90 %', precio: 129 },
];

export const CONTRACTS = [
  { id: 'C-2026-014', cp: 'Comercializadora Andina', side: 'Venta', type: 'Pague lo contratado', from: 'ene-26', to: 'dic-28', gwh: 182.4, price: 318, index: 'IPP', asic: 'Registrado' },
  { id: 'C-2026-019', cp: 'Industrias del Caribe', side: 'Venta', type: 'Pague lo demandado', from: 'mar-26', to: 'feb-27', gwh: 46.1, price: 342, index: 'IPC', asic: 'Registrado' },
  { id: 'C-2026-031', cp: 'Energía Sabana', side: 'Venta', type: 'Condicional por precio de bolsa', from: 'jul-26', to: 'jun-27', gwh: 58.3, price: 365, index: 'Bolsa', asic: 'Registrado' },
  { id: 'C-2025-077', cp: 'Generadora del Sinú', side: 'Compra', type: 'Pague lo contratado', from: 'ene-25', to: 'dic-27', gwh: 96.0, price: 295, index: 'IPP', asic: 'Registrado' },
  { id: 'C-2026-042', cp: 'Solar Cesar', side: 'Compra', type: 'PPA renovable', from: 'ene-27', to: 'dic-38', gwh: 210.0, price: 247, index: 'IPC', asic: 'Pendiente' },
  { id: 'SICEP-26-08', cp: 'Convocatoria SICEP', side: 'Venta', type: 'Estandarizado SICEP', from: 'ene-27', to: 'dic-29', gwh: 120.0, price: 334, index: 'IPP', asic: 'En adjudicación' },
];

export const POSITION = Array.from({ length: 30 }, (_, d) => {
  const r = seeded(100 + d);
  const gen = 820 + r() * 260 - (d > 18 ? 180 : 0);
  const compras = 260;
  const ventas = 1080 + r() * 40;
  return { dia: `${d + 1}`, generacion: Math.round(gen), compras, ventas: Math.round(ventas), neta: Math.round(gen + compras - ventas) };
});

export const MTM = CONTRACTS.map((c, i) => {
  const curve = [355, 348, 360, 340, 300, 338][i];
  const sign = c.side === 'Venta' ? 1 : -1;
  return { ...c, curve, mtm: Math.round(sign * (c.price - curve) * c.gwh * 1_000_000 * 0.35) };
});

export const SICEP_CALLS = [
  { id: 'SICEP-26-08', buyer: 'Comercializador regulado A', product: 'Anual plano', period: '2027–2029', gwh: 640, close: '06-nov-2026', status: 'Abierta' },
  { id: 'SICEP-26-09', buyer: 'Comercializador regulado B', product: 'Base + punta', period: '2027–2028', gwh: 310, close: '13-nov-2026', status: 'Abierta' },
  { id: 'SICEP-26-05', buyer: 'Comercializador regulado C', product: 'Anual plano', period: '2027', gwh: 180, close: '02-oct-2026', status: 'Adjudicada' },
];

export const SCENARIOS = MONTHS.slice(-6).concat(['nov-26', 'dic-26', 'ene-27', 'feb-27', 'mar-27', 'abr-27']).map((m, i) => ({
  mes: m,
  real: i < 6 ? BOLSA[16 + i] : undefined,
  humedo: i >= 5 ? Math.round(690 - (i - 5) * 70) : undefined,
  medio: i >= 5 ? Math.round(690 - (i - 5) * 25) : undefined,
  seco: i >= 5 ? Math.round(690 + (i - 5) * 60) : undefined,
}));

export const LIMITS = [
  { name: 'Exposición a bolsa de la demanda atendida', use: 21, limit: 25, unit: '%' },
  { name: 'Pérdida en riesgo (PaR 95 %, 30 días)', use: 3.9, limit: 5, unit: 'mil M' },
  { name: 'Concentración en una contraparte', use: 38, limit: 40, unit: '%' },
  { name: 'Garantías sobre caja disponible', use: 62, limit: 70, unit: '%' },
];
