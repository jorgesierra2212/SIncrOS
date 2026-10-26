import { Layer, PluginManifest, SkillFicha, TaskItem, SupportTicket, Conector, ArchivoItem, BrandConfig, ExecutionTrace, MarketDateState } from '../types';

// ---------- Agentes del Sistema ----------
export interface Agent {
  id: string;
  name: string;
  process: string;
  level: 0 | 1 | 2 | 3;
  match: number | null;
  schedule: string;
  team: string;
  status: 'Activo' | 'Piloto' | 'En diseño';
  lastRun: string;
  hoursSaved: number;
  capa: Layer;
  skillsCount: number;
}

export const AGENTS: Agent[] = [
  {
    id: 'aud-liq',
    name: 'Auditor de liquidación',
    process: 'Revisión sombra de TX1, TX2, TXR y TXF contra cálculo propio y formulación CREG',
    level: 2,
    match: 99.2,
    schedule: 'Cada publicación de XM',
    team: 'Liquidación',
    status: 'Activo',
    lastRun: 'Hoy 07:31',
    hoursSaved: 64,
    capa: 'nucleo',
    skillsCount: 6,
  },
  {
    id: 'critica',
    name: 'Crítica de medida',
    process: 'Validación de curvas horarias, faltantes, desfases y estimaciones de respaldo',
    level: 2,
    match: 98.6,
    schedule: 'Diario 05:00 COT',
    team: 'CGM',
    status: 'Activo',
    lastRun: 'Hoy 05:04',
    hoursSaved: 92,
    capa: 'nucleo',
    skillsCount: 3,
  },
  {
    id: 'srm',
    name: 'Reporte SRM',
    process: 'Generación, validación de formato y transmisión de lecturas al SRM de XM',
    level: 2,
    match: 99.8,
    schedule: 'Diario 08:00 COT',
    team: 'CGM',
    status: 'Activo',
    lastRun: 'Hoy 08:02',
    hoursSaved: 38,
    capa: 'nucleo',
    skillsCount: 2,
  },
  {
    id: 'despacho-ag',
    name: 'Agente de despacho y ofertas',
    process: 'Construcción de curvas de oferta diaria, comparación programado vs real y redespacho',
    level: 1,
    match: 98.4,
    schedule: 'Diario 06:00 y cada hora',
    team: 'Despacho',
    status: 'Activo',
    lastRun: 'Hoy 06:01',
    hoursSaved: 45,
    capa: 'enersinc_cliente',
    skillsCount: 4,
  },
  {
    id: 'garantias',
    name: 'Proyección de garantías',
    process: 'Proyección semanal de obligaciones financieras y comparación con el cálculo del ASIC',
    level: 1,
    match: 97.1,
    schedule: 'Lunes 07:00 COT',
    team: 'Liquidación',
    status: 'Activo',
    lastRun: 'Lun 07:02',
    hoursSaved: 12,
    capa: 'enersinc_cliente',
    skillsCount: 1,
  },
  {
    id: 'contratos',
    name: 'Contratos de largo plazo',
    process: 'Registro, validación de condiciones de despacho y reporte al ASIC',
    level: 1,
    match: 99.5,
    schedule: 'Diario 06:30 COT',
    team: 'Liquidación',
    status: 'Activo',
    lastRun: 'Hoy 06:31',
    hoursSaved: 20,
    capa: 'enersinc_cliente',
    skillsCount: 2,
  },
  {
    id: 'facturacion',
    name: 'Cargos y facturación',
    process: 'Cálculo de componentes CU, matriz de consumos, prefacturas y sincronización ERP',
    level: 2,
    match: 98.9,
    schedule: 'Día 5 hábil',
    team: 'Finanzas',
    status: 'Activo',
    lastRun: '05-oct',
    hoursSaved: 26,
    capa: 'enersinc_cliente',
    skillsCount: 6,
  },
  {
    id: 'mesa',
    name: 'Mesa de ayuda de medida',
    process: 'Clasificación y respuesta automática de tickets sobre problemas de telemetría',
    level: 3,
    match: null,
    schedule: 'Continuo',
    team: 'CGM',
    status: 'Activo',
    lastRun: 'Hace 4 min',
    hoursSaved: 110,
    capa: 'nucleo',
    skillsCount: 1,
  },
  {
    id: 'cobertura',
    name: 'Cobertura y SICEP',
    process: 'Propuesta de contratación bilateral y evaluación de convocatorias en SICEP',
    level: 0,
    match: null,
    schedule: 'Por convocatoria',
    team: 'Mercado',
    status: 'En diseño',
    lastRun: '—',
    hoursSaved: 0,
    capa: 'cliente',
    skillsCount: 1,
  },
  {
    id: 'supervisor',
    name: 'Supervisión de plantas',
    process: 'Monitoreo de generación real frente a disponibilidad declarada y despacho',
    level: 0,
    match: null,
    schedule: 'Cada 5 min',
    team: 'Operación',
    status: 'Piloto',
    lastRun: 'Hace 2 min',
    hoursSaved: 0,
    capa: 'nucleo',
    skillsCount: 1,
  },
];

export const LEVELS = [
  { n: 0, label: 'Manual asistido', desc: 'La persona ejecuta; el agente sugiere cálculos y datos.' },
  { n: 1, label: 'Propone', desc: 'El agente prepara todo el expediente; la persona ejecuta.' },
  { n: 2, label: 'Ejecuta y pide aprobación', desc: 'El agente ejecuta en borrador; nada sale sin aprobación humana.' },
  { n: 3, label: 'Ejecuta y reporta', desc: 'Ejecución autónoma solo para tareas con evaluación estable y sin impacto financiero directo.' },
];

// ---------- Procesos Comerciales ----------
export const PROCESSES = [
  { name: 'Revisión de liquidación TX1', freq: 'Diaria', owner: 'Liquidación', agent: 'Auditor de liquidación', auto: 85, capa: 'nucleo' as Layer },
  { name: 'Revisión de liquidación TX2', freq: 'Diaria', owner: 'Liquidación', agent: 'Auditor de liquidación', auto: 85, capa: 'nucleo' as Layer },
  { name: 'Preparación de oferta horaria de generación', freq: 'Diaria', owner: 'Despacho', agent: 'Agente de despacho y ofertas', auto: 75, capa: 'enersinc_cliente' as Layer },
  { name: 'Seguimiento de despacho programado vs real', freq: 'Horaria', owner: 'Despacho', agent: 'Agente de despacho y ofertas', auto: 80, capa: 'enersinc_cliente' as Layer },
  { name: 'Revisión de reporte de contratos de largo plazo', freq: 'Diaria', owner: 'Liquidación', agent: 'Contratos de largo plazo', auto: 70, capa: 'enersinc_cliente' as Layer },
  { name: 'Análisis de la telemedida de generación', freq: 'Diaria', owner: 'CGM', agent: 'Crítica de medida', auto: 80, capa: 'nucleo' as Layer },
  { name: 'Análisis de la telemedida de usuarios', freq: 'Diaria', owner: 'CGM', agent: 'Crítica de medida', auto: 80, capa: 'nucleo' as Layer },
  { name: 'Proyección y publicación de garantías semanales', freq: 'Semanal', owner: 'Liquidación', agent: 'Proyección de garantías', auto: 60, capa: 'enersinc_cliente' as Layer },
  { name: 'Revisión de cargos y prefacturación', freq: 'Mensual', owner: 'Finanzas', agent: 'Cargos y facturación', auto: 65, capa: 'enersinc_cliente' as Layer },
  { name: 'Auditoría tripartita AENC', freq: 'Mensual', owner: 'CGM', agent: 'Auditor AENC certificado', auto: 90, capa: 'enersinc_cliente' as Layer },
  { name: 'Revisión de liquidación TXR y TXF', freq: 'Mensual', owner: 'Liquidación', agent: 'Auditor de liquidación', auto: 75, capa: 'nucleo' as Layer },
  { name: 'Análisis de matriz de consumos regulados/no regulados', freq: 'Mensual', owner: 'Finanzas', agent: 'Cargos y facturación', auto: 55, capa: 'enersinc_cliente' as Layer },
  { name: 'Análisis de convocatorias SICEP', freq: 'Por convocatoria', owner: 'Mercado', agent: 'Cobertura y SICEP', auto: 15, capa: 'cliente' as Layer },
];

export const CYCLE = [
  { step: '1. Medida y CGM', what: 'Fronteras, medidores y telemetría desde cualquier MDM', control: 'Crítica diaria, comunicaciones y reporte SRM a XM' },
  { step: '2. Despacho y Operación', what: 'Ofertas diarias, disponibilidad IDO y redespachos CND', control: 'Seguimiento horario y alerta de desbalance con costo' },
  { step: '3. Contratos y Mercado', what: 'Registro de bilaterales, compras spot y SICEP', control: 'Posición neta horaria y valoración MtM contra curva' },
  { step: '4. Liquidación Sombra', what: 'Transacciones, restricciones, reconciliación y confiabilidad', control: 'Cálculo paralelo contra versiones XM (TX1–TXF)' },
  { step: '5. Garantías', what: 'Obligaciones proyectadas a 6 semanas ante el ASIC', control: 'Provisión anticipada y alerta de brecha de liquidez' },
  { step: '6. Facturación y ERP', what: 'Factura electrónica DIAN y hecho económico al ERP', control: 'CUFE, validación previa, NIIF y conciliación contable' },
];
