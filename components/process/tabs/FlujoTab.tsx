import React, { useMemo, useState } from 'react';
import { CalendarDays, GitCompare, History, X } from 'lucide-react';
import ProcessFlowDAG from '../../workflow/ProcessFlowDAG';
import FechasTab from './FechasTab';
import { useProcess } from '../ProcessStore';
import { useApp } from '../../context';
import { StatusBadge } from '../../ui';
import type { Ejecucion, ProcesoDef } from '../../../data/process/types';
import type { ProcessWorkflow, NodeStatus } from '../../../data/workflowModels';

/** Ajusta el estado de los pasos según la ejecución seleccionada. */
export function workflowPara(p: ProcesoDef, ej: Ejecucion): ProcessWorkflow {
  const wf = p.workflow;
  if (ej.estado === 'Esperando aprobación') return wf;
  const n = wf.nodes.length;
  const estado = (i: number): NodeStatus => {
    if (ej.estado === 'Completada') return 'completed';
    if (ej.estado === 'Con error') return i < n - 1 ? 'completed' : 'failed';
    const actual = wf.nodes.findIndex(x => x.data.label === ej.pasoActual);
    return i < actual ? 'completed' : i === actual ? 'running' : 'pending';
  };
  return {
    ...wf,
    id: `${wf.id}-${ej.id}`,
    status: ej.estado === 'Completada' ? 'completed' : ej.estado === 'Con error' ? 'action_required' : 'running',
    nodes: wf.nodes.map((x, i) => ({ ...x, data: { ...x.data, status: estado(i) } })),
  };
}

export default function FlujoTab({ p, ej }: { p: ProcesoDef; ej: Ejecucion }) {
  const { puede, registrarAprobacionPaso, ejecuciones, seleccionarEjecucion } = useProcess();
  const { profile } = useApp();
  const [bitacoraModal, setBitacoraModal] = useState(false);

  const wf = useMemo(() => workflowPara(p, ej), [p, ej]);
  const perm = puede(p.id);
  const propias = ejecuciones.filter(x => x.procesoId === p.id);

  return (
    <div className="space-y-3">
      {/* Primera parte del flujo: tira de fechas / versiones publicadas y acceso a la bitácora */}
      <div className="bg-white border border-line rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-txt mr-1">
          <CalendarDays size={14} className="text-brand" />
          {p.versionado ? 'Línea de versiones del ciclo:' : 'Bitácora de fechas de operación:'}
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {propias.map(item => {
            const active = item.id === ej.id;
            const label = p.versionado ? `${item.fecha} · ${item.version}` : item.fecha;
            return (
              <button
                key={item.id}
                onClick={() => seleccionarEjecucion(p.id, item.id)}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  active
                    ? 'border-brand bg-brandsoft text-brand font-semibold'
                    : 'border-line bg-paper/60 text-mut hover:text-txt hover:bg-paper'
                }`}
              >
                <span>{label}</span>
                <StatusBadge s={item.estado} />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setBitacoraModal(true)}
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          {p.versionado ? <GitCompare size={13} /> : <History size={13} />}
          <span>{p.versionado ? 'Comparar versiones y bitácora' : 'Ver bitácora completa'}</span>
        </button>
      </div>

      <ProcessFlowDAG
        key={wf.id}
        workflow={wf}
        embedded
        canExecute={perm.ejecutar}
        canApprove={perm.aprobar}
        actor={profile.person}
        onApproved={(_, label) => registrarAprobacionPaso(p.id, label)}
      />

      {bitacoraModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper border border-line rounded-xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-white border-b border-line flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-txt">
                  {p.versionado ? `Bitácora y comparador de versiones · ${p.nombre}` : `Bitácora de fechas de operación · ${p.nombre}`}
                </h3>
                <p className="text-xs text-mut">
                  Seleccione una ejecución o compare variaciones entre cortes publicados.
                </p>
              </div>
              <button
                onClick={() => setBitacoraModal(false)}
                className="p-1.5 text-mut hover:text-txt rounded-lg hover:bg-paper"
                aria-label="Cerrar bitácora"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <FechasTab p={p} ej={ej} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
