import React, { useState } from 'react';
import {
  X, ShieldCheck, FileText, Check, Undo2, FileCode,
  Scale, Calculator, Clock, Edit3, Save, Database, Hash, Sparkles, Play
} from 'lucide-react';
import { useApp } from './context';
import { SAMPLE_TRACES } from '../data/mock';
import { LayerBadge, StatusBadge, Btn, Badge } from './ui';
import type { ExecutionTrace } from '../data/types';

export interface ExecutionInspectorModalProps {
  customTrace?: ExecutionTrace | null;
  onClose?: () => void;
  canExecute?: boolean;
  canApprove?: boolean;
  onExecuteStep?: () => void;
  onApproveStep?: () => void;
  onReturnStep?: (comment: string) => void;
  onManualStep?: (value: string, justification: string) => void;
}

export default function ExecutionInspectorModal({
  customTrace,
  onClose,
  canExecute = true,
  canApprove = true,
  onExecuteStep,
  onApproveStep,
  onReturnStep,
  onManualStep,
}: ExecutionInspectorModalProps = {}) {
  const {
    inspectTraceId,
    openTrace,
    approvals,
    decisions,
    decide,
    profile,
    openArtifact,
    traces,
    updateTraceManualBackup,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'resumen' | 'inputs' | 'regla' | 'comparacion' | 'pasos' | 'manual'>('resumen');
  const [editingValue, setEditingValue] = useState('');
  const [justification, setJustification] = useState('');
  const [commentModal, setCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localDecision, setLocalDecision] = useState<string | null>(null);

  const close = () => {
    if (onClose) onClose();
    else openTrace(null);
  };

  if (!customTrace && !inspectTraceId) return null;

  const approval = inspectTraceId ? approvals.find(a => a.id === inspectTraceId) : undefined;
  const trace: ExecutionTrace | undefined =
    customTrace ||
    (inspectTraceId ? traces[inspectTraceId] || SAMPLE_TRACES[inspectTraceId] : undefined) ||
    (approval
      ? {
          id: `TRC-${approval.id}`,
          approvalId: approval.id,
          agentName: approval.agent,
          agentLevel: 2,
          modelEngine: 'Modelo configurado + Motor Enersinc OS',
          timestamp: '2026-10-26 08:00 COT',
          title: approval.title,
          role: approval.role,
          capa: approval.capa,
          inputs: [
            { name: 'Publicacion_XM_Oficial.txt', source: 'Servidor ASIC XM', records: '14.280 registros', sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' },
            { name: 'Telemedida_Consolidada.csv', source: 'Sistema Concentrador CGM', records: '1.284 fronteras', sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b' },
          ],
          rule: {
            code: approval.ruleApplied,
            version: approval.ruleVersion,
            formulaName: 'Cálculo de Consistencia y Liquidación Sombra',
            mathExpression: 'Diferencia = |Resultado_Agente - Publicado_XM|',
            variables: [
              { symbol: 'Base Calculada', meaning: 'Monto sombra obtenido de reglas versionadas', appliedValue: approval.amount ? `$${(approval.amount / 1e6).toFixed(1)} M` : 'N/A' },
            ],
            thresholdNotice: 'Tolerancia estándar del MEM: Dentro de límites de auditoría.',
          },
          comparison: [
            { concept: approval.title, calculatedValue: approval.evidence[0]?.value || 'Conforme', xmOfficialValue: approval.evidence[1]?.value || 'Conforme', diffText: approval.evidence[2]?.value || '0', diffAmount: approval.amount || 0, threshold: 'Tolerancia MEM', verdict: 'Reclamable' },
          ],
          steps: [
            { time: '08:00:00', phase: 'Ingesta', detail: 'Descarga y validación de integridad', evidence: 'Checksum verificado', status: 'ok' },
            { time: '08:00:15', phase: 'Cálculo', detail: 'Ejecución de fórmulas CREG', evidence: 'Fórmulas evaluadas sin error', status: 'ok' },
            { time: '08:00:30', phase: 'Envío', detail: 'Puesta a disposición para validación humana', evidence: 'En espera de aprobación', status: 'info' },
          ],
          manualBackup: { canEdit: true, modified: false },
        }
      : undefined);

  if (!trace) return null;

  const currentDecision = localDecision || decisions[trace.approvalId];

  const handleApplyManualEdit = () => {
    if (!editingValue.trim() || !justification.trim()) return;
    if (onManualStep) {
      onManualStep(editingValue.trim(), justification.trim());
      setLocalDecision('Ajustado Manual');
    } else {
      updateTraceManualBackup(trace.approvalId, editingValue.trim(), justification.trim());
    }
    setActiveTab('resumen');
  };

  const handleExecute = () => {
    if (onExecuteStep) {
      onExecuteStep();
      setLocalDecision('Completada');
      close();
    } else {
      decide(trace.approvalId, 'Aprobado');
      close();
    }
  };

  const handleApprove = () => {
    if (onApproveStep) {
      onApproveStep();
      setLocalDecision('Aprobado');
      close();
    } else {
      decide(trace.approvalId, 'Aprobado');
      close();
    }
  };

  const handleDevolver = () => {
    setCommentModal(true);
    setCommentText('');
  };

  const submitDevolver = () => {
    if (!commentText.trim()) return;
    if (onReturnStep) {
      onReturnStep(commentText.trim());
      setLocalDecision('Devuelto');
    } else {
      decide(trace.approvalId, 'Devuelto', commentText.trim());
    }
    setCommentModal(false);
    close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto" onClick={close}>
      <div
        className="bg-white rounded-xl shadow-2xl border border-line max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label={`Inspector de paso: ${trace.title}`}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-line bg-paper/50 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs font-bold bg-ink text-white px-2 py-0.5 rounded">
                {trace.approvalId}
              </span>
              <span className="text-xs text-mut font-mono">Trazabilidad: {trace.id}</span>
              <LayerBadge capa={trace.capa} compact />
              <span className="text-xs text-brand font-semibold">
                Nivel Autonomía {trace.agentLevel}
              </span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-txt leading-snug">{trace.title}</h2>
            <div className="text-xs text-mut mt-0.5 flex flex-wrap items-center gap-2">
              <span>Responsable: <b className="text-txt font-semibold">{trace.agentName}</b></span>
              <span>·</span>
              <span>Motor: <span className="font-mono text-txt">{trace.modelEngine}</span></span>
              <span>·</span>
              <span>Corrida: <span className="text-txt font-medium">{trace.timestamp}</span></span>
            </div>
          </div>
          <button
            onClick={close}
            className="text-mut hover:text-txt p-1.5 rounded-lg hover:bg-paper transition-colors shrink-0"
            aria-label="Cerrar modal de inspección"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 px-5 border-b border-line bg-white overflow-x-auto">
          {[
            { id: 'resumen', label: 'Resumen y Dictamen', icon: ShieldCheck },
            { id: 'inputs', label: 'Entradas (Inputs)', icon: Database },
            { id: 'regla', label: 'Regla CREG & Fórmula', icon: Calculator },
            { id: 'comparacion', label: 'Métricas y Cruce', icon: Scale },
            { id: 'pasos', label: 'Bitácora (Log)', icon: Clock },
            { id: 'manual', label: 'Hacer a mano', icon: Edit3 },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? 'border-brand text-brand font-semibold bg-brandsoft/20'
                    : 'border-transparent text-mut hover:text-txt hover:bg-paper/50'
                }`}
              >
                <Icon size={14} className={active ? 'text-brand' : 'opacity-70'} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'resumen' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-paper p-3 rounded-lg border border-line">
                  <span className="text-[11px] text-mut uppercase tracking-wider font-semibold block mb-1">
                    Responsable del paso
                  </span>
                  <div className="text-xs font-bold text-txt">{trace.role}</div>
                  <span className="text-[10px] text-mut block mt-1">
                    Principio: Quien ejecuta no aprueba
                  </span>
                </div>
                <div className="bg-paper p-3 rounded-lg border border-line">
                  <span className="text-[11px] text-mut uppercase tracking-wider font-semibold block mb-1">
                    Criterio Regulatorio
                  </span>
                  <div className="text-xs font-semibold text-brand truncate">{trace.rule.code}</div>
                  <span className="text-[10px] text-mut block mt-1">{trace.rule.version}</span>
                </div>
                <div className="bg-paper p-3 rounded-lg border border-line">
                  <span className="text-[11px] text-mut uppercase tracking-wider font-semibold block mb-1">
                    Estado Actual
                  </span>
                  <div>
                    {currentDecision ? (
                      <StatusBadge s={currentDecision} />
                    ) : (
                      <Badge tone="warn">Disponible para inspección</Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-mut block mt-1">
                    Toda acción deja registro en auditoría
                  </span>
                </div>
              </div>

              <div className="bg-brandsoft/30 border border-brand/30 rounded-lg p-3.5">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-brand">
                  <Sparkles size={15} /> Detalle del paso en el flujo
                </div>
                <p className="text-xs text-txt leading-relaxed font-medium">
                  {approval?.proposal || trace.rule.thresholdNotice}
                </p>
                {approval?.artifact && (
                  <button
                    onClick={() => openArtifact(approval.artifact!)}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-brand font-semibold hover:underline"
                  >
                    <FileText size={13} /> Abrir artefacto de soporte ({approval.artifact}) →
                  </button>
                )}
              </div>

              {trace.manualBackup?.modified && (
                <div className="p-3 bg-oksoft/40 border border-ok/30 rounded-lg text-xs">
                  <span className="font-bold text-ok flex items-center gap-1 mb-1">
                    <Check size={14} /> Hecho a mano por operador
                  </span>
                  <div className="text-txt">
                    Valor ajustado: <b>{trace.manualBackup.newValue}</b> (Original:{' '}
                    <span className="line-through text-mut">{trace.manualBackup.originalValue}</span>)
                  </div>
                  <div className="text-[11px] text-mut mt-0.5">
                    Modificado por {trace.manualBackup.modifiedBy} el {trace.manualBackup.modifiedAt}. Motivo:{' '}
                    <i>{trace.manualBackup.justification}</i>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-mut mb-2 flex items-center gap-1.5">
                  <Scale size={14} className="text-brand" /> Métricas y Resultados del Paso
                </h4>
                <div className="border border-line rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-paper border-b border-line text-mut text-left">
                      <tr>
                        <th className="p-2.5">Concepto / Métrica</th>
                        <th className="p-2.5 text-right">Resultado</th>
                        <th className="p-2.5 text-right">Referencia</th>
                        <th className="p-2.5 text-right">Delta</th>
                        <th className="p-2.5 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {trace.comparison.map((c, i) => (
                        <tr key={i} className="hover:bg-paper/40">
                          <td className="p-2.5 font-medium text-txt">{c.concept}</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-txt">{c.calculatedValue}</td>
                          <td className="p-2.5 text-right font-mono text-mut">{c.xmOfficialValue}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-txt">{c.diffText}</td>
                          <td className="p-2.5 text-center">
                            <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded ${
                              c.verdict === 'Reclamable' ? 'bg-badsoft text-bad' : c.verdict === 'Alerta' ? 'bg-warnsoft text-warn' : 'bg-oksoft text-ok'
                            }`}>
                              {c.verdict}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inputs' && (
            <div className="space-y-4">
              <div className="p-3 bg-paper rounded-lg border border-line text-xs text-mut">
                Evidencia de entradas del paso con su hash criptográfico de integridad SHA-256.
              </div>
              <div className="space-y-3">
                {trace.inputs.map((inp, idx) => (
                  <div key={idx} className="bg-white border border-line rounded-lg p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <FileCode size={16} className="text-brand shrink-0" />
                        <span className="font-semibold text-xs text-txt">{inp.name}</span>
                      </div>
                      <span className="text-[11px] bg-paper text-mut px-2 py-0.5 rounded font-mono">
                        {inp.records}
                      </span>
                    </div>
                    <div className="text-xs text-mut mb-2">
                      Fuente: <span className="text-txt font-medium">{inp.source}</span>
                    </div>
                    <div className="bg-paper p-2 rounded text-[11px] font-mono text-mut break-all flex items-start gap-1.5">
                      <Hash size={13} className="shrink-0 mt-0.5 text-brand" />
                      <span>SHA-256: {inp.sha256}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'regla' && (
            <div className="space-y-4">
              <div className="border border-line rounded-lg p-4 bg-white">
                <div className="text-xs text-brand font-semibold mb-1">{trace.rule.code}</div>
                <h3 className="text-sm font-bold text-txt">{trace.rule.formulaName}</h3>
                <div className="text-xs text-mut mt-0.5">Versión vigente en el motor: {trace.rule.version}</div>
                <div className="mt-3 p-3 bg-ink text-white rounded-lg font-mono text-xs leading-relaxed overflow-x-auto">
                  {trace.rule.mathExpression}
                </div>
                <div className="mt-4 grid md:grid-cols-2 gap-2">
                  {trace.rule.variables.map((v, i) => (
                    <div key={i} className="p-2.5 bg-paper rounded border border-line text-xs">
                      <span className="font-mono font-bold text-brand block">{v.symbol}</span>
                      <div className="text-txt font-semibold mt-0.5">{v.appliedValue}</div>
                      <div className="text-[11px] text-mut">{v.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparacion' && (
            <div className="border border-line rounded-lg overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead className="bg-paper border-b border-line text-mut text-left">
                  <tr>
                    <th className="p-3">Concepto</th>
                    <th className="p-3 text-right">Calculado</th>
                    <th className="p-3 text-right">Referencia</th>
                    <th className="p-3 text-right">Diferencia</th>
                    <th className="p-3 text-center">Veredicto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {trace.comparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-paper/40">
                      <td className="p-3 font-medium text-txt">{row.concept}</td>
                      <td className="p-3 text-right font-mono font-semibold text-txt">{row.calculatedValue}</td>
                      <td className="p-3 text-right font-mono text-mut">{row.xmOfficialValue}</td>
                      <td className="p-3 text-right font-mono font-bold text-txt">{row.diffText}</td>
                      <td className="p-3 text-center">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${
                          row.verdict === 'Reclamable' ? 'bg-badsoft text-bad' : 'bg-oksoft text-ok'
                        }`}>
                          {row.verdict}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'pasos' && (
            <div className="relative border-l-2 border-brand/30 ml-3 space-y-4 py-2">
              {trace.steps.map((st, i) => (
                <div key={i} className="ml-5 relative">
                  <span className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    st.status === 'ok' ? 'bg-ok' : st.status === 'alerta' ? 'bg-warn' : 'bg-brand'
                  }`} />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-mut font-semibold">{st.time}</span>
                    <span className="font-semibold text-brand uppercase text-[10px] tracking-wider bg-brandsoft px-1.5 py-0.2 rounded">
                      {st.phase}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-txt mt-1">{st.detail}</div>
                  <div className="text-[11px] text-mut mt-0.5">{st.evidence}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-paper rounded-lg border border-line text-xs">
                <span className="font-bold text-txt block mb-1">Hacer a mano (Respaldo manual auditable)</span>
                <p className="text-mut leading-relaxed">
                  Como <b className="text-txt">{profile.person}</b> ({profile.role}), puede ingresar un valor o resultado hecho a mano con su justificación. Quedará registrado con su usuario y fecha en la bitácora del proceso.
                </p>
              </div>

              <div className="space-y-3 bg-white border border-line p-4 rounded-lg">
                <div>
                  <label className="text-xs font-semibold text-txt block mb-1">
                    Valor o resultado hecho a mano:
                  </label>
                  <input
                    type="text"
                    value={editingValue}
                    onChange={e => setEditingValue(e.target.value)}
                    placeholder="Ej. $1.315,4 M o parámetro validado manualmente"
                    className="w-full text-xs p-2.5 border border-line rounded-md outline-none focus:border-brand font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-txt block mb-1">
                    Justificación obligatoria:
                  </label>
                  <textarea
                    value={justification}
                    onChange={e => setJustification(e.target.value)}
                    placeholder="Ej. Se valida con soporte de redeclaración de las 16:42..."
                    rows={3}
                    className="w-full text-xs p-2.5 border border-line rounded-md outline-none focus:border-brand"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Btn small onClick={() => setActiveTab('resumen')}>
                    Cancelar
                  </Btn>
                  <Btn small kind="primary" onClick={handleApplyManualEdit} disabled={!editingValue.trim() || !justification.trim()}>
                    <Save size={13} /> Guardar cambio hecho a mano
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / 4 Required Actions: Ejecutar, Aprobar, Devolver, Hacer a mano */}
        <div className="px-5 py-3.5 border-t border-line bg-paper/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-mut">
            Actuando como: <b className="text-txt">{profile.person}</b> ({profile.role})
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Btn small onClick={handleExecute} disabled={!canExecute} title={canExecute ? 'Ejecutar este paso' : 'Requiere rol Ejecutor o Dueño'}>
              <Play size={13} /> Ejecutar
            </Btn>
            <Btn small onClick={() => setActiveTab('manual')} disabled={!canExecute} title={canExecute ? 'Hacer este paso a mano' : 'Requiere rol Ejecutor o Dueño'}>
              <Edit3 size={13} /> Hacer a mano
            </Btn>
            <Btn small onClick={handleDevolver} disabled={!canApprove && !canExecute}>
              <Undo2 size={13} /> Devolver
            </Btn>
            <Btn kind="success" small onClick={handleApprove} disabled={!canApprove} title={canApprove ? 'Aprobar y avanzar paso' : 'Requiere rol Aprobador o Dueño'}>
              <Check size={13} /> Aprobar
            </Btn>
          </div>
        </div>

        {/* Devolver Comment Modal */}
        {commentModal && (
          <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center p-4" onClick={() => setCommentModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 border border-line" onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold text-sm mb-1 text-txt">Devolver paso con observación</h3>
              <p className="text-xs text-mut mb-3">
                Indique qué debe corregir o recalcular el responsable antes de volver a presentar el paso.
              </p>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Ej. Revisar la hora 19 con el archivo IDO de las 16:42..."
                className="w-full text-xs p-2 border border-line rounded mb-3 outline-none focus:border-brand"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Btn small onClick={() => setCommentModal(false)}>Cancelar</Btn>
                <Btn small kind="primary" onClick={submitDevolver}>Confirmar devolución</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
