CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION sd_set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS sd_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sd_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sd_tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('customer','office','technician','admin')),
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, email)
);
-- Emails are unique per tenant (case-insensitive), never globally across tenants.
-- Drop any legacy global index first so a re-run converges on the scoped one.
DROP INDEX IF EXISTS uq_sd_users_email_ci;
CREATE UNIQUE INDEX IF NOT EXISTS uq_sd_users_email_ci ON sd_users (tenant_id, lower(email));
CREATE INDEX IF NOT EXISTS idx_sd_users_tenant_role ON sd_users (tenant_id, role);

CREATE TABLE IF NOT EXISTS sd_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sd_tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, user_id) REFERENCES sd_users(tenant_id, id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sd_sessions_expiry ON sd_sessions (expires_at);

CREATE TABLE IF NOT EXISTS sd_login_attempts (
  id bigserial PRIMARY KEY,
  email_hash text NOT NULL,
  ip_hash text NOT NULL,
  succeeded boolean NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sd_login_attempts_window ON sd_login_attempts (email_hash, ip_hash, attempted_at DESC);

CREATE TABLE IF NOT EXISTS sd_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sd_tenants(id) ON DELETE CASCADE,
  customer_user_id uuid,
  name text NOT NULL,
  address text NOT NULL,
  location_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, customer_user_id) REFERENCES sd_users(tenant_id, id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sd_properties_tenant ON sd_properties (tenant_id, name);

CREATE TABLE IF NOT EXISTS sd_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sd_tenants(id) ON DELETE CASCADE,
  property_id uuid NOT NULL,
  requested_by uuid,
  assigned_to uuid,
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'standard' CHECK (priority IN ('low','standard','urgent','emergency')),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','triaged','scheduled','in_progress','awaiting_approval','completed','invoice_ready','cancelled')),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, property_id) REFERENCES sd_properties(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, requested_by) REFERENCES sd_users(tenant_id, id) ON DELETE SET NULL,
  FOREIGN KEY (tenant_id, assigned_to) REFERENCES sd_users(tenant_id, id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sd_jobs_tenant_status ON sd_jobs (tenant_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sd_jobs_assignee ON sd_jobs (tenant_id, assigned_to, status);

CREATE TABLE IF NOT EXISTS sd_job_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sd_tenants(id) ON DELETE CASCADE,
  job_id uuid NOT NULL,
  author_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('note','status','proof','customer_message','office_review')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, job_id) REFERENCES sd_jobs(tenant_id, id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, author_id) REFERENCES sd_users(tenant_id, id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_sd_updates_job ON sd_job_updates (tenant_id, job_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sd_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sd_tenants(id) ON DELETE CASCADE,
  job_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','approved','declined','expired')),
  currency text NOT NULL DEFAULT 'USD',
  subtotal_cents integer NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, job_id) REFERENCES sd_jobs(tenant_id, id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, approved_by) REFERENCES sd_users(tenant_id, id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sd_quotes_job ON sd_quotes (tenant_id, job_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sd_quote_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sd_tenants(id) ON DELETE CASCADE,
  quote_id uuid NOT NULL,
  description text NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  FOREIGN KEY (tenant_id, quote_id) REFERENCES sd_quotes(tenant_id, id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sd_quote_lines ON sd_quote_lines (tenant_id, quote_id, sort_order);

CREATE TABLE IF NOT EXISTS sd_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES sd_tenants(id) ON DELETE CASCADE,
  job_id uuid NOT NULL,
  uploaded_by uuid NOT NULL,
  blob_url text NOT NULL,
  pathname text NOT NULL,
  content_type text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('request','before','during','after','document')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, blob_url),
  FOREIGN KEY (tenant_id, job_id) REFERENCES sd_jobs(tenant_id, id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id, uploaded_by) REFERENCES sd_users(tenant_id, id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_sd_media_job ON sd_media (tenant_id, job_id, created_at DESC);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['sd_tenants','sd_users','sd_properties','sd_jobs','sd_quotes'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON %I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION sd_set_updated_at()', t, t);
  END LOOP;
END $$;
