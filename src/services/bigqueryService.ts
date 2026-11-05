import { BigQuery } from '@google-cloud/bigquery';
import { MAX_QUESTION_COUNT } from '../utils/limits.js';


export type QuizDifficulty = 'easy' | 'medium' | 'hard';
const ALLOWED_DIFFICULTIES: ReadonlySet<string> = new Set([
  'easy',
  'medium',
  'hard',
]);
const DIFFICULTY_RANK: Record<QuizDifficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export interface FetchQuestionsFilters {
  subject: string;
  topic?: string | null;
  difficulty: QuizDifficulty;
  questionCount: number;
  includePremium: boolean;
}
export interface QuestionForQuiz {
  questionId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  imageUrl: string | null;
  difficulty: QuizDifficulty;
  questionType: string;
  marks: number;
}
export interface FetchQuestionsResult {
  questions: QuestionForQuiz[];
  fallbackApplied: boolean;
}
export interface AnswerKeyRow {
  questionId: string;
  correctAnswer: string;
  explanation: string;
  marks: number;
}


export class BigQueryService {
  private readonly bigquery: BigQuery;

  constructor(private readonly projectId: string, private readonly datasetId: string) {
    this.bigquery = new BigQuery({ projectId });
  }

  private async queryQuestionStage(args: {
    subject: string;
    topic: string | null;
    difficulty: QuizDifficulty | null;
    targetDifficulty: QuizDifficulty;
    includePremium: boolean;
    excludeIds: string[];
    limit: number;
  }): Promise<QuestionForQuiz[]> {
    const query = `
      SELECT question_id, question_text, option_a, option_b, option_c, option_d, image_url, difficulty, question_type, marks
      FROM \`${this.projectId}.${this.datasetId}.questions\`
      WHERE subject = @subject
        AND (@topic IS NULL OR topic = @topic)
        AND (@difficulty IS NULL OR difficulty = @difficulty)
        AND is_active = TRUE
        AND (is_premium = FALSE OR @includePremium = TRUE)
        AND question_id NOT IN UNNEST(@excludeIds)
      ORDER BY
        ABS((CASE difficulty WHEN 'easy' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END) - @targetRank),
        RAND()
      LIMIT @limit
    `;

    const [rows] = await this.bigquery.query({
      query,
      params: {
        subject: args.subject,
        topic: args.topic,
        difficulty: args.difficulty,
        includePremium: args.includePremium,
        excludeIds: args.excludeIds,
        targetRank: DIFFICULTY_RANK[args.targetDifficulty],
        limit: args.limit,
      },
      types: {
        subject: 'STRING',
        topic: 'STRING',
        difficulty: 'STRING',
        includePremium: 'BOOL',
        excludeIds: ['STRING'],
        targetRank: 'INT64',
        limit: 'INT64',
      },
    });

    return rows.map((row) => ({
      questionId: row.question_id,
      questionText: row.question_text,
      optionA: row.option_a,
      optionB: row.option_b,
      optionC: row.option_c,
      optionD: row.option_d,
      imageUrl: row.image_url ?? null,
      difficulty: row.difficulty,
      questionType: row.question_type,
      marks: row.marks,
    }));
  }

  async fetchQuestionsWithFallback(filters: FetchQuestionsFilters): Promise<FetchQuestionsResult> {
    const { subject, topic, difficulty, includePremium } = filters;

    if (!subject?.trim()) throw new Error('subject is required');
    if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
      throw new Error(`difficulty must be one of easy/medium/hard, got "${difficulty}"`);
    }

    const questionCount = Math.min(
      Math.max(Math.trunc(filters.questionCount), 1),
      MAX_QUESTION_COUNT
    );
    const requestedTopic = topic?.trim() ? topic.trim() : null;

    const stages: Array<{
      topic: string | null;
      difficulty: QuizDifficulty | null;
    }> = [
      { topic: requestedTopic, difficulty },
      ...(requestedTopic ? [{ topic: requestedTopic, difficulty: null }] : []),
      { topic: null, difficulty: null },
    ];

    const collected: QuestionForQuiz[] = [];
    let fallbackApplied = false;

    for (const [index, stage] of stages.entries()) {
      const remaining = questionCount - collected.length;
      if (remaining <= 0) break;

      const found = await this.queryQuestionStage({
        subject,
        topic: stage.topic,
        difficulty: stage.difficulty,
        targetDifficulty: difficulty,
        includePremium,
        excludeIds: collected.map((q) => q.questionId),
        limit: remaining,
      });

      if (index > 0 && found.length > 0) fallbackApplied = true;
      collected.push(...found);
    }

    if (fallbackApplied) {
      for (let i=collected.length-1; i>0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [collected[i], collected[j]] = [collected[j]!, collected[i]!];
      }
    }

    return { questions: collected, fallbackApplied };
  }

  // Kept for existing callers (challenges): same behaviour, array result.
  async fetchQuestions(filters: FetchQuestionsFilters): Promise<QuestionForQuiz[]> {
    return (await this.fetchQuestionsWithFallback(filters)).questions;
  }

  async fetchQuestionsByIds(questionIds: string[]): Promise<QuestionForQuiz[]> {
    if (questionIds.length === 0) return [];

    const query = `
      SELECT question_id, question_text, option_a, option_b, option_c, option_d, image_url, difficulty, question_type, marks
      FROM \`${this.projectId}.${this.datasetId}.questions\`
      WHERE question_id IN UNNEST(@questionIds) AND is_active = TRUE
    `;

    const [rows] = await this.bigquery.query({
      query,
      params: { questionIds },
      types: { questionIds: ['STRING'] },
    });

    return rows.map((row) => ({
      questionId: row.question_id,
      questionText: row.question_text,
      optionA: row.option_a,
      optionB: row.option_b,
      optionC: row.option_c,
      optionD: row.option_d,
      imageUrl: row.image_url ?? null,
      difficulty: row.difficulty,
      questionType: row.question_type,
      marks: row.marks,
    }));
  }

  async fetchAnswerKey(questionIds: string[]): Promise<AnswerKeyRow[]> {
    if (questionIds.length === 0) return [];

    const query = `
      SELECT question_id, correct_answer, explanation, marks
      FROM \`${this.projectId}.${this.datasetId}.questions\`
      WHERE question_id IN UNNEST(@questionIds)
    `;

    const [rows] = await this.bigquery.query({
      query,
      params: { questionIds },
      types: { questionIds: ['STRING'] },
    });

    return rows.map((row) => ({
      questionId: row.question_id,
      correctAnswer: row.correct_answer,
      explanation: row.explanation ?? '',
      marks: row.marks,
    }));
  }

  async fetchTopicsForSubject(subject: string): Promise<string[]> {
    const query = `
      SELECT DISTINCT topic
      FROM \`${this.projectId}.${this.datasetId}.questions\`
      WHERE subject = @subject AND is_active = TRUE
      ORDER BY topic
    `;
    const [rows] = await this.bigquery.query({
      query,
      params: { subject },
      types: { subject: 'STRING' },
    });

    return rows.map((r) => r.topic as string);
  }
}
