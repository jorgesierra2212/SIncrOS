import React, { useState } from 'react';
import { Send, RotateCcw, Check, FileText, ShieldCheck, FilePlus2, Download } from 'lucide-react';
import { useProcess } from '../ProcessStore';
import { Btn, StatusBadge } from '../../ui';
import { SECUENCIA_ENVIO } from '../../../data/process/types';
import { exportArtifactToPDF } from '../../../utils/export';
import type { Ejecucion, Envio, ProcesoDef } from '../../../data/process/types';

const ETIQUETA_PASO: Record<string, string> = {
  Preparado: 'Soporte generado',
  Aprobado: 'Aprobado',
  Enviado: 'Radicado / Cerrado',
  'Acuse recibido': 'Acuse / Firma',
  Aceptado: 'Cerrado OK',
  Rechazado: 'Observado / Rechazado',
};

function Linea({ env }: { env: Envio }) {
  const rechazado = env.estado === 'Rechazado';
  const alcanzados = new Set(env.historial.map(h => h.estado));
  const pasos = rechazado ? [...SECUENCIA_ENVIO.slice(0, 4), 'Rechazado' as const] : SECUENCIA_ENVIO;
  return (
    <ol className="flex flex-wrap items-start gap-1">
      {pasos.map((s, i) => {
        const h = [...env.historial].reverse().find(x => x.estado === s);
        const ok = alcanzados.has(s);
        const color = s === 'Rechazado' ? 'bg-bad text-white' : ok ? 'bg-ok text-white' : 'bg-paper text-mut border border-line';
        return (
          <li key={s} className="flex items-start gap-1">
            <div className="flex flex-col items-center w-[112px]">
              <span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-semibold ${color}`}>{ok ? <Check size={14} /> : i + 1}</span>
              <span className="text-[11px] font-medium text-center mt-1 leading-tight">{ETIQUETA_PASO[s] ?? s}</span>
              {h && <span className="text-[10px] text-mut text-center">{h.fecha}<br />{h.quien}</span>}
            </div>
            {i < pasos.length - 1 && <span className={`mt-3.5 h-0.5 w-4 ${alcanzados.has(pasos[i + 1]) ? 'bg-ok' : 'bg-line'}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export default function EnviosTab({ p, ej }: { p: ProcesoDef; ej: Ejecucion }) {
  const { envios, generarSoporteCierre, aprobarEnvio, reenviar, puede } = useProcess();
  const [todas, setTodas] = useState(false);
  const [simular, setSimular] = useState(false);
  const perm = puede(p.id);

  const lista = envios.filter(e => e.procesoId === p.id && (todas || e.ejecucionId === ej.id));
  const destino = p.entidad ?? 'Archivo interno / Comité de cierre';
  const docTipo = p.documentoEnvio ?? `Acta y expediente de soporte · ${p.nombre}`;

  const descargarSoporte = (env: Envio) => {
    exportArtifactToPDF(
      env.documento,
      [
        `Proceso: ${p.nombre} (${p.codigo})`,
        `Ejecución: ${ej.fecha}${ej.version ? ' · ' + ej.version : ''}`,
        `Destino / Cierre: ${env.entidad}`,
        `Estado: ${env.estado}`,
        `Radicado / CUFE / Acta: ${env.radicado ?? 'Pendiente de firma'}`,
        `Evidencia: ${env.evidencia ?? 'Soporte técnico validado'}`,
        ...env.historial.map(h => `${h.fecha} · ${ETIQUETA_PASO[h.estado] ?? h.estado} · ${h.quien}`),
      ],
      `${env.id}.pdf`
    );
  };

  return (
    <div className="space-y-3">
      <div className="bg-white border border-line rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 text-sm">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-txt">Cierre del proceso y generación de soportes oficiales</div>
          <div className="text-xs text-mut mt-0.5">
            Destino de cierre: <b className="text-txt">{destino}</b> · Entregable: <b className="text-txt">{docTipo}</b>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-xs text-mut">
            <input type="checkbox" checked={todas} onChange={e => setTodas(e.target.checked)} /> Ver todas las ejecuciones
          </label>
          {p.entidad && (
            <label className="inline-flex items-center gap-1.5 text-xs text-mut" title="Para demostración: simula una observación o rechazo de la entidad al radicar">
              <input type="checkbox" checked={simular} onChange={e => setSimular(e.target.checked)} /> Simular rechazo al radicar
            </label>
          )}
          <Btn small kind="primary" onClick={() => generarSoporteCierre(p.id, ej.id)}>
            <FilePlus2 size={14} /> Generar soporte de cierre
          </Btn>
        </div>
      </div>

      {lista.length === 0 && (
        <div className="bg-white border border-line rounded-lg p-6 text-sm text-mut flex flex-wrap items-center justify-between gap-3">
          <span>Aún no se ha generado el paquete de soporte para cerrar esta ejecución ({ej.fecha}{ej.version ? ' · ' + ej.version : ''}).</span>
          <Btn small kind="primary" onClick={() => generarSoporteCierre(p.id, ej.id)}>
            <FilePlus2 size={14} /> Generar soporte ahora
          </Btn>
        </div>
      )}

      {lista.map(env => (
        <div key={env.id} className="bg-white border border-line rounded-lg p-4">
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-mut">{env.id} · Destino: {env.entidad}{env.reintentos ? ` · revisiones: ${env.reintentos}` : ''}</div>
              <div className="font-medium flex items-center gap-1.5"><FileText size={14} className="text-brand" /> {env.documento}</div>
            </div>
            <StatusBadge s={env.estado} />
          </div>
          <div className="overflow-x-auto pb-1"><Linea env={env} /></div>
          <div className="grid sm:grid-cols-3 gap-2 mt-3 text-sm">
            <div className="bg-paper rounded px-3 py-2"><span className="text-mut text-xs block">Soporte generado</span>{env.documento}</div>
            <div className="bg-paper rounded px-3 py-2"><span className="text-mut text-xs block">Radicado, CUFE o Acta</span>{env.radicado ?? '—'}</div>
            <div className="bg-paper rounded px-3 py-2"><span className="text-mut text-xs block">Evidencia del cierre / acuse</span>{env.evidencia ?? 'Pendiente de aprobación'}</div>
          </div>
          {env.motivoRechazo && <div className="mt-2 text-sm bg-badsoft text-bad rounded px-3 py-2">Observación / rechazo: {env.motivoRechazo}</div>}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {env.estado === 'Preparado' && (perm.aprobar ? (
              <Btn kind="primary" onClick={() => aprobarEnvio(env.id, simular)}>
                <ShieldCheck size={14} /> {p.entidad ? `Aprobar soporte y radicar en ${p.entidad}` : 'Aprobar soporte y cerrar proceso'}
              </Btn>
            ) : (
              <span className="text-xs text-warn">El cierre requiere aprobación del rol Aprobador o Dueño.</span>
            ))}
            {env.estado === 'Rechazado' && (perm.aprobar ? (
              <Btn kind="primary" onClick={() => reenviar(env.id)}>
                <RotateCcw size={14} /> Regenerar soporte y reenviar
              </Btn>
            ) : (
              <span className="text-xs text-warn">Requiere el rol Aprobador para regenerar y reenviar.</span>
            ))}
            {['Aprobado', 'Enviado', 'Acuse recibido'].includes(env.estado) && (
              <span className="text-xs text-mut inline-flex items-center gap-1">
                <Send size={12} /> Registrando cierre y acuse con {env.entidad}…
              </span>
            )}
            <Btn small onClick={() => descargarSoporte(env)}>
              <Download size={13} /> Descargar soporte (PDF)
            </Btn>
          </div>
        </div>
      ))}
    </div>
  );
}
