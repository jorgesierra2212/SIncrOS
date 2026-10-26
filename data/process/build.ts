import type { ProcessWorkflow, WorkflowNodeData, NodeStatus } from '../workflowModels';

export type TipoPaso = 'Agente' | 'Humano' | 'Automático';

export interface PasoSimple {
  label: string;
  tipo: TipoPaso;
  executor: string;
  desc: string;
  status: NodeStatus;
  duration?: string;
  logs?: string[];
  metrics?: { label: string; value: string }[];
  rule?: string;
  notice?: string;
}

const CATEGORIA: Record<TipoPaso, WorkflowNodeData['category']> = {
  Agente: 'agente',
  Humano: 'aprobacion',
  Automático: 'transmision',
};
const AUTONOMIA: Record<TipoPaso, WorkflowNodeData['autonomia']> = {
  Agente: 'Nivel 2 (Supervisión IA)',
  Humano: 'Nivel 0 (Firma Obligatoria)',
  Automático: 'Nivel 3 (Autónomo)',
};

/** Arma un ProcessWorkflow lineal a partir de una lista de pasos. */
export function buildWorkflow(
  base: Omit<ProcessWorkflow, 'nodes' | 'edges' | 'airtableData'>,
  pasos: PasoSimple[]
): ProcessWorkflow {
  const nodes = pasos.map((p, i) => ({
    id: `node-${i + 1}`,
    position: { x: 40 + i * 280, y: 100 },
    data: {
      stepNumber: i + 1,
      label: p.label,
      category: i === 0 && p.tipo === 'Automático' ? 'ingesta' : CATEGORIA[p.tipo],
      status: p.status,
      duration: p.duration,
      executor: p.executor,
      autonomia: AUTONOMIA[p.tipo],
      shortDesc: p.desc,
      ruleCode: p.rule,
      logs: p.logs ?? [`Paso ${i + 1} · ${p.label}: ${p.status === 'completed' ? 'completado' : p.status === 'action_required' ? 'esperando acción humana' : 'pendiente'}.`],
      outputMetrics: p.metrics,
      actionRequiredNotice: p.notice,
      canInterveneManually: p.tipo !== 'Automático',
    } as WorkflowNodeData,
  }));
  const edges = nodes.slice(1).map((n, i) => ({
    id: `e-${i + 1}-${i + 2}`,
    source: nodes[i].id,
    target: n.id,
    animated: pasos[i + 1].status === 'running' || pasos[i + 1].status === 'action_required',
  }));
  return { ...base, nodes, edges, airtableData: [] };
}
