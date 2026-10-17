<div align="center">

# MedQuel Server

### GraphQL API for gamified medical learning

<p>
	<a href="https://github.com/MedQuel/MedQuel-server/actions/workflows/ci.yml"><img src="https://github.com/MedQuel/MedQuel-server/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
	<a href="https://github.com/MedQuel/MedQuel-server"><img src="https://img.shields.io/badge/repository-MedQuel--server-1D6FE0" alt="Repository" /></a>
	<a href="https://github.com/MedQuel/MedQuel-server/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-2EA44F" alt="Apache 2.0 license" /></a>
	<a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D24-339933" alt="Node.js 24 or newer" /></a>
</p>

</div>

MedQuel Server is the authenticated GraphQL API for the MedQuel gamified medical learning platform. It coordinates Firebase Authentication, Firestore operational data, BigQuery question delivery and grading, Pub/Sub events, personalized study plans, contests, leaderboards, analytics, achievements, notifications, and social features.

The client and background Cloud Functions live in separate repositories:

- [MedQuel Client](https://github.com/MedQuel/MedQuel-client) — Expo and React Native application
- [MedQuel Cloud Functions](https://github.com/MedQuel/MedQuel-cloud-functions) — asynchronous workers and scheduled jobs

> **Status:** Active development. Android is the primary client platform. Deployments currently run in `asia-south1` for the `medquel-prod` project.

## Contents

- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Requirements](#requirements)
- [Local development](#local-development)
- [Configuration](#configuration)
- [API behavior](#api-behavior)
- [Deployment](#deployment)
- [Operations](#operations)
- [Quality gates](#quality-gates)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Architecture

```text
MedQuel Client (Expo / React Native)
								|
								v HTTPS
				Cloud Run: medquel-api
				Nginx -> Node.js + GraphQL
					|             |
					v             v
			Firestore      BigQuery
					|
					+--> Pub/Sub events --> MedQuel Cloud Functions
					|
					+--> Firebase Storage
```

The API is a modular monolith. GraphQL provides one authenticated entry point while domain services keep quiz, contest, study-plan, analytics, notification, and user behavior separated in code. Firestore stores operational state, BigQuery stores the question bank and analytical attempt data, and Pub/Sub keeps post-quiz work off the user-facing request path.

## Repository structure

```text
src/
	config/          Firebase Admin initialization
	graphql/         Schema definitions, context, and resolvers
	integrations/    Gemini client integration
	middleware/      Authentication and rate limiting
	pubsub/          Event publishers
	services/        Domain and persistence services
	types/           Shared domain types
	utils/           Errors, dates, and period helpers
	validators/      Input and AI-output validation
infra/             BigQuery schema and Cloud Monitoring alerts
scripts/           Firestore seed scripts
```

`firestore.rules`, `storage.rules`, `firestore.indexes.json`, and `firebase.json` are deployment inputs. `Dockerfile`, `nginx.conf`, and `docker-entrypoint.sh` define the Cloud Run container and its internal reverse proxy.

## Requirements

- Node.js 24 or newer
- npm
- Firebase project and Google Cloud project access
- Google Cloud CLI for deployment and Application Default Credentials for local Google API access

Authenticate locally without placing a service-account key in this repository:

```bash
gcloud auth application-default login
gcloud config set project medquel-prod
```

## Local development

```bash
npm ci
cp .env.example .env
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env` instead of `cp`. The API listens on port `4000` by default. Health and GraphQL endpoints are:

- `GET http://localhost:4000/health`
- `POST http://localhost:4000/graphql`

Local development uses Google Application Default Credentials. A credential file may be referenced through `GOOGLE_APPLICATION_CREDENTIALS`, but it must remain outside Git and outside Docker build context.

## Configuration

Copy [.env.example](.env.example) to `.env`. The important variables are:

| Variable                               | Purpose                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `FIREBASE_PROJECT_ID`                  | Firebase/GCP project ID                                                 |
| `BIGQUERY_DATASET`                     | BigQuery dataset containing questions                                   |
| `PUBSUB_TOPIC_QUIZ`                    | Topic for completed quiz events                                         |
| `PUBSUB_TOPIC_NOTIFICATIONS`           | Topic for notification requests                                         |
| `CORS_ALLOWED_ORIGINS`                 | Comma-separated production origins                                      |
| `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2` | Study-plan provider keys, supplied through Secret Manager in production |

Never commit `.env`, service-account JSON, API keys, payment secrets, or Firebase private credentials. `EXPO_PUBLIC_*` values belong in the client repository, not here.

## API behavior

Every GraphQL request may carry `Authorization: Bearer <Firebase ID token>`. The API verifies the token with Firebase Admin and resolvers enforce authentication, onboarding state, ownership, and premium access as needed.

Important flows include:

- onboarding and profile/preferences management
- question and topic discovery from BigQuery
- quiz sessions with server-side answer-key grading
- contest participation, challenge sessions, XP/EP, streaks, and levels
- leaderboards, analytics, achievements, notifications, friends, and study plans

Correct answers are never included in quiz-start payloads. They are read server-side during submission and returned only in the post-submission result.

## Deployment

The production API is deployed as the `medquel-api` Cloud Run service in `asia-south1`. The container starts Node.js on an internal port and Nginx on Cloud Run's public port `8080`.

Build and run the container locally:

```bash
docker build -t medquel-api .
docker run --rm -p 8080:8080 --env-file .env medquel-api
```

Deployments should be performed with a dedicated runtime service account, Secret Manager references, and an explicit region/project. Do not copy credentials into the image or use a downloaded service-account JSON in production.

Firebase rules and indexes can be deployed separately:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

The Cloud Functions repository owns scheduled jobs and background consumers. The current production scheduler topics include quiz events, contest generation/lifecycle, leaderboard rollups, weekly championship generation, streak checks, and weekly study-plan regeneration.

## Operations

Tracked operational inputs live in [infra](infra): BigQuery schema and Cloud Monitoring alert definitions for API latency, error rate, and CPU. Validate notification channel IDs and metric filters against the target GCP project before applying them.

Before a release, verify:

- Cloud Run revision health and service-account permissions
- Pub/Sub topics and Cloud Functions subscriptions
- Scheduler timezone and next-run time in `Asia/Kolkata`
- Firestore rules/indexes and Storage rules
- BigQuery dataset location and table schema
- Secret Manager versions and CORS origins

## Quality gates

```bash
npm ci
npm run check
npm test
```

GitHub Actions runs these checks for pushes and pull requests targeting `main`. Dependabot opens weekly npm updates and monthly GitHub Actions updates. The repository currently has no automated test cases; add focused tests for grading, authorization, ownership checks, date boundaries, idempotency, and failure/retry behavior before treating CI as a complete release gate.

## Security

Report vulnerabilities privately through the [security policy](SECURITY.md). Do not open public issues containing credentials, tokens, private user data, or production details.

If a credential is ever committed or shared outside Secret Manager, revoke and rotate it immediately, then remove it from Git history with an approved repository-maintenance process. Local ignore rules do not revoke a leaked credential.

## License

MedQuel Server is licensed under the Apache License 2.0. See [LICENSE](LICENSE).

<div align="center">Build with ❤️ by Team GrayCode.</div>
