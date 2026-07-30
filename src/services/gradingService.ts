import { InvalidAnswerError } from '../utils/errors.js';
import type { ValidatedAnswer } from './quizValidation.js';
import type { BigQueryService } from './bigqueryService.js';


export interface QuestionGradeResult {
  questionId: string;
  selectedOption: string | null;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
  marks: number;
}
export interface GradingResult {
  results: QuestionGradeResult[];
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  score: number;
  scorePercent: number;
}

export async function gradeQuizSession(
  sessionQuestionIds: string[],
  submittedAnswers: ValidatedAnswer[],
  wrongPenalty: number,
  bigqueryService: BigQueryService
): Promise<GradingResult> {
  const sessionIdSet = new Set(sessionQuestionIds);
  for (const answer of submittedAnswers) {
    if (!sessionIdSet.has(answer.questionId)) {
      throw new InvalidAnswerError(`questionId "${answer.questionId}" is not part of this quiz session.`);
    }
  }

  const selectedByQuestionId = new Map(submittedAnswers.map((a) => [a.questionId, a.selectedOption]));

  const answerKeyRows = await bigqueryService.fetchAnswerKey(sessionQuestionIds);
  const answerKeyByQuestionId = new Map(answerKeyRows.map((r) => [r.questionId, r]));

  if (answerKeyByQuestionId.size < sessionQuestionIds.length) {
    const missing = sessionQuestionIds.filter((id) => !answerKeyByQuestionId.has(id));
    throw new Error(`Grading failed: ${missing.length} question(s) from this session no longer exist in BigQuery: ${missing.join(', ')}`);
  }

  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let score = 0;

  const results: QuestionGradeResult[] = sessionQuestionIds.map(
    (questionId) => {
      const key = answerKeyByQuestionId.get(questionId)!;
      const selectedOption = selectedByQuestionId.get(questionId) ?? null;

      let isCorrect = false;
      if (selectedOption === null) {
        skippedCount += 1;
      } else if (selectedOption === key.correctAnswer) {
        isCorrect = true;
        correctCount += 1;
        score += key.marks;
      } else {
        wrongCount += 1;
        score -= wrongPenalty;
      }

      return {
        questionId,
        selectedOption,
        correctAnswer: key.correctAnswer,
        explanation: key.explanation,
        isCorrect,
        marks: key.marks,
      };
    }
  );

  const totalQuestions = sessionQuestionIds.length;
  const scorePercent = totalQuestions > 0
    ? Math.round((correctCount/totalQuestions) * 10000) / 100
    : 0;

  return {
    results,
    correctCount,
    wrongCount,
    skippedCount,
    score,
    scorePercent,
  };
}
