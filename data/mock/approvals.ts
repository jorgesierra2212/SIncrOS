import { Layer, PluginManifest, SkillFicha, TaskItem, SupportTicket, Conector, ArchivoItem, BrandConfig, ExecutionTrace, MarketDateState } from '../types';

// ---------- Bandeja de Aprobaciones (Evidencia Completa) ----------
export interface Approval {
  id: string;
  agent: string;
  title: string;
  severity: 'Alta' | 'Media' | 'Baja';
  amount?: number;
  due: string;
  role: string;
  proposal: string;
  artifact?: string;
  capa: Layer;
  ruleApplied: string;
  ruleVersion: string;
  evidence: { label: string; value: string }[];
  comments?: string[];
}

export const APPROVALS: Approval[] = [
  {
    id: 'A-1042',
    agent: 'Auditor de liquidación',
    title: 'Diferencia en reconciliación positiva · TX2 del 21-oct',
    severity: 'Alta',
    amount: 48_350_000,
    due: 'Vence en 2 días hábiles ante el ASIC',
    role: 'Analista de liquidación',
    proposal: 'Radicar reclamación formal ante el ASIC con soporte de cálculo horario y redeclaración IDO',
    artifact: 'ART-104',
    capa: 'nucleo',
    ruleApplied: 'Resolución CREG 024/1995 · Reconciliación Positiva',
    ruleVersion: 'RecPos · v14 · vigente desde 01-ene-2026',
    evidence: [
      { label: 'Calculado Enersinc (Sombra)', value: '$1.332,9 M' },
      { label: 'Liquidado XM (Oficial TX2)', value: '$1.284,5 M' },
      { label: 'Diferencia neta reclamable', value: '+$48,35 M' },
      { label: 'Regla y versión aplicada', value: 'RecPos · v14 (CREG 024 / CREG 051)' },
      { label: 'Causa primaria aislada', value: 'Generación ideal calculada con disponibilidad declarada previa a redeclaración de 16:42 (Unidad 2, horas 18–21)' },
      { label: 'Ejecutado por', value: 'Agente Auditor de liquidación (Nivel 2)' },
      { label: 'Aprobador requerido', value: 'Andrés Rojas (Analista de liquidación) — Principio: Quien ejecuta no aprueba' },
    ],
  },
  {
    id: 'A-1043',
    agent: 'Reporte SRM',
    title: 'Envío diario al SRM · 1.284 fronteras · 12 con lectura estimada',
    severity: 'Media',
    due: 'Hoy antes de las 10:00 COT',
    role: 'Operadora CGM',
    proposal: 'Transmitir archivo estructurado al API del Sistema Registro de Medidas de XM',
    artifact: 'ART-118',
    capa: 'nucleo',
    ruleApplied: 'Código de Medida CREG 038/2014',
    ruleVersion: 'Protocolo SRM v4.2',
    evidence: [
      { label: 'Fronteras con lectura íntegra', value: '1.272 de 1.284 (99,06 %)' },
      { label: 'Lecturas estimadas', value: '12 con jerarquía de respaldo (R1/R2)' },
      { label: 'Discrepancia telemedida vs reportado', value: '0,04 %' },
      { label: 'Validación de esquema sintáctico', value: 'Aprobada sin observaciones' },
      { label: 'Ejecutado por', value: 'Agente Reporte SRM (Nivel 2)' },
      { label: 'Aprobador requerido', value: 'Laura Méndez (Operadora CGM)' },
    ],
  },
  {
    id: 'A-1044',
    agent: 'Crítica de medida',
    title: 'Desfase horario en Frt-0412 · Medidor principal',
    severity: 'Media',
    due: 'Hoy antes de las 17:00 COT',
    role: 'Operadora CGM',
    proposal: 'Aplicar telemedida de medidor de respaldo para días 18-oct a 22-oct y programar orden de visita técnica',
    artifact: 'ART-121',
    capa: 'nucleo',
    ruleApplied: 'CREG 038/2014 · Sustitución de medidas comerciales',
    ruleVersion: 'Regla Crítica_Desfase_v3',
    evidence: [
      { label: 'Patrón anómalo', value: 'Curva desplazada 1 hora reloj desde el 18-oct 03:00' },
      { label: 'Divergencia principal vs respaldo', value: '6,8 % de diferencia sostenida' },
      { label: 'Energía total comprometida', value: '41,2 MWh' },
      { label: 'Medidor de respaldo', value: 'Elster A1800 · Certificado calibración vigente' },
      { label: 'Aprobador requerido', value: 'Laura Méndez (Operadora CGM)' },
    ],
  },
  {
    id: 'A-1045',
    agent: 'Proyección de garantías',
    title: 'Garantía semanal proyectada supera provisión en $612 M',
    severity: 'Alta',
    amount: 612_000_000,
    due: 'Lunes 27-oct 12:00 COT',
    role: 'Finanzas y facturación',
    proposal: 'Aprobar provisión adicional de $612 M en caja para la semana comercial del 3-noviembre',
    artifact: 'ART-110',
    capa: 'enersinc_cliente',
    ruleApplied: 'Resolución CREG 159/2011 · Mecanismos de Cobertura MEM',
    ruleVersion: 'Regla Gar_Sem v2',
    evidence: [
      { label: 'Proyección de garantía Enersinc', value: '$3.418 M' },
      { label: 'Cupo provisionado en banco', value: '$2.806 M' },
      { label: 'Supuesto de precio de bolsa', value: '$910/kWh promedio semanal' },
      { label: 'Riesgo de ejecución', value: 'Suspensión del agente ante el MEM si no se cubre el lunes 27-oct' },
      { label: 'Aprobador requerido', value: 'Diana Pérez (Finanzas) / Gerencia Comercial' },
    ],
  },
  {
    id: 'A-1046',
    agent: 'Cargos y facturación',
    title: 'Lote de 38 prefacturas de clientes no regulados (octubre)',
    severity: 'Baja',
    amount: 2_940_000_000,
    due: 'Día 5 hábil',
    role: 'Finanzas y facturación',
    proposal: 'Autorizar generación de XML DIAN y registro contable en ERP SAP',
    capa: 'enersinc_cliente',
    ruleApplied: 'Fórmula tarifaria CREG 119/2007',
    ruleVersion: 'Matriz_Oct_2026',
    evidence: [
      { label: 'Prefacturas auditadas', value: '38 de 38 conformes' },
      { label: 'Variación vs mes anterior', value: '+11,4 % (alineado con incremento de demanda)' },
      { label: 'Notas crédito por reliquidación', value: '2 notas por $14,2 M' },
      { label: 'Aprobador requerido', value: 'Diana Pérez (Finanzas)' },
    ],
  },
  {
    id: 'A-1047',
    agent: 'Contratos de largo plazo',
    title: 'Despacho de contrato C-2026-031 fuera de regla condicional',
    severity: 'Media',
    due: 'Mañana 09:00 COT',
    role: 'Analista de liquidación',
    proposal: 'Corregir registro de despacho de las horas 12–14 del 22-octubre en el sistema comercial',
    capa: 'enersinc_cliente',
    ruleApplied: 'Contrato Bilateral Condicional C-2026-031 Cláusula 4.2',
    ruleVersion: 'C_Cond v3',
    evidence: [
      { label: 'Condición contractual', value: 'Despacha solo si precio de bolsa > $700/kWh' },
      { label: 'Horas liquidadas erróneamente', value: 'Horas 12, 13 y 14 (Bolsa fue $645/kWh)' },
      { label: 'Energía a reliquidar', value: '9,6 MWh ($3,5 M)' },
      { label: 'Aprobador requerido', value: 'Andrés Rojas (Analista de liquidación)' },
    ],
  },
];
