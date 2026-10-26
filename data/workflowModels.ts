import { GridRow } from '../components/AirtableGrid';
import type { RegulatoryVersion } from './types';
import type { Dominio, Envio, Reporte, RolProceso } from './process/types';
import { WF_CRITICA_M2C } from './process/workflows/wf-critica-m2c';
import { WF_LIQ_SOMBRA } from './process/workflows/wf-liq-sombra';
import { WF_LIQ_CONTRATOS } from './process/workflows/wf-liq-contratos';
import { WF_LIQ_UNR } from './process/workflows/wf-liq-unr';
import { WF_DESPACHO_D1 } from './process/workflows/wf-despacho-d1';
import { WF_SRM, WF_FACTURACION, WF_GARANTIAS, WF_RECLAMACIONES } from './process/workflows/nuevos';

export type ProcessHorizon = 'D-1' | 'D' | 'D+1' | 'D+2' | 'D+7';

export type NodeStatus = 'completed' | 'running' | 'pending' | 'action_required' | 'failed';

export interface WorkflowNodeData {
  stepNumber: number;
  label: string;
  category: 'ingesta' | 'agente' | 'regla' | 'paralelo' | 'aprobacion' | 'transmision';
  status: NodeStatus;
  duration?: string;
  executor: string;
  autonomia: 'Nivel 0 (Firma Obligatoria)' | 'Nivel 1 (Revisión Regular)' | 'Nivel 2 (Supervisión IA)' | 'Nivel 3 (Autónomo)';
  shortDesc: string;
  ruleCode?: string;
  inputs?: { name: string; source: string; records: string; sha256: string }[];
  logs?: string[];
  outputMetrics?: { label: string; value: string }[];
  actionRequiredNotice?: string;
  canInterveneManually?: boolean;
  manualOverrideActive?: boolean;
  manualValue?: string;
  manualJustification?: string;
}

export interface ProcessWorkflow {
  id: string;
  title: string;
  shortCode: string;
  horizon: ProcessHorizon;
  horizonLabel: string;
  officialDeadline: string;
  category: 'Liquidación' | 'Medida y CGM' | 'Despacho' | 'Garantías y Facturación';
  dominio?: Dominio;
  equipoDueno?: string;
  roles?: { persona: string; rol: RolProceso }[];
  ejecuciones?: {
    id: string;
    fecha: string;
    version?: RegulatoryVersion;
    estadoPorNodo: Record<string, NodeStatus>;
    iniciadaPor: string;
  }[];
  envios?: Envio[];
  reportes?: Reporte[];
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'action_required';
  pendingBadge?: boolean;
  pendingNotice?: string;
  reglaPrincipal: string;
  versionCiclo: string;
  isFinancialSettlement?: boolean; // true = liquidación con versiones TX1..TXF; false = temas energéticos sin versiones
  entityDestination?: 'XM (ASIC)' | 'XM (CND)' | 'DIAN' | 'Contraparte Agente';
  transmissionStatus?: {
    status: 'radicado' | 'pendiente' | 'en_transito' | 'rechazado';
    radicadoNumber: string;
    timestamp: string;
    hash: string;
    protocol: string;
  };
  liveArtifactId?: string;
  historicalReports?: {
    id: string;
    title: string;
    date: string;
    version?: string;
    generatedBy: string;
    status: string;
    size: string;
    type: 'pdf' | 'xlsx' | 'xml' | 'pptx';
  }[];
  quickQuestions?: string[];
  summaryKpis: { label: string; value: string; tone?: 'ok' | 'warn' | 'bad' }[];
  nodes: {
    id: string;
    position: { x: number; y: number };
    data: WorkflowNodeData;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
    label?: string;
  }[];
  airtableData: GridRow[];
}

export const MEM_TIMELINE_STAGES = [
  {
    id: 'D-1',
    label: 'D-1 Planificación',
    timeLabel: '08:00 COT',
    title: 'Declaración de Ofertas y Disponibilidad CND',
    desc: 'Precio de oferta horario por planta y declaración IDO ante XM.',
    deadline: '08:00 COT (Corte inamovible)',
    hasPending: false,
    processId: 'wf-despacho-d1',
  },
  {
    id: 'D',
    label: 'D Operación',
    timeLabel: '24 Horas',
    title: 'Despacho Real, AGC y Redespacho',
    desc: 'Seguimiento horario de generación contra despacho ideal y restricciones de red.',
    deadline: 'Monitoreo continuo 24h',
    hasPending: false,
    processId: 'wf-despacho-d1',
  },
  {
    id: 'D+1_critica',
    label: 'D+1 Crítica Medida',
    timeLabel: '05:00 COT',
    title: 'Crítica de Telemedida MDM y Estimación CREG 038',
    desc: 'Ingesta de 1.284 fronteras comerciales, detección de anomalías y estimación oficial.',
    deadline: '08:00 COT (Corte de revisión)',
    hasPending: true,
    processId: 'wf-critica-m2c',
  },
  {
    id: 'D+1_srm',
    label: 'D+1 Transmisión SRM',
    timeLabel: '10:00 COT',
    title: 'Radicación de Archivos al SRM de XM',
    desc: 'Generación, firma criptográfica y transmisión oficial al Sistema de Medida de XM.',
    deadline: '10:00 COT (Vencimiento regulatorio)',
    hasPending: true,
    processId: 'wf-srm',
  },
  {
    id: 'D+2_liq',
    label: 'D+2 Liquidación Sombra',
    timeLabel: 'TX1 / TX2',
    title: 'Liquidación Sombra XM & Contratos CREG 130',
    desc: 'Cálculo paralelo de Bolsa, Restricciones CREG 024, Contratos y Tarifa UNR vs XM.',
    deadline: 'Plazo de objeción: 3 días hábiles',
    hasPending: true,
    processId: 'wf-liq-sombra',
  },
  {
    id: 'D+7_garantias',
    label: 'D+7 Garantías & ERP',
    timeLabel: 'Semanal / Mensual',
    title: 'Garantías Financieras, Prefacturas y DIAN',
    desc: 'Obligaciones ante XM, cobertura semanal y emisión de facturas electrónicas.',
    deadline: 'Miércoles 17:00 COT',
    hasPending: false,
    processId: 'wf-garantias',
  },
];

export const WORKFLOWS_REGISTRY: Record<string, ProcessWorkflow> = {
  'wf-despacho-d1': WF_DESPACHO_D1,
  'wf-critica-m2c': WF_CRITICA_M2C,
  'wf-srm': WF_SRM,
  'wf-liq-sombra': WF_LIQ_SOMBRA,
  'wf-liq-contratos': WF_LIQ_CONTRATOS,
  'wf-reclamaciones': WF_RECLAMACIONES,
  'wf-garantias': WF_GARANTIAS,
  'wf-liq-unr': WF_LIQ_UNR,
  'wf-facturacion': WF_FACTURACION,
};
