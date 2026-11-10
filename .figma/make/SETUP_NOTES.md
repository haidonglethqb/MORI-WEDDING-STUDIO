# Figma Make setup notes

## Deployment limitation

MORI is a custom full-stack deployment:

- Next.js uses dynamic server rendering and route handlers.
- NestJS owns application APIs and business rules.
- PostgreSQL is required for durable application data.
- Production is deployed with the repository's Docker Compose workflow.

The project does not produce a static site artifact, and it is not the
platform-generated Payload/Next.js template supported by Figma's server deploy
preview adapter. Creating a static or guessed Lambda adapter would omit the
NestJS and PostgreSQL services and misrepresent the application.

`figma make verify-deploy-preview --skip` is therefore the safe preview outcome.
Figma publishing remains unsupported; use the documented Docker deployment.
