import { Layer, PluginManifest, SkillFicha, TaskItem, SupportTicket, Conector, ArchivoItem, BrandConfig, ExecutionTrace, MarketDateState } from '../types';

// ---------- Plugins de Ejemplo (Sección 7) ----------
export const PLUGINS_INITIAL: PluginManifest[] = [
  {
    id: 'val-demanda-propia',
    nombre: 'Validador de curvas de demanda comercial',
    version: '0.9.1-beta',
    capa: 'cliente',
    autor: 'Equipo de Comercialización (Cliente)',
    descripcion: 'Aplica filtros personalizados de dispersión para detectar desviaciones en clientes del sector industrial alimentario y manufactura.',
    entradas: ['Curva horaria de consumo (kWh)', 'Calendario de turnos de planta'],
    salidas: ['Factor de atipicidad', 'Alerta de consumo fuera de turno'],
    permisos: {
      lectura: ['cgm.medidas', 'facturacion.usuarios'],
      escritura: ['cgm.alertas_cliente'],
    },
    herramientas: ['calculo_estadistico', 'lector_calendario'],
    instrucciones: 'Analiza los consumos horarios y compara contra los turnos declarados por el cliente corporativo. Si hay consumo alto en parada técnica, genera alerta.',
    estado: 'Sandbox',
    casosDePrueba: [
      { id: 'tc-1', nombre: 'Turno normal diurno', entrada: '{"consumo": [120, 125, 130], "turno": "operativo"}', salidaEsperada: '{"estado": "normal"}', pasa: true },
      { id: 'tc-2', nombre: 'Parada programada con consumo fantasma', entrada: '{"consumo": [80, 85, 90], "turno": "parada"}', salidaEsperada: '{"estado": "alerta_atipica"}', pasa: true },
    ],
    historicoVersiones: [
      { version: '0.9.1-beta', fecha: '23-oct-2026', autor: 'Laura Méndez', motivo: 'Ajuste de umbrales para días festivos' },
      { version: '0.9.0-beta', fecha: '15-oct-2026', autor: 'Laura Méndez', motivo: 'Creación inicial en Sandbox' },
    ],
    testMetrics: {
      casosAprobadosPct: 100,
      coincidenciaReferenciaPct: 96.5,
      permisosValidos: true,
      sinDatosSensibles: true,
    },
  },
  {
    id: 'pred-bolsa-intradiario',
    nombre: 'Predictor intradiario de precio de bolsa',
    version: '1.2.0-rc',
    capa: 'cliente',
    autor: 'Mesa de Trading (Cliente)',
    descripcion: 'Estima la evolución del precio de bolsa spot para las próximas 4 horas considerando nubosidad satelital y despacho forzado.',
    entradas: ['Precio bolsa actual', 'Radiación satelital estimada', 'Despacho CND'],
    salidas: ['Precio proyectado H+1 a H+4', 'Banda de confianza 90%'],
    permisos: {
      lectura: ['mercado.bolsa', 'despacho.programado', 'operacion.clima'],
      escritura: ['mercado.predicciones_internas'],
    },
    herramientas: ['modelo_regresion_intradiario', 'conector_satelital'],
    instrucciones: 'Calcula la probabilidad de incremento en el precio marginal si entra generación térmica por redespacho en la región Caribe.',
    estado: 'Pruebas',
    casosDePrueba: [
      { id: 'tc-p1', nombre: 'Punta nocturna con hidráulica dominante', entrada: '{"hora": 19, "embalse": 65}', salidaEsperada: '{"precio_est": 680}', pasa: true },
      { id: 'tc-p2', nombre: 'Falla térmica inesperada', entrada: '{"evento": "disparo_u1", "reserva": 40}', salidaEsperada: '{"precio_est": 940}', pasa: true },
      { id: 'tc-p3', nombre: 'Coincidencia con histórico de referencia (falla)', entrada: '{"historico_test": "tx_sep_2026"}', salidaEsperada: '{"coincidencia": 96.0}', pasa: false, error: 'Coincidencia obtenida 91.2 % es inferior al umbral mínimo exigido del 95 % para promoción' },
    ],
    historicoVersiones: [
      { version: '1.2.0-rc', fecha: '24-oct-2026', autor: 'Camila Ortiz', motivo: 'Incorporación de variable solar intradiaria' },
      { version: '1.1.0', fecha: '10-oct-2026', autor: 'Camila Ortiz', motivo: 'Versión previa de pruebas' },
    ],
    testMetrics: {
      casosAprobadosPct: 66.7,
      coincidenciaReferenciaPct: 91.2,
      permisosValidos: true,
      sinDatosSensibles: true,
    },
  },
  {
    id: 'cert-auditoria-aenc',
    nombre: 'Auditor de discrepancias AENC certificado',
    version: '2.1.0',
    capa: 'enersinc_cliente',
    autor: 'Enersinc Certificaciones',
    descripcion: 'Coteja automáticamente la auditoría de energía eléctrica no contabilizada (AENC) según protocolo CREG 038 y emite informe firmado.',
    entradas: ['Base de medidas SRM', 'Facturación comercial', 'Fronteras de enlace'],
    salidas: ['Informe oficial AENC', 'Matriz de balances de pérdidas'],
    permisos: {
      lectura: ['cgm.medidas', 'cgm.srm', 'facturacion.ventas', 'xm.liquidado'],
      escritura: ['cgm.informes_certificados'],
    },
    herramientas: ['motor_balances_aenc', 'firma_digital_enersinc'],
    instrucciones: 'Ejecuta el balance volumétrico por subestación y clasifica pérdidas técnicas frente a no técnicas con umbral normativo.',
    estado: 'Producción',
    casosDePrueba: [
      { id: 'tc-a1', nombre: 'Balance sin pérdidas anómalas', entrada: '{"entrada": 1000, "salida": 985}', salidaEsperada: '{"perdidas_pct": 1.5, "conforme": true}', pasa: true },
      { id: 'tc-a2', nombre: 'Alerta por pérdida > 5%', entrada: '{"entrada": 1000, "salida": 930}', salidaEsperada: '{"perdidas_pct": 7.0, "conforme": false}', pasa: true },
    ],
    historicoVersiones: [
      { version: '2.1.0', fecha: '12-sep-2026', autor: 'Enersinc Core', motivo: 'Certificación anual para clientes de distribución' },
      { version: '2.0.0', fecha: '01-feb-2026', autor: 'Enersinc Core', motivo: 'Ajuste a Circular CREG 2026' },
    ],
    testMetrics: {
      casosAprobadosPct: 100,
      coincidenciaReferenciaPct: 99.4,
      permisosValidos: true,
      sinDatosSensibles: true,
    },
  },
  {
    id: 'motor-recpos-xm',
    nombre: 'Conector y liquidador RecPos CREG 024',
    version: '3.4.0',
    capa: 'nucleo',
    autor: 'Núcleo Enersinc',
    descripcion: 'Motor núcleo de cálculo horario de reconciliación positiva con árbol de dependencias completo, validación de IDO y precios de combustible.',
    entradas: ['Generación real', 'Despacho ideal XM', 'Ofertas horarias', 'Combustibles declarados'],
    salidas: ['Monto RecPos horario', 'Diferencia contra publicación XM', 'Cadena de evidencia'],
    permisos: {
      lectura: ['*'],
      escritura: ['motor.liquidaciones', 'auditoria.logs'],
    },
    herramientas: ['motor_fórmulas_v14', 'validador_ido_xm'],
    instrucciones: 'Aplica la fórmula matemática oficial RecPos = max(0, GenReal - GenIdeal) * PrecioRec para cada hora y unidad.',
    estado: 'Producción',
    casosDePrueba: [
      { id: 'tc-m1', nombre: 'GenReal mayor a GenIdeal', entrada: '{"genReal": 150, "genIdeal": 120, "precio": 350}', salidaEsperada: '{"recpos": 10500}', pasa: true },
      { id: 'tc-m2', nombre: 'GenReal menor a GenIdeal (cero)', entrada: '{"genReal": 100, "genIdeal": 120, "precio": 350}', salidaEsperada: '{"recpos": 0}', pasa: true },
    ],
    historicoVersiones: [
      { version: '3.4.0', fecha: '02-ene-2026', autor: 'Arquitectura Núcleo', motivo: 'Actualización regla RecPos v14 CREG' },
    ],
    testMetrics: {
      casosAprobadosPct: 100,
      coincidenciaReferenciaPct: 99.9,
      permisosValidos: true,
      sinDatosSensibles: true,
    },
  },
];
