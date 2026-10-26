import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from '@xyflow/react';
import {
  Play, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight, Bot, UserCheck, Cog, XCircle,
  Sliders, Plus, Trash2, X, Check
} from 'lucide-react';
import CustomFlowNode, { tipoNodoLabel } from './CustomFlowNode';
import ExecutionInspectorModal from '../ExecutionInspectorModal';
import { ProcessWorkflow, WorkflowNodeData, NodeCategory } from '../../data/workflowModels';
import type { ExecutionTrace } from '../../data/types';
import { useApp } from '../context';

interface ProcessFlowDAGProps {
  workflow: ProcessWorkflow;
  onSelectAirtable?: () => void;
  embedded?: boolean;
  canExecute?: boolean;
  canApprove?: boolean;
  actor?: string;
  onApproved?: (stepNumber: number, label: string) => void;
}

const nodeTypes = {
  custom: CustomFlowNode,
};

export default function ProcessFlowDAG({
  workflow,
  canExecute = true,
  canApprove = true,
  actor = 'Operador Responsable',
  onApproved,
}: ProcessFlowDAGProps) {
  const { addAudit } = useApp();

  const initialNodes: Node[] = useMemo(() => {
    return workflow.nodes.map((n, idx) => ({
      id: n.id,
      type: 'custom',
      position: { x: 30 + idx * 285, y: 80 },
      data: n.data as any,
    }));
  }, [workflow]);

  const initialEdges: Edge[] = useMemo(() => {
    return workflow.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: e.animated ?? true,
      label: e.label,
      style: { stroke: '#64748B', strokeWidth: 2 },
      type: ConnectionLineType.SmoothStep,
    }));
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Estado para el modal de Modo Edición (React Flow)
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [workflow.id, initialNodes, initialEdges, setNodes, setEdges]);

  const selectedNode = useMemo(() => {
    const n = nodes.find(item => item.id === selectedNodeId);
    return n ? ((n.data as any) as WorkflowNodeData) : null;
  }, [nodes, selectedNodeId]);

  const editingNode = useMemo(() => {
    const id = editingNodeId ?? nodes[0]?.id ?? null;
    const n = nodes.find(item => item.id === id);
    return n ? { id: n.id, data: (n.data as any) as WorkflowNodeData } : null;
  }, [nodes, editingNodeId]);

  const onEditorNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setEditingNodeId(node.id);
  }, []);

  const handleUpdateEditingNode = (patch: Partial<WorkflowNodeData>) => {
    if (!editingNode) return;
    setNodes(nds =>
      nds.map(n =>
        n.id === editingNode.id
          ? { ...n, data: { ...(n.data as any), ...patch } }
          : n
      )
    );
  };

  const handleAddNodeInEditor = () => {
    const nextStep = nodes.length + 1;
    const newId = `${workflow.shortCode}-step-${Date.now() % 10000}`;
    const prevNode = nodes[nodes.length - 1];
    const newNode: Node = {
      id: newId,
      type: 'custom',
      position: { x: 30 + (nextStep - 1) * 285, y: 80 },
      data: {
        stepNumber: nextStep,
        label: `Nuevo paso #${nextStep}`,
        category: 'calculo' as NodeCategory,
        status: 'pending',
        executor: workflow.agentName,
        shortDesc: 'Validación o cálculo adicional configurado en el editor de flujo.',
        ruleCode: workflow.reglaPrincipal,
      } satisfies WorkflowNodeData as any,
    };
    setNodes(nds => [...nds, newNode]);
    if (prevNode) {
      setEdges(eds => [
        ...eds,
        {
          id: `e-${prevNode.id}-${newId}`,
          source: prevNode.id,
          target: newId,
          animated: true,
          style: { stroke: '#64748B', strokeWidth: 2 },
          type: ConnectionLineType.SmoothStep,
        },
      ]);
    }
    setEditingNodeId(newId);
    addAudit(actor, `Agregó paso "${newNode.data.label}" en modo edición de ${workflow.shortCode}`, 'v1', 'cliente');
  };

  const handleDeleteNodeInEditor = (id: string) => {
    if (nodes.length <= 1) return;
    setNodes(nds =>
      nds
        .filter(n => n.id !== id)
        .map((n, idx) => ({
          ...n,
          data: { ...(n.data as any), stepNumber: idx + 1 },
        }))
    );
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    setEditingNodeId(null);
    addAudit(actor, `Eliminó nodo ${id} en modo edición de ${workflow.shortCode}`, 'v1', 'cliente');
  };

  const handleExecuteOnDemand = () => {
    setIsExecuting(true);
    setNodes(nds =>
      nds.map((n, idx) => ({
        ...n,
        data: {
          ...(n.data as any),
          status: idx === 0 ? 'running' : 'pending',
          duration: undefined,
        },
      }))
    );

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < nodes.length) {
        setNodes(nds =>
          nds.map((n, idx) => {
            const data = (n.data as any) as WorkflowNodeData;
            if (idx < currentStep) {
              return {
                ...n,
                data: { ...data, status: 'completed', duration: `${(0.8 + idx * 0.4).toFixed(1)}s` },
              };
            }
            if (idx === currentStep) {
              const isActionRequired = data.category === 'aprobacion';
              return {
                ...n,
                data: {
                  ...data,
                  status: isActionRequired ? 'action_required' : 'running',
                  duration: isActionRequired ? undefined : '0.9s',
                },
              };
            }
            return n;
          })
        );
      } else {
        clearInterval(interval);
        setIsExecuting(false);
        addAudit(actor, `Ejecución por demanda del flujo ${workflow.title}`, 'v1', 'nucleo');
      }
    }, 600);
  };

  const nodeTrace: ExecutionTrace | null = useMemo(() => {
    if (!selectedNode) return null;
    const tipo = tipoNodoLabel(selectedNode.category);
    return {
      id: `TRC-${workflow.shortCode}-P${selectedNode.stepNumber}`,
      approvalId: `${workflow.shortCode} · Paso #${selectedNode.stepNumber}`,
      agentName: `${selectedNode.executor} (${tipo})`,
      agentLevel: tipo === 'Humano' ? 0 : tipo === 'Agente' ? 2 : 3,
      modelEngine: 'Modelo configurado + Motor Enersinc OS',
      timestamp: 'Hoy · Ejecución activa',
      title: `Paso #${selectedNode.stepNumber}: ${selectedNode.label}`,
      role: selectedNode.executor,
      capa: 'nucleo',
      inputs:
        selectedNode.inputs && selectedNode.inputs.length > 0
          ? selectedNode.inputs
          : [
              {
                name: `${workflow.shortCode}_Paso_${selectedNode.stepNumber}_Input.json`,
                source: workflow.agentName,
                records: 'Registros validados del paso anterior',
                sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              },
            ],
      rule: {
        code: selectedNode.ruleCode || workflow.reglaPrincipal,
        version: workflow.versionCiclo,
        formulaName: selectedNode.label,
        mathExpression: `${selectedNode.shortDesc}`,
        variables: (selectedNode.outputMetrics || [{ label: 'Responsable', value: selectedNode.executor }]).map(m => ({
          symbol: m.label,
          meaning: `Métrica del paso #${selectedNode.stepNumber}`,
          appliedValue: m.value,
        })),
        thresholdNotice: selectedNode.actionRequiredNotice || selectedNode.shortDesc,
      },
      comparison: (selectedNode.outputMetrics || [{ label: selectedNode.label, value: selectedNode.status === 'completed' ? 'Completado' : 'En revisión' }]).map(m => ({
        concept: m.label,
        calculatedValue: m.value,
        xmOfficialValue: 'Referencia proceso',
        diffText: selectedNode.manualOverrideActive ? `Hecho a mano: ${selectedNode.manualValue}` : '0',
        diffAmount: 0,
        threshold: 'Regla CREG',
        verdict: selectedNode.status === 'action_required' ? 'Alerta' : 'Conforme',
      })),
      steps: (selectedNode.logs || [`Paso #${selectedNode.stepNumber}: ${selectedNode.shortDesc}`]).map((line, i) => ({
        time: `08:0${i}:10`,
        phase: tipo,
        detail: line,
        evidence: `Responsable: ${selectedNode.executor}`,
        status: selectedNode.status === 'action_required' ? 'alerta' : 'ok',
      })),
      manualBackup: {
        canEdit: true,
        modified: Boolean(selectedNode.manualOverrideActive),
        modifiedBy: actor,
        modifiedAt: 'Hoy',
        originalValue: 'Calculado por el agente',
        newValue: selectedNode.manualValue,
        justification: selectedNode.manualJustification,
      },
    };
  }, [selectedNode, workflow, actor]);

  const handleExecuteSingleStep = () => {
    if (!selectedNodeId || !selectedNode) return;
    setNodes(nds =>
      nds.map(n =>
        n.id === selectedNodeId
          ? {
              ...n,
              data: {
                ...(n.data as any),
                status: 'completed',
                duration: '1,2s',
                logs: [
                  ...(((n.data as any).logs as string[]) || []),
                  `[${new Date().toLocaleTimeString('es-CO')}] Paso ejecutado por ${actor}.`,
                ],
              },
            }
          : n
      )
    );
    addAudit(actor, `Ejecutó el paso #${selectedNode.stepNumber} (${selectedNode.label}) en ${workflow.shortCode}`, 'v1', 'nucleo');
  };

  const handleApproveSingleStep = () => {
    if (!selectedNodeId || !selectedNode) return;
    setNodes(nds =>
      nds.map(n =>
        n.id === selectedNodeId
          ? {
              ...n,
              data: {
                ...(n.data as any),
                status: 'completed',
                logs: [
                  ...(((n.data as any).logs as string[]) || []),
                  `[${new Date().toLocaleTimeString('es-CO')}] Aprobado por ${actor}.`,
                ],
              },
            }
          : n
      )
    );
    addAudit(actor, `Aprobó el paso #${selectedNode.stepNumber} (${selectedNode.label}) en ${workflow.shortCode}`, 'v1', 'nucleo');
    onApproved?.(selectedNode.stepNumber, selectedNode.label);
  };

  const handleReturnSingleStep = (comment: string) => {
    if (!selectedNodeId || !selectedNode) return;
    setNodes(nds =>
      nds.map(n =>
        n.id === selectedNodeId
          ? {
              ...n,
              data: {
                ...(n.data as any),
                status: 'action_required',
                actionRequiredNotice: `Devuelto por ${actor}: ${comment}`,
                logs: [
                  ...(((n.data as any).logs as string[]) || []),
                  `[${new Date().toLocaleTimeString('es-CO')}] Devuelto por ${actor}: "${comment}"`,
                ],
              },
            }
          : n
      )
    );
    addAudit(actor, `Devolvió el paso #${selectedNode.stepNumber} (${selectedNode.label}) en ${workflow.shortCode}: "${comment}"`, 'v1', 'cliente');
  };

  const handleManualSingleStep = (value: string, justification: string) => {
    if (!selectedNodeId || !selectedNode) return;
    setNodes(nds =>
      nds.map(n =>
        n.id === selectedNodeId
          ? {
              ...n,
              data: {
                ...(n.data as any),
                status: 'completed',
                manualOverrideActive: true,
                manualValue: value,
                manualJustification: justification,
                logs: [
                  ...(((n.data as any).logs as string[]) || []),
                  `[${new Date().toLocaleTimeString('es-CO')}] HECHO A MANO por ${actor}: ${value} (${justification})`,
                ],
              },
            }
          : n
      )
    );
    addAudit(actor, `Hizo a mano el paso #${selectedNode.stepNumber} (${selectedNode.label}) en ${workflow.shortCode}: ${value} · Motivo: ${justification}`, 'v1', 'cliente');
  };

  return (
    <div className="bg-white border border-line rounded-xl shadow-2xs overflow-hidden mb-4">
      {/* Barra superior de resumen del flujo */}
      <div className="px-4 py-3 border-b border-line bg-paper/40 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-mut flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Agente del proceso: <b className="text-txt">{workflow.agentName}</b></span>
          <span>·</span>
          <span>Regla: <b className="text-txt">{workflow.reglaPrincipal}</b></span>
          <span>·</span>
          <span className="text-warn font-medium">Corte oficial: {workflow.officialDeadline}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEditorModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-line bg-white hover:border-brand hover:text-brand transition-colors"
          >
            <Sliders size={13} />
            <span>Editar flujo (React Flow)</span>
          </button>

          {canExecute && (
            <button
              onClick={handleExecuteOnDemand}
              disabled={isExecuting}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all shadow-xs ${
                isExecuting ? 'bg-mut cursor-not-allowed opacity-75' : 'bg-brand hover:bg-[#1D48B2]'
              }`}
            >
              {isExecuting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Ejecutando flujo…</span>
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  <span>Ejecutar flujo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* KPIs del proceso */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 px-4 py-3 border-b border-line bg-white">
        {workflow.summaryKpis.map((kpi, idx) => (
          <div key={idx} className="bg-paper/60 border border-line/70 rounded-lg px-3 py-2">
            <span className="text-[11px] text-mut block">{kpi.label}</span>
            <span
              className={`text-sm font-bold font-mono ${
                kpi.tone === 'bad' ? 'text-bad' : kpi.tone === 'warn' ? 'text-warn' : 'text-txt'
              }`}
            >
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      {/* ÚNICA REPRESENTACIÓN HORIZONTAL DEL FLUJO EN PÁGINA */}
      <div className="p-4 bg-[#FAFBFD]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {nodes.map((nodeItem, idx) => {
            const data = (nodeItem.data as any) as WorkflowNodeData;
            const tipo = tipoNodoLabel(data.category);
            const TipoIcon = tipo === 'Humano' ? UserCheck : tipo === 'Automático' ? Cog : Bot;
            const tipoBadgeClass =
              tipo === 'Humano'
                ? 'bg-warnsoft text-warn border-warn/30'
                : tipo === 'Agente'
                ? 'bg-brandsoft text-brand border-brand/30'
                : 'bg-paper text-mut border-line';

            return (
              <React.Fragment key={nodeItem.id}>
                <button
                  onClick={() => setSelectedNodeId(nodeItem.id)}
                  className="shrink-0 w-[240px] text-left rounded-lg bg-white border border-line hover:border-brand hover:shadow-md transition-all p-3.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tipoBadgeClass}`}>
                        <TipoIcon size={10} />
                        {tipo}
                      </span>
                      {data.status === 'completed' && (
                        <span className="text-[10px] font-bold text-ok bg-oksoft px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                          <CheckCircle2 size={10} /> Completado
                        </span>
                      )}
                      {data.status === 'running' && (
                        <span className="text-[10px] font-bold text-brand bg-brandsoft px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                          <RefreshCw size={10} className="animate-spin" /> En curso
                        </span>
                      )}
                      {data.status === 'action_required' && (
                        <span className="text-[10px] font-bold text-warn bg-warnsoft px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                          <AlertTriangle size={10} /> Aprobación
                        </span>
                      )}
                      {data.status === 'failed' && (
                        <span className="text-[10px] font-bold text-bad bg-badsoft px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                          <XCircle size={10} /> Con error
                        </span>
                      )}
                      {data.status === 'pending' && (
                        <span className="text-[10px] font-medium text-mut bg-paper px-1.5 py-0.5 rounded">
                          Pendiente
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-txt leading-snug line-clamp-2">
                      {data.stepNumber}. {data.label}
                    </div>
                    <p className="text-[11px] text-mut mt-1 line-clamp-2 leading-relaxed">
                      {data.shortDesc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-line/60 flex items-center justify-between text-[10.5px] text-mut">
                    <span className="truncate max-w-[155px]">
                      Resp.: <b className="text-txt font-semibold">{data.executor}</b>
                    </span>
                    <span className="text-brand font-medium">Inspeccionar →</span>
                  </div>
                </button>
                {idx < nodes.length - 1 && (
                  <ArrowRight size={16} className="text-mut shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* MODAL DE MODO EDICIÓN CON REACT FLOW */}
      {editorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-line rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-line bg-paper/50 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-txt">
                  Modo edición del flujo (React Flow) · {workflow.title}
                </h3>
                <p className="text-xs text-mut">
                  Arrastre los nodos, agregue nuevos pasos o haga clic en un nodo para editar su tipo, responsable y regla.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddNodeInEditor}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brandsoft text-brand border border-brand/30 hover:bg-brand hover:text-white transition-colors"
                >
                  <Plus size={13} /> Agregar paso
                </button>
                <button
                  onClick={() => setEditorModalOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand text-white hover:bg-[#1D48B2] transition-colors"
                >
                  <Check size={13} /> Guardar y cerrar
                </button>
                <button
                  onClick={() => setEditorModalOpen(false)}
                  className="p-1.5 text-mut hover:text-txt rounded-lg hover:bg-paper"
                  aria-label="Cerrar editor de flujo"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] flex-1 min-h-[480px] overflow-hidden">
              <div className="relative h-[480px] lg:h-full bg-[#F8FAFC]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onEditorNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  minZoom={0.4}
                  maxZoom={1.5}
                >
                  <Background color="#CBD5E1" gap={16} size={1} />
                  <Controls className="!bg-white !border !border-line !shadow-xs" />
                </ReactFlow>
              </div>

              <div className="border-t lg:border-t-0 lg:border-l border-line bg-white p-4 overflow-y-auto space-y-3 text-xs">
                <div className="font-semibold text-sm text-txt border-b border-line pb-2">
                  Propiedades del nodo seleccionado
                </div>
                {editingNode ? (
                  <>
                    <div>
                      <label className="text-mut font-medium block mb-1">Nombre del paso (#{editingNode.data.stepNumber})</label>
                      <input
                        value={editingNode.data.label}
                        onChange={e => handleUpdateEditingNode({ label: e.target.value })}
                        className="w-full border border-line rounded-md px-2.5 py-1.5 font-medium text-txt outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="text-mut font-medium block mb-1">Tipo de paso</label>
                      <select
                        value={
                          editingNode.data.category === 'aprobacion'
                            ? 'Humano'
                            : editingNode.data.category === 'ingesta' || editingNode.data.category === 'transmision'
                            ? 'Automático'
                            : 'Agente'
                        }
                        onChange={e => {
                          const val = e.target.value;
                          const cat: NodeCategory =
                            val === 'Humano' ? 'aprobacion' : val === 'Automático' ? 'ingesta' : 'calculo';
                          handleUpdateEditingNode({ category: cat });
                        }}
                        className="w-full border border-line rounded-md px-2.5 py-1.5 bg-white font-medium text-txt outline-none focus:border-brand"
                      >
                        <option value="Agente">Agente</option>
                        <option value="Humano">Humano (Aprobación)</option>
                        <option value="Automático">Automático (Ingesta / Conector)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-mut font-medium block mb-1">Responsable / Ejecutor</label>
                      <input
                        value={editingNode.data.executor}
                        onChange={e => handleUpdateEditingNode({ executor: e.target.value })}
                        className="w-full border border-line rounded-md px-2.5 py-1.5 text-txt outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="text-mut font-medium block mb-1">Regla / Norma asociada</label>
                      <input
                        value={editingNode.data.ruleCode || ''}
                        onChange={e => handleUpdateEditingNode({ ruleCode: e.target.value })}
                        className="w-full border border-line rounded-md px-2.5 py-1.5 font-mono text-txt outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="text-mut font-medium block mb-1">Descripción del paso</label>
                      <textarea
                        rows={3}
                        value={editingNode.data.shortDesc}
                        onChange={e => handleUpdateEditingNode({ shortDesc: e.target.value })}
                        className="w-full border border-line rounded-md px-2.5 py-1.5 text-txt outline-none focus:border-brand"
                      />
                    </div>
                    {nodes.length > 1 && (
                      <div className="pt-2 border-t border-line">
                        <button
                          onClick={() => handleDeleteNodeInEditor(editingNode.id)}
                          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium text-bad bg-badsoft/50 hover:bg-badsoft border border-bad/25 rounded-md py-1.5 transition-colors"
                        >
                          <Trash2 size={13} /> Eliminar este paso
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-mut">Haga clic en un nodo del lienzo para editarlo.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de inspección de nodo con Ejecutar, Aprobar, Devolver y Hacer a mano */}
      {selectedNode && nodeTrace && (
        <ExecutionInspectorModal
          customTrace={nodeTrace}
          onClose={() => setSelectedNodeId(null)}
          canExecute={canExecute}
          canApprove={canApprove}
          onExecuteStep={handleExecuteSingleStep}
          onApproveStep={handleApproveSingleStep}
          onReturnStep={handleReturnSingleStep}
          onManualStep={handleManualSingleStep}
        />
      )}
    </div>
  );
}
