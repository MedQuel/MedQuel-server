import type { Weekday } from '../../validators/studyPlanValidation.js';
import { VALID_SPECIALTIES } from '../../validators/onboardingValidation.js';


const READ_CONTENT_MAX_CHARS = 700;

export interface StudyPlanPromptContext {
  targetExam: string;
  describesYou: string;
  weekNumber: number;
  daysPerWeek: Weekday[];
  sessionsPerDay: number;
  weakSubjects: { subject: string; accuracy: number }[];
  masteredSubjects: string[];
  subjectPriority: string[];
}

export function buildStudyPlanSystemInstruction(): string {
  return [
    'You are a study planner for a medical exam preparation app. Output ONLY valid JSON matching the schema below.',
    'No prose, no markdown code fences, no commentary outside the JSON object.',
    'Only use subjects from "allowedSubjects" — never invent a subject name.',
    'Schedule sessions only on the days listed in "daysPerWeek", at most "sessionsPerDay" sessions per day.',
    'Mix sessionType "quiz" and "read" across the week — prioritize "quiz" for weak subjects, use "read" as a short concept refresher.',
    `For "read" sessions: content must be a concise, factual revision summary in bullet style, under ${READ_CONTENT_MAX_CHARS} characters. Do not include specific drug dosages or diagnostic cutoff values — those must come from the student's own verified textbook, not a quick digital summary. Position it as a refresher, not a primary source.`,
    'Schema: { "sessions": [ { "dayOfWeek": "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun", "sessionType": "quiz"|"read", "subject": string, "topic": string, "questionCount"?: number, "difficulty"?: "easy"|"medium"|"hard", "title"?: string, "content"?: string, "estimatedMinutes"?: number } ] }',
    '"questionCount" and "difficulty" are required when sessionType is "quiz". "title", "content", and "estimatedMinutes" are required when sessionType is "read".',
  ].join(' ');
}

export function buildStudyPlanUserContent(ctx: StudyPlanPromptContext): string {
  return JSON.stringify({
    targetExam: ctx.targetExam,
    describesYou: ctx.describesYou,
    weekNumber: ctx.weekNumber,
    daysPerWeek: ctx.daysPerWeek,
    sessionsPerDay: ctx.sessionsPerDay,
    weakSubjects: ctx.weakSubjects,
    masteredSubjects: ctx.masteredSubjects,
    subjectPriority: ctx.subjectPriority,
    allowedSubjects: VALID_SPECIALTIES,
  });
}
