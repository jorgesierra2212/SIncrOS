import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context';
import { askAgent, ChatMsg } from '../../data/agentScript';
import type { ArchivoItem, RegulatoryVersion } from '../../data/types';
import type { CambioCelda, Conversacion, Ejecucion, Envio, EstadoEnvio, Fila, PestanaProceso, ProcesoDef, Reporte } from '../../data/process/types';
import { PROCESOS, permisos, procesoPorId, procesosVisibles, rolDe } from '../../data/process/catalog';
import { CONVERSACIONES_INICIALES, EJECUCIONES_INICIALES, ENVIOS_INICIALES, REPORTES_INICIALES } from '../../data/process/seeds';

const ahora = () => new Date().toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const clave = (pid: string, eid: string) => `${pid}|${eid}`;
const LS_KEY = 'enersinc.conversaciones.v1';

function cargarConversaciones(): Conversacion[] {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* almacenamiento no disponible */ }
  return CONVERSACIONES_INICIALES;
}

export interface ItemBandeja {
  id: string;
  tipo: 'paso' | 'envio';
  proceso: ProcesoDef;
  ejecucion: Ejecucion;
  titulo: string;
  detalle: string;
}

interface ProcessCtx {
  visibles: ProcesoDef[];
  activo: string | null;
  pestana: PestanaProceso;
  abrir: (pid: string, pestana?: PestanaProceso, eid?: string) => void;
  setPestana: (p: PestanaProceso) => void;
  ejecuciones: Ejecucion[];
  ejecucionActiva: (pid: string) => Ejecucion;
  seleccionarEjecucion: (pid: string, eid: string) => void;
  nuevaEjecucion: (pid: string) => void;
  editarFechaEjecucion: (eid: string, nuevaFecha: string, nuevaVersion?: RegulatoryVersion) => void;
  registrarAprobacionPaso: (pid: string, label: string) => void;
  filasDe: (pid: string, eid: string) => Fila[];
  cambiosDe: (pid: string, eid: string) => CambioCelda[];
  editarCelda: (pid: string, eid: string, filaId: string, col: string, valor: string | number, motivo?: string) => void;
  importarFilas: (pid: string, eid: string, filas: Fila[]) => void;
  reportes: Reporte[];
  crearReporteDesdePlantilla: (pid: string, eid: string, titulo: string, tipo: Reporte['tipo']) => void;
  actualizarReporte: (id: string) => void;
  congelarReporte: (id: string) => void;
  envios: Envio[];
  generarSoporteCierre: (pid: string, eid: string) => void;
  aprobarEnvio: (id: string, simularRechazo?: boolean) => void;
  rechazarEnvio: (id: string, motivo: string) => void;
  reenviar: (id: string) => void;
  conversaciones: Conversacion[];
  misConversaciones: Conversacion[];
  convActiva: string | null;
  setConvActiva: (id: string | null) => void;
  nuevaConversacion: (pid?: string, eid?: string) => string;
  renombrarConversacion: (convId: string, nuevoTitulo: string) => void;
  eliminarConversacion: (convId: string) => void;
  enviarMensaje: (convId: string, text: string, files?: ArchivoItem[]) => Promise<void>;
  compartir: (convId: string, perfiles: string[]) => void;
  escribiendo: string | null;
  bandeja: ItemBandeja[];
  rol: (pid: string) => ReturnType<typeof rolDe>;
  puede: (pid: string) => ReturnType<typeof permisos>;
}

const Ctx = createContext<ProcessCtx | null>(null);
export const useProcess = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useProcess debe usarse dentro de ProcessProvider');
  return c;
};

export function ProcessProvider({ children }: { children: React.ReactNode }) {
  const { profile, view, go, addAudit } = useApp();
  const persona = profile.id;
  const visibles = useMemo(() => procesosVisibles(persona), [persona]);

  const [activo, setActivo] = useState<string | null>(null);
  const [pestana, setPestana] = useState<PestanaProceso>('flujo');
  const [ejecuciones, setEjecuciones] = useState<Ejecucion[]>(EJECUCIONES_INICIALES);
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});
  const [filas, setFilas] = useState<Record<string, Fila[]>>({});
  const [cambios, setCambios] = useState<Record<string, CambioCelda[]>>({});
  const [reportes, setReportes] = useState<Reporte[]>(REPORTES_INICIALES);
  const [envios, setEnvios] = useState<Envio[]>(ENVIOS_INICIALES);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>(cargarConversaciones);
  const [convActiva, setConvActiva] = useState<string | null>(null);
  const [escribiendo, setEscribiendo] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), []);
  useEffect(() => {
    try { window.localStorage.setItem(LS_KEY, JSON.stringify(conversaciones)); } catch { /* sin almacenamiento */ }
  }, [conversaciones]);
  const despues = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };

  const rol = useCallback((pid: string) => { const p = procesoPorId(pid); return p ? rolDe(persona, p) : 'Lector'; }, [persona]);
  const puede = useCallback((pid: string) => permisos(rol(pid)), [rol]);

  // ---------- Navegación ----------
  const abrir = useCallback((pid: string, p: PestanaProceso = 'flujo', eid?: string) => {
    setActivo(pid);
    setPestana(p);
    if (eid) setSeleccion(s => ({ ...s, [pid]: eid }));
    go('proceso');
  }, [go]);

  // ---------- Ejecuciones ----------
  const ejecucionActiva = useCallback((pid: string) => {
    const lista = ejecuciones.filter(e => e.procesoId === pid);
    return lista.find(e => e.id === seleccion[pid]) ?? lista[0];
  }, [ejecuciones, seleccion]);

  const seleccionarEjecucion = (pid: string, eid: string) => setSeleccion(s => ({ ...s, [pid]: eid }));

  const nuevaEjecucion = (pid: string) => {
    const p = procesoPorId(pid)!;
    const n = ejecuciones.filter(e => e.procesoId === pid).length + 1;
    const nueva: Ejecucion = {
      id: `${p.codigo}-N${n}`, procesoId: pid,
      fecha: p.versionado ? 'Octubre 2026' : p.dominio === 'Facturación' ? 'Noviembre 2026' : '27-oct-2026',
      version: p.versionado ? 'TX3' : undefined, publicadaXM: p.versionado ? 'Pendiente' : undefined,
      estado: 'En curso', pasoActual: p.workflow.nodes[0].data.label, iniciadaPor: profile.person,
    };
    setEjecuciones(e => [nueva, ...e]);
    setSeleccion(s => ({ ...s, [pid]: nueva.id }));
    addAudit(profile.person, `Inició la ejecución ${nueva.id} de ${p.nombre}`, 'v1', 'nucleo');
  };

  const editarFechaEjecucion = (eid: string, nuevaFecha: string, nuevaVersion?: RegulatoryVersion) => {
    if (!nuevaFecha.trim()) return;
    setEjecuciones(es => es.map(e => e.id === eid ? { ...e, fecha: nuevaFecha.trim(), version: nuevaVersion ?? e.version } : e));
    addAudit(profile.person, `Actualizó fecha de ejecución ${eid} a ${nuevaFecha}${nuevaVersion ? ' · ' + nuevaVersion : ''}`, 'v1', 'cliente');
  };

  const registrarAprobacionPaso = (pid: string, label: string) => {
    const ej = ejecucionActiva(pid);
    const p = procesoPorId(pid)!;
    const idx = p.workflow.nodes.findIndex(n => n.data.label === label);
    const siguiente = p.workflow.nodes[idx + 1]?.data.label ?? label;
    setEjecuciones(es => es.map(e => e.id === ej.id ? { ...e, estado: p.entidad ? 'En curso' : 'Completada', pasoActual: siguiente } : e));
  };

  // ---------- Datos ----------
  const filasDe = useCallback((pid: string, eid: string) => filas[clave(pid, eid)] ?? procesoPorId(pid)!.filas, [filas]);
  const cambiosDe = useCallback((pid: string, eid: string) => cambios[clave(pid, eid)] ?? [], [cambios]);

  const marcarReportes = (pid: string, eid: string) => {
    setReportes(rs => rs.map(r => r.procesoId === pid && r.ejecucionId === eid && r.estado === 'Vivo' ? { ...r, estado: 'Desactualizado' } : r));
    despues(1600, () => setReportes(rs => rs.map(r => r.procesoId === pid && r.ejecucionId === eid && r.estado === 'Desactualizado'
      ? { ...r, estado: 'Vivo', version: r.version + 1, fecha: ahora(), generadoPor: 'Actualizado por el agente' } : r)));
  };

  const editarCelda = (pid: string, eid: string, filaId: string, col: string, valor: string | number, motivo?: string) => {
    const k = clave(pid, eid);
    const actuales = filasDe(pid, eid);
    const anterior = actuales.find(f => f.id === filaId)?.[col] ?? '';
    if (anterior === valor) return;
    const nuevas = actuales.map(f => {
      if (f.id !== filaId) return f;
      const g: Fila = { ...f, [col]: valor };
      if (col === 'calc' || col === 'ref') g.diff = Number(g.calc) - Number(g.ref);
      return g;
    });
    setFilas(s => ({ ...s, [k]: nuevas }));
    setCambios(s => ({ ...s, [k]: [{ filaId, columna: col, anterior, nuevo: valor, quien: profile.person, cuando: ahora(), motivo }, ...(s[k] ?? [])] }));
    addAudit(profile.person, `Editó ${col} de ${filaId} en ${pid}: ${anterior} → ${valor}`, 'v1', 'cliente');
    marcarReportes(pid, eid);
  };

  const importarFilas = (pid: string, eid: string, nuevas: Fila[]) => {
    setFilas(s => ({ ...s, [clave(pid, eid)]: nuevas }));
    addAudit(profile.person, `Importó ${nuevas.length} filas desde Excel en ${pid}`, 'v1', 'cliente');
    marcarReportes(pid, eid);
  };

  // ---------- Reportes ----------
  const crearReporteDesdePlantilla = (pid: string, eid: string, titulo: string, tipo: Reporte['tipo']) => {
    const nuevo: Reporte = {
      id: `REP-${Date.now() % 100000}`,
      procesoId: pid,
      ejecucionId: eid,
      titulo,
      tipo,
      estado: 'Vivo',
      version: 1,
      fecha: ahora(),
      generadoPor: 'Actualizado por el agente',
    };
    setReportes(rs => [nuevo, ...rs]);
    addAudit(profile.person, `Creó reporte desde plantilla "${titulo}" (${tipo})`, 'v1', 'cliente');
  };

  const actualizarReporte = (id: string) => {
    setReportes(rs => rs.map(r => r.id === id ? { ...r, estado: 'Desactualizado' } : r));
    despues(1200, () => setReportes(rs => rs.map(r => r.id === id ? { ...r, estado: 'Vivo', version: r.version + 1, fecha: ahora(), generadoPor: 'Actualizado por el agente' } : r)));
  };
  const congelarReporte = (id: string) => {
    const r = reportes.find(x => x.id === id);
    if (!r) return;
    const congelado: Reporte = {
      ...r, id: `${r.id}-C${Date.now() % 10000}`, estado: 'Congelado', fecha: ahora(), generadoPor: profile.person,
      formato: r.tipo === 'tabla' ? 'xlsx' : 'pdf', snapshot: filasDe(r.procesoId, r.ejecucionId),
    };
    setReportes(rs => [congelado, ...rs]);
    addAudit(profile.person, `Congeló el reporte "${r.titulo}" (v${r.version})`, `v${r.version}`, 'cliente');
  };

  // ---------- Cierre y soportes (Envíos) ----------
  const pasarA = (id: string, estado: EstadoEnvio, extra: Partial<Envio> = {}, quien = 'Sistema') =>
    setEnvios(es => es.map(e => e.id === id ? { ...e, ...extra, estado, historial: [...e.historial, { estado, fecha: ahora(), quien }] } : e));

  const generarSoporteCierre = (pid: string, eid: string) => {
    const p = procesoPorId(pid)!;
    const ej = ejecuciones.find(x => x.id === eid) ?? ejecucionActiva(pid);
    const entidad = p.entidad ?? 'Agente';
    const docBase = p.documentoEnvio ?? `Acta y soporte de cierre · ${p.nombre}`;
    const nuevo: Envio = {
      id: `SOP-${Date.now() % 100000}`,
      procesoId: pid,
      ejecucionId: ej.id,
      entidad,
      documento: `${docBase} · ${ej.fecha}${ej.version ? ' ' + ej.version : ''}`,
      estado: 'Preparado',
      reintentos: 0,
      historial: [{ estado: 'Preparado', fecha: ahora(), quien: `${p.workflow.agentName} (${profile.person})` }],
    };
    setEnvios(es => [nuevo, ...es]);
    addAudit(profile.person, `Generó soporte de cierre ${nuevo.id} para ${p.nombre}`, 'v1', 'nucleo');
  };

  const cadena = (env: Envio, rechazar = false) => {
    despues(900, () => pasarA(env.id, 'Enviado'));
    despues(1900, () => pasarA(env.id, 'Acuse recibido', {
      radicado: env.entidad === 'DIAN' ? `CUFE ${Math.random().toString(16).slice(2, 10)}…` : env.entidad === 'Agente' ? `ACTA-${Math.floor(10000 + Math.random() * 9000)}` : `XM-${Math.floor(90000 + Math.random() * 9000)}`,
      evidencia: env.entidad === 'DIAN' ? 'Acuse DIAN: documento recibido' : env.entidad === 'Agente' ? 'Acta interna firmada y archivada en auditoría' : 'Acuse XM: archivo recibido',
    }, env.entidad));
    despues(3000, () => {
      if (rechazar) {
        pasarA(env.id, 'Rechazado', { motivoRechazo: env.entidad === 'DIAN' ? 'Rechazo DIAN: NIT del adquiriente no coincide con el RUT.' : 'Rechazo XM: formato horario inválido en 2 registros.' }, env.entidad);
        setEjecuciones(es => es.map(e => e.id === env.ejecucionId ? { ...e, estado: 'Con error' } : e));
        return;
      }
      pasarA(env.id, 'Aceptado', {}, env.entidad);
      setEjecuciones(es => es.map(e => e.id === env.ejecucionId ? { ...e, estado: 'Completada', pasoActual: procesoPorId(env.procesoId)!.workflow.nodes.slice(-1)[0].data.label } : e));
    });
  };

  const aprobarEnvio = (id: string, simularRechazo = false) => {
    const env = envios.find(e => e.id === id);
    if (!env || !puede(env.procesoId).aprobar) return;
    setEjecuciones(es => es.map(e => e.id === env.ejecucionId && e.estado === 'Esperando aprobación' ? { ...e, estado: 'En curso' } : e));
    pasarA(id, 'Aprobado', {}, profile.person);
    addAudit(profile.person, `Aprobó soporte y cierre ${id} (${env.entidad})`, 'v1', 'nucleo');
    cadena(env, simularRechazo);
  };
  const rechazarEnvio = (id: string, motivo: string) => pasarA(id, 'Rechazado', { motivoRechazo: motivo, evidencia: 'Acuse con código de rechazo' });
  const reenviar = (id: string) => {
    const env = envios.find(e => e.id === id);
    if (!env || !puede(env.procesoId).aprobar) return;
    pasarA(id, 'Aprobado', { reintentos: env.reintentos + 1, motivoRechazo: undefined }, profile.person);
    addAudit(profile.person, `Regeneró y reenvió soporte ${id} (reintento ${env.reintentos + 1})`, 'v1', 'nucleo');
    cadena(env);
  };

  // ---------- Conversaciones ----------
  const misConversaciones = useMemo(
    () => conversaciones.filter(c => c.dueno === persona || c.compartidaCon.includes(persona)),
    [conversaciones, persona]
  );

  const nuevaConversacion = (pid?: string, eid?: string) => {
    const resolvedPid = pid ?? activo ?? visibles[0]?.id ?? PROCESOS[0].id;
    const p = procesoPorId(resolvedPid);
    const resolvedEid = eid ?? ejecucionActiva(resolvedPid).id;
    const c: Conversacion = {
      id: `CONV-${Date.now()}`, dueno: persona, duenoPersona: profile.person, procesoId: resolvedPid, ejecucionId: resolvedEid,
      titulo: p ? `Conversación · ${p.nombre}` : 'Nueva conversación', mensajes: [], compartidaCon: [], actualizada: ahora(),
    };
    setConversaciones(cs => [c, ...cs]);
    setConvActiva(c.id);
    return c.id;
  };

  const renombrarConversacion = (convId: string, nuevoTitulo: string) => {
    const limpio = nuevoTitulo.trim();
    if (!limpio) return;
    setConversaciones(cs => cs.map(c => c.id === convId ? { ...c, titulo: limpio, actualizada: ahora() } : c));
  };

  const eliminarConversacion = (convId: string) => {
    setConversaciones(cs => {
      const restantes = cs.filter(c => c.id !== convId);
      if (convActiva === convId) {
        const siguientesMias = restantes.filter(c => c.dueno === persona || c.compartidaCon.includes(persona));
        setConvActiva(siguientesMias[0]?.id ?? null);
      }
      return restantes;
    });
  };

  const enviarMensaje = async (convId: string, text: string, files?: ArchivoItem[]) => {
    const conv = conversaciones.find(c => c.id === convId);
    const user: ChatMsg = { role: 'user', text, files };
    setConversaciones(cs => cs.map(c => c.id === convId
      ? { ...c, mensajes: [...c.mensajes, user], actualizada: ahora(), titulo: c.mensajes.length === 0 && c.titulo.startsWith('Conversación ·') ? text.slice(0, 60) : c.titulo }
      : c));
    setEscribiendo(convId);
    const p = conv?.procesoId ? procesoPorId(conv.procesoId) : undefined;
    const ej = p && conv?.ejecucionId ? ejecuciones.find(e => e.id === conv.ejecucionId) : undefined;
    const contexto = p ? `${p.nombre} · ejecución ${ej?.fecha ?? ''}${ej?.version ? ' ' + ej.version : ''} · paso actual: ${ej?.pasoActual ?? ''}` : 'general';
    try {
      const reply = await askAgent(text, conv?.mensajes ?? [], files ?? [], undefined, undefined, contexto, conv?.procesoId, conv?.ejecucionId);
      setConversaciones(cs => cs.map(c => c.id === convId
        ? { ...c, mensajes: [...c.mensajes, { role: 'agent', text: reply.text, reply }], actualizada: ahora() } : c));
    } finally {
      setEscribiendo(null);
    }
  };

  const compartir = (convId: string, perfiles: string[]) =>
    setConversaciones(cs => cs.map(c => c.id === convId ? { ...c, compartidaCon: perfiles } : c));

  // Preguntas lanzadas desde otras partes de la app (buscador, botones "preguntar al agente")
  const ref = useRef({ view, activo, visibles, ejecucionActiva, misConversaciones, nuevaConversacion, enviarMensaje, abrir, go });
  ref.current = { view, activo, visibles, ejecucionActiva, misConversaciones, nuevaConversacion, enviarMensaje, abrir, go };
  useEffect(() => {
    const h = (ev: Event) => {
      const { text, files } = (ev as CustomEvent).detail as { text: string; files?: ArchivoItem[] };
      const r = ref.current;
      const targetPid = (r.view === 'proceso' && r.activo) ? r.activo : (r.activo ?? r.visibles[0]?.id ?? PROCESOS[0].id);
      const eid = r.ejecucionActiva(targetPid).id;
      const existente = r.misConversaciones.find(c => c.procesoId === targetPid && c.ejecucionId === eid);
      const id = existente?.id ?? r.nuevaConversacion(targetPid, eid);
      setConvActiva(id);
      r.abrir(targetPid, 'chat', eid);
      r.enviarMensaje(id, text, files);
    };
    window.addEventListener('enersinc:ask', h);
    return () => window.removeEventListener('enersinc:ask', h);
  }, []);

  // ---------- Bandeja ----------
  const bandeja = useMemo<ItemBandeja[]>(() => {
    const items: ItemBandeja[] = [];
    for (const p of visibles) {
      if (!permisos(rolDe(persona, p)).aprobar) continue;
      for (const e of ejecuciones.filter(x => x.procesoId === p.id && x.estado === 'Esperando aprobación')) {
        items.push({ id: `paso-${e.id}`, tipo: 'paso', proceso: p, ejecucion: e, titulo: e.pasoActual, detalle: `${p.nombre} · ${e.fecha}${e.version ? ' ' + e.version : ''}` });
      }
      for (const env of envios.filter(x => x.procesoId === p.id && x.estado === 'Preparado')) {
        const e = ejecuciones.find(x => x.id === env.ejecucionId)!;
        if (e.estado === 'Esperando aprobación') continue;
        items.push({ id: `env-${env.id}`, tipo: 'envio', proceso: p, ejecucion: e, titulo: `Aprobar soporte y cierre (${env.entidad})`, detalle: env.documento });
      }
    }
    return items;
  }, [visibles, ejecuciones, envios, persona]);

  const value: ProcessCtx = {
    visibles, activo, pestana, abrir, setPestana, ejecuciones, ejecucionActiva, seleccionarEjecucion, nuevaEjecucion,
    editarFechaEjecucion, registrarAprobacionPaso, filasDe, cambiosDe, editarCelda, importarFilas, reportes,
    crearReporteDesdePlantilla, actualizarReporte, congelarReporte, envios, generarSoporteCierre, aprobarEnvio,
    rechazarEnvio, reenviar, conversaciones, misConversaciones, convActiva, setConvActiva, nuevaConversacion,
    renombrarConversacion, eliminarConversacion, enviarMensaje, compartir, escribiendo, bandeja, rol, puede,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { PROCESOS };
