# Security Policy

## Branch Protection

Branch protection rules applied to `main` via GitHub REST API (`PUT /repos/jclekkas/Odigos/branches/main/protection`):

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["test", "test:api", "test:components", "test:unit"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

## Audit Log

Security-relevant events are written to the `audit_log` table. Raw IP addresses and user-agent strings are never persisted — only their SHA-256 hashes are stored.

| Event type | When |
|---|---|
| `analyze` | Every deal analysis attempt (success and failure) |
| `payment` | Stripe webhook events (after signature verification) |
| `admin_action` | Admin API access |
| `rate_limit_breach` | When a rate limit is exceeded |

Admin endpoint: `GET /api/admin/audit-log` — requires `x-admin-key` header.
