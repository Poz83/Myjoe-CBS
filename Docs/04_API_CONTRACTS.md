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
  "audience": "children",
  "lineWeight": "thick",
  "complexity": "moderate"
}
```

### Get Project | Update Project | Delete Project

See original documentation - unchanged.

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
  "idea": "Bella explores a magical forest",
  "pageNumbers": [1, 2, 3, 4, 5]
}
```

**Response 202 (Success):**
```json
{
  "jobId": "uuid",
  "status": "pending",
  "totalItems": 40,
  "blotsReserved": 480
}
```

**Response 400 (Safety Blocked):**
```json
{
  "error": "Content not suitable for children",
  "code": "SAFETY_BLOCKED",
  "suggestions": [
    "Try: \"brave knight saving a friendly dragon\"",
    "Try: \"underwater mermaid palace\""
  ]
}
```

---

## Heroes

### Create Hero

```
POST /api/heroes
```

**Request:**
```json
{
  "name": "Bella",
  "description": "A friendly white bunny with floppy ears",
  "audience": "children"
}
```

**Response 202 (Success):**
```json
{
  "jobId": "uuid",
  "status": "pending",
  "blotsReserved": 15
}
```

**Response 400 (Safety Blocked):**
```json
{
  "error": "Character description not suitable",
  "code": "SAFETY_BLOCKED",
  "suggestions": ["Try a friendlier description"]
}
```

---

## Billing (Updated with Packs)

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

### Create Subscription Checkout

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

### Create Pack Checkout (NEW)

```
POST /api/billing/pack-checkout
```

**Request:**
```json
{
  "packId": "splash" | "bucket" | "barrel"
}
```

**Response 200:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### Create Portal Session

```
POST /api/billing/portal
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | No access |
| `NOT_FOUND` | 404 | Resource missing |
| `INSUFFICIENT_BLOTS` | 402 | Not enough Blots |
| `STORAGE_FULL` | 402 | Storage exceeded |
| `RATE_LIMITED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `SAFETY_BLOCKED` | 400 | Content failed safety |
| `GENERATION_DISABLED` | 503 | Feature disabled |
| `INTERNAL_ERROR` | 500 | Server error |
