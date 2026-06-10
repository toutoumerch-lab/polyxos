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

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id                  SERIAL PRIMARY KEY,
  title               VARCHAR(255)  NOT NULL,
  short_description   TEXT          NOT NULL,
  detailed_description TEXT,
  icon_name           VARCHAR(100)  NOT NULL DEFAULT 'Globe',
  display_order       INTEGER       NOT NULL DEFAULT 0,
  active              BOOLEAN       NOT NULL DEFAULT TRUE,
  features            TEXT[]        NOT NULL DEFAULT '{}',
  color               VARCHAR(50)   NOT NULL DEFAULT '#3B82F6',
  gradient            VARCHAR(100)  NOT NULL DEFAULT 'from-blue-500/20 to-blue-600/5',
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Portfolio Projects table
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id                  SERIAL PRIMARY KEY,
  title               VARCHAR(255)  NOT NULL,
  category            VARCHAR(100)  NOT NULL,
  description         TEXT          NOT NULL,
  cover_image         VARCHAR(500)  NOT NULL,
  gallery_images      TEXT[]        NOT NULL DEFAULT '{}',
  tags                TEXT[]        NOT NULL DEFAULT '{}',
  live_url            VARCHAR(500),
  github_url          VARCHAR(500),
  completion_date     DATE,
  featured            BOOLEAN       NOT NULL DEFAULT FALSE,
  display_order       INTEGER       NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Technologies table
CREATE TABLE IF NOT EXISTS technologies (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(100)  NOT NULL,
  logo_icon           VARCHAR(100)  NOT NULL DEFAULT '⚛',
  category            VARCHAR(100)  NOT NULL, -- 'Frontend', 'Backend', etc.
  proficiency         VARCHAR(50),
  display_order       INTEGER       NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Page views tracking table (fallback analytics)
CREATE TABLE IF NOT EXISTS page_views (
  id                  SERIAL PRIMARY KEY,
  path                VARCHAR(255)  NOT NULL,
  ip_address          VARCHAR(50),
  user_agent          TEXT,
  referrer            VARCHAR(500),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Triggers for automatic updated_at
DROP TRIGGER IF EXISTS set_services_updated_at ON services;
CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_portfolio_projects_updated_at ON portfolio_projects;
CREATE TRIGGER set_portfolio_projects_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_technologies_updated_at ON technologies;
CREATE TRIGGER set_technologies_updated_at
  BEFORE UPDATE ON technologies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for schema
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio_projects(featured);
CREATE INDEX IF NOT EXISTS idx_technologies_category ON technologies(category);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
