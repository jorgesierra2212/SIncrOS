import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Clock, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useApp } from './context';
import type { RegulatoryVersion, MarketDateState } from '../data/types';

const VERSIONS: { id: RegulatoryVersion; label: string; desc: string; daysAfter: string }[] = [
  { id: 'TX1', label: 'TX1 · Preliminar', desc: 'Primera liquidación a D+5 días calendario', daysAfter: 'D+5' },
  { id: 'TX2', label: 'TX2 · Ajustada', desc: 'Versión ajustada con medidas definitivas a D+12', daysAfter: 'D+12' },
  { id: 'TX3', label: 'TX3 · Definitiva', desc: 'Cierre comercial formal a D+45 días ante el ASIC', daysAfter: 'D+45' },
  { id: 'TXR', label: 'TXR · Reliquidación', desc: 'Ajuste extraordinario por reclamación o fallo CREG', daysAfter: 'Extraordinaria' },
  { id: 'TXF', label: 'TXF · Final Histórica', desc: 'Liquidación inalterable consolidada de archivo', daysAfter: 'Consolidada' },
];

export default function MarketDatePicker() {
  const { marketDate, setMarketDate, setCycleVersion } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectPreset = (type: 'today' | 'yesterday' | 'month') => {
    if (type === 'today') {
      setMarketDate({
        date: '2026-10-26',
        formatted: '26 de Octubre de 2026',
        shortFormatted: '26-Oct-2026',
        dayOfWeek: 'Lunes',
        periodMonth: 'Octubre 2026',
        cycleVersion: 'TX2',
        horizonName: 'Operación D (Tiempo real)',
        deadlineNotice: 'Plazo para radicar reclamaciones TX2 vence en 48 horas ante el ASIC',
        hoursRemaining: 48,
      });
    } else if (type === 'yesterday') {
      setMarketDate({
        date: '2026-10-25',
        formatted: '25 de Octubre de 2026',
        shortFormatted: '25-Oct-2026',
        dayOfWeek: 'Domingo',
        periodMonth: 'Octubre 2026',
        cycleVersion: 'TX2',
        horizonName: 'Despacho D-1 (Cerrado)',
        deadlineNotice: 'Declaración de disponibilidad y oferta cerrada a las 08:00 COT',
        hoursRemaining: 0,
      });
    } else {
      setMarketDate({
        date: '2026-10-01',
        formatted: 'Octubre 2026 Completo',
        shortFormatted: 'Oct-2026',
        dayOfWeek: 'Mes completo',
        periodMonth: 'Octubre 2026',
        cycleVersion: 'TX2',
        horizonName: 'Ciclo Mensual de Liquidación M',
        deadlineNotice: 'Emisión de prefacturas y cargos CREG 119 vence día 5 hábil',
        hoursRemaining: 120,
      });
    }
    setOpen(false);
  };

  const handleCustomDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const parts = val.split('-');
    if (parts.length === 3) {
      const formatted = `${parts[2]} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][parseInt(parts[1], 10) - 1]} de ${parts[0]}`;
      setMarketDate({
        ...marketDate,
        date: val,
        formatted,
        shortFormatted: `${parts[2]}-${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(parts[1], 10) - 1]}-${parts[0]}`,
        dayOfWeek: 'Fecha seleccionada',
      });
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-paper hover:bg-line/60 text-txt px-2.5 py-1.5 rounded-md text-xs font-medium border border-line transition-colors"
        title="Cambiar fecha de mercado y ciclo de liquidación"
      >
        <Calendar size={13} className="text-brand shrink-0" />
        <span className="font-semibold text-txt">{marketDate.shortFormatted}</span>
        <span className="text-line">·</span>
        <span className="bg-brandsoft text-brand px-1.5 py-0.2 rounded text-[10.5px] font-bold">
          {marketDate.cycleVersion}
        </span>
        <ChevronDown size={12} className="text-mut shrink-0 ml-0.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-80 bg-white border border-line rounded-lg shadow-xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-1">
          {/* Header */}
          <div className="pb-2 mb-2.5 border-b border-line flex items-center justify-between">
            <div>
              <div className="font-semibold text-txt text-[13px]">Horizonte y Ciclo MEM</div>
              <div className="text-[11px] text-mut">Mercado Eléctrico Colombiano (XM)</div>
            </div>
            <span className="text-[10px] text-ok bg-oksoft font-bold px-1.5 py-0.5 rounded">
              En línea CND
            </span>
          </div>

          {/* Quick Presets */}
          <div className="mb-3">
            <span className="text-[10.5px] font-semibold text-mut uppercase tracking-wider block mb-1.5">
              Acceso rápido por horizonte
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => selectPreset('today')}
                className={`px-2 py-1.5 rounded text-center font-medium transition-colors border ${
                  marketDate.date === '2026-10-26'
                    ? 'bg-brand text-white border-brand'
                    : 'bg-paper border-line text-txt hover:bg-line/50'
                }`}
              >
                Hoy (D)
              </button>
              <button
                onClick={() => selectPreset('yesterday')}
                className={`px-2 py-1.5 rounded text-center font-medium transition-colors border ${
                  marketDate.date === '2026-10-25'
                    ? 'bg-brand text-white border-brand'
                    : 'bg-paper border-line text-txt hover:bg-line/50'
                }`}
              >
                Ayer (D-1)
              </button>
              <button
                onClick={() => selectPreset('month')}
                className={`px-2 py-1.5 rounded text-center font-medium transition-colors border ${
                  marketDate.date === '2026-10-01'
                    ? 'bg-brand text-white border-brand'
                    : 'bg-paper border-line text-txt hover:bg-line/50'
                }`}
              >
                Mes Oct
              </button>
            </div>
          </div>

          {/* Regulatory Version Selector */}
          <div className="mb-3">
            <span className="text-[10.5px] font-semibold text-mut uppercase tracking-wider block mb-1.5">
              Versión regulatoria de liquidación (ASIC)
            </span>
            <div className="space-y-1">
              {VERSIONS.map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    setCycleVersion(v.id);
                  }}
                  className={`w-full text-left p-1.5 rounded flex items-center justify-between transition-colors ${
                    marketDate.cycleVersion === v.id
                      ? 'bg-brandsoft/60 text-brand font-semibold'
                      : 'hover:bg-paper text-txt'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs">{v.id}</span>
                    <span className="text-[11px] text-mut">{v.desc}</span>
                  </div>
                  {marketDate.cycleVersion === v.id && <Check size={13} className="text-brand shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Input */}
          <div className="mb-3 pt-2 border-t border-line">
            <label className="text-[10.5px] font-semibold text-mut uppercase tracking-wider block mb-1">
              Seleccionar otra fecha de operación
            </label>
            <input
              type="date"
              value={marketDate.date}
              onChange={handleCustomDate}
              className="w-full bg-paper border border-line rounded px-2.5 py-1.5 text-xs text-txt outline-none focus:border-brand"
            />
          </div>

          {/* Horizon & Deadline Notice */}
          <div className="p-2 bg-warnsoft/50 rounded border border-warn/20 text-[11px] flex gap-2 items-start text-warn leading-tight">
            <Clock size={13} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">{marketDate.horizonName}</span>
              <span>{marketDate.deadlineNotice}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
