import React, { useState } from 'react';
import { Play, GitBranch } from 'lucide-react';
import { Panel, Btn, ViewHeader, StatusBadge, Badge, Illustrative, LayerBadge } from '../components/ui';
import { FORMULAS, RECPOS_TREE, FormulaNode } from '../data/mock';

function TreeNode({
  n,
  depth,
  sel,
  onSel,
}: {
  n: FormulaNode;
  depth: number;
  sel: string;
  onSel: (s: string) => void;
}) {
  return (
    <div className={depth ? 'ml-5 border-l-2 border-line pl-3' : ''}>
      <button
        onClick={() => onSel(n.name)}
        className={`block text-left py-1 ${sel === n.name ? 'text-brand font-semibold' : 'text-txt'}`}
      >
        <span className="text-xs">{n.name}</span>
        {n.source && <span className="block text-[11px] text-mut">{n.source}</span>}
      </button>
      {n.children?.map(c => (
        <TreeNode key={c.name} n={c} depth={depth + 1} sel={sel} onSel={onSel} />
      ))}
    </div>
  );
}

export function MotorReglas() {
  const [f, setF] = useState(0);
  const [sel, setSel] = useState(RECPOS_TREE.name);
  const [tested, setTested] = useState(false);
  const cur = FORMULAS[f];

  return (
    <>
      <ViewHeader
        title="Motor de reglas y árbol de dependencias"
        desc="Fórmulas versionadas por vigencia CREG con fecha de inicio y fin. Un cambio regulatorio nunca reescribe el histórico. Las reglas contractuales del cliente se configuran sobre el mismo motor sin código."
        capa="nucleo"
        actions={
          <Btn kind="primary">
            <GitBranch size={14} /> Nueva vigencia de regla
          </Btn>
        }
      />

      <div className="grid lg:grid-cols-12 gap-4">
        <Panel className="lg:col-span-4" title="Fórmulas vigentes e históricas" pad={false}>
          <ul>
            {FORMULAS.map((x, i) => (
              <li key={i}>
                <button
                  onClick={() => setF(i)}
                  className={`w-full text-left px-4 py-2.5 border-b border-line last:border-0 transition-colors ${
                    i === f ? 'bg-brandsoft/50 border-l-4 border-brand' : 'hover:bg-paper'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-txt">{x.code}</span>
                    <span className="text-[11px] text-mut font-mono">v{x.version}</span>
                    <span className="ml-auto">
                      <StatusBadge s={x.status} />
                    </span>
                  </div>
                  <div className="text-xs text-mut mt-0.5">{x.name}</div>
                  <div className="text-[10px] text-mut flex justify-between mt-1">
                    <span>Vigencia: {x.from} → {x.to}</span>
                    <LayerBadge capa={x.capa} compact />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="lg:col-span-8 space-y-4">
          <Panel
            title={`${cur.code} v${cur.version} · ${cur.name}`}
            action={<Badge tone="brand">Vigencia {cur.from} → {cur.to}</Badge>}
          >
            <pre className="text-xs bg-ink text-[#D7E0EE] rounded p-3 overflow-x-auto leading-relaxed font-mono">
              {`-- Expresión matemática oficial CREG
RecPos[h] = max(0, GenReal[h] - GenIdeal[h]) * PrecioRec[h]

-- SQL compilado automáticamente sobre BigQuery Lake
SELECT 
  h.fecha, 
  h.hora, 
  h.planta_id,
  GREATEST(0, h.gen_real_mwh - h.gen_ideal_mwh) * h.precio_rec_cop AS recpos_monto
FROM \`enersinc_os_prod.mem_colombia.horario_planta\` h
WHERE h.version_liquidacion = @version 
  AND h.fecha BETWEEN @desde AND @hasta;`}
            </pre>
          </Panel>

          <div className="grid md:grid-cols-2 gap-4">
            <Panel title="Árbol de dependencias causal">
              <p className="text-[11px] text-mut mb-2">
                Haga clic en cualquier nodo para trazar el origen primario del dato:
              </p>
              <TreeNode n={RECPOS_TREE} depth={0} sel={sel} onSel={setSel} />
            </Panel>

            <Panel title="Probar fórmula contra datos reales">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['Versión', 'TX2'],
                  ['Fecha', '21-oct-2026'],
                  ['Planta', 'Unidad 2 Térmica'],
                  ['Horas evaluadas', '18 a 21'],
                ].map(([l, v]) => (
                  <label key={l} className="block">
                    <span className="text-[11px] text-mut">{l}</span>
                    <input defaultValue={v} className="mt-0.5 w-full border border-line rounded px-2 py-1 text-xs font-medium" />
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <Btn kind="primary" onClick={() => setTested(true)}>
                  <Play size={13} /> Ejecutar prueba en sandbox
                </Btn>
              </div>

              {tested && (
                <div className="mt-3 text-xs bg-paper rounded p-3 border border-line animate-in fade-in">
                  <div className="text-bad font-semibold">
                    Resultado: +$48,4 M COP de diferencia contra publicación XM
                  </div>
                  <div className="text-mut text-[11px] mt-1">
                    Nodo causal aislado: <b>Disponibilidad declarada (horas 18–21)</b>.
                  </div>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>

      <Illustrative />
    </>
  );
}
