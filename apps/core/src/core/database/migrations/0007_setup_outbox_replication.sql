
-- 1. Grant replication privilege to the app user
DO $$
BEGIN
  EXECUTE format('ALTER USER %I REPLICATION', current_user);
END
$$;

-- 2. Publication required by postgres.js subscribe() internals
CREATE PUBLICATION outbox_publication FOR TABLE outbox_events;

-- 3. Full replica identity: UPDATE/DELETE events carry the old row
ALTER TABLE outbox_events REPLICA IDENTITY FULL;
