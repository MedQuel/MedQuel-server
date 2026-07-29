import { BigQuery } from '@google-cloud/bigquery';


export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export interface FetchQuestionsFilters {
  subject: string;
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
  questionType: string;
  marks: number;
}

export const MAX_QUESTION_COUNT = 50;
const ALLOWED_DIFFICULTIES: ReadonlySet<string> = new Set(['easy', 'medium', 'hard']);


export class BigQueryService {
  private readonly bigquery: BigQuery;

  constructor(private readonly projectId: string, private readonly datasetId: string) {
    this.bigquery = new BigQuery({ projectId });
  }

  async fetchQuestions(filters: FetchQuestionsFilters): Promise<QuestionForQuiz[]> {
    const { subject, difficulty, includePremium } = filters;

    if (!subject?.trim()) throw new Error('subject is required');
    if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
      throw new Error(`difficulty must be one of easy/medium/hard, got "${difficulty}"`);
    }
    const questionCount = Math.min(Math.max(Math.trunc(filters.questionCount), 1), MAX_QUESTION_COUNT);

    // NEVER select correct_answer or explanation here, this result goes straight to the client.
    const query = `
      SELECT question_id, question_text, option_a, option_b, option_c, option_d, image_url, question_type, marks
      FROM \`${this.projectId}.${this.datasetId}.questions\`
      WHERE subject = @subject
        AND difficulty = @difficulty
        AND is_active = TRUE
        AND (is_premium = FALSE OR @includePremium = TRUE)
      ORDER BY RAND()
      LIMIT @questionCount
    `;

    const [rows] = await this.bigquery.query({
      query,
      params: { subject, difficulty, includePremium, questionCount },
      types: { subject: 'STRING', difficulty: 'STRING', includePremium: 'BOOL', questionCount: 'INT64' },
    });

    return rows.map((row) => ({
      questionId: row.question_id,
      questionText: row.question_text,
      optionA: row.option_a,
      optionB: row.option_b,
      optionC: row.option_c,
      optionD: row.option_d,
      imageUrl: row.image_url ?? null,
      questionType: row.question_type,
      marks: row.marks,
    }));
  }

  async fetchQuestionsByIds(questionIds: string[]): Promise<QuestionForQuiz[]> {
    if (questionIds.length === 0) return [];

    // Same column list as fetchQuestions — correct_answer/explanation are never selected here either.
    const query = `
      SELECT question_id, question_text, option_a, option_b, option_c, option_d, image_url, question_type, marks
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
      questionType: row.question_type,
      marks: row.marks,
    }));
  }
}
