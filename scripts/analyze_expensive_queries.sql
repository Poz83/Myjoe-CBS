-- ============================================================================
-- Expensive Query Analysis Script
-- ============================================================================
-- Run this in Supabase SQL Editor to analyze the performance issues
-- ============================================================================

-- 1. Check what's calling the expensive timezone query
-- Look for application code that might be calling this repeatedly
SELECT
  query,
  calls,
  total_exec_time as total_time_ms,
  mean_exec_time as avg_time_ms,
  rows as rows_returned,
  shared_blks_hit,
  shared_blks_read,
  (shared_blks_hit::float / NULLIF(shared_blks_hit + shared_blks_read, 0)) * 100 as cache_hit_pct
FROM pg_stat_statements
WHERE query LIKE '%pg_timezone_names%'
ORDER BY total_exec_time DESC
LIMIT 5;

-- 2. Check if there are any application patterns causing repeated calls
-- Look at recent query activity
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  rows,
  substr(query, 1, 100) as query_preview
FROM pg_stat_statements
WHERE total_exec_time > 1000  -- queries taking more than 1 second total
  AND calls > 10  -- called more than 10 times
ORDER BY total_exec_time DESC
LIMIT 20;

-- 3. Check if the expensive queries are from specific connections/users
SELECT
  usename,
  client_addr,
  state,
  query_start,
  state_change,
  substr(query, 1, 100) as current_query
FROM pg_stat_activity
WHERE state = 'active'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start DESC
LIMIT 10;

-- 4. Check for any N+1 query patterns in your application
-- Look at queries that return very few rows but are called many times
SELECT
  query,
  calls,
  rows,
  rows::float / calls as avg_rows_per_call,
  total_exec_time / calls as avg_time_per_call
FROM pg_stat_statements
WHERE calls > 50
  AND rows::float / calls < 5  -- less than 5 rows per call on average
ORDER BY calls DESC
LIMIT 10;