import type { Layer } from './types';

// Datos ilustrativos del dominio Liquidación y Garantías
export interface FormulaNode {
  name: string;
  source?: string;
  children?: FormulaNode[];
}

export const RECPOS_TREE: FormulaNode = {
  name: 'RecPos (Reconciliación Positiva Horaria)',
  children: [
    { name: 'GenReal', source: 'Medida certificada de fronteras de generación · CGM (CREG 038)' },
    {
      name: 'GenIdeal',
      children: [
        { name: 'Despacho ideal horario', source: 'XM · Archivo de despacho ideal oficial' },
        { name: 'Disponibilidad declarada ante CND', source: 'XM · Archivo IDO (hora 16:42 redeclaración)' },
      ],
    },
    {
      name: 'PrecioRec (Precio de Reconciliación)',
      children: [
        { name: 'Precio de oferta de la unidad', source: 'XM · Ofertas horarias vigentes' },
        { name: 'Precio de bolsa spot horario', source: 'XM · Publicación FTP LAC' },
        { name: 'Costo de combustible auditado', source: 'Contratos de suministro y transporte de gas' },
      ],
    },
  ],
};

export const FORMULAS = [
  { code: 'RecPos', name: 'Reconciliación positiva', version: 14, from: '01-ene-2026', to: 'vigente', status: 'Vigente', capa: 'nucleo' as Layer },
  { code: 'RecNeg', name: 'Reconciliación negativa', version: 11, from: '01-ene-2026', to: 'vigente', status: 'Vigente', capa: 'nucleo' as Layer },
  { code: 'CxC_OEF', name: 'Cargo por confiabilidad · OEF', version: 9, from: '01-dic-2025', to: 'vigente', status: 'Vigente', capa: 'nucleo' as Layer },
  { code: 'Desv', name: 'Desviaciones de generación', version: 6, from: '01-mar-2025', to: 'vigente', status: 'Vigente', capa: 'nucleo' as Layer },
  { code: 'Restr', name: 'Restricciones de red y generación', version: 8, from: '01-jul-2025', to: 'vigente', status: 'Vigente', capa: 'nucleo' as Layer },
  { code: 'C_Cond', name: 'Contrato condicional por precio', version: 3, from: '01-feb-2026', to: 'vigente', status: 'Vigente', capa: 'enersinc_cliente' as Layer },
  { code: 'RecPos', name: 'Reconciliación positiva', version: 13, from: '01-jun-2024', to: '31-dic-2025', status: 'Histórica', capa: 'nucleo' as Layer },
  { code: 'Gar_Sem', name: 'Garantía semanal MEM', version: 2, from: '01-nov-2026', to: '—', status: 'Borrador', capa: 'enersinc_cliente' as Layer },
];

export const SETTLEMENT = [
  { concepto: 'Ventas en bolsa', calc: 18_420_300_000, xm: 18_419_900_000 },
  { concepto: 'Compras en bolsa', calc: -6_210_450_000, xm: -6_210_450_000 },
  { concepto: 'Reconciliación positiva', calc: 1_332_850_000, xm: 1_284_500_000 },
  { concepto: 'Reconciliación negativa', calc: -412_300_000, xm: -412_300_000 },
  { concepto: 'Restricciones', calc: -288_900_000, xm: -301_750_000 },
  { concepto: 'Cargo por confiabilidad', calc: 4_870_000_000, xm: 4_870_000_000 },
  { concepto: 'Desviaciones', calc: -96_400_000, xm: -96_380_000 },
  { concepto: 'Contratos despachados', calc: 9_840_000_000, xm: 9_840_000_000 },
  { concepto: 'Servicios CND y ASIC', calc: -38_200_000, xm: -38_200_000 },
  { concepto: 'Combustibles reconocidos', calc: 2_115_000_000, xm: 2_089_600_000 },
];

export const VERSIONS = ['TX1', 'TX2', 'TX3', 'TXR', 'TXF'];

export const GUARANTEES = ['27-oct', '03-nov', '10-nov', '17-nov', '24-nov', '01-dic'].map((w, i) => ({
  semana: w,
  proyectada: [2.95, 3.42, 3.31, 3.05, 2.88, 2.71][i],
  xm: i === 0 ? 2.91 : undefined,
  provisionada: 2.81,
}));
