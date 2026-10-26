import { Layer, PluginManifest, SkillFicha, TaskItem, SupportTicket, Conector, ArchivoItem, BrandConfig, ExecutionTrace, MarketDateState } from '../types';

// ---------- Gestión de Fechas Amigables y Ciclos Regulatorios MEM ----------
export const DEFAULT_MARKET_DATE: MarketDateState = {
  date: '2026-10-26',
  formatted: '26 de Octubre de 2026',
  shortFormatted: '26-Oct-2026',
  dayOfWeek: 'Lunes',
  periodMonth: 'Octubre 2026',
  cycleVersion: 'TX2',
  horizonName: 'Operación D (Tiempo real) · Liquidación TX2',
  deadlineNotice: 'Plazo de objeción TX2 vence en 48 horas ante el ASIC',
  hoursRemaining: 48,
};

// ---------- Trazabilidad Profunda de Ejecuciones de Agentes ----------
export const SAMPLE_TRACES: Record<string, ExecutionTrace> = {
  'A-1042': {
    id: 'TRC-1042',
    approvalId: 'A-1042',
    agentName: 'Auditor de liquidación',
    agentLevel: 2,
    modelEngine: 'Modelo configurado + Motor Enersinc RecPos v14.2',
    timestamp: '2026-10-26 07:40:12 COT',
    title: 'Diferencia en reconciliación positiva · TX2 del 21-oct',
    role: 'Analista de liquidación',
    capa: 'nucleo',
    inputs: [
      {
        name: 'LAC_TX2_20261021.txt',
        source: 'Publicación oficial FTP XM / ASIC',
        records: '184.290 registros horarios',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
      {
        name: 'IDO_Redeclaracion_1642.xml',
        source: 'CND XM · Bitácora de despacho en tiempo real',
        records: 'Unidad Térmica Norte U2 · Horas 18–21',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      },
      {
        name: 'Telemedida_Frontera_TN2_Oct21.csv',
        source: 'Concentrador CGM Enersinc (MDM)',
        records: '24 intervalos de 1 hora · Clase 0.2S',
        sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      },
    ],
    rule: {
      code: 'Resolución CREG 024 de 1995 · Art. 14 / CREG 051 de 2009',
      version: 'RecPos · Versión 14.2 · Vigente desde 01-Ene-2026',
      formulaName: 'Reconciliación Positiva de Generación Obligada por Seguridad',
      mathExpression: 'RecPos(u, h) = Max(0, GenReal(u, h) - DespIdeal(u, h)) × Max(0, Oferta(u, h) - PrecioBolsa(h))',
      variables: [
        { symbol: 'GenReal(u, h)', meaning: 'Generación neta horaria en frontera de la unidad u', appliedValue: '118,0 MWh (Hora 19)' },
        { symbol: 'DespIdeal(u, h)', meaning: 'Generación programada en despacho ideal', appliedValue: '0,0 MWh (Planta no requerida por mérito económico)' },
        { symbol: 'Oferta(u, h)', meaning: 'Precio de oferta declarado por el agente generador', appliedValue: '$360,0 COP/kWh' },
        { symbol: 'PrecioBolsa(h)', meaning: 'Precio marginal de bolsa spot nacional', appliedValue: '$248,5 COP/kWh' },
      ],
      thresholdNotice: 'Tolerancia máxima configurada: $5.000.000 COP. Diferencia encontrada supera el umbral en un 867 %.',
    },
    comparison: [
      { concept: 'Reconciliación Positiva (RecPos) · H18', calculatedValue: '$328,4 M', xmOfficialValue: '$318,2 M', diffText: '+$10,2 M', diffAmount: 10_200_000, threshold: '$2,0 M', verdict: 'Reclamable' },
      { concept: 'Reconciliación Positiva (RecPos) · H19', calculatedValue: '$345,1 M', xmOfficialValue: '$331,0 M', diffText: '+$14,1 M', diffAmount: 14_100_000, threshold: '$2,0 M', verdict: 'Reclamable' },
      { concept: 'Reconciliación Positiva (RecPos) · H20', calculatedValue: '$339,2 M', xmOfficialValue: '$324,8 M', diffText: '+$14,4 M', diffAmount: 14_400_000, threshold: '$2,0 M', verdict: 'Reclamable' },
      { concept: 'Reconciliación Positiva (RecPos) · H21', calculatedValue: '$320,2 M', xmOfficialValue: '$310,5 M', diffText: '+$9,7 M', diffAmount: 9_700_000, threshold: '$2,0 M', verdict: 'Reclamable' },
      { concept: 'Total Reconciliación Positiva TX2', calculatedValue: '$1.332,9 M', xmOfficialValue: '$1.284,5 M', diffText: '+$48,35 M', diffAmount: 48_350_000, threshold: '$5,0 M', verdict: 'Reclamable' },
    ],
    steps: [
      { time: '07:31:02', phase: 'Ingesta', detail: 'Descarga y descompresión de LAC_TX2_20261021.txt desde servidor seguro XM', evidence: '184.290 filas validadas', status: 'ok' },
      { time: '07:31:18', phase: 'Mapeo', detail: 'Cruce de frontera con base de datos maestra de plantas y unidades térmicas', evidence: 'Código SIC TN2 emparejado', status: 'ok' },
      { time: '07:31:35', phase: 'Cálculo Sombra', detail: 'Ejecución del motor de reglas RecPos v14.2 para 24 periodos horarios', evidence: 'Resultado sombra: $1.332.850.000 COP', status: 'ok' },
      { time: '07:31:40', phase: 'Detección de Brecha', detail: 'Cotejo contra columna XM_RECPOS: se aísla brecha de +$48.350.000 COP en horas 18 a 21', evidence: 'Discrepancia originada por omisión de la redeclaración IDO de las 16:42 en el archivo base de XM', status: 'alerta' },
      { time: '07:31:42', phase: 'Generación de Soporte', detail: 'Construcción automática del artefacto formal ART-104 (Formato oficial de reclamaciones CREG)', evidence: 'Artefacto ART-104 creado', status: 'ok' },
      { time: '07:31:44', phase: 'Enrutamiento', detail: 'Envío de expediente con evidencia inmutable a Bandeja de Aprobación A-1042 para firma de Andrés Rojas', evidence: 'Segregación: Agente ejecutó, persona aprueba', status: 'info' },
    ],
    manualBackup: {
      canEdit: true,
      modified: false,
    },
  },
  'A-1043': {
    id: 'TRC-1043',
    approvalId: 'A-1043',
    agentName: 'Reporte SRM',
    agentLevel: 2,
    modelEngine: 'Modelo configurado + Validador Sintáctico XML/SRM XM',
    timestamp: '2026-10-26 08:02:44 COT',
    title: 'Envío diario al SRM · 1.284 fronteras · 12 con lectura estimada',
    role: 'Operadora CGM',
    capa: 'nucleo',
    inputs: [
      {
        name: 'Medidas_Brutas_CGM_20261026.parquet',
        source: 'Plataforma MDM Enersinc / Telemetría GPRS',
        records: '30.816 registros horarios (1.284 fronteras × 24h)',
        sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      },
      {
        name: 'Catalogo_SIC_Fronteras_Vigente.json',
        source: 'Registro de Agentes XM',
        records: '1.284 códigos de frontera registrados',
        sha256: '4d82f27c6b9076f6e80b2a4d3a2e7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
      },
    ],
    rule: {
      code: 'Código de Medida CREG 038 de 2014 / Manual Técnico SRM XM',
      version: 'Protocolo SRM v4.2 · Esquema XML v2.8',
      formulaName: 'Validación de Integridad y Formateo Diario de Medidas',
      mathExpression: 'E_total = Sum(h=1..24, kWh_activa_h); Flag_Estimada = Si Falla_Ppal, Aplicar(Respaldo, DiaTipo)',
      variables: [
        { symbol: 'Fronteras Integras', meaning: 'Lecturas tomadas directamente del medidor principal sin error', appliedValue: '1.272 (99,06 %)' },
        { symbol: 'Fronteras Estimadas', meaning: 'Sustituidas con medidor de respaldo bajo regla R1 de la CREG', appliedValue: '12 (0,94 %)' },
      ],
      thresholdNotice: 'Límite regulatorio XM: Máximo 2% de estimaciones mensuales. Hoy: 0,94% (Cumple).',
    },
    comparison: [
      { concept: 'Fronteras con lectura directa (MDM)', calculatedValue: '1.272', xmOfficialValue: '1.284 esperadas', diffText: '12 con respaldo', diffAmount: 0, threshold: '25 max', verdict: 'Conforme' },
      { concept: 'Energía estimada bajo regla R1 (MWh)', calculatedValue: '48,6 MWh', xmOfficialValue: '0,0 MWh', diffText: '+48,6 MWh', diffAmount: 0, threshold: '100 MWh', verdict: 'Conforme' },
      { concept: 'Esquema sintáctico XSD', calculatedValue: '100 % Válido', xmOfficialValue: 'Regla XM v4.2', diffText: '0 Errores', diffAmount: 0, threshold: '0', verdict: 'Conforme' },
    ],
    steps: [
      { time: '08:00:10', phase: 'Extracción', detail: 'Recopilación de lecturas de las 24 horas para 1.284 medidores comerciales', evidence: '30.816 registros recibidos', status: 'ok' },
      { time: '08:01:20', phase: 'Estimación', detail: 'Aplicación de jerarquía R1 para 12 fronteras con falla de comunicación principal', evidence: 'Respaldo Elster A1800 verificado', status: 'ok' },
      { time: '08:02:15', phase: 'Validación XML', detail: 'Cotejo contra esquema XSD oficial de XM SRM', evidence: 'Validación 100% exitosa sin errores de sintaxis', status: 'ok' },
      { time: '08:02:44', phase: 'Solicitud de Firma', detail: 'Generación de archivo ART-118 y puesta a disposición de Laura Méndez', evidence: 'Plazo regulatorio: 10:00 COT', status: 'info' },
    ],
    manualBackup: {
      canEdit: true,
      modified: false,
    },
  },
  'A-1044': {
    id: 'TRC-1044',
    approvalId: 'A-1044',
    agentName: 'Crítica de medida',
    agentLevel: 2,
    modelEngine: 'Modelo configurado + Analizador de Curvas Horarias CGM',
    timestamp: '2026-10-26 05:04:18 COT',
    title: 'Desfase horario en Frt-0412 · Medidor principal',
    role: 'Operadora CGM',
    capa: 'nucleo',
    inputs: [
      {
        name: 'Curva_Carga_Frt0412_Ppal.csv',
        source: 'Medidor Principal Landis+Gyr E650',
        records: '120 intervalos de 15 minutos',
        sha256: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      },
      {
        name: 'Curva_Carga_Frt0412_Resp.csv',
        source: 'Medidor de Respaldo Elster A1800',
        records: '120 intervalos de 15 minutos',
        sha256: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      },
    ],
    rule: {
      code: 'Código de Medida CREG 038/2014 · Anexo General',
      version: 'Regla Crítica_Desfase_v3',
      formulaName: 'Detección de Deriva Temporal de Reloj y Sustitución de Medida',
      mathExpression: 'Divergencia(t) = |kWh_ppal(t) - kWh_resp(t)| / kWh_resp(t); Alerta si Divergencia > 2,0%',
      variables: [
        { symbol: 'Divergencia Media', meaning: 'Diferencia porcentual constante en las últimas 96 horas', appliedValue: '6,8 % sostenido' },
        { symbol: 'Energía Comprometida', meaning: 'Volumen total sujeto a desbalance horario en bolsa', appliedValue: '41,2 MWh' },
      ],
      thresholdNotice: 'Desfase de reloj confirmado: reloj del medidor principal atrasado exactamente 60 minutos.',
    },
    comparison: [
      { concept: 'Desfase temporal reloj', calculatedValue: '-60 minutos', xmOfficialValue: 'Sincronía GPS requerida', diffText: '-60 min', diffAmount: 0, threshold: '< 30 seg', verdict: 'Alerta' },
      { concept: 'Energía Medidor Principal', calculatedValue: '394,8 MWh', xmOfficialValue: 'N/A', diffText: '-2,8 MWh', diffAmount: 0, threshold: 'N/A', verdict: 'Alerta' },
      { concept: 'Energía Medidor Respaldo (Calibrado)', calculatedValue: '397,6 MWh', xmOfficialValue: 'Patrón Conforme', diffText: '+2,8 MWh', diffAmount: 0, threshold: '1,0%', verdict: 'Conforme' },
    ],
    steps: [
      { time: '05:01:10', phase: 'Lectura', detail: 'Descarga de curvas de carga de los últimos 5 días de operación', evidence: 'Medidores principal y respaldo leídos', status: 'ok' },
      { time: '05:02:40', phase: 'Cruce Cruzado', detail: 'Algoritmo de correlación cruzada identifica desfase de pico diario de demanda', evidence: 'Pico desplazado de las 19:00 a las 20:00 en principal', status: 'alerta' },
      { time: '05:03:30', phase: 'Sustitución Propuesta', detail: 'Generación de curva sustituta tomando lecturas íntegras del respaldo Elster', evidence: '41,2 MWh normalizados', status: 'ok' },
      { time: '05:04:18', phase: 'Aprobación', detail: 'Preparación de expediente A-1044 con orden de visita técnica para calibración de reloj', evidence: 'Notificación enviada a Operadora CGM', status: 'info' },
    ],
    manualBackup: {
      canEdit: true,
      modified: false,
    },
  },
  'A-1045': {
    id: 'TRC-1045',
    approvalId: 'A-1045',
    agentName: 'Proyección de garantías',
    agentLevel: 1,
    modelEngine: 'Modelo configurado + Simulador Monte Carlo de Garantías XM',
    timestamp: '2026-10-20 07:02:15 COT',
    title: 'Brecha de cobertura de garantías semanales ante el ASIC',
    role: 'Finanzas y facturación',
    capa: 'enersinc_cliente',
    inputs: [
      {
        name: 'Compras_Bolsa_Semana_Proyectada.csv',
        source: 'Modelo de Demanda y Despacho Horario',
        records: '168 horas semanales',
        sha256: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
      },
      {
        name: 'Curva_Futura_Precio_Bolsa_Oct2026.json',
        source: 'Consenso de Mercado / Análisis Fundamental Hidrológico',
        records: 'Escenario seco CREG: $910 COP/kWh',
        sha256: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
      },
    ],
    rule: {
      code: 'Resolución CREG 019 de 2006 / CREG 157 de 2011',
      version: 'Reglamento de Garantías Financieras MEM v5.1',
      formulaName: 'Cálculo del Valor en Riesgo y Cobertura Obligatoria ante ASIC',
      mathExpression: 'Garantia(s) = (Compras_Bolsa(s) - Ventas_Bolsa(s)) × PB_esperado(s) × Factor_Seguridad(1.25)',
      variables: [
        { symbol: 'Garantía Exigida Proyectada', meaning: 'Monto que XM solicitará consignar o respaldar con carta de crédito', appliedValue: '$3.418.000.000 COP' },
        { symbol: 'Cupo Bancario Disponible', meaning: 'Garantía bancaria actualmente depositada en el patrimonio autónomo XM', appliedValue: '$2.806.000.000 COP' },
        { symbol: 'Brecha de Liquidez', meaning: 'Déficit financiero a fondear antes del lunes 27-oct 12:00 COT', appliedValue: '$612.000.000 COP' },
      ],
      thresholdNotice: 'Riesgo crítico: El incumplimiento de aportes acarrea limitación de suministro y suspensión inmediata del agente.',
    },
    comparison: [
      { concept: 'Garantía Proyectada (Escenario Base)', calculatedValue: '$3.418 M', xmOfficialValue: '$2.806 M (Actual)', diffText: '-$612 M (Brecha)', diffAmount: 612_000_000, threshold: '$0', verdict: 'Alerta' },
      { concept: 'Factor de estrés hidrológico', calculatedValue: '1,25 (Seco)', xmOfficialValue: '1,10 (Normal)', diffText: '+0,15', diffAmount: 0, threshold: 'N/A', verdict: 'Alerta' },
    ],
    steps: [
      { time: '07:00:05', phase: 'Lectura', detail: 'Consulta de la posición neta en contratos bilaterales vs demanda de clientes', evidence: 'Demanda descubierta: 3.756 MWh/semana', status: 'ok' },
      { time: '07:01:20', phase: 'Simulación', detail: 'Corrida estocástica con precios spot entre $780 y $950 COP/kWh', evidence: 'Percentil 95: $3.418 M exigibles', status: 'alerta' },
      { time: '07:02:15', phase: 'Alerta Temprana', detail: 'Notificación urgente a Tesorería con recomendación de ampliar línea de crédito revolvente', evidence: 'Aprobación A-1045 creada', status: 'info' },
    ],
    manualBackup: {
      canEdit: true,
      modified: false,
    },
  },
};
