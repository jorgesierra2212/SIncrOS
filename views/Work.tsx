import React, { useState } from 'react';
import { Play, AlertTriangle, Plus } from 'lucide-react';
import { useApp } from '../components/context';
import { Panel, Badge, Btn, Table, ViewHeader, StatusBadge, Bar, Illustrative, LayerBadge } from '../components/ui';
import { AGENTS, LEVELS, SKILLS_PREDEFINIDOS } from '../data/mock';
import type { TaskItem } from '../data/types';


// ---------- Agentes y Skills Predefinidos ----------
export function Agentes() {
  const { selectedAgent, selectAgent } = useApp();
  const [tab, setTab] = useState<'catalogo' | 'skills'>('catalogo');
  const [skillFilter, setSkillFilter] = useState<string>('todos');

  const a = AGENTS.find(x => x.id === selectedAgent) ?? AGENTS[0];

  const filteredSkills = SKILLS_PREDEFINIDOS.filter(s =>
    skillFilter === 'todos' ? true : s.modulo.toLowerCase() === skillFilter.toLowerCase()
  );

  return (
    <>
      <ViewHeader
        title="Agentes y skills"
        desc="Procedimientos que los agentes saben ejecutar, niveles de autonomía gobernados (0 a 3) y fichas de especificación técnica."
        capa="nucleo"
      />

      {/* Tabs */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-md border border-line bg-white p-0.5">
          <button
            onClick={() => setTab('catalogo')}
            className={`px-3 py-1 text-xs font-medium rounded ${
              tab === 'catalogo' ? 'bg-ink text-white' : 'text-mut hover:text-txt'
            }`}
          >
            Catálogo de agentes ({AGENTS.length})
          </button>
          <button
            onClick={() => setTab('skills')}
            className={`px-3 py-1 text-xs font-medium rounded ${
              tab === 'skills' ? 'bg-ink text-white' : 'text-mut hover:text-txt'
            }`}
          >
            Skills predefinidos de Núcleo ({SKILLS_PREDEFINIDOS.length})
          </button>
        </div>
      </div>

      {tab === 'catalogo' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {LEVELS.map(l => (
              <div key={l.n} className="bg-white border border-line rounded-lg p-3">
                <div className="text-xs text-brand font-semibold">Nivel {l.n}</div>
                <div className="text-sm font-semibold text-txt">{l.label}</div>
                <div className="text-xs text-mut mt-0.5">{l.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            <Panel className="lg:col-span-3" title="Agentes activos en Enersinc OS" pad={false}>
              <Table
                head={['Agente', 'Equipo', 'Nivel', 'Coincidencia XM', 'Estado']}
                align={['l', 'l', 'l', 'r', 'l']}
                onRow={i => selectAgent(AGENTS[i].id)}
                rows={AGENTS.map(x => [
                  <span className={x.id === a.id ? 'font-semibold text-brand' : 'font-medium'}>
                    {x.name}
                  </span>,
                  x.team,
                  `N${x.level}`,
                  x.match ? `${x.match.toLocaleString('es-CO')} %` : '—',
                  <StatusBadge s={x.status} />,
                ])}
                exportFileName="agentes_enersinc.xlsx"
                exportRawData={AGENTS.map(x => ({
                  Agente: x.name,
                  Proceso: x.process,
                  Equipo: x.team,
                  Nivel: x.level,
                  Coincidencia_XM_Pct: x.match ?? 'N/A',
                  Estado: x.status,
                  Horas_Ahorradas: x.hoursSaved,
                }))}
              />
            </Panel>

            <Panel className="lg:col-span-2" title={a.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-mut">Proceso asignado:</span>
                <LayerBadge capa={a.capa} compact />
              </div>
              <p className="text-xs text-txt leading-relaxed">{a.process}</p>

              <dl className="grid grid-cols-2 gap-3 text-xs mt-4 bg-paper p-3 rounded border border-line">
                <div>
                  <dt className="text-mut">Horario cron</dt>
                  <dd className="font-semibold text-txt mt-0.5">{a.schedule}</dd>
                </div>
                <div>
                  <dt className="text-mut">Última ejecución</dt>
                  <dd className="font-semibold text-txt mt-0.5">{a.lastRun}</dd>
                </div>
                <div>
                  <dt className="text-mut">Horas ahorradas / mes</dt>
                  <dd className="num font-semibold text-txt mt-0.5">{a.hoursSaved} h</dd>
                </div>
                <div>
                  <dt className="text-mut">Nivel de autonomía</dt>
                  <dd className="font-semibold text-brand mt-0.5">N{a.level} · {LEVELS[a.level].label}</dd>
                </div>
              </dl>

              <h4 className="text-xs font-semibold text-mut uppercase tracking-wider mt-4 mb-1.5">
                Evaluación contra periodos ya liquidados por XM
              </h4>
              {a.match ? (
                <>
                  <Bar value={a.match} max={100} tone={a.match > 99 ? 'ok' : 'warn'} />
                  <p className="text-xs text-mut mt-1">
                    <b>{a.match.toLocaleString('es-CO')} %</b> de coincidencia en 180 días de prueba. Para subir a N{Math.min(3, a.level + 1)} se requiere 99,5 % sostenido durante 60 días.
                  </p>
                </>
              ) : (
                <p className="text-xs text-mut">En fase de calibración sin conjunto de prueba cerrado.</p>
              )}

              <h4 className="text-xs font-semibold text-mut uppercase tracking-wider mt-4 mb-2">
                Herramientas permitidas
              </h4>
              <div className="flex flex-wrap gap-1">
                {['Núcleo BigQuery', 'Motor de reglas', 'Archivos XM', 'Crear artefacto', 'Pedir aprobación'].map(t => (
                  <Badge key={t} tone="brand">
                    {t}
                  </Badge>
                ))}
              </div>
            </Panel>
          </div>
        </>
      ) : (
        /* Fichas de Skills Predefinidos */
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-mut font-medium">Módulo:</span>
            {['todos', 'Despacho', 'Liquidación', 'Facturación', 'CGM'].map(m => (
              <button
                key={m}
                onClick={() => setSkillFilter(m)}
                className={`text-xs px-2.5 py-1 rounded font-medium ${
                  skillFilter === m ? 'bg-ink text-white' : 'bg-white border border-line text-mut hover:text-txt'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSkills.map(sk => (
              <div key={sk.id} className="bg-white border border-line rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-mut mb-1">
                    <span className="font-semibold text-brand">{sk.modulo}</span>
                    <LayerBadge capa={sk.capa} compact />
                  </div>
                  <h3 className="font-semibold text-sm text-txt leading-snug">{sk.nombre}</h3>
                  <p className="text-xs text-mut mt-1.5 leading-relaxed">{sk.objetivo}</p>

                  <div className="mt-3 space-y-1.5 text-xs bg-paper/60 p-2.5 rounded border border-line/60">
                    <div>
                      <span className="text-mut font-medium">Regla aplicada:</span>
                      <div className="font-semibold text-txt">{sk.reglaAplicada}</div>
                    </div>
                    <div>
                      <span className="text-mut font-medium">Autonomía:</span>
                      <span className="ml-1 font-semibold text-brand">Nivel {sk.nivelAutonomia}</span>
                    </div>
                    <div>
                      <span className="text-mut font-medium">Criterio de evaluación:</span>
                      <div className="text-mut">{sk.evaluacion}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-line text-[11px] text-mut flex justify-between">
                  <span>{sk.entradas.length} entradas</span>
                  <span>{sk.salidas.length} salidas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Illustrative />
    </>
  );
}

// ---------- Tareas Programadas ----------
export function Tareas() {
  const { tasks, runTaskNow, createTask, go } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(tasks[0] || null);

  // New task form state
  const [newName, setNewName] = useState('');
  const [newSkill, setNewSkill] = useState(SKILLS_PREDEFINIDOS[0].nombre);
  const [newAgent, setNewAgent] = useState(AGENTS[0].name);
  const [newWhen, setNewWhen] = useState('Diario 08:00 COT');
  const [newAuto, setNewAuto] = useState<0 | 1 | 2 | 3>(2);
  const [newResp, setNewResp] = useState('Analista de liquidación');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createTask({
      name: newName,
      skillOrPlugin: newSkill,
      agent: newAgent,
      when: newWhen,
      next: 'Próxima ventana programada',
      last: 'Sin ejecuciones previas',
      team: 'Operaciones',
      autonomia: newAuto,
      responsable: newResp,
      capa: 'cliente',
    });
    setShowCreateModal(false);
    setNewName('');
  };

  return (
    <>
      <ViewHeader
        title="Tareas programadas"
        desc="Ejecuciones automáticas por horario cron o eventos de mercado (publicaciones XM, llegada de archivos). Cada ejecución deja evidencia y puede forzarse a mano o simular fallos para auditoría de soporte."
        capa="nucleo"
        actions={
          <Btn kind="primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> Programar nueva tarea
          </Btn>
        }
      />

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Table of tasks */}
        <div className="lg:col-span-3">
          <Panel title="Inventario de tareas automáticas" pad={false}>
            <Table
              head={['Tarea', 'Cuándo / Disparador', 'Nivel', 'Último estado']}
              onRow={i => setSelectedTask(tasks[i])}
              rows={tasks.map(t => [
                <div>
                  <div className={`font-semibold text-xs ${selectedTask?.id === t.id ? 'text-brand' : 'text-txt'}`}>
                    {t.name}
                  </div>
                  <div className="text-[11px] text-mut">{t.agent}</div>
                </div>,
                <span className="text-xs">{t.when}</span>,
                <Badge tone="brand">N{t.autonomia}</Badge>,
                <StatusBadge s={t.last} />,
              ])}
              exportFileName="tareas_programadas.xlsx"
              exportRawData={tasks.map(t => ({
                ID: t.id,
                Tarea: t.name,
                Skill: t.skillOrPlugin,
                Agente: t.agent,
                Frecuencia: t.when,
                Autonomia: t.autonomia,
                Responsable: t.responsable,
                Ultimo_Resultado: t.last,
              }))}
            />
          </Panel>
        </div>

        {/* Task Detail & Actions */}
        {selectedTask && (
          <div className="lg:col-span-2 space-y-3">
            <Panel title={selectedTask.name}>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-line">
                <span className="text-mut">Responsable de aprobación:</span>
                <span className="font-semibold text-txt">{selectedTask.responsable}</span>
              </div>

              <div className="my-3 space-y-2 text-xs">
                <div>
                  <span className="text-mut block">Skill / Plugin ejecutado:</span>
                  <span className="font-medium text-txt">{selectedTask.skillOrPlugin}</span>
                </div>
                <div>
                  <span className="text-mut block">Disparador (Trigger):</span>
                  <span className="font-medium text-txt">{selectedTask.when}</span>
                </div>
                <div>
                  <span className="text-mut block">Nivel de autonomía:</span>
                  <span className="font-semibold text-brand">Nivel {selectedTask.autonomia} · {LEVELS[selectedTask.autonomia].label}</span>
                </div>
              </div>

              {/* Execution Actions */}
              <div className="flex flex-col gap-2 pt-3 border-t border-line">
                <Btn kind="primary" onClick={() => runTaskNow(selectedTask.id, false)}>
                  <Play size={14} /> Ejecutar ahora (Simular avance paso a paso)
                </Btn>
                <Btn kind="danger" onClick={() => runTaskNow(selectedTask.id, true)}>
                  <AlertTriangle size={14} /> Simular fallo (Crea ticket en Soporte)
                </Btn>
              </div>

              {/* Executions History */}
              <div className="mt-4 pt-3 border-t border-line">
                <h4 className="text-xs font-semibold text-mut uppercase tracking-wider mb-2">
                  Historial de ejecuciones ({selectedTask.executions.length})
                </h4>
                <div className="space-y-2">
                  {selectedTask.executions.map(ex => (
                    <div key={ex.id} className="bg-paper p-2.5 rounded text-xs border border-line">
                      <div className="flex items-center justify-between font-medium">
                        <span>{ex.fecha}</span>
                        <StatusBadge s={ex.resultado} />
                      </div>
                      <div className="text-mut text-[11px] mt-0.5">Duración: {ex.duracion}</div>
                      <div className="mt-1.5 pl-2 border-l border-brand/30 space-y-0.5 text-[11px] text-mut">
                        {ex.trayectoria.map((step, idx) => (
                          <div key={idx}>• {step}</div>
                        ))}
                      </div>
                      {ex.aprobacionId && (
                        <button
                          onClick={() => go('bandeja')}
                          className="mt-1.5 text-brand font-semibold text-[11px] hover:underline block"
                        >
                          Ver aprobación generada ({ex.aprobacionId}) →
                        </button>
                      )}
                      {ex.ticketId && (
                        <button
                          onClick={() => go('soporte')}
                          className="mt-1.5 text-bad font-semibold text-[11px] hover:underline block"
                        >
                          Ver ticket de soporte creado ({ex.ticketId}) →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>

      {/* Modal Programar Tarea */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 border border-line animate-in fade-in">
            <h3 className="font-semibold text-base mb-1 text-txt">Programar nueva tarea agéntica</h3>
            <p className="text-xs text-mut mb-4">
              Defina el procedimiento, disparador, nivel de autonomía y responsable de validación humana.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-txt block mb-1">Nombre de la tarea</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ej. Conciliación diaria de compras spot en bolsa..."
                  className="w-full p-2 border border-line rounded outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-txt block mb-1">Skill o Plugin</label>
                  <select
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    className="w-full p-2 border border-line rounded outline-none focus:border-brand bg-white"
                  >
                    {SKILLS_PREDEFINIDOS.map(s => (
                      <option key={s.id} value={s.nombre}>
                        {s.nombre} ({s.modulo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-txt block mb-1">Agente ejecutor</label>
                  <select
                    value={newAgent}
                    onChange={e => setNewAgent(e.target.value)}
                    className="w-full p-2 border border-line rounded outline-none focus:border-brand bg-white"
                  >
                    {AGENTS.map(ag => (
                      <option key={ag.id} value={ag.name}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-txt block mb-1">Disparador (Horario / Evento)</label>
                  <input
                    value={newWhen}
                    onChange={e => setNewWhen(e.target.value)}
                    placeholder="Ej. Todos los días a las 06:00 COT"
                    className="w-full p-2 border border-line rounded outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="font-medium text-txt block mb-1">Nivel de autonomía</label>
                  <select
                    value={newAuto}
                    onChange={e => setNewAuto(Number(e.target.value) as 0 | 1 | 2 | 3)}
                    className="w-full p-2 border border-line rounded outline-none focus:border-brand bg-white"
                  >
                    <option value={0}>N0 · Manual asistido</option>
                    <option value={1}>N1 · Propone</option>
                    <option value={2}>N2 · Ejecuta y pide aprobación</option>
                    <option value={3}>N3 · Ejecuta y reporta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-txt block mb-1">Responsable de aprobación</label>
                <input
                  value={newResp}
                  onChange={e => setNewResp(e.target.value)}
                  placeholder="Ej. Analista de liquidación / Gerencia"
                  className="w-full p-2 border border-line rounded outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-line">
              <Btn small onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Btn>
              <Btn small kind="primary" onClick={handleCreate}>
                Guardar y programar
              </Btn>
            </div>
          </div>
        </div>
      )}

      <Illustrative />
    </>
  );
}


// ---------- Artefactos del Espacio de Trabajo ----------
export function Artefactos() {
  const { openArtifact, artifactsList } = useApp();
  const [filterLayer, setFilterLayer] = useState<string>('todas');
  const [search, setSearch] = useState('');

  const filtered = artifactsList.filter(a => {
    const matchLayer = filterLayer === 'todas' || a.capa === filterLayer;
    const matchSearch =
      search.trim() === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.owner.toLowerCase().includes(search.toLowerCase());
    return matchLayer && matchSearch;
  });

  return (
    <>
      <ViewHeader
        title="Artefactos"
        desc="Lo que producen analistas y agentes: tablas de liquidación, reclamaciones formales ante el ASIC, hojas de vida de fronteras, reportes SRM y fórmulas versionadas."
        capa="nucleo"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Layer Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-mut font-medium">Capa:</span>
          {[
            ['todas', 'Todas'],
            ['nucleo', 'Núcleo (50%)'],
            ['enersinc_cliente', 'Capa Enersinc (25%)'],
            ['cliente', 'Capa Cliente (25%)'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterLayer(key)}
              className={`text-xs px-2.5 py-1 rounded font-medium ${
                filterLayer === key
                  ? 'bg-ink text-white'
                  : 'bg-white border border-line text-mut hover:text-txt'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar artefactos por nombre o ID..."
          className="text-xs px-3 py-1.5 border border-line rounded-md bg-white outline-none focus:border-brand w-64"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(a => (
          <button
            key={a.id}
            onClick={() => openArtifact(a.id)}
            className="text-left bg-white border border-line rounded-lg p-4 hover:border-brand hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1 text-xs text-mut mb-1">
                <span>{a.id} · v{a.version}</span>
                <LayerBadge capa={a.capa} compact />
              </div>
              <div className="font-semibold text-sm text-txt leading-snug mt-1">{a.title}</div>
              <div className="text-xs text-mut mt-2">Por {a.owner} · {a.updated}</div>
            </div>

            <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-line/60">
              {a.shared.map(s => (
                <Badge key={s} tone="brand">
                  {s}
                </Badge>
              ))}
            </div>
          </button>
        ))}
      </div>

      <Illustrative />
    </>
  );
}
