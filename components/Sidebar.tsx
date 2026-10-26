import React, { useState } from 'react';
import {
  Inbox, Bot, CalendarClock, Workflow, LayoutGrid, FileStack, Plus, ChevronDown, ChevronRight, X,
  Radio, Activity, Users, Sigma, BookOpen, LineChart, Gavel, ShieldAlert, Factory, Droplets, Settings,
  TrendingUp, Clock, FolderOpen, Puzzle, Cpu, LifeBuoy, Search, MessagesSquare, Pencil, Trash2, Check,
} from 'lucide-react';
import { useApp } from './context';
import { useProcess } from './process/ProcessStore';
import { PROFILES, Profile, VIEWS, ViewId } from '../data/mock';
import { DOMINIOS } from '../data/process/types';
import { procesoPorId } from '../data/process/catalog';

export const ICONS: Record<ViewId, React.ElementType> = {
  bandeja: Inbox,
  agentes: Bot,
  tareas: CalendarClock,
  artefactos: FileStack,
  despacho_prog_real: TrendingUp,
  despacho_redespacho: Clock,
  despacho_intradiario: LineChart,
  motor: Sigma,
  usuarios: Users,
  fronteras: Radio,
  aenc: Activity,
  informe_anual: FileStack,
  contratos: BookOpen,
  posicion: LineChart,
  sicep: Gavel,
  riesgo: ShieldAlert,
  escenarios: Droplets,
  supervision: Factory,
  mercado: Droplets,
  plugins: Puzzle,
  integraciones: Cpu,
  archivos: FolderOpen,
  soporte: LifeBuoy,
  admin: Settings,
  proceso: Workflow,
  mis_conversaciones: MessagesSquare,
  equipos: Users,
};

/** 4. Tableros (no son procesos): solo consulta, sin las siete pestañas. */
const TABLEROS: ViewId[] = [
  'mercado',
  'posicion',
  'riesgo',
  'escenarios',
  'supervision',
  'contratos',
  'fronteras',
];

/** 6. Plataforma: Agentes y skills, Plugins, Integraciones, Archivos, Soporte y Administración. */
const PLATAFORMA: ViewId[] = [
  'agentes',
  'plugins',
  'integraciones',
  'archivos',
  'soporte',
  'admin',
];

const DOT: Record<string, string> = {
  'Esperando aprobación': 'bg-[#E0A040]',
  'En curso': 'bg-[#6F93E8]',
  Completada: 'bg-[#3BB58F]',
  'Con error': 'bg-[#E0675B]',
};

const ESTADO_CORTO: Record<string, string> = {
  'Esperando aprobación': 'Por aprobar',
  'En curso': 'En curso',
  Completada: 'Completada',
  'Con error': 'Con error',
};

function Item({ v, count, label }: { v: ViewId; count?: number; label?: string }) {
  const { view, go } = useApp();
  const Icon = ICONS[v] || LayoutGrid;
  const active = view === v;
  return (
    <button
      onClick={() => go(v)}
      aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13.5px] text-left ${
        active ? 'bg-white/10 text-white' : 'text-[#B9C4D4] hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={15} className="shrink-0" />
      <span className="flex-1 truncate">{label ?? VIEWS[v].label}</span>
      {count ? <span className="num text-[11px] rounded bg-warn text-white px-1.5">{count}</span> : null}
    </button>
  );
}

function Section({
  title,
  children,
  action,
  plegable = false,
  inicial = true,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  plegable?: boolean;
  inicial?: boolean;
}) {
  const [abierta, setAbierta] = useState(inicial);
  return (
    <div className="mt-4 first:mt-2">
      <div className="flex items-center justify-between px-2.5 mb-1">
        {plegable ? (
          <button
            onClick={() => setAbierta(a => !a)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase text-[#7F8DA3] hover:text-white"
            aria-expanded={abierta}
          >
            {abierta ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {title}
          </button>
        ) : (
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#7F8DA3]">{title}</span>
        )}
        {action}
      </div>
      {abierta && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

export default function Sidebar({ open, onClose, onSwitch }: { open: boolean; onClose: () => void; onSwitch: (p: Profile) => void }) {
  const { profile, go, view, brand } = useApp();
  const {
    visibles,
    bandeja,
    abrir,
    activo,
    ejecuciones,
    ejecucionActiva,
    misConversaciones,
    convActiva,
    setConvActiva,
    nuevaConversacion,
    renombrarConversacion,
    eliminarConversacion,
    rol,
  } = useProcess();
  const [menu, setMenu] = useState(false);
  const [busquedaConv, setBusquedaConv] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitulo, setEditTitulo] = useState('');

  const qConv = busquedaConv.trim().toLowerCase();
  const conversacionesFiltradas = misConversaciones.filter(c => {
    if (!qConv) return true;
    const pNombre = c.procesoId ? procesoPorId(c.procesoId)?.nombre ?? '' : '';
    const ej = c.ejecucionId ? ejecuciones.find(x => x.id === c.ejecucionId) : undefined;
    const ejTexto = ej ? `${ej.fecha} ${ej.version ?? ''}` : '';
    return `${c.titulo} ${pNombre} ${ejTexto}`.toLowerCase().includes(qConv);
  });

  const etiquetaContextoConv = (pid?: string, eid?: string) => {
    if (!pid) return 'General';
    const p = procesoPorId(pid);
    const ej = eid ? ejecuciones.find(x => x.id === eid) : undefined;
    const ejLabel = ej ? `${ej.fecha}${p?.versionado && ej.version ? ' · ' + ej.version : ''}` : '';
    return `${p?.nombre ?? pid}${ejLabel ? ' · ' + ejLabel : ''}`;
  };

  const guardarRenombrado = (id: string) => {
    if (editTitulo.trim()) {
      renombrarConversacion(id, editTitulo.trim());
    }
    setEditId(null);
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside
        style={{ backgroundColor: brand.colorSecundario || '#0F1E33' }}
        className={`fixed lg:static z-40 inset-y-0 left-0 w-[276px] shrink-0 text-white flex flex-col transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{ backgroundColor: brand.colorPrimario || '#2459D6' }}
              className="w-7 h-7 rounded-md grid place-items-center font-bold text-sm shrink-0"
            >
              {brand.logoIcon || 'E'}
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-semibold text-[13.5px] truncate">{brand.nombreProducto || 'Enersinc OS'}</div>
              <div className="text-[10px] text-[#8C9BB0] truncate">Mercado Mayorista (MEM · XM)</div>
            </div>
          </div>
          <button className="lg:hidden text-[#B9C4D4] p-1" onClick={onClose} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 pb-4 pt-1">
          {/* 1. Mi bandeja */}
          <Section title="1. Mi bandeja">
            <Item v="bandeja" count={bandeja.length} />
          </Section>

          {/* 2. Procesos */}
          <Section title="2. Procesos">
            {DOMINIOS.map(d => {
              const ps = visibles.filter(p => p.dominio === d);
              if (!ps.length) return null;
              return (
                <div key={d} className="mb-1.5">
                  <div className="px-2.5 pt-1 text-[10.5px] font-medium text-[#66758C]">{d}</div>
                  {ps.map(p => {
                    const e = ejecucionActiva(p.id);
                    const act = view === 'proceso' && activo === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => abrir(p.id)}
                        aria-current={act ? 'page' : undefined}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] text-left ${
                          act ? 'bg-white/10 text-white' : 'text-[#B9C4D4] hover:bg-white/5 hover:text-white'
                        }`}
                        title={`${e.estado} · su rol: ${rol(p.id)}`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${DOT[e.estado]}`} />
                        <span className="flex-1 truncate">{p.nombre}</span>
                        <span className="text-[10px] text-[#8C9BB0] shrink-0">{ESTADO_CORTO[e.estado] ?? e.estado}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </Section>

          {/* 3. Mis conversaciones */}
          <Section
            title="3. Mis conversaciones"
            plegable
            action={
              <button
                className="inline-flex items-center gap-1 text-[11px] text-[#9DB4EE] hover:text-white"
                onClick={() => {
                  const targetPid = activo ?? visibles[0]?.id;
                  const targetEid = targetPid ? ejecucionActiva(targetPid).id : undefined;
                  const id = nuevaConversacion(targetPid, targetEid);
                  setConvActiva(id);
                  if (targetPid) abrir(targetPid, 'chat', targetEid);
                }}
                title="Nueva conversación"
              >
                <Plus size={12} /> Nueva
              </button>
            }
          >
            <div className="px-2 pb-1">
              <label className="flex items-center gap-1.5 bg-white/5 rounded px-2 py-1 text-[12px] text-[#B9C4D4]">
                <Search size={12} className="shrink-0" />
                <input
                  value={busquedaConv}
                  onChange={e => setBusquedaConv(e.target.value)}
                  placeholder="Buscar conversación..."
                  aria-label="Buscar en mis conversaciones"
                  className="bg-transparent outline-none flex-1 text-white placeholder:text-[#7F8DA3] text-[12px]"
                />
              </label>
            </div>
            {conversacionesFiltradas.map(c => {
              const isAct = view === 'proceso' && convActiva === c.id;
              if (editId === c.id) {
                return (
                  <div key={c.id} className="px-2 py-1.5 bg-white/10 rounded-md flex items-center gap-1">
                    <input
                      value={editTitulo}
                      onChange={e => setEditTitulo(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') guardarRenombrado(c.id);
                        if (e.key === 'Escape') setEditId(null);
                      }}
                      autoFocus
                      aria-label="Renombrar conversación"
                      className="flex-1 min-w-0 bg-white text-txt rounded px-1.5 py-0.5 text-xs outline-none"
                    />
                    <button
                      onClick={() => guardarRenombrado(c.id)}
                      className="p-1 text-[#3BB58F] hover:text-white"
                      title="Guardar"
                      aria-label="Guardar"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="p-1 text-[#B9C4D4] hover:text-white"
                      title="Cancelar"
                      aria-label="Cancelar"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={c.id}
                  className={`group flex items-start gap-1 px-2.5 py-1.5 rounded-md text-[12.5px] ${
                    isAct ? 'bg-white/10 text-white' : 'text-[#B9C4D4] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <button
                    onClick={() => {
                      setConvActiva(c.id);
                      if (c.procesoId) {
                        abrir(c.procesoId, 'chat', c.ejecucionId);
                      } else {
                        go('mis_conversaciones');
                      }
                    }}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="block truncate font-medium">{c.titulo}</span>
                    <span className="block text-[10.5px] text-[#8C9BB0] truncate">
                      {etiquetaContextoConv(c.procesoId, c.ejecucionId)}
                      {c.dueno !== profile.id ? ' · compartida' : ''}
                    </span>
                  </button>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0 mt-0.5">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setEditId(c.id);
                        setEditTitulo(c.titulo);
                      }}
                      className="p-1 text-[#8C9BB0] hover:text-white rounded"
                      title="Renombrar conversación"
                      aria-label={`Renombrar ${c.titulo}`}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        eliminarConversacion(c.id);
                      }}
                      className="p-1 text-[#8C9BB0] hover:text-[#E0675B] rounded"
                      title="Eliminar conversación"
                      aria-label={`Eliminar ${c.titulo}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
            {conversacionesFiltradas.length === 0 && (
              <p className="px-2.5 text-[11.5px] text-[#7F8DA3]">Sin conversaciones coincidentes.</p>
            )}
          </Section>

          {/* 4. Tableros */}
          <Section title="4. Tableros" plegable>
            {TABLEROS.map(v => (
              <Item key={v} v={v} />
            ))}
          </Section>

          {/* 5. Equipos */}
          <Section title="5. Equipos">
            <Item v="equipos" />
          </Section>

          {/* 6. Plataforma */}
          <Section title="6. Plataforma" plegable>
            {PLATAFORMA.map(v => (
              <Item key={v} v={v} />
            ))}
          </Section>
        </nav>

        <div className="relative border-t border-white/10 p-2.5">
          <button
            onClick={() => setMenu(m => !m)}
            className="w-full flex items-center gap-2 rounded-md p-1.5 hover:bg-white/5 text-left"
            aria-expanded={menu}
          >
            <span
              style={{ backgroundColor: brand.colorPrimario || '#2459D6' }}
              className="w-7 h-7 rounded-full grid place-items-center text-xs font-semibold shrink-0"
            >
              {profile.initials}
            </span>
            <span className="flex-1 min-w-0 leading-tight">
              <span className="block text-xs font-medium truncate">{profile.person}</span>
              <span className="block text-[10.5px] text-[#8C9BB0] truncate">{profile.role}</span>
            </span>
            <ChevronDown size={14} className="text-[#8C9BB0]" />
          </button>
          {menu && (
            <div className="absolute bottom-full left-2 right-2 mb-2 bg-white text-txt rounded-lg shadow-xl border border-line overflow-hidden z-50">
              <div className="px-3 py-2 text-[11px] font-semibold text-mut border-b border-line uppercase tracking-wider">
                Ver el producto como
              </div>
              {PROFILES.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSwitch(p);
                    setMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-paper ${
                    p.id === profile.id ? 'font-semibold text-brand' : ''
                  }`}
                >
                  <div className="font-medium">{p.person}</div>
                  <div className="text-[11px] text-mut">{p.role}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
