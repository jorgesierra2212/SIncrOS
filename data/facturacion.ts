// Datos ilustrativos del dominio Facturación y Usuarios No Regulados
export const INVOICES = [
  { n: 'FE-23891', client: 'Industrias del Caribe', concept: 'Energía octubre', value: 412_800_000, state: 'Por aprobar', dian: '—', erp: '—', cufe: '—', fecha: '25-oct-2026' },
  { n: 'FE-23890', client: 'Comercializadora Andina', concept: 'Contrato C-2026-014', value: 1_284_000_000, state: 'Por aprobar', dian: '—', erp: '—', cufe: '—', fecha: '25-oct-2026' },
  { n: 'FE-23874', client: 'Sede Montería 2', concept: 'Energía septiembre', value: 38_400_000, state: 'Registrada', dian: 'Aceptada', erp: 'Sincronizada', cufe: '9a7f3c...b281', fecha: '30-sep-2026' },
  { n: 'FE-23873', client: 'Energía Sabana', concept: 'Contrato C-2026-031', value: 642_100_000, state: 'Registrada', dian: 'Aceptada', erp: 'Sincronizada', cufe: '4d8a1e...c992', fecha: '30-sep-2026' },
  { n: 'FE-23866', client: 'Sede Cali 1', concept: 'Excedentes AGR', value: 9_850_000, state: 'Con errores', dian: 'Rechazada: NIT', erp: 'Fallo VPN (TK-802)', cufe: '—', fecha: '05-oct-2026' },
  { n: 'FE-23860', client: 'Planta Barranquilla 1', concept: 'Respaldo de contratos', value: 220_300_000, state: 'En proceso', dian: 'Enviada', erp: 'Pendiente', cufe: 'e71b90...aa14', fecha: '05-oct-2026' },
];

export const CREDIT_NOTES = [
  { n: 'NC-0412', refFactura: 'FE-23874', client: 'Sede Montería 2', valor: 3_840_000, motivo: 'Ajuste de lectura de medidor por informe de crítica', fecha: '04-oct-2026', estado: 'Aprobada' },
  { n: 'NC-0413', refFactura: 'FE-23873', client: 'Energía Sabana', valor: 10_360_000, motivo: 'Reliquidación versión TX2 concepto restricciones', fecha: '12-oct-2026', estado: 'Aprobada' },
];

export const END_USERS = [
  { user: 'Sede Bogotá 1', market: 'No regulado', kwh: 812_400, G: 318, T: 48, D: 96, C: 22, P: 31, R: 19 },
  { user: 'Sede Medellín 2', market: 'No regulado', kwh: 402_100, G: 325, T: 48, D: 102, C: 22, P: 31, R: 19 },
  { user: 'Sede Cali 1', market: 'Autogeneración remota', kwh: 96_700, G: 280, T: 48, D: 118, C: 25, P: 33, R: 19 },
  { user: 'Sede Montería 2', market: 'Regulado', kwh: 41_300, G: 342, T: 48, D: 164, C: 61, P: 44, R: 19 },
  { user: 'Sede Cartagena 3', market: 'No regulado', kwh: 655_900, G: 311, T: 48, D: 89, C: 20, P: 29, R: 19 },
];
