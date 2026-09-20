import { GraphQLError } from 'graphql';
import { VALID_DIFFICULTIES, type ValidDifficulty } from './quizValidation.js';


const MIN_QUESTION_COUNT = 5;
const MAX_QUESTION_COUNT = 40;
const MIN_TIME_LIMIT_SECS = 60;
const MAX_TIME_LIMIT_SECS = 1800;
const DEFAULT_TIME_LIMIT_SECS = 600;
const MAX_SUBJECT_LENGTH = 60;

export interface CreateChallengeInput {
  toUid: string;
  subject: string;
  difficulty: string;
  questionCount: number;
  timeLimitSecs?: number | null;
}
export interface ValidatedCreateChallenge {
  toUid: string;
  subject: string;
  difficulty: ValidDifficulty;
  questionCount: number;
  timeLimitSecs: number;
}

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}


export function validateCreateChallengeInput(input: CreateChallengeInput): ValidatedCreateChallenge {
  const toUid = input.toUid?.trim();
  if (!toUid) badInput('toUid is required.');

  const subject = input.subject?.trim();
  if (!subject) badInput('subject is required.');
  if (subject!.length > MAX_SUBJECT_LENGTH) badInput('subject is too long.');

  const difficulty = input.difficulty?.toLowerCase();
  if (!VALID_DIFFICULTIES.includes(difficulty as ValidDifficulty)) {
    badInput(`difficulty must be one of easy/medium/hard, got "${input.difficulty}".`);
  }

  const questionCount = Math.trunc(input.questionCount);
  if (!Number.isFinite(questionCount) || questionCount < MIN_QUESTION_COUNT || questionCount > MAX_QUESTION_COUNT) {
    badInput(`questionCount must be between ${MIN_QUESTION_COUNT} and ${MAX_QUESTION_COUNT}, got "${input.questionCount}".`);
  }

  let timeLimitSecs = DEFAULT_TIME_LIMIT_SECS;
  if (input.timeLimitSecs !== undefined && input.timeLimitSecs !== null) {
    const parsed = Math.trunc(input.timeLimitSecs);
    if (!Number.isFinite(parsed) || parsed < MIN_TIME_LIMIT_SECS || parsed > MAX_TIME_LIMIT_SECS) {
      badInput(`timeLimitSecs must be between ${MIN_TIME_LIMIT_SECS} and ${MAX_TIME_LIMIT_SECS}, got "${input.timeLimitSecs}".`);
    }
    timeLimitSecs = parsed;
  }

  return {
    toUid: toUid!,
    subject: subject!,
    difficulty: difficulty as ValidDifficulty,
    questionCount,
    timeLimitSecs,
  };
}
