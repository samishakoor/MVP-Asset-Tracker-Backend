DROP INDEX IF EXISTS assets_serial_number_active_key;

CREATE UNIQUE INDEX assets_serial_number_active_key
ON assets (serial_number)
WHERE is_deleted = false;
