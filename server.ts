import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust helper to format and sanitize conversation history for Gemini API
function normalizeConversationHistory(
  rawMessages: Array<{ sender?: string; text?: string }> = [],
  charName: string = 'Ben',
  defaultUserGreeting: string = 'Hallo! Lass uns quatschen.'
) {
  const contents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

  // Filter and map to basic role objects
  const rawClean = rawMessages
    .filter((m) => m && typeof m.text === 'string' && m.text.trim().length > 0)
    .map((m) => {
      const isUser = m.sender === 'jedidiah' || m.sender === 'jd' || m.sender === 'user';
      return {
        role: (isUser ? 'user' : 'model') as 'user' | 'model',
        text: m.text!.trim(),
      };
    });

  if (rawClean.length === 0) {
    return [{ role: 'user' as const, parts: [{ text: defaultUserGreeting }] }];
  }

  // Prepend user starter if first message is from model (Gemini requires contents to begin with role: 'user')
  if (rawClean[0].role === 'model') {
    contents.push({
      role: 'user',
      parts: [{ text: `Hallo ${charName}! Ich bin bereit zum Quatschen!` }],
    });
  }

  // Merge consecutive turns with identical roles to strictly preserve user/model alternation
  for (const item of rawClean) {
    if (contents.length > 0 && contents[contents.length - 1].role === item.role) {
      contents[contents.length - 1].parts[0].text += `\n${item.text}`;
    } else {
      contents.push({
        role: item.role,
        parts: [{ text: item.text }],
      });
    }
  }

  // Ensure the final message in contents is from 'user' when invoking generateContent
  if (contents.length > 0 && contents[contents.length - 1].role === 'model') {
    contents.push({
      role: 'user',
      parts: [{ text: 'Ich bin dran mit Sprechen!' }],
    });
  }

  return contents;
}

// Safely extract and parse JSON text from Gemini responses
function safeParseJson(rawText: string = ''): any {
  if (!rawText) return {};
  try {
    return JSON.parse(rawText);
  } catch (e) {
    // Strip markdown code fences if present (```json ... ```)
    const stripped = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(stripped);
    } catch {
      // Find outermost JSON object
      const start = stripped.indexOf('{');
      const end = stripped.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(stripped.slice(start, end + 1));
        } catch {}
      }
      return {};
    }
  }
}

// Model configuration
const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODEL = 'gemini-flash-latest';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    configuredModel: PRIMARY_MODEL,
    fallbackModel: FALLBACK_MODEL,
    backendActive: true,
    timestamp: Date.now(),
  });
});

// Diagnostic test endpoint for verifying Gemini API connectivity and latency
app.get('/api/test-gemini', async (req, res) => {
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      hasGeminiKey: false,
      message: 'GEMINI_API_KEY is not configured in the environment.',
    });
  }

  const startTime = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: 'Say "hello" and confirm you are ready.',
      config: {
        maxOutputTokens: 30,
      },
    });

    const durationMs = Date.now() - startTime;
    return res.json({
      success: true,
      hasGeminiKey: true,
      modelUsed: PRIMARY_MODEL,
      durationMs,
      response: response.text?.trim() || '',
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    console.error('Gemini test diagnostic failed:', {
      errorName: err?.name,
      errorMessage: err?.message,
      errorCode: err?.status || err?.code,
      durationMs,
      model: PRIMARY_MODEL,
      endpoint: '/api/test-gemini',
    });

    return res.status(500).json({
      success: false,
      hasGeminiKey: true,
      durationMs,
      modelUsed: PRIMARY_MODEL,
      errorName: err?.name || 'Error',
      errorMessage: err?.message || String(err),
    });
  }
});

// Chat endpoint for playmate conversation
app.post('/api/chat', async (req, res) => {
  const language = req.body?.language || 'de';
  const startTime = Date.now();

  try {
    const {
      messages,
      character,
      environment,
      topic,
      subModeId,
      speakingMode = 'chat',
      conversationGoal = 'just_chat',
      correctionLevel = 'balanced',
      comfortLevel = 'moderate',
      parentSettings,
      bookContext,
      scenarioContext,
      pictureContext,
    } = req.body;

    const charName = character?.name || 'Ben';
    const charId = character?.id?.toLowerCase() || 'ben';
    const childName = parentSettings?.childName || 'Jedidiah';
    const personalMemory = parentSettings?.personalMemory || {};

    // Concise character persona
    let characterPersona = '';
    if (charId === 'mia') {
      characterPersona = `Mia (10-12 yo girl): Warm, thoughtful, empathetic peer. Loves books, faith, stories, school, and friendships.`;
    } else if (charId === 'ben') {
      characterPersona = `Ben (10-12 yo boy): Energetic, sporty teammate. Hyped about football, goals, outdoor action, and games.`;
    } else if (charId === 'leo') {
      characterPersona = `Leo (10-12 yo boy): Calm, curious explorer. Loves science, space, animals, mysteries, and discovering how things work.`;
    } else if (charId === 'sophie') {
      characterPersona = `Sophie (10-12 yo girl): Bright, bubbly, playful peer. Loves cartoons, roleplay, funny ideas, and creative adventures.`;
    } else {
      characterPersona = `${charName} (10-12 yo peer): Friendly, encouraging, active conversation partner.`;
    }

    // Personal memory
    const memoryLines: string[] = [];
    if (personalMemory.favoriteFootballTeam) memoryLines.push(`Favorite Team: ${personalMemory.favoriteFootballTeam}`);
    if (personalMemory.favoritePlayer) memoryLines.push(`Favorite Player: ${personalMemory.favoritePlayer}`);
    if (personalMemory.safeFriends?.length > 0) memoryLines.push(`Friends: ${personalMemory.safeFriends.join(', ')}`);
    if (personalMemory.favoriteCartoon) memoryLines.push(`Shows/Cartoons: ${personalMemory.favoriteCartoon}`);
    if (personalMemory.recentBook) memoryLines.push(`Story/Book: ${personalMemory.recentBook}`);
    if (personalMemory.customNotes) memoryLines.push(`Notes: ${personalMemory.customNotes}`);

    const memorySection = memoryLines.length > 0 ? `\nMEMORY CONTEXT:\n${memoryLines.join('; ')}\n` : '';

    // Goal instructions
    let goalLine = `Goal: Natural, engaging dialogue.`;
    if (conversationGoal === 'full_sentences') {
      goalLine = `Goal: Full Sentence Challenge. If ${childName} uses 1-word answers, model the complete sentence warmly and set isPracticeTrigger=true.`;
    } else if (conversationGoal === 'ask_the_avatar') {
      goalLine = `Goal: Encourage ${childName} to ask YOU questions. Answer briefly and prompt: "Was möchtest du mich als Nächstes fragen?"`;
    } else if (conversationGoal === 'tell_a_story') {
      goalLine = `Goal: Story Retell. Prompt chronological steps (Beginning -> What happened -> Ending).`;
    } else if (conversationGoal === 'explain_it') {
      goalLine = `Goal: ${childName} is the expert teaching you. Act curious and ask clarifying questions.`;
    } else if (conversationGoal === 'real_world') {
      goalLine = `Goal: Roleplay scenario "${scenarioContext?.title || 'Everyday situation'}". Play your role (${scenarioContext?.avatarRole || 'peer'}).`;
    } else if (conversationGoal === 'picture_prompt') {
      goalLine = `Goal: Picture adventure "${pictureContext?.title || 'Scene'}". Ask what he sees and what happens next.`;
    } else if (conversationGoal === 'slow_and_clear') {
      goalLine = `Goal: Calm, unhurried pace with room to breathe.`;
    }

    // Correction rule
    const correctionRule =
      correctionLevel === 'practice_heavy'
        ? 'Frequently model full sentences for single-word answers or mixed code-switching.'
        : correctionLevel === 'light'
        ? 'Do not interrupt flow with practice triggers unless requested.'
        : 'Model full sentences occasionally when single-word fragments are used.';

    const systemInstruction = `
You are ${characterPersona}
Chatting with ${childName} (9-10 yo boy) in a supportive, fun voice playground.
${memorySection}
ACTIVE SETTINGS:
- ${goalLine}
- Correction: ${correctionRule}
- Language: ${language === 'de' ? 'German' : 'English'}.
- Tone: Genuine 10-12yo peer (NEVER adult/schoolteacher/robotic).

RULES:
1. Contextual & Specific: Acknowledge what ${childName} actually said (people like Noah/David, games, ideas) before asking a short follow-up.
2. Two-Way Talk: If he asks a question, answer warmly in character. Keep your turn under 3 concise sentences so he has 70%+ speaking time.
3. German-English Code-Switching: Naturally understood, never criticized.
4. Stammer & Speech Safety: Never mention stammering or say sentences are "wrong".
5. Unclear Speech: If his speech is truly garbled or unintelligible, set isRepeatRequest=true and ask gently:
   - DE: "Ich habe dich nicht ganz verstanden. Sag es bitte noch einmal langsam."
   - EN: "I didn't quite understand you. Can you say it again slowly?"

Respond ONLY with valid JSON matching this schema:
{
  "replyText": "your spoken reply",
  "modeledSentence": "gentle full-sentence model if practice triggered, or null",
  "isPracticeTrigger": false,
  "isRepeatRequest": false,
  "followUpQuestion": "short friendly question",
  "emotion": "happy|curious|encouraging|thinking|cheering|surprised|talking",
  "newVocabulary": ["word1"]
}
`;

    // Format conversation history safely for Gemini
    const conversationHistory = normalizeConversationHistory(
      messages,
      charName,
      language === 'de' ? `Hallo ${charName}! Ich bin bereit zum Quatschen!` : `Hi ${charName}! I'm ready to chat!`
    );

    if (!apiKey) {
      const fallbackReplies: Record<string, string> = {
        leo: language === 'de' ? 'Das ist ja mega cool! Ich liebe Abenteuer. Was gefällt dir daran am meisten?' : "That's super cool! What do you like most about that?",
        ben: language === 'de' ? 'Klasse Spielzug! Das klingt nach einem Volltreffer. Wer war noch dabei?' : "Awesome move! Who else was there?",
        mia: language === 'de' ? 'Oh, wie spannend! Erzähl mir mehr darüber!' : "Oh how exciting! Tell me more about it!",
        sophie: language === 'de' ? 'Gute Frage! Wie stellst du dir das vor?' : "Great question! How do you picture it?",
      };
      const playmateReply = fallbackReplies[charId] || (language === 'de' ? 'Das ist ja spannend! Erzähl mir unbedingt mehr!' : "That sounds awesome! Tell me more!");
      return res.json({
        replyText: playmateReply,
        modeledSentence: null,
        isPracticeTrigger: false,
        isRepeatRequest: false,
        followUpQuestion: language === 'de' ? 'Was ist als Nächstes passiert?' : 'What happened next?',
        emotion: 'curious',
        newVocabulary: [],
      });
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        replyText: {
          type: Type.STRING,
          description: 'The playmate voice reply to Jedidiah.',
        },
        modeledSentence: {
          type: Type.STRING,
          description: 'Clear gentle sentence model if practice or whole sentence challenge is triggered, or empty string if none.',
        },
        isPracticeTrigger: {
          type: Type.BOOLEAN,
          description: 'Whether this turn triggers a repeat-after-me practice moment.',
        },
        isRepeatRequest: {
          type: Type.BOOLEAN,
          description: 'Whether the child statement was unclear and you gently asked him to repeat.',
        },
        followUpQuestion: {
          type: Type.STRING,
          description: 'The contextual open-ended follow up question.',
        },
        emotion: {
          type: Type.STRING,
          description: 'Avatar facial expression (happy, curious, encouraging, thinking, cheering, surprised, talking).',
        },
        newVocabulary: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '1 to 3 interesting words.',
        },
      },
      required: ['replyText', 'isPracticeTrigger', 'emotion', 'followUpQuestion'],
    };

    let rawResponseText = '';
    let usedModel = PRIMARY_MODEL;

    // Helper with timeout and low thinking latency
    const fetchWithModel = async (model: string, timeoutMs: number = 16000) => {
      let timeoutId: NodeJS.Timeout | null = null;
      const modelConfig: any = {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema,
      };

      // Ensure minimal thinking latency for real-time playmate responses
      if (model.includes('3.7') || model.includes('3.1-pro')) {
        modelConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      const apiCall = ai.models.generateContent({
        model,
        contents: conversationHistory,
        config: modelConfig,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          const timeoutErr = new Error(`Gemini API call timed out after ${timeoutMs}ms on model ${model}`);
          (timeoutErr as any).isTimeout = true;
          reject(timeoutErr);
        }, timeoutMs);
      });

      try {
        const result = await Promise.race([apiCall, timeoutPromise]);
        if (timeoutId) clearTimeout(timeoutId);
        return result;
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        throw err;
      }
    };

    // Primary attempt
    try {
      const response = await fetchWithModel(PRIMARY_MODEL, 16000);
      rawResponseText = response.text || '';
    } catch (primaryErr: any) {
      console.warn(`Primary model (${PRIMARY_MODEL}) failed, trying fallback model (${FALLBACK_MODEL}):`, {
        errorName: primaryErr?.name,
        errorMessage: primaryErr?.message,
        errorCode: primaryErr?.status || primaryErr?.code,
        isTimeout: Boolean(primaryErr?.isTimeout),
      });

      usedModel = FALLBACK_MODEL;
      const fallbackResponse = await fetchWithModel(FALLBACK_MODEL, 12000);
      rawResponseText = fallbackResponse.text || '';
    }

    const parsed = safeParseJson(rawResponseText);
    const durationMs = Date.now() - startTime;

    // Sanitize parsed results
    const replyText =
      parsed.replyText ||
      (language === 'de'
        ? 'Das klingt echt spannend! Erzähl mir mehr darüber!'
        : 'That sounds exciting! Tell me more about it!');

    const modeledSentence =
      parsed.modeledSentence &&
      typeof parsed.modeledSentence === 'string' &&
      parsed.modeledSentence.trim().length > 0 &&
      parsed.modeledSentence !== 'null'
        ? parsed.modeledSentence.trim()
        : null;

    res.json({
      replyText,
      modeledSentence,
      isPracticeTrigger: Boolean(parsed.isPracticeTrigger),
      isRepeatRequest: Boolean(parsed.isRepeatRequest),
      followUpQuestion: parsed.followUpQuestion || (language === 'de' ? 'Was meinst du dazu?' : 'What do you think?'),
      emotion: parsed.emotion || 'happy',
      newVocabulary: Array.isArray(parsed.newVocabulary) ? parsed.newVocabulary : [],
      modelUsed: usedModel,
      durationMs,
    });
  } catch (error: any) {
    const isTimeout = Boolean(error?.isTimeout) || error?.message?.includes('timed out') || error?.name === 'AbortError';
    console.error('Gemini API Error in /api/chat:', {
      errorName: error?.name || 'Error',
      errorMessage: error?.message || String(error),
      errorCode: error?.status || error?.code || null,
      isTimeout,
      hasApiKey: Boolean(apiKey),
      primaryModel: PRIMARY_MODEL,
      fallbackModel: FALLBACK_MODEL,
      endpoint: '/api/chat',
      durationMs: Date.now() - startTime,
    });

    // Technical / Timeout fallback message: does NOT blame child's speech
    const technicalFallbackText =
      language === 'de'
        ? 'Meine Antwort braucht gerade etwas länger. Versuch es bitte noch einmal.'
        : 'One moment, my answer is taking a bit longer. Please try again.';

    res.json({
      replyText: technicalFallbackText,
      modeledSentence: null,
      isPracticeTrigger: false,
      isRepeatRequest: false,
      errorType: isTimeout ? 'api_timeout' : 'technical_error',
      followUpQuestion: language === 'de' ? 'Versuch es bitte noch einmal.' : 'Please try again.',
      emotion: 'thinking',
      newVocabulary: [],
    });
  }
});

// Book metadata lookup endpoint
app.post('/api/book-lookup', async (req, res) => {
  try {
    const { query, language = 'de' } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Try Open Library search
    let bookData: any = null;
    try {
      const openLibUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`;
      const olRes = await fetch(openLibUrl);
      if (olRes.ok) {
        const olJson = await olRes.json();
        if (olJson.docs && olJson.docs.length > 0) {
          const doc = olJson.docs[0];
          bookData = {
            title: doc.title,
            author: doc.author_name ? doc.author_name[0] : 'Unbekannter Autor',
            firstPublishYear: doc.first_publish_year,
            coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
            subjects: (doc.subject || []).slice(0, 5),
          };
        }
      }
    } catch (e) {
      console.warn('Open Library fetch error:', e);
    }

    // Use Gemini to generate child-friendly discussion starter & 5-level challenge
    const prompt = `
A 9-10 year old child named Jedidiah wants to discuss the book: "${query}".
Known metadata: ${JSON.stringify(bookData || {})}
Language: ${language === 'de' ? 'German (Deutsch)' : 'English'}

Generate a child-friendly discussion guide:
1. "title": confirmed book title (or cleaned query)
2. "author": author name
3. "summary": 2-sentence friendly summary without spoilers
4. "keyCharacters": 2-3 main characters or archetypes
5. "levelQuestions": Array of 5 progressive questions:
   - Level 1 (1 sentence): simple core idea
   - Level 2 (2 sentences): what happened at the start
   - Level 3 (Explain why): why did a character act that way
   - Level 4 (Retell scene): retell the funniest or most exciting part
   - Level 5 (Opinion): what would you change or what do you think?
`;

    let rawBookText = '';
    try {
      const response = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyCharacters: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              levelQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'author', 'summary', 'levelQuestions'],
          },
        },
      });
      rawBookText = response.text || '';
    } catch (e) {
      console.warn('Book lookup primary model error, trying fallback model:', e);
      const fbResponse = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyCharacters: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              levelQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'author', 'summary', 'levelQuestions'],
          },
        },
      });
      rawBookText = fbResponse.text || '';
    }

    const parsed = safeParseJson(rawBookText);
    if (bookData?.coverUrl) {
      parsed.coverUrl = bookData.coverUrl;
    }
    res.json(parsed);
  } catch (error) {
    console.error('Book lookup error:', error);
    res.json({
      title: req.body?.query || 'Mein Buch',
      author: 'Lieblingsautor',
      summary: 'Ein tolles Buch zum Lesen und Erzählen!',
      keyCharacters: ['Hauptfigur', 'Bester Freund'],
      levelQuestions: [
        'Level 1: Worum geht es in deinem Buch in einem Satz?',
        'Level 2: Was ist ganz am Anfang der Geschichte passiert?',
        'Level 3: Warum magst du deine Lieblingsfigur so gern?',
        'Level 4: Kannst du mir die spannendste Stelle erzählen?',
        'Level 5: Was würdest du am Ende der Geschichte verändern?',
      ],
    });
  }
});

// Session summary generation endpoint
app.post('/api/session-summary', async (req, res) => {
  try {
    const {
      turns,
      topic,
      character,
      durationSeconds = 600,
      language = 'de',
      practicedList = [],
    } = req.body;

    const childName = 'Jedidiah';
    const charName = character?.name || 'Ben';
    const topicName = language === 'de' ? (topic?.nameDe || 'Abenteuer') : (topic?.nameEn || 'Adventure');

    const prompt = `
Generate a playful, encouraging adventure summary for 9-10 year old ${childName}.
Session details:
- Playmate: ${charName}
- Topic: ${topicName}
- Duration: ${Math.round(durationSeconds / 60)} minutes
- Language: ${language}
- Conversation turns: ${JSON.stringify(turns || [])}
- Practiced sentences: ${JSON.stringify(practicedList)}

Provide:
1. "title": Playful adventure title (e.g. "⭐ Jedidiah's Fußball-Abenteuer")
2. "starSentences": Array of 1-2 great, expressive sentences spoken by ${childName}.
3. "newWords": Array of 2-4 fun words used in the conversation.
4. "practicedSentences": Array of sentences that were practiced/modeled.
5. "badge": { "id": string, "nameDe": string, "nameEn": string, "emoji": string } - A fitting positive badge (e.g. Football Expert, Storyteller, Great Explainer, Detective, Book Explorer).
6. "playmateFarewell": An enthusiastic 1-2 sentence message from ${charName}.
7. "parentObservation": A gentle 1-2 sentence observation for parents about ${childName}'s engagement, sentence complexity, or excitement (strictly educational, NO clinical diagnosis).
`;

    let rawSummaryText = '';
    const summarySchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        starSentences: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        newWords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        practicedSentences: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        badge: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            nameDe: { type: Type.STRING },
            nameEn: { type: Type.STRING },
            emoji: { type: Type.STRING },
          },
          required: ['id', 'nameDe', 'nameEn', 'emoji'],
        },
        playmateFarewell: { type: Type.STRING },
        parentObservation: { type: Type.STRING },
      },
      required: ['title', 'starSentences', 'newWords', 'badge', 'playmateFarewell', 'parentObservation'],
    };

    try {
      const response = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: summarySchema,
        },
      });
      rawSummaryText = response.text || '';
    } catch (e) {
      console.warn('Session summary primary model error, trying fallback model:', e);
      const fbResponse = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: summarySchema,
        },
      });
      rawSummaryText = fbResponse.text || '';
    }

    const parsed = safeParseJson(rawSummaryText);
    res.json(parsed);
  } catch (error) {
    console.error('Session summary error:', error);
    res.json({
      title: "⭐ Jedidiah's Tolles Abenteuer",
      starSentences: ['Ich habe heute viel erzählt!'],
      newWords: ['Abenteuer', 'Freunde', 'Spiel'],
      practicedSentences: req.body?.practicedList || [],
      badge: {
        id: 'brave_speaker',
        nameDe: 'Mutiger Sprecher',
        nameEn: 'Brave Speaker',
        emoji: '⭐',
      },
      playmateFarewell: 'Das hat heute richtig Spaß gemacht, Jedidiah! Ich freue mich schon auf unser nächstes Gespräch!',
      parentObservation: 'Jedidiah hat heute mit Begeisterung gesprochen und eigene Ideen formuliert.',
    });
  }
});

// ==========================================
// PERSISTENT PROGRESS & DATABASE STORAGE API
// Ensures cross-device continuity and guards against browser localStorage clearing
// ==========================================
const DATA_DIR = path.join(process.cwd(), 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'user_progress.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data directory:', err);
  }
}

// In-memory cache for fast read/writes
let inMemoryProgress: Record<string, any> = {};
try {
  if (fs.existsSync(PROGRESS_FILE)) {
    const raw = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    inMemoryProgress = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Failed to load user progress file, starting fresh:', e);
}

// Helper to save in-memory progress to disk
function persistProgressToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(inMemoryProgress, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing progress to disk:', e);
  }
}

// GET user progress
app.get('/api/progress/:userId?', (req, res) => {
  const userId = req.params.userId || 'jedidiah';
  const data = inMemoryProgress[userId] || null;
  res.json({
    success: true,
    userId,
    data,
    serverTimestamp: Date.now(),
  });
});

// POST save user progress
app.post('/api/progress/:userId?', (req, res) => {
  const userId = req.params.userId || 'jedidiah';
  const progressPayload = req.body;

  if (!progressPayload || typeof progressPayload !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid progress payload' });
  }

  inMemoryProgress[userId] = {
    ...(inMemoryProgress[userId] || {}),
    ...progressPayload,
    lastSavedAt: Date.now(),
  };

  persistProgressToDisk();

  res.json({
    success: true,
    userId,
    lastSavedAt: inMemoryProgress[userId].lastSavedAt,
  });
});

// DELETE / Reset progress
app.delete('/api/progress/:userId?', (req, res) => {
  const userId = req.params.userId || 'jedidiah';
  delete inMemoryProgress[userId];
  persistProgressToDisk();
  res.json({ success: true, userId, message: 'Progress reset on server' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jedidiah Voice Playground running on http://localhost:${PORT}`);
  });
}

startServer();
