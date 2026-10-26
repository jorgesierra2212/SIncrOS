import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, LineChart, Area, Cell, ReferenceLine,
} from 'recharts';
import { MARKET, SETTLEMENT, GUARANTEES, HOURLY_ANOMALY, SCENARIOS, EMBALSE_TRAMOS, POSITION, PLANT_DAY } from '../data/mock';

const C = { brand: '#2459D6', warn: '#B8690F', bad: '#B8372B', ok: '#0F7A62', mut: '#8A96A6', ink: '#0F1E33', line: '#E3E7EC', hidro: '#5B86E5', termo: '#9C6B2E' };
const axis = { fontSize: 11, fill: '#5E6B7C' };
const tip = { contentStyle: { fontSize: 12, borderRadius: 6, borderColor: '#D9DEE5' } };

export function BolsaChart({ h = 260 }: { h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <ComposedChart data={MARKET} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis dataKey="mes" tick={axis} interval={2} />
        <YAxis yAxisId="g" tick={axis} width={44} />
        <YAxis yAxisId="p" orientation="right" tick={axis} width={40} />
        <Tooltip {...tip} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="g" dataKey="hidraulica" name="Hidráulica (GWh)" stackId="a" fill={C.hidro} />
        <Bar yAxisId="g" dataKey="termica" name="Térmica (GWh)" stackId="a" fill={C.termo} />
        <Line yAxisId="p" dataKey="bolsa" name="Bolsa ($/kWh)" stroke={C.ink} strokeWidth={2} dot={{ r: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function EmbalseChart({ h = 240 }: { h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={EMBALSE_TRAMOS} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis dataKey="tramo" tick={axis} />
        <YAxis tick={axis} width={40} />
        <Tooltip {...tip} />
        <ReferenceLine y={213} stroke={C.mut} strokeDasharray="4 4" label={{ value: 'mediana 213', fontSize: 11, fill: '#5E6B7C', position: 'insideTopRight' }} />
        <Bar dataKey="precio" name="Precio mediano ($/kWh)" label={{ position: 'top', fontSize: 11 }}>
          {EMBALSE_TRAMOS.map((_, i) => <Cell key={i} fill={i < 4 ? ['#9E2B22', '#B8372B', '#C9584C', '#D98A80'][i] : ['#9DB4EE', '#2459D6'][i - 4]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DiffChart({ h = 240 }: { h?: number }) {
  const data = SETTLEMENT.map(s => ({ concepto: s.concepto, diferencia: Math.round((s.calc - s.xm) / 1e6 * 10) / 10 }))
    .filter(d => Math.abs(d.diferencia) > 0.1);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={C.line} horizontal={false} />
        <XAxis type="number" tick={axis} unit=" M" />
        <YAxis type="category" dataKey="concepto" tick={axis} width={150} />
        <Tooltip {...tip} formatter={(v: number) => [`$${v} M`, 'Calculado − XM']} />
        <ReferenceLine x={5} stroke={C.warn} strokeDasharray="4 4" />
        <ReferenceLine x={-5} stroke={C.warn} strokeDasharray="4 4" />
        <Bar dataKey="diferencia">
          {data.map((d, i) => <Cell key={i} fill={Math.abs(d.diferencia) >= 5 ? C.bad : C.mut} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GarantiasChart({ h = 240 }: { h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <ComposedChart data={GUARANTEES} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis dataKey="semana" tick={axis} />
        <YAxis tick={axis} width={40} unit="" domain={[2, 3.6]} />
        <Tooltip {...tip} formatter={(v: number) => `$${v} mil M`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="proyectada" name="Proyectada" fill={C.brand} />
        <Line dataKey="provisionada" name="Provisionada" stroke={C.warn} strokeWidth={2} dot={false} />
        <Line dataKey="xm" name="Calculada por XM" stroke={C.ink} strokeWidth={0} dot={{ r: 5 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function AnomalyChart({ h = 240 }: { h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <LineChart data={HOURLY_ANOMALY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis dataKey="hora" tick={axis} />
        <YAxis tick={axis} width={40} unit="" />
        <Tooltip {...tip} formatter={(v: number) => `${v} kWh`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line dataKey="respaldo" name="Medidor de respaldo" stroke={C.brand} strokeWidth={2} dot={false} />
        <Line dataKey="principal" name="Medidor principal" stroke={C.bad} strokeWidth={2} strokeDasharray="5 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EscenariosChart({ h = 240 }: { h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <LineChart data={SCENARIOS} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis dataKey="mes" tick={axis} />
        <YAxis tick={axis} width={44} />
        <Tooltip {...tip} formatter={(v: number) => `$${v}/kWh`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line dataKey="real" name="Real" stroke={C.ink} strokeWidth={2} />
        <Line dataKey="humedo" name="Húmedo" stroke={C.brand} strokeDasharray="5 4" />
        <Line dataKey="medio" name="Medio" stroke={C.mut} strokeDasharray="5 4" />
        <Line dataKey="seco" name="Seco" stroke={C.bad} strokeDasharray="5 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PositionChart({ h = 260 }: { h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <ComposedChart data={POSITION} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis dataKey="dia" tick={axis} />
        <YAxis tick={axis} width={44} />
        <Tooltip {...tip} formatter={(v: number) => `${v} MWh/h prom.`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="generacion" name="Generación" stackId="o" fill={C.hidro} />
        <Bar dataKey="compras" name="Compras en contratos" stackId="o" fill="#9DB4EE" />
        <Line dataKey="ventas" name="Ventas en contratos" stroke={C.ink} strokeWidth={2} dot={false} />
        <Line dataKey="neta" name="Posición neta" stroke={C.bad} strokeWidth={2} dot={false} />
        <ReferenceLine y={0} stroke={C.mut} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function PlantChart({ h = 240 }: { h?: number }) {
  return (
    <ResponsiveContainer width="100%" height={h}>
      <ComposedChart data={PLANT_DAY} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={C.line} vertical={false} />
        <XAxis dataKey="hora" tick={axis} />
        <YAxis tick={axis} width={40} unit="" />
        <Tooltip {...tip} formatter={(v: number) => `${v} MW`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area dataKey="disponibilidad" name="Disponibilidad declarada" fill="#E3EAFB" stroke="#9DB4EE" />
        <Line dataKey="despacho" name="Despacho" stroke={C.ink} strokeWidth={2} dot={false} />
        <Line dataKey="real" name="Generación real" stroke={C.bad} strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function FronterasMini({ h = 180 }: { h?: number }) {
  const data = [{ estado: 'OK', n: 1257 }, { estado: 'Alerta', n: 21 }, { estado: 'Caída', n: 6 }];
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="estado" tick={axis} />
        <YAxis tick={axis} width={40} scale="log" domain={[1, 2000]} allowDataOverflow />
        <Tooltip {...tip} />
        <Bar dataKey="n" name="Fronteras" label={{ position: 'top', fontSize: 11 }}>
          {data.map((_, i) => <Cell key={i} fill={[C.ok, C.warn, C.bad][i]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
