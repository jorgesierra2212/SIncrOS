import type { Layer } from './types';

// Datos ilustrativos del dominio Plataforma y Gobernanza
export * from './mock/skills';
export * from './mock/plugins';
export * from './mock/tasks';
export * from './mock/approvals';
export * from './mock/traces';
export * from './mock/platform';
export * from './mock/files';
export * from './mock/artifacts';
export * from './mock/agents';

export interface AuditRecord {
  when: string;
  who: string;
  what: string;
  version: string;
  capa: Layer;
  ip?: string;
}

export const AUDIT_INITIAL: AuditRecord[] = [
  { when: 'Hoy 10:45', who: 'Agente · Crítica de medida', what: 'Ejecutó sondeo automático de comunicaciones de 1.284 fronteras (Nivel 3)', version: 'sk-cgm-01 v2', capa: 'nucleo', ip: '10.200.0.4' },
  { when: 'Hoy 08:35', who: 'Agente · Cargos y facturación', what: 'Detectó fallo en conector ERP SAP y generó ticket TK-802 (Nivel 2)', version: 'sk-fac-06 v1', capa: 'enersinc_cliente', ip: '10.200.0.12' },
  { when: 'Hoy 08:02', who: 'Agente · Reporte SRM', what: 'Generó ART-118 y envió solicitud de aprobación A-1043 a Laura Méndez', version: 'sk-cgm-04 v3', capa: 'nucleo', ip: '10.200.0.8' },
  { when: 'Hoy 07:40', who: 'Agente · Auditor de liquidación', what: 'Preparó reclamación formal ART-104 (v2) y creó aprobación A-1042', version: 'RecPos v14', capa: 'nucleo', ip: '10.200.0.10' },
  { when: 'Hoy 07:31', who: 'Agente · Auditor de liquidación', what: 'Comparó TX2 de 21-oct: detectó 3 diferencias sobre umbral ($48,4 M en RecPos)', version: 'sk-liq-03 v4', capa: 'nucleo', ip: '10.200.0.10' },
  { when: 'Ayer 18:10', who: 'Andrés Rojas (Liquidación)', what: 'Aprobó corrección de despacho contrato condicional C-2026-019', version: 'Contrato v2.1', capa: 'cliente', ip: '190.144.22.18' },
  { when: 'Ayer 16:02', who: 'Gerencia comercial', what: 'Elevó nivel de autonomía de Mesa de ayuda a Nivel 3 (autónomo)', version: 'Admin v1', capa: 'cliente', ip: '190.144.22.10' },
  { when: '23-oct 11:20', who: 'Carlos Varela (Admin)', what: 'Configuró conector XM SRM API con token JWT renovado', version: 'Conector v4', capa: 'nucleo', ip: '190.144.22.15' },
];

export const ROLES_MATRIX = [
  { action: 'Enviar archivo al SRM (XM)', cgm: 'Aprueba', liq: '—', fin: '—', ger: 'Ve', admin: 'Configura', agente: 'Ejecuta (N2)' },
  { action: 'Radicar reclamación ante el ASIC', cgm: '—', liq: 'Aprueba', fin: '—', ger: 'Ve', admin: 'Ve', agente: 'Prepara (N1)' },
  { action: 'Emitir facturas y enviar al ERP', cgm: '—', liq: '—', fin: 'Aprueba', ger: 'Ve', admin: 'Ve', agente: 'Prepara (N2)' },
  { action: 'Cambiar regla del motor (CREG)', cgm: '—', liq: 'Propone', fin: '—', ger: 'Aprueba', admin: 'Audita', agente: '—' },
  { action: 'Crear / Editar plugins cliente', cgm: 'Propone', liq: 'Propone', fin: 'Propone', ger: 'Ve', admin: 'Aprueba', agente: 'Prueba (Auto)' },
  { action: 'Subir nivel de autonomía agente', cgm: 'Propone', liq: 'Propone', fin: 'Propone', ger: 'Aprueba', admin: 'Aplica', agente: '—' },
  { action: 'Personalizar marca blanca', cgm: '—', liq: '—', fin: '—', ger: 'Aprueba', admin: 'Aplica', agente: '—' },
];

export const MODELS = [
  { task: 'Conversación y explicación en lenguaje natural', model: 'Modelo configurado', why: 'Velocidad, fluidez en español de Colombia y citación de normas CREG', provider: 'Servidor configurado' },
  { task: 'Traducción a SQL sobre BigQuery Lake', model: 'Modelo configurado', why: 'Costo-eficiencia y generación de esquemas analíticos', provider: 'Servidor configurado' },
  { task: 'Revisión y razonamiento de discrepancias TX', model: 'Modelo configurado', why: 'Trazabilidad y no alucinación de montos', provider: 'Servidor configurado' },
];
