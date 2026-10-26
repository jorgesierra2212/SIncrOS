import React, { useMemo, useState } from 'react';
import { CalendarDays, GitCompare } from 'lucide-react';
import { useProcess } from '../ProcessStore';
import { StatusBadge } from '../../ui';
import { fmtValor } from '../DataGrid';
import type { Ejecucion, ProcesoDef } from '../../../data/process/types';

const ORDEN = ['TX1', 'TX2', 'TX3', 'TXR', 'TXF'];
const FACTOR: Record<string, number> = { TX1: 0.985, TX2: 1, TX3: 1.002, TXR: 1.004, TXF: 1.005 };

function Versiones({ p, ej }: { p: ProcesoDef; ej: Ejecucion }) {
  const { ejecuciones, filasDe, seleccionarEjecucion } = useProcess();
  const propias = ejecuciones.filter(e => e.procesoId === p.id);
  const periodos = Array.from(new Set(propias.map(e => e.fecha)));
  const conVersion = propias.filter(e => e.version);
  const [a, setA] = useState(conVersion.find(e => e.version === 'TX1')?.id ?? conVersion[1]?.id ?? '');
  const [b, setB] = useState(ej.id);
  const ea = propias.find(e => e.id === a), eb = propias.find(e => e.id === b);
  const calc = p.columnas.find(c => c.key === 'calc')!;
  const filas = filasDe(p.id, ej.id);
  const comparacion = useMemo(() => filas.map(f => {
    const va = Number(f.calc) * (FACTOR[ea?.version ?? 'TX2'] ?? 1);
    const vb = Number(f.calc) * (FACTOR[eb?.version ?? 'TX2'] ?? 1);
    return { id: f.id, concepto: String(f.concepto), va, vb, d: vb - va };
  }), [filas, ea, eb]);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-line rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3">Versiones publicadas por XM</h4>
        {periodos.map(per => (
          <div key={per} className="mb-3 last:mb-0">
            <div className="text-xs text-mut mb-1.5">{per}</div>
            <ol className="flex flex-wrap items-center gap-2">
              {ORDEN.map(v => {
                const e = propias.find(x => x.fecha === per && x.version === v);
                return (
                  <li key={v}>
                    <button disabled={!e} onClick={() => e && seleccionarEjecucion(p.id, e.id)}
                      className={`rounded-md border px-3 py-1.5 text-left ${e?.id === ej.id ? 'border-brand ring-1 ring-brand' : 'border-line'} ${e ? 'bg-white hover:bg-paper' : 'bg-paper text-mut cursor-default'}`}>
                      <div className="text-sm font-semibold">{v}</div>
                      <div className="text-[11px]">{e ? `Publicada ${e.publicadaXM}` : 'No publicada'}</div>
                      {e && <div className="mt-1"><StatusBadge s={e.estado} /></div>}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
      <div className="bg-white border border-line rounded-lg">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-line">
          <GitCompare size={15} className="text-brand" /><span className="text-sm font-semibold">Comparar versiones</span>
          <select value={a} onChange={e => setA(e.target.value)} className="ml-auto text-sm border border-line rounded px-2 py-1" aria-label="Versión A">
            {conVersion.map(e => <option key={e.id} value={e.id}>{e.fecha} · {e.version}</option>)}
          </select>
          <span className="text-mut text-sm">contra</span>
          <select value={b} onChange={e => setB(e.target.value)} className="text-sm border border-line rounded px-2 py-1" aria-label="Versión B">
            {conVersion.map(e => <option key={e.id} value={e.id}>{e.fecha} · {e.version}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-mut text-left"><th className="px-4 py-2 font-medium">Concepto</th><th className="px-4 py-2 font-medium text-right">{ea?.version}</th><th className="px-4 py-2 font-medium text-right">{eb?.version}</th><th className="px-4 py-2 font-medium text-right">Cambio</th></tr></thead>
            <tbody>
              {comparacion.map(r => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-4 py-2">{r.concepto}</td>
                  <td className="px-4 py-2 text-right num whitespace-nowrap">{fmtValor(r.va, calc)}</td>
                  <td className="px-4 py-2 text-right num whitespace-nowrap">{fmtValor(r.vb, calc)}</td>
                  <td className={`px-4 py-2 text-right num whitespace-nowrap ${Math.abs(r.d) > 1 ? 'text-warn font-medium' : 'text-mut'}`}>{fmtValor(r.d, calc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Calendario({ p, ej }: { p: ProcesoDef; ej: Ejecucion }) {
  const { ejecuciones, seleccionarEjecucion } = useProcess();
  const propias = ejecuciones.filter(e => e.procesoId === p.id);
  return (
    <div className="bg-white border border-line rounded-lg p-4">
      <h4 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><CalendarDays size={15} /> Fechas de operación y corte</h4>
      <p className="text-xs text-mut mb-3">Este proceso se identifica por fecha. Seleccione una fecha para ver su ejecución.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {propias.map(e => (
          <button key={e.id} onClick={() => seleccionarEjecucion(p.id, e.id)}
            className={`text-left rounded-md border px-3 py-2.5 ${e.id === ej.id ? 'border-brand ring-1 ring-brand' : 'border-line hover:bg-paper'}`}>
            <div className="text-sm font-semibold">{e.fecha}</div>
            <div className="text-xs text-mut mt-0.5 truncate">{e.pasoActual}</div>
            <div className="mt-1.5"><StatusBadge s={e.estado} /></div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FechasTab({ p, ej }: { p: ProcesoDef; ej: Ejecucion }) {
  return p.versionado ? <Versiones p={p} ej={ej} /> : <Calendario p={p} ej={ej} />;
}
