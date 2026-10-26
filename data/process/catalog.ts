import type { ProcessWorkflow } from '../workflowModels';
import type { GridRow } from '../../components/AirtableGrid';
import type { Columna, Equipo, Fila, ProcesoDef, RolProceso } from './types';
import { WF_CRITICA_M2C } from './workflows/wf-critica-m2c';
import { WF_LIQ_SOMBRA } from './workflows/wf-liq-sombra';
import { WF_LIQ_CONTRATOS } from './workflows/wf-liq-contratos';
import { WF_LIQ_UNR } from './workflows/wf-liq-unr';
import { WF_DESPACHO_D1 } from './workflows/wf-despacho-d1';
import { WF_SRM, WF_FACTURACION, WF_GARANTIAS, WF_RECLAMACIONES } from './workflows/nuevos';

// ---------- Columnas ----------
function cols(
  l: { concepto: string; categoria: string; calc: string; ref: string; regla: string },
  tipo: 'moneda' | 'numero',
  estados: string[],
  unidad?: string
): Columna[] {
  return [
    { key: 'concepto', label: l.concepto, tipo: 'texto' },
    { key: 'categoria', label: l.categoria, tipo: 'texto' },
    { key: 'calc', label: l.calc, tipo, editable: true, unidad },
    { key: 'ref', label: l.ref, tipo, unidad },
    { key: 'diff', label: 'Diferencia', tipo, unidad },
    { key: 'regla', label: l.regla, tipo: 'texto' },
    { key: 'estado', label: 'Estado', tipo: 'estado', editable: true, opciones: estados },
  ];
}
const LIQ_ESTADOS = ['Cuadra', 'Revisar', 'Reclamar', 'Ajustado Manual'];

function desdeGrid(wf: ProcessWorkflow): Fila[] {
  return wf.airtableData.map(r => ({
    id: r.id,
    concepto: r.concepto,
    categoria: r.categoria,
    calc: r.calc,
    ref: r.xm,
    diff: r.diff,
    regla: r.regla,
    estado: r.estado,
  }));
}

function aGrid(filas: Fila[], umbral = 1_000_000): GridRow[] {
  return filas.map(f => ({
    id: f.id,
    concepto: String(f.concepto),
    categoria: String(f.categoria),
    calc: Number(f.calc),
    xm: Number(f.ref),
    diff: Number(f.diff),
    regla: String(f.regla),
    umbral,
    estado: (['Cuadra', 'Reclamar', 'Revisar', 'Ajustado Manual'].includes(String(f.estado))
      ? f.estado
      : Number(f.diff) !== 0
      ? 'Revisar'
      : 'Cuadra') as GridRow['estado'],
    detalles: {
      formula: `${f.regla} · Diferencia = Calculado − Referencia`,
      explicacion: `Registro auditable de ${f.concepto} (${f.categoria}).`,
    },
  }));
}

const fila = (id: string, concepto: string, categoria: string, calc: number, ref: number, regla: string, estado: string): Fila =>
  ({ id, concepto, categoria, calc, ref, diff: calc - ref, regla, estado });

const FILAS_SRM: Fila[] = [
  fila('SRM-1', 'Frt-0118 · Planta Térmica Norte U1', 'Generación', 118_902, 118_902, 'CREG 038 · Telemedida Ppal', 'Cuadra'),
  fila('SRM-2', 'Frt-0412 · Planta Térmica Norte U2', 'Generación', 104_501, 97_840, 'CREG 038 · Respaldo R1', 'Estimada'),
  fila('SRM-3', 'Frt-0533 · Industrias del Caribe', 'Consumo UNR', 21_408, 21_408, 'CREG 038 · Telemedida Ppal', 'Cuadra'),
  fila('SRM-4', 'Frt-0761 · Autogeneración Cali 1', 'Autogeneración', 31_106, 29_950, 'CREG 038 · Respaldo R2', 'Estimada'),
  fila('SRM-5', 'Frt-0819 · Sede Barranquilla 2', 'Consumo UNR', 18_640, 18_640, 'CREG 038 · Telemedida Ppal', 'Cuadra'),
];

const FILAS_RECLAMACIONES: Fila[] = [
  fila('REC-1', 'Reconciliación positiva · H18–H21', 'Unidad 2', 1_332_850_000, 1_284_500_000, 'RecPos v14 · CREG 024', 'En revisión'),
  fila('REC-2', 'Combustibles reconocidos', 'Unidad 1', 2_115_000_000, 2_089_600_000, 'Comb v5 · CREG 034', 'Borrador'),
  fila('REC-3', 'Restricciones operativas', 'Unidad 2', -288_900_000, -301_750_000, 'Restr v8 · CREG 062', 'Borrador'),
  fila('REC-4', 'Desviaciones horarias', 'Hidro Sinú', -96_400_000, -96_380_000, 'Desv v6 · CREG 024', 'Radicada'),
];

const FILAS_GARANTIAS: Fila[] = [
  fila('G-1', 'Semana 27-oct-2026', 'Bolsa y restricciones', 2_950_000_000, 2_810_000_000, 'CREG 159 · Bolsa $880/kWh', 'Faltante'),
  fila('G-2', 'Semana 03-nov-2026', 'Bolsa y restricciones', 3_418_000_000, 2_806_000_000, 'CREG 159 · Bolsa $910/kWh', 'Provisionar'),
  fila('G-3', 'Semana 10-nov-2026', 'Bolsa y restricciones', 3_310_000_000, 2_806_000_000, 'CREG 159 · Bolsa $890/kWh', 'Faltante'),
  fila('G-4', 'Semana 17-nov-2026', 'Bolsa y restricciones', 3_050_000_000, 3_100_000_000, 'CREG 159 · Bolsa $840/kWh', 'Cubierta'),
];

const FILAS_FACTURACION: Fila[] = [
  fila('F-1', 'Industrias del Caribe', 'Energía contrato', 412_800_000, 371_000_000, 'C-2026-019 · DIAN UBL 2.1', 'Revisar'),
  fila('F-2', 'Comercializadora Andina', 'Contrato bilateral', 1_284_000_000, 1_250_000_000, 'C-2026-014 · DIAN UBL 2.1', 'Lista'),
  fila('F-3', 'Energía Sabana', 'Contrato condicional', 642_100_000, 518_400_000, 'C-2026-031 · DIAN UBL 2.1', 'Revisar'),
  fila('F-4', 'Sede Montería 2', 'Tarifa UNR CU', 38_400_000, 37_900_000, 'CREG 119/2007 · UNR', 'Lista'),
  fila('F-5', 'Sede Cali 1', 'Excedentes AGR', 9_850_000, 10_200_000, 'CREG 174/2021 · Nota crédito', 'Nota crédito'),
];

// Sincronizar airtableData en los 4 workflows nuevos
WF_SRM.airtableData = aGrid(FILAS_SRM, 500);
WF_RECLAMACIONES.airtableData = aGrid(FILAS_RECLAMACIONES, 5_000_000);
WF_GARANTIAS.airtableData = aGrid(FILAS_GARANTIAS, 50_000_000);
WF_FACTURACION.airtableData = aGrid(FILAS_FACTURACION, 10_000_000);

// ---------- Roles ----------
const ADMIN: Record<string, RolProceso> = { admin_cliente: 'Dueño', enersinc: 'Lector', ger: 'Lector' };

// ---------- Los 9 Procesos ----------
export const PROCESOS: ProcesoDef[] = [
  {
    id: 'wf-despacho-d1',
    nombre: 'Oferta diaria de despacho',
    codigo: 'DSP-D1',
    dominio: 'Despacho',
    descripcion: 'Proyección de disponibilidad, precio de oferta y envío al CND para el día siguiente.',
    equipoDueno: 'eq-despacho',
    versionado: false,
    entidad: 'XM (CND)',
    documentoEnvio: 'Oferta y declaración D-1',
    workflow: { ...WF_DESPACHO_D1, isFinancialSettlement: false },
    columnas: cols({ concepto: 'Planta', categoria: 'Tecnología', calc: 'Oferta', ref: 'Aceptado CND', regla: 'Regla' }, 'numero', LIQ_ESTADOS, 'MW'),
    filas: desdeGrid(WF_DESPACHO_D1),
    roles: { ...ADMIN, despacho: 'Aprobador', liq: 'Lector' },
    plantillasReporte: [
      { titulo: 'Oferta por planta', tipo: 'tabla' },
      { titulo: 'Oferta frente a lo aceptado', tipo: 'grafico' },
      { titulo: 'Tablero de despacho D-1', tipo: 'tablero' },
    ],
  },
  {
    id: 'wf-critica-m2c',
    nombre: 'Crítica de medida diaria',
    codigo: 'CGM-CRI',
    dominio: 'CGM',
    descripcion: 'Validación diaria de telemedida de 1.284 fronteras, detección de desfases y estimación CREG 038.',
    equipoDueno: 'eq-cgm',
    versionado: false,
    entidad: 'XM (CND)',
    documentoEnvio: 'Acta de crítica y sustitución de medida',
    workflow: { ...WF_CRITICA_M2C, title: 'Crítica de medida diaria', shortCode: 'CGM-CRI', isFinancialSettlement: false },
    columnas: cols({ concepto: 'Frontera', categoria: 'Tipo', calc: 'Telemedida', ref: 'Respaldo', regla: 'Regla' }, 'numero', ['Cuadra', 'Revisar', 'Estimada', 'Ajustado Manual'], 'kWh'),
    filas: desdeGrid(WF_CRITICA_M2C),
    roles: { ...ADMIN, cgm: 'Aprobador', liq: 'Lector' },
    plantillasReporte: [
      { titulo: 'Fronteras con anomalía', tipo: 'tabla' },
      { titulo: 'Principal frente a respaldo', tipo: 'grafico' },
      { titulo: 'Tablero de crítica CGM', tipo: 'tablero' },
    ],
  },
  {
    id: 'wf-srm',
    nombre: 'Reporte SRM diario',
    codigo: 'CGM-SRM',
    dominio: 'CGM',
    descripcion: 'Consolidación de lecturas horarias, validación de formato XML v4.2 y transmisión oficial al SRM de XM.',
    equipoDueno: 'eq-cgm',
    versionado: false,
    entidad: 'XM (CND)',
    documentoEnvio: 'Archivo SRM diario',
    workflow: WF_SRM,
    columnas: cols({ concepto: 'Frontera', categoria: 'Segmento', calc: 'Reportado SRM', ref: 'Medidor Ppal', regla: 'Regla' }, 'numero', ['Cuadra', 'Estimada', 'Revisar', 'Ajustado Manual'], 'kWh'),
    filas: FILAS_SRM,
    roles: { ...ADMIN, cgm: 'Aprobador', enersinc: 'Ejecutor' },
    plantillasReporte: [
      { titulo: 'Archivo SRM por frontera', tipo: 'tabla' },
      { titulo: 'Reportado SRM vs medidor principal', tipo: 'grafico' },
      { titulo: 'Tablero de transmisión SRM', tipo: 'tablero' },
    ],
  },
  {
    id: 'wf-liq-sombra',
    nombre: 'Liquidación sombra TX',
    codigo: 'LIQ-TX',
    dominio: 'Liquidación',
    descripcion: 'Cálculo paralelo de cada concepto con las reglas vigentes y comparación con la versión publicada por XM.',
    equipoDueno: 'eq-liquidacion',
    versionado: true,
    entidad: 'XM (ASIC)',
    documentoEnvio: 'Reporte de diferencias',
    workflow: { ...WF_LIQ_SOMBRA, isFinancialSettlement: true },
    columnas: cols({ concepto: 'Concepto', categoria: 'Categoría', calc: 'Calculado', ref: 'Publicado XM', regla: 'Regla' }, 'moneda', LIQ_ESTADOS),
    filas: desdeGrid(WF_LIQ_SOMBRA),
    roles: { ...ADMIN, liq: 'Aprobador', fin: 'Lector' },
    plantillasReporte: [
      { titulo: 'Diferencias por concepto', tipo: 'tabla' },
      { titulo: 'Calculado frente a XM', tipo: 'grafico' },
      { titulo: 'Tablero de liquidación', tipo: 'tablero' },
    ],
  },
  {
    id: 'wf-liq-contratos',
    nombre: 'Liquidación de contratos',
    codigo: 'LIQ-CTR',
    dominio: 'Liquidación',
    descripcion: 'Despacho y valoración de contratos bilaterales y SICEP contra lo liquidado por el ASIC.',
    equipoDueno: 'eq-liquidacion',
    versionado: true,
    entidad: 'Agente',
    documentoEnvio: 'Cuenta de cobro a contraparte',
    workflow: { ...WF_LIQ_CONTRATOS, isFinancialSettlement: true },
    columnas: cols({ concepto: 'Contrato', categoria: 'Modalidad', calc: 'Calculado', ref: 'Liquidado ASIC', regla: 'Regla' }, 'moneda', LIQ_ESTADOS),
    filas: desdeGrid(WF_LIQ_CONTRATOS),
    roles: { ...ADMIN, liq: 'Ejecutor', ger: 'Aprobador', fin: 'Lector' },
    plantillasReporte: [
      { titulo: 'Contratos liquidados', tipo: 'tabla' },
      { titulo: 'Diferencia por contrato', tipo: 'grafico' },
      { titulo: 'Tablero bilateral ASIC', tipo: 'tablero' },
    ],
  },
  {
    id: 'wf-reclamaciones',
    nombre: 'Reclamaciones ASIC',
    codigo: 'LIQ-REC',
    dominio: 'Liquidación',
    descripcion: 'De la diferencia sobre umbral a la reclamación radicada ante el ASIC y su seguimiento.',
    equipoDueno: 'eq-liquidacion',
    versionado: true,
    entidad: 'XM (ASIC)',
    documentoEnvio: 'Reclamación formal',
    workflow: WF_RECLAMACIONES,
    columnas: cols({ concepto: 'Concepto', categoria: 'Unidad', calc: 'Calculado', ref: 'Liquidado XM', regla: 'Soporte' }, 'moneda', ['Borrador', 'En revisión', 'Radicada', 'Ganada', 'Perdida']),
    filas: FILAS_RECLAMACIONES,
    roles: { ...ADMIN, liq: 'Ejecutor', ger: 'Aprobador' },
    plantillasReporte: [
      { titulo: 'Reclamaciones abiertas', tipo: 'tabla' },
      { titulo: 'Valor reclamado por concepto', tipo: 'grafico' },
      { titulo: 'Tablero de objeciones ASIC', tipo: 'tablero' },
    ],
  },
  {
    id: 'wf-garantias',
    nombre: 'Garantías semanales',
    codigo: 'GAR-SEM',
    dominio: 'Garantías',
    descripcion: 'Proyección de la garantía ante el mercado y decisión de provisión.',
    equipoDueno: 'eq-finanzas',
    versionado: false,
    entidad: null,
    workflow: WF_GARANTIAS,
    columnas: cols({ concepto: 'Semana', categoria: 'Componente', calc: 'Proyectada', ref: 'Provisionada', regla: 'Supuesto' }, 'moneda', ['Cubierta', 'Faltante', 'Provisionar']),
    filas: FILAS_GARANTIAS,
    roles: { ...ADMIN, liq: 'Ejecutor', fin: 'Aprobador' },
    plantillasReporte: [
      { titulo: 'Garantía por semana', tipo: 'tabla' },
      { titulo: 'Proyectada frente a provisionada', tipo: 'grafico' },
      { titulo: 'Tablero de cobertura semanal', tipo: 'tablero' },
    ],
  },
  {
    id: 'wf-liq-unr',
    nombre: 'Liquidación de usuarios no regulados',
    codigo: 'FAC-UNR',
    dominio: 'Facturación',
    descripcion: 'Componentes G, T, D, C, P y R por usuario con su medida y su contrato.',
    equipoDueno: 'eq-finanzas',
    versionado: false,
    entidad: null,
    workflow: { ...WF_LIQ_UNR, isFinancialSettlement: false },
    columnas: cols({ concepto: 'Usuario', categoria: 'Segmento', calc: 'Liquidado', ref: 'Mes anterior', regla: 'Regla' }, 'moneda', LIQ_ESTADOS),
    filas: desdeGrid(WF_LIQ_UNR),
    roles: { ...ADMIN, liq: 'Ejecutor', fin: 'Aprobador' },
    plantillasReporte: [
      { titulo: 'Liquidación por usuario', tipo: 'tabla' },
      { titulo: 'Variación por usuario', tipo: 'grafico' },
      { titulo: 'Tablero tarifario UNR', tipo: 'tablero' },
    ],
  },
  {
    id: 'wf-facturacion',
    nombre: 'Facturación mensual',
    codigo: 'FAC-MES',
    dominio: 'Facturación',
    descripcion: 'Prefacturas, factura electrónica, acuse de la DIAN y registro en el ERP.',
    equipoDueno: 'eq-finanzas',
    versionado: false,
    entidad: 'DIAN',
    documentoEnvio: 'Lote de facturas electrónicas',
    workflow: WF_FACTURACION,
    columnas: cols({ concepto: 'Cliente', categoria: 'Concepto', calc: 'Prefactura', ref: 'Mes anterior', regla: 'Contrato' }, 'moneda', ['Lista', 'Revisar', 'Nota crédito']),
    filas: FILAS_FACTURACION,
    roles: { ...ADMIN, fin: 'Aprobador', liq: 'Ejecutor' },
    plantillasReporte: [
      { titulo: 'Lote de prefacturas', tipo: 'tabla' },
      { titulo: 'Variación por cliente', tipo: 'grafico' },
      { titulo: 'Tablero de facturación DIAN', tipo: 'tablero' },
    ],
  },
];

// Enriquecer cada ProcessWorkflow con dominio, equipoDueno y roles del modelo extendido
PROCESOS.forEach(p => {
  p.workflow.dominio = p.dominio;
  p.workflow.equipoDueno = p.equipoDueno;
  p.workflow.roles = Object.entries(p.roles).map(([persona, rol]) => ({ persona, rol }));
  p.workflow.isFinancialSettlement = p.versionado;
});

// ---------- Equipos ----------
export const EQUIPOS: Equipo[] = [
  { id: 'eq-despacho', nombre: 'Despacho y mercado', miembros: ['despacho', 'ger'], procesos: ['wf-despacho-d1'] },
  { id: 'eq-cgm', nombre: 'CGM y medida', miembros: ['cgm', 'enersinc', 'ger'], procesos: ['wf-critica-m2c', 'wf-srm'] },
  { id: 'eq-liquidacion', nombre: 'Liquidación', miembros: ['liq', 'ger'], procesos: ['wf-liq-sombra', 'wf-liq-contratos', 'wf-reclamaciones', 'wf-garantias'] },
  { id: 'eq-finanzas', nombre: 'Finanzas y facturación', miembros: ['fin', 'liq', 'ger'], procesos: ['wf-garantias', 'wf-liq-unr', 'wf-facturacion'] },
  { id: 'eq-admin', nombre: 'Administración', miembros: ['admin_cliente', 'enersinc'], procesos: PROCESOS.map(p => p.id) },
];

// ---------- Permisos ----------
export function rolDe(perfilId: string, p: ProcesoDef): RolProceso {
  return p.roles[perfilId] ?? 'Lector';
}
export function procesosVisibles(perfilId: string): ProcesoDef[] {
  const ids = new Set(EQUIPOS.filter(e => e.miembros.includes(perfilId)).flatMap(e => e.procesos));
  return PROCESOS.filter(p => ids.has(p.id));
}
export function permisos(rol: RolProceso) {
  return {
    ejecutar: rol === 'Dueño' || rol === 'Ejecutor',
    editar: rol === 'Dueño' || rol === 'Ejecutor',
    aprobar: rol === 'Dueño' || rol === 'Aprobador',
    configurar: rol === 'Dueño',
  };
}
export const procesoPorId = (id: string) => PROCESOS.find(p => p.id === id);
