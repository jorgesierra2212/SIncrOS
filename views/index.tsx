import React from 'react';
import type { ViewId } from '../data/mock';
import { Agentes, Tareas, Artefactos } from './Work';
import { Fronteras, AENC_View, InformeAnualView, Usuarios } from './M2C';
import { MotorReglas } from './Motor';
import { DespachoProgReal, Redespacho, MercadoIntradiario } from './Despacho';
import { Contratos, Posicion, Sicep, Riesgo, EscenariosView } from './Trading';
import { Supervision, Mercado, Admin } from './Ops';
import { PluginsView } from './Plugins';
import { IntegracionesView, ArchivosView, SoporteView } from './Platform';
import { ProcesoView, MiBandeja, MisConversaciones, Equipos } from './ProcesoViews';

const MAP: Record<ViewId, React.FC> = {
  // 1. Mi bandeja
  bandeja: MiBandeja,

  // 2. Procesos
  proceso: ProcesoView,

  // 3. Mis conversaciones
  mis_conversaciones: MisConversaciones,

  // 4. Tableros
  mercado: Mercado,
  posicion: Posicion,
  riesgo: Riesgo,
  escenarios: EscenariosView,
  supervision: Supervision,
  contratos: Contratos,
  fronteras: Fronteras,
  despacho_prog_real: DespachoProgReal,
  despacho_redespacho: Redespacho,
  despacho_intradiario: MercadoIntradiario,
  usuarios: Usuarios,
  aenc: AENC_View,
  informe_anual: InformeAnualView,
  sicep: Sicep,

  // 5. Equipos
  equipos: Equipos,

  // 6. Plataforma
  agentes: Agentes,
  tareas: Tareas,
  artefactos: Artefactos,
  motor: MotorReglas,
  plugins: PluginsView,
  integraciones: IntegracionesView,
  archivos: ArchivosView,
  soporte: SoporteView,
  admin: Admin,
};

export function renderView(v: ViewId) {
  const C = MAP[v] || MiBandeja;
  return <C key={v} />;
}
