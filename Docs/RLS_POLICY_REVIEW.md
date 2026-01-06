# RLS Policy Review - Prompt 1.3 Implementation

## Review Summary

**Date:** Review completed  
**Status:** ✅ Issues identified and fixes provided

## Review Results

### ✅ Correctly Implemented Policies

1. **profiles** - Users can SELECT and UPDATE own profile
2. **heroes** - Users can CRUD own heroes
3. **jobs** - Users can SELECT own jobs (read-only as specified)
4. **job_items** - Users can SELECT items via job ownership (read-only as specified)
5. **assets** - Users can CRUD own assets
6. **global_config** - Anyone can SELECT, no write policies (read-only)

### ⚠️ Issues Found and Fixed

#### Issue 1: Projects Policy Missing `deleted_at` Filter
**Requirement:** "users can CRUD only their own projects (check deleted_at IS NULL)"

**Current Implementation:**
```sql
CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING (auth.uid() = owner_id);
```

**Problem:** Policy allows access to soft-deleted projects (`deleted_at IS NOT NULL`)

**Fix:** Add `deleted_at IS NULL` check:
```sql
CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING (auth.uid() = owner_id AND deleted_at IS NULL);
```

#### Issue 2: Pages Policy Missing `deleted_at` Filter on Projects
**Requirement:** "users can CRUD pages where they own the parent project"

**Current Implementation:**
```sql
CREATE POLICY "Users can CRUD own pages"
  ON pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
      AND projects.owner_id = auth.uid()
    )
  );
```

**Problem:** Policy allows access to pages in soft-deleted projects

**Fix:** Add `projects.deleted_at IS NULL` check:
```sql
CREATE POLICY "Users can CRUD own pages"
  ON pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pages.project_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );
```

#### Issue 3: Page Versions Policy Missing `deleted_at` Filter on Projects
**Requirement:** "users can CRUD versions where they own the parent page's project"

**Current Implementation:**
```sql
CREATE POLICY "Users can CRUD own page versions"
  ON page_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN projects ON projects.id = pages.project_id
      WHERE pages.id = page_versions.page_id
      AND projects.owner_id = auth.uid()
    )
  );
```

**Problem:** Policy allows access to versions in soft-deleted projects

**Fix:** Add `projects.deleted_at IS NULL` check:
```sql
CREATE POLICY "Users can CRUD own page versions"
  ON page_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pages
      JOIN projects ON projects.id = pages.project_id
      WHERE pages.id = page_versions.page_id
      AND projects.owner_id = auth.uid()
      AND projects.deleted_at IS NULL
    )
  );
```

## Migration File

All fixes have been consolidated into: [`supabase/migrations/002_rls_policies_fix.sql`](../supabase/migrations/002_rls_policies_fix.sql)

This migration:
- Drops the three affected policies
- Recreates them with the correct `deleted_at` filters

## Testing Recommendations

After applying the migration, verify:

1. **Soft-deleted projects are inaccessible:**
   ```sql
   -- As user A, create and soft-delete a project
   UPDATE projects SET deleted_at = NOW() WHERE id = '...';
   
   -- As user A, verify SELECT returns no rows
   SELECT * FROM projects WHERE id = '...';
   ```

2. **Pages in soft-deleted projects are inaccessible:**
   ```sql
   -- As user A, soft-delete a project
   UPDATE projects SET deleted_at = NOW() WHERE id = '...';
   
   -- As user A, verify pages are inaccessible
   SELECT * FROM pages WHERE project_id = '...';
   ```

3. **Page versions in soft-deleted projects are inaccessible:**
   ```sql
   -- As user A, soft-delete a project
   UPDATE projects SET deleted_at = NOW() WHERE id = '...';
   
   -- As user A, verify page_versions are inaccessible
   SELECT pv.* FROM page_versions pv
   JOIN pages p ON p.id = pv.page_id
   WHERE p.project_id = '...';
   ```

4. **Cross-user access is still blocked:**
   ```sql
   -- As user B, verify cannot access user A's projects
   SELECT * FROM projects WHERE owner_id != auth.uid();
   ```

## Notes

- The `heroes` table also has a `deleted_at` column, but Prompt 1.3 doesn't explicitly require filtering it, so the current policy is acceptable.
- `jobs` and `job_items` are read-only (SELECT only) as specified in the prompt, which is correct for tracking async operations.
- `profiles` INSERT is not explicitly blocked, but profiles are created via trigger (`handle_new_user()`), so client INSERT attempts would fail due to missing policies anyway.
