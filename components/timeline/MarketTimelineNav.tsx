import React from 'react';
import {
  Clock, CheckCircle2, AlertTriangle, ArrowRight, Calendar,
  ShieldAlert, ChevronRight, Zap, Scale, Radio
} from 'lucide-react';
import { MEM_TIMELINE_STAGES } from '../../data/workflowModels';
import { useApp } from '../context';

interface MarketTimelineNavProps {
  selectedStageId: string;
  onSelectStage: (stageId: string, processId: string) => void;
}

export default function MarketTimelineNav({
  selectedStageId,
  onSelectStage,
}: MarketTimelineNavProps) {
  const { marketDate } = useApp();

  return (
    <div className="bg-white border border-line rounded-xl p-4 md:p-5 mb-6 shadow-2xs">
      {/* Timeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand uppercase tracking-wider bg-brandsoft px-2 py-0.5 rounded">
              Línea de Tiempo Regulatoria · MEM
            </span>
            <span className="text-xs text-mut font-medium">Mercado Mayorista de Energía Eléctrica</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-txt mt-1">
            Ciclo Diario y Horizonte de Liquidación · {marketDate.formatted}
          </h2>
        </div>

        {/* Live Deadline Badge */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0">
          <Clock size={14} className="text-amber-600 animate-pulse" />
          <span>Próximo vencimiento: <b>10:00 COT · SRM XM ({marketDate.hoursRemaining}h restantes)</b></span>
        </div>
      </div>

      {/* Horizontal Interactive Timeline Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {MEM_TIMELINE_STAGES.map((stage, idx) => {
          const isSelected = selectedStageId === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.id, stage.processId)}
              className={`relative text-left p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                isSelected
                  ? 'bg-brandsoft/50 border-brand shadow-xs ring-2 ring-brand/20'
                  : 'bg-paper/40 border-line hover:bg-white hover:border-mut/40'
              }`}
            >
              {/* Stage Top Tag & Alert */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-brand text-white' : 'bg-white text-txt border border-line'
                  }`}
                >
                  {stage.label}
                </span>

                {stage.hasPending ? (
                  <span
                    className="text-[10px] font-bold text-bad bg-badsoft px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-bad/20"
                    title="Acciones pendientes de aprobación"
                  >
                    <AlertTriangle size={10} />
                    <span>!</span>
                  </span>
                ) : (
                  <CheckCircle2 size={13} className="text-ok" />
                )}
              </div>

              {/* Time & Title */}
              <div className="my-1">
                <div className="text-[11px] font-bold text-mut">{stage.timeLabel}</div>
                <div className={`font-bold leading-tight mt-0.5 ${isSelected ? 'text-brand' : 'text-txt'}`}>
                  {stage.title}
                </div>
              </div>

              {/* Deadline & indicator */}
              <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[10px] text-mut">
                <span className="truncate">{stage.deadline}</span>
                <ChevronRight
                  size={12}
                  className={`shrink-0 transition-transform ${isSelected ? 'text-brand translate-x-0.5' : 'opacity-40'}`}
                />
              </div>

              {/* Bottom active accent line */}
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-b-lg" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
