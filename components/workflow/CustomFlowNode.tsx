import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  CheckCircle2, Clock, AlertTriangle, Loader2, Bot, UserCheck, Cog, XCircle
} from 'lucide-react';
import { WorkflowNodeData } from '../../data/workflowModels';

export function tipoNodoLabel(category: WorkflowNodeData['category']): 'Agente' | 'Humano' | 'Automático' {
  if (category === 'aprobacion') return 'Humano';
  if (category === 'ingesta' || category === 'transmision') return 'Automático';
  return 'Agente';
}

export default function CustomFlowNode({ data, selected }: any) {
  const nodeData = (data as any) as WorkflowNodeData;
  const tipo = tipoNodoLabel(nodeData.category);

  const getStatusConfig = () => {
    switch (nodeData.status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'text-ok',
          bg: 'bg-oksoft',
          border: 'border-ok/40',
          badgeText: 'Completado',
          glow: '',
        };
      case 'running':
        return {
          icon: Loader2,
          color: 'text-brand',
          bg: 'bg-brandsoft',
          border: 'border-brand',
          badgeText: 'En curso',
          glow: 'ring-2 ring-brand/30 ring-offset-1',
        };
      case 'action_required':
        return {
          icon: AlertTriangle,
          color: 'text-warn',
          bg: 'bg-warnsoft',
          border: 'border-warn',
          badgeText: 'Esperando aprobación',
          glow: 'ring-2 ring-warn/30 ring-offset-1',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-bad',
          bg: 'bg-badsoft',
          border: 'border-bad',
          badgeText: 'Con error',
          glow: 'ring-2 ring-bad/30 ring-offset-1',
        };
      default:
        return {
          icon: Clock,
          color: 'text-mut',
          bg: 'bg-paper',
          border: 'border-line',
          badgeText: 'Pendiente',
          glow: '',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const TipoIcon = tipo === 'Humano' ? UserCheck : tipo === 'Automático' ? Cog : Bot;
  const tipoBadgeClass =
    tipo === 'Humano'
      ? 'bg-warnsoft text-warn border-warn/30'
      : tipo === 'Agente'
      ? 'bg-brandsoft text-brand border-brand/30'
      : 'bg-paper text-mut border-line';

  return (
    <div
      className={`w-[244px] rounded-lg bg-white border text-left transition-all shadow-xs cursor-pointer ${
        selected ? 'ring-2 ring-brand border-brand shadow-md' : statusConfig.border
      } ${statusConfig.glow}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-mut border-2 !border-white"
      />

      {/* Node Header: Step Number + Tipo (Agente / Humano / Automático) + Estado */}
      <div className="flex items-center justify-between gap-1 px-3 py-2 border-b border-line/60 bg-paper/60 rounded-t-lg">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-mono font-bold text-mut bg-white px-1.5 py-0.5 rounded border border-line">
            #{String(nodeData.stepNumber).padStart(2, '0')}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tipoBadgeClass}`}>
            <TipoIcon size={10} />
            {tipo}
          </span>
        </div>

        <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
          <StatusIcon size={10} className={nodeData.status === 'running' ? 'animate-spin' : ''} />
          <span>{statusConfig.badgeText}</span>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3">
        <h4 className="text-xs font-bold text-txt leading-snug line-clamp-2">
          {nodeData.label}
        </h4>
        <p className="text-[11px] text-mut mt-1 line-clamp-2 leading-relaxed">
          {nodeData.shortDesc}
        </p>

        {nodeData.actionRequiredNotice && (
          <div className="mt-2 text-[10px] font-medium text-warn bg-warnsoft px-2 py-1 rounded border border-warn/20 leading-tight">
            {nodeData.actionRequiredNotice}
          </div>
        )}

        {/* Footer meta: Responsable */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-line/40 text-[10.5px] text-mut">
          <span className="truncate max-w-[155px]">
            Resp.: <b className="font-semibold text-txt">{nodeData.executor}</b>
          </span>
          {nodeData.duration && (
            <span className="font-mono text-mut bg-paper px-1 py-0.2 rounded">
              {nodeData.duration}
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-brand border-2 !border-white"
      />
    </div>
  );
}
