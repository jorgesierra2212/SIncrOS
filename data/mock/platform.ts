import { Layer, PluginManifest, SkillFicha, TaskItem, SupportTicket, Conector, ArchivoItem, BrandConfig, ExecutionTrace, MarketDateState } from '../types';

// ---------- Tickets de Soporte y Respaldo Manual (Sección 8) ----------
export const SUPPORT_TICKETS_INITIAL: SupportTicket[] = [
  {
    id: 'TK-802',
    titulo: 'Falla de sincronización con ERP SAP (Factura FE-23866)',
    origenTarea: 'tsk-07 · Sincronizar facturación y envío al ERP',
    fecha: 'Hoy 08:35 COT',
    estado: 'Asignado a Respaldo Manual',
    prioridad: 'Alta',
    asignadoA: 'Diana Pérez (Finanzas)',
    log: `[08:35:10 INFO] Conectando a SAP RFC gateway 10.20.14.88:3300...
[08:35:22 WARN] Timeout de socket (12000 ms) en pasarela VPN.
[08:35:28 ERROR] RFC_ERROR_COMMUNICATION: Connect to message server failed. Host 10.20.14.88 unknown or down.
[08:35:29 CRITICAL] Tarea abortada para evitar doble causación contable.`,
    procedimientoManual: '1. Descargar el archivo plano CSV de la prefactura FE-23866 desde la vista Archivos. 2. Abrir SAP GUI transacción FB70 e importar el archivo. 3. Marcar manualmente la factura como "Sincronizada" en el sistema.',
    tareaId: 'tsk-07',
  },
  {
    id: 'TK-801',
    titulo: 'Discrepancia en descarga FTP XM (Archivo ADD corrupto)',
    origenTarea: 'tsk-01 · Descargar publicaciones de XM',
    fecha: 'Ayer 16:40 COT',
    estado: 'Escalado a Enersinc',
    prioridad: 'Media',
    asignadoA: 'Martín Gómez (Soporte Enersinc)',
    log: `[16:40:02 INFO] Descargando ADD_20261025.zip desde ftp.xm.com.co...
[16:40:05 ERROR] Checksum mismatch: esperado a8f9..., obtenido 0000... Archivo incompleto (0 bytes en servidor XM).
[16:40:06 WARN] Escalado automáticamente a nivel 2 Enersinc.`,
    procedimientoManual: 'Descargar manualmente el archivo desde el portal web de agentes SiMEM e ingresarlo vía módulo "Archivos > Cargar archivo".',
    tareaId: 'tsk-01',
  },
  {
    id: 'TK-800',
    titulo: 'Frecuencia de telemetría degradada en Frontera Frt-0819',
    origenTarea: 'tsk-05 · Vigilar comunicaciones de telemedida',
    fecha: '22-oct 14:15 COT',
    estado: 'Resuelto',
    prioridad: 'Baja',
    asignadoA: 'Laura Méndez (Operadora CGM)',
    log: `[14:15:00] Reintento 3/3 fallido en módem GPRS IP 186.28.11.45.
[14:22:00] Operadora reinició puerto módem remotamente. Comunicación restablecida.`,
    procedimientoManual: 'Reiniciar módem por comando SMS o pedir reset físico al operador de red local.',
    tareaId: 'tsk-05',
  },
];

// ---------- Integraciones y Conectores (Sección 9) ----------
export const CONECTORES_INITIAL: Conector[] = [
  {
    id: 'con-xm-ftp',
    name: 'XM · FTP, IDO, ADD, LAC',
    categoria: 'XM',
    state: 'Conectado',
    detail: 'Descarga automática de publicaciones oficiales horarias y diarias del ASIC/CND.',
    ultimaSinc: 'Hoy 10:05 COT',
    frecuencia: 'Horaria (:05)',
    mapeoCampos: [
      { origen: 'LAC_CONCEPTO', destino: 'liquidacion.concepto_nombre' },
      { origen: 'LAC_VALOR_COP', destino: 'liquidacion.monto_xm' },
      { origen: 'IDO_DISP_MW', destino: 'despacho.disp_declarada' },
      { origen: 'ADD_GEN_IDEAL', destino: 'motor.gen_ideal_horaria' },
    ],
    logs: [
      { fecha: 'Hoy 10:05', evento: 'Descarga OK 3,4 MB', estado: 'ok' },
      { fecha: 'Hoy 09:05', evento: 'Descarga OK 1,1 MB', estado: 'ok' },
      { fecha: 'Hoy 08:05', evento: 'Descarga OK 890 KB', estado: 'ok' },
    ],
    config: { endpoint: 'sftp://ftp.xm.com.co:22/publicaciones', authType: 'Certificado PEM + Usuario ASIC' },
  },
  {
    id: 'con-xm-srm',
    name: 'XM · SRM (API REST)',
    categoria: 'XM',
    state: 'Conectado',
    detail: 'Transmisión de lecturas horarias y recepción de acuses del Sistema Registro de Medidas.',
    ultimaSinc: 'Hoy 08:02 COT',
    frecuencia: 'Diaria (08:00)',
    mapeoCampos: [
      { origen: 'medida.codigo_sic', destino: 'SRM_COD_FRONTERA' },
      { origen: 'medida.lectura_kwh', destino: 'SRM_VALOR_HORA' },
      { origen: 'medida.tipo_estimacion', destino: 'SRM_ORIGEN_MEDIDA' },
    ],
    logs: [
      { fecha: 'Hoy 08:02', evento: 'Token JWT renovado exitosamente (vigente hasta 30-nov)', estado: 'ok' },
      { fecha: 'Ayer 08:02', evento: 'Archivo transmitido con código acuse ACK-99412', estado: 'ok' },
    ],
    config: { endpoint: 'https://srm.xm.com.co/api/v4/transmision', authType: 'Bearer Token OAuth 2.0' },
  },
  {
    id: 'con-xm-sicep',
    name: 'XM · SICEP y SiMEM',
    categoria: 'XM',
    state: 'Conectado',
    detail: 'Consulta de convocatorias públicas de compra de energía y datos abiertos del mercado.',
    ultimaSinc: 'Hoy 06:00 COT',
    frecuencia: 'Diaria (06:00)',
    mapeoCampos: [
      { origen: 'SICEP_CONV_ID', destino: 'etrm.convocatoria_id' },
      { origen: 'SICEP_PLAZO', destino: 'etrm.periodo_suministro' },
      { origen: 'SICEP_ENERGIA_GWH', destino: 'etrm.volumen_gwh' },
    ],
    logs: [
      { fecha: 'Hoy 06:00', evento: '3 convocatorias abiertas detectadas', estado: 'ok' },
    ],
    config: { endpoint: 'https://sicep.xm.com.co/api/v1/convocatorias', authType: 'API Key' },
  },
  {
    id: 'con-bigquery',
    name: 'Google BigQuery · Núcleo de datos analítico',
    categoria: 'BigQuery',
    state: 'Conectado',
    detail: 'Data warehouse analítico donde residen todas las series horarias de mercado y telemedida.',
    ultimaSinc: 'Streaming en vivo',
    frecuencia: 'Continuo',
    mapeoCampos: [
      { origen: 'mem.mercado_horario', destino: 'analitica.mercado_horario' },
      { origen: 'telemedida.curvas_cuarto_hora', destino: 'cgm.historico_15min' },
      { origen: 'liquidacion.shadow_runs', destino: 'motor.ejecuciones' },
    ],
    logs: [
      { fecha: 'Hoy 10:48', evento: 'Query analítico ejecutado en 320 ms (14 MB escaneados)', estado: 'ok' },
      { fecha: 'Hoy 10:30', evento: 'Streaming buffer: 12.800 filas insertadas', estado: 'ok' },
    ],
    config: { dataset: 'enersinc_os_prod.mem_colombia', endpoint: 'bigquery://gcp-enersinc-lake' },
  },
  {
    id: 'con-erp',
    name: 'ERP Corporativo (SAP / Oracle / REST)',
    categoria: 'ERP',
    state: 'Alerta',
    detail: 'Envío de comprobantes de venta, cartera y causaciones contables de energía.',
    ultimaSinc: '05-oct 18:05 COT',
    frecuencia: 'Por evento de facturación',
    mapeoCampos: [
      { origen: 'factura.numero', destino: 'SAP_XBLNR_REFERENCIA' },
      { origen: 'factura.monto_neto', destino: 'SAP_WRBTR_IMPORTE' },
      { origen: 'factura.cliente_nit', destino: 'SAP_KUNNR_DEUDOR' },
    ],
    logs: [
      { fecha: 'Hoy 08:35', evento: 'Falla de conexión VPN SAP (Ticket TK-802 generado)', estado: 'error' },
      { fecha: '05-oct 18:05', evento: '36 facturas contabilizadas exitosamente en lote', estado: 'ok' },
    ],
    config: { endpoint: 'https://erp.cliente.com/api/v2/contabilidad', authType: 'mTLS + Basic Auth' },
  },
  {
    id: 'con-mdm',
    name: 'Optimum y MDM de Telemedición (Itron, Elster, ION, SEL)',
    categoria: 'MDM / Medida',
    state: 'Conectado',
    detail: 'Plataforma concentradora y software de telelectura de medidores de frontera (MDM).',
    ultimaSinc: 'Hace 5 minutos',
    frecuencia: 'Cada 15 minutos',
    mapeoCampos: [
      { origen: 'METER_ID', destino: 'frontera.codigo_medidor' },
      { origen: 'TIMESTAMP_UTC', destino: 'frontera.marca_tiempo_cot' },
      { origen: 'ACTIVE_ENERGY_IMPORT', destino: 'frontera.kwh_activa' },
      { origen: 'REACTIVE_ENERGY_IND', destino: 'frontera.kvarh_inductiva' },
    ],
    logs: [
      { fecha: 'Hoy 10:45', evento: 'Sondeo completado: 1.278 medidores leídos, 6 sin respuesta', estado: 'ok' },
    ],
    config: { endpoint: 'tcp://mdm-collector.cliente.com:8088', authType: 'Certificado digital x509' },
  },
  {
    id: 'con-scada',
    name: 'SCADA Generación (Solo lectura)',
    categoria: 'SCADA',
    state: 'Piloto',
    detail: 'Lectura en tiempo real de potencia activa y reactiva de plantas hidráulicas y térmicas. No envía comandos.',
    ultimaSinc: 'Hace 2 minutos',
    frecuencia: 'Cada 5 minutos',
    mapeoCampos: [
      { origen: 'MW_ACTUAL', destino: 'supervision.real_mw' },
      { origen: 'ESTADO_DISYUNTOR', destino: 'supervision.conectado' },
    ],
    logs: [
      { fecha: 'Hoy 10:48', evento: 'Lectura de telemetría de 4 plantas térmicas y solares OK', estado: 'ok' },
    ],
    config: { endpoint: 'opc.tcp://scada-gw.enersinc.internal:4840', authType: 'Solo lectura (Air-gapped unidirectional)' },
  },
  {
    id: 'con-dian',
    name: 'Proveedor Tecnológico Factura Electrónica (DIAN)',
    categoria: 'Factura electrónica',
    state: 'Conectado',
    detail: 'Generación de CUFE, firma digital XAdES-BES y validación previa oficial ante la DIAN.',
    ultimaSinc: 'Hoy 09:15 COT',
    frecuencia: 'Por evento',
    mapeoCampos: [
      { origen: 'factura.xml', destino: 'DIAN_UBL21_INVOICE' },
      { origen: 'dian.cufe', destino: 'factura.cufe_aprobado' },
    ],
    logs: [
      { fecha: 'Hoy 09:15', evento: 'Servicio DIAN respondiendo en 480 ms con código 200 OK', estado: 'ok' },
    ],
    config: { endpoint: 'https://factura.proveedordian.com.co/ws/v2', authType: 'Certificado digital entidad certificadora' },
  },
];
