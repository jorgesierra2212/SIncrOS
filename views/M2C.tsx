import React, { useState } from 'react';
import { useApp } from '../components/context';
import { Panel, Kpi, Table, ViewHeader, StatusBadge, Tabs, Badge, Illustrative } from '../components/ui';
import { FRONTIERS, END_USERS, cop, num } from '../data/mock';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

// ---------- Fronteras y Medida (Tablero de consulta) ----------
export function Fronteras() {
  const { openArtifact } = useApp();
  const [f, setF] = useState<'Todas' | 'Alertas' | 'Caídas'>('Todas');
  const rows = FRONTIERS.filter(x => f === 'Todas' || (f === 'Alertas' ? x.critica !== 'OK' : x.com === 'Caída'));

  return (
    <>
      <ViewHeader
        title="Fronteras y medida (MDM)"
        desc="Gestión técnica y comercial de las 1.284 fronteras comerciales del agente: telemetría cada 15 min, estado de módems, crítica y hoja de vida."
        capa="nucleo"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Fronteras activas" value="1.284" hint="Generación, consumo, AGR y excedentes" capa="nucleo" />
        <Kpi label="Comunicación OK" value="97,9 %" hint="Telemetría en tiempo real" tone="ok" capa="nucleo" />
        <Kpi label="Alertas de crítica" value="21" hint="Priorizadas por energía afectada" tone="warn" capa="nucleo" />
        <Kpi label="Sin comunicación" value="6" hint="Visitas técnicas programadas: 2" tone="bad" capa="nucleo" />
      </div>

      <Panel
        className="mt-4"
        pad={false}
        title="Inventario de fronteras comerciales"
        action={<Tabs items={['Todas', 'Alertas', 'Caídas']} value={f} onChange={setF} />}
      >
        <Table
          head={['Código SIC', 'Nombre de la Sede / Planta', 'Tipo de Frontera', 'Marca Medidor', 'Enlace', 'Última Lectura', 'Crítica', 'kWh Día']}
          align={['l', 'l', 'l', 'l', 'l', 'l', 'l', 'r']}
          onRow={i => rows[i].code === 'Frt-0412' && openArtifact('ART-121')}
          rows={rows.map(x => [
            <span className="font-semibold text-xs text-brand">{x.code}</span>,
            x.name,
            x.type,
            x.brand,
            <StatusBadge s={x.com} />,
            x.lastRead,
            <StatusBadge s={x.critica} />,
            num(x.kwh),
          ])}
          exportFileName="fronteras_medida_1284.xlsx"
          exportRawData={rows.map(x => ({
            Codigo_SIC: x.code,
            Nombre: x.name,
            Tipo: x.type,
            Marca_Medidor: x.brand,
            Comunicacion: x.com,
            Ultima_Lectura: x.lastRead,
            Critica: x.critica,
            Energia_Dia_kWh: x.kwh,
          }))}
        />
      </Panel>
      <p className="text-xs text-mut mt-2">Haga clic en cualquier fila (ej. Frt-0412) para abrir su hoja de vida y telemetría en el visor derecho.</p>
      <Illustrative />
    </>
  );
}

// ---------- Auditoría AENC ----------
const AENC = Array.from({ length: 14 }, (_, i) => {
  const t = 4200 + Math.round(Math.sin(i / 2) * 180);
  return { dia: `${11 + i}-oct`, telemedida: t, reportada: t - (i === 9 ? 0 : 2), tx2: i === 9 ? t - 96 : t - 3 };
});

export function AENC_View() {
  return (
    <>
      <ViewHeader
        title="Auditoría tripartita AENC"
        desc="Comparación diaria entre energía telemedida en frontera, reportada al SRM y liquidada por XM en TX2, TXR y TXF para sustentar reclamaciones comerciales."
        capa="enersinc_cliente"
      />

      <Panel title="Balance tripartito de energía de octubre (MWh)">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={AENC} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#E3E7EC" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={44} domain={[3900, 4500]} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="telemedida" name="Telemedida en frontera" fill="#9DB4EE" />
            <Line dataKey="reportada" name="Reportada al SRM" stroke="#0F1E33" dot={false} strokeWidth={2} />
            <Line dataKey="tx2" name="Liquidada por XM (TX2)" stroke="#B8372B" dot={{ r: 3 }} strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      <Panel className="mt-4" title="Discrepancias detectadas sobre umbral de auditoría" pad={false}>
        <Table
          head={['Día', 'Frontera', 'Telemedida', 'Liquidada XM', 'Diferencia neta', 'Acción']}
          align={['l', 'l', 'r', 'r', 'r', 'l']}
          rows={[
            ['20-oct', 'Frt-0118', '412,3 MWh', '316,1 MWh', '−96,2 MWh', <Badge tone="bad">Reclamar ante ASIC</Badge>],
            ['14-oct', 'Frt-0533', '88,0 MWh', '86,9 MWh', '−1,1 MWh', <Badge>Bajo umbral (Conforme)</Badge>],
          ]}
          exportFileName="auditoria_aenc_discrepancias.xlsx"
        />
      </Panel>

      <Illustrative />
    </>
  );
}

// ---------- Informe Anual de Fronteras ----------
export function InformeAnualView() {
  return (
    <>
      <ViewHeader
        title="Informe anual de fronteras comerciales"
        desc="Compilado reglamentario anual exigido por la Resolución CREG 038/2014 sobre disponibilidad de telemetría, inspecciones y calibración de transformadores."
        capa="enersinc_cliente"
      />

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <Kpi label="Conformidad CREG 038" value="99,4 %" tone="ok" capa="enersinc_cliente" />
        <Kpi label="Transformadores TC/TP calibrados" value="100 %" tone="ok" capa="enersinc_cliente" />
        <Kpi label="Visitas de inspección en campo" value="48 / 48" hint="Al día según cronograma" capa="enersinc_cliente" />
      </div>

      <Panel title="Capítulos del informe anual de fronteras">
        <div className="space-y-3 text-xs">
          {[
            { cap: 'Capítulo 1: Disponibilidad de telemedida', desc: 'Registro horario de continuidad de comunicaciones (meta >= 98% superada con 98,6%)', estado: 'Conforme' },
            { cap: 'Capítulo 2: Calibración de equipos de medida', desc: 'Certificados de calibración de medidores principales y de respaldo emitidos por laboratorios acreditados', estado: 'Al día' },
            { cap: 'Capítulo 3: Inspecciones y mantenimiento', desc: 'Bitácora de sellos de seguridad, visitas técnicas preventivas y correctivas en fronteras', estado: 'Conforme' },
          ].map(c => (
            <div key={c.cap} className="p-3 bg-paper rounded border border-line flex items-center justify-between">
              <div>
                <span className="font-semibold text-txt">{c.cap}</span>
                <p className="text-mut text-[11px] mt-0.5">{c.desc}</p>
              </div>
              <StatusBadge s={c.estado} />
            </div>
          ))}
        </div>
      </Panel>

      <Illustrative />
    </>
  );
}

// ---------- Usuarios Finales ----------
export function Usuarios() {
  return (
    <>
      <ViewHeader
        title="Usuarios finales y componentes tarifarios"
        desc="Desagregación del Costo Unitario de Prestación del Servicio (CU) en sus 6 componentes regulados CREG 119/2007: G, T, D, C, P y R."
        capa="enersinc_cliente"
      />

      <Panel pad={false} title="Liquidación tarifaria de octubre ($/kWh y total por usuario)">
        <Table
          head={['Usuario Final', 'Mercado', 'kWh Consumidos', 'G ($)', 'T ($)', 'D ($)', 'C ($)', 'P ($)', 'R ($)', 'Total Facturado']}
          align={['l', 'l', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r']}
          rows={END_USERS.map(u => {
            const tarifa = u.G + u.T + u.D + u.C + u.P + u.R;
            return [
              <span className="font-semibold text-xs text-txt">{u.user}</span>,
              u.market,
              num(u.kwh),
              `$${u.G}`,
              `$${u.T}`,
              `$${u.D}`,
              `$${u.C}`,
              `$${u.P}`,
              `$${u.R}`,
              <span className="font-bold text-brand">{cop(tarifa * u.kwh)}</span>,
            ];
          })}
          exportFileName="usuarios_finales_componentes_cu.xlsx"
          exportRawData={END_USERS.map(u => ({
            Usuario: u.user,
            Mercado: u.market,
            Consumo_kWh: u.kwh,
            G_Generacion: u.G,
            T_Transmision: u.T,
            D_Distribucion: u.D,
            C_Comercializacion: u.C,
            P_Perdidas: u.P,
            R_Restricciones: u.R,
            Total_Facturado_COP: (u.G + u.T + u.D + u.C + u.P + u.R) * u.kwh,
          }))}
        />
      </Panel>
      <p className="text-xs text-mut mt-2">
        Componentes oficiales CREG: <b>G</b> generación · <b>T</b> transmisión · <b>D</b> distribución · <b>C</b> comercialización · <b>P</b> pérdidas · <b>R</b> restricciones.
      </p>
      <Illustrative />
    </>
  );
}
