import React, { useEffect } from 'react';
import { ArrowRight, Send, Workflow, Users, ShieldCheck } from 'lucide-react';
import { useApp } from '../components/context';
import { useProcess } from '../components/process/ProcessStore';
import ProcessWorkspace from '../components/process/ProcessWorkspace';
import ChatPanel from '../components/process/ChatPanel';
import { Badge, StatusBadge, ViewHeader } from '../components/ui';
import { PROFILES } from '../data/mock';
import { EQUIPOS, PROCESOS, procesoPorId, procesosVisibles, rolDe } from '../data/process/catalog';
import { DOMINIOS } from '../data/process/types';

// ---------- Proceso ----------
export function ProcesoView() {
  const { activo, visibles } = useProcess();
  const p = (activo ? visibles.find(x => x.id === activo) : null) ?? visibles[0] ?? PROCESOS[0];
  return <ProcessWorkspace p={p} workflow={p.workflow} />;
}

// ---------- Mi bandeja ----------
export function MiBandeja() {
  const { bandeja, abrir, visibles, ejecucionActiva, rol } = useProcess();
  const { profile, approvals, decisions, openTrace, traces } = useApp();
  const legado = approvals.filter(a => !decisions[a.id] && traces[a.id] && (a.role === profile.role || profile.id === 'ger'));
  return (
    <>
      <ViewHeader title={`Mi bandeja · ${profile.person}`} desc="Pasos humanos y cierres que esperan su decisión en los procesos donde usted aprueba. Quien ejecuta no aprueba." />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {bandeja.length === 0 && legado.length === 0 && (
            <div className="bg-white border border-line rounded-lg p-6 text-sm text-mut">No tiene decisiones pendientes. Cambie de persona abajo a la izquierda para ver otra bandeja.</div>
          )}
          {bandeja.map(i => (
            <button key={i.id} onClick={() => abrir(i.proceso.id, i.tipo === 'envio' ? 'envios' : 'flujo', i.ejecucion.id)}
              className="w-full text-left bg-white border border-line rounded-lg p-3.5 hover:border-brand flex items-start gap-3">
              <span className={`mt-0.5 w-8 h-8 rounded-full grid place-items-center shrink-0 ${i.tipo === 'envio' ? 'bg-brandsoft text-brand' : 'bg-warnsoft text-warn'}`}>
                {i.tipo === 'envio' ? <Send size={15} /> : <ShieldCheck size={15} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs text-mut">{i.tipo === 'envio' ? 'Soporte y cierre por aprobar' : 'Paso humano por aprobar'} · {i.proceso.dominio}</span>
                <span className="block font-medium">{i.titulo}</span>
                <span className="block text-xs text-mut truncate">{i.detalle}</span>
              </span>
              <ArrowRight size={16} className="text-mut mt-2" />
            </button>
          ))}
          {legado.length > 0 && (
            <div className="pt-3">
              <div className="text-xs text-mut mb-1.5">Evidencia detallada preparada por los agentes</div>
              {legado.map(a => (
                <button key={a.id} onClick={() => openTrace(a.id)} className="w-full text-left bg-white border border-line rounded-lg p-3 mb-2 hover:border-brand">
                  <div className="text-xs text-mut">{a.id} · {a.agent}</div>
                  <div className="text-sm font-medium">{a.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white border border-line rounded-lg p-4 h-fit">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Workflow size={15} /> Mis procesos</h3>
          <ul className="space-y-2">
            {visibles.map(x => {
              const e = ejecucionActiva(x.id);
              return (
                <li key={x.id}>
                  <button onClick={() => abrir(x.id)} className="w-full text-left rounded-md px-2 py-1.5 hover:bg-paper">
                    <div className="flex items-center gap-2"><span className="text-sm font-medium flex-1 truncate">{x.nombre}</span><Badge tone="neutral">{rol(x.id)}</Badge></div>
                    <div className="flex items-center gap-2 mt-0.5"><StatusBadge s={e.estado} /><span className="text-xs text-mut truncate">{e.pasoActual}</span></div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

// ---------- Mis conversaciones (pantalla completa, sin menú duplicado) ----------
export function MisConversaciones() {
  const { misConversaciones, convActiva, setConvActiva } = useProcess();
  const activa = misConversaciones.find(c => c.id === convActiva) ?? misConversaciones[0] ?? null;

  useEffect(() => {
    if (activa && activa.id !== convActiva) setConvActiva(activa.id);
  }, [activa?.id]);

  return (
    <div className="w-full">
      <ChatPanel
        convId={activa?.id ?? null}
        procesoId={activa?.procesoId}
        ejecucionId={activa?.ejecucionId}
      />
    </div>
  );
}

// ---------- Equipos ----------
export function Equipos() {
  const { profile } = useApp();
  const { abrir } = useProcess();
  const persona = (id: string) => PROFILES.find(p => p.id === id);
  return (
    <>
      <ViewHeader title="Equipos" desc="Los procesos se comparten por equipos. Dentro de cada proceso, el rol define qué puede hacer cada persona: Dueño configura, Ejecutor ejecuta y edita, Aprobador aprueba, Lector consulta." />
      <div className="grid md:grid-cols-2 gap-4">
        {EQUIPOS.map(eq => (
          <div key={eq.id} className={`bg-white border rounded-lg p-4 ${eq.miembros.includes(profile.id) ? 'border-brand' : 'border-line'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={15} className="text-brand" /><h3 className="font-semibold flex-1">{eq.nombre}</h3>
              {eq.miembros.includes(profile.id) && <Badge tone="brand">Su equipo</Badge>}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {eq.miembros.map(m => <Badge key={m} tone="neutral">{persona(m)?.person}</Badge>)}
            </div>
            <ul className="space-y-1">
              {eq.procesos.map(pid => {
                const p = procesoPorId(pid)!;
                return (
                  <li key={pid} className="flex items-center gap-2 text-sm">
                    <button onClick={() => abrir(pid)} className="text-brand hover:underline flex-1 text-left truncate">{p.nombre}</button>
                    <span className="text-xs text-mut hidden sm:inline">{eq.miembros.map(m => `${persona(m)?.initials}: ${rolDe(m, p)}`).join(' · ')}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="bg-white border border-line rounded-lg mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-mut"><th className="px-3 py-2 font-medium">Proceso</th>{PROFILES.map(p => <th key={p.id} className="px-3 py-2 font-medium whitespace-nowrap">{p.person}</th>)}</tr></thead>
          <tbody>
            {DOMINIOS.flatMap(d => PROCESOS.filter(p => p.dominio === d)).map(p => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-3 py-2 whitespace-nowrap">{p.nombre}</td>
                {PROFILES.map(x => <td key={x.id} className={`px-3 py-2 ${x.id === profile.id ? 'bg-brandsoft/50' : ''}`}><span className="text-xs">{procesosVisibles(x.id).some(v => v.id === p.id) ? rolDe(x.id, p) : '—'}</span></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
