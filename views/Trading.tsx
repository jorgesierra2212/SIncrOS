import React, { useState } from 'react';
import { useApp } from '../components/context';
import { Panel, Kpi, Btn, Table, ViewHeader, StatusBadge, Badge, Bar, Tabs, Illustrative, LayerBadge } from '../components/ui';
import { PositionChart, EscenariosChart, GarantiasChart } from '../components/charts';
import { CONTRACTS, MTM, SICEP_CALLS, LIMITS, GUARANTEES, SCENARIOS, cop, num } from '../data/mock';

// ---------- Libro de Contratos ----------
export function Contratos() {
  const [sel, setSel] = useState(2);
  const c = CONTRACTS[sel];
  return (
    <>
      <ViewHeader
        title="Libro de contratos bilaterales"
        desc="Cualquier estructura contractual del mercado colombiano (pague lo contratado, pague lo demandado, condicionales) se representa como regla en el motor."
        capa="enersinc_cliente"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Contratos vigentes" value="42" capa="enersinc_cliente" />
        <Kpi label="Energía vendida 2027" value="1.284 GWh" capa="enersinc_cliente" />
        <Kpi label="Energía comprada 2027" value="602 GWh" capa="enersinc_cliente" />
        <Kpi label="Pendientes de registro ASIC" value="1" tone="warn" capa="enersinc_cliente" />
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-4">
        <Panel className="lg:col-span-3" pad={false} title="Contratos bilaterales registrados">
          <Table
            head={['Contrato', 'Contraparte', 'Lado', 'Tipo de Contrato', 'GWh', '$/kWh', 'Registro ASIC']}
            align={['l', 'l', 'l', 'l', 'r', 'r', 'l']}
            onRow={setSel}
            rows={CONTRACTS.map((x, i) => [
              <span className={i === sel ? 'font-semibold text-brand' : 'font-medium text-txt'}>{x.id}</span>,
              x.cp,
              <Badge tone={x.side === 'Venta' ? 'brand' : 'purple'}>{x.side}</Badge>,
              x.type,
              num(x.gwh, 1),
              `$${x.price}`,
              <StatusBadge s={x.asic} />,
            ])}
            exportFileName="libro_contratos_enersinc.xlsx"
            exportRawData={CONTRACTS}
          />
        </Panel>

        <Panel className="lg:col-span-2" title={c.id}>
          <dl className="grid grid-cols-2 gap-2 text-xs bg-paper p-3 rounded border border-line">
            <div><dt className="text-mut">Contraparte</dt><dd className="font-semibold text-txt">{c.cp}</dd></div>
            <div><dt className="text-mut">Vigencia</dt><dd className="font-semibold text-txt">{c.from} → {c.to}</dd></div>
            <div><dt className="text-mut">Precio base</dt><dd className="font-semibold text-brand">${c.price}/kWh</dd></div>
            <div><dt className="text-mut">Indexador</dt><dd className="font-semibold text-txt">{c.index}</dd></div>
          </dl>

          <h4 className="text-xs font-semibold text-mut uppercase tracking-wider mt-4 mb-2">Reglas contractuales</h4>
          <ul className="text-xs space-y-2">
            <li className="flex gap-2">
              <Badge tone="brand">Cantidad</Badge>
              <span className="text-txt">Perfil horario plano de {num(c.gwh / 8.76, 1)} MW promedio</span>
            </li>
            {c.type.startsWith('Condicional') && (
              <li className="flex gap-2">
                <Badge tone="warn">Condición</Badge>
                <span className="text-txt">Despacha solo si precio de bolsa &gt; $700/kWh</span>
              </li>
            )}
            <li className="flex gap-2">
              <Badge tone="brand">Precio</Badge>
              <span className="text-txt">Indexado mensual por {c.index}</span>
            </li>
            <li className="flex gap-2">
              <Badge tone="brand">Salida</Badge>
              <span className="text-txt">P × Q horario hacia facturación y ERP</span>
            </li>
          </ul>
        </Panel>
      </div>

      <Illustrative />
    </>
  );
}

// ---------- Posición y MtM ----------
export function Posicion() {
  const total = MTM.reduce((s, m) => s + m.mtm, 0);

  return (
    <>
      <ViewHeader
        title="Posición neta y valoración MtM"
        desc="Posición neta horaria cruzando generación física y contratos, y valoración a mercado (Mark-to-Market) de cada contrato contra la curva de precios de referencia."
        capa="enersinc_cliente"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Posición neta promedio · nov" value="−92 MWh/h" tone="warn" hint="Corto: comprará en bolsa" capa="enersinc_cliente" />
        <Kpi label="MtM total del portafolio" value={cop(total)} tone={total < 0 ? 'bad' : 'ok'} capa="enersinc_cliente" />
        <Kpi label="Curva utilizada" value="Escenario medio" hint="Actualizada hoy 06:00" capa="enersinc_cliente" />
        <Kpi label="Horas cortas próximos 30 días" value="268 h" capa="enersinc_cliente" />
      </div>

      <Panel className="mt-4" title="Posición neta próximos 30 días (MWh/h promedio diario)">
        <PositionChart h={280} />
      </Panel>

      <Panel className="mt-4" title="Valoración Mark-to-Market por contrato bilateral" pad={false}>
        <Table
          head={['Contrato', 'Lado', 'GWh contratados', 'Precio Contrato', 'Curva Mercado', 'Valoración MtM']}
          align={['l', 'l', 'r', 'r', 'r', 'r']}
          rows={MTM.map(m => [
            <span className="font-semibold text-xs text-txt">{m.id}</span>,
            <Badge tone={m.side === 'Venta' ? 'brand' : 'purple'}>{m.side}</Badge>,
            num(m.gwh, 1),
            `$${m.price}`,
            `$${m.curve}`,
            <span className={`font-semibold ${m.mtm < 0 ? 'text-bad' : 'text-ok'}`}>{cop(m.mtm)}</span>,
          ])}
          exportFileName="valoracion_mtm_contratos.xlsx"
          exportRawData={MTM}
        />
      </Panel>

      <Illustrative />
    </>
  );
}

// ---------- SICEP ----------
export function Sicep() {
  const { ask } = useApp();
  return (
    <>
      <ViewHeader
        title="SICEP (Sistema de Convocatorias Estandarizadas)"
        desc="Módulo de licitaciones públicas de energía de largo plazo. El agente de cobertura propone posturas óptimas de volumen y precio para revisión del comité comercial."
        capa="enersinc_cliente"
      />

      <Panel pad={false} title="Convocatorias públicas SICEP abiertas y adjudicadas">
        <Table
          head={['Convocatoria', 'Comprador (Demanda)', 'Producto', 'Periodo Suministro', 'GWh Año', 'Fecha Cierre', 'Estado']}
          align={['l', 'l', 'l', 'l', 'r', 'l', 'l']}
          rows={SICEP_CALLS.map(s => [
            <span className="font-semibold text-xs text-txt">{s.id}</span>,
            s.buyer,
            s.product,
            s.period,
            num(s.gwh),
            s.close,
            <StatusBadge s={s.status} />,
          ])}
          exportFileName="convocatorias_sicep.xlsx"
          exportRawData={SICEP_CALLS}
        />
      </Panel>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Panel title="Propuesta del agente para SICEP-26-08">
          <ul className="text-xs space-y-2">
            <li><span className="text-mut">Cantidad sugerida a ofertar:</span> <b>120 GWh/año</b> (19 % de lo convocado)</li>
            <li><span className="text-mut">Precio de oferta sugerido:</span> <b>$334/kWh</b> indexado al IPP</li>
            <li><span className="text-mut">Impacto en exposición a bolsa:</span> reduce de 21 % a cerca de <b>16 %</b></li>
            <li><span className="text-mut">Riesgo evaluado:</span> en escenario húmedo el contrato supera la curva esperada de bolsa</li>
          </ul>
          <div className="flex gap-2 mt-4 pt-2 border-t border-line">
            <Btn kind="primary">Enviar propuesta al comité comercial</Btn>
            <Btn onClick={() => ask('¿Cuál es mi exposición a bolsa en un escenario seco?')}>
              Evaluar escenarios hidrológicos
            </Btn>
          </div>
        </Panel>

        <Panel title="Histórico de precios adjudicados recientes en SICEP ($/kWh)">
          <div className="space-y-3 text-xs">
            {[
              ['Anual plano 2027', 329, 360],
              ['Base + punta 2027–2028', 341, 360],
              ['Anual plano 2027–2029', 336, 360],
            ].map(([l, v, m]) => (
              <div key={l as string}>
                <div className="flex justify-between mb-1">
                  <span>{l}</span>
                  <span className="font-semibold text-txt">${v}/kWh</span>
                </div>
                <Bar value={v as number} max={m as number} tone="brand" />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Illustrative />
    </>
  );
}

// ---------- Exposición y PaR ----------
export function Riesgo() {
  const { ask } = useApp();
  const [esc, setEsc] = useState<'Húmedo' | 'Medio' | 'Seco'>('Medio');
  const par = { Húmedo: 2.6, Medio: 3.9, Seco: 4.8 }[esc];

  return (
    <>
      <ViewHeader
        title="Exposición a bolsa y pérdida en riesgo (PaR)"
        desc="Monitoreo del porcentaje de demanda expuesto a precio de bolsa spot y métrica de Pérdida en Riesgo (PaR 95 % a 30 días) contra los límites de gobernanza."
        capa="enersinc_cliente"
        actions={
          <>
            <Tabs items={['Húmedo', 'Medio', 'Seco']} value={esc} onChange={setEsc} />
            <Btn onClick={() => ask('¿Cuál es mi exposición a bolsa en un escenario seco?')}>
              Preguntar al analista de riesgo
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Exposición a bolsa spot" value="21 %" tone="warn" hint="Límite máximo: 25 %" capa="enersinc_cliente" />
        <Kpi label={`PaR 95 % · 30 días (${esc})`} value={`$${par.toLocaleString('es-CO')} mil M`} tone={par > 4.5 ? 'bad' : 'warn'} capa="enersinc_cliente" />
        <Kpi label="Precio de escasez vigente" value="$1.172/kWh" hint="Techo de referencia CREG" capa="enersinc_cliente" />
        <Kpi label="Límites en alerta preventiva" value="1 de 4" tone="warn" capa="enersinc_cliente" />
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-4">
        <Panel className="lg:col-span-3" title="Curva de bolsa real y proyecciones hidrológicas ($/kWh)">
          <EscenariosChart h={260} />
        </Panel>

        <Panel className="lg:col-span-2" title="Gobernanza y límites de riesgo aprobados">
          <div className="space-y-4">
            {LIMITS.map(l => {
              const p = l.use / l.limit;
              return (
                <div key={l.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-txt">{l.name}</span>
                    <span className="num font-semibold">
                      {l.use.toLocaleString('es-CO')} / {l.limit} {l.unit}
                    </span>
                  </div>
                  <Bar value={l.use} max={l.limit} tone={p > 0.9 ? 'bad' : p > 0.75 ? 'warn' : 'ok'} />
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Illustrative />
    </>
  );
}

// ---------- Escenarios Hidrológicos ----------
export function EscenariosView() {
  const { ask } = useApp();
  return (
    <>
      <ViewHeader
        title="Escenarios hidrológicos del SIN"
        desc="Sensibilidad de los precios de bolsa y aportes hídricos ante condiciones secas (Fenómeno de El Niño), medias y húmedas en las cuencas del Sistema Interconectado Nacional."
        capa="enersinc_cliente"
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Proyección de precio de bolsa por escenario" className="lg:col-span-2">
          <EscenariosChart h={280} />
        </Panel>

        <Panel title="Premisas de los escenarios">
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-2.5 bg-paper rounded border border-line">
              <span className="font-bold text-bad block mb-0.5">Escenario Seco:</span>
              Aportes al 65 % de la media histórica. Despacho térmico forzado de 2.400 MW. Bolsa promedia $910 a $980/kWh.
            </div>
            <div className="p-2.5 bg-paper rounded border border-line">
              <span className="font-bold text-warn block mb-0.5">Escenario Medio:</span>
              Aportes al 95 % de la media. Hidráulicas regulando embalses a 64 %. Bolsa estimada en $690/kWh.
            </div>
            <div className="p-2.5 bg-paper rounded border border-line">
              <span className="font-bold text-ok block mb-0.5">Escenario Húmedo:</span>
              Aportes al 120 %. Vertimientos en cuencas de Antioquia y Oriente. Bolsa desciende hacia $220/kWh.
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-line">
            <Btn small kind="primary" onClick={() => ask('Simula el impacto de un escenario seco severo sobre nuestras garantías y posición neta.')}>
              Simular impacto en garantías
            </Btn>
          </div>
        </Panel>
      </div>

      <Illustrative />
    </>
  );
}

