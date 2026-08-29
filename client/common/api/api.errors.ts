export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'NOT_ONBOARDED'
  | 'SERVER_ERROR'
  | 'GRAPHQL_ERROR'
  | 'NOT_IMPLEMENTED'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'UNKNOWN';


export class ApiError extends Error {
  code: ApiErrorCode;
  statusCode?: number;
  details?: unknown;

  constructor(code: ApiErrorCode, message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Unable to reach the server. Check your connection.') {
    super('NETWORK_ERROR', message);
    this.name = 'NetworkError';
  }
}
export class TimeoutError extends ApiError {
  constructor(message = 'The request took too long to respond.') {
    super('TIMEOUT', message);
    this.name = 'TimeoutError';
  }
}
export class AuthenticationError extends ApiError {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super('UNAUTHENTICATED', message, 401);
    this.name = 'AuthenticationError';
  }
}
export class AuthorizationError extends ApiError {
  constructor(message = 'You do not have access to this feature.') {
    super('FORBIDDEN', message, 403);
    this.name = 'AuthorizationError';
  }
}
export class ValidationError extends ApiError {
  constructor(message = 'Some of the information provided is invalid.', details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}
export class NotFoundError extends ApiError {
  constructor(message = 'The requested resource was not found.') {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}
export class NotOnboardedError extends ApiError {
  constructor(message = 'Onboarding has not been completed yet.') {
    super('NOT_ONBOARDED', message, 404);
    this.name = 'NotOnboardedError';
  }
}
export class ServerError extends ApiError {
  constructor(message = 'Something went wrong on our end. Please try again.', statusCode = 500) {
    super('SERVER_ERROR', message, statusCode);
    this.name = 'ServerError';
  }
}
export class NotImplementedError extends ApiError {
  constructor(message = 'This feature is not available yet.') {
    super('NOT_IMPLEMENTED', message, 501);
    this.name = 'NotImplementedError';
  }
}
export class ConflictError extends ApiError {
  constructor(message = 'This action conflicts with the current state.', details?: unknown) {
    super('CONFLICT', message, 409, details);
    this.name = 'ConflictError';
  }
}
export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests. Please slow down and try again shortly.') {
    super('RATE_LIMITED', message, 429);
    this.name = 'RateLimitError';
  }
}

export class ProfilePhotoUploadError extends ApiError {
  constructor(message: string) {
    super('UNKNOWN', message);
    this.name = 'ProfilePhotoUploadError';
  }
}


export interface GraphQLErrorItem {
  message: string;
  path?: (string | number)[];
  extensions?: { code?: string; [key: string]: unknown };
}
export class GraphQLOperationError extends ApiError {
  graphQLErrors: GraphQLErrorItem[];

  constructor(graphQLErrors: GraphQLErrorItem[]) {
    super('GRAPHQL_ERROR', graphQLErrors[0]?.message ?? 'GraphQL request failed');
    this.name = 'GraphQLOperationError';
    this.graphQLErrors = graphQLErrors;
  }
}


/** Apollo Server extension codes we map to specific ApiError subtypes. */
function fromGraphQLErrors(errors: GraphQLErrorItem[]): ApiError {
  const first = errors[0];
  const code = first?.extensions?.code;
  const message = first?.message ?? 'GraphQL request failed';

  switch (code) {
    case 'UNAUTHENTICATED':
      return new AuthenticationError(message);
    case 'FORBIDDEN':
      return new AuthorizationError(message);
    case 'BAD_USER_INPUT':
      return new ValidationError(message, errors);
    case 'GRAPHQL_VALIDATION_FAILED':
      return new ValidationError(message, errors);
    case 'NOT_ONBOARDED':
      return new NotOnboardedError(message);
    case 'CONFLICT':
      return new ConflictError(message, errors);
    case 'NOT_FOUND':
      return new NotFoundError(message);
    case 'NOT_IMPLEMENTED':
      return new NotImplementedError(message);
    case 'RATE_LIMITED':
      return new RateLimitError(message);
    default:
      return new GraphQLOperationError(errors);
  }
}


/** Normalizes anything thrown during a request into a single ApiError instance. */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (Array.isArray(error) && error.length > 0 && typeof (error[0] as any)?.message === 'string') {
    return fromGraphQLErrors(error as GraphQLErrorItem[]);
  }

  const anyErr = error as any;
  if (anyErr?.isAxiosError) {
    if (anyErr.code === 'ECONNABORTED') return new TimeoutError();
    if (!anyErr.response) return new NetworkError();

    const status = anyErr.response.status as number;
    const body = anyErr.response.data;
    if (body?.errors) return fromGraphQLErrors(body.errors);
    if (status === 401) return new AuthenticationError();
    if (status === 403) return new AuthorizationError();
    if (status === 404) return new NotFoundError();
    if (status === 409) return new ConflictError();
    if (status >= 500) return new ServerError(undefined, status);

    return new ApiError('UNKNOWN', anyErr.message ?? 'Request failed', status);
  }

  if (error instanceof Error) return new ApiError('UNKNOWN', error.message);

  return new ApiError('UNKNOWN', 'An unexpected error occurred.');
}

/** True when the GraphQL error is Apollo's standard "field/argument doesn't exist on the schema" message. */
function isUndeployedSchemaField(error: ApiError): boolean {
  if (!(error instanceof GraphQLOperationError)) return false;

  return error.graphQLErrors.some((e) =>
    /cannot query field|unknown field|unknown argument|unknown type/i.test(e.message)
  );
}

/**
 * Errors that are safe to silently paper over with mock data:
 * the endpoint doesn't exist on the backend yet, or the network/server is genuinely unreachable.
 */
export function isFallbackEligible(error: ApiError): boolean {
  if (error instanceof NetworkError || error instanceof TimeoutError || error instanceof ServerError || error instanceof NotImplementedError) {
    return true;
  }
  if (isUndeployedSchemaField(error)) return true;

  return false;
}

/**
 * Distinguishes "this whole feature isn't built yet" (expected) from "this feature is built but something broke" (a real bug),
 * purely for the dev-mode warning in api.ts. Production never logs this.
 */
export function isUnshippedFeature(error: ApiError): boolean {
  return error instanceof NotImplementedError || isUndeployedSchemaField(error);
}
