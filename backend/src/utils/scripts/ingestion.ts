export const alerts = [
  {
    source: "aws",
    severity: "critical",
    message: `ALARM: "prod-api-latency" in us-east-1
StateChangeTime: 2026-06-10T08:23:11.000Z
OldStateValue: OK
NewStateValue: ALARM
Threshold: 2000ms
MetricName: Latency
Namespace: AWS/ApiGateway
Dimensions: Stage=prod, ApiName=user-service
EvaluationPeriods: 3
DatapointsToAlarm: 3
CurrentValue: 8743ms`,
  },
  {
    source: "aws",
    severity: "critical",
    message: `type: UnauthorizedAccess:IAMUser/MaliciousIPCaller
severity: 8.0
accountId: 123456789012
region: eu-west-1
resource.accessKeyDetails.userName: deploy-bot
service.action.awsApiCallAction.api: AssumeRole
service.action.awsApiCallAction.remoteIpDetails.ipAddressV4: 185.220.101.45
service.count: 14
first_seen: 2026-06-10T07:01:00Z
last_seen: 2026-06-10T08:45:00Z`,
  },
  {
    source: "aws",
    severity: "critical",
    message: `2026-06-10T09:12:03Z [ERROR] container exited with code 137 (OOMKilled)
2026-06-10T09:12:04Z Task arn:aws:ecs:us-east-1:123456789012:task/prod/a3f9c stopped
2026-06-10T09:12:10Z [INFO] Starting replacement task...
2026-06-10T09:12:44Z [ERROR] container exited with code 137 (OOMKilled)
2026-06-10T09:12:45Z Task arn:aws:ecs:us-east-1:123456789012:task/prod/b7d2e stopped
2026-06-10T09:12:51Z [INFO] Starting replacement task...
2026-06-10T09:13:22Z [ERROR] container exited with code 137 (OOMKilled)
Service: payment-processor | Cluster: prod-cluster | Desired: 3 | Running: 0`,
  },
  {
    source: "aws",
    severity: "critical",
    message: `EventSource: db.t3.medium (prod-postgres-01)
EventCategory: availability
Message: DB instance stopped due to storage-full condition
AllocatedStorage: 100 GB
FreeStorageSpace: 0 bytes
Region: us-west-2
Time: 2026-06-10T06:58:22Z
MultiAZ: false
BackupRetentionPeriod: 7
LastSuccessfulBackup: 2026-06-09T02:00:00Z`,
  },
  {
    source: "aws",
    severity: "critical",
    message: `eventTime: 2026-06-10T05:30:01Z
eventName: DeleteBucket
eventSource: s3.amazonaws.com
userIdentity.type: IAMUser
userIdentity.userName: temp-contractor-04
requestParameters.bucketName: prod-customer-exports
sourceIPAddress: 203.0.113.77
userAgent: aws-cli/2.9.0
errorCode: (none)
additionalEventData.DeleteMarkerCreated: false`,
  },
  {
    source: "aws",
    severity: "critical",
    message: `2026-06-10T10:01:00Z 203.0.113.0 GET /api/v1/login 429 0.001s
2026-06-10T10:01:00Z 203.0.113.1 GET /api/v1/login 429 0.001s
... (2,847 similar entries in 60 seconds from /20 CIDR block)
2026-06-10T10:01:00Z target_group/prod-backend: healthy=2 unhealthy=3
RequestCount last 1min: 18,400 (baseline: 320)
HTTPCode_ELB_5XX_Count: 1,203`,
  },
  {
    source: "gcp",
    severity: "critical",
    message: `ALERT: Cloud Run service checkout-api (us-central1) - revision checkout-api-00041
2026-06-10T11:14:02Z [ERROR] Cloud Spanner session pool exhausted. Timeout after 30s waiting for session.
2026-06-10T11:14:02Z [ERROR] Transaction aborted: RESOURCE_EXHAUSTED retries=5
2026-06-10T11:14:03Z [WARN] Request queue depth: 4,200. Concurrency limit: 250.
Instance count: 12/12 (max). Container CPU throttling: 94%.
Unhandled errors last 5min: 1,847. Error rate: 68.4%`,
  },
  {
    source: "gcp",
    severity: "warning",
    message: `GCP Security Command Center - MEDIUM severity finding
category: EXPOSED_SERVICE_ACCOUNT_KEY
resource: projects/prod-infra-339812/serviceAccounts/ci-deploy@prod-infra-339812.iam
finding_time: 2026-06-10T04:17:33Z
explanation: Service account key committed to public GitHub repository
repository: github.com/org/infra-scripts (commit 9a3f1bc)
key_age_days: 312
last_used: 2026-06-10T03:58:00Z
recommended_action: Disable key immediately, rotate credentials, audit recent usage`,
  },
  {
    source: "azure",
    severity: "critical",
    message: `Azure Service Bus - Namespace: prod-eventing-euw
2026-06-10T12:03:11Z Dead letter queue threshold breached
Queue: order-fulfillment
DeadLetterCount: 14,302 (threshold: 1,000)
ActiveMessageCount: 0
IncomingMessages last 1hr: 0 (baseline: 8,400/hr)
2026-06-10T12:03:11Z [ERROR] MessageLockLostException on consumer: fulfillment-worker-3
2026-06-10T12:03:12Z [ERROR] MessageLockLostException on consumer: fulfillment-worker-1
2026-06-10T12:03:12Z [ERROR] MessageLockLostException on consumer: fulfillment-worker-2
All fulfillment-worker instances reporting unhealthy. Orders processing halted.`,
  },
  {
    source: "azure",
    severity: "warning",
    message: `Azure Monitor Alert - Key Vault: prod-secrets-euw (westeurope)
AlertTime: 2026-06-10T09:44:00Z
PolicyViolation: Secret expiry within 7 days
Affected secrets (4):
  - db-prod-connection-string (expires 2026-06-14)
  - stripe-api-key-prod (expires 2026-06-15)
  - sendgrid-smtp-password (expires 2026-06-16)
  - jwt-signing-secret (expires 2026-06-17)
Last rotation: 365 days ago. Auto-rotation: disabled.
Dependent services: api-gateway, payment-service, notification-service, auth-service`,
  },
];

export async function sendAlert(alert: (typeof alerts)[0]) {
  const res = await fetch("http://localhost:3000/incidents/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alert),
  });
  console.log(`Sent "${alert.message}" — status: ${res.status}`);
}
