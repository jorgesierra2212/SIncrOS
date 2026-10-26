import React, { useState } from 'react';
import { X, Download, Pin, History, Share2, Check, FileDown, Layers } from 'lucide-react';
import { ARTIFACTS, SETTLEMENT, cop, FRONTIERS, RECPOS_TREE, FormulaNode } from '../data/mock';
import { BolsaChart, EmbalseChart, DiffChart, GarantiasChart, AnomalyChart, EscenariosChart } from './charts';
import { Badge, Table, StatusBadge, LayerBadge } from './ui';
import { useApp } from './context';
import { exportArtifactToPDF, exportTableToExcel } from '../utils/export';

function Tree({ node, depth = 0 }: { node: FormulaNode; depth?: number }) {
  return (
    <div className={depth ? 'ml-4 border-l border-line pl-3' : ''}>
      <div className="py-1">
        <span className={`text-sm ${depth === 0 ? 'font-semibold text-brand' : 'text-txt'}`}>
          {node.name}
        </span>
        {node.source && <div className="text-xs text-mut">{node.source}</div>}
      </div>
      {node.children?.map(c => (
        <Tree key={c.name} node={c} depth={depth + 1} />
      ))}
    </div>
  );
}

function Body({ kind, artifactId }: { kind: string; artifactId: string }) {
  const { go } = useApp();

  switch (kind) {
    case 'grafico-bolsa':
      return (
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold mb-1 text-txt">
              Generación mensual por tecnología y precio de bolsa
            </h4>
            <BolsaChart h={220} />
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1 text-txt">
              Precio mediano según nivel de embalse ($/kWh)
            </h4>
            <EmbalseChart h={200} />
          </div>
          <p className="text-xs text-mut bg-paper/60 p-2 rounded border border-line">
            Fuente prevista: Sinergox / XM SIN. Las hidráulicas ofertan según su valor del agua.
          </p>
        </div>
      );

    case 'reclamacion':
      return (
        <article className="text-[13.5px] leading-relaxed space-y-3 bg-white p-3 rounded border border-line">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <span className="text-xs font-semibold text-warn bg-warnsoft px-2 py-0.5 rounded">
              Borrador formal · Requiere aprobación
            </span>
            <span className="text-xs text-mut">Plazo: 2 días hábiles</span>
          </div>
          <div>
            <span className="font-semibold text-mut text-xs block">Para:</span>
            <p className="font-medium text-txt">
              Administrador del Sistema de Intercambios Comerciales (ASIC) · XM S.A. E.S.P.
            </p>
          </div>
          <div>
            <span className="font-semibold text-mut text-xs block">Asunto:</span>
            <p className="font-semibold text-txt">
              Solicitud de revisión formal de liquidación TX2 del 21-octubre-2026 · Concepto Reconciliación Positiva
            </p>
          </div>
          <p>
            Respetados señores: De manera atenta solicitamos revisar la liquidación por concepto de Reconciliación Positiva para la Unidad 2 de Planta Térmica Norte en la versión TX2 del 21 de octubre.
          </p>
          <div className="grid grid-cols-2 gap-2 my-2 bg-paper p-2 rounded text-xs">
            <div>
              <span className="text-mut">Liquidado XM (TX2):</span>
              <div className="font-semibold text-bad">$1.284,5 M</div>
            </div>
            <div>
              <span className="text-mut">Calculado Enersinc:</span>
              <div className="font-semibold text-ok">$1.332,9 M</div>
            </div>
            <div className="col-span-2 border-t border-line/60 pt-1">
              <span className="text-mut">Diferencia reclamada:</span>
              <span className="font-bold text-brand ml-1">+$48,35 M COP</span>
            </div>
          </div>
          <p>
            La inconsistencia se concentra en las horas 18 a 21, donde la generación ideal liquidada utilizó la disponibilidad declarada previa a la redeclaración registrada ante el CND a las 16:42 COT (120 MW).
          </p>
          <div className="bg-brandsoft/50 rounded p-2.5 text-xs text-txt border border-brand/20">
            <div className="font-semibold text-brand">Fundamento normativo:</div>
            <div>Resolución CREG 024/1995 · Fórmulas de Reconciliación v14 vigentes.</div>
            <div>Anexos: Curva horaria SCADA, acuse IDO 16:42 y liquidación sombra.</div>
          </div>
          <button
            onClick={() => go('bandeja')}
            className="w-full mt-2 py-1.5 bg-brand text-white rounded text-xs font-semibold hover:bg-[#1d4bb8] transition-colors"
          >
            Ir a la Bandeja de Aprobación (A-1042)
          </button>
        </article>
      );

    case 'tabla-diferencias':
      return (
        <div className="space-y-4">
          <DiffChart h={200} />
          <Table
            head={['Concepto', 'Diferencia']}
            align={['l', 'r']}
            rows={SETTLEMENT.map(s => [
              s.concepto,
              <span className={`font-semibold ${s.calc - s.xm > 5e6 ? 'text-warn' : 'text-txt'}`}>
                {cop(s.calc - s.xm)}
              </span>,
            ])}
            exportFileName="diferencias_liquidacion_octubre.xlsx"
            exportRawData={SETTLEMENT.map(s => ({
              Concepto: s.concepto,
              Calculado_Propio: s.calc,
              Liquidado_XM: s.xm,
              Diferencia: s.calc - s.xm,
            }))}
          />
        </div>
      );

    case 'garantias':
      return (
        <div className="space-y-3">
          <GarantiasChart h={240} />
          <div className="bg-warnsoft text-warn p-3 rounded text-xs border border-warn/30">
            <span className="font-semibold block mb-0.5">Alerta de provisión:</span>
            Faltan <b>$612 M</b> para respaldar la semana del 3 de noviembre con precio de bolsa medio proyectado a $910/kWh.
          </div>
        </div>
      );

    case 'escenarios':
      return (
        <div className="space-y-3">
          <EscenariosChart h={240} />
          <div className="bg-paper p-3 rounded text-xs border border-line">
            <p>
              Exposición actual: <b>21 %</b> de la demanda atendida. En escenario seco la exposición se incrementa hacia el 24,5 % rozando el límite de política (25 %).
            </p>
          </div>
        </div>
      );

    case 'hoja-vida': {
      const f = FRONTIERS[3];
      return (
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-2 bg-paper p-3 rounded border border-line">
            <div>
              <span className="text-mut text-xs">Código SIC</span>
              <div className="font-semibold text-txt">{f.code}</div>
            </div>
            <div>
              <span className="text-mut text-xs">Tipo de frontera</span>
              <div className="font-medium text-txt">{f.type}</div>
            </div>
            <div>
              <span className="text-mut text-xs">Medidor principal</span>
              <div className="font-medium text-txt">{f.brand} (A1800)</div>
            </div>
            <div>
              <span className="text-mut text-xs">Crítica diaria</span>
              <div>
                <StatusBadge s={f.critica} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-mut uppercase tracking-wider mb-1">
              Desfase horaria · Principal vs Respaldo (21-oct)
            </h4>
            <AnomalyChart h={180} />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-mut uppercase tracking-wider mb-1.5">
              Historial de eventos y calibración
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex gap-2">
                <span className="font-mono text-mut shrink-0">22-oct</span>
                <span>Agente propone usar medidor de respaldo y abrir orden de inspección</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-mut shrink-0">18-oct</span>
                <span>Inicio de desfase horario (+1 hora) en medidor principal</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-mut shrink-0">02-sep</span>
                <span>Calibración quinquenal de transformadores de corriente conforme CREG 038</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-mut shrink-0">15-mar</span>
                <span>Registro formal de la frontera comercial ante el ASIC</span>
              </li>
            </ul>
          </div>
        </div>
      );
    }

    case 'archivo-srm':
      return (
        <div className="space-y-3">
          <div className="flex gap-1.5 flex-wrap">
            <Badge tone="ok">Formato validado v4.2</Badge>
            <Badge tone="warn">12 lecturas estimadas</Badge>
            <Badge tone="brand">1.284 fronteras</Badge>
          </div>
          <pre className="text-[11.5px] bg-ink text-[#D7E0EE] rounded p-3 overflow-x-auto leading-relaxed font-mono">
            {`CODIGO_SIC;FECHA_MEDIDA;H01;H02;H03;...;H24;ORIGEN_MEDIDA;CHECKSUM
Frt-0118;2026-10-23;412.3;398.1;391.0;...;455.2;TELEMEDIDA;8F2A
Frt-0412;2026-10-23;380.4;361.9;355.2;...;402.7;RESPALDO_ELSTER;9C11
Frt-0533;2026-10-23;0.0;0.0;0.0;...;0.0;TELEMEDIDA;33B0
Frt-0761;2026-10-23;88.1;86.4;85.9;...;97.3;ESTIMADA_R2;A109
...`}
          </pre>
          <p className="text-xs text-mut">
            Estructura conforme al manual técnico de recolección de medidas del ASIC/XM.
          </p>
        </div>
      );

    case 'formula':
      return (
        <div className="space-y-4">
          <div className="bg-paper p-3 rounded font-mono text-xs border border-line text-txt">
            RecPos[h] = max(0, GenReal[h] − GenIdeal[h]) × PrecioRec[h]
          </div>
          <div>
            <h4 className="text-xs font-semibold text-mut uppercase tracking-wider mb-2">
              Árbol de Dependencias del Motor de Reglas
            </h4>
            <div className="bg-white p-3 rounded border border-line">
              <Tree node={RECPOS_TREE} />
            </div>
          </div>
          <button
            onClick={() => go('motor')}
            className="text-brand text-xs font-semibold hover:underline block"
          >
            Abrir en el editor de fórmulas del motor de reglas →
          </button>
        </div>
      );

    case 'reporte-pruebas':
      return (
        <div className="space-y-3">
          <div className="p-3 bg-badsoft/50 text-bad rounded border border-bad/30 text-xs">
            <span className="font-semibold block mb-1">
              Pruebas automáticas bloqueadas para pase a producción:
            </span>
            La coincidencia frente a datos de referencia históricos es del <b>91,2 %</b>, inferior al umbral obligatorio del <b>95 %</b>.
          </div>
          <div className="bg-paper p-3 rounded border border-line space-y-2 text-xs">
            <div className="flex justify-between">
              <span>(1) Casos de prueba aprobados (≥ 95 %):</span>
              <span className="font-semibold text-bad">66,7 % ✘</span>
            </div>
            <div className="flex justify-between">
              <span>(2) Coincidencia datos liquidados (≥ 95 %):</span>
              <span className="font-semibold text-bad">91,2 % ✘</span>
            </div>
            <div className="flex justify-between">
              <span>(3) Permisos dentro de lo declarado:</span>
              <span className="font-semibold text-ok">Conforme ✔</span>
            </div>
            <div className="flex justify-between">
              <span>(4) Sin datos sensibles en salidas:</span>
              <span className="font-semibold text-ok">Sin fuga ✔</span>
            </div>
          </div>
          <p className="text-xs text-mut">
            Para promover a producción, ajuste el algoritmo en el Estudio de Plugins y reejecute los tests.
          </p>
        </div>
      );

    default:
      return null;
  }
}

export default function ArtifactPanel({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { artifactsList, pinArtifact, profile } = useApp();
  const [showVersions, setShowVersions] = useState(false);
  const [copied, setCopied] = useState(false);

  const a = artifactsList.find(x => x.id === id) || ARTIFACTS.find(x => x.id === id);
  if (!a) return null;

  const isPinned = profile.pinned.includes(a.id);

  const handleDownload = () => {
    // Generate real PDF of the artifact
    const lines = [
      `Título: ${a.title}`,
      `ID: ${a.id} | Versión: ${a.version} | Propietario: ${a.owner}`,
      `Compartido con: ${a.shared.join(', ')}`,
      `Última actualización: ${a.updated}`,
      '--------------------------------------------------------------------------------',
      'CONTENIDO DEL ARTEFACTO (CERTIFICADO POR ENERSINC OS):',
      'Este documento ha sido generado por el sistema operativo agéntico Enersinc OS.',
      'Contiene la evidencia completa de los cálculos, datos utilizados y reglas normativas CREG aplicadas.',
      'Validez comercial sujeta a aprobación humana en la Bandeja correspondiente.',
    ];
    exportArtifactToPDF(a.title, lines, `${a.id}_v${a.version}.pdf`, {
      id: a.id,
      version: a.version,
      author: a.owner,
      layer: a.capa,
    });
  };

  const handleShare = () => {
    setCopied(true);
    navigator.clipboard?.writeText?.(window.location.href);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      className="fixed xl:static inset-y-0 right-0 z-40 w-full sm:w-[460px] shrink-0 bg-white border-l border-line flex flex-col shadow-2xl xl:shadow-none"
      aria-label="Artefacto abierto"
    >
      <header className="px-4 py-3 border-b border-line bg-paper/20">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-mut">
              <span>{a.id}</span>
              <span>·</span>
              <span>v{a.version}</span>
              <span>·</span>
              <span>{a.updated}</span>
              <LayerBadge capa={a.capa} compact />
            </div>
            <h2 className="text-[15.5px] font-semibold leading-snug mt-1 text-txt">
              {a.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar visor de artefacto"
            className="text-mut hover:text-txt p-1 rounded hover:bg-paper"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shared with */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-xs text-mut">Compartido con:</span>
          {a.shared.map(s => (
            <Badge key={s} tone="brand">
              {s}
            </Badge>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-line/60">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1 text-xs border border-line bg-white rounded px-2.5 py-1 hover:bg-paper font-medium text-txt transition-colors shadow-2xs"
            title="Descargar este artefacto en formato PDF oficial"
          >
            <Download size={13} /> Descargar PDF
          </button>

          <button
            onClick={() => pinArtifact(a.id)}
            className={`inline-flex items-center gap-1 text-xs border rounded px-2.5 py-1 font-medium transition-colors shadow-2xs ${
              isPinned
                ? 'bg-brand text-white border-brand'
                : 'border-line bg-white text-txt hover:bg-paper'
            }`}
            title="Fijar o desfijar en la barra lateral"
          >
            <Pin size={13} /> {isPinned ? 'Fijado' : 'Fijar'}
          </button>

          <button
            onClick={() => setShowVersions(v => !v)}
            className="inline-flex items-center gap-1 text-xs border border-line bg-white rounded px-2.5 py-1 hover:bg-paper font-medium text-txt transition-colors shadow-2xs"
            title="Ver historial de versiones"
          >
            <History size={13} /> Versiones
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 text-xs border border-line bg-white rounded px-2.5 py-1 hover:bg-paper font-medium text-txt transition-colors shadow-2xs ml-auto"
            title="Copiar enlace o compartir"
          >
            {copied ? <Check size={13} className="text-ok" /> : <Share2 size={13} />}
            {copied ? 'Copiado' : 'Compartir'}
          </button>
        </div>

        {/* Versions dropdown */}
        {showVersions && (
          <div className="mt-2.5 p-2 bg-paper rounded border border-line text-xs animate-in fade-in">
            <span className="font-semibold block mb-1 text-mut">Historial de versiones:</span>
            <div className="space-y-1">
              <div className="flex justify-between text-txt font-medium bg-white p-1 rounded border border-line">
                <span>v{a.version} (Actual)</span>
                <span className="text-mut">{a.updated}</span>
              </div>
              {a.historicoVersiones?.map(h => (
                <div key={h.version} className="flex justify-between text-mut p-1">
                  <span>v{h.version} · {h.notas}</span>
                  <span>{h.fecha}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <Body kind={a.kind} artifactId={a.id} />
      </div>

      <footer className="px-4 py-2 border-t border-line text-xs text-mut bg-paper/20 flex items-center justify-between">
        <span>Creado por {a.owner}</span>
        <LayerBadge capa={a.capa} compact />
      </footer>
    </aside>
  );
}
