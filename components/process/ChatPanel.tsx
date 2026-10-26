import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp, Paperclip, ChevronRight, ChevronDown, Loader2, Share2, Plus, X, FileSpreadsheet,
  Pencil, Trash2, Check, Sparkles
} from 'lucide-react';
import { useProcess } from './ProcessStore';
import { useApp } from '../context';
import { PROFILES } from '../../data/mock';
import { procesoPorId } from '../../data/process/catalog';
import type { ArchivoItem } from '../../data/types';
import type { ChatMsg } from '../../data/agentScript';

function Pasos({ steps }: { steps: string[] }) {
  const [open, setOpen] = useState(false);
  if (!steps?.length) return null;
  return (
    <div className="mt-1">
      <button onClick={() => setOpen(o => !o)} className="inline-flex items-center gap-1 text-xs text-mut hover:text-txt">
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />} Trayectoria · {steps.length} pasos
      </button>
      {open && <ol className="mt-1 ml-5 list-decimal text-xs text-mut space-y-0.5">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>}
    </div>
  );
}

function Mensaje({ m }: { m: ChatMsg }) {
  if (m.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="bg-brand text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[82%] text-[15px] shadow-2xs">{m.text}</div>
        {m.files?.length ? (
          <div className="flex gap-1">
            {m.files.map(f => (
              <span key={f.id} className="text-xs bg-paper border border-line rounded px-2 py-0.5">{f.nombre}</span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div className="bg-paper/60 border border-line/70 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[90%]">
      <div className="text-xs text-mut flex items-center gap-1.5">
        <Sparkles size={12} className="text-brand" />
        <span>Respondió <b className="text-txt font-medium">{m.reply?.agent ?? 'Agente del proceso'}</b></span>
      </div>
      {m.reply && <Pasos steps={m.reply.steps} />}
      <p className="text-[15px] leading-relaxed mt-1.5 text-txt whitespace-pre-line">{m.text}</p>
    </div>
  );
}

export default function ChatPanel({
  convId,
  procesoId,
  ejecucionId,
  preguntas = [],
  alto = 'h-[calc(100vh-225px)] min-h-[540px]',
}: {
  convId: string | null;
  procesoId?: string;
  ejecucionId?: string;
  preguntas?: string[];
  alto?: string;
}) {
  const {
    conversaciones,
    ejecuciones,
    nuevaConversacion,
    renombrarConversacion,
    eliminarConversacion,
    enviarMensaje,
    escribiendo,
    compartir,
  } = useProcess();
  const { profile } = useApp();
  const conv = conversaciones.find(c => c.id === convId) ?? null;

  const [texto, setTexto] = useState('');
  const [adjuntos, setAdjuntos] = useState<ArchivoItem[]>([]);
  const [compartirAbierto, setCompartirAbierto] = useState(false);
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [borradorTitulo, setBorradorTitulo] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end' });
  }, [conv?.mensajes.length, escribiendo]);

  useEffect(() => {
    setEditandoTitulo(false);
    setBorradorTitulo(conv?.titulo ?? '');
  }, [conv?.id, conv?.titulo]);

  const pidEfectivo = conv?.procesoId ?? procesoId;
  const eidEfectivo = conv?.ejecucionId ?? ejecucionId;
  const proc = pidEfectivo ? procesoPorId(pidEfectivo) : undefined;
  const ej = eidEfectivo ? ejecuciones.find(x => x.id === eidEfectivo) : undefined;

  const esDueno = conv ? conv.dueno === profile.id : true;
  const duenoNombre = conv ? PROFILES.find(p => p.id === conv.dueno)?.person : profile.person;

  const enviar = (t = texto) => {
    if (!t.trim() || escribiendo) return;
    const idDestino = conv?.id ?? nuevaConversacion(pidEfectivo, eidEfectivo);
    enviarMensaje(idDestino, t, adjuntos);
    setTexto('');
    setAdjuntos([]);
  };

  const guardarTitulo = () => {
    if (conv && borradorTitulo.trim()) {
      renombrarConversacion(conv.id, borradorTitulo.trim());
    }
    setEditandoTitulo(false);
  };

  const adjuntar = (files: FileList) => {
    const nuevos: ArchivoItem[] = Array.from(files).map((f, i) => ({
      id: `ADJ-${Date.now()}-${i}`,
      nombre: f.name,
      tipo: /\.pdf$/i.test(f.name) ? 'pdf' : /\.pptx?$/i.test(f.name) ? 'powerpoint' : 'excel',
      tamano: `${Math.max(1, Math.round(f.size / 1024))} KB`,
      fecha: 'Ahora',
      origen: 'Cargado por usuario',
    }));
    setAdjuntos(a => [...a, ...nuevos]);
  };

  return (
    <div className={`w-full flex flex-col bg-white border border-line rounded-xl shadow-2xs ${alto}`}>
      {/* Barra superior de la conversación a pantalla completa */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-line bg-paper/40">
        <div className="min-w-0 flex-1">
          {conv && editandoTitulo ? (
            <div className="flex items-center gap-1.5 max-w-xl">
              <input
                value={borradorTitulo}
                onChange={e => setBorradorTitulo(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') guardarTitulo();
                  if (e.key === 'Escape') setEditandoTitulo(false);
                }}
                autoFocus
                aria-label="Nuevo nombre de la conversación"
                className="flex-1 text-sm font-semibold border border-brand rounded px-2.5 py-1 bg-white outline-none"
              />
              <button
                onClick={guardarTitulo}
                className="p-1.5 rounded bg-brand text-white hover:bg-[#1D48B2]"
                title="Guardar nombre"
                aria-label="Guardar nombre"
              >
                <Check size={13} />
              </button>
              <button
                onClick={() => setEditandoTitulo(false)}
                className="p-1.5 rounded border border-line bg-white text-mut hover:text-txt"
                title="Cancelar"
                aria-label="Cancelar"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-txt truncate">
                {conv ? conv.titulo : `Nueva conversación · ${proc?.nombre ?? 'Agente del proceso'}`}
              </div>
              {conv && (
                <button
                  onClick={() => {
                    setBorradorTitulo(conv.titulo);
                    setEditandoTitulo(true);
                  }}
                  className="text-mut hover:text-brand p-1 rounded hover:bg-white transition-colors"
                  title="Renombrar conversación"
                  aria-label="Renombrar conversación"
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
          )}
          <div className="text-xs text-mut mt-0.5 flex flex-wrap items-center gap-x-2">
            {proc && (
              <span>
                Contexto: <b className="text-txt font-medium">{proc.nombre}</b>
                {ej ? ` (${ej.fecha}${proc.versionado && ej.version ? ' · ' + ej.version : ''})` : ''}
              </span>
            )}
            {conv && (
              <>
                <span>·</span>
                <span>
                  {esDueno ? 'Su conversación' : `De ${duenoNombre}, compartida con usted`} · actualizada {conv.actualizada}
                  {conv.compartidaCon.length > 0 && esDueno && ` · compartida con ${conv.compartidaCon.length}`}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => nuevaConversacion(pidEfectivo, eidEfectivo)}
            className="inline-flex items-center gap-1 text-xs font-medium border border-line bg-white rounded-md px-2.5 py-1.5 hover:border-brand hover:text-brand transition-colors"
          >
            <Plus size={13} /> Nueva conversación
          </button>

          {conv && esDueno && (
            <div className="relative">
              <button
                onClick={() => setCompartirAbierto(o => !o)}
                className="inline-flex items-center gap-1 text-xs border border-line bg-white rounded-md px-2.5 py-1.5 hover:bg-paper"
              >
                <Share2 size={12} /> Compartir
              </button>
              {compartirAbierto && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-line rounded-lg shadow-lg w-64 p-2">
                  <div className="text-xs text-mut px-1 pb-1">Compartir con</div>
                  {PROFILES.filter(p => p.id !== profile.id).map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm px-1 py-1 hover:bg-paper rounded">
                      <input
                        type="checkbox"
                        checked={conv.compartidaCon.includes(p.id)}
                        onChange={e =>
                          compartir(
                            conv.id,
                            e.target.checked
                              ? [...conv.compartidaCon, p.id]
                              : conv.compartidaCon.filter(x => x !== p.id)
                          )
                        }
                      />
                      {p.person} <span className="text-xs text-mut truncate">· {p.role}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {conv && (
            <button
              onClick={() => eliminarConversacion(conv.id)}
              className="inline-flex items-center gap-1 text-xs text-bad border border-bad/25 bg-badsoft/40 hover:bg-badsoft rounded-md px-2.5 py-1.5 transition-colors"
              title="Eliminar esta conversación"
              aria-label="Eliminar conversación"
            >
              <Trash2 size={13} /> Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Área de conversación centrada y amplia */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-5">
          {(!conv || conv.mensajes.length === 0) && (
            <div className="bg-paper/60 border border-line rounded-xl p-6 text-center my-6">
              <div className="w-10 h-10 rounded-full bg-brandsoft text-brand grid place-items-center mx-auto mb-3">
                <Sparkles size={20} />
              </div>
              <h3 className="text-base font-semibold text-txt">
                {proc ? `Pregunte al ${proc.workflow.agentName}` : 'Pregunte al agente del proceso'}
              </h3>
              <p className="text-sm text-mut mt-1 max-w-xl mx-auto">
                El agente tiene en contexto los pasos del flujo, las celdas editadas y la ejecución activa
                {ej ? ` (${ej.fecha}${proc?.versionado && ej.version ? ' · ' + ej.version : ''})` : ''}. Todas sus conversaciones quedan en el menú izquierdo bajo <b>Mis conversaciones</b>.
              </p>
              {preguntas.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {preguntas.map(p => (
                    <button
                      key={p}
                      onClick={() => enviar(p)}
                      className="text-[13px] bg-white border border-line rounded-full px-3.5 py-1.5 hover:border-brand hover:text-brand text-left transition-colors shadow-2xs"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {conv?.mensajes.map((m, i) => (
            <Mensaje key={i} m={m} />
          ))}

          {conv && escribiendo === conv.id && (
            <div className="flex items-center gap-2 text-sm text-mut">
              <Loader2 size={15} className="animate-spin text-brand" /> El agente está analizando los datos de la ejecución…
            </div>
          )}
          <div ref={finRef} />
        </div>
      </div>

      {/* Prompt a ancho completo en la parte inferior */}
      <div className="border-t border-line bg-paper/30 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {adjuntos.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {adjuntos.map(a => (
                <span key={a.id} className="inline-flex items-center gap-1 text-xs bg-white border border-line rounded px-2 py-0.5">
                  <FileSpreadsheet size={12} />
                  {a.nombre}
                  <button onClick={() => setAdjuntos(x => x.filter(y => y.id !== a.id))} aria-label="Quitar adjunto">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2.5 bg-white border border-line rounded-xl px-3.5 py-2.5 shadow-2xs focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2 text-mut hover:text-txt rounded-lg hover:bg-paper"
              aria-label="Adjuntar Excel, PDF o PowerPoint"
              title="Adjuntar archivo"
            >
              <Paperclip size={18} />
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,.pdf,.ppt,.pptx"
              hidden
              onChange={e => e.target.files && adjuntar(e.target.files)}
            />
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              rows={2}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              placeholder={
                proc
                  ? `Escriba su consulta o instrucción para ${proc.workflow.agentName} en esta ejecución…`
                  : 'Pregunte al agente de este proceso…'
              }
              aria-label="Mensaje"
              className="flex-1 resize-none px-1 py-1 text-[15px] outline-none bg-transparent"
            />
            <button
              onClick={() => enviar()}
              disabled={!texto.trim() || !!escribiendo}
              aria-label="Enviar"
              className="w-10 h-10 rounded-xl bg-brand text-white grid place-items-center hover:bg-[#1D48B2] disabled:opacity-40 transition-colors shrink-0"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
