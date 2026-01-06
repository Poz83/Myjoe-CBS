# API Contracts

## Base URL

```
Production: https://myjoe.app/api
Development: http://localhost:3000/api
```

## Authentication

All endpoints require authentication via Supabase session cookie (automatic in browser).

---

## Projects

### List Projects

```
GET /api/projects
```

**Response 200:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Bella's Adventure",
      "status": "ready",
      "pageCount": 40,
      "audience": "children",
      "stylePreset": "kawaii",
      "heroId": "uuid | null",
      "thumbnailUrl": "https://...",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Create Project

```
POST /api/projects
```

**Request:**
```json
{
  "name": "Bella's Adventure",
  "pageCount": 40,
  "audience": "children",
  "stylePreset": "kawaii",
  "trimSize": "8.5x11",
  "heroId": "uuid | null"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "name": "Bella's Adventure",
  "status": "draft",
  ...
}
```

### Get Project

```
GET /api/projects/[id]
```

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Bella's Adventure",
  "status": "ready",
  "pageCount": 40,
  "audience": "children",
  "stylePreset": "kawaii",
  "lineWeight": "thick",
  "complexity": "moderate",
  "heroId": "uuid | null",
  "hero": { ... } | null,
  "styleAnchorUrl": "https://...",
  "pages": [
    {
      "id": "uuid",
      "sortOrder": 1,
      "pageType": "illustration",
      "currentVersion": 2,
      "sceneBrief": "Bella discovers the forest",
      "thumbnailUrl": "https://...",
      "imageUrl": "https://..."
    }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Update Project

```
PATCH /api/projects/[id]
```

**Request:**
```json
{
  "name": "New Name",
  "heroId": "uuid | null"
}
```

*Note: Project DNA (audience, stylePreset, etc.) cannot be changed after creation*

### Delete Project

```
DELETE /api/projects/[id]
```

**Response 204:** No content

---

## Style Calibration

### Generate Calibration Samples

```
POST /api/projects/[id]/calibrate
```

**Request:**
```json
{
  "subject": "cute forest animals"
}
```

**Response 200:**
```json
{
  "samples": [
    { "id": "1", "url": "https://..." },
    { "id": "2", "url": "https://..." },
    { "id": "3", "url": "https://..." },
    { "id": "4", "url": "https://..." }
  ],
  "blotsSpent": 10
}
```

### Set Style Anchor

```
POST /api/projects/[id]/calibrate/select
```

**Request:**
```json
{
  "sampleId": "2"
}
```

**Response 200:**
```json
{
  "styleAnchorUrl": "https://...",
  "styleAnchorDescription": "Kawaii style with..."
}
```

---

## Generation

### Start Generation Job

```
POST /api/generate
```

**Request:**
```json
{
  "projectId": "uuid",
  "idea": "Bella explores a magical forest with mushrooms and fairies",
  "pageNumbers": [1, 2, 3, 4, 5] // Optional: specific pages, or omit for all
}
```

**Response 202:**
```json
{
  "jobId": "uuid",
  "status": "pending",
  "totalItems": 40,
  "blotsReserved": 480,
  "estimatedSeconds": 120
}
```

### Get Job Status

```
GET /api/generate/[jobId]
```

**Response 200:**
```json
{
  "id": "uuid",
  "status": "processing",
  "totalItems": 40,
  "completedItems": 15,
  "failedItems": 0,
  "blotsSpent": 180,
  "currentStage": "Generating page 16...",
  "pages": [
    {
      "pageNumber": 1,
      "status": "completed",
      "thumbnailUrl": "https://..."
    },
    {
      "pageNumber": 16,
      "status": "processing"
    }
  ]
}
```

### Cancel Job

```
POST /api/generate/[jobId]/cancel
```

**Response 200:**
```json
{
  "status": "cancelled",
  "blotsRefunded": 300
}
```

---

## Pages

### Get Page Detail

```
GET /api/pages/[id]
```

**Response 200:**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "sortOrder": 1,
  "pageType": "illustration",
  "currentVersion": 2,
  "sceneBrief": "Bella discovers the forest",
  "imageUrl": "https://...",
  "versions": [
    {
      "version": 2,
      "thumbnailUrl": "https://...",
      "editType": "inpaint",
      "editPrompt": "Add butterfly",
      "createdAt": "..."
    },
    {
      "version": 1,
      "thumbnailUrl": "https://...",
      "editType": "initial",
      "createdAt": "..."
    }
  ]
}
```

### Edit Page (Chat)

```
POST /api/pages/[id]/edit
```

**Request:**
```json
{
  "type": "regenerate" | "quick_action",
  "prompt": "Make the dragon friendlier",
  "action": "simplify" | "add_detail" | null
}
```

**Response 200:**
```json
{
  "version": 3,
  "imageUrl": "https://...",
  "thumbnailUrl": "https://...",
  "blotsSpent": 12
}
```

### Edit Page (Inpaint)

```
POST /api/pages/[id]/edit
```

**Request:**
```json
{
  "type": "inpaint",
  "prompt": "A small butterfly with simple wings",
  "maskDataUrl": "data:image/png;base64,..."
}
```

**Response 200:**
```json
{
  "version": 3,
  "imageUrl": "https://...",
  "thumbnailUrl": "https://...",
  "blotsSpent": 12
}
```

### Restore Version

```
POST /api/pages/[id]/restore
```

**Request:**
```json
{
  "version": 1
}
```

**Response 200:**
```json
{
  "currentVersion": 1,
  "imageUrl": "https://..."
}
```

---

## Heroes

### List Heroes

```
GET /api/heroes
```

**Response 200:**
```json
{
  "heroes": [
    {
      "id": "uuid",
      "name": "Bella",
      "audience": "children",
      "thumbnailUrl": "https://...",
      "timesUsed": 5,
      "createdAt": "..."
    }
  ]
}
```

### Create Hero

```
POST /api/heroes
```

**Request:**
```json
{
  "name": "Bella",
  "description": "A friendly white bunny with floppy ears and a pink bow",
  "audience": "children"
}
```

**Response 202:**
```json
{
  "jobId": "uuid",
  "status": "pending",
  "blotsReserved": 15
}
```

### Get Hero

```
GET /api/heroes/[id]
```

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Bella",
  "description": "A friendly white bunny...",
  "audience": "children",
  "referenceUrl": "https://...", // Full 2x2 reference sheet
  "thumbnailUrl": "https://...",
  "timesUsed": 5,
  "createdAt": "..."
}
```

### Delete Hero

```
DELETE /api/heroes/[id]
```

**Response 204:** No content

---

## Export

### Create Export

```
POST /api/export
```

**Request:**
```json
{
  "projectId": "uuid",
  "format": "pdf" | "png_zip",
  "includeBleed": true
}
```

**Response 202:**
```json
{
  "jobId": "uuid",
  "status": "pending",
  "blotsReserved": 3
}
```

### Get Export Status

```
GET /api/export/[jobId]
```

**Response 200:**
```json
{
  "status": "completed",
  "downloadUrl": "https://...", // Signed URL, expires in 1 hour
  "expiresAt": "2025-01-01T01:00:00Z",
  "fileSize": 52428800,
  "fileName": "bellas-adventure-interior.pdf"
}
```

---

## Billing

### Get Blot Balance

```
GET /api/billing/balance
```

**Response 200:**
```json
{
  "blots": 847,
  "plan": "creator",
  "resetsAt": "2025-02-01T00:00:00Z",
  "storageUsed": 2415919104,
  "storageLimit": 16106127360
}
```

### Create Checkout Session

```
POST /api/billing/checkout
```

**Request:**
```json
{
  "plan": "creator",
  "interval": "monthly" | "yearly"
}
```

**Response 200:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### Create Portal Session

```
POST /api/billing/portal
```

**Response 200:**
```json
{
  "portalUrl": "https://billing.stripe.com/..."
}
```

---

## Upload

### Get Signed Upload URL

```
POST /api/upload
```

**Request:**
```json
{
  "fileName": "mask.png",
  "contentType": "image/png",
  "purpose": "inpaint_mask" | "custom_image"
}
```

**Response 200:**
```json
{
  "uploadUrl": "https://...",
  "key": "assets/uuid/temp/...",
  "expiresAt": "..."
}
```

---

## Webhooks

### Stripe Webhook

```
POST /api/webhooks/stripe
```

Handled events:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional context
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | No access to resource |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `INSUFFICIENT_BLOTS` | 402 | Not enough Blots |
| `STORAGE_FULL` | 402 | Storage quota exceeded |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `GENERATION_DISABLED` | 503 | Feature disabled |
| `INTERNAL_ERROR` | 500 | Server error |
