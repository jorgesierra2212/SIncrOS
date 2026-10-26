export type Layer = 'nucleo' | 'enersinc_cliente' | 'cliente';

export const LAYER_INFO: Record<Layer, { label: string; pct: string; desc: string; tone: 'brand' | 'purple' | 'emerald'; colorClass: string; badgeClass: string }> = {
  nucleo: {
    label: 'Núcleo Enersinc',
    pct: '50%',
    desc: 'Plataforma marca blanca, auditor, shell, motor de reglas y conectores base.',
    tone: 'brand',
    colorClass: 'text-[#2459D6]',
    badgeClass: 'bg-[#17294A] text-[#9DB4EE] border border-[#2459D6]/30',
  },
  enersinc_cliente: {
    label: 'Capa Enersinc',
    pct: '25%',
    desc: 'Personalizaciones construidas por Enersinc para el cliente (reglas contractuales, reportes certificados).',
    tone: 'purple',
    colorClass: 'text-[#8B5CF6]',
    badgeClass: 'bg-[#2E1A47] text-[#D8B4FE] border border-[#8B5CF6]/30',
  },
  cliente: {
    label: 'Capa Cliente',
    pct: '25%',
    desc: 'Desarrollado y operado por el cliente (plugins propios, vistas guardadas, artefactos). Pasa por ciclo de pruebas.',
    tone: 'emerald',
    colorClass: 'text-[#10B981]',
    badgeClass: 'bg-[#0E3A2F] text-[#6EE7B7] border border-[#10B981]/30',
  },
};

export interface TestCase {
  id: string;
  nombre: string;
  entrada: string;
  salidaEsperada: string;
  pasa: boolean;
  error?: string;
}

export interface PluginManifest {
  id: string;
  nombre: string;
  version: string;
  capa: Layer;
  autor: string;
  descripcion: string;
  entradas: string[];
  salidas: string[];
  permisos: {
    lectura: string[];
    escritura: string[];
  };
  herramientas: string[];
  instrucciones: string;
  casosDePrueba: TestCase[];
  estado: 'Borrador' | 'Sandbox' | 'Pruebas' | 'Revisión' | 'Producción' | 'Retirado';
  historicoVersiones?: { version: string; fecha: string; autor: string; motivo: string }[];
  testMetrics?: {
    casosAprobadosPct: number;
    coincidenciaReferenciaPct: number;
    permisosValidos: boolean;
    sinDatosSensibles: boolean;
  };
}

export interface SkillFicha {
  id: string;
  modulo: 'Despacho' | 'Liquidación' | 'Facturación' | 'CGM';
  nombre: string;
  objetivo: string;
  entradas: string[];
  salidas: string[];
  reglaAplicada: string;
  nivelAutonomia: 0 | 1 | 2 | 3;
  evaluacion: string;
  capa: Layer;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  fecha: string;
  duracion: string;
  resultado: 'Exitoso' | 'Fallo' | 'Advertencia';
  trayectoria: string[];
  aprobacionId?: string;
  ticketId?: string;
}

export interface TaskItem {
  id: string;
  name: string;
  skillOrPlugin: string;
  agent: string;
  when: string;
  next: string;
  last: string;
  team: string;
  autonomia: 0 | 1 | 2 | 3;
  responsable: string;
  capa: Layer;
  executions: TaskExecution[];
}

export interface SupportTicket {
  id: string;
  titulo: string;
  origenTarea: string;
  fecha: string;
  estado: 'Abierto' | 'Escalado a Enersinc' | 'Asignado a Respaldo Manual' | 'Resuelto';
  prioridad: 'Alta' | 'Media' | 'Baja';
  asignadoA: string;
  log: string;
  procedimientoManual: string;
  tareaId?: string;
}

export interface Conector {
  id: string;
  name: string;
  categoria: 'XM' | 'BigQuery' | 'ERP' | 'MDM / Medida' | 'SCADA' | 'Factura electrónica';
  state: 'Conectado' | 'Alerta' | 'Inactivo' | 'Piloto';
  detail: string;
  ultimaSinc: string;
  frecuencia: string;
  mapeoCampos: { origen: string; destino: string }[];
  logs: { fecha: string; evento: string; estado: 'ok' | 'alerta' | 'error' }[];
  config?: {
    endpoint?: string;
    authType?: string;
    dataset?: string;
  };
}

export interface ArchivoItem {
  id: string;
  nombre: string;
  tipo: 'excel' | 'pdf' | 'powerpoint';
  tamano: string;
  fecha: string;
  origen: 'Cargado por usuario' | 'Generado por tarea' | 'Reporte exportado';
  tareaAsociada?: string;
  detalles?: {
    hojas?: string[];
    paginas?: number;
    diapositivas?: number;
    filas?: number;
    previewData?: Record<string, any>[];
  };
}

export interface BrandConfig {
  nombreProducto: string;
  logoUrl?: string;
  logoIcon: 'E' | '⚡' | '☀️' | '🔋';
  colorPrimario: string;
  colorSecundario: string;
  tipografia: 'IBM Plex Sans' | 'Inter' | 'Roboto' | 'System';
  presetId: 'enersinc' | 'cliente_demo';
}

export type RegulatoryVersion = 'TX1' | 'TX2' | 'TX3' | 'TXR' | 'TXF';

export interface MarketDateState {
  date: string; // YYYY-MM-DD
  formatted: string; // "26 de Octubre de 2026"
  shortFormatted: string; // "26-Oct-2026"
  dayOfWeek: string; // "Lunes"
  periodMonth: string; // "Octubre 2026"
  cycleVersion: RegulatoryVersion;
  horizonName: string; // "Operación D (Tiempo real)" | "Despacho D-1" | "Liquidación D+12 (TX2)"
  deadlineNotice: string;
  hoursRemaining: number;
}

export interface TraceInputFile {
  name: string;
  source: string;
  records: string;
  sha256: string;
  previewRows?: Record<string, any>[];
}

export interface TraceComparisonRow {
  concept: string;
  calculatedValue: string;
  xmOfficialValue: string;
  diffText: string;
  diffAmount: number;
  threshold: string;
  verdict: 'Reclamable' | 'Conforme' | 'Alerta';
}

export interface TraceMicroStep {
  time: string;
  phase: string;
  detail: string;
  evidence: string;
  status: 'ok' | 'alerta' | 'info';
}

export interface ExecutionTrace {
  id: string; // "TRC-1042"
  approvalId: string; // "A-1042"
  agentName: string;
  agentLevel: 0 | 1 | 2 | 3;
  modelEngine: string; // "Modelo configurado + Motor Enersinc v3.2"
  timestamp: string;
  title: string;
  role: string;
  capa: Layer;
  inputs: TraceInputFile[];
  rule: {
    code: string;
    version: string;
    formulaName: string;
    mathExpression: string;
    variables: { symbol: string; meaning: string; appliedValue: string }[];
    thresholdNotice: string;
  };
  comparison: TraceComparisonRow[];
  steps: TraceMicroStep[];
  manualBackup: {
    canEdit: boolean;
    modified: boolean;
    modifiedBy?: string;
    modifiedAt?: string;
    originalValue?: string;
    newValue?: string;
    justification?: string;
  };
}

