import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import { getStudyPlan, generateStudyPlan } from '../../services/studyPlanService.js';
import type { GenerateStudyPlanInput } from '../../validators/studyPlanValidation.js';
import { markStudySessionComplete } from '../../services/studyPlan/studyPlanProgress.js';


export async function getStudyPlanResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  return getStudyPlan(context.user.uid, context.db);
}

export async function generateStudyPlanResolver(
  _parent: unknown,
  args: { input: GenerateStudyPlanInput },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();
  return generateStudyPlan(context.user.uid, args.input, context.db);
}

export async function markStudySessionCompleteResolver(
  _parent: unknown,
  args: { sessionId: string; quizSessionId?: string | null },
  context: GraphQLContext
) {
  if (!context.user) throw new AuthenticationError();
  return markStudySessionComplete(
    context.user.uid,
    args.sessionId,
    args.quizSessionId ?? null,
    context.db
  );
}
