
-- 1. Grant replication privilege to the app user
DO $$
BEGIN
  EXECUTE format('ALTER USER %I REPLICATION', current_user);
END
$$;

-- 2. Publication required by postgres.js subscribe() internals
CREATE PUBLICATION alltables FOR ALL TABLES;

-- 3. Full replica identity: UPDATE/DELETE events carry the old row
ALTER TABLE outbox_events REPLICA IDENTITY FULL;

-- 4. NOTIFY trigger for lightweight insert signalling (LISTEN/NOTIFY path)
CREATE OR REPLACE FUNCTION notify_outbox_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'outbox_events',
    json_build_object(
      'id',            NEW.id,
      'aggregateId',   NEW.aggregate_id,
      'aggregateType', NEW.aggregate_type,
      'eventType',     NEW.event_type,
      'payload',       NEW.payload,
      'status',        NEW.status,
      'scheduledAt',   NEW.scheduled_at,
      'createdAt',     NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_outbox_insert
AFTER INSERT ON outbox_events
FOR EACH ROW
EXECUTE FUNCTION notify_outbox_insert();
