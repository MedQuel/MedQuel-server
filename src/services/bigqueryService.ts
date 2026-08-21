import { BigQuery } from '@google-cloud/bigquery';


export const MAX_QUESTION_COUNT = 50;
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
const ALLOWED_DIFFICULTIES: ReadonlySet<string> = new Set(['easy', 'medium', 'hard']);
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

  async fetchQuestions(filters: FetchQuestionsFilters): Promise<QuestionForQuiz[]> {
    const { subject, topic, difficulty, includePremium } = filters;

    if (!subject?.trim()) throw new Error('subject is required');
    if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
      throw new Error(`difficulty must be one of easy/medium/hard, got "${difficulty}"`);
    }
    const questionCount = Math.min(Math.max(Math.trunc(filters.questionCount), 1), MAX_QUESTION_COUNT);

    const query = `
      SELECT question_id, question_text, option_a, option_b, option_c, option_d, image_url, difficulty, question_type, marks
      FROM \`${this.projectId}.${this.datasetId}.questions\`
      WHERE subject = @subject
        AND (@topic IS NULL OR topic = @topic)
        AND difficulty = @difficulty
        AND is_active = TRUE
        AND (is_premium = FALSE OR @includePremium = TRUE)
      ORDER BY RAND()
      LIMIT @questionCount
    `;

    const [rows] = await this.bigquery.query({
      query,
      params: { subject, topic: topic ?? null, difficulty, includePremium, questionCount },
      types: { subject: 'STRING', topic: 'STRING', difficulty: 'STRING', includePremium: 'BOOL', questionCount: 'INT64' },
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
