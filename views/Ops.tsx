import React, { useState } from 'react';
import { Lock, Palette, Shield, Sparkles, History, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../components/context';
import { Panel, Kpi, Btn, Table, ViewHeader, StatusBadge, Badge, LayerBadge, Illustrative } from '../components/ui';
import { BolsaChart, EmbalseChart, PlantChart } from '../components/charts';
import { PLANTS, ROLES_MATRIX, MODELS, BRAND_PRESETS, num } from '../data/mock';
import type { BrandConfig } from '../data/types';

// ---------- Supervisión de Plantas (Solo Lectura) ----------
export function Supervision() {
  const { ask } = useApp();
  return (
    <>
      <ViewHeader
        title="Supervisión de plantas de generación"
        desc="Monitoreo de telemetría SCADA y portales de inversores en tiempo real conectado con lo comercial. Cada desviación se traduce en exposición y en dinero. No envía comandos físicos a la planta."
        capa="nucleo"
        actions={<Badge tone="neutral"><Lock size={12} /> Solo lectura (Air-gapped)</Badge>}
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
              {num(p.real, 1)} <span className="text-xs font-normal text-mut">MW</span>
            </div>
            <div className="text-xs text-mut mt-1">
              Despacho: {p.desp} MW · Disponible: {p.disp} MW
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mt-4">
        <Panel className="lg:col-span-3" title="Planta térmica Norte · U2 · Generación horaria vs Despacho">
          <PlantChart h={260} />
        </Panel>
        <Panel className="lg:col-span-2" title="Impacto comercial estimado">
          <p className="text-xs text-txt leading-relaxed">
            La Unidad 2 genera <b>21,6 MW</b> por debajo del despacho desde las 17:00 COT por una restricción imprevista de presión de gas. Si se mantiene hasta las 21:00:
          </p>
          <ul className="text-xs mt-3 space-y-1.5 bg-paper p-3 rounded border border-line">
            <li><span className="text-mut">Desviación acumulada:</span> <b>108 MWh</b></li>
            <li><span className="text-mut">Costo estimado en bolsa:</span> <b>$98 M COP</b></li>
            <li><span className="text-mut">Efecto en reconciliación:</span> <b className="text-bad">Pérdida de $31 M</b></li>
          </ul>
          <div className="mt-3 bg-brandsoft/30 rounded p-2.5 text-xs text-txt border border-brand/20">
            <span className="font-semibold text-brand block mb-0.5">Propuesta del agente de despacho:</span>
            Redeclarar disponibilidad a 120 MW ante el CND y notificar a Liquidación para amparo regulatorio CREG 024.
          </div>
          <div className="flex gap-2 mt-4">
            <Btn kind="primary" onClick={() => ask('Notifica la redeclaración de disponibilidad de Térmica Norte U2 y prepara soporte horario.')}>
              Notificar al operador CND
            </Btn>
          </div>
        </Panel>
      </div>

      <Illustrative />
    </>
  );
}

// ---------- Bolsa e Hidrología ----------
export function Mercado() {
  const { ask, openArtifact } = useApp();
  return (
    <>
      <ViewHeader
        title="Bolsa e hidrología del SIN"
        desc="Información pública del Mercado de Energía Mayorista (MEM) y curvas horarias de precios spot, embalses y recurso marginal."
        capa="nucleo"
        actions={
          <>
            <Btn onClick={() => openArtifact('ART-101')}>
              Abrir artefacto (ART-101)
            </Btn>
            <Btn kind="primary" onClick={() => ask('¿Cómo afecta el nivel de los embalses al precio de bolsa?')}>
              Preguntar al analista de mercado
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Bolsa promedio · oct" value="$690/kWh" hint="Septiembre: $905/kWh" capa="nucleo" />
        <Kpi label="Embalse útil agregado" value="64 %" tone="warn" hint="Bajando 7 puntos en el mes" capa="nucleo" />
        <Kpi label="Participación térmica" value="31 %" hint="Generación de seguridad" capa="nucleo" />
        <Kpi label="Precio de escasez CREG" value="$1.172/kWh" hint="Referencia mensual" capa="nucleo" />
      </div>

      <Panel className="mt-4" title="Generación mensual por tecnología y precio de bolsa spot ($/kWh)">
        <BolsaChart h={300} />
      </Panel>

      <Panel className="mt-4" title="Precio mediano según nivel de embalse útil ($/kWh)">
        <EmbalseChart h={240} />
      </Panel>

      <Illustrative />
    </>
  );
}

// ---------- Administración y Marca Blanca ----------
export function Admin() {
  const { brand, setBrand, updateBrand, auditLog, addAudit, profile } = useApp();
  const [tab, setTab] = useState<'marca' | 'roles' | 'modelos' | 'auditoria'>('marca');

  // White-label form state
  const [nombre, setNombre] = useState(brand.nombreProducto);
  const [logoIcon, setLogoIcon] = useState<BrandConfig['logoIcon']>(brand.logoIcon);
  const [colorPrimario, setColorPrimario] = useState(brand.colorPrimario);
  const [colorSecundario, setColorSecundario] = useState(brand.colorSecundario);
  const [tipografia, setTipografia] = useState(brand.tipografia);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const applyBrandSettings = () => {
    updateBrand({
      nombreProducto: nombre,
      logoIcon,
      colorPrimario,
      colorSecundario,
      tipografia,
    });
    addAudit(profile.person, `Actualizó la marca blanca en vivo: ${nombre} (${colorPrimario})`, 'Marca v2', 'cliente');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const loadPreset = (presetKey: 'enersinc' | 'cliente_demo') => {
    const p = BRAND_PRESETS[presetKey];
    setNombre(p.nombreProducto);
    setLogoIcon(p.logoIcon);
    setColorPrimario(p.colorPrimario);
    setColorSecundario(p.colorSecundario);
    setTipografia(p.tipografia);
    setBrand(p);
    addAudit(profile.person, `Aplicó preset de marca blanca: ${p.nombreProducto}`, 'Preset', 'cliente');
  };

  return (
    <>
      <ViewHeader
        title="Administración y gobernanza"
        desc="Personalización de marca blanca en vivo mediante variables CSS, matriz de roles y segregación, modelos de IA por tarea y registro inmutable de auditoría."
        capa="nucleo"
      />

      {/* Sub tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[
          ['marca', 'Marca blanca'],
          ['roles', 'Roles y permisos'],
          ['modelos', 'Modelos por tarea'],
          ['auditoria', `Registro de auditoría (${auditLog.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              tab === key
                ? 'bg-ink text-white shadow-xs font-semibold'
                : 'bg-white border border-line text-mut hover:text-txt'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'marca' && (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Brand Form */}
          <Panel className="lg:col-span-3" title="Personalización de Marca Blanca (En vivo)">
            <p className="text-xs text-mut mb-4 leading-relaxed">
              Modifique el nombre del producto, el logotipo y la paleta de colores. Los cambios se propagan inmediatamente a todo el shell y componentes vía variables CSS.
            </p>

            {/* Presets */}
            <div className="mb-4 p-3 bg-paper rounded border border-line">
              <span className="text-xs font-semibold text-mut uppercase tracking-wider block mb-2">
                Temas de ejemplo preconfigurados:
              </span>
              <div className="flex flex-wrap gap-2">
                <Btn small onClick={() => loadPreset('enersinc')}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2459D6]" /> Tema "Enersinc" (Azul oficial)
                </Btn>
                <Btn small onClick={() => loadPreset('cliente_demo')}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" /> Tema "Cliente demo" (Enerco Verde)
                </Btn>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-txt block mb-1">Nombre del producto comercial</label>
                <input
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full p-2 border border-line rounded outline-none focus:border-brand font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-txt block mb-1">Ícono del logotipo</label>
                  <div className="flex gap-2">
                    {(['E', '⚡', '☀️', '🔋'] as const).map(ico => (
                      <button
                        key={ico}
                        type="button"
                        onClick={() => setLogoIcon(ico)}
                        className={`w-9 h-9 rounded-md border text-sm font-bold flex items-center justify-center transition-colors ${
                          logoIcon === ico ? 'border-brand bg-brandsoft text-brand ring-2 ring-brand/30' : 'border-line bg-white'
                        }`}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-txt block mb-1">Tipografía principal</label>
                  <select
                    value={tipografia}
                    onChange={e => setTipografia(e.target.value as any)}
                    className="w-full p-2 border border-line rounded outline-none focus:border-brand bg-white text-xs"
                  >
                    <option value="IBM Plex Sans">IBM Plex Sans (Oficial)</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="System">System UI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-txt block mb-1">Color primario (Botones y destacados)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorPrimario}
                      onChange={e => setColorPrimario(e.target.value)}
                      className="w-8 h-8 rounded border border-line cursor-pointer p-0.5"
                    />
                    <input
                      value={colorPrimario}
                      onChange={e => setColorPrimario(e.target.value)}
                      className="p-1.5 border border-line rounded font-mono text-xs w-28 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-txt block mb-1">Color secundario (Barra lateral)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorSecundario}
                      onChange={e => setColorSecundario(e.target.value)}
                      className="w-8 h-8 rounded border border-line cursor-pointer p-0.5"
                    />
                    <input
                      value={colorSecundario}
                      onChange={e => setColorSecundario(e.target.value)}
                      className="p-1.5 border border-line rounded font-mono text-xs w-28 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-between">
                {savedSuccess ? (
                  <span className="text-ok font-semibold inline-flex items-center gap-1 text-xs">
                    <Check size={14} /> Marca aplicada en vivo a todo el shell
                  </span>
                ) : (
                  <span className="text-mut text-[11px]">Se actualizan las variables CSS en tiempo real</span>
                )}
                <Btn kind="primary" onClick={applyBrandSettings}>
                  Aplicar cambios en vivo
                </Btn>
              </div>
            </div>
          </Panel>

          {/* Live Preview Card */}
          <Panel className="lg:col-span-2" title="Vista previa del branding">
            <div className="p-4 rounded-lg text-white" style={{ backgroundColor: colorSecundario }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-8 h-8 rounded-md grid place-items-center font-bold text-sm text-white"
                  style={{ backgroundColor: colorPrimario }}
                >
                  {logoIcon}
                </div>
                <div>
                  <div className="font-semibold text-sm leading-tight">{nombre}</div>
                  <div className="text-[10px] text-[#8C9BB0]">Mercado Eléctrico Colombiano</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#B9C4D4] border-t border-white/10 pt-2.5">
                <div className="p-1.5 rounded bg-white/10 text-white font-medium">
                  Inicio · Resumen ejecutivo
                </div>
                <div className="p-1.5 rounded hover:bg-white/5">Liquidación sombra TX2</div>
                <div className="p-1.5 rounded hover:bg-white/5">Fronteras y medida (MDM)</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-paper rounded border border-line text-xs">
              <span className="font-semibold text-txt block mb-1">Muestra de botón primario:</span>
              <button
                type="button"
                className="px-3 py-1.5 rounded text-white font-medium text-xs shadow-2xs"
                style={{ backgroundColor: colorPrimario }}
              >
                Acción del Agente ({nombre})
              </button>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'roles' && (
        <Panel title="Matriz de roles y segregación de funciones (SoD)" pad={false}>
          <Table
            head={['Acción del Negocio MEM', 'Operadora CGM', 'Liquidación', 'Finanzas', 'Gerencia', 'Admin Cliente', 'Agente Autónomo']}
            rows={ROLES_MATRIX.map(r => [
              <span className="font-medium text-xs">{r.action}</span>,
              r.cgm,
              r.liq,
              r.fin,
              r.ger,
              r.admin,
              <Badge tone={r.agente.includes('Ejecuta') ? 'brand' : 'neutral'}>{r.agente}</Badge>,
            ])}
          />
        </Panel>
      )}

      {tab === 'modelos' && (
        <Panel title="Modelos de IA por tarea (Arquitectura agnóstica)" pad={false}>
          <Table
            head={['Tarea Operativa', 'Modelo Asignado', 'Proveedor', 'Criterio de Selección']}
            rows={MODELS.map(m => [
              <span className="font-semibold text-xs">{m.task}</span>,
              <span className="font-mono text-brand font-medium">{m.model}</span>,
              m.provider,
              m.why,
            ])}
          />
        </Panel>
      )}

      {tab === 'auditoria' && (
        <Panel title="Registro de auditoría inmutable (Compliance MEM)" pad={false}>
          <Table
            head={['Marca Temporal', 'Actor / Agente', 'Acción Auditada', 'Versión / Regla', 'Capa']}
            align={['l', 'l', 'l', 'l', 'l']}
            rows={auditLog.map(a => [
              <span className="font-mono text-xs text-mut">{a.when}</span>,
              <span className="font-semibold text-xs text-txt">{a.who}</span>,
              a.what,
              <span className="font-mono text-xs text-brand">{a.version}</span>,
              <LayerBadge capa={a.capa} compact />,
            ])}
            exportFileName="registro_auditoria_inmutable.xlsx"
            exportRawData={auditLog}
          />
        </Panel>
      )}

      <Illustrative />
    </>
  );
}
