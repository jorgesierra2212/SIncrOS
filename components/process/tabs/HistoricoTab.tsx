import React, { useState } from 'react';
import { Download, FileText, Folder } from 'lucide-react';
import { useProcess } from '../ProcessStore';
import { Badge, StatusBadge } from '../../ui';
import { descargarReporte } from './ReportesTab';
import { exportArtifactToPDF } from '../../../utils/export';
import type { Ejecucion, ProcesoDef } from '../../../data/process/types';

export default function HistoricoTab({ p }: { p: ProcesoDef; ej: Ejecucion }) {
  const { reportes, envios, ejecuciones } = useProcess();
  const [fecha, setFecha] = useState('Todas');
  const [version, setVersion] = useState('Todas');
  const [tipo, setTipo] = useState<'Todos' | 'Reportes' | 'Documentos enviados'>('Todos');
  const ejs = ejecuciones.filter(e => e.procesoId === p.id);
  const fechasUnicas = Array.from(new Set(ejs.map(e => e.fecha)));
  const versionesUnicas = Array.from(new Set(ejs.map(e => e.version).filter(Boolean))) as string[];

  const etiqueta = (eid: string) => {
    const e = ejs.find(x => x.id === eid);
    return e ? `${e.fecha}${p.versionado && e.version ? ' · ' + e.version : ''}` : eid;
  };

  const items = [
    ...reportes.filter(r => r.procesoId === p.id && r.estado === 'Congelado').map(r => {
      const ejObj = ejs.find(x => x.id === r.ejecucionId);
      return {
        id: r.id,
        clase: 'Reportes' as const,
        titulo: r.titulo,
        ej: r.ejecucionId,
        fechaOp: ejObj?.fecha ?? '',
        versionOp: ejObj?.version ?? '',
        fecha: r.fecha,
        quien: r.generadoPor,
        formato: r.formato ?? 'xlsx',
        estado: `v${r.version}`,
        descargar: () => descargarReporte(r, p, r.snapshot ?? p.filas),
      };
    }),
    ...envios.filter(e => e.procesoId === p.id && ['Aceptado', 'Rechazado'].includes(e.estado)).map(e => {
      const ejObj = ejs.find(x => x.id === e.ejecucionId);
      return {
        id: e.id,
        clase: 'Documentos enviados' as const,
        titulo: e.documento,
        ej: e.ejecucionId,
        fechaOp: ejObj?.fecha ?? '',
        versionOp: ejObj?.version ?? '',
        fecha: e.historial[e.historial.length - 1]?.fecha ?? '',
        quien: e.entidad,
        formato: e.entidad === 'DIAN' ? 'xml' : 'txt',
        estado: e.estado,
        descargar: () => exportArtifactToPDF(e.documento, [`Entidad: ${e.entidad}`, `Estado: ${e.estado}`, `Radicado: ${e.radicado ?? '—'}`, `Evidencia: ${e.evidencia ?? '—'}`, ...e.historial.map(h => `${h.fecha} · ${h.estado} · ${h.quien}`)], `${e.id}.pdf`),
      };
    }),
  ].filter(i =>
    (fecha === 'Todas' || i.fechaOp === fecha) &&
    (version === 'Todas' || i.versionOp === version) &&
    (tipo === 'Todos' || i.clase === tipo)
  );

  return (
    <div className="bg-white border border-line rounded-lg">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-line">
        <Folder size={15} className="text-brand" /><span className="text-sm font-semibold">Carpeta del proceso</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select value={fecha} onChange={e => setFecha(e.target.value)} className="text-sm border border-line rounded px-2 py-1" aria-label="Filtrar por fecha">
            <option value="Todas">Fecha: Todas</option>
            {fechasUnicas.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          {p.versionado && (
            <select value={version} onChange={e => setVersion(e.target.value)} className="text-sm border border-line rounded px-2 py-1" aria-label="Filtrar por versión">
              <option value="Todas">Versión: Todas</option>
              {versionesUnicas.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          )}
          <select value={tipo} onChange={e => setTipo(e.target.value as typeof tipo)} className="text-sm border border-line rounded px-2 py-1" aria-label="Filtrar por tipo">
            <option value="Todos">Tipo: Todos</option>
            <option value="Reportes">Reportes congelados</option>
            <option value="Documentos enviados">Documentos enviados</option>
          </select>
        </div>
      </div>
      <ul>
        {items.map(i => (
          <li key={i.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-line last:border-0 text-sm">
            <FileText size={16} className="text-mut shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{i.titulo}</div>
              <div className="text-xs text-mut">{etiqueta(i.ej)} · {i.fecha} · {i.quien}</div>
            </div>
            <Badge tone="neutral">{i.formato.toUpperCase()}</Badge>
            <Badge tone={i.clase === 'Reportes' ? 'brand' : 'neutral'}>{i.clase === 'Reportes' ? 'Reporte congelado' : 'Documento enviado'}</Badge>
            {i.clase === 'Documentos enviados' && <StatusBadge s={i.estado} />}
            <button onClick={i.descargar} className="text-brand hover:bg-brandsoft rounded p-1.5" aria-label={`Descargar ${i.titulo}`}><Download size={15} /></button>
          </li>
        ))}
        {items.length === 0 && <li className="px-4 py-6 text-sm text-mut">No hay documentos con esos filtros.</li>}
      </ul>
    </div>
  );
}
