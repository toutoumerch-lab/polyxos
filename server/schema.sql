-- Contacts table (from the main contact form)
CREATE TABLE IF NOT EXISTS contacts (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  service     VARCHAR(100),
  message     TEXT          NOT NULL,
  status      VARCHAR(50)   NOT NULL DEFAULT 'new',
  ip_address  VARCHAR(50),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Audit requests table (from the audit CTA section)
CREATE TABLE IF NOT EXISTS audit_requests (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  website_url VARCHAR(500)  NOT NULL,
  status      VARCHAR(50)   NOT NULL DEFAULT 'pending',
  notes       TEXT,
  ip_address  VARCHAR(50),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Settings table for global app configuration (like Cloudinary brand URLs)
CREATE TABLE IF NOT EXISTS settings (
  key         VARCHAR(50) PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach trigger to contacts
DROP TRIGGER IF EXISTS set_contacts_updated_at ON contacts;
CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Attach trigger to audit_requests
DROP TRIGGER IF EXISTS set_audit_requests_updated_at ON audit_requests;
CREATE TRIGGER set_audit_requests_updated_at
  BEFORE UPDATE ON audit_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Attach trigger to settings
DROP TRIGGER IF EXISTS set_settings_updated_at ON settings;
CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contacts_email      ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status     ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_audit_requests_url  ON audit_requests(website_url);
CREATE INDEX IF NOT EXISTS idx_audit_requests_status ON audit_requests(status);
