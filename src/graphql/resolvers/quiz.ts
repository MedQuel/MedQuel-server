import {
  type StartQuizSessionInput,
  type SubmitQuizSessionInput,
  validateStartQuizSessionInput,
  validateSubmitQuizSessionInput,
} from '../../services/quizValidation.js';
import type { GraphQLContext } from '../context.js';
import { startQuizSession, submitQuizSession } from '../../services/quizService.js';


export async function startQuizSessionResolver(_parent: unknown, args: { input: StartQuizSessionInput }, context: GraphQLContext) {
  const validated = validateStartQuizSessionInput(args.input);
  return startQuizSession(validated, context);
}

export async function submitQuizSessionResolver(_parent: unknown, args: { input: SubmitQuizSessionInput }, context: GraphQLContext) {
  const validated = validateSubmitQuizSessionInput(args.input);
  return submitQuizSession(validated, context);
}
