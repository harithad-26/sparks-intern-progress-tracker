-- Intern Management System Database Schema
-- Compatible with Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for better data integrity
CREATE TYPE intern_status AS ENUM ('active', 'completed', 'dropped');
CREATE TYPE batch_status AS ENUM ('active', 'archived');
CREATE TYPE project_status AS ENUM ('Not Completed', 'Partially Completed', 'Completed');
CREATE TYPE task_status AS ENUM ('Not Tried', 'In Progress', 'Completed');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half-day');
CREATE TYPE academic_year AS ENUM ('1st Year', '2nd Year', '3rd Year', '4th Year');

-- Streams table (Technology domains)
CREATE TABLE streams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_default BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches table
CREATE TABLE batches (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status batch_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interns table
CREATE TABLE interns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    college VARCHAR(255) NOT NULL,
    academic_year academic_year NOT NULL,
    domain VARCHAR(100) NOT NULL,
    batch VARCHAR(50) NOT NULL,
    status intern_status DEFAULT 'active',
    joined_date DATE DEFAULT CURRENT_DATE,
    additional_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
    id BIGSERIAL PRIMARY KEY,
    intern_id BIGINT NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
    context VARCHAR(100) NOT NULL, -- Batch/Stream identifier
    month_year VARCHAR(20) NOT NULL, -- "September 2025"
    week1 attendance_status,
    week2 attendance_status,
    week3 attendance_status,
    week4 attendance_status,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(intern_id, context, month_year)
);

-- Performance evaluations table
CREATE TABLE performance_evaluations (
    id BIGSERIAL PRIMARY KEY,
    intern_id BIGINT NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
    week VARCHAR(20) NOT NULL, -- "Week 1", "Week 2", etc.
    stream_name VARCHAR(100),
    batch_id BIGINT REFERENCES batches(id) ON DELETE SET NULL,
    interest INTEGER CHECK (interest >= 1 AND interest <= 5),
    enthusiasm INTEGER CHECK (enthusiasm >= 1 AND enthusiasm <= 5),
    technical_skills INTEGER CHECK (technical_skills >= 1 AND technical_skills <= 5),
    deadline_adherence INTEGER CHECK (deadline_adherence >= 1 AND deadline_adherence <= 5),
    team_collaboration INTEGER CHECK (team_collaboration >= 1 AND team_collaboration <= 5),
    overall_score DECIMAL(3,2) GENERATED ALWAYS AS (
        (COALESCE(interest, 0) + COALESCE(enthusiasm, 0) + COALESCE(technical_skills, 0) + 
         COALESCE(deadline_adherence, 0) + COALESCE(team_collaboration, 0)) / 5.0
    ) STORED,
    comments TEXT,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(intern_id, week, stream_name, batch_id)
);

-- Projects table
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'Not Completed',
    batch_id BIGINT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    admin_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project assignments (many-to-many relationship between projects and interns)
CREATE TABLE project_assignments (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    intern_id BIGINT NOT NULL REFERENCES interns(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, intern_id)
);

-- Weekly tasks table
CREATE TABLE weekly_tasks (
    id BIGSERIAL PRIMARY KEY,
    intern_id BIGINT REFERENCES interns(id) ON DELETE CASCADE, -- NULL for general tasks
    intern_name VARCHAR(255), -- For general tasks or cached name
    week_number VARCHAR(20) NOT NULL, -- "Week 1", "Week 2", etc.
    task_title VARCHAR(500) NOT NULL,
    task_description TEXT,
    status task_status DEFAULT 'Not Tried',
    batch_id BIGINT REFERENCES batches(id) ON DELETE SET NULL,
    stream_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global weeks configuration table
CREATE TABLE global_weeks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE, -- "Week 1", "Week 2", etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_interns_status ON interns(status);
CREATE INDEX idx_interns_domain ON interns(domain);
CREATE INDEX idx_interns_batch ON interns(batch);
CREATE INDEX idx_interns_email ON interns(email);

CREATE INDEX idx_attendance_intern_id ON attendance(intern_id);
CREATE INDEX idx_attendance_context ON attendance(context);
CREATE INDEX idx_attendance_month_year ON attendance(month_year);

CREATE INDEX idx_performance_intern_id ON performance_evaluations(intern_id);
CREATE INDEX idx_performance_week ON performance_evaluations(week);
CREATE INDEX idx_performance_stream ON performance_evaluations(stream_name);
CREATE INDEX idx_performance_batch ON performance_evaluations(batch_id);

CREATE INDEX idx_projects_batch_id ON projects(batch_id);
CREATE INDEX idx_projects_status ON projects(status);

CREATE INDEX idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_intern_id ON project_assignments(intern_id);

CREATE INDEX idx_weekly_tasks_intern_id ON weekly_tasks(intern_id);
CREATE INDEX idx_weekly_tasks_batch_id ON weekly_tasks(batch_id);
CREATE INDEX idx_weekly_tasks_stream ON weekly_tasks(stream_name);
CREATE INDEX idx_weekly_tasks_week ON weekly_tasks(week_number);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_streams_updated_at BEFORE UPDATE ON streams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interns_updated_at BEFORE UPDATE ON interns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_evaluations_updated_at BEFORE UPDATE ON performance_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_tasks_updated_at BEFORE UPDATE ON weekly_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_weeks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users (admin access)
-- Streams policies
CREATE POLICY "Authenticated users can view streams" ON streams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert streams" ON streams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update streams" ON streams FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete streams" ON streams FOR DELETE TO authenticated USING (true);

-- Batches policies
CREATE POLICY "Authenticated users can view batches" ON batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert batches" ON batches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update batches" ON batches FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete batches" ON batches FOR DELETE TO authenticated USING (true);

-- Interns policies
CREATE POLICY "Authenticated users can view interns" ON interns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert interns" ON interns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update interns" ON interns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete interns" ON interns FOR DELETE TO authenticated USING (true);

-- Attendance policies
CREATE POLICY "Authenticated users can view attendance" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert attendance" ON attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update attendance" ON attendance FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete attendance" ON attendance FOR DELETE TO authenticated USING (true);

-- Performance evaluations policies
CREATE POLICY "Authenticated users can view performance_evaluations" ON performance_evaluations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert performance_evaluations" ON performance_evaluations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update performance_evaluations" ON performance_evaluations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete performance_evaluations" ON performance_evaluations FOR DELETE TO authenticated USING (true);

-- Projects policies
CREATE POLICY "Authenticated users can view projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects" ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete projects" ON projects FOR DELETE TO authenticated USING (true);

-- Project assignments policies
CREATE POLICY "Authenticated users can view project_assignments" ON project_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert project_assignments" ON project_assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update project_assignments" ON project_assignments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete project_assignments" ON project_assignments FOR DELETE TO authenticated USING (true);

-- Weekly tasks policies
CREATE POLICY "Authenticated users can view weekly_tasks" ON weekly_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert weekly_tasks" ON weekly_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update weekly_tasks" ON weekly_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete weekly_tasks" ON weekly_tasks FOR DELETE TO authenticated USING (true);

-- Global weeks policies
CREATE POLICY "Authenticated users can view global_weeks" ON global_weeks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert global_weeks" ON global_weeks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update global_weeks" ON global_weeks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete global_weeks" ON global_weeks FOR DELETE TO authenticated USING (true);