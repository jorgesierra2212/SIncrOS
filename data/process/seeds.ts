import type { RegulatoryVersion } from '../types';
import type { NodeStatus } from '../workflowModels';
import type { Conversacion, Ejecucion, Envio, EstadoEnvio, ProcesoDef, Reporte } from './types';
import { SECUENCIA_ENVIO } from './types';
import { PROCESOS } from './catalog';

const pasoPendiente = (p: ProcesoDef) =>
  p.workflow.nodes.find(n => n.data.status === 'action_required')?.data.label ??
  p.workflow.nodes[p.workflow.nodes.length - 1].data.label;
const ultimoPaso = (p: ProcesoDef) => p.workflow.nodes[p.workflow.nodes.length - 1].data.label;

function calcularEstadoPorNodo(p: ProcesoDef, estado: Ejecucion['estado'], pasoActual: string): Record<string, NodeStatus> {
  const mapa: Record<string, NodeStatus> = {};
  const idxActual = p.workflow.nodes.findIndex(n => n.data.label === pasoActual);
  p.workflow.nodes.forEach((n, i) => {
    if (estado === 'Completada') {
      mapa[n.id] = 'completed';
    } else if (estado === 'Con error') {
      mapa[n.id] = i < p.workflow.nodes.length - 1 ? 'completed' : 'failed';
    } else if (estado === 'Esperando aprobación') {
      mapa[n.id] = n.data.status;
    } else {
      mapa[n.id] = i < idxActual ? 'completed' : i === idxActual ? 'running' : 'pending';
    }
  });
  return mapa;
}

// ---------- Ejecuciones ----------
function ejecucionesDe(p: ProcesoDef): Ejecucion[] {
  const e = (fecha: string, estado: Ejecucion['estado'], version?: RegulatoryVersion, publicadaXM?: string): Ejecucion => {
    const pasoActual = estado === 'Completada' ? ultimoPaso(p) : pasoPendiente(p);
    return {
      id: `${p.codigo}-${fecha}${version ? '-' + version : ''}`.replace(/\s+/g, ''),
      procesoId: p.id,
      fecha,
      version,
      publicadaXM,
      estado,
      pasoActual,
      iniciadaPor: estado === 'Completada' ? 'Agente (programado)' : 'Agente (por evento)',
      estadoPorNodo: calcularEstadoPorNodo(p, estado, pasoActual),
    };
  };
  if (p.versionado) {
    return [
      e('Octubre 2026', 'Esperando aprobación', 'TX2', '25-oct-2026'),
      e('Octubre 2026', 'Completada', 'TX1', '21-oct-2026'),
      e('Septiembre 2026', 'Completada', 'TX3', '08-oct-2026'),
      e('Septiembre 2026', 'Completada', 'TXR', '15-oct-2026'),
      e('Agosto 2026', 'Completada', 'TXF', '10-oct-2026'),
    ];
  }
  if (p.id === 'wf-garantias') {
    return [
      e('03-nov-2026', 'Esperando aprobación'),
      e('27-oct-2026', 'Completada'),
      e('20-oct-2026', 'Completada'),
    ];
  }
  if (p.dominio === 'Facturación') {
    return [
      e('Octubre 2026', 'Esperando aprobación'),
      e('Septiembre 2026', 'Completada'),
      e('Agosto 2026', 'Completada'),
    ];
  }
  return [
    e('26-oct-2026', 'Esperando aprobación'),
    e('25-oct-2026', 'Completada'),
    e('24-oct-2026', 'Completada'),
    e('23-oct-2026', p.id === 'wf-critica-m2c' || p.id === 'wf-srm' ? 'Con error' : 'Completada'),
  ];
}
export const EJECUCIONES_INICIALES: Ejecucion[] = PROCESOS.flatMap(ejecucionesDe);

// ---------- Envíos ----------
const hist = (estados: EstadoEnvio[], base: string): Envio['historial'] =>
  estados.map((estado, i) => ({
    estado,
    fecha: `${base} ${String(8 + i).padStart(2, '0')}:${i % 2 ? '12' : '05'}`,
    quien: estado === 'Aprobado' ? 'Aprobador del proceso' : 'Sistema',
  }));

export const ENVIOS_INICIALES: Envio[] = EJECUCIONES_INICIALES.flatMap((ej, i) => {
  const p = PROCESOS.find(x => x.id === ej.procesoId)!;
  const entidad = p.entidad ?? 'Agente';
  const docNombre = p.documentoEnvio ?? `Acta y soporte de cierre · ${p.nombre}`;
  const base = {
    id: `SOP-${2300 + i}`,
    procesoId: p.id,
    ejecucionId: ej.id,
    entidad,
    documento: `${docNombre} · ${ej.fecha}${ej.version ? ' ' + ej.version : ''}`,
    reintentos: 0,
  };
  const fecha = ej.publicadaXM ?? ej.fecha;
  if (ej.estado === 'Esperando aprobación') {
    return [{ ...base, estado: 'Preparado', historial: hist(['Preparado'], fecha) } as Envio];
  }
  if (ej.estado === 'Con error') {
    return [
      {
        ...base,
        estado: 'Rechazado',
        historial: hist(['Preparado', 'Aprobado', 'Enviado', 'Acuse recibido', 'Rechazado'], fecha),
        radicado: `XM-${88000 + i}`,
        motivoRechazo: 'Formato horario inválido en 2 fronteras (Frt-0533, Frt-0761).',
        evidencia: 'Acuse XM con código de rechazo R-204',
      } as Envio,
    ];
  }
  const radicado = entidad === 'DIAN' ? `CUFE ${(i * 7919).toString(16)}a9c…` : entidad === 'Agente' ? `ACTA-${1400 + i}` : `XM-${88000 + i}`;
  return [
    {
      ...base,
      estado: 'Aceptado',
      historial: hist(SECUENCIA_ENVIO, fecha),
      radicado,
      evidencia: entidad === 'DIAN' ? 'Acuse DIAN: documento validado' : entidad === 'Agente' ? 'Acta de cierre firmada y archivada' : 'Acuse XM: recibido y aceptado',
    } as Envio,
  ];
});

// ---------- Reportes ----------
export const REPORTES_INICIALES: Reporte[] = PROCESOS.flatMap(p => {
  const ejs = EJECUCIONES_INICIALES.filter(e => e.procesoId === p.id);
  const activa = ejs[0];
  const vivos: Reporte[] = p.plantillasReporte.map((t, k) => ({
    id: `REP-${p.codigo}-${k + 1}`,
    procesoId: p.id,
    ejecucionId: activa.id,
    titulo: t.titulo,
    tipo: t.tipo,
    estado: 'Vivo',
    version: 1,
    generadoPor: 'Actualizado por el agente',
    fecha: 'Hoy 07:40',
  }));
  const congelados: Reporte[] = ejs
    .filter(e => e.estado !== 'Esperando aprobación')
    .map((e, k) => ({
      id: `REP-${p.codigo}-H${k + 1}`,
      procesoId: p.id,
      ejecucionId: e.id,
      titulo: `${p.plantillasReporte[0].titulo} · ${e.fecha}${e.version ? ' ' + e.version : ''}`,
      tipo: 'tabla',
      estado: 'Congelado',
      version: 1,
      generadoPor: p.workflow.agentName,
      fecha: e.publicadaXM ?? e.fecha,
      formato: k % 2 ? 'pdf' : 'xlsx',
      snapshot: p.filas,
    }));
  return [...vivos, ...congelados];
});

// Sincronizar ejecuciones, envios y reportes en cada ProcessWorkflow
PROCESOS.forEach(p => {
  p.workflow.ejecuciones = EJECUCIONES_INICIALES.filter(e => e.procesoId === p.id).map(e => ({
    id: e.id,
    fecha: e.fecha,
    version: e.version,
    estadoPorNodo: e.estadoPorNodo ?? {},
    iniciadaPor: e.iniciadaPor,
  }));
  p.workflow.envios = ENVIOS_INICIALES.filter(e => e.procesoId === p.id);
  p.workflow.reportes = REPORTES_INICIALES.filter(r => r.procesoId === p.id);
});

// ---------- Conversaciones ----------
const ejActiva = (pid: string) => EJECUCIONES_INICIALES.find(e => e.procesoId === pid)!.id;
export const CONVERSACIONES_INICIALES: Conversacion[] = [
  {
    id: 'CONV-1',
    dueno: 'liq',
    duenoPersona: 'Andrés Rojas',
    procesoId: 'wf-liq-sombra',
    ejecucionId: ejActiva('wf-liq-sombra'),
    titulo: 'Diferencia de reconciliación positiva en TX2',
    compartidaCon: ['ger'],
    actualizada: 'Hoy 07:52',
    mensajes: [
      { role: 'user', text: '¿Por qué difiere la reconciliación positiva de la TX2?' },
      {
        role: 'agent',
        text: 'La diferencia se concentra en las horas 18 a 21 de la Unidad 2: la generación ideal se calculó con una disponibilidad declarada anterior a la redeclaración de las 16:42. Preparé la reclamación con la regla RecPos v14 y el soporte horario.',
        reply: {
          agent: 'Auditor de liquidación',
          text: '',
          steps: ['Descargó la TX2', 'Ejecutó RecPos v14', 'Recorrió el árbol de dependencias', 'Redactó la reclamación'],
        },
      },
    ],
  },
  {
    id: 'CONV-2',
    dueno: 'liq',
    duenoPersona: 'Andrés Rojas',
    procesoId: 'wf-liq-contratos',
    ejecucionId: ejActiva('wf-liq-contratos'),
    titulo: 'Condición de precio en contrato C-2026-031',
    compartidaCon: ['fin'],
    actualizada: 'Ayer 17:20',
    mensajes: [
      { role: 'user', text: '¿Por qué el contrato C-2026-031 tiene diferencia frente a lo liquidado por el ASIC?' },
      {
        role: 'agent',
        text: 'El contrato C-2026-031 tiene cláusula condicional por precio de bolsa (> $700/kWh). En las horas 12 a 14 la bolsa cerró en $645/kWh y el ASIC despachó 9,6 MWh adicionales.',
        reply: {
          agent: 'Contratos de largo plazo',
          text: '',
          steps: ['Consultó curva horaria de bolsa', 'Verificó cláusula 4.2 del contrato C-2026-031'],
        },
      },
    ],
  },
  {
    id: 'CONV-3',
    dueno: 'cgm',
    duenoPersona: 'Laura Méndez',
    procesoId: 'wf-critica-m2c',
    ejecucionId: ejActiva('wf-critica-m2c'),
    titulo: 'Desfase de reloj en Frt-0412',
    compartidaCon: ['enersinc'],
    actualizada: 'Hoy 05:20',
    mensajes: [
      { role: 'user', text: '¿Por qué Frt-0412 tiene desfase y cómo se estimó?' },
      {
        role: 'agent',
        text: 'El medidor principal quedó una hora atrasado desde el 18-oct. Para esas fechas se propone usar el medidor de respaldo bajo la regla CREG 038/2014 y abrir una visita técnica.',
        reply: {
          agent: 'Crítica de medida',
          text: '',
          steps: ['Comparó principal y respaldo', 'Detectó el patrón horario CREG 038'],
        },
      },
    ],
  },
  {
    id: 'CONV-4',
    dueno: 'fin',
    duenoPersona: 'Diana Pérez',
    procesoId: 'wf-garantias',
    ejecucionId: ejActiva('wf-garantias'),
    titulo: 'Faltante de garantías del 3-nov',
    compartidaCon: ['liq', 'ger'],
    actualizada: 'Hoy 07:10',
    mensajes: [
      { role: 'user', text: '¿Cuánto falta provisionar para la semana del 3-nov?' },
      {
        role: 'agent',
        text: 'Faltan $612 M: la proyección es de $3.418 M frente a $2.806 M provisionados, con bolsa promedio de $910/kWh según la regla CREG 159/2011.',
        reply: {
          agent: 'Proyección de garantías',
          text: '',
          steps: ['Proyectó posición', 'Calculó la garantía', 'Comparó con lo provisionado'],
        },
      },
    ],
  },
  {
    id: 'CONV-5',
    dueno: 'cgm',
    duenoPersona: 'Laura Méndez',
    procesoId: 'wf-srm',
    ejecucionId: ejActiva('wf-srm'),
    titulo: 'Validación de 12 fronteras estimadas en SRM diario',
    compartidaCon: ['ger'],
    actualizada: 'Hoy 08:05',
    mensajes: [
      { role: 'user', text: '¿Cuáles son las 12 fronteras estimadas con respaldo en el archivo SRM de hoy?' },
      {
        role: 'agent',
        text: 'Las 12 fronteras corresponden a 2 fronteras de generación (incluyendo Frt-0412) y 10 de consumo UNR con falla temporal de módem GPRS, todas respaldadas con medidor R1 calibrado conforme a la CREG 038/2014.',
        reply: {
          agent: 'Agente de Reporte SRM',
          text: '',
          steps: ['Verificó lecturas R1 de las 12 fronteras', 'Validó esquema XML v4.2 de XM'],
        },
      },
    ],
  },
  {
    id: 'CONV-6',
    dueno: 'despacho',
    duenoPersona: 'Camila Ortiz',
    procesoId: 'wf-despacho-d1',
    ejecucionId: ejActiva('wf-despacho-d1'),
    titulo: 'Redeclaración de disponibilidad Térmica Norte U2',
    compartidaCon: ['liq', 'ger'],
    actualizada: 'Hoy 06:35',
    mensajes: [
      { role: 'user', text: '¿Por qué se ajustó la disponibilidad de Térmica Norte U2 a 120 MW?' },
      {
        role: 'agent',
        text: 'Por restricción operativa reportada en presión de gasoducto para las horas 17 a 21. La oferta D-1 ante el CND incorpora los 120 MW conforme a la CREG 025/1995.',
        reply: {
          agent: 'Agente de Despacho y Ofertas',
          text: '',
          steps: ['Consultó bitácora SCADA', 'Preparó archivo de oferta horaria D-1'],
        },
      },
    ],
  },
];
