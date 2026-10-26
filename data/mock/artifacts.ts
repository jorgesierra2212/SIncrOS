import { Layer, PluginManifest, SkillFicha, TaskItem, SupportTicket, Conector, ArchivoItem, BrandConfig, ExecutionTrace, MarketDateState } from '../types';

// ---------- Artefactos del Sistema ----------
export type ArtifactKind =
  | 'grafico-bolsa'
  | 'reclamacion'
  | 'tabla-diferencias'
  | 'hoja-vida'
  | 'archivo-srm'
  | 'garantias'
  | 'escenarios'
  | 'formula'
  | 'reporte-pruebas';

export interface Artifact {
  id: string;
  title: string;
  kind: ArtifactKind;
  owner: string;
  version: number;
  updated: string;
  shared: string[];
  capa: Layer;
  historicoVersiones?: { version: number; fecha: string; autor: string; notas: string }[];
}

export const ARTIFACTS: Artifact[] = [
  {
    id: 'ART-101',
    title: 'Bolsa, embalse y recurso marginal · ene-2025 a oct-2026',
    kind: 'grafico-bolsa',
    owner: 'Camila Ortiz',
    version: 7,
    updated: 'Hoy 09:12',
    shared: ['Mercado', 'Gerencia', 'Despacho'],
    capa: 'nucleo',
    historicoVersiones: [
      { version: 7, fecha: 'Hoy 09:12', autor: 'Camila Ortiz', notas: 'Actualización con precio marginal de cierre de ayer' },
      { version: 6, fecha: 'Ayer 18:30', autor: 'Camila Ortiz', notas: 'Inclusión de cota mínima de embalses Peñol y Guavio' },
    ],
  },
  {
    id: 'ART-104',
    title: 'Reclamación ASIC · Reconciliación positiva TX2 21-oct',
    kind: 'reclamacion',
    owner: 'Auditor de liquidación',
    version: 2,
    updated: 'Hoy 07:40',
    shared: ['Liquidación', 'Gerencia'],
    capa: 'enersinc_cliente',
    historicoVersiones: [
      { version: 2, fecha: 'Hoy 07:40', autor: 'Auditor de liquidación', notas: 'Ajuste de soporte horario con archivo IDO de las 16:42' },
      { version: 1, fecha: 'Hoy 07:32', autor: 'Auditor de liquidación', notas: 'Borrador inicial generado automáticamente' },
    ],
  },
  {
    id: 'ART-108',
    title: 'Diferencias por concepto · Octubre TX2 vs Liquidación Sombra',
    kind: 'tabla-diferencias',
    owner: 'Auditor de liquidación',
    version: 12,
    updated: 'Hoy 07:35',
    shared: ['Liquidación'],
    capa: 'nucleo',
  },
  {
    id: 'ART-110',
    title: 'Garantías proyectadas · Próximas 6 semanas MEM',
    kind: 'garantias',
    owner: 'Proyección de garantías',
    version: 4,
    updated: 'Lun 07:05',
    shared: ['Liquidación', 'Finanzas'],
    capa: 'enersinc_cliente',
  },
  {
    id: 'ART-112',
    title: 'Escenarios hidrológicos y exposición a bolsa',
    kind: 'escenarios',
    owner: 'Camila Ortiz',
    version: 3,
    updated: 'Ayer 17:20',
    shared: ['Mercado', 'Gerencia', 'Riesgo'],
    capa: 'enersinc_cliente',
  },
  {
    id: 'ART-115',
    title: 'Lote de 38 Prefacturas de Comercialización · Octubre 2026',
    kind: 'tabla-diferencias',
    owner: 'Cargos y facturación',
    version: 1,
    updated: 'Hoy 08:45',
    shared: ['Finanzas'],
    capa: 'enersinc_cliente',
  },
  {
    id: 'ART-118',
    title: 'Archivo SRM estructurado · Transmisión 24-octubre',
    kind: 'archivo-srm',
    owner: 'Reporte SRM',
    version: 1,
    updated: 'Hoy 08:02',
    shared: ['CGM'],
    capa: 'nucleo',
  },
  {
    id: 'ART-121',
    title: 'Hoja de vida y telemetría · Frontera Frt-0412',
    kind: 'hoja-vida',
    owner: 'Crítica de medida',
    version: 5,
    updated: 'Hoy 05:06',
    shared: ['CGM'],
    capa: 'nucleo',
  },
  {
    id: 'ART-125',
    title: 'Fórmula RecPos · v14 (CREG 024 / CREG 051)',
    kind: 'formula',
    owner: 'Andrés Rojas',
    version: 14,
    updated: '02-ene-2026',
    shared: ['Liquidación', 'Administración', 'Enersinc'],
    capa: 'nucleo',
  },
  {
    id: 'ART-130',
    title: 'Reporte de Pruebas Automáticas · Plugin pred-bolsa-intradiario',
    kind: 'reporte-pruebas',
    owner: 'Estudio de Plugins Enersinc',
    version: 1,
    updated: 'Hoy 09:30',
    shared: ['Plataforma', 'Trading'],
    capa: 'cliente',
  },
];
