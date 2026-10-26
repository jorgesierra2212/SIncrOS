import { seeded } from './mock/core';

// Datos ilustrativos del dominio CGM y Fronteras de Medida
export const BRANDS = ['Itron', 'Elster', 'ION', 'SEL'];
export const TYPES = ['Generación', 'Consumo no regulado', 'Autogeneración remota', 'Consumo regulado', 'Excedentes'];
export const PLACES = ['Barranquilla', 'Montería', 'Cartagena', 'Valledupar', 'Medellín', 'Bogotá', 'Cali', 'Bucaramanga', 'Santa Marta', 'Sincelejo'];

export interface Frontier {
  code: string;
  name: string;
  type: string;
  brand: string;
  com: 'OK' | 'Alerta' | 'Caída';
  lastRead: string;
  critica: 'OK' | 'Alerta' | 'Error';
  kwh: number;
}

export const FRONTIERS: Frontier[] = (() => {
  const r = seeded(7);
  return Array.from({ length: 28 }, (_, i) => {
    const x = r();
    const com = x > 0.93 ? 'Caída' : x > 0.84 ? 'Alerta' : 'OK';
    const y = r();
    const critica = i === 3 ? 'Error' : y > 0.9 ? 'Error' : y > 0.78 ? 'Alerta' : 'OK';
    return {
      code: i === 3 ? 'Frt-0412' : `Frt-${String(100 + Math.floor(r() * 900)).padStart(4, '0')}`,
      name: `${TYPES[i % TYPES.length] === 'Generación' ? 'Planta' : 'Sede'} ${PLACES[i % PLACES.length]} ${1 + (i % 3)}`,
      type: TYPES[i % TYPES.length],
      brand: BRANDS[Math.floor(r() * 4)],
      com: com as Frontier['com'],
      lastRead: com === 'Caída' ? 'Hace 7 h' : `Hace ${5 + Math.floor(r() * 50)} min`,
      critica: critica as Frontier['critica'],
      kwh: Math.round(2000 + r() * 90000),
    };
  });
})();

export const HOURLY_ANOMALY = Array.from({ length: 24 }, (_, h) => {
  const base = 380 + 260 * Math.sin(((h - 6) / 24) * Math.PI * 2) + (h > 8 && h < 18 ? 120 : 0);
  const prev = 380 + 260 * Math.sin(((h - 7) / 24) * Math.PI * 2) + (h > 9 && h < 19 ? 120 : 0);
  return { hora: `${h}`, respaldo: Math.round(base), principal: Math.round(prev) };
});
