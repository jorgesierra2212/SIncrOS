import { buildWorkflow } from '../build';

export const WF_SRM = buildWorkflow(
  {
    id: 'wf-srm',
    title: 'Reporte SRM diario',
    shortCode: 'CGM-SRM',
    horizon: 'D+1',
    horizonLabel: 'Diario · 10:00 COT',
    officialDeadline: 'Hoy 10:00 COT · corte regulatorio SRM XM',
    category: 'Medida y CGM',
    agentName: 'Agente de Reporte SRM',
    status: 'action_required',
    reglaPrincipal: 'Código de Medida CREG 038 de 2014 · Protocolo SRM v4.2',
    versionCiclo: 'Operación 26-oct-2026',
    isFinancialSettlement: false,
    entityDestination: 'XM (CND)',
    quickQuestions: [
      '¿Cuáles son las 12 fronteras estimadas con respaldo en el archivo SRM de hoy?',
      '¿Por qué el archivo SRM requiere firma antes de las 10:00 COT?',
      '¿Qué pasa si XM rechaza el formato de una frontera en el SRM?',
    ],
    summaryKpis: [
      { label: 'Fronteras reportadas', value: '1.284 de 1.284', tone: 'ok' },
      { label: 'Lecturas directas', value: '1.272 (99,06 %)', tone: 'ok' },
      { label: 'Lecturas estimadas (R1)', value: '12 (0,94 %)', tone: 'warn' },
      { label: 'Esquema XML / SRM', value: '100 % válido', tone: 'ok' },
    ],
  },
  [
    { label: 'Consolidar lecturas certificadas', tipo: 'Automático', executor: 'Concentrador MDM', desc: 'Agrupa las 24 horas de energía activa y reactiva de las 1.284 fronteras.', status: 'completed', duration: '2,1s', metrics: [{ label: 'Registros', value: '30.816' }] },
    { label: 'Aplicar jerarquía de respaldo CREG 038', tipo: 'Agente', executor: 'Agente de Reporte SRM', desc: 'Sustituye con medidor de respaldo R1 las 12 fronteras sin telemedida principal.', status: 'completed', duration: '1,8s', rule: 'CREG 038/2014 Art. 38' },
    { label: 'Validar sintaxis y sumatorias SRM', tipo: 'Agente', executor: 'Agente de Reporte SRM', desc: 'Verifica estructura XML v4.2, códigos SIC y bandas de tolerancia.', status: 'completed', duration: '1,2s' },
    { label: 'Aprobar envío al SRM', tipo: 'Humano', executor: 'CGM y medida', desc: 'Revisión de las 12 fronteras estimadas y firma para transmisión oficial.', status: 'action_required', notice: '12 fronteras usan medidor de respaldo R1 antes del corte de las 10:00 COT.' },
    { label: 'Transmitir archivo al SRM de XM', tipo: 'Automático', executor: 'Conector XM SRM', desc: 'Envío del archivo firmado y recepción de acuse de XM.', status: 'pending' },
  ]
);

export const WF_FACTURACION = buildWorkflow(
  {
    id: 'wf-facturacion',
    title: 'Facturación mensual',
    shortCode: 'FAC-MES',
    horizon: 'D+7',
    horizonLabel: 'Cierre mensual · día 5 hábil',
    officialDeadline: '06-nov-2026 · día 5 hábil',
    category: 'Garantías y Facturación',
    agentName: 'Agente de Cargos y Facturación',
    status: 'action_required',
    reglaPrincipal: 'Resolución DIAN 000165 de 2023 · contratos del agente',
    versionCiclo: 'Periodo octubre 2026',
    isFinancialSettlement: false,
    entityDestination: 'DIAN',
    quickQuestions: [
      '¿Por qué Industrias del Caribe y Energía Sabana tienen variación superior al 20 %?',
      '¿Qué incluyen las 2 notas crédito propuestas en este lote?',
      '¿Cómo se sincroniza el hecho económico con el ERP tras el CUFE de la DIAN?',
    ],
    summaryKpis: [
      { label: 'Prefacturas', value: '38 de 38 validadas', tone: 'ok' },
      { label: 'Valor del lote', value: '$2.940 M' },
      { label: 'Variación vs mes anterior', value: '+11,4 %', tone: 'warn' },
      { label: 'Notas crédito propuestas', value: '2', tone: 'warn' },
    ],
  },
  [
    { label: 'Calcular cargos', tipo: 'Agente', executor: 'Agente de Cargos', desc: 'Cargos por contrato y por usuario con las reglas vigentes.', status: 'completed', duration: '3,8s', metrics: [{ label: 'Cargos', value: '412' }] },
    { label: 'Generar prefacturas', tipo: 'Agente', executor: 'Agente de Cargos', desc: 'Una prefactura por cliente y concepto, con su soporte.', status: 'completed', duration: '2,1s', metrics: [{ label: 'Prefacturas', value: '38' }] },
    { label: 'Revisar prefacturas', tipo: 'Humano', executor: 'Finanzas y facturación', desc: 'Revisión del lote y de las dos notas crédito propuestas.', status: 'action_required', notice: 'Dos clientes con variación mayor al 20 % frente a septiembre.' },
    { label: 'Emitir factura electrónica', tipo: 'Automático', executor: 'Proveedor de factura electrónica', desc: 'Emisión del lote aprobado.', status: 'pending' },
    { label: 'Acuse DIAN', tipo: 'Automático', executor: 'DIAN', desc: 'Validación y CUFE de cada factura.', status: 'pending' },
    { label: 'Enviar hecho económico al ERP', tipo: 'Automático', executor: 'Conector ERP', desc: 'Registro contable de las facturas aceptadas.', status: 'pending' },
  ]
);

export const WF_GARANTIAS = buildWorkflow(
  {
    id: 'wf-garantias',
    title: 'Garantías semanales',
    shortCode: 'GAR-SEM',
    horizon: 'D+7',
    horizonLabel: 'Semanal · lunes 07:00',
    officialDeadline: 'Lunes 27-oct-2026 · provisión antes del cálculo del ASIC',
    category: 'Garantías y Facturación',
    agentName: 'Agente de Proyección de Garantías',
    status: 'action_required',
    reglaPrincipal: 'Resolución CREG 159/2011 · Garantías del MEM',
    versionCiclo: 'Semana del 3-nov-2026',
    isFinancialSettlement: false,
    quickQuestions: [
      '¿Cuánto falta provisionar para la semana del 3 de noviembre?',
      '¿Cómo cambia la garantía si el precio de bolsa baja a $750/kWh?',
      '¿Qué riesgo corre el agente si no cubre la brecha antes del lunes?',
    ],
    summaryKpis: [
      { label: 'Garantía proyectada', value: '$3.418 M', tone: 'warn' },
      { label: 'Provisionado', value: '$2.806 M' },
      { label: 'Faltante', value: '$612 M', tone: 'bad' },
      { label: 'Error de proyección 12 semanas', value: '1,4 %', tone: 'ok' },
    ],
  },
  [
    { label: 'Proyectar posición y precio', tipo: 'Agente', executor: 'Agente de Garantías', desc: 'Posición neta horaria y curva del escenario medio.', status: 'completed', duration: '4,2s' },
    { label: 'Calcular garantía', tipo: 'Agente', executor: 'Motor de reglas', desc: 'Garantía semanal con la regla vigente.', status: 'completed', duration: '1,1s', rule: 'Gar_Sem v2' },
    { label: 'Comparar con XM y lo provisionado', tipo: 'Agente', executor: 'Agente de Garantías', desc: 'Diferencia contra el último cálculo de XM y la caja provisionada.', status: 'completed', duration: '0,9s' },
    { label: 'Aprobar provisión', tipo: 'Humano', executor: 'Finanzas y facturación', desc: 'Decisión de provisionar el faltante.', status: 'action_required', notice: 'Faltan $612 M para la semana del 3-nov.' },
  ]
);

export const WF_RECLAMACIONES = buildWorkflow(
  {
    id: 'wf-reclamaciones',
    title: 'Reclamaciones ASIC',
    shortCode: 'LIQ-REC',
    horizon: 'D+2',
    horizonLabel: 'Por versión publicada',
    officialDeadline: '29-oct-2026 17:00 · plazo de reclamación TX2',
    category: 'Liquidación',
    agentName: 'Auditor de liquidación',
    status: 'action_required',
    reglaPrincipal: 'Procedimiento de reclamaciones ante el ASIC · CREG 024/1995',
    versionCiclo: 'Octubre 2026 · TX2',
    isFinancialSettlement: true,
    entityDestination: 'XM (ASIC)',
    quickQuestions: [
      '¿Cuál es el soporte horario para reclamar los $48,35 M de Reconciliación Positiva?',
      '¿Cuándo vence el plazo para radicar la objeción de la versión TX2?',
      '¿Qué evidencia adjunta el agente en el expediente para el ASIC?',
    ],
    summaryKpis: [
      { label: 'Conceptos reclamables', value: '3', tone: 'bad' },
      { label: 'Valor reclamado', value: '$86,6 M', tone: 'bad' },
      { label: 'Plazo restante', value: '3 días hábiles', tone: 'warn' },
      { label: 'Reclamaciones ganadas 2026', value: '11 de 13', tone: 'ok' },
    ],
  },
  [
    { label: 'Identificar diferencias reclamables', tipo: 'Agente', executor: 'Auditor de liquidación', desc: 'Conceptos sobre umbral en la liquidación sombra.', status: 'completed', duration: '1,6s' },
    { label: 'Preparar soporte y cálculo', tipo: 'Agente', executor: 'Motor de reglas', desc: 'Cálculo horario, archivos XM y regla aplicada.', status: 'completed', duration: '3,0s' },
    { label: 'Redactar reclamación', tipo: 'Agente', executor: 'Auditor de liquidación', desc: 'Borrador formal ante el ASIC.', status: 'completed', duration: '2,4s' },
    { label: 'Revisar y firmar', tipo: 'Humano', executor: 'Gerencia', desc: 'Revisión del borrador y firma.', status: 'action_required', notice: 'La reclamación de RecPos vence el 29-oct.' },
    { label: 'Radicar ante el ASIC', tipo: 'Automático', executor: 'Conector XM', desc: 'Radicación y número de caso.', status: 'pending' },
    { label: 'Seguimiento de respuesta', tipo: 'Automático', executor: 'Conector XM', desc: 'Estado del caso hasta la respuesta del ASIC.', status: 'pending' },
  ]
);
