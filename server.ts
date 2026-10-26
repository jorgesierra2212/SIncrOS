import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini SDK client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    product: 'Enersinc OS',
    market: 'Mercado de Energía Mayorista (MEM) Colombia',
  });
});

app.post('/api/chat', async (req, res) => {
  const {
    prompt,
    history = [],
    viewContext = 'inicio',
    procesoId = '',
    ejecucionId = '',
    attachedFiles = [],
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt requerido' });
  }

  // System instruction specifically tailored for Colombian wholesale electricity market (MEM)
  const systemInstruction = `Eres el Agente Inteligente Oficial de Enersinc OS, un sistema operativo con ADN agéntico para agentes del Mercado de Energía Mayorista (MEM) de Colombia operado por XM (CND y ASIC).
Toda tu respuesta DEBE ser en español de Colombia, con tono profesional de analista sénior de energía.

Principios no negociables que debes respetar:
1. Agentes ejecutan, personas aprueban: NUNCA digas que ejecutaste una transacción definitiva hacia XM, la DIAN o el ERP. Siempre propón acciones, prepara borradores o solicita aprobación humana.
2. Cita siempre la regla y versión reglamentaria aplicable cuando hables de liquidación, medida o despacho (ej. CREG 024/1995, CREG 071/2006, CREG 038/2014, CREG 119/2007, CREG 051/2009, o fórmulas versionadas como RecPos v14).
3. Cuando hables de liquidaciones de XM, menciona las versiones oficiales del ciclo (TX1, TX2, TX3, TXR, TXF).
4. El contexto activo del usuario es: "${viewContext}" (Proceso ID: "${procesoId || 'N/A'}", Ejecución ID: "${ejecucionId || 'N/A'}").
5. Si el usuario adjuntó archivos (${attachedFiles.length} adjuntos), haz referencia explícita a su contenido y a cómo pueden usarse como entradas de un skill.

Devuelve tu respuesta en formato JSON con la siguiente estructura:
{
  "agent": "Nombre del agente más idóneo (ej. Auditor de liquidación, Crítica de medida, Reporte SRM, Agente de despacho y ofertas, Proyección de garantías, Cargos y facturación, o Analista de riesgo)",
  "text": "Tu explicación concisa y profesional en español de Colombia.",
  "steps": ["Paso 1 ejecutado en memoria", "Paso 2 consultado", "Paso 3 propuesta generada"],
  "chart": "bolsa" | "diferencias" | "garantias" | "fronteras" | "escenarios" (o null si no aplica),
  "artifact": "ART-101" | "ART-104" | "ART-108" | "ART-110" | "ART-112" | "ART-118" | "ART-121" | "ART-125" (o null si no aplica),
  "approval": "A-1042" | "A-1043" | "A-1044" | "A-1045" | "A-1046" | "A-1047" (o null si no aplica)
}`;

  if (!ai) {
    return res.status(200).json({
      fallback: true,
      procesoId,
      ejecucionId,
      message: 'Clave no configurada en el entorno; usando respuestas guionadas del agente del proceso.',
    });
  }

  try {
    const formattedContents: any[] = [];
    for (const h of history.slice(-4)) {
      formattedContents.push({
        role: h.role === 'agent' ? 'model' : 'user',
        parts: [{ text: h.text }],
      });
    }

    let userPromptWithContext = prompt;
    if (procesoId || ejecucionId) {
      userPromptWithContext = `[Proceso: ${procesoId} | Ejecución: ${ejecucionId}]\n${userPromptWithContext}`;
    }
    if (attachedFiles.length > 0) {
      userPromptWithContext += `\n[Archivos adjuntos: ${attachedFiles.map((f: any) => `${f.nombre} (${f.tipo})`).join(', ')}]`;
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: userPromptWithContext }],
    });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const raw = response.text?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        agent: 'Asistente Enersinc',
        text: raw,
        steps: ['Interpretó consulta del usuario', 'Consultó base normativa CREG'],
      };
    }

    return res.json({
      fallback: false,
      procesoId,
      ejecucionId,
      reply: parsed,
    });
  } catch (err: any) {
    console.error('Error invocando Modelo configurado en server:', err?.message || err);
    return res.json({
      fallback: true,
      procesoId,
      ejecucionId,
      error: err?.message,
    });
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      // @ts-ignore
      allowedHosts: true,
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(port, '0.0.0.0', () => {
    console.log(`Enersinc OS dev server running at http://0.0.0.0:${port}`);
  });
}

startServer();
