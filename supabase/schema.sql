-- ==============================================================================
-- Attendance Clearance System — Supabase / Postgres Schema
-- ==============================================================================
-- This schema models college attendance clearance replacing manual paper forms.
-- Class Name is the sole grouping/identifier (8 fixed institutional classes).
-- Copy and paste this directly into your Supabase project SQL Editor.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Classes Table (8 Fixed Classes: QLA-3, HFC-3, QH-2, FC-2, AL-2, QH-1, FC-1, AL-1)
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  department_combination VARCHAR(100) NOT NULL,
  default_teacher_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Teachers Table (~20-21 faculty members)
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  assigned_class_ids UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint back to classes table for default_teacher_id
ALTER TABLE classes 
  DROP CONSTRAINT IF EXISTS fk_classes_default_teacher;
ALTER TABLE classes 
  ADD CONSTRAINT fk_classes_default_teacher 
  FOREIGN KEY (default_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Class-Subject Join Table (Many-to-Many Mapping)
CREATE TABLE IF NOT EXISTS class_subjects (
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (class_id, subject_id)
);

-- 5. Students Table (Class Name is the only grouping/identifier)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roll_no VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  department VARCHAR(100) NOT NULL,
  gmail VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Clearance Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
  class_teacher_id_if_different UUID REFERENCES teachers(id) ON DELETE SET NULL,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('Medical', 'Family Emergency', 'Official College Work', 'Personal', 'Other')),
  reason_other_details TEXT,
  leave_start_date DATE NOT NULL,
  leave_end_date DATE NOT NULL,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  deadline_date DATE NOT NULL,
  subjects_missed TEXT[] NOT NULL,
  remarks TEXT,
  document_url TEXT,
  document_name TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'verified')),
  is_overdue BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  rejection_template_type VARCHAR(50),
  last_reminder_sent_at TIMESTAMPTZ,
  reminder_count INT DEFAULT 0,
  admin_notes TEXT
);

-- 7. Email Audit Log Table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  recipient VARCHAR(150) NOT NULL,
  cc VARCHAR(150),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'sent',
  details TEXT
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_requests_student_id ON requests(student_id);
CREATE INDEX IF NOT EXISTS idx_requests_teacher_id ON requests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_is_overdue ON requests(is_overdue);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON class_subjects(subject_id);

-- Automatic Overdue Calculation Trigger Function
-- Business Rule: A request submitted more than 14 days after the LAST DATE of the
-- leave period must still be allowed to submit, but must be automatically flagged as "Overdue".
CREATE OR REPLACE FUNCTION compute_clearance_request_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Compute permissible 14-day deadline date
  NEW.deadline_date := NEW.leave_end_date + INTERVAL '14 days';
  
  -- If submission date is after deadline date, flag as overdue
  IF NEW.submission_date > NEW.deadline_date THEN
    NEW.is_overdue := TRUE;
  ELSE
    NEW.is_overdue := FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compute_clearance_fields ON requests;
CREATE TRIGGER trg_compute_clearance_fields
  BEFORE INSERT OR UPDATE OF leave_end_date, submission_date
  ON requests
  FOR EACH ROW
  EXECUTE FUNCTION compute_clearance_request_fields();

-- Row Level Security (RLS) Configuration
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read of classes, subjects, and join mappings for dynamic form population
CREATE POLICY "Public read classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read class_subjects" ON class_subjects FOR SELECT USING (true);
CREATE POLICY "Public read teachers" ON teachers FOR SELECT USING (true);
CREATE POLICY "Allow student read/write" ON students FOR ALL USING (true);
CREATE POLICY "Allow requests operations" ON requests FOR ALL USING (true);
CREATE POLICY "Allow email_logs logging" ON email_logs FOR ALL USING (true);

-- Seed Exactly the 8 Fixed Institutional Classes
INSERT INTO classes (name, department_combination) VALUES
  ('QLA-3', 'Quality Assurance & Leadership'),
  ('HFC-3', 'Human Factors & Computing'),
  ('QH-2',  'Quantitative Hardware Systems'),
  ('FC-2',  'Foundations of Computing'),
  ('AL-2',  'Applied Logic & Software'),
  ('QH-1',  'Quantitative Hardware Principles'),
  ('FC-1',  'Foundations of Computing Intro'),
  ('AL-1',  'Applied Logic & Methods')
ON CONFLICT (name) DO NOTHING;
