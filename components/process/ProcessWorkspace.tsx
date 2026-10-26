import React, { useState } from 'react';
import { Plus, User, Building2, History, Pencil, Check, X } from 'lucide-react';
import { useProcess, PROCESOS } from './ProcessStore';
import { Badge, Btn, StatusBadge } from '../ui';
import { PESTANAS } from '../../data/process/types';
import type { ProcesoDef } from '../../data/process/types';
import type { RegulatoryVersion } from '../../data/types';
import type { ProcessWorkflow } from '../../data/workflowModels';
import FlujoTab from './tabs/FlujoTab';
import DatosTab from './tabs/DatosTab';
import ChatTab from './tabs/ChatTab';
import ReportesTab from './tabs/ReportesTab';
import FechasTab from './tabs/FechasTab';
import EnviosTab from './tabs/EnviosTab';
import HistoricoTab from './tabs/HistoricoTab';

const ROL_TONO = { Dueño: 'brand', Aprobador: 'ok', Ejecutor: 'warn', Lector: 'neutral' } as const;
const VERSIONES_TX: RegulatoryVersion[] = ['TX1', 'TX2', 'TX3', 'TXR', 'TXF'];

export default function ProcessWorkspace({ p: propP, workflow }: { p?: ProcesoDef; workflow?: ProcessWorkflow }) {
  const {
    pestana,
    setPestana,
    ejecuciones,
    ejecucionActiva,
    seleccionarEjecucion,
    nuevaEjecucion,
    editarFechaEjecucion,
    rol,
    puede,
    envios,
    reportes,
  } = useProcess();

  const p = propP ?? PROCESOS.find(x => x.id === workflow?.id) ?? PROCESOS[0];
  const wf = workflow ?? p.workflow;
  const isSettlement = Boolean(wf.isFinancialSettlement);

  const ej = ejecucionActiva(p.id);
  const lista = ejecuciones.filter(e => e.procesoId === p.id);
  const miRol = rol(p.id);
  const etiqueta = (e: typeof ej) => (isSettlement ? `${e.fecha} · ${e.version ?? 'TX2'}` : e.fecha);

  const [bitacoraAbierta, setBitacoraAbierta] = useState(false);
  const [editandoFecha, setEditandoFecha] = useState(false);
  const [fechaInput, setFechaInput] = useState(ej.fecha);
  const [versionInput, setVersionInput] = useState<RegulatoryVersion>(ej.version ?? 'TX2');

  const nodoActual = wf.nodes.find(n => n.data.label === ej.pasoActual) ?? wf.nodes.find(n => n.data.status === 'active') ?? wf.nodes[0];
  const responsablePasoActual = nodoActual?.data.executor ?? wf.ownerRole;

  const contadores: Partial<Record<string, number>> = {
    envios: envios.filter(e => e.procesoId === p.id && e.ejecucionId === ej.id && ['Preparado', 'Rechazado'].includes(e.estado)).length,
    reportes: reportes.filter(r => r.procesoId === p.id && r.ejecucionId === ej.id && r.estado !== 'Congelado').length,
  };

  const Contenido = {
    flujo: FlujoTab,
    datos: DatosTab,
    chat: ChatTab,
    reportes: ReportesTab,
    fechas: FechasTab,
    envios: EnviosTab,
    historico: HistoricoTab,
  }[pestana];

  const guardarFechaEditada = () => {
    editarFechaEjecucion(ej.id, fechaInput, isSettlement ? versionInput : undefined);
    setEditandoFecha(false);
  };

  return (
    <div>
      {/* Encabezado fijo (una sola fila): nombre del proceso, código, dominio, selector/editor de fecha, botón Ver bitácora, estado general, responsable y Nueva ejecución */}
      <div className="bg-white border border-line rounded-lg px-4 py-2.5 mb-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-lg font-semibold leading-tight text-txt">{p.nombre}</h1>
          <span className="font-mono text-xs text-brand bg-brandsoft rounded px-1.5 py-0.5">{p.codigo}</span>
          <span className="text-xs font-medium text-mut bg-paper border border-line rounded px-2 py-0.5">{p.dominio}</span>
          {p.entidad && (
            <span className="inline-flex items-center gap-1 text-xs text-mut">
              <Building2 size={11} /> {p.entidad}
            </span>
          )}

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {editandoFecha ? (
              <div className="inline-flex items-center gap-1.5 bg-paper border border-brand rounded-md px-2 py-1">
                <input
                  value={fechaInput}
                  onChange={e => setFechaInput(e.target.value)}
                  aria-label="Editar fecha de operación o periodo"
                  className="bg-white border border-line rounded px-2 py-0.5 text-xs font-medium w-32 outline-none"
                />
                {isSettlement && (
                  <select
                    value={versionInput}
                    onChange={e => setVersionInput(e.target.value as RegulatoryVersion)}
                    aria-label="Editar versión TX"
                    className="bg-white border border-line rounded px-1.5 py-0.5 text-xs font-semibold outline-none"
                  >
                    {VERSIONES_TX.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={guardarFechaEditada}
                  className="p-1 rounded bg-brand text-white hover:bg-[#1D48B2]"
                  title="Guardar fecha"
                  aria-label="Guardar fecha"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => setEditandoFecha(false)}
                  className="p-1 rounded text-mut hover:text-txt"
                  title="Cancelar"
                  aria-label="Cancelar"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1">
                <label className="inline-flex items-center gap-1.5 text-xs text-mut">
                  <span>{isSettlement ? 'Periodo y versión:' : 'Fecha de operación:'}</span>
                  <select
                    value={ej.id}
                    onChange={e => seleccionarEjecucion(p.id, e.target.value)}
                    aria-label={isSettlement ? 'Periodo y versión' : 'Fecha de operación'}
                    className="border border-line rounded-md px-2.5 py-1 bg-white text-sm text-txt font-medium"
                  >
                    {lista.map(e => (
                      <option key={e.id} value={e.id}>
                        {etiqueta(e)}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={() => {
                    setFechaInput(ej.fecha);
                    setVersionInput(ej.version ?? 'TX2');
                    setEditandoFecha(true);
                  }}
                  className="p-1.5 text-mut hover:text-brand rounded hover:bg-paper transition-colors"
                  title="Editar fecha de la ejecución"
                  aria-label="Editar fecha de la ejecución"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}

            <button
              onClick={() => setBitacoraAbierta(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium border border-line bg-paper/70 hover:bg-brandsoft hover:text-brand hover:border-brand/30 rounded-md px-2.5 py-1 transition-colors"
              title="Ver bitácora de fechas y versiones"
            >
              <History size={13} />
              <span>Ver bitácora</span>
            </button>

            <StatusBadge s={ej.estado} />

            <span className="inline-flex items-center gap-1 text-xs text-mut border-l border-line pl-2.5">
              <User size={12} />
              <span>Paso actual ({ej.pasoActual}):</span>
              <b className="text-txt font-medium">{responsablePasoActual}</b>
            </span>

            <Badge tone={ROL_TONO[miRol]}>{miRol}</Badge>

            {puede(p.id).configurar || puede(p.id).ejecutar ? (
              <Btn small onClick={() => nuevaEjecucion(p.id)}>
                <Plus size={13} /> Nueva ejecución
              </Btn>
            ) : null}
          </div>
        </div>
      </div>

      {/* Pestañas del espacio de trabajo */}
      <div className="flex gap-1 border-b border-line mb-4 overflow-x-auto" role="tablist">
        {PESTANAS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={pestana === t.id}
            onClick={() => setPestana(t.id)}
            className={`px-3.5 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${
              pestana === t.id ? 'border-brand text-brand font-semibold' : 'border-transparent text-mut hover:text-txt'
            }`}
          >
            <span className="text-[11px] text-mut mr-1">{i + 1}</span>
            {t.label}
            {contadores[t.id] ? (
              <span className="ml-1.5 num text-[11px] rounded bg-warnsoft text-warn px-1.5">{contadores[t.id]}</span>
            ) : null}
          </button>
        ))}
      </div>

      <Contenido p={p} ej={ej} />

      {/* Modal de Bitácora de fechas y versiones desde el encabezado */}
      {bitacoraAbierta && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper border border-line rounded-xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-white border-b border-line flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-txt">
                  {isSettlement ? `Bitácora de fechas y versiones TX · ${p.nombre}` : `Bitácora de fechas de operación · ${p.nombre}`}
                </h3>
                <p className="text-xs text-mut">
                  Consulte el historial de ejecuciones por fecha o compare versiones publicadas.
                </p>
              </div>
              <button
                onClick={() => setBitacoraAbierta(false)}
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
