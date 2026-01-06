# Testing Projects API

This document describes how to test the Projects API endpoints.

## Prerequisites

1. Server running on `http://localhost:3001`
2. User authenticated (logged in via Google OAuth or Magic Link)
3. Valid session cookie

## Test Scenarios

### 1. List Projects (GET /api/projects)

**Expected behavior:**
- Returns array of user's projects
- Filters out soft-deleted projects
- Orders by `updated_at` DESC

**Test with curl:**
```bash
curl -X GET http://localhost:3001/api/projects \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "owner_id": "uuid",
      "name": "My First Book",
      "page_count": 10,
      "audience": "children",
      "style_preset": "cartoon",
      "status": "draft",
      ...
    }
  ]
}
```

### 2. Create Project (POST /api/projects)

**Expected behavior:**
- Creates project with auto-derived DNA (line_weight, complexity)
- Creates empty page records based on pageCount
- Enforces project limits based on user plan
- Returns 201 with created project

**Test with curl:**
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ocean Adventures",
    "description": "A coloring book about sea creatures",
    "pageCount": 15,
    "audience": "children",
    "stylePreset": "whimsical",
    "trimSize": "8.5x11"
  }'
```

**Expected response (201):**
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "name": "Ocean Adventures",
  "description": "A coloring book about sea creatures",
  "page_count": 15,
  "audience": "children",
  "style_preset": "whimsical",
  "line_weight": "thick",
  "complexity": "moderate",
  "trim_size": "8.5x11",
  "status": "draft",
  ...
}
```

**Test validation errors:**
```bash
# Missing required field
curl -X POST http://localhost:3001/api/projects \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
# Expected: 400 with validation errors

# Invalid page count
curl -X POST http://localhost:3001/api/projects \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "pageCount": 100,
    "audience": "children",
    "stylePreset": "cartoon"
  }'
# Expected: 400 (exceeds MAX_PAGES of 45)
```

**Test project limit:**
```bash
# Create 4th project on free plan (limit is 3)
# Expected: 403 with error message about limit
```

### 3. Get Single Project (GET /api/projects/[id])

**Expected behavior:**
- Returns project with hero (if exists) and pages
- Verifies ownership
- Returns 404 if not found or not owned

**Test with curl:**
```bash
curl -X GET http://localhost:3001/api/projects/PROJECT_UUID \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "id": "uuid",
  "name": "Ocean Adventures",
  "hero": {
    "id": "uuid",
    "name": "Captain Splash",
    ...
  },
  "pages": [
    {
      "id": "uuid",
      "sort_order": 0,
      "page_type": "illustration",
      ...
    },
    ...
  ],
  ...
}
```

**Test not found:**
```bash
curl -X GET http://localhost:3001/api/projects/00000000-0000-0000-0000-000000000000 \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
# Expected: 404
```

### 4. Update Project (PATCH /api/projects/[id])

**Expected behavior:**
- Updates only allowed fields (name, description, heroId, status)
- Rejects DNA field updates
- Verifies ownership
- Returns updated project

**Test with curl:**
```bash
curl -X PATCH http://localhost:3001/api/projects/PROJECT_UUID \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ocean Adventures - Updated",
    "description": "Updated description",
    "status": "ready"
  }'
```

**Expected response:**
```json
{
  "id": "uuid",
  "name": "Ocean Adventures - Updated",
  "description": "Updated description",
  "status": "ready",
  ...
}
```

**Test DNA field rejection:**
```bash
curl -X PATCH http://localhost:3001/api/projects/PROJECT_UUID \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "audience": "adult",
    "pageCount": 20
  }'
# Expected: 400 with error about DNA fields
```

### 5. Delete Project (DELETE /api/projects/[id])

**Expected behavior:**
- Soft deletes project (sets deleted_at)
- Verifies ownership
- Returns 204 No Content

**Test with curl:**
```bash
curl -X DELETE http://localhost:3001/api/projects/PROJECT_UUID \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
```

**Expected response:**
- Status: 204 No Content
- No body

**Verify soft delete:**
```bash
# Try to GET the deleted project
curl -X GET http://localhost:3001/api/projects/PROJECT_UUID \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
# Expected: 404 (filtered by deleted_at IS NULL)
```

## Audience DNA Mapping Tests

Verify that line_weight and complexity are correctly derived:

| Audience | Expected line_weight | Expected complexity |
|----------|---------------------|---------------------|
| toddler  | thick               | minimal             |
| children | thick               | moderate            |
| tween    | medium              | moderate            |
| teen     | medium              | detailed            |
| adult    | fine                | intricate           |

Create projects with each audience and verify the derived fields.

## Error Handling Tests

### Authentication
```bash
# No auth cookie
curl -X GET http://localhost:3001/api/projects
# Expected: 401 Unauthorized
```

### Invalid UUID
```bash
curl -X GET http://localhost:3001/api/projects/invalid-uuid \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
# Expected: 400 Invalid project ID
```

### Ownership Verification
- Create project with User A
- Try to access/update/delete with User B
- Expected: 404 (not found due to ownership check)

## Testing with Browser DevTools

1. Log in to the application at `http://localhost:3001/login`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run fetch commands:

```javascript
// List projects
const response = await fetch('/api/projects');
const data = await response.json();
console.log(data);

// Create project
const createResponse = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Book',
    pageCount: 10,
    audience: 'children',
    stylePreset: 'cartoon'
  })
});
const created = await createResponse.json();
console.log(created);

// Get single project
const projectId = created.id;
const getResponse = await fetch(`/api/projects/${projectId}`);
const project = await getResponse.json();
console.log(project);

// Update project
const updateResponse = await fetch(`/api/projects/${projectId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Updated Test Book',
    status: 'ready'
  })
});
const updated = await updateResponse.json();
console.log(updated);

// Delete project
const deleteResponse = await fetch(`/api/projects/${projectId}`, {
  method: 'DELETE'
});
console.log(deleteResponse.status); // Should be 204
```

## Notes

- All error responses include a `correlationId` for debugging
- Errors are logged to Sentry with correlation IDs
- Project limits are enforced: free=3, starter=10, creator=50, pro=unlimited
- Pages are automatically created when a project is created
- DNA fields (audience, stylePreset, pageCount, etc.) cannot be modified after creation
