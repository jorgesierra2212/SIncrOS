import { createContext, useContext } from 'react';
import type { Profile, ViewId, Approval, AuditRecord, Artifact } from '../data/mock';
import type { ChatMsg } from '../data/agentScript';
import type { Layer, PluginManifest, TaskItem, SupportTicket, Conector, ArchivoItem, BrandConfig, MarketDateState, RegulatoryVersion, ExecutionTrace } from '../data/types';

export type Decision = 'Aprobado' | 'Rechazado' | 'Devuelto';

export interface ActiveTaskProgress {
  taskId: string;
  taskName: string;
  step: number;
  totalSteps: number;
  stepText: string;
  isComplete: boolean;
  failed?: boolean;
}

export interface AppCtx {
  profile: Profile;
  view: ViewId;
  go: (v: ViewId) => void;
  openArtifact: (id: string | null) => void;
  artifact: string | null;
  ask: (text: string, files?: ArchivoItem[], command?: string, mention?: string) => void;
  chat: ChatMsg[];
  busy: boolean;
  decisions: Record<string, Decision>;
  decide: (id: string, d: Decision, comment?: string) => void;
  selectedAgent: string | null;
  selectAgent: (id: string | null) => void;

  // Gestión de fechas amigables y ciclo MEM
  marketDate: MarketDateState;
  setMarketDate: (d: MarketDateState) => void;
  setCycleVersion: (v: RegulatoryVersion) => void;

  // Trazabilidad profunda e inspección
  inspectTraceId: string | null;
  openTrace: (id: string | null) => void;
  traces: Record<string, ExecutionTrace>;
  updateTraceManualBackup: (approvalId: string, newValue: string, justification: string) => void;

  // Marca blanca
  brand: BrandConfig;
  setBrand: (b: BrandConfig) => void;
  updateBrand: (b: Partial<BrandConfig>) => void;

  // Plugins
  plugins: PluginManifest[];
  savePlugin: (p: PluginManifest) => void;
  runPluginTests: (id: string) => { passed: boolean; message: string; reportArtifactId: string };
  promotePlugin: (id: string) => { success: boolean; message: string };
  rollbackPlugin: (id: string, targetVersion: string) => void;

  // Tareas y automatización
  tasks: TaskItem[];
  runTaskNow: (id: string, simulateFailure?: boolean) => void;
  createTask: (t: Omit<TaskItem, 'id' | 'executions'>) => void;
  activeTaskProgress: ActiveTaskProgress | null;
  clearTaskProgress: () => void;

  // Aprobaciones y soporte
  approvals: Approval[];
  tickets: SupportTicket[];
  createTicket: (t: Omit<SupportTicket, 'id' | 'fecha'>) => void;
  updateTicket: (id: string, updates: Partial<SupportTicket>) => void;

  // Integraciones y archivos
  connectors: Conector[];
  updateConnector: (c: Conector) => void;
  files: ArchivoItem[];
  addFile: (f: ArchivoItem) => void;
  artifactsList: Artifact[];
  pinArtifact: (id: string) => void;

  // Auditoría inmutable
  auditLog: AuditRecord[];
  addAudit: (who: string, what: string, version: string, capa: Layer) => void;
}

export const Ctx = createContext<AppCtx | null>(null);

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp must be used within Ctx.Provider');
  return c;
};
