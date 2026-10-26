import React, { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Search, Download, Upload, X, History, Lock, ArrowUpDown, Edit3 } from 'lucide-react';
import { Badge, Btn, StatusBadge } from './ui';
import { cop, num } from '../data/mock';
import { exportTableToExcel } from '../utils/export';
import type { CambioCelda, Columna, Fila } from '../data/process/types';

export interface GridRow {
  id: string;
  concepto: string;
  categoria: string;
  calc: number;
  xm: number;
  diff: number;
  regla: string;
  umbral: number;
  estado: 'Cuadra' | 'Reclamar' | 'Revisar' | 'Ajustado Manual';
  detalles?: {
    formula: string;
    variables?: { nombre: string; valor: string }[];
    origenXM?: string;
    explicacion?: string;
  };
}

export function fmtValor(v: string | number | undefined, c: Columna) {
  if (v === undefined || v === '') return '—';
  if (c.tipo === 'moneda') return cop(Number(v));
  if (c.tipo === 'numero') return `${num(Number(v), 1)}${c.unidad ? ' ' + c.unidad : ''}`;
  return String(v);
}

const DEFAULT_COLS: Columna[] = [
  { key: 'concepto', label: 'Concepto', tipo: 'texto' },
  { key: 'categoria', label: 'Categoría', tipo: 'texto' },
  { key: 'calc', label: 'Calculado', tipo: 'moneda', editable: true },
  { key: 'ref', label: 'Referencia XM', tipo: 'moneda' },
  { key: 'diff', label: 'Diferencia', tipo: 'moneda' },
  { key: 'regla', label: 'Regla', tipo: 'texto' },
  { key: 'estado', label: 'Estado', tipo: 'estado', editable: true, opciones: ['Cuadra', 'Revisar', 'Reclamar', 'Ajustado Manual'] },
];

export interface AirtableGridProps {
  titulo?: string;
  processTitle?: string;
  versionLabel?: string;
  rows?: GridRow[];
  columnas?: Columna[];
  filas?: Fila[];
  cambios?: CambioCelda[];
  editable?: boolean;
  onEdit?: (filaId: string, col: string, valor: string | number, motivo?: string) => void;
  onImport?: (filas: Fila[]) => void;
  onAskAgent?: (query: string) => void;
  onManualEdit?: (id: string, newVal: number, justification: string) => void;
}

export default function AirtableGrid({
  titulo,
  processTitle,
  versionLabel,
  rows,
  columnas = DEFAULT_COLS,
  filas: filasProp,
  cambios: cambiosProp,
  editable = true,
  onEdit,
  onImport,
  onManualEdit,
}: AirtableGridProps) {
  const initialLocalFilas = useMemo<Fila[]>(() => {
    if (filasProp) return filasProp;
    if (rows) {
      return rows.map(r => ({
        id: r.id,
        concepto: r.concepto,
        categoria: r.categoria,
        calc: r.calc,
        ref: r.xm,
        diff: r.diff,
        regla: r.regla,
        estado: r.estado,
      }));
    }
    return [];
  }, [filasProp, rows]);

  const [localFilas, setLocalFilas] = useState<Fila[]>(initialLocalFilas);
  const [localCambios, setLocalCambios] = useState<CambioCelda[]>([]);
  const filas = filasProp ?? localFilas;
  const cambios = cambiosProp ?? localCambios;

  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('Todos');
  const [orden, setOrden] = useState<{ col: string; asc: boolean } | null>(null);
  const [celda, setCelda] = useState<{ fila: string; col: string } | null>(null);
  const [borrador, setBorrador] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const exportTitle = titulo || `${processTitle || 'datos'}${versionLabel ? '_' + versionLabel : ''}`;
  const colEstado = columnas.find(c => c.tipo === 'estado');
  const tocadas = useMemo(() => new Set(cambios.map(c => `${c.filaId}|${c.columna}`)), [cambios]);

  const vista = useMemo(() => {
    let r = filas.filter(f => Object.values(f).some(v => String(v).toLowerCase().includes(q.toLowerCase())));
    if (colEstado && estado !== 'Todos') r = r.filter(f => f[colEstado.key] === estado);
    if (orden) {
      r = [...r].sort((a, b) => {
        const x = a[orden.col];
        const y = b[orden.col];
        const d = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
        return orden.asc ? d : -d;
      });
    }
    return r;
  }, [filas, q, estado, orden, colEstado]);

  const applyEdit = (filaId: string, colKey: string, val: string | number, why?: string) => {
    if (onEdit) {
      onEdit(filaId, colKey, val, why);
    } else {
      const anterior = filas.find(f => f.id === filaId)?.[colKey] ?? '';
      if (anterior === val) return;
      setLocalFilas(prev =>
        prev.map(f => {
          if (f.id !== filaId) return f;
          const g: Fila = { ...f, [colKey]: val };
          if (colKey === 'calc' || colKey === 'ref') g.diff = Number(g.calc) - Number(g.ref);
          return g;
        })
      );
      setLocalCambios(prev => [
        {
          filaId,
          columna: colKey,
          anterior,
          nuevo: val,
          quien: 'Operador activo',
          cuando: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          motivo: why,
        },
        ...prev,
      ]);
      if (onManualEdit && typeof val === 'number') {
        onManualEdit(filaId, val, why || 'Edición en celda');
      }
    }
  };

  const guardar = (filaId: string, col: Columna, valor: string, why?: string) => {
    const v = col.tipo === 'moneda' || col.tipo === 'numero' ? Number(valor.replace(/[^0-9.-]/g, '')) : valor;
    if (col.tipo !== 'texto' && col.tipo !== 'estado' && Number.isNaN(v)) return;
    applyEdit(filaId, col.key, v, why);
    setCelda(null);
  };

  const exportar = () =>
    exportTableToExcel(
      filas.map(f => Object.fromEntries(columnas.map(c => [c.label, f[c.key]]))),
      `${exportTitle.replace(/\s+/g, '_')}.xlsx`
    );

  const importar = async (file: File) => {
    const wb = XLSX.read(await file.arrayBuffer());
    const sheetRows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wb.SheetNames[0]]);
    const nuevas: Fila[] = sheetRows.map((r, i) => {
      const f: Fila = { id: String(r.id ?? filas[i]?.id ?? `IMP-${i + 1}`) };
      columnas.forEach(c => {
        const v = r[c.label] ?? r[c.key];
        if (v !== undefined) f[c.key] = v;
      });
      if ('calc' in f && 'ref' in f) f.diff = Number(f.calc) - Number(f.ref);
      return f;
    });
    if (nuevas.length) {
      if (onImport) onImport(nuevas);
      else setLocalFilas(nuevas);
    }
  };

  const filaModal = filas.find(f => f.id === modal);

  return (
    <div className="bg-white border border-line rounded-lg">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-line">
        <label className="flex items-center gap-2 bg-paper rounded-md px-2.5 py-1.5 text-sm flex-1 min-w-[180px]">
          <Search size={14} className="text-mut" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar en la tabla"
            className="bg-transparent outline-none flex-1"
          />
        </label>
        {colEstado && (
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="text-sm border border-line rounded-md px-2 py-1.5 bg-white"
            aria-label="Filtrar por estado"
          >
            {['Todos', ...(colEstado.opciones ?? [])].map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
        )}
        {!editable && (
          <Badge tone="neutral">
            <Lock size={11} /> Solo lectura para su rol
          </Badge>
        )}
        <div className="ml-auto flex gap-2">
          {editable && (
            <Btn small onClick={() => fileRef.current?.click()}>
              <Upload size={13} /> Importar Excel
            </Btn>
          )}
          <Btn small onClick={exportar}>
            <Download size={13} /> Exportar Excel
          </Btn>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            onChange={e => e.target.files?.[0] && importar(e.target.files[0])}
          />
        </div>
      </div>

      {/* Tabla tipo Airtable con edición en celda */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper/60 sticky top-0">
            <tr className="text-left text-mut">
              {columnas.map(c => (
                <th
                  key={c.key}
                  className={`font-medium px-3 py-2 whitespace-nowrap ${
                    c.tipo === 'moneda' || c.tipo === 'numero' ? 'text-right' : ''
                  }`}
                >
                  <button
                    onClick={() => setOrden(o => ({ col: c.key, asc: o?.col === c.key ? !o.asc : false }))}
                    className="inline-flex items-center gap-1 hover:text-txt"
                  >
                    {c.label}
                    {c.editable && editable && <span className="text-brand">✎</span>}
                    <ArrowUpDown size={11} />
                  </button>
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium text-mut">Registro</th>
            </tr>
          </thead>
          <tbody>
            {vista.map(f => (
              <tr key={f.id} className="border-t border-line hover:bg-paper/40">
                {columnas.map(c => {
                  const editando = celda?.fila === f.id && celda.col === c.key;
                  const marcada = tocadas.has(`${f.id}|${c.key}`);
                  const ultimoCambio = cambios.find(x => x.filaId === f.id && x.columna === c.key);
                  const derecha = c.tipo === 'moneda' || c.tipo === 'numero';
                  return (
                    <td
                      key={c.key}
                      onClick={() => {
                        if (editable && c.editable && !editando) {
                          setCelda({ fila: f.id, col: c.key });
                          setBorrador(String(f[c.key] ?? ''));
                        }
                      }}
                      className={`px-3 py-2 align-top ${derecha ? 'text-right num whitespace-nowrap' : ''} ${
                        marcada ? 'bg-warnsoft/60' : ''
                      } ${editable && c.editable ? 'cursor-pointer hover:bg-brandsoft/30' : ''}`}
                      title={
                        ultimoCambio
                          ? `Editado por ${ultimoCambio.quien} (${ultimoCambio.cuando}) · Valor anterior: ${fmtValor(ultimoCambio.anterior, c)}`
                          : editable && c.editable
                          ? 'Clic para editar en celda'
                          : undefined
                      }
                    >
                      {editando ? (
                        c.tipo === 'estado' ? (
                          <select
                            autoFocus
                            value={borrador}
                            onChange={e => guardar(f.id, c, e.target.value)}
                            onBlur={() => setCelda(null)}
                            className="border border-brand rounded px-1 py-0.5 bg-white"
                          >
                            {(c.opciones ?? []).map(o => (
                              <option key={o}>{o}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            autoFocus
                            value={borrador}
                            onChange={e => setBorrador(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') guardar(f.id, c, borrador);
                              if (e.key === 'Escape') setCelda(null);
                            }}
                            onBlur={() => guardar(f.id, c, borrador)}
                            className="w-32 border border-brand rounded px-1.5 py-0.5 text-right bg-white"
                          />
                        )
                      ) : c.tipo === 'estado' ? (
                        <StatusBadge s={String(f[c.key])} />
                      ) : (
                        <div>
                          <span className={c.key === 'diff' && Number(f[c.key]) !== 0 ? 'text-bad font-medium' : ''}>
                            {fmtValor(f[c.key], c)}
                          </span>
                          {ultimoCambio && (
                            <div className="text-[10px] text-warn font-normal">
                              {ultimoCambio.quien} · {ultimoCambio.cuando} (ant.: {fmtValor(ultimoCambio.anterior, c)})
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => {
                      setModal(f.id);
                      setMotivo('');
                    }}
                    className="inline-flex items-center gap-1 text-brand text-xs font-medium hover:underline whitespace-nowrap"
                  >
                    <Edit3 size={12} /> Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie de tabla e historial reciente */}
      <div className="px-3 py-2 text-xs text-mut border-t border-line flex flex-wrap items-center justify-between gap-2">
        <span>
          {vista.length} de {filas.length} registros · {cambios.length} cambios en historial
          {editable ? ' · haga clic en cualquier celda con ✎ para editar' : ''}
        </span>
      </div>

      {cambios.length > 0 && (
        <div className="px-3 py-2.5 bg-paper/50 border-t border-line text-xs">
          <div className="font-semibold text-txt flex items-center gap-1.5 mb-1.5">
            <History size={13} className="text-brand" /> Historial de cambios por celda (quién, cuándo y valor anterior)
          </div>
          <ul className="space-y-1 max-h-36 overflow-y-auto">
            {cambios.map((c, i) => {
              const colDef = columnas.find(x => x.key === c.columna);
              return (
                <li key={i} className="bg-white border border-line rounded px-2.5 py-1 flex flex-wrap items-center gap-x-2">
                  <span className="font-mono text-mut">{c.filaId}</span>
                  <span>·</span>
                  <b>{c.quien}</b>
                  <span className="text-mut">({c.cuando})</span>
                  <span>·</span>
                  <span>{colDef?.label ?? c.columna}:</span>
                  <span className="line-through text-mut">{colDef ? fmtValor(c.anterior, colDef) : String(c.anterior)}</span>
                  <span>→</span>
                  <b className="text-brand">{colDef ? fmtValor(c.nuevo, colDef) : String(c.nuevo)}</b>
                  {c.motivo && <span className="text-mut italic">· "{c.motivo}"</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Modal de registro con historial de cambios por celda */}
      {filaModal && (
        <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center p-4" onClick={() => setModal(null)}>
          <div
            className="bg-white rounded-xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Modal de registro"
          >
            <div className="flex items-start justify-between px-5 py-4 border-b border-line">
              <div>
                <div className="text-xs text-mut">{filaModal.id}</div>
                <h3 className="font-semibold">{String(filaModal.concepto ?? filaModal.id)}</h3>
              </div>
              <button onClick={() => setModal(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {columnas.map(c => (
                <label key={c.key} className="block text-sm">
                  <span className="text-xs text-mut">{c.label}</span>
                  {editable && c.editable ? (
                    c.tipo === 'estado' ? (
                      <select
                        defaultValue={String(filaModal[c.key])}
                        onChange={e => applyEdit(filaModal.id, c.key, e.target.value, motivo || undefined)}
                        className="mt-0.5 w-full border border-line rounded px-2 py-1"
                      >
                        {(c.opciones ?? []).map(o => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        defaultValue={String(filaModal[c.key])}
                        onBlur={e => guardar(filaModal.id, c, e.target.value, motivo || undefined)}
                        className="mt-0.5 w-full border border-line rounded px-2 py-1"
                      />
                    )
                  ) : (
                    <div className="mt-0.5 font-medium">{fmtValor(filaModal[c.key], c)}</div>
                  )}
                </label>
              ))}
              {editable && (
                <label className="block text-sm col-span-2">
                  <span className="text-xs text-mut">Justificación del cambio (queda en el historial)</span>
                  <input
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    placeholder="Ej.: corrección con soporte de la redeclaración de las 16:42"
                    className="mt-0.5 w-full border border-line rounded px-2 py-1"
                  />
                </label>
              )}
            </div>
            <div className="px-5 pb-5">
              <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                <History size={14} /> Historial de cambios del registro
              </h4>
              {cambios.filter(c => c.filaId === filaModal.id).length === 0 ? (
                <p className="text-xs text-mut">Sin cambios desde la carga del agente.</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {cambios
                    .filter(c => c.filaId === filaModal.id)
                    .map((c, i) => {
                      const colDef = columnas.find(x => x.key === c.columna);
                      return (
                        <li key={i} className="bg-paper rounded px-2.5 py-1.5">
                          <b>{c.quien}</b> · {c.cuando} · {colDef?.label ?? c.columna}:{' '}
                          <span className="line-through text-mut">{colDef ? fmtValor(c.anterior, colDef) : String(c.anterior)}</span> →{' '}
                          <b>{colDef ? fmtValor(c.nuevo, colDef) : String(c.nuevo)}</b>
                          {c.motivo && <div className="text-mut">Motivo: {c.motivo}</div>}
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
