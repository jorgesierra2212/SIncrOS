import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  PROFILES, ViewId, Profile, APPROVALS, Approval, AUDIT_INITIAL, AuditRecord,
  PLUGINS_INITIAL, TASKS_INITIAL, CONECTORES_INITIAL, ARCHIVOS_INITIAL,
  BRAND_PRESETS, ARTIFACTS, Artifact, DEFAULT_MARKET_DATE, SAMPLE_TRACES
} from './data/mock';
import { askAgent, ChatMsg } from './data/agentScript';
import { Ctx, Decision, ActiveTaskProgress } from './components/context';
import Sidebar from './components/Sidebar';
import { ProcessProvider } from './components/process/ProcessStore';
import ArtifactPanel from './components/ArtifactPanel';
import TopBar from './components/TopBar';
import ExecutionInspectorModal from './components/ExecutionInspectorModal';
import { renderView } from './views';
import type { PluginManifest, TaskItem, SupportTicket, Conector, ArchivoItem, BrandConfig, Layer, MarketDateState, RegulatoryVersion, ExecutionTrace } from './data/types';
import { SUPPORT_TICKETS_INITIAL } from './data/mock';

export default function App() {
  const [profile, setProfile] = useState<Profile>(PROFILES[1]); // Default Analista de liquidación
  const [view, setView] = useState<ViewId>(PROFILES[1].home);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [selectedAgent, selectAgent] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  // Market Date & Regulatory Cycle state
  const [marketDate, setMarketDate] = useState<MarketDateState>(DEFAULT_MARKET_DATE);

  // Execution Trace & Inspection state
  const [inspectTraceId, setInspectTraceId] = useState<string | null>(null);
  const [traces, setTraces] = useState<Record<string, ExecutionTrace>>(SAMPLE_TRACES);

  // White-label brand state
  const [brand, setBrand] = useState<BrandConfig>(BRAND_PRESETS.enersinc);

  // Plugins state
  const [plugins, setPlugins] = useState<PluginManifest[]>(PLUGINS_INITIAL);

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>(TASKS_INITIAL);
  const [activeTaskProgress, setActiveTaskProgress] = useState<ActiveTaskProgress | null>(null);

  // Approvals & Support Tickets state
  const [approvals, setApprovals] = useState<Approval[]>(APPROVALS);
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS_INITIAL);

  // Connectors, Files & Artifacts state
  const [connectors, setConnectors] = useState<Conector[]>(CONECTORES_INITIAL);
  const [files, setFiles] = useState<ArchivoItem[]>(ARCHIVOS_INITIAL);
  const [artifactsList, setArtifactsList] = useState<Artifact[]>(ARTIFACTS);

  // Immutable Audit Log
  const [auditLog, setAuditLog] = useState<AuditRecord[]>(AUDIT_INITIAL);

  // Apply White-label CSS variables live to document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-brand', brand.colorPrimario || '#2459D6');
    root.style.setProperty('--color-ink', brand.colorSecundario || '#0F1E33');
    root.style.setProperty('--font-family', brand.tipografia || 'IBM Plex Sans');
    document.title = brand.nombreProducto || 'Enersinc OS';
  }, [brand]);

  const go = useCallback((v: ViewId) => {
    setView(v);
    setNavOpen(false);
  }, []);

  const addAudit = useCallback((who: string, what: string, version: string, capa: Layer) => {
    const newRecord: AuditRecord = {
      when: 'Hoy ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      who,
      what,
      version,
      capa,
      ip: '10.200.0.1',
    };
    setAuditLog(prev => [newRecord, ...prev]);
  }, []);

  // Las preguntas se registran como conversaciones de la persona (ver ProcessProvider)
  const ask = useCallback((text: string, attachedFiles?: ArchivoItem[], command?: string, mention?: string) => {
    if (!text.trim() && (!attachedFiles || attachedFiles.length === 0)) return;
    window.dispatchEvent(new CustomEvent('enersinc:ask', { detail: { text, files: attachedFiles, command, mention } }));
  }, []);


  const switchProfile = (p: Profile) => {
    setProfile(p);
    setView(p.home);
    setArtifact(null);
    addAudit(p.person, `Cambió de perfil a ${p.role}`, 'Auth Session', 'cliente');
  };

  const decide = useCallback(
    (id: string, d: Decision, comment?: string) => {
      setDecisions(s => ({ ...s, [id]: d }));
      const approval = approvals.find(x => x.id === id);
      const actionText = `${d} propuesta ${id}: ${approval?.title || ''}${comment ? ` (Comentario: "${comment}")` : ''}`;
      addAudit(profile.person, actionText, approval?.ruleVersion || 'CREG', approval?.capa || 'nucleo');
    },
    [approvals, profile, addAudit]
  );

  // Plugin operations
  const savePlugin = useCallback(
    (p: PluginManifest) => {
      setPlugins(prev => {
        const exists = prev.some(x => x.id === p.id);
        if (exists) {
          return prev.map(x => (x.id === p.id ? p : x));
        }
        return [p, ...prev];
      });
      addAudit(profile.person, `Guardó cambios en plugin ${p.nombre} (v${p.version})`, `Plugin v${p.version}`, p.capa);
    },
    [profile, addAudit]
  );

  const runPluginTests = useCallback(
    (id: string) => {
      const p = plugins.find(x => x.id === id);
      if (!p) {
        return { passed: false, message: 'Plugin no encontrado', reportArtifactId: 'ART-130' };
      }

      // Calculate tests results
      const totalCases = p.casosDePrueba.length;
      const passedCases = p.casosDePrueba.filter(c => c.pasa).length;
      const casosPct = totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 100;

      // Check if this plugin is the demo failing plugin (pred-bolsa-intradiario)
      const coincidenciaPct = p.id === 'pred-bolsa-intradiario' ? 91.2 : 98.4;
      const permisosValidos = true;
      const sinDatosSensibles = true;

      const passedAll = casosPct >= 95 && coincidenciaPct >= 95 && permisosValidos && sinDatosSensibles;

      const updatedPlugin: PluginManifest = {
        ...p,
        estado: passedAll ? (p.estado === 'Borrador' ? 'Sandbox' : 'Pruebas') : 'Pruebas',
        testMetrics: {
          casosAprobadosPct: casosPct,
          coincidenciaReferenciaPct: coincidenciaPct,
          permisosValidos,
          sinDatosSensibles,
        },
      };

      savePlugin(updatedPlugin);

      const reportMsg = passedAll
        ? `✔ Todas las 4 pruebas automáticas APROBADAS:\n• Casos de prueba: ${casosPct}%\n• Coincidencia datos liquidados: ${coincidenciaPct}%\n• Permisos declarados: Conformes\n• Sin datos sensibles en salidas: Conforme.\nEl plugin queda habilitado para solicitar pase a producción.`
        : `✘ PRUEBAS BLOQUEADAS para pase a producción:\n• Casos de prueba: ${casosPct}%\n• Coincidencia contra datos de referencia: ${coincidenciaPct}% (Umbral mínimo exigido: 95%)\n• Permisos declarados: Conforme.\nCorrija los casos fallidos antes de enviar a producción.`;

      addAudit(
        profile.person,
        `Ejecutó pruebas automáticas para plugin ${p.nombre}: ${passedAll ? 'Aprobadas' : 'Fallidas'}`,
        'Test Suite v1',
        p.capa
      );

      return {
        passed: passedAll,
        message: reportMsg,
        reportArtifactId: 'ART-130',
      };
    },
    [plugins, savePlugin, profile, addAudit]
  );

  const promotePlugin = useCallback(
    (id: string) => {
      const p = plugins.find(x => x.id === id);
      if (!p) return { success: false, message: 'Plugin no encontrado' };

      if (
        !p.testMetrics ||
        p.testMetrics.casosAprobadosPct < 95 ||
        p.testMetrics.coincidenciaReferenciaPct < 95
      ) {
        return {
          success: false,
          message: 'No se puede promover a producción: el plugin no cumple el 95 % en pruebas automáticas.',
        };
      }

      // Check role permissions:
      // Administrador del cliente para capa cliente; Enersinc para capa Enersinc
      const isClientAdmin = profile.id === 'admin_cliente' || profile.role.includes('Administrador');
      const isEnersinc = profile.id === 'enersinc' || profile.role.includes('Enersinc');

      if (p.capa === 'cliente' && !isClientAdmin && profile.id !== 'ger') {
        const updated = { ...p, estado: 'Revisión' as const };
        savePlugin(updated);
        return {
          success: true,
          message: `El plugin ${p.nombre} superó las pruebas y quedó en estado 'Revisión' pendiente de aprobación de Administrador del cliente.`,
        };
      }

      if (p.capa === 'enersinc_cliente' && !isEnersinc) {
        const updated = { ...p, estado: 'Revisión' as const };
        savePlugin(updated);
        return {
          success: true,
          message: `El plugin ${p.nombre} quedó en estado 'Revisión' pendiente de certificación de Enersinc.`,
        };
      }

      const updated = { ...p, estado: 'Producción' as const };
      savePlugin(updated);
      addAudit(profile.person, `Promovió a Producción el plugin ${p.nombre} (v${p.version})`, 'Promoción v1', p.capa);

      return {
        success: true,
        message: `¡Éxito! El plugin ${p.nombre} fue promovido a PRODUCCIÓN por ${profile.person} (${profile.role}).`,
      };
    },
    [plugins, profile, savePlugin, addAudit]
  );

  const rollbackPlugin = useCallback(
    (id: string, targetVersion: string) => {
      setPlugins(prev =>
        prev.map(p => {
          if (p.id === id) {
            return {
              ...p,
              version: targetVersion,
              historicoVersiones: [
                {
                  version: targetVersion,
                  fecha: 'Hoy (Rollback)',
                  autor: profile.person,
                  motivo: `Rollback desde versión anterior a v${targetVersion}`,
                },
                ...(p.historicoVersiones || []),
              ],
            };
          }
          return p;
        })
      );
      addAudit(profile.person, `Efectuó rollback de plugin ${id} a versión v${targetVersion}`, 'Rollback', 'cliente');
    },
    [profile, addAudit]
  );

  // Simulated step-by-step task runner
  const runTaskNow = useCallback(
    (taskId: string, simulateFailure = false) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const stepsSuccess = [
        'Conectando al repositorio de datos del MEM...',
        'Extrayendo publicaciones y ejecutando motor de reglas...',
        'Verificando consistencia de parámetros y umbrales...',
        'Generando cadena de evidencia y enviando a Bandeja de aprobación...',
      ];

      const stepsFailure = [
        'Conectando al servicio externo...',
        'Falla de enlace o tiempo de espera agotado (Timeout)...',
        'Generando ticket de incidente en Soporte para respaldo manual...',
      ];

      const steps = simulateFailure ? stepsFailure : stepsSuccess;

      let currentStep = 0;
      setActiveTaskProgress({
        taskId,
        taskName: task.name,
        step: 1,
        totalSteps: steps.length,
        stepText: steps[0],
        isComplete: false,
      });

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
          setActiveTaskProgress({
            taskId,
            taskName: task.name,
            step: currentStep + 1,
            totalSteps: steps.length,
            stepText: steps[currentStep],
            isComplete: false,
            failed: simulateFailure && currentStep === steps.length - 1,
          });
        } else {
          clearInterval(interval);
          setActiveTaskProgress({
            taskId,
            taskName: task.name,
            step: steps.length,
            totalSteps: steps.length,
            stepText: simulateFailure ? 'Tarea falló · Ticket de soporte generado' : 'Ejecución completada con éxito',
            isComplete: true,
            failed: simulateFailure,
          });

          // Update task executions
          const nowStr = 'Hoy ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

          if (simulateFailure) {
            const ticketId = `TK-${800 + Math.floor(Math.random() * 90)}`;
            const newTicket: SupportTicket = {
              id: ticketId,
              titulo: `Falla en ejecución de tarea: ${task.name}`,
              origenTarea: `${task.id} · ${task.name}`,
              fecha: nowStr,
              estado: 'Asignado a Respaldo Manual',
              prioridad: 'Alta',
              asignadoA: task.responsable,
              log: `[${nowStr} ERROR] Conexión abortada: socket hang up.
[${nowStr} CRITICAL] No se pudo completar el paso 2 de la tarea.
[${nowStr} INFO] Tarea reasignada a operador humano para respaldo manual en la misma pantalla.`,
              procedimientoManual: 'Abra la vista correspondiente del módulo, descargue el archivo plano de respaldo y complete la validación a mano con el mismo registro.',
              tareaId: task.id,
            };

            setTickets(prev => [newTicket, ...prev]);

            setTasks(prev =>
              prev.map(t =>
                t.id === taskId
                  ? {
                      ...t,
                      last: 'Fallo · ' + nowStr,
                      executions: [
                        {
                          id: `ex-${Date.now()}`,
                          taskId,
                          fecha: nowStr,
                          duracion: '16 seg',
                          resultado: 'Fallo',
                          trayectoria: steps,
                          ticketId,
                        },
                        ...t.executions,
                      ],
                    }
                  : t
              )
            );

            addAudit(profile.person, `Ejecución de tarea ${task.name} FALLÓ simuladamente. Ticket ${ticketId} creado.`, 'Task Run', task.capa);
          } else {
            setTasks(prev =>
              prev.map(t =>
                t.id === taskId
                  ? {
                      ...t,
                      last: 'OK · ' + nowStr,
                      executions: [
                        {
                          id: `ex-${Date.now()}`,
                          taskId,
                          fecha: nowStr,
                          duracion: '32 seg',
                          resultado: 'Exitoso',
                          trayectoria: steps,
                        },
                        ...t.executions,
                      ],
                    }
                  : t
              )
            );

            addAudit(profile.person, `Ejecutó manualmente la tarea programada: ${task.name}`, 'Task Run', task.capa);
          }

          setTimeout(() => {
            setActiveTaskProgress(null);
          }, 3500);
        }
      }, 700);
    },
    [tasks, profile, addAudit]
  );

  const createTask = useCallback(
    (t: Omit<TaskItem, 'id' | 'executions'>) => {
      const newTask: TaskItem = {
        ...t,
        id: `tsk-${Date.now()}`,
        executions: [],
      };
      setTasks(prev => [newTask, ...prev]);
      addAudit(profile.person, `Programó nueva tarea automática: ${t.name}`, 'Scheduler', t.capa);
    },
    [profile, addAudit]
  );

  const updateBrand = useCallback((b: Partial<BrandConfig>) => {
    setBrand(prev => ({ ...prev, ...b }));
  }, []);

  const createTicket = useCallback(
    (t: Omit<SupportTicket, 'id' | 'fecha'>) => {
      const newTk: SupportTicket = {
        ...t,
        id: `TK-${Date.now().toString().slice(-4)}`,
        fecha: 'Hoy ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      };
      setTickets(prev => [newTk, ...prev]);
    },
    []
  );

  const updateTicket = useCallback((id: string, updates: Partial<SupportTicket>) => {
    setTickets(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const updateConnector = useCallback((c: Conector) => {
    setConnectors(prev => prev.map(x => (x.id === c.id ? c : x)));
  }, []);

  const addFile = useCallback((f: ArchivoItem) => {
    setFiles(prev => [f, ...prev]);
  }, []);

  const setCycleVersion = useCallback(
    (v: RegulatoryVersion) => {
      setMarketDate(d => {
        let deadlineNotice = 'Plazo de objeción regulatorio activo ante el ASIC';
        let hoursRemaining = 48;
        if (v === 'TX1') {
          deadlineNotice = 'Plazo de radicación preliminar vence en 72 horas';
          hoursRemaining = 72;
        } else if (v === 'TX2') {
          deadlineNotice = 'Plazo para radicar reclamaciones TX2 vence en 48 horas ante el ASIC';
          hoursRemaining = 48;
        } else if (v === 'TX3') {
          deadlineNotice = 'Liquidación definitiva consolidada CREG; sin más revisiones ordinarias';
          hoursRemaining = 0;
        }
        return {
          ...d,
          cycleVersion: v,
          horizonName: `Operación D · Liquidación ${v}`,
          deadlineNotice,
          hoursRemaining,
        };
      });
      addAudit(profile.person, `Cambió ciclo regulatorio a versión ${v}`, 'Ciclo MEM', 'nucleo');
    },
    [profile, addAudit]
  );

  const updateTraceManualBackup = useCallback(
    (approvalId: string, newValue: string, justification: string) => {
      setTraces(prev => {
        const existing = prev[approvalId] || SAMPLE_TRACES[approvalId];
        if (!existing) return prev;
        const updated: ExecutionTrace = {
          ...existing,
          manualBackup: {
            canEdit: true,
            modified: true,
            modifiedBy: profile.person,
            modifiedAt: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            originalValue: existing.comparison[existing.comparison.length - 1]?.calculatedValue || existing.title,
            newValue,
            justification,
          },
          comparison: existing.comparison.map((c, i) =>
            i === existing.comparison.length - 1
              ? { ...c, calculatedValue: newValue, diffText: 'Ajustado a mano', verdict: 'Conforme' }
              : c
          ),
        };
        return { ...prev, [approvalId]: updated };
      });

      addAudit(
        profile.person,
        `Respaldo manual aplicado en propuesta ${approvalId}: nuevo valor "${newValue}". Motivo: ${justification}`,
        'Respaldo Manual CREG',
        'cliente'
      );
    },
    [profile, addAudit]
  );

  const pinArtifact = useCallback((artId: string) => {
    setProfile(prev => {
      const already = prev.pinned.includes(artId);
      const pinned = already ? prev.pinned.filter(x => x !== artId) : [...prev.pinned, artId];
      return { ...prev, pinned };
    });
  }, []);

  const value = useMemo(
    () => ({
      profile,
      view,
      go,
      openArtifact: setArtifact,
      artifact,
      ask,
      chat,
      busy,
      decisions,
      decide,
      selectedAgent,
      selectAgent,

      // Market Date & Cycle
      marketDate,
      setMarketDate,
      setCycleVersion,

      // Execution Trace & Inspection
      inspectTraceId,
      openTrace: setInspectTraceId,
      traces,
      updateTraceManualBackup,

      // Brand
      brand,
      setBrand,
      updateBrand,

      // Plugins
      plugins,
      savePlugin,
      runPluginTests,
      promotePlugin,
      rollbackPlugin,

      // Tasks
      tasks,
      runTaskNow,
      createTask,
      activeTaskProgress,
      clearTaskProgress: () => setActiveTaskProgress(null),

      // Approvals & Support
      approvals,
      tickets,
      createTicket,
      updateTicket,

      // Connectors, Files & Artifacts
      connectors,
      updateConnector,
      files,
      addFile,
      artifactsList,
      pinArtifact,

      // Audit
      auditLog,
      addAudit,
    }),
    [
      profile,
      view,
      go,
      artifact,
      ask,
      chat,
      busy,
      decisions,
      decide,
      selectedAgent,
      marketDate,
      setCycleVersion,
      inspectTraceId,
      traces,
      updateTraceManualBackup,
      brand,
      updateBrand,
      plugins,
      savePlugin,
      runPluginTests,
      promotePlugin,
      rollbackPlugin,
      tasks,
      runTaskNow,
      createTask,
      activeTaskProgress,
      approvals,
      tickets,
      createTicket,
      updateTicket,
      connectors,
      updateConnector,
      files,
      addFile,
      artifactsList,
      pinArtifact,
      auditLog,
      addAudit,
    ]
  );

  return (
    <Ctx.Provider value={value}>
      <ProcessProvider>
      <div className="h-screen flex overflow-hidden bg-paper text-txt font-sans">
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} onSwitch={switchProfile} />
        <main className="flex-1 min-w-0 flex flex-col bg-paper">
          <TopBar onMenu={() => setNavOpen(true)} />
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-5">{renderView(view)}</div>
          </div>
        </main>
        {artifact && <ArtifactPanel id={artifact} onClose={() => setArtifact(null)} />}
        {inspectTraceId && <ExecutionInspectorModal />}
      </div>
      </ProcessProvider>
    </Ctx.Provider>
  );
}
