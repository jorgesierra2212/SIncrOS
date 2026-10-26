import React from 'react';
import { Menu, Search, Bell, Loader2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from './context';
import { VIEWS } from '../data/mock';
import { LayerBadge } from './ui';
import MarketDatePicker from './MarketDatePicker';

export default function TopBar({ onMenu }: { onMenu: () => void }) {
  const { view, ask, approvals, decisions, activeTaskProgress, go } = useApp();
  const v = VIEWS[view] || { group: 'Trabajo', label: 'Espacio de trabajo', capa: 'nucleo', tipo: 'trabajo' };

  const pendingApprovalsCount = approvals.filter(a => !decisions[a.id]).length;

  return (
    <div className="h-14 shrink-0 bg-white border-b border-line flex items-center gap-3 px-4 z-20">
      <button
        className="lg:hidden text-txt p-1.5 hover:bg-paper rounded-md"
        onClick={onMenu}
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb with Layer */}
      <div className="flex items-center gap-2 text-sm text-mut whitespace-nowrap hidden sm:flex">
        <span>{v.group}</span>
        <span className="text-line">/</span>
        <span className="text-txt font-semibold">{v.label}</span>
        <LayerBadge capa={v.capa} compact />
      </div>

      {/* Active Task Progress Banner if a task is running */}
      {activeTaskProgress && (
        <div className="hidden md:flex items-center gap-2 bg-brandsoft text-brand text-xs px-3 py-1 rounded-full animate-pulse border border-brand/20">
          {activeTaskProgress.failed ? (
            <AlertTriangle size={14} className="text-bad" />
          ) : activeTaskProgress.isComplete ? (
            <CheckCircle2 size={14} className="text-ok" />
          ) : (
            <Loader2 size={14} className="animate-spin text-brand" />
          )}
          <span className="font-medium">{activeTaskProgress.taskName}:</span>
          <span>{activeTaskProgress.stepText}</span>
          <span className="font-semibold">
            ({activeTaskProgress.step}/{activeTaskProgress.totalSteps})
          </span>
        </div>
      )}

      {/* Right Zone: Market Date Picker + Search + Notifications */}
      <div className="ml-auto flex items-center gap-2.5">
        {/* Friendly Date & MEM Cycle Manager */}
        {view !== 'proceso' && <MarketDatePicker />}

        {/* Global search */}
        <form
          className="hidden md:block w-56 lg:w-72"
          onSubmit={e => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('q') as HTMLInputElement;
            if (input?.value?.trim()) {
              ask(input.value.trim());
              input.value = '';
            }
          }}
        >
          <label className="flex items-center gap-2 bg-paper rounded-md px-3 py-1.5 text-xs text-mut focus-within:ring-1 focus-within:ring-brand">
            <Search size={13} className="shrink-0" />
            <input
              name="q"
              placeholder="Buscar o consultar agentes (/liquidar...)"
              className="bg-transparent outline-none flex-1 text-txt placeholder:text-mut text-xs"
            />
          </label>
        </form>

        {/* Illustrative data badge */}
        <span className="hidden 2xl:inline text-[11px] rounded bg-warnsoft text-warn px-2 py-0.5 font-medium border border-warn/20 whitespace-nowrap">
          Datos ilustrativos · MEM
        </span>

        {/* Notifications / Approvals Bell */}
        <button
          onClick={() => go('bandeja')}
          className="relative text-mut hover:text-txt p-1.5 rounded-md hover:bg-paper transition-colors"
          aria-label="Notificaciones y aprobaciones"
          title={`${pendingApprovalsCount} aprobaciones pendientes de validación`}
        >
          <Bell size={18} />
          {pendingApprovalsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-warn text-white text-[10px] font-bold grid place-items-center animate-bounce">
              {pendingApprovalsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
