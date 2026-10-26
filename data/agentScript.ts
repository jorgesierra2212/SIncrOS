// Orquestador y enrutador agéntico de Enersinc OS.
// Integra llamada a /api/chat (servidor con Modelo configurado) enviando procesoId y ejecucionId,
// y usa respuestas guionadas cuando no hay clave configurada.

import type { ArchivoItem } from './types';

export type InlineChart = 'bolsa' | 'diferencias' | 'garantias' | 'fronteras' | 'escenarios';

export interface AgentReply {
  agent: string;
  text: string;
  steps: string[];
  chart?: InlineChart;
  artifact?: string;
  approval?: string;
  layer?: 'nucleo' | 'enersinc_cliente' | 'cliente';
  commandUsed?: string;
  mentionUsed?: string;
  attachedCount?: number;
}

export interface ChatMsg {
  role: 'user' | 'agent';
  text: string;
  reply?: AgentReply;
  files?: ArchivoItem[];
  command?: string;
  mention?: string;
}

export interface PredefinedQnA {
  id: string;
  category: 'Liquidación y XM' | 'Medida y CGM' | 'Contratos y Facturación' | 'Garantías y Finanzas' | 'Despacho y Operación';
  roleRecommended: string;
  question: string;
  shortDesc: string;
  reply: AgentReply;
}

export { PREDEFINED_QNAS } from './agentQnas';
import { PREDEFINED_QNAS } from './agentQnas';

export const SUGGESTIONS = PREDEFINED_QNAS.slice(0, 5).map(q => q.question);

export const AVAILABLE_COMMANDS = [
  { cmd: '/liquidar', desc: 'Compara la versión publicada de XM con el cálculo sombra propio', agent: 'Auditor de liquidación' },
  { cmd: '/srm', desc: 'Prepara y valida el archivo para el Sistema Registro de Medidas', agent: 'Reporte SRM' },
  { cmd: '/garantias', desc: 'Calcula la proyección semanal y la brecha ante el ASIC', agent: 'Proyección de garantías' },
  { cmd: '/facturar', desc: 'Genera prefacturas y valida componentes CU (G, T, D, C, P, R)', agent: 'Cargos y facturación' },
  { cmd: '/ofertar', desc: 'Construye la curva de precio de oferta y disponibilidad por hora', agent: 'Agente de despacho y ofertas' },
  { cmd: '/despacho', desc: 'Compara despacho programado frente a real y alerta desbalances', agent: 'Agente de despacho y ofertas' },
];

export const AVAILABLE_MENTIONS = [
  { tag: '@aud-liq', name: 'Auditor de liquidación', team: 'Liquidación' },
  { tag: '@critica', name: 'Crítica de medida', team: 'CGM' },
  { tag: '@srm', name: 'Reporte SRM', team: 'CGM' },
  { tag: '@despacho-ag', name: 'Agente de despacho y ofertas', team: 'Despacho' },
  { tag: '@garantias', name: 'Proyección de garantías', team: 'Liquidación' },
  { tag: '@facturacion', name: 'Cargos y facturación', team: 'Finanzas' },
  { tag: '@mesa', name: 'Mesa de ayuda', team: 'CGM' },
];

const has = (t: string, ...k: string[]) => k.some(x => t.includes(x));

export function respondLocally(
  input: string,
  attachedFiles: ArchivoItem[] = [],
  command?: string,
  mention?: string,
  viewContext: string = 'inicio',
  procesoId?: string,
  ejecucionId?: string
): AgentReply {
  const norm = input.trim().toLowerCase();
  const ctxPrefix = ejecucionId ? `[Contexto ejecución ${ejecucionId}] ` : '';

  const exactMatch = PREDEFINED_QNAS.find(
    q =>
      q.question.toLowerCase() === norm ||
      norm.includes(q.question.toLowerCase()) ||
      (q.question.toLowerCase().includes(norm) && norm.length > 15)
  );
  if (exactMatch) {
    return {
      ...exactMatch.reply,
      steps: [
        ...(ejecucionId ? [`Cargó contexto del proceso ${procesoId} (${ejecucionId})`] : []),
        ...exactMatch.reply.steps,
      ],
    };
  }

  if (command === '/liquidar' || has(norm, '/liquidar') || procesoId === 'wf-liq-sombra' || procesoId === 'wf-reclamaciones') {
    if (has(norm, 'tx2', 'liquidaci', 'reconcilia', 'art-104', 'diferencia', 'reclam', 'umbral', 'por qué')) {
      return {
        agent: 'Auditor de liquidación',
        layer: 'nucleo',
        text: `${ctxPrefix}En la liquidación sombra contra la versión publicada por XM se detectaron 3 conceptos sobre el umbral de $5 M. La mayor diferencia está en Reconciliación Positiva (+$48,35 M, Calculado $1.332,9 M vs XM $1.284,5 M) en las horas 18 a 21 de la Unidad 2, porque XM empleó la disponibilidad previa a la redeclaración IDO de las 16:42 (regla RecPos v14, CREG 024/1995). El expediente borrador está listo para revisión y aprobación.`,
        steps: [
          `Consultó ejecución activa ${ejecucionId || 'TX2'} del proceso ${procesoId || 'wf-liq-sombra'}`,
          'Ejecutó motor de reglas CREG 024 con fórmula RecPos v14',
          'Aisló diferencia horaria en Unidad 2 (H18–H21)',
          'Preparó soporte para revisión del Aprobador',
        ],
        chart: 'diferencias',
        artifact: 'ART-104',
        approval: 'A-1042',
      };
    }
  }

  if (command === '/srm' || has(norm, '/srm', 'srm', '12 fronteras') || procesoId === 'wf-srm') {
    return {
      agent: 'Agente de Reporte SRM',
      layer: 'nucleo',
      text: `${ctxPrefix}Se consolidaron las 1.284 fronteras comerciales para transmisión al SRM de XM. 1.272 cuentan con telemedida principal íntegra y 12 fueron estimadas usando el medidor de respaldo R1 conforme a la jerarquía de la Resolución CREG 038/2014 (incluyendo Frt-0412 y Frt-0761). El archivo cumple el esquema XML v4.2 y espera aprobación antes de las 10:00 COT.`,
      steps: [
        `Verificó ejecución ${ejecucionId || 'diaria'} del proceso Reporte SRM diario`,
        'Aplicó jerarquía de respaldo R1 (CREG 038/2014) en 12 fronteras',
        'Validó sintaxis XML v4.2 y sumatorias horarias',
        'Dejó envío en estado Preparado para firma del Aprobador',
      ],
      chart: 'fronteras',
      artifact: 'ART-118',
      approval: 'A-1043',
    };
  }

  if (procesoId === 'wf-critica-m2c' || has(norm, 'frt-0412', 'desfase', 'reloj', 'frontera', 'critica', 'crítica')) {
    return {
      agent: 'Crítica de medida',
      layer: 'nucleo',
      text: `${ctxPrefix}En la crítica de medida de las 1.284 fronteras se detectó un desfase de 1 hora reloj en el medidor principal de la frontera Frt-0412 (divergencia de 6,8 % frente al respaldo, 41,2 MWh comprometidos). Se propone sustituir con la curva del medidor de respaldo Elster A1800 calibrado según CREG 038/2014.`,
      steps: [
        `Analizó datos de la ejecución ${ejecucionId || 'activa'} en Crítica de medida`,
        'Comparó curva horaria de medidor principal vs respaldo',
        'Propuso sustitución auditada bajo CREG 038/2014',
      ],
      chart: 'fronteras',
      artifact: 'ART-121',
      approval: 'A-1044',
    };
  }

  if (command === '/garantias' || has(norm, '/garantias', 'garant', 'provisi', 'faltante') || procesoId === 'wf-garantias') {
    return {
      agent: 'Agente de Proyección de Garantías',
      layer: 'enersinc_cliente',
      text: `${ctxPrefix}Conforme a la Resolución CREG 159/2011, la garantía proyectada para la semana del 3 de noviembre es de $3.418 M frente a $2.806 M provisionados (faltante de $612 M con bolsa media de $910/kWh). Si la bolsa promedia $750/kWh, la obligación baja a $2.950 M. La decisión de provisión espera aprobación de Finanzas.`,
      steps: [
        `Consultó ejecución ${ejecucionId || 'semanal'} de Garantías semanales`,
        'Proyectó posición neta horaria y compras en bolsa',
        'Calculó cobertura semanal con regla Gar_Sem v2 (CREG 159/2011)',
        'Registró propuesta de provisión por $612 M',
      ],
      chart: 'garantias',
      artifact: 'ART-110',
      approval: 'A-1045',
    };
  }

  if (command === '/facturar' || has(norm, '/facturar', 'prefactura', 'dian', 'nota crédito', 'unr') || procesoId === 'wf-facturacion' || procesoId === 'wf-liq-unr') {
    return {
      agent: 'Agente de Cargos y Facturación',
      layer: 'enersinc_cliente',
      text: `${ctxPrefix}El lote de 38 prefacturas ($2.940 M, +11,4 % frente al mes anterior) y los componentes tarifarios CU (G, T, D, C, P, R según CREG 119/2007) están validados. Incluye 2 notas crédito propuestas. La emisión electrónica hacia la DIAN y el envío del hecho económico al ERP requieren estado Aprobado.`,
      steps: [
        `Auditó registros de la ejecución ${ejecucionId || 'mensual'}`,
        'Verificó tarifas CU (CREG 119/2007) y contratos bilaterales',
        'Preparó lote de facturación electrónica DIAN UBL 2.1',
      ],
      artifact: 'ART-115',
      approval: 'A-1046',
    };
  }

  if (procesoId === 'wf-liq-contratos' || has(norm, 'contrato', 'sicep', 'c-2026')) {
    return {
      agent: 'Contratos de largo plazo',
      layer: 'enersinc_cliente',
      text: `${ctxPrefix}En la liquidación de contratos bilaterales (CREG 130/2019), el contrato condicional C-2026-031 presenta una diferencia de $3,5 M (9,6 MWh en horas 12 a 14 cuando la bolsa estuvo en $645/kWh, por debajo del umbral de $700/kWh). Se preparó el ajuste para aprobación antes de enviar la cuenta de cobro a la contraparte.`,
      steps: [
        `Revisó ejecución ${ejecucionId || 'activa'} de Liquidación de contratos`,
        'Verificó topes horarios y reglas de indexación IPP/IPC/Bolsa',
        'Preparó cuenta de cobro hacia contraparte agente',
      ],
      approval: 'A-1047',
    };
  }

  if (command === '/ofertar' || command === '/despacho' || procesoId === 'wf-despacho-d1' || has(norm, 'oferta', 'disponibilidad', 'despacho', 'planta')) {
    return {
      agent: 'Agente de Despacho y Ofertas',
      layer: 'enersinc_cliente',
      text: `${ctxPrefix}Para el despacho D-1 ante el CND (CREG 025/1995), la disponibilidad declarada total es de 695 MW. La Unidad 2 de Planta Térmica Norte fue ajustada a 120 MW por restricción de presión de gas entre las horas 17 y 21. El archivo de oferta espera firma del Aprobador para su envío a XM (CND).`,
      steps: [
        `Consultó ejecución ${ejecucionId || 'D-1'} de Oferta diaria de despacho`,
        'Consolidó disponibilidad técnica SCADA y costos marginales de combustible',
        'Preparó archivo de oferta horaria para transmisión al CND',
      ],
      chart: 'escenarios',
      artifact: 'ART-101',
    };
  }

  if (attachedFiles.length > 0) {
    const file = attachedFiles[0];
    return {
      agent: 'Analista de datos y archivos',
      layer: 'nucleo',
      text: `${ctxPrefix}Recibí el archivo "${file.nombre}" (${file.tipo.toUpperCase()}, ${file.tamano}). Sus registros fueron validados contra el esquema del proceso ${viewContext} y están listos para incorporarse en la tabla de datos y en la bitácora del agente.`,
      steps: [
        `Asoció archivo adjunto a la ejecución ${ejecucionId || 'activa'}`,
        'Validó columnas y formato regulatorio MEM',
        'Actualizó contexto de la conversación',
      ],
      attachedCount: attachedFiles.length,
    };
  }

  return {
    agent: mention ? AVAILABLE_MENTIONS.find(m => m.tag === mention)?.name || 'Agente del Proceso' : 'Agente del Proceso',
    layer: 'nucleo',
    text: `${ctxPrefix}Analicé su consulta en el contexto de ${viewContext}. Todos los cálculos se respaldan en las reglas CREG vigentes y las publicaciones de XM. Recuerde que los pasos humanos y los envíos hacia XM, DIAN o contrapartes requieren estado Aprobado por el rol autorizado.`,
    steps: [
      `Consultó estado actual de ${viewContext}${ejecucionId ? ` (${ejecucionId})` : ''}`,
      'Verificó trazabilidad de datos, reportes vivos y envíos',
      'Formuló recomendación sujeta a aprobación humana',
    ],
  };
}

export async function askAgent(
  text: string,
  history: ChatMsg[] = [],
  attachedFiles: ArchivoItem[] = [],
  command?: string,
  mention?: string,
  viewContext: string = 'inicio',
  procesoId?: string,
  ejecucionId?: string
): Promise<AgentReply> {
  // Llamar siempre a /api/chat enviando procesoId y ejecucionId; si no hay clave configurada, usar respuestas guionadas.
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        prompt: text,
        history: history.slice(-4),
        attachedFiles,
        command,
        mention,
        viewContext,
        procesoId,
        ejecucionId,
      }),
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (!data.fallback && data.reply?.text) {
        return {
          agent: data.reply.agent || 'Agente del Proceso',
          text: data.reply.text,
          steps: data.reply.steps || [`Consultó proceso ${procesoId || viewContext}`, 'Propuesta generada'],
          chart: data.reply.chart || undefined,
          artifact: data.reply.artifact || undefined,
          approval: data.reply.approval || undefined,
          layer: 'nucleo',
        };
      }
    }
  } catch {
    // Fallback local guionado cuando no hay conexión o clave
  }

  return respondLocally(text, attachedFiles, command, mention, viewContext, procesoId, ejecucionId);
}
