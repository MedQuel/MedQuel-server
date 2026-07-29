import { GraphQLError } from 'graphql';
import { MAX_QUESTION_COUNT } from './bigqueryService.js';


const MIN_QUESTION_COUNT = 2;
const MAX_SUBJECT_LENGTH = 60;

export const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type ValidDifficulty = (typeof VALID_DIFFICULTIES)[number];

export const CONTEST_QUIZ_TYPES = ['contest', 'daily'] as const;
export const PRACTICE_QUIZ_TYPES = ['practice', 'subject'] as const;
export const VALID_QUIZ_TYPES = [...CONTEST_QUIZ_TYPES, ...PRACTICE_QUIZ_TYPES] as const;
export type ValidQuizType = (typeof VALID_QUIZ_TYPES)[number];

export interface StartQuizSessionInput {
  subject?: string | null;
  difficulty?: string | null;
  questionCount?: number | null;
  quizType: string;
  contestId?: string | null;
}
export type ValidatedStartQuizSession = {
  mode: 'contest';
  quizType: 'contest' | 'daily';
  contestId: string
} | {
  mode: 'practice';
  quizType: 'practice' | 'subject';
  subject: string;
  difficulty: ValidDifficulty;
  questionCount: number;
};

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

export function validateStartQuizSessionInput(input: StartQuizSessionInput): ValidatedStartQuizSession {
  const quizType = input.quizType?.toLowerCase();
  if (!VALID_QUIZ_TYPES.includes(quizType as ValidQuizType)) {
    badInput(`quizType must be one of ${VALID_QUIZ_TYPES.join('/')}, got "${input.quizType}".`);
  }

  const isContestMode = (CONTEST_QUIZ_TYPES as readonly string[]).includes(quizType);

  if (isContestMode) {
    const contestId = input.contestId?.trim();
    if (!contestId) badInput(`contestId is required when quizType is "${quizType}".`);
    if (input.subject || input.difficulty || input.questionCount) {
      badInput('subject/difficulty/questionCount must not be sent when quizType is "contest" or "daily" — these are determined by the contest.');
    }

    return {
      mode: 'contest',
      quizType: quizType as 'contest' | 'daily',
      contestId: contestId!,
    };
  }

  if (input.contestId) {
    badInput('contestId must not be provided unless quizType is "contest" or "daily".');
  }

  const subject = input.subject?.trim();
  if (!subject) badInput('subject is required.');
  if (subject!.length > MAX_SUBJECT_LENGTH) badInput('subject is too long.');

  const difficulty = input.difficulty?.toLowerCase();
  if (!VALID_DIFFICULTIES.includes(difficulty as ValidDifficulty)) {
    badInput(`difficulty must be one of easy/medium/hard, got "${input.difficulty}".`);
  }

  const questionCount = Math.trunc(input.questionCount ?? NaN);
  if (!Number.isFinite(questionCount) || questionCount < MIN_QUESTION_COUNT || questionCount > MAX_QUESTION_COUNT) {
    badInput(`questionCount must be between ${MIN_QUESTION_COUNT} and ${MAX_QUESTION_COUNT}, got "${input.questionCount}".`);
  }

  return {
    mode: 'practice',
    quizType: quizType as 'practice' | 'subject',
    subject: subject!,
    difficulty: difficulty as ValidDifficulty,
    questionCount,
  };
}


const VALID_OPTIONS = ['A', 'B', 'C', 'D'];

export interface QuizAnswerInput {
  questionId: string;
  selectedOption?: string | null;
}
export interface SubmitQuizSessionInput {
  sessionId: string;
  answers: QuizAnswerInput[];
}

export interface ValidatedAnswer {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
}
export interface ValidatedSubmitQuizSession {
  sessionId: string;
  answers: ValidatedAnswer[];
}

export function validateSubmitQuizSessionInput(input: SubmitQuizSessionInput): ValidatedSubmitQuizSession {
  const sessionId = input.sessionId?.trim();
  if (!sessionId) {
    throw new GraphQLError('sessionId is required.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  if (!Array.isArray(input.answers) || input.answers.length === 0) {
    throw new GraphQLError('answers must be a non-empty array.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const seenQuestionIds = new Set<string>();
  const answers: ValidatedAnswer[] = input.answers.map((answer, i) => {
    const questionId = answer.questionId?.trim();
    if (!questionId) {
      throw new GraphQLError(`answers[${i}].questionId is required.`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    if (seenQuestionIds.has(questionId)) {
      throw new GraphQLError(`answers[${i}].questionId "${questionId}" is duplicated.`, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    seenQuestionIds.add(questionId);

    let selectedOption: 'A' | 'B' | 'C' | 'D' | null = null;
    if (answer.selectedOption !== undefined && answer.selectedOption !== null) {
      const normalized = answer.selectedOption.trim().toUpperCase();
      if (normalized !== '') {
        if (!VALID_OPTIONS.includes(normalized)) {
          throw new GraphQLError(`answers[${i}].selectedOption must be one of A/B/C/D, got "${answer.selectedOption}".`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        selectedOption = normalized as 'A' | 'B' | 'C' | 'D';
      }
    }

    return { questionId, selectedOption };
  });

  return { sessionId, answers };
}
