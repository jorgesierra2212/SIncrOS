// Datos ilustrativos del dominio Despacho
export const PLANTS = [
  { name: 'Planta térmica Norte · U1', tech: 'Térmica gas', cap: 160, disp: 155, desp: 150, real: 149.2, state: 'En despacho' },
  { name: 'Planta térmica Norte · U2', tech: 'Térmica gas', cap: 160, disp: 120, desp: 140, real: 118.4, state: 'Desviación' },
  { name: 'Hidro Sinú', tech: 'Hidráulica', cap: 340, disp: 330, desp: 210, real: 211.0, state: 'En despacho' },
  { name: 'Solar Cesar', tech: 'Solar', cap: 90, disp: 90, desp: 61, real: 58.7, state: 'Variable' },
];

export const PLANT_DAY = Array.from({ length: 24 }, (_, h) => ({
  hora: `${h}`,
  despacho: h >= 17 && h <= 21 ? 140 : h >= 8 ? 120 : 90,
  real: h >= 17 && h <= 21 ? 118 : h >= 8 ? 119 : 89,
  disponibilidad: h >= 16 ? 120 : 155,
}));

export const DESPACHO_OFERTAS_DATA = [
  { planta: 'Térmica Norte U1', tech: 'Gas CC', capMax: 160, precioOferta: 345.5, dispDeclarada: 155, minTecnico: 60, rampaSubida: 2.5, estado: 'Enviada CND' },
  { planta: 'Térmica Norte U2', tech: 'Gas CC', capMax: 160, precioOferta: 360.0, dispDeclarada: 120, minTecnico: 60, rampaSubida: 2.5, estado: 'Redeclarada 16:42' },
  { planta: 'Hidro Sinú', tech: 'Hidráulica embalse', capMax: 340, precioOferta: 215.0, dispDeclarada: 330, minTecnico: 40, rampaSubida: 15.0, estado: 'Enviada CND' },
  { planta: 'Solar Cesar', tech: 'Solar Fotovoltaica', capMax: 90, precioOferta: 0.0, dispDeclarada: 90, minTecnico: 0, rampaSubida: 30.0, estado: 'Enviada CND' },
];

export const REDESPACHOS_DATA = [
  { hora: '16:45', unidad: 'Térmica Norte U2', tipo: 'Seguridad de área', solicitante: 'CND XM', anteriorMW: 140, nuevoMW: 118, motivo: 'Restricción en línea Ternera-Candelaria 230kV', compensacion: 'Reconciliación positiva reconocida' },
  { hora: '11:15', unidad: 'Hidro Sinú', tipo: 'Control de frecuencia', solicitante: 'CND XM', anteriorMW: 200, nuevoMW: 220, motivo: 'Reserva rodante secundaria AGC', compensacion: 'Servicios complementarios' },
];
