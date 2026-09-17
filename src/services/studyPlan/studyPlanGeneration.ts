import { type StudyPlanPromptContext } from './studyPlanPrompt.js';
import { generateFallbackWeekSessions } from './studyPlanFallback.js';
import { type ValidatedGeminiSession } from '../../validators/studyPlanOutputValidation.js';
import { generateJsonContent, GeminiRequestError } from '../../integrations/geminiClient.js';
import { validateGeminiStudyPlanOutput } from '../../validators/studyPlanOutputValidation.js';
import { buildStudyPlanSystemInstruction, buildStudyPlanUserContent } from './studyPlanPrompt.js';


const MAX_GEMINI_ATTEMPTS = 2;
export interface GenerationOutcome {
  sessions: ValidatedGeminiSession[];
  generatedBy: 'ai' | 'fallback';
}

export async function generateWeekSessions(ctx: StudyPlanPromptContext): Promise<GenerationOutcome> {
  const systemInstruction = buildStudyPlanSystemInstruction();
  const userContent = buildStudyPlanUserContent(ctx);

  for (let attempt=1; attempt<=MAX_GEMINI_ATTEMPTS; attempt++) {
    try {
      const raw = await generateJsonContent({
        systemInstruction,
        userContent,
        apiKeyIndex: attempt - 1,
      });
      const validated = validateGeminiStudyPlanOutput(
        raw,
        ctx.daysPerWeek,
        ctx.sessionsPerDay
      );

      if (validated) return { sessions: validated, generatedBy: 'ai' };
      console.warn(`[studyPlan] Gemini output failed validation on attempt ${attempt}/${MAX_GEMINI_ATTEMPTS}.`);
    } catch (err) {
      const message = err instanceof GeminiRequestError ? err.message : (err as Error).message;
      console.warn(`[studyPlan] Gemini request failed on attempt ${attempt}/${MAX_GEMINI_ATTEMPTS}: ${message}`);
    }
  }

  console.warn('[studyPlan] Falling back to deterministic generation after exhausting Gemini attempts.');
  const subjects = ctx.subjectPriority.length > 0
    ? ctx.subjectPriority
    : ctx.weakSubjects.map((w) => w.subject);
  const sessions = generateFallbackWeekSessions(
    ctx.daysPerWeek,
    ctx.sessionsPerDay,
    subjects
  );

  return { sessions, generatedBy: 'fallback' };
}
