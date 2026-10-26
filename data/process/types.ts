import type { ProcessWorkflow, NodeStatus } from '../workflowModels';
import type { RegulatoryVersion } from '../types';
import type { ChatMsg } from '../agentScript';

export type Dominio = 'Despacho' | 'Liquidación' | 'Facturación' | 'CGM' | 'Garantías';
export const DOMINIOS: Dominio[] = ['Despacho', 'CGM', 'Liquidación', 'Garantías', 'Facturación'];

export type RolProceso = 'Dueño' | 'Ejecutor' | 'Aprobador' | 'Lector';
export type Entidad = 'XM (ASIC)' | 'XM (CND)' | 'DIAN' | 'Agente';

export type PestanaProceso = 'flujo' | 'datos' | 'chat' | 'reportes' | 'fechas' | 'envios' | 'historico';
export const PESTANAS: { id: PestanaProceso; label: string }[] = [
  { id: 'flujo', label: 'Flujo' },
  { id: 'datos', label: 'Datos' },
  { id: 'chat', label: 'Chat' },
  { id: 'reportes', label: 'Reportes' },
  { id: 'envios', label: 'Cierre y soportes' },
  { id: 'historico', label: 'Histórico' },
];

// ---------- Datos editables ----------
export type TipoColumna = 'texto' | 'numero' | 'moneda' | 'estado';
export interface Columna {
  key: string;
  label: string;
  tipo: TipoColumna;
  editable?: boolean;
  opciones?: string[];
  unidad?: string;
}
export type Fila = { id: string } & Record<string, string | number>;
export interface CambioCelda {
  filaId: string;
  columna: string;
  anterior: string | number;
  nuevo: string | number;
  quien: string;
  cuando: string;
  motivo?: string;
}

// ---------- Ejecuciones ----------
export type EstadoEjecucion = 'En curso' | 'Esperando aprobación' | 'Completada' | 'Con error';
export interface Ejecucion {
  id: string;
  procesoId: string;
  /** Fecha de operación o corte (dd-mmm-aaaa) o periodo (mes aaaa) */
  fecha: string;
  /** Solo en procesos versionados (liquidación) */
  version?: RegulatoryVersion;
  publicadaXM?: string;
  estado: EstadoEjecucion;
  pasoActual: string;
  iniciadaPor: string;
  estadoPorNodo?: Record<string, NodeStatus>;
}

// ---------- Envíos ----------
export type EstadoEnvio = 'Preparado' | 'Aprobado' | 'Enviado' | 'Acuse recibido' | 'Aceptado' | 'Rechazado';
export const SECUENCIA_ENVIO: EstadoEnvio[] = ['Preparado', 'Aprobado', 'Enviado', 'Acuse recibido', 'Aceptado'];
export interface Envio {
  id: string;
  procesoId: string;
  ejecucionId: string;
  entidad: Entidad;
  documento: string;
  estado: EstadoEnvio;
  historial: { estado: EstadoEnvio; fecha: string; quien: string }[];
  radicado?: string;
  evidencia?: string;
  motivoRechazo?: string;
  reintentos: number;
}

// ---------- Reportes ----------
export type TipoReporte = 'tabla' | 'grafico' | 'tablero';
export interface Reporte {
  id: string;
  procesoId: string;
  ejecucionId: string;
  titulo: string;
  tipo: TipoReporte;
  estado: 'Vivo' | 'Desactualizado' | 'Congelado';
  version: number;
  generadoPor: string;
  fecha: string;
  formato?: 'pdf' | 'xlsx' | 'pptx' | 'xml';
  /** Fotografía de los datos al congelar */
  snapshot?: Fila[];
}

// ---------- Conversaciones ----------
export interface Conversacion {
  id: string;
  dueno: string; // id de perfil
  duenoPersona?: string; // id o nombre de persona
  procesoId?: string;
  ejecucionId?: string;
  titulo: string;
  mensajes: ChatMsg[];
  compartidaCon: string[]; // ids de perfil
  actualizada: string;
}

// ---------- Equipos ----------
export interface Equipo {
  id: string;
  nombre: string;
  miembros: string[]; // ids de perfil
  procesos: string[]; // ids de proceso
}

// ---------- Definición de proceso ----------
export interface ProcesoDef {
  id: string;
  nombre: string;
  codigo: string;
  dominio: Dominio;
  descripcion: string;
  equipoDueno: string;
  versionado: boolean;
  entidad: Entidad | null;
  documentoEnvio?: string;
  workflow: ProcessWorkflow;
  columnas: Columna[];
  filas: Fila[];
  roles: Record<string, RolProceso>; // id de perfil -> rol
  plantillasReporte: { titulo: string; tipo: TipoReporte }[];
}
