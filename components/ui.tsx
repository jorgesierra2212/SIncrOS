import React from 'react';
import { Download, Layers } from 'lucide-react';
import type { Layer } from '../data/types';
import { LAYER_INFO } from '../data/types';
import { exportTableToExcel } from '../utils/export';

export function Panel({
  title,
  action,
  children,
  className = '',
  pad = true,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={`bg-white border border-line rounded-lg ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold">{title}</h3>
          </div>
          {action}
        </header>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </section>
  );
}

export type Tone = 'ok' | 'warn' | 'bad' | 'brand' | 'neutral' | 'purple' | 'emerald';
const TONES: Record<Tone, string> = {
  ok: 'bg-oksoft text-ok',
  warn: 'bg-warnsoft text-warn',
  bad: 'bg-badsoft text-bad',
  brand: 'bg-brandsoft text-brand',
  purple: 'bg-[#F3E8FF] text-[#7E22CE]',
  emerald: 'bg-[#D1FAE5] text-[#065F46]',
  neutral: 'bg-paper text-mut',
};

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// 50 / 25 / 25 Architecture Layer Badge
export function LayerBadge({
  capa,
  compact = false,
}: {
  capa: Layer;
  compact?: boolean;
}) {
  const info = LAYER_INFO[capa] || LAYER_INFO.nucleo;
  if (compact) {
    return (
      <span
        title={`${info.label} (${info.pct}) · ${info.desc}`}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
          capa === 'nucleo'
            ? 'bg-[#E3EAFB] text-[#2459D6] border border-[#2459D6]/30'
            : capa === 'enersinc_cliente'
            ? 'bg-[#F3E8FF] text-[#7E22CE] border border-[#7E22CE]/30'
            : 'bg-[#D1FAE5] text-[#065F46] border border-[#065F46]/30'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {info.pct}
      </span>
    );
  }

  return (
    <span
      title={info.desc}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        capa === 'nucleo'
          ? 'bg-[#E3EAFB] text-[#2459D6] border border-[#2459D6]/20'
          : capa === 'enersinc_cliente'
          ? 'bg-[#F3E8FF] text-[#7E22CE] border border-[#7E22CE]/20'
          : 'bg-[#D1FAE5] text-[#065F46] border border-[#065F46]/20'
      }`}
    >
      <Layers size={11} className="shrink-0" />
      <span>{info.label}</span>
      <span className="opacity-70 text-[10px]">({info.pct})</span>
    </span>
  );
}

export function toneFor(s: string): Tone {
  const v = s.toLowerCase();
  if (['ok', 'activo', 'registrado', 'registrada', 'aceptada', 'sincronizada', 'conectado', 'vigente', 'en despacho', 'cuadra', 'aceptado', 'producción', 'resuelto', 'exitoso', 'completada', 'vivo', 'aprobado', 'lista', 'cubierta', 'ganada', 'radicada'].some(k => v.startsWith(k))) return 'ok';
  if (['alerta', 'media', 'por aprobar', 'pendiente', 'piloto', 'revisar', 'en proceso', 'desviación', 'variable', 'borrador', 'en adjudicación', 'abierta', 'espera', 'sandbox', 'advertencia', 'revisión', 'esperando', 'en curso', 'desactualizado', 'preparado', 'enviado', 'acuse', 'nota crédito', 'provisionar', 'estimada', 'en revisión'].some(k => v.startsWith(k))) return 'warn';
  if (['error', 'caída', 'alta', 'con errores', 'rechazada', 'reclamar', 'fallo', 'falló', 'escalado', 'con error', 'faltante', 'perdida', 'rechazado'].some(k => v.startsWith(k))) return 'bad';
  if (['en diseño', 'histórica', 'baja', 'adjudicada', 'retirado', 'inactivo', 'congelado'].some(k => v.startsWith(k))) return 'neutral';
  return 'neutral';
}

export const StatusBadge = ({ s }: { s: string }) => <Badge tone={toneFor(s)}>{s}</Badge>;

export function Kpi({
  label,
  value,
  hint,
  tone,
  capa,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: Tone;
  capa?: Layer;
}) {
  const color =
    tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : 'text-txt';
  return (
    <div className="bg-white border border-line rounded-lg px-4 py-3 relative">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[13px] text-mut">{label}</span>
        {capa && <LayerBadge capa={capa} compact />}
      </div>
      <div className={`num text-2xl font-semibold mt-1 ${color}`}>{value}</div>
      {hint && <div className="text-xs text-mut mt-1">{hint}</div>}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  kind = 'secondary',
  small,
  disabled,
  title,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  small?: boolean;
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  const k = {
    primary: 'bg-brand text-white hover:bg-[#1d4bb8] disabled:opacity-50',
    secondary: 'bg-white border border-line text-txt hover:bg-paper disabled:opacity-50',
    ghost: 'text-brand hover:bg-brandsoft disabled:opacity-50',
    danger: 'bg-white border border-line text-bad hover:bg-badsoft disabled:opacity-50',
    success: 'bg-ok text-white hover:bg-[#0c6652] disabled:opacity-50',
  }[kind];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
        small ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'
      } ${k} ${className}`}
    >
      {children}
    </button>
  );
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-line bg-white p-0.5" role="tablist">
      {items.map(i => (
        <button
          key={i}
          role="tab"
          aria-selected={i === value}
          onClick={() => onChange(i)}
          className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
            i === value ? 'bg-ink text-white shadow-sm' : 'text-mut hover:text-txt'
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

export function Table({
  head,
  rows,
  onRow,
  align,
  exportFileName,
  exportRawData,
}: {
  head: string[];
  rows: React.ReactNode[][];
  onRow?: (i: number) => void;
  align?: ('l' | 'r')[];
  exportFileName?: string;
  exportRawData?: Record<string, any>[];
}) {
  const handleExport = () => {
    if (exportRawData && exportRawData.length > 0) {
      exportTableToExcel(exportRawData, exportFileName || 'tabla_datos.xlsx');
    } else {
      // Fallback: extract plain text from rows
      const plainData = rows.map(r => {
        const obj: Record<string, string> = {};
        head.forEach((h, idx) => {
          const cell = r[idx];
          obj[h] = typeof cell === 'string' || typeof cell === 'number' ? String(cell) : '';
        });
        return obj;
      });
      exportTableToExcel(plainData, exportFileName || 'tabla_datos.xlsx');
    }
  };

  return (
    <div className="overflow-x-auto">
      {exportFileName && (
        <div className="flex justify-end p-2 border-b border-line bg-paper/30">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1 text-xs text-brand hover:underline font-medium"
            title="Descargar esta tabla en formato Excel (.xlsx)"
          >
            <Download size={13} /> Exportar Excel
          </button>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-mut bg-paper/40">
            {head.map((h, i) => (
              <th
                key={i}
                className={`font-semibold px-3 py-2 border-b border-line whitespace-nowrap text-xs uppercase tracking-wider text-mut ${
                  align?.[i] === 'r' ? 'text-right' : ''
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              onClick={onRow ? () => onRow(i) : undefined}
              className={`border-b border-line last:border-0 transition-colors ${
                onRow ? 'cursor-pointer hover:bg-paper/70' : 'hover:bg-paper/30'
              }`}
            >
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`px-3 py-2.5 align-middle ${
                    align?.[j] === 'r' ? 'text-right num whitespace-nowrap' : ''
                  }`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ViewHeader({
  title,
  desc,
  actions,
  capa = 'nucleo',
}: {
  title: string;
  desc: string;
  actions?: React.ReactNode;
  capa?: Layer;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-semibold leading-tight text-txt">{title}</h1>
          <LayerBadge capa={capa} />
        </div>
        <p className="text-sm text-mut mt-1 max-w-[75ch] leading-relaxed">{desc}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Bar({
  value,
  max,
  tone = 'brand',
}: {
  value: number;
  max: number;
  tone?: 'brand' | 'warn' | 'bad' | 'ok';
}) {
  const pct = Math.min(100, (value / max) * 100);
  const c = { brand: 'bg-brand', warn: 'bg-warn', bad: 'bg-bad', ok: 'bg-ok' }[tone];
  return (
    <div className="h-2 rounded bg-paper overflow-hidden" role="meter" aria-valuenow={value} aria-valuemax={max}>
      <div className={`h-full ${c}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export const Illustrative = () => (
  <div className="flex items-center gap-2 mt-5 text-xs text-mut bg-paper/60 px-3 py-2 rounded border border-line/60">
    <span className="font-semibold uppercase tracking-wider text-[10px] bg-paper px-1.5 py-0.5 rounded border border-line">
      Datos ilustrativos
    </span>
    <span>Simulados para el mockup de Enersinc OS en el MEM colombiano (XM). Cifras de referencia sin afectación comercial.</span>
  </div>
);
