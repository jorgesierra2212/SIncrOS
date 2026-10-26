import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { RefreshCw, Snowflake, Download, Maximize2, X, Bot, Loader2, Plus } from 'lucide-react';
import { useProcess } from '../ProcessStore';
import { Btn, StatusBadge } from '../../ui';
import { fmtValor } from '../DataGrid';
import { exportTableToExcel, exportArtifactToPDF } from '../../../utils/export';
import type { Ejecucion, Fila, ProcesoDef, Reporte } from '../../../data/process/types';

export function ContenidoReporte({ r, p, filas, grande = false }: { r: Reporte; p: ProcesoDef; filas: Fila[]; grande?: boolean }) {
  const cols = p.columnas.filter(c => ['concepto', 'calc', 'ref', 'diff', 'estado'].includes(c.key));
  const calc = p.columnas.find(c => c.key === 'calc')!;
  const ref = p.columnas.find(c => c.key === 'ref')!;
  const datos = filas.slice(0, grande ? 20 : 8).map(f => ({ nombre: String(f.concepto).split(/[·(-]/)[0].trim().slice(0, 16), [calc.label]: Number(f.calc), [ref.label]: Number(f.ref) }));
  const grafico = (
    <ResponsiveContainer width="100%" height={grande ? 360 : 200}>
      <BarChart data={datos} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="#E3E7EC" vertical={false} />
        <XAxis dataKey="nombre" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={grande ? 60 : 48} />
        <YAxis tick={{ fontSize: 10 }} width={84} tickFormatter={v => fmtValor(v, calc)} />
        <Tooltip formatter={(v: number) => fmtValor(v, calc)} contentStyle={{ fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey={calc.label} fill="#2459D6" />
        <Bar dataKey={ref.label} fill="#9DB4EE" />
      </BarChart>
    </ResponsiveContainer>
  );
  const tabla = (
    <table className="w-full text-xs">
      <thead><tr className="text-mut text-left">{cols.map(c => <th key={c.key} className={`py-1 pr-2 font-medium ${c.tipo !== 'texto' && c.tipo !== 'estado' ? 'text-right' : ''}`}>{c.label}</th>)}</tr></thead>
      <tbody>
        {filas.slice(0, grande ? 50 : 6).map(f => (
          <tr key={f.id} className="border-t border-line">
            {cols.map(c => <td key={c.key} className={`py-1 pr-2 ${c.tipo !== 'texto' && c.tipo !== 'estado' ? 'text-right num whitespace-nowrap' : ''}`}>{c.tipo === 'estado' ? <StatusBadge s={String(f[c.key])} /> : fmtValor(f[c.key], c)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
  if (r.tipo === 'grafico') return grafico;
  if (r.tipo === 'tabla') return tabla;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {p.workflow.summaryKpis.map(k => (
          <div key={k.label} className="bg-paper rounded px-2.5 py-1.5">
            <div className="text-[11px] text-mut">{k.label}</div>
            <div className={`text-sm font-semibold num ${k.tone === 'bad' ? 'text-bad' : k.tone === 'warn' ? 'text-warn' : ''}`}>{k.value}</div>
          </div>
        ))}
      </div>
      {grafico}
    </div>
  );
}

export function descargarReporte(r: Reporte, p: ProcesoDef, filas: Fila[]) {
  if (r.formato === 'pdf' || r.tipo !== 'tabla') {
    exportArtifactToPDF(r.titulo, filas.map(f => p.columnas.map(c => `${c.label}: ${fmtValor(f[c.key], c)}`).join(' · ')), `${r.id}.pdf`, { id: r.id, version: r.version, author: r.generadoPor, layer: 'Núcleo' });
  } else {
    exportTableToExcel(filas.map(f => Object.fromEntries(p.columnas.map(c => [c.label, f[c.key]]))), `${r.id}.xlsx`);
  }
}

export default function ReportesTab({ p, ej }: { p: ProcesoDef; ej: Ejecucion }) {
  const { reportes, filasDe, crearReporteDesdePlantilla, actualizarReporte, congelarReporte, puede } = useProcess();
  const [abierto, setAbierto] = useState<string | null>(null);
  const vivos = reportes.filter(r => r.procesoId === p.id && r.ejecucionId === ej.id && r.estado !== 'Congelado');
  const filas = filasDe(p.id, ej.id);
  const perm = puede(p.id);
  const ra = vivos.find(r => r.id === abierto);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-sm text-mut">Los reportes vivos se crean desde plantillas y el agente los actualiza cuando cambian los datos. Congelar guarda una copia fija en Histórico.</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-mut mr-1">Crear desde plantilla:</span>
          <Btn small onClick={() => crearReporteDesdePlantilla(p.id, ej.id, `Tabla de control · ${p.nombre}`, 'tabla')}><Plus size={12} /> Tabla</Btn>
          <Btn small onClick={() => crearReporteDesdePlantilla(p.id, ej.id, `Comparativo gráfico · ${p.nombre}`, 'grafico')}><Plus size={12} /> Gráfico</Btn>
          <Btn small onClick={() => crearReporteDesdePlantilla(p.id, ej.id, `Tablero ejecutivo · ${p.nombre}`, 'tablero')}><Plus size={12} /> Tablero</Btn>
        </div>
      </div>

      {vivos.length === 0 ? (
        <div className="bg-white border border-line rounded-lg p-6 text-sm text-mut">Esta ejecución no tiene reportes vivos. Cree uno desde una plantilla arriba o consulte los reportes congelados en Histórico.</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {vivos.map(r => (
            <div key={r.id} className="bg-white border border-line rounded-lg">
              <div className="flex items-start gap-2 px-4 py-3 border-b border-line">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{r.titulo}</div>
                  <div className="text-xs text-mut flex items-center gap-1 mt-0.5">
                    {r.estado === 'Desactualizado' ? (
                      <><Loader2 size={11} className="animate-spin" /> El agente está actualizando…</>
                    ) : (
                      <><Bot size={11} /> Actualizado por el agente · {r.fecha} · v{r.version}</>
                    )}
                  </div>
                </div>
                <StatusBadge s={r.estado} />
              </div>
              <div className={`p-4 ${r.estado === 'Desactualizado' ? 'opacity-50' : ''}`}><ContenidoReporte r={r} p={p} filas={filas} /></div>
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                <Btn small onClick={() => setAbierto(r.id)}><Maximize2 size={12} /> Abrir en panel derecho</Btn>
                <Btn small onClick={() => actualizarReporte(r.id)} disabled={r.estado === 'Desactualizado'}><RefreshCw size={12} /> Actualizar</Btn>
                <Btn small onClick={() => congelarReporte(r.id)} disabled={perm.aprobar === false && perm.editar === false} title="Crea una versión fija en Histórico"><Snowflake size={12} /> Congelar</Btn>
                <Btn small onClick={() => descargarReporte(r, p, filas)}><Download size={12} /> Descargar</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {ra && (
        <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-[560px] bg-white border-l border-line shadow-xl flex flex-col" aria-label="Reporte abierto">
          <div className="flex items-start gap-2 px-4 py-3 border-b border-line">
            <div className="flex-1">
              <div className="text-xs text-mut">{p.nombre} · {ej.fecha}{ej.version ? ' ' + ej.version : ''} · Actualizado por el agente · {ra.fecha} · v{ra.version}</div>
              <h3 className="font-semibold">{ra.titulo}</h3>
            </div>
            <button onClick={() => setAbierto(null)} aria-label="Cerrar"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4"><ContenidoReporte r={ra} p={p} filas={filas} grande /></div>
          <div className="flex gap-2 px-4 py-3 border-t border-line">
            <Btn small onClick={() => congelarReporte(ra.id)}><Snowflake size={12} /> Congelar</Btn>
            <Btn small onClick={() => descargarReporte(ra, p, filas)}><Download size={12} /> Descargar</Btn>
          </div>
        </aside>
      )}
    </>
  );
}
