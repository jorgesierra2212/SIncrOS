import React, { useEffect } from 'react';
import ChatPanel from '../ChatPanel';
import { useProcess } from '../ProcessStore';
import type { Ejecucion, ProcesoDef } from '../../../data/process/types';

export default function ChatTab({ p, ej }: { p: ProcesoDef; ej: Ejecucion }) {
  const { misConversaciones, convActiva, setConvActiva } = useProcess();
  const propias = misConversaciones.filter(c => c.procesoId === p.id && c.ejecucionId === ej.id);
  const delProceso = misConversaciones.filter(c => c.procesoId === p.id);
  const activa =
    propias.find(c => c.id === convActiva) ??
    delProceso.find(c => c.id === convActiva) ??
    propias[0] ??
    delProceso[0] ??
    null;

  useEffect(() => {
    if (activa && activa.id !== convActiva) setConvActiva(activa.id);
  }, [activa?.id]);

  return (
    <div className="w-full">
      <ChatPanel
        convId={activa?.id ?? null}
        procesoId={p.id}
        ejecucionId={ej.id}
        preguntas={p.workflow.quickQuestions ?? []}
      />
    </div>
  );
}
