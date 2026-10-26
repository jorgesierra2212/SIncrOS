import React from 'react';
import AirtableGrid from '../../AirtableGrid';
import { useProcess } from '../ProcessStore';
import type { Ejecucion, ProcesoDef } from '../../../data/process/types';

export default function DatosTab({ p, ej }: { p: ProcesoDef; ej: Ejecucion }) {
  const { filasDe, cambiosDe, editarCelda, importarFilas, puede } = useProcess();
  return (
    <AirtableGrid
      titulo={`${p.codigo}_${ej.fecha}${ej.version ? '_' + ej.version : ''}`}
      rows={p.workflow.airtableData}
      columnas={p.columnas}
      filas={filasDe(p.id, ej.id)}
      cambios={cambiosDe(p.id, ej.id)}
      editable={puede(p.id).editar && ej.estado !== 'Completada'}
      onEdit={(f, c, v, m) => editarCelda(p.id, ej.id, f, c, v, m)}
      onImport={filas => importarFilas(p.id, ej.id, filas)}
    />
  );
}
