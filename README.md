# Enersinc OS (Sincrono) · arquitectura por procesos

Mockup navegable del sistema operativo de Enersinc para agentes del Mercado de Energía Mayorista de Colombia. Todos los datos son ilustrativos.

## Idea central

La unidad del producto es el **proceso**. Todo proceso agéntico se trabaja con los mismos siete componentes, en el mismo orden:

1. **Flujo**: control del proceso híbrido; cada paso es Agente, Humano o Automático, con bitácora, respaldo manual y aprobación según el rol.
2. **Datos**: tabla editable tipo Airtable, con registro en ventana, historial por celda (quién, cuándo, valor anterior, motivo) e importación y exportación en Excel.
3. **Chat**: conversación con el agente del proceso, con la ejecución seleccionada como contexto.
4. **Reportes**: tablas, gráficos y tableros vivos creados desde plantillas; el agente los actualiza cuando cambian los datos y se pueden congelar.
5. **Fechas y versiones**: en liquidación, versiones TX1 a TXF y comparación entre versiones; en los demás procesos, solo fechas.
6. **Envíos**: Preparado → Aprobado → Enviado → Acuse recibido → Aceptado o Rechazado, con radicado o CUFE y evidencia. Nada sale sin aprobar el paso humano y el envío.
7. **Histórico**: carpeta con reportes congelados y documentos enviados.

Las **conversaciones son de cada persona** (se guardan en el navegador, se comparten y se retoman). Los **procesos se comparten por equipos**, y dentro de cada proceso el rol define las acciones: Dueño configura, Ejecutor ejecuta y edita, Aprobador aprueba, Lector consulta.

## Procesos incluidos

| Dominio | Proceso | Identificación | Envío a |
|---|---|---|---|
| Despacho | Oferta diaria de despacho | Fecha | XM (CND) |
| CGM | Crítica de medida y reporte SRM | Fecha | XM (CND) |
| Liquidación | Liquidación sombra TX | Periodo + versión TX | XM (ASIC) |
| Liquidación | Liquidación de contratos | Periodo + versión TX | Agente |
| Liquidación | Reclamaciones ASIC | Periodo + versión TX | XM (ASIC) |
| Garantías | Garantías semanales | Fecha | — |
| Facturación | Liquidación de usuarios no regulados | Periodo | — |
| Facturación | Facturación mensual | Periodo | DIAN |

Las consultas sin flujo (bolsa, posición, riesgo, supervisión, contratos, fronteras, etc.) quedan como **Tableros**.

## Menú

Mi bandeja · Procesos por dominio · Mis conversaciones · Tableros · Equipos · Plataforma. Para demostrar roles, cambie de persona abajo a la izquierda (Andrés Rojas, Laura Méndez, Diana Pérez, etc.).

## Correr localmente

```bash
npm install
cp .env.example .env   # opcional: GEMINI_API_KEY y GEMINI_MODEL
npm run dev            # http://localhost:3000
```

Sin `GEMINI_API_KEY`, el chat usa respuestas guionadas.

## Subir a Google AI Studio

1. Suba esta carpeta a un repositorio de GitHub (por ejemplo `jorgesierra2212/sincrono`).
2. En AI Studio, abra **Build**, menú **+** del cuadro de texto, **Import from GitHub**.

## Estructura

```
components/process/        ProcessStore (estado), ProcessWorkspace, DataGrid, ChatPanel
components/process/tabs/   FlujoTab, DatosTab, ChatTab, ReportesTab, FechasTab, EnviosTab, HistoricoTab
components/workflow/       ProcessFlowDAG (flujo; modo embebido para el espacio de trabajo)
data/process/              types, catalog (procesos, equipos, roles), seeds, build, workflows/
data/mock/                 datos ilustrativos por dominio (antes en un solo mock.ts)
views/ProcesoViews.tsx     Proceso, Mi bandeja, Mis conversaciones, Equipos
```

## Cómo agregar un proceso

1. Defina su flujo en `data/process/workflows/` (con `buildWorkflow` basta una lista de pasos).
2. Agréguelo a `PROCESOS` en `data/process/catalog.ts` con dominio, equipo dueño, si es versionado, entidad de envío, columnas, filas, roles y plantillas de reporte.
3. Inclúyalo en los procesos del equipo que lo comparte (`EQUIPOS`).

El espacio de trabajo, el menú, la bandeja y las conversaciones lo toman automáticamente.

## Pendiente para producción

- Persistencia real (hoy: estado en memoria y conversaciones en `localStorage`).
- Conectar `filas`, ejecuciones y envíos al núcleo de datos (BigQuery) y a las APIs de XM y del proveedor de factura electrónica.
- Autenticación y permisos reales por rol.
