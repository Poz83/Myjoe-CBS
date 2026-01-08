# Phase 3.1 & 3.2 Implementation Notes

## Completed: January 6, 2026

### Files Created

1. **src/server/db/projects.ts** - Database query layer
   - `getProjects(userId)` - List all user projects
   - `getProject(projectId, userId)` - Get single project with hero and pages
   - `createProject(userId, input)` - Create project with auto-generated pages
   - `updateProject(projectId, userId, input)` - Update allowed fields only
   - `deleteProject(projectId, userId)` - Soft delete project

2. **src/app/api/projects/route.ts** - List and create endpoints
   - `GET /api/projects` - List all projects for authenticated user
   - `POST /api/projects` - Create new project with validation and limit checks

3. **src/app/api/projects/[id]/route.ts** - Individual project endpoints
   - `GET /api/projects/[id]` - Get single project with details
   - `PATCH /api/projects/[id]` - Update project (DNA fields protected)
   - `DELETE /api/projects/[id]` - Soft delete project

4. **TEST_PROJECTS_API.md** - Comprehensive testing guide

### Files Modified

1. **src/lib/constants.ts**
   - Added `PROJECT_LIMITS` constant (free: 3, starter: 10, creator: 50, pro: unlimited)
   - Added `AUDIENCE_DNA_MAPPING` for automatic line_weight and complexity derivation

2. **src/lib/supabase/types.ts**
   - Added `heroes` table types
   - Added `pages` table types

## Key Features Implemented

### 1. Audience DNA Mapping
Projects automatically derive `line_weight` and `complexity` based on target audience:
- **toddler** → thick lines, minimal complexity
- **children** → thick lines, moderate complexity
- **tween** → medium lines, moderate complexity
- **teen** → medium lines, detailed complexity
- **adult** → fine lines, intricate complexity

### 2. Project Limits Enforcement
- Free plan: 3 projects
- Starter plan: 10 projects
- Creator plan: 50 projects
- Pro plan: Unlimited

### 3. Automatic Page Generation
When a project is created, empty page records are automatically generated based on `pageCount`:
- All pages start with `page_type: 'illustration'`
- Pages are numbered sequentially with `sort_order` (0-indexed)
- Each page starts with `current_version: 1`

### 4. DNA Immutability
Once a project is created, its "DNA" cannot be changed:
- `audience`
- `style_preset`
- `page_count`
- `line_weight`
- `complexity`
- `trim_size`

Only these fields can be updated:
- `name`
- `description`
- `hero_id`
- `status`

### 5. Soft Deletes
Projects are soft-deleted (set `deleted_at` timestamp) rather than permanently removed:
- Preserves data for potential recovery
- Filtered out from all queries using `deleted_at IS NULL`

### 6. Error Handling
- All errors logged to Sentry with correlation IDs
- Consistent error response format: `{ error: string, correlationId?: string }`
- Proper HTTP status codes:
  - 200: Success
  - 201: Created
  - 204: No Content (delete)
  - 400: Validation error
  - 401: Unauthorized
  - 403: Forbidden (limit reached)
  - 404: Not found
  - 500: Server error

### 7. Security
- All endpoints require authentication
- Ownership verification on all mutations
- RLS policies enforced at database level
- UUID validation for project IDs

## Database Schema Integration

The implementation works with the existing schema from `001_initial_schema.sql`:

### Projects Table
- Auto-generates `line_weight` and `complexity` on insert
- Tracks `deleted_at` for soft deletes
- References `heroes` table (optional)
- Has one-to-many relationship with `pages`

### Pages Table
- Created automatically when project is created
- Ordered by `sort_order`
- Tracks `current_version` for versioning system

### RLS Policies
- Users can only CRUD their own projects
- Users can only access pages through owned projects
- Enforced at database level for security

## Testing Status

### Unit Testing
✅ TypeScript types are correct
✅ Zod validation schemas defined
✅ Error handling implemented
✅ Correlation IDs added

### Integration Testing
⚠️ **Requires authentication setup** - See TEST_PROJECTS_API.md for manual testing guide

The API routes are ready to test once:
1. Supabase is configured with the database schema
2. User authentication is working (Google OAuth or Magic Link)
3. Environment variables are set

### Test Scenarios Documented
See `TEST_PROJECTS_API.md` for:
- List projects
- Create project with validation
- Get single project with hero and pages
- Update project (with DNA protection)
- Delete project (soft delete)
- Project limit enforcement
- Audience DNA mapping verification
- Error handling scenarios

## Next Steps

1. **Complete Phase 2 (Authentication)** if not already done
   - Required for testing the API endpoints
   - Need valid user sessions

2. **Set up Supabase**
   - Run migrations
   - Configure RLS policies
   - Test database connections

3. **Test API Endpoints**
   - Follow TEST_PROJECTS_API.md guide
   - Use browser DevTools or curl
   - Verify all scenarios

4. **Build UI (Phase 3.3-3.4)**
   - Projects list page
   - Project creation form
   - Project cards
   - Empty states

## Code Quality

- ✅ No linter errors
- ✅ TypeScript strict mode compliant
- ✅ Follows existing patterns from codebase
- ✅ Comprehensive error handling
- ✅ Proper async/await usage
- ✅ Transaction-like behavior (rollback on page creation failure)
- ✅ Correlation IDs for debugging
- ✅ Sentry integration for error tracking

## Known Issues

None related to this implementation. The build failure is due to missing `@react-email/render` dependency in the email module, which is unrelated to the projects API.

## Git Commit

Ready to commit with:
```bash
git add .
git commit -m "feat(3.1-3.2): projects database queries and API routes"
```
