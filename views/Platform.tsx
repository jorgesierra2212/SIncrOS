import React, { useState } from 'react';
import {
  Cpu, Database, ArrowRight, CheckCircle2, AlertTriangle, FileSpreadsheet, FileText, Presentation,
  Upload, Download, RefreshCw, LifeBuoy, UserCheck, ShieldAlert, Play, Check, ExternalLink, Code
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../components/context';
import { Panel, Badge, Btn, Table, ViewHeader, StatusBadge, LayerBadge, Illustrative } from '../components/ui';
import type { Conector, ArchivoItem, SupportTicket } from '../data/types';
import { exportTableToExcel } from '../utils/export';

// ============================================================================
// VISTA: INTEGRACIONES Y CONECTORES (Sección 9)
// ============================================================================
export function IntegracionesView() {
  const { connectors, updateConnector } = useApp();
  const [selectedConector, setSelectedConector] = useState<Conector>(connectors[0]);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success'; message: string }>({ status: 'idle', message: '' });

  // BigQuery interactive query editor
  const [sqlQuery, setSqlQuery] = useState(`SELECT 
  hora, 
  ROUND(precio_bolsa, 1) AS precio_bolsa_kwh, 
  embalse_util_pct, 
  recurso_marginal 
FROM \`enersinc_os_prod.mem_colombia.mercado_horario\` 
WHERE fecha = '2026-10-26' 
ORDER BY hora ASC 
LIMIT 8;`);
  const [sqlResults, setSqlResults] = useState<any[] | null>(null);

  const runBigQuery = () => {
    setSqlResults([
      { hora: '01:00', precio_bolsa_kwh: '$520.4', embalse_util_pct: '64.2 %', recurso_marginal: 'Hidráulica Sinú U1' },
      { hora: '02:00', precio_bolsa_kwh: '$498.1', embalse_util_pct: '64.2 %', recurso_marginal: 'Hidráulica Sinú U2' },
      { hora: '08:00', precio_bolsa_kwh: '$680.0', embalse_util_pct: '64.1 %', recurso_marginal: 'Térmica Norte U1' },
      { hora: '12:00', precio_bolsa_kwh: '$710.5', embalse_util_pct: '64.0 %', recurso_marginal: 'Térmica Norte U1' },
      { hora: '18:00', precio_bolsa_kwh: '$890.2', embalse_util_pct: '63.9 %', recurso_marginal: 'Térmica Norte U2' },
      { hora: '19:00', precio_bolsa_kwh: '$946.0', embalse_util_pct: '63.8 %', recurso_marginal: 'Térmica Norte U2 (Redespacho)' },
      { hora: '20:00', precio_bolsa_kwh: '$912.0', embalse_util_pct: '63.8 %', recurso_marginal: 'Térmica Norte U2' },
      { hora: '21:00', precio_bolsa_kwh: '$840.5', embalse_util_pct: '63.9 %', recurso_marginal: 'Hidráulica Guavio U3' },
    ]);
  };

  const handleTestConnection = () => {
    setTestResult({ status: 'testing', message: 'Verificando socket, handshake TLS y credenciales...' });
    setTimeout(() => {
      setTestResult({
        status: 'success',
        message: 'Conexión verificada exitosamente: latencia 42 ms, handshake TLS 1.3 conforme, token válido.',
      });
    }, 900);
  };

  return (
    <>
      <ViewHeader
        title="Integraciones y conectores"
        desc="Catálogo de conectores del Mercado de Energía Mayorista (XM, BigQuery, ERP, MDM/Medida, SCADA, DIAN). Asistente de configuración en tres pasos y editor de consultas analíticas."
        capa="nucleo"
      />

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Connectors list */}
        <div className="lg:col-span-2 space-y-2">
          <Panel title="Catálogo de conectores MEM" pad={false}>
            <div className="divide-y divide-line">
              {connectors.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedConector(c);
                    setTestResult({ status: 'idle', message: '' });
                  }}
                  className={`w-full text-left p-3 transition-colors ${
                    c.id === selectedConector.id ? 'bg-brandsoft/30 border-l-4 border-brand' : 'hover:bg-paper'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-txt">{c.name}</span>
                    <StatusBadge s={c.state} />
                  </div>
                  <div className="text-xs text-mut line-clamp-1">{c.detail}</div>
                  <div className="text-[11px] text-mut mt-1">Sinc: {c.ultimaSinc} · {c.frecuencia}</div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* Selected Connector Details */}
        <div className="lg:col-span-3 space-y-4">
          <Panel
            title={
              <div className="flex items-center justify-between w-full">
                <span>{selectedConector.name}</span>
                <StatusBadge s={selectedConector.state} />
              </div>
            }
            action={
              <Btn small kind="primary" onClick={() => { setShowWizard(true); setWizardStep(1); }}>
                Asistente de configuración
              </Btn>
            }
          >
            <p className="text-xs text-txt leading-relaxed mb-3">{selectedConector.detail}</p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-paper p-3 rounded border border-line mb-4">
              <div>
                <span className="text-mut block">Categoría:</span>
                <span className="font-semibold text-txt">{selectedConector.categoria}</span>
              </div>
              <div>
                <span className="text-mut block">Frecuencia:</span>
                <span className="font-semibold text-txt">{selectedConector.frecuencia}</span>
              </div>
              <div>
                <span className="text-mut block">Endpoint / Destino:</span>
                <span className="font-mono text-txt truncate block">{selectedConector.config?.endpoint || 'Configurado'}</span>
              </div>
              <div>
                <span className="text-mut block">Autenticación:</span>
                <span className="font-medium text-txt">{selectedConector.config?.authType || 'Estándar'}</span>
              </div>
            </div>

            {/* Field mapping */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-mut uppercase tracking-wider mb-2">
                Mapeo de campos ({selectedConector.mapeoCampos.length} atributos)
              </h4>
              <div className="bg-white border border-line rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-paper text-mut">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-medium">Campo origen ({selectedConector.categoria})</th>
                      <th className="px-3 py-1.5 text-left font-medium">Campo destino (Enersinc OS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {selectedConector.mapeoCampos.map((m, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5 font-mono text-brand">{m.origen}</td>
                        <td className="px-3 py-1.5 font-mono text-txt">{m.destino}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Logs */}
            <div>
              <h4 className="text-xs font-semibold text-mut uppercase tracking-wider mb-1.5">
                Bitácora de eventos y sincronización
              </h4>
              <div className="space-y-1">
                {selectedConector.logs.map((lg, i) => (
                  <div key={i} className="text-xs flex items-center justify-between p-2 rounded bg-paper border border-line/60">
                    <div>
                      <span className="font-mono text-mut text-[11px] mr-2">{lg.fecha}</span>
                      <span className="text-txt">{lg.evento}</span>
                    </div>
                    <Badge tone={lg.estado === 'ok' ? 'ok' : lg.estado === 'alerta' ? 'warn' : 'bad'}>
                      {lg.estado.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* BigQuery Interactive SQL Editor if BigQuery is active or selected */}
          <Panel
            title={
              <div className="flex items-center gap-2">
                <Database size={16} className="text-brand" />
                <span>Editor de consultas analíticas (Google BigQuery Lake)</span>
              </div>
            }
          >
            <p className="text-xs text-mut mb-2">
              Consulte las series horarias de mercado, telemedida o liquidación sombra almacenadas en el data lake:
            </p>
            <textarea
              value={sqlQuery}
              onChange={e => setSqlQuery(e.target.value)}
              rows={4}
              className="w-full p-2.5 bg-ink text-[#A6C0FE] font-mono text-xs rounded border border-line outline-none mb-2"
            />
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] text-mut">Dataset: enersinc_os_prod.mem_colombia</span>
              <Btn small kind="primary" onClick={runBigQuery}>
                <Play size={12} /> Ejecutar consulta SQL
              </Btn>
            </div>

            {sqlResults && (
              <div className="animate-in fade-in">
                <Table
                  head={['Hora', 'Precio Bolsa ($/kWh)', 'Embalse Útil', 'Recurso Marginal']}
                  rows={sqlResults.map(r => [r.hora, r.precio_bolsa_kwh, r.embalse_util_pct, r.recurso_marginal])}
                  exportFileName="consulta_bigquery_mercado.xlsx"
                  exportRawData={sqlResults}
                />
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* 3-Step Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 border border-line animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <h3 className="font-semibold text-sm text-txt">
                Asistente de configuración · {selectedConector.name}
              </h3>
              <div className="flex items-center gap-1 text-xs font-semibold text-brand">
                <span>Paso {wizardStep} de 3</span>
              </div>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-3 text-xs">
                <h4 className="font-semibold text-txt">Paso 1: Parámetros de conexión y credenciales</h4>
                <div>
                  <label className="text-mut block mb-1">Host / URL Endpoint</label>
                  <input
                    defaultValue={selectedConector.config?.endpoint}
                    className="w-full p-2 border border-line rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-mut block mb-1">Tipo de autenticación</label>
                  <input
                    defaultValue={selectedConector.config?.authType}
                    className="w-full p-2 border border-line rounded font-medium"
                  />
                </div>
                <div>
                  <label className="text-mut block mb-1">Token / Llave de acceso (simulada)</label>
                  <input
                    type="password"
                    defaultValue="••••••••••••••••••••••••"
                    className="w-full p-2 border border-line rounded font-mono"
                  />
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-3 text-xs">
                <h4 className="font-semibold text-txt">Paso 2: Mapeo de campos bidireccional</h4>
                <p className="text-mut text-[11px]">
                  Confirme la homologación de atributos entre el conector y el esquema de Enersinc OS:
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedConector.mapeoCampos.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 bg-paper p-2 rounded">
                      <input defaultValue={m.origen} className="p-1 border border-line rounded w-1/2 font-mono text-[11px]" />
                      <span>→</span>
                      <input defaultValue={m.destino} className="p-1 border border-line rounded w-1/2 font-mono text-[11px]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3 text-xs">
                <h4 className="font-semibold text-txt">Paso 3: Prueba de conexión y sincronización</h4>
                <p className="text-mut text-[11px]">
                  Ejecute una prueba sintética hacia el servicio para validar respuesta y esquema:
                </p>
                <Btn kind="secondary" onClick={handleTestConnection} disabled={testResult.status === 'testing'}>
                  <RefreshCw size={13} className={testResult.status === 'testing' ? 'animate-spin' : ''} />
                  Probar conexión ahora
                </Btn>
                {testResult.message && (
                  <div
                    className={`p-3 rounded text-xs border ${
                      testResult.status === 'success' ? 'bg-oksoft text-ok border-ok/30' : 'bg-paper text-txt border-line'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-3 border-t border-line">
              <Btn small disabled={wizardStep === 1} onClick={() => setWizardStep(s => (s - 1) as any)}>
                Anterior
              </Btn>
              <div className="flex gap-2">
                <Btn small onClick={() => setShowWizard(false)}>
                  Cerrar
                </Btn>
                {wizardStep < 3 ? (
                  <Btn small kind="primary" onClick={() => setWizardStep(s => (s + 1) as any)}>
                    Siguiente
                  </Btn>
                ) : (
                  <Btn
                    small
                    kind="primary"
                    onClick={() => {
                      setShowWizard(false);
                      updateConnector({ ...selectedConector, state: 'Conectado', ultimaSinc: 'Hoy (Verificado)' });
                    }}
                  >
                    Finalizar y guardar
                  </Btn>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Illustrative />
    </>
  );
}

// ============================================================================
// VISTA: ARCHIVOS Y DATOS (Sección 9)
// ============================================================================
export function ArchivosView() {
  const { files, addFile, ask } = useApp();
  const [selectedFile, setSelectedFile] = useState<ArchivoItem>(files[0]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    const ext = uploaded.name.split('.').pop()?.toLowerCase() || '';
    const sizeKB = (uploaded.size / 1024).toFixed(1) + ' KB';

    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const firstSheet = wb.SheetNames[0];
          const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], { header: 1 }) as any[][];
          const header = (rawRows[0] || []) as string[];
          const previewRows: Record<string, any>[] = rawRows.slice(1, 15).map(row => {
            const obj: Record<string, any> = {};
            header.forEach((h, idx) => {
              obj[h || `Col_${idx + 1}`] = row[idx] ?? '';
            });
            return obj;
          });

          const newFile: ArchivoItem = {
            id: `arch-${Date.now()}`,
            nombre: uploaded.name,
            tipo: 'excel',
            tamano: sizeKB,
            fecha: 'Hoy (Cargado)',
            origen: 'Cargado por usuario',
            detalles: { hojas: wb.SheetNames, filas: rawRows.length, previewData: previewRows },
          };
          addFile(newFile);
          setSelectedFile(newFile);
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsBinaryString(uploaded);
    }
  };

  const useFileInSkill = () => {
    ask(`Usa el archivo adjunto "${selectedFile.nombre}" para ejecutar el análisis de liquidación sombra y crítica de medida.`, [selectedFile]);
  };

  return (
    <>
      <ViewHeader
        title="Archivos y datos"
        desc="Visor de archivos Excel (con vista previa en tabla mediante SheetJS), PDF y PowerPoint. Los archivos cargados pueden seleccionarse como entrada directa de cualquier skill."
        capa="nucleo"
        actions={
          <label className="inline-flex items-center gap-1.5 rounded-md font-medium text-sm px-3 py-1.5 bg-brand text-white hover:bg-[#1d4bb8] cursor-pointer transition-colors">
            <Upload size={14} /> Cargar Excel / PDF / PPT
            <input type="file" accept=".xlsx,.xls,.csv,.pdf,.pptx,.ppt" onChange={handleFileUpload} className="hidden" />
          </label>
        }
      />

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Files inventory */}
        <div className="lg:col-span-2 space-y-2">
          <Panel title="Archivos en espacio de trabajo" pad={false}>
            <div className="divide-y divide-line">
              {files.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left p-3 transition-colors ${
                    f.id === selectedFile?.id ? 'bg-brandsoft/30 border-l-4 border-brand' : 'hover:bg-paper'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {f.tipo === 'excel' ? (
                      <FileSpreadsheet size={16} className="text-ok shrink-0" />
                    ) : f.tipo === 'pdf' ? (
                      <FileText size={16} className="text-bad shrink-0" />
                    ) : (
                      <Presentation size={16} className="text-warn shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-txt truncate">{f.nombre}</div>
                      <div className="text-[11px] text-mut">
                        {f.tamano} · {f.fecha} · <span className="text-brand font-medium">{f.origen}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* Selected file preview */}
        <div className="lg:col-span-3 space-y-4">
          {selectedFile && (
            <Panel
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {selectedFile.tipo === 'excel' ? <FileSpreadsheet size={16} className="text-ok" /> : <FileText size={16} />}
                    <span className="truncate">{selectedFile.nombre}</span>
                  </div>
                  <Badge tone="neutral">{selectedFile.tamano}</Badge>
                </div>
              }
              action={
                <Btn small kind="primary" onClick={useFileInSkill}>
                  Usar como entrada de un skill
                </Btn>
              }
            >
              <div className="text-xs text-mut mb-3 flex items-center justify-between">
                <span>Origen: <b>{selectedFile.origen}</b></span>
                {selectedFile.tareaAsociada && <span>Tarea: {selectedFile.tareaAsociada}</span>}
              </div>

              {/* Excel Preview */}
              {selectedFile.tipo === 'excel' && selectedFile.detalles?.previewData && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-txt">
                      Vista previa de hojas ({selectedFile.detalles.hojas?.join(', ')}):
                    </span>
                    <span className="text-[11px] text-mut">{selectedFile.detalles.filas} filas leídas</span>
                  </div>
                  <div className="overflow-x-auto max-h-80 border border-line rounded">
                    <table className="w-full text-xs">
                      <thead className="bg-paper text-mut">
                        <tr>
                          {Object.keys(selectedFile.detalles.previewData[0] || {}).map((col, idx) => (
                            <th key={idx} className="px-3 py-1.5 text-left font-medium border-b border-line whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {selectedFile.detalles.previewData.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-paper/50">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap text-txt">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PDF Preview */}
              {selectedFile.tipo === 'pdf' && (
                <div className="p-8 text-center bg-paper rounded border border-line text-xs">
                  <FileText size={32} className="text-bad mx-auto mb-2" />
                  <div className="font-semibold text-txt">{selectedFile.nombre}</div>
                  <div className="text-mut mt-1">{selectedFile.detalles?.paginas || 3} páginas analizadas por OCR/Parser</div>
                  <p className="text-mut text-[11px] mt-2">Documento verificado conforme a los estándares de reclamación ante el ASIC.</p>
                </div>
              )}

              {/* PPT Preview */}
              {selectedFile.tipo === 'powerpoint' && (
                <div className="p-8 text-center bg-paper rounded border border-line text-xs">
                  <Presentation size={32} className="text-warn mx-auto mb-2" />
                  <div className="font-semibold text-txt">{selectedFile.nombre}</div>
                  <div className="text-mut mt-1">{selectedFile.detalles?.diapositivas || 6} diapositivas de resumen ejecutivo</div>
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>

      <Illustrative />
    </>
  );
}

// ============================================================================
// VISTA: SOPORTE Y RESPALDO MANUAL (Sección 8)
// ============================================================================
export function SoporteView() {
  const { tickets, updateTicket } = useApp();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket>(tickets[0]);

  const handleEscalar = (id: string) => {
    updateTicket(id, { estado: 'Escalado a Enersinc', asignadoA: 'Martín Gómez (Soporte N2 Enersinc)' });
  };

  const handleRespaldoManual = (id: string) => {
    updateTicket(id, { estado: 'Asignado a Respaldo Manual', asignadoA: 'Operador en turno' });
  };

  const handleResolver = (id: string) => {
    updateTicket(id, { estado: 'Resuelto' });
  };

  return (
    <>
      <ViewHeader
        title="Soporte y respaldo manual"
        desc="Cuando una tarea automática falla, se genera automáticamente un ticket con la traza de log. Se puede escalar a Enersinc o asignarse a un operador para respaldo manual en la misma pantalla."
        capa="nucleo"
      />

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-2">
          <Panel title="Tickets de incidentes automáticos" pad={false}>
            <div className="divide-y divide-line">
              {tickets.map(tk => (
                <button
                  key={tk.id}
                  onClick={() => setSelectedTicket(tk)}
                  className={`w-full text-left p-3.5 transition-colors ${
                    tk.id === selectedTicket?.id ? 'bg-brandsoft/30 border-l-4 border-brand' : 'hover:bg-paper'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-txt">{tk.id}</span>
                    <Badge tone={tk.prioridad === 'Alta' ? 'bad' : tk.prioridad === 'Media' ? 'warn' : 'neutral'}>
                      {tk.prioridad}
                    </Badge>
                  </div>
                  <div className="text-xs font-medium text-txt line-clamp-1">{tk.titulo}</div>
                  <div className="flex items-center justify-between text-[11px] text-mut mt-1.5">
                    <span>{tk.fecha}</span>
                    <StatusBadge s={tk.estado} />
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* Selected Ticket details */}
        <div className="lg:col-span-3 space-y-4">
          {selectedTicket && (
            <Panel
              title={
                <div className="flex items-center justify-between w-full">
                  <span>{selectedTicket.id} · {selectedTicket.titulo}</span>
                  <StatusBadge s={selectedTicket.estado} />
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-2 text-xs bg-paper p-3 rounded border border-line mb-3">
                <div>
                  <span className="text-mut block">Tarea origen:</span>
                  <span className="font-semibold text-txt">{selectedTicket.origenTarea}</span>
                </div>
                <div>
                  <span className="text-mut block">Asignado a:</span>
                  <span className="font-semibold text-brand">{selectedTicket.asignadoA}</span>
                </div>
              </div>

              {/* Incident log trace */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-mut uppercase tracking-wider block mb-1">
                  Traza técnica de log adjunto:
                </span>
                <pre className="text-xs bg-ink text-[#D7E0EE] p-3 rounded font-mono overflow-x-auto leading-relaxed border border-line">
                  {selectedTicket.log}
                </pre>
              </div>

              {/* Manual Backup Procedure */}
              <div className="bg-brandsoft/40 p-3 rounded border border-brand/20 mb-4">
                <h4 className="text-xs font-semibold text-brand mb-1 flex items-center gap-1">
                  <LifeBuoy size={14} /> Procedimiento de respaldo manual:
                </h4>
                <p className="text-xs text-txt leading-relaxed">{selectedTicket.procedimientoManual}</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-line">
                <Btn kind="secondary" onClick={() => handleEscalar(selectedTicket.id)}>
                  <ShieldAlert size={14} /> Escalar a Enersinc (Nivel 2)
                </Btn>
                <Btn kind="secondary" onClick={() => handleRespaldoManual(selectedTicket.id)}>
                  <UserCheck size={14} /> Asignar a respaldo manual
                </Btn>
                <Btn kind="success" onClick={() => handleResolver(selectedTicket.id)}>
                  <Check size={14} /> Marcar como resuelto
                </Btn>
              </div>
            </Panel>
          )}
        </div>
      </div>

      <Illustrative />
    </>
  );
}
