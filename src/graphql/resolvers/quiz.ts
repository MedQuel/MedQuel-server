import type { GraphQLContext } from '../context.js';
import { startQuizSession } from '../../services/quizService.js';
import { type StartQuizSessionInput, validateStartQuizSessionInput } from '../../services/quizValidation.js';


export async function startQuizSessionResolver(
  _parent: unknown,
  args: { input: StartQuizSessionInput },
  context: GraphQLContext
) {
  const validated = validateStartQuizSessionInput(args.input);
  return startQuizSession(validated, context);
}
