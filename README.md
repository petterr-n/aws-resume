# petter-rn.no

A CV website that runs entirely serverless on AWS, deployed from GitHub Actions.
Live at **https://petter-rn.no**.

It began as the [Cloud Resume Challenge](https://cloudresumechallenge.dev/) and
has since grown a few things the challenge doesn't ask for: a scheduled data
hydrator, and a question-answering endpoint that answers from the CV itself.

Every AWS resource the site needs is defined in this repository. There is
nothing configured by hand, so any stack can be deleted and redeployed.

---

## Architecture

```
                        ┌──────────────────────────────┐
   Browser ──────────►  │  CloudFront  (petter-rn.no)  │
                        └──────────────┬───────────────┘
                                       │  one distribution, two origins
                        ┌──────────────┴───────────────┐
                        │                              │
                   /*   ▼                         /api/* ▼
              ┌──────────────────┐          ┌────────────────────┐
              │  S3 (private)    │          │  HTTP API          │
              │  OAC-restricted  │          │  (API Gateway v2)  │
              └────────┬─────────┘          └─────────┬──────────┘
                       │                              │
             built site + data/          ┌────────────┴────────────┐
                       ▲                 ▼                         ▼
                       │        ┌─────────────────┐      ┌──────────────────┐
                       │        │ visitor Lambda  │      │   ask Lambda     │
                       │        │  GET /api/      │      │  POST /api/ask   │
                       │        │      visitor    │      └────────┬─────────┘
                       │        └────────┬────────┘               │
                       │                 ▼                        ▼
                       │        ┌─────────────────┐   ┌──────────────────────┐
                       │        │ DynamoDB        │   │ DynamoDB (rate       │
                       │        │ visitor count   │   │ limits, TTL)         │
                       │        └─────────────────┘   │ Bedrock: Claude      │
                       │                              │ Haiku 4.5            │
                       │                              └──────────────────────┘
                       │
              ┌────────┴─────────┐         ┌───────────────────────┐
              │ hydrator Lambda  │ ◄────── │  EventBridge Scheduler │
              │ writes           │         │  every 30 minutes      │
              │ data/results.json│         └───────────────────────┘
              └────────┬─────────┘
                       ▼
              F1 (jolpica) · Premier League (football-data.org)
```

Because the API is served from `/api/*` on the **same** distribution as the
site, the browser never makes a cross-origin request. There is no CORS
configuration anywhere in this repository — not a narrowed one, none — and API
traffic falls under CloudFront's free tier rather than API Gateway's
per-request price.

### Stacks

| Stack | What it holds |
|---|---|
| `resume-app-bootstrap` | GitHub OIDC provider, scoped deploy role, SAM artifacts bucket |
| `resume-app-stack` | HTTP API, three Lambdas, two DynamoDB tables, alarms |
| `resume-app-cdn` | Site bucket, bucket policy, CloudFront distribution |

The CDN stack was **imported** rather than recreated. A CloudFront alias can
only be attached to one distribution at a time, so rebuilding would have meant
releasing `petter-rn.no`, waiting out a new deployment and repointing DNS — with
the site down throughout and nothing gained. A resource import adopts the
existing resources in place instead, without modifying them.

---

## Design decisions worth explaining

**No long-lived AWS credentials exist.** GitHub Actions assumes a role via
OIDC, scoped to `resume-app-*` stacks and roles rather than to the account.
There are no IAM users, no access keys, and no AWS secrets in the repository
settings.

**The results panel is hydrated, not proxied.** An earlier version called
third-party sports APIs synchronously on every page load, so a visitor paid the
upstream latency, an upstream outage became a visible error, and every visitor
consumed third-party quota. Now a scheduled Lambda writes `data/results.json`
to S3 and CloudFront serves it: **zero Lambda invocations on the read path.**
When a feed is unreachable the previous value is kept along with the time it
was fetched, so the page shows the last known result and says how old it is.

**The Q&A endpoint has no vector database.** The whole CV is about two thousand
tokens, so it goes into the system prompt behind a Bedrock cache point rather
than through a retrieval pipeline. For a document this size, retrieval would
cost more to run, more to maintain, and answer no better. The model is
instructed to answer only from the data and to say when something is not in the
CV — this page reads as authoritative to a recruiter, so a plausible invention
about employment history is the worst failure available.

**Two independent limits bound the Q&A cost.** A per-visitor limit is a
courtesy; it cannot bound spend, because addresses are cheap and a determined
caller has many. The global daily limit is the actual ceiling on the bill. Both
are claimed with conditional DynamoDB updates, so simultaneous requests cannot
both pass the same check, and a request that fails or is refused has its quota
refunded — quota exists to bound cost and stop abuse, and a failure on our side
is neither.

**Rate limiting never trusts `X-Forwarded-For`.** Through CloudFront it is
appended to whatever the client sent; on a direct call to the API it is
entirely client-supplied. Identity comes from `CloudFront-Viewer-Address`
(CloudFront-generated) or the request's `sourceIp` (the TCP peer), neither of
which the caller controls. Addresses are never stored — only a hash salted per
stack and rotated daily.

**Values that encode policy are not CloudFormation Parameters.** `sam deploy`
carries a stack's previous parameter values forward for anything not explicitly
overridden, so changing a `Default` has no effect on an existing stack. Rate
limits and the model id are plain values, applied on every deploy.

---

## Repository layout

```
template.yaml                API, Lambdas, tables, alarms
cdn.yaml                     site bucket and CloudFront (imported)
bootstrap/github-oidc.yaml   OIDC trust, deploy role, artifacts bucket
src/visitor/                 visitor counter
src/hydrator/                scheduled results publisher
src/ask/                     CV question answering
tests/                       31 tests against mocked AWS
website/                     React + Vite frontend
  src/content/cv.json          single source of truth for CV content
```

`cv.json` is the content model: the site renders from it, and the build copies
it to the site bucket so the ask Lambda reads the same file rather than a
second copy that could drift out of step with it.
