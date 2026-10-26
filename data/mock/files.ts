import { Layer, PluginManifest, SkillFicha, TaskItem, SupportTicket, Conector, ArchivoItem, BrandConfig, ExecutionTrace, MarketDateState } from '../types';

// ---------- Archivos Cargados y Generados (Sección 9) ----------
export const ARCHIVOS_INITIAL: ArchivoItem[] = [
  {
    id: 'arch-01',
    nombre: 'Modelo_Liquidacion_Sombra_Octubre_2026.xlsx',
    tipo: 'excel',
    tamano: '2,4 MB',
    fecha: 'Hoy 07:35 COT',
    origen: 'Generado por tarea',
    tareaAsociada: 'tsk-02 · Auditar liquidación contra la versión publicada',
    detalles: {
      hojas: ['Resumen_Diferencias', 'RecPos_Horaria', 'Ventas_Bolsa', 'Contratos_Despacho', 'Parametros_CREG'],
      filas: 744,
      previewData: [
        { Concepto: 'Ventas en bolsa', Calculado_Enersinc: '$18.420.300.000', Liquidado_XM: '$18.419.900.000', Diferencia: '+$400.000', Estado: 'Aceptable' },
        { Concepto: 'Reconciliación positiva', Calculado_Enersinc: '$1.332.850.000', Liquidado_XM: '$1.284.500.000', Diferencia: '+$48.350.000', Estado: 'Reclamar' },
        { Concepto: 'Restricciones', Calculado_Enersinc: '-$288.900.000', Liquidado_XM: '-$301.750.000', Diferencia: '+$12.850.000', Estado: 'Reclamar' },
        { Concepto: 'Cargo por confiabilidad', Calculado_Enersinc: '$4.870.000.000', Liquidado_XM: '$4.870.000.000', Diferencia: '$0', Estado: 'Conforme' },
        { Concepto: 'Combustibles reconocidos', Calculado_Enersinc: '$2.115.000.000', Liquidado_XM: '$2.089.600.000', Diferencia: '+$25.400.000', Estado: 'Revisar' },
      ],
    },
  },
  {
    id: 'arch-02',
    nombre: 'Reclamacion_ASIC_TX2_21_Octubre_2026.pdf',
    tipo: 'pdf',
    tamano: '640 KB',
    fecha: 'Hoy 07:40 COT',
    origen: 'Generado por tarea',
    tareaAsociada: 'tsk-02 · Auditar liquidación contra la versión publicada',
    detalles: {
      paginas: 4,
    },
  },
  {
    id: 'arch-03',
    nombre: 'Presentacion_Ejecutiva_Mercado_y_Riesgo_Q4.pptx',
    tipo: 'powerpoint',
    tamano: '5,8 MB',
    fecha: 'Ayer 18:00 COT',
    origen: 'Reporte exportado',
    tareaAsociada: 'Exportación Resumen Ejecutivo',
    detalles: {
      diapositivas: 8,
    },
  },
  {
    id: 'arch-04',
    nombre: 'Lecturas_Fronteras_SRM_20261026.xlsx',
    tipo: 'excel',
    tamano: '1,8 MB',
    fecha: 'Hoy 08:02 COT',
    origen: 'Generado por tarea',
    tareaAsociada: 'tsk-04 · Generar y enviar archivo SRM',
    detalles: {
      hojas: ['Fronteras_1284', 'Estimadas_12', 'Consolidado_Generacion'],
      filas: 1284,
      previewData: [
        { Frontera: 'Frt-0118', Tipo: 'Generación', H01: '412.3', H12: '498.1', H19: '520.4', Total_Dia_kWh: '11.890,2', Origen: 'TELEMEDIDA' },
        { Frontera: 'Frt-0412', Tipo: 'Generación', H01: '380.4', H12: '461.9', H19: '475.2', Total_Dia_kWh: '10.450,1', Origen: 'RESPALDO' },
        { Frontera: 'Frt-0533', Tipo: 'Consumo no regulado', H01: '0.0', H12: '124.5', H19: '180.2', Total_Dia_kWh: '2.140,8', Origen: 'TELEMEDIDA' },
        { Frontera: 'Frt-0761', Tipo: 'Autogeneración remota', H01: '88.1', H12: '210.4', H19: '95.3', Total_Dia_kWh: '3.110,6', Origen: 'ESTIMADA_R2' },
      ],
    },
  },
];

// ---------- Configuración de Marca Blanca (Sección 3) ----------
export const BRAND_PRESETS: Record<'enersinc' | 'cliente_demo', BrandConfig> = {
  enersinc: {
    nombreProducto: 'Enersinc OS',
    logoIcon: 'E',
    colorPrimario: '#2459D6',
    colorSecundario: '#0F1E33',
    tipografia: 'IBM Plex Sans',
    presetId: 'enersinc',
  },
  cliente_demo: {
    nombreProducto: 'Enerco OS · Soluciones Energéticas',
    logoIcon: '⚡',
    colorPrimario: '#0D9488',
    colorSecundario: '#111827',
    tipografia: 'Inter',
    presetId: 'cliente_demo',
  },
};
