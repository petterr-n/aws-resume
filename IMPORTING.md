# Importing the CDN into CloudFormation

`cdn.yaml` describes the S3 site bucket and the CloudFront distribution for
petter-rn.no. Both were created by hand before the template existed, so they
are adopted with a **resource import** rather than deployed normally.

## Why import instead of recreate

A CloudFront alias (`petter-rn.no`) can only be attached to one distribution at
a time. Recreating would mean removing the alias from the live distribution,
creating a new one, waiting for it to deploy, and repointing DNS — with the
site down in between, and no benefit at the end. Import adopts the existing
resources in place. Nothing is modified.

## The rule that matters

**On import, the template must describe the resources exactly as they already
are.** CloudFormation does not reconcile differences during an import; it
records the template as the desired state. Any property you got wrong is
applied as a change on the *next* stack update — which is how an import turns
into an unplanned outage weeks later.

Every property in `cdn.yaml` was read from the live resources with
`get-distribution-config` and `get-bucket-policy`, not chosen. That includes
things worth changing later (`http1.1`, `IPV6Enabled: false`, the deprecated
`ForwardedValues` block, IAM policy version `2008-10-17`). They are recorded
as-is deliberately. Improve them *after* the import, as ordinary updates.

Every resource also needs `DeletionPolicy: Retain`, which CloudFormation
requires for import. A useful side effect: deleting this stack detaches these
resources instead of destroying the site.

An import template also cannot contain an `Outputs` section — CloudFormation
rejects the change set with "you cannot modify or add [Outputs]". Add outputs
in the first ordinary update after the import completes.

## Running the import

```bash
REGION=eu-north-1
STACK=resume-app-cdn

cat > /tmp/resources.json <<'JSON'
[
  {"ResourceType":"AWS::S3::Bucket",
   "LogicalResourceId":"SiteBucket",
   "ResourceIdentifier":{"BucketName":"cloud-resume-challenge-petterr-n"}},
  {"ResourceType":"AWS::S3::BucketPolicy",
   "LogicalResourceId":"SiteBucketPolicy",
   "ResourceIdentifier":{"Bucket":"cloud-resume-challenge-petterr-n"}},
  {"ResourceType":"AWS::CloudFront::Distribution",
   "LogicalResourceId":"Distribution",
   "ResourceIdentifier":{"Id":"EIZCK6U4R49G3"}}
]
JSON

aws cloudformation create-change-set \
  --stack-name "$STACK" --change-set-name import-cdn \
  --change-set-type IMPORT --region "$REGION" \
  --template-body file://cdn.yaml \
  --resources-to-import file:///tmp/resources.json \
  --capabilities CAPABILITY_IAM

aws cloudformation execute-change-set \
  --stack-name "$STACK" --change-set-name import-cdn --region "$REGION"

aws cloudformation wait stack-import-complete \
  --stack-name "$STACK" --region "$REGION"
```

## Verify before trusting it

Drift detection is the check that the template actually matches reality. Run it
immediately; a `MODIFIED` result means a property was recorded wrong and must
be corrected in the template *before* any other change is applied.

```bash
ID=$(aws cloudformation detect-stack-drift --stack-name "$STACK" \
       --region "$REGION" --query StackDriftDetectionId --output text)

aws cloudformation describe-stack-resource-drifts \
  --stack-name "$STACK" --region "$REGION" \
  --query 'StackResourceDrifts[].{R:LogicalResourceId,S:StackResourceDriftStatus}' \
  --output table
```

Expected: every resource `IN_SYNC`. Note that `AWS::S3::BucketPolicy` does not
support drift detection, so it will not appear in the results at all — that is
a gap in CloudFormation, not a failed import.

Result of the 2026-08-20 import: `Distribution` and `SiteBucket` both `IN_SYNC`.

## Deploy permissions

The bootstrap deploy role (`bootstrap/github-oidc.yaml`) does not currently
grant CloudFront or S3 bucket-policy write access. If this stack is to be
deployed from CI rather than locally, that role needs
`cloudfront:*Distribution*`, `s3:PutBucketPolicy`, and
`s3:PutBucketPublicAccessBlock` on these resources. Until then, deploy it
locally with your SSO credentials.
