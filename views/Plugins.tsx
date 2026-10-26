import React, { useState } from 'react';
import {
  Puzzle, Plus, Play, CheckCircle2, XCircle, ArrowUpRight, RotateCcw, AlertTriangle, Shield, Check,
  FileText, History, Code, Sparkles, Layers
} from 'lucide-react';
import { useApp } from '../components/context';
import { Panel, Badge, Btn, Table, ViewHeader, StatusBadge, LayerBadge, Illustrative } from '../components/ui';
import type { PluginManifest, TestCase } from '../data/types';

export function PluginsView() {
  const { plugins, savePlugin, runPluginTests, promotePlugin, rollbackPlugin, openArtifact, profile } = useApp();
  const [selectedId, setSelectedId] = useState<string>(plugins[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [testResultModal, setTestResultModal] = useState<{ passed: boolean; message: string; reportArtifactId: string } | null>(null);

  const selected = plugins.find(p => p.id === selectedId) || plugins[0];

  // Form state for editor
  const [formName, setFormName] = useState(selected?.nombre || '');
  const [formDesc, setFormDesc] = useState(selected?.descripcion || '');
  const [formInstrucciones, setFormInstrucciones] = useState(selected?.instrucciones || '');
  const [formVersion, setFormVersion] = useState(selected?.version || '');
  const [formCapa, setFormCapa] = useState(selected?.capa || 'cliente');
  const [formCasos, setFormCasos] = useState<TestCase[]>(selected?.casosDePrueba || []);

  const openEditor = (p: PluginManifest) => {
    setSelectedId(p.id);
    setFormName(p.nombre);
    setFormDesc(p.descripcion);
    setFormInstrucciones(p.instrucciones);
    setFormVersion(p.version);
    setFormCapa(p.capa);
    setFormCasos([...p.casosDePrueba]);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selected) return;
    const updated: PluginManifest = {
      ...selected,
      nombre: formName,
      descripcion: formDesc,
      instrucciones: formInstrucciones,
      version: formVersion,
      capa: formCapa,
      casosDePrueba: formCasos,
    };
    savePlugin(updated);
    setIsEditing(false);
  };

  const handleRunTests = () => {
    if (!selected) return;
    const res = runPluginTests(selected.id);
    setTestResultModal(res);
  };

  const handlePromote = () => {
    if (!selected) return;
    const res = promotePlugin(selected.id);
    alert(res.message);
  };

  const canPromote =
    selected?.testMetrics &&
    selected.testMetrics.casosAprobadosPct >= 95 &&
    selected.testMetrics.coincidenciaReferenciaPct >= 95 &&
    selected.testMetrics.permisosValidos &&
    selected.testMetrics.sinDatosSensibles;

  return (
    <>
      <ViewHeader
        title="Catálogo y estudio de plugins"
        desc="Extensibilidad agéntica: cree o certifique paquetes que agregan skills, vistas o conectores. Cada plugin del cliente debe superar las 4 pruebas obligatorias antes de llegar a producción."
        capa="cliente"
        actions={
          <Btn
            kind="primary"
            onClick={() => {
              const newP: PluginManifest = {
                id: `plug-${Date.now()}`,
                nombre: 'Nuevo plugin personalizado',
                version: '0.1.0',
                capa: 'cliente',
                autor: profile.person,
                descripcion: 'Descripción del plugin de usuario para validaciones de mercado.',
                entradas: ['Datos horarios'],
                salidas: ['Resultado calculado'],
                permisos: { lectura: ['mercado.bolsa'], escritura: ['mercado.alertas'] },
                herramientas: ['calculo_mem'],
                instrucciones: 'Instrucciones en lenguaje natural para el agente...',
                casosDePrueba: [
                  { id: 'tc-new', nombre: 'Prueba básica', entrada: '{"val": 100}', salidaEsperada: '{"res": 100}', pasa: true },
                ],
                estado: 'Borrador',
              };
              savePlugin(newP);
              openEditor(newP);
            }}
          >
            <Plus size={14} /> Crear plugin en Estudio
          </Btn>
        }
      />

      {/* Lifecycle Flow Indicator */}
      <div className="bg-white border border-line rounded-lg p-3 mb-4">
        <span className="text-xs font-semibold text-mut uppercase tracking-wider block mb-2">
          Ciclo de vida gobernado:
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {['Borrador', 'Sandbox', 'Pruebas', 'Revisión', 'Producción', 'Retirado'].map((st, i) => (
            <React.Fragment key={st}>
              <span
                className={`px-2.5 py-1 rounded font-medium ${
                  selected?.estado === st
                    ? 'bg-brand text-white shadow-2xs font-bold'
                    : 'bg-paper text-mut'
                }`}
              >
                {st}
              </span>
              {i < 5 && <span className="text-mut text-xs">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Plugins List */}
        <div className="lg:col-span-2 space-y-2.5">
          <Panel title="Plugins registrados" pad={false}>
            <div className="divide-y divide-line">
              {plugins.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left p-3.5 transition-colors ${
                    p.id === selected?.id ? 'bg-brandsoft/30 border-l-4 border-brand' : 'hover:bg-paper'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-txt">{p.nombre}</span>
                    <StatusBadge s={p.estado} />
                  </div>
                  <div className="text-xs text-mut line-clamp-2 leading-relaxed">{p.descripcion}</div>
                  <div className="flex items-center justify-between text-[11px] text-mut mt-2 pt-1 border-t border-line/40">
                    <span>v{p.version} · {p.autor}</span>
                    <LayerBadge capa={p.capa} compact />
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* Plugin Details & Studio */}
        {selected && (
          <div className="lg:col-span-3 space-y-4">
            <Panel
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Puzzle size={16} className="text-brand" />
                    <span>{selected.nombre}</span>
                    <span className="text-xs font-mono text-mut">v{selected.version}</span>
                  </div>
                  <LayerBadge capa={selected.capa} />
                </div>
              }
              action={
                !isEditing ? (
                  <Btn small onClick={() => openEditor(selected)}>
                    Editar en Estudio
                  </Btn>
                ) : (
                  <div className="flex gap-1.5">
                    <Btn small onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Btn>
                    <Btn small kind="primary" onClick={handleSave}>
                      Guardar cambios
                    </Btn>
                  </div>
                )
              }
            >
              {isEditing ? (
                /* Studio Editor Form */
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-txt block mb-1">Nombre del plugin</label>
                    <input
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full p-2 border border-line rounded outline-none focus:border-brand"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-txt block mb-1">Versión semántica</label>
                      <input
                        value={formVersion}
                        onChange={e => setFormVersion(e.target.value)}
                        className="w-full p-2 border border-line rounded outline-none focus:border-brand font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-txt block mb-1">Capa de software</label>
                      <select
                        value={formCapa}
                        onChange={e => setFormCapa(e.target.value as any)}
                        className="w-full p-2 border border-line rounded outline-none focus:border-brand bg-white"
                      >
                        <option value="cliente">Capa Cliente (25 %)</option>
                        <option value="enersinc_cliente">Capa Enersinc (25 %)</option>
                        <option value="nucleo">Núcleo Enersinc (50 %)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-txt block mb-1">Descripción funcional</label>
                    <textarea
                      value={formDesc}
                      onChange={e => setFormDesc(e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-line rounded outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-txt block mb-1 flex items-center gap-1">
                      <Code size={13} className="text-brand" /> Instrucciones del agente en lenguaje natural
                    </label>
                    <textarea
                      value={formInstrucciones}
                      onChange={e => setFormInstrucciones(e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-line rounded outline-none focus:border-brand font-mono text-[11.5px]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-txt">Casos de prueba ({formCasos.length})</label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormCasos(prev => [
                            ...prev,
                            {
                              id: `tc-${Date.now()}`,
                              nombre: 'Nuevo caso',
                              entrada: '{"x": 1}',
                              salidaEsperada: '{"y": 1}',
                              pasa: true,
                            },
                          ])
                        }
                        className="text-brand text-xs hover:underline font-medium"
                      >
                        + Agregar caso
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formCasos.map((tc, idx) => (
                        <div key={tc.id} className="bg-paper p-2 rounded border border-line grid grid-cols-3 gap-2">
                          <input
                            value={tc.nombre}
                            onChange={e => {
                              const n = [...formCasos];
                              n[idx].nombre = e.target.value;
                              setFormCasos(n);
                            }}
                            placeholder="Nombre del caso"
                            className="p-1 border border-line rounded bg-white text-[11px]"
                          />
                          <input
                            value={tc.entrada}
                            onChange={e => {
                              const n = [...formCasos];
                              n[idx].entrada = e.target.value;
                              setFormCasos(n);
                            }}
                            placeholder="Entrada JSON"
                            className="p-1 border border-line rounded bg-white text-[11px] font-mono"
                          />
                          <input
                            value={tc.salidaEsperada}
                            onChange={e => {
                              const n = [...formCasos];
                              n[idx].salidaEsperada = e.target.value;
                              setFormCasos(n);
                            }}
                            placeholder="Salida esperada"
                            className="p-1 border border-line rounded bg-white text-[11px] font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Read View with Automated Test Suite & Promotion */
                <div className="space-y-4 text-xs">
                  <p className="text-txt leading-relaxed">{selected.descripcion}</p>

                  <div className="grid grid-cols-2 gap-3 bg-paper p-3 rounded border border-line">
                    <div>
                      <span className="text-mut block">Autor:</span>
                      <span className="font-medium text-txt">{selected.autor}</span>
                    </div>
                    <div>
                      <span className="text-mut block">Herramientas autorizadas:</span>
                      <span className="font-mono text-txt">{selected.herramientas.join(', ')}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-mut block mb-1">Permisos declarados por dominio:</span>
                      <div className="flex gap-2">
                        <span className="bg-white px-2 py-0.5 rounded border border-line text-[11px]">
                          Lectura: <b>{selected.permisos.lectura.join(', ')}</b>
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded border border-line text-[11px]">
                          Escritura: <b>{selected.permisos.escritura.join(', ')}</b>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Automated Test Suite Checklist */}
                  <div className="bg-white border border-line rounded-lg p-3.5">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-line">
                      <div>
                        <h4 className="font-semibold text-txt text-xs flex items-center gap-1">
                          <Shield size={14} className="text-brand" /> Pruebas automáticas obligatorias para promover
                        </h4>
                        <span className="text-[11px] text-mut">
                          Requisitos inmutables para migrar a Producción
                        </span>
                      </div>
                      <Btn small kind="primary" onClick={handleRunTests}>
                        <Play size={12} /> Ejecutar pruebas automáticas
                      </Btn>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-paper">
                        <span>(1) Casos de prueba aprobados (≥ 95 %):</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span>{selected.testMetrics?.casosAprobadosPct ?? 0} %</span>
                          {(selected.testMetrics?.casosAprobadosPct ?? 0) >= 95 ? (
                            <CheckCircle2 size={15} className="text-ok" />
                          ) : (
                            <XCircle size={15} className="text-bad" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-paper">
                        <span>(2) Coincidencia contra datos de referencia ya liquidados (≥ 95 %):</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span>{selected.testMetrics?.coincidenciaReferenciaPct ?? 0} %</span>
                          {(selected.testMetrics?.coincidenciaReferenciaPct ?? 0) >= 95 ? (
                            <CheckCircle2 size={15} className="text-ok" />
                          ) : (
                            <XCircle size={15} className="text-bad" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-paper">
                        <span>(3) Permisos dentro de lo declarado:</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span>{selected.testMetrics?.permisosValidos ? 'Conforme' : 'Violación'}</span>
                          {selected.testMetrics?.permisosValidos ? (
                            <CheckCircle2 size={15} className="text-ok" />
                          ) : (
                            <XCircle size={15} className="text-bad" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-paper">
                        <span>(4) Sin datos sensibles en salidas:</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span>{selected.testMetrics?.sinDatosSensibles ? 'Sin fuga' : 'Alerta'}</span>
                          {selected.testMetrics?.sinDatosSensibles ? (
                            <CheckCircle2 size={15} className="text-ok" />
                          ) : (
                            <XCircle size={15} className="text-bad" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Test Cases Table */}
                    <div className="mt-3 pt-2 border-t border-line">
                      <span className="font-semibold text-mut text-[11px] block mb-1.5">
                        Detalle de casos de prueba ({selected.casosDePrueba.length}):
                      </span>
                      <div className="space-y-1">
                        {selected.casosDePrueba.map(tc => (
                          <div
                            key={tc.id}
                            className={`p-2 rounded text-[11px] flex items-center justify-between border ${
                              tc.pasa ? 'bg-oksoft/40 border-ok/20' : 'bg-badsoft/40 border-bad/20'
                            }`}
                          >
                            <div>
                              <span className="font-medium text-txt">{tc.nombre}</span>
                              {tc.error && <div className="text-bad text-[10px] mt-0.5">{tc.error}</div>}
                            </div>
                            <span className="font-semibold">{tc.pasa ? 'PASÓ ✔' : 'FALLÓ ✘'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Promotion Controls */}
                  <div className="p-3 bg-paper rounded border border-line flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-txt block">
                        Paso a Producción (Aprobación por rol)
                      </span>
                      <span className="text-[11px] text-mut">
                        {canPromote
                          ? 'Pruebas conformes. Habilitado para solicitar aprobación.'
                          : 'Bloqueado: debe superar el 95 % de coincidencia y todos los tests.'}
                      </span>
                    </div>
                    <Btn
                      kind="primary"
                      disabled={!canPromote || selected.estado === 'Producción'}
                      onClick={handlePromote}
                    >
                      <ArrowUpRight size={14} /> Enviar a producción
                    </Btn>
                  </div>

                  {/* Version History & Rollback */}
                  {selected.historicoVersiones && selected.historicoVersiones.length > 0 && (
                    <div className="pt-2">
                      <span className="font-semibold text-mut text-xs block mb-1.5 flex items-center gap-1">
                        <History size={13} /> Historial de versiones y rollback
                      </span>
                      <div className="space-y-1">
                        {selected.historicoVersiones.map(hv => (
                          <div
                            key={hv.version}
                            className="flex items-center justify-between p-2 rounded bg-paper text-xs border border-line"
                          >
                            <div>
                              <span className="font-bold text-txt">v{hv.version}</span>
                              <span className="text-mut text-[11px] ml-2">
                                ({hv.fecha} por {hv.autor}) · {hv.motivo}
                              </span>
                            </div>
                            {hv.version !== selected.version && (
                              <button
                                onClick={() => rollbackPlugin(selected.id, hv.version)}
                                className="text-xs text-brand font-semibold hover:underline inline-flex items-center gap-1"
                              >
                                <RotateCcw size={12} /> Volver a esta versión
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Panel>
          </div>
        )}
      </div>

      {/* Modal Reporte de Pruebas */}
      {testResultModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 border border-line">
            <div className="flex items-center gap-2 mb-2">
              {testResultModal.passed ? (
                <CheckCircle2 size={20} className="text-ok" />
              ) : (
                <AlertTriangle size={20} className="text-bad" />
              )}
              <h3 className="font-semibold text-sm text-txt">Reporte de ejecución de pruebas</h3>
            </div>
            <p className="text-xs text-txt mb-3 leading-relaxed">{testResultModal.message}</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Btn
                small
                onClick={() => {
                  openArtifact(testResultModal.reportArtifactId);
                  setTestResultModal(null);
                }}
              >
                <FileText size={13} /> Ver reporte como artefacto
              </Btn>
              <Btn small kind="primary" onClick={() => setTestResultModal(null)}>
                Entendido
              </Btn>
            </div>
          </div>
        </div>
      )}

      <Illustrative />
    </>
  );
}
