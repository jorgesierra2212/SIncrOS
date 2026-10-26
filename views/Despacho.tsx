import React, { useState } from 'react';
import { Zap, TrendingUp, Clock, AlertTriangle, Check, RefreshCw, BarChart3, LineChart } from 'lucide-react';
import { Panel, Kpi, Btn, Table, ViewHeader, StatusBadge, Badge, Illustrative, LayerBadge } from '../components/ui';
import { PlantChart } from '../components/charts';
import { DESPACHO_OFERTAS_DATA, REDESPACHOS_DATA, PLANTS, PLANT_DAY, num, cop } from '../data/mock';
import { useApp } from '../components/context';


// ---------- Despacho Programado vs Real ----------
export function DespachoProgReal() {
  const { ask } = useApp();
  return (
    <>
      <ViewHeader
        title="Despacho programado frente a real"
        desc="Monitoreo horario de generación real de fronteras frente al Despacho Programado DPD oficial de XM y el despacho ideal."
        capa="enersinc_cliente"
        actions={
          <Btn kind="primary" onClick={() => ask('Compara el despacho programado vs real de hoy y calcula el costo de desviaciones.')}>
            <BarChart3 size={14} /> Calcular costo de desviaciones
          </Btn>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PLANTS.map(p => (
          <div key={p.name} className="bg-white border border-line rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold text-txt">{p.name}</div>
              <StatusBadge s={p.state} />
            </div>
            <div className="text-xs text-mut">{p.tech} · {p.cap} MW</div>
            <div className="num text-2xl font-bold mt-2 text-txt">
              {num(p.real, 1)} <span className="text-xs font-normal text-mut">MW real</span>
            </div>
            <div className="text-xs text-mut mt-1 flex justify-between">
              <span>Prog: {p.desp} MW</span>
              <span className={p.real < p.desp ? 'text-bad font-semibold' : 'text-ok font-semibold'}>
                {num(p.real - p.desp, 1)} MW
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-4">
        <Panel className="lg:col-span-3" title="Curva horaria: Despacho programado vs Generación real (U2)">
          <PlantChart h={260} />
        </Panel>
        <Panel className="lg:col-span-2" title="Evaluación financiera de la desviación horaria">
          <p className="text-xs text-txt leading-relaxed">
            La Unidad 2 presenta una desviación acumulada de <b>108 MWh</b> en las horas 17 a 21 por restricción de gas:
          </p>
          <div className="my-3 space-y-1.5 text-xs bg-paper p-3 rounded border border-line">
            <div className="flex justify-between">
              <span className="text-mut">Energía desviada:</span>
              <span className="font-bold text-txt">108 MWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mut">Costo estimado en bolsa:</span>
              <span className="font-bold text-bad">$98 M COP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mut">Efecto en Reconciliación:</span>
              <span className="font-bold text-bad">−$31 M COP</span>
            </div>
          </div>
          <div className="text-[11px] text-mut bg-brandsoft/30 p-2.5 rounded border border-brand/20">
            <b>Recomendación del agente:</b> La redeclaración oportuna de las 16:42 ampara las horas posteriores bajo la regla CREG 024.
          </div>
        </Panel>
      </div>

      <Illustrative />
    </>
  );
}

// ---------- Redespacho y Restricciones ----------
export function Redespacho() {
  return (
    <>
      <ViewHeader
        title="Redespacho y restricciones"
        desc="Bitácora de redespachos ordenados por el CND en tiempo real por seguridad eléctrica de red o restricciones de transmisión."
        capa="enersinc_cliente"
      />

      <Panel title="Órdenes de redespacho emitidas por el CND" pad={false}>
        <Table
          head={['Hora CND', 'Unidad Afectada', 'Tipo de Orden', 'Solicitante', 'MW Anterior', 'MW Redespachado', 'Causa Técnica', 'Tratamiento Comercial']}
          align={['l', 'l', 'l', 'l', 'r', 'r', 'l', 'l']}
          rows={REDESPACHOS_DATA.map(r => [
            <span className="font-mono font-medium">{r.hora}</span>,
            <span className="font-semibold text-txt">{r.unidad}</span>,
            <Badge tone="warn">{r.tipo}</Badge>,
            r.solicitante,
            `${r.anteriorMW} MW`,
            <span className="font-bold text-brand">{r.nuevoMW} MW</span>,
            r.motivo,
            <span className="text-ok font-medium">{r.compensacion}</span>,
          ])}
          exportFileName="redespachos_cnd_octubre.xlsx"
          exportRawData={REDESPACHOS_DATA}
        />
      </Panel>

      <Illustrative />
    </>
  );
}

// ---------- Mercado Intradiario (Vista Preparada) ----------
export function MercadoIntradiario() {
  return (
    <>
      <ViewHeader
        title="Mercado intradiario (Vista preparada)"
        desc="Mecanismo de ajuste horario continuo para equilibrar posiciones de generación y demanda en ventanas intradiarias de negociación previa al tiempo real."
        capa="enersinc_cliente"
        actions={<Badge tone="neutral">En preparación regulatoria</Badge>}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Ventanas de negociación horaria" className="lg:col-span-2">
          <p className="text-xs text-mut mb-3 leading-relaxed">
            Estructura operativa preparada para liquidar y casar ofertas en bloques de 1 hora previa a la operación física:
          </p>
          <div className="space-y-2 text-xs">
            {[
              { ventana: 'Ventana H-4 (Horas 18–24)', estado: 'Cerrada', volumen: '45 MWh casados', spread: '$685 – $710/kWh' },
              { ventana: 'Ventana H-3 (Horas 19–24)', estado: 'Abierta para posturas', volumen: '28 MWh en libro', spread: '$690 – $730/kWh' },
              { ventana: 'Ventana H-2 (Horas 20–24)', estado: 'Por abrir (16:00)', volumen: '—', spread: '—' },
            ].map((v, i) => (
              <div key={i} className="p-3 bg-paper rounded border border-line flex items-center justify-between">
                <div>
                  <span className="font-semibold text-txt">{v.ventana}</span>
                  <div className="text-[11px] text-mut mt-0.5">{v.volumen} · Spread: {v.spread}</div>
                </div>
                <StatusBadge s={v.estado} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Reglas y adaptadores">
          <p className="text-xs text-mut leading-relaxed">
            La arquitectura de adaptadores de Enersinc OS permite conectar este módulo al API de SiMEM cuando XM publique las especificaciones de intercambio comercial intradiario.
          </p>
          <div className="mt-4 p-3 bg-brandsoft/30 rounded border border-brand/20 text-xs">
            <span className="font-semibold text-brand block mb-1">Métricas de balance:</span>
            <div>• Reducción esperada de desviación: <b>65 %</b></div>
            <div>• Optimización de costos de combustible: <b>+$140 M/mes</b></div>
          </div>
        </Panel>
      </div>

      <Illustrative />
    </>
  );
}
