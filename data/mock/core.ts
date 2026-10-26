import { Layer } from '../types';

// Todos los datos de este archivo son ILUSTRATIVOS para el mockup de Enersinc OS.
// En producción provienen del núcleo de datos (BigQuery) y del motor de reglas.

export type ViewId =
  | 'bandeja' | 'agentes' | 'tareas' | 'artefactos'
  | 'despacho_prog_real' | 'despacho_redespacho' | 'despacho_intradiario'
  | 'motor' | 'usuarios'
  | 'fronteras' | 'aenc' | 'informe_anual'
  | 'contratos' | 'posicion' | 'sicep' | 'riesgo' | 'escenarios'
  | 'supervision' | 'mercado'
  | 'plugins' | 'integraciones' | 'archivos' | 'soporte' | 'admin'
  | 'proceso' | 'mis_conversaciones' | 'equipos';

export type Group = 'Mi bandeja' | 'Procesos' | 'Mis conversaciones' | 'Tableros' | 'Equipos' | 'Plataforma';

export type ViewType = 'trabajo' | 'proceso' | 'tablero' | 'configuracion';

export const VIEWS: Record<ViewId, { label: string; group: Group; desc: string; capa: Layer; tipo: ViewType }> = {
  bandeja: { label: 'Mi bandeja', group: 'Mi bandeja', desc: 'Pasos humanos y aprobaciones asignados a la persona actual, de todos sus procesos.', capa: 'nucleo', tipo: 'trabajo' },
  proceso: { label: 'Proceso', group: 'Procesos', desc: 'Espacio de trabajo del proceso con sus siete pestañas.', capa: 'nucleo', tipo: 'proceso' },
  mis_conversaciones: { label: 'Mis conversaciones', group: 'Mis conversaciones', desc: 'Conversaciones propias y compartidas, ligadas a procesos y ejecuciones.', capa: 'nucleo', tipo: 'trabajo' },
  equipos: { label: 'Equipos', group: 'Equipos', desc: 'Miembros, roles por proceso y procesos compartidos.', capa: 'nucleo', tipo: 'configuracion' },

  // Tableros
  mercado: { label: 'Bolsa e hidrología', group: 'Tableros', desc: 'Precio de bolsa spot, embalse agregado del SIN y recurso marginal.', capa: 'nucleo', tipo: 'tablero' },
  posicion: { label: 'Posición y MtM', group: 'Tableros', desc: 'Posición neta horaria y valoración a mercado contra la curva de precios.', capa: 'enersinc_cliente', tipo: 'tablero' },
  riesgo: { label: 'Exposición y PaR', group: 'Tableros', desc: 'Exposición de la demanda a bolsa y pérdida en riesgo ante límites.', capa: 'enersinc_cliente', tipo: 'tablero' },
  escenarios: { label: 'Escenarios', group: 'Tableros', desc: 'Sensibilidad ante hidrología seca, media y húmeda en el SIN.', capa: 'enersinc_cliente', tipo: 'tablero' },
  supervision: { label: 'Supervisión de plantas', group: 'Tableros', desc: 'Monitoreo de generación real y disponibilidad en tiempo real (solo lectura).', capa: 'nucleo', tipo: 'tablero' },
  contratos: { label: 'Libro de contratos', group: 'Tableros', desc: 'Contratos bilaterales, compras/ventas, indexaciones y registro ASIC.', capa: 'enersinc_cliente', tipo: 'tablero' },
  fronteras: { label: 'Fronteras', group: 'Tableros', desc: 'Estado de comunicación, lecturas y hoja de vida de cada frontera comercial.', capa: 'nucleo', tipo: 'tablero' },

  // Vistas auxiliares de consulta y plataforma
  despacho_prog_real: { label: 'Despacho programado vs real', group: 'Tableros', desc: 'Seguimiento horario de generación real contra despacho programado e ideal.', capa: 'enersinc_cliente', tipo: 'tablero' },
  despacho_redespacho: { label: 'Redespacho y restricciones', group: 'Tableros', desc: 'Redespachos ordenados por seguridad de red o restricciones de combustible.', capa: 'enersinc_cliente', tipo: 'tablero' },
  despacho_intradiario: { label: 'Mercado intradiario', group: 'Tableros', desc: 'Ajuste de posiciones en ventanas continuas de negociación horaria (preparada).', capa: 'enersinc_cliente', tipo: 'tablero' },
  motor: { label: 'Motor de reglas', group: 'Plataforma', desc: 'Fórmulas versionadas por vigencia CREG, árbol de dependencias y pruebas.', capa: 'nucleo', tipo: 'tablero' },
  usuarios: { label: 'Tarifa usuarios finales', group: 'Tableros', desc: 'Desagregación de la tarifa por componentes CU (G, T, D, C, P, R).', capa: 'enersinc_cliente', tipo: 'tablero' },
  aenc: { label: 'Auditoría AENC', group: 'Tableros', desc: 'Cruce tripartito: telemedida vs lo reportado al SRM vs liquidado por XM.', capa: 'enersinc_cliente', tipo: 'tablero' },
  informe_anual: { label: 'Informe anual de fronteras', group: 'Tableros', desc: 'Consolidado anual de calidad de la medida y calibración de transformadores.', capa: 'enersinc_cliente', tipo: 'tablero' },
  sicep: { label: 'SICEP Convocatorias', group: 'Tableros', desc: 'Convocatorias públicas estandarizadas de largo plazo y ofertas del agente.', capa: 'enersinc_cliente', tipo: 'tablero' },

  // Plataforma
  agentes: { label: 'Agentes y skills', group: 'Plataforma', desc: 'Procedimientos, niveles de autonomía y desempeño de cada agente.', capa: 'nucleo', tipo: 'configuracion' },
  tareas: { label: 'Tareas programadas', group: 'Plataforma', desc: 'Ejecuciones automáticas por horario cron o eventos de mercado.', capa: 'nucleo', tipo: 'configuracion' },
  artefactos: { label: 'Artefactos', group: 'Plataforma', desc: 'Tablas, reportes, modelos, gráficos y fórmulas versionadas.', capa: 'nucleo', tipo: 'configuracion' },
  plugins: { label: 'Plugins', group: 'Plataforma', desc: 'Estudio de creación, casos de prueba, sandbox y promoción de plugins.', capa: 'cliente', tipo: 'configuracion' },
  integraciones: { label: 'Integraciones', group: 'Plataforma', desc: 'Catálogo de conectores (XM, BigQuery, ERP, MDM, SCADA) con asistente.', capa: 'nucleo', tipo: 'configuracion' },
  archivos: { label: 'Archivos', group: 'Plataforma', desc: 'Carga de Excel, PDF, PPT, visor interactivo y exportación de reportes.', capa: 'nucleo', tipo: 'configuracion' },
  soporte: { label: 'Soporte', group: 'Plataforma', desc: 'Gestión de tickets por fallas de tareas automáticas y escalamiento Enersinc.', capa: 'nucleo', tipo: 'configuracion' },
  admin: { label: 'Administración', group: 'Plataforma', desc: 'Marca blanca en vivo, matriz de roles, modelos de IA por tarea y auditoría.', capa: 'nucleo', tipo: 'configuracion' },
};

export const GROUP_ORDER: Group[] = [
  'Mi bandeja',
  'Procesos',
  'Mis conversaciones',
  'Tableros',
  'Equipos',
  'Plataforma',
];

export interface Profile {
  id: string;
  person: string;
  role: string;
  initials: string;
  home: ViewId;
  views: ViewId[];
  pinned: string[];
  capa: Layer;
}

export const PROFILES: Profile[] = [
  {
    id: 'cgm',
    person: 'Laura Méndez',
    role: 'Operadora CGM',
    initials: 'LM',
    home: 'bandeja',
    capa: 'cliente',
    views: ['bandeja', 'proceso', 'mis_conversaciones', 'fronteras', 'supervision', 'equipos', 'agentes', 'archivos'],
    pinned: ['ART-118', 'ART-121'],
  },
  {
    id: 'liq',
    person: 'Andrés Rojas',
    role: 'Analista de liquidación',
    initials: 'AR',
    home: 'bandeja',
    capa: 'cliente',
    views: ['bandeja', 'proceso', 'mis_conversaciones', 'contratos', 'posicion', 'equipos', 'archivos'],
    pinned: ['ART-104', 'ART-110'],
  },
  {
    id: 'despacho',
    person: 'Camila Ortiz',
    role: 'Analista de despacho y mercado',
    initials: 'CO',
    home: 'bandeja',
    capa: 'cliente',
    views: ['bandeja', 'proceso', 'mis_conversaciones', 'mercado', 'supervision', 'posicion', 'contratos', 'riesgo', 'escenarios', 'equipos'],
    pinned: ['ART-101', 'ART-112'],
  },
  {
    id: 'fin',
    person: 'Diana Pérez',
    role: 'Finanzas y facturación',
    initials: 'DP',
    home: 'bandeja',
    capa: 'cliente',
    views: ['bandeja', 'proceso', 'mis_conversaciones', 'contratos', 'riesgo', 'equipos', 'archivos'],
    pinned: ['ART-110', 'ART-115'],
  },
  {
    id: 'ger',
    person: 'Gerencia Comercial',
    role: 'Gerencia',
    initials: 'GC',
    home: 'bandeja',
    capa: 'cliente',
    views: ['bandeja', 'proceso', 'mis_conversaciones', 'mercado', 'posicion', 'riesgo', 'escenarios', 'supervision', 'contratos', 'fronteras', 'equipos'],
    pinned: ['ART-101', 'ART-104'],
  },
  {
    id: 'admin_cliente',
    person: 'Carlos Varela',
    role: 'Administrador del cliente',
    initials: 'CV',
    home: 'bandeja',
    capa: 'cliente',
    views: ['bandeja', 'proceso', 'mis_conversaciones', 'equipos', 'agentes', 'plugins', 'integraciones', 'archivos', 'soporte', 'admin'],
    pinned: [],
  },
  {
    id: 'enersinc',
    person: 'Martín Gómez',
    role: 'Enersinc (soporte y certificación)',
    initials: 'EN',
    home: 'bandeja',
    capa: 'nucleo',
    views: ['bandeja', 'proceso', 'mis_conversaciones', 'equipos', 'agentes', 'plugins', 'integraciones', 'archivos', 'soporte', 'admin'],
    pinned: ['ART-125', 'ART-130'],
  },
];

// Helper functions
export function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const cop = (n: number) => {
  const a = Math.abs(n);
  const s = n < 0 ? '−' : '';
  if (a >= 1e9) return `${s}$${(a / 1e9).toLocaleString('es-CO', { maximumFractionDigits: 2 })} mil M`;
  if (a >= 1e6) return `${s}$${(a / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`;
  return `${s}$${a.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
};

export const num = (n: number, d = 0) => n.toLocaleString('es-CO', { maximumFractionDigits: d, minimumFractionDigits: d });
