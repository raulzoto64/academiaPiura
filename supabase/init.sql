-- Academy Peru Database Initialization with Sample Data
-- Run this script in Supabase SQL Editor: https://supabase.com/dashboard/project/svavlvvcjilzmvdentaj/editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    preview_video_url TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL,
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instructor_name TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    video_url TEXT,
    duration INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER NOT NULL DEFAULT 0,
    completed_lessons UUID[] DEFAULT '{}'::uuid[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    replies JSONB[] DEFAULT '{}'::jsonb[]
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB[] NOT NULL,
    passing_score INTEGER NOT NULL DEFAULT 70,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam submissions table
CREATE TABLE IF NOT EXISTS exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers JSONB[] NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    passed BOOLEAN NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    course_title TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    certificate_number TEXT UNIQUE NOT NULL
);

-- Create live classes table
CREATE TABLE IF NOT EXISTS live_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_url TEXT,
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instructor_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_comments_lesson ON comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_exams_course ON exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_user ON exam_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_exam ON exam_submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_course ON live_classes(course_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at column (check if they exist first)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_courses_updated_at') THEN
        CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_lessons_updated_at') THEN
        CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_enrollments_updated_at') THEN
        CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insert sample data

-- 1. Insert admin user
INSERT INTO users (email, password, name, role)
VALUES ('admin@academiaperu.com', 'admin123', 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert instructors (professors)
INSERT INTO users (email, password, name, role)
VALUES 
('profesor.juan@academiaperu.com', 'profesor123', 'Juan Pérez', 'instructor'),
('profesor.maria@academiaperu.com', 'profesor123', 'María López', 'instructor')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert students
INSERT INTO users (email, password, name, role)
VALUES 
('alumno.ana@academiaperu.com', 'alumno123', 'Ana García', 'student'),
('alumno.luis@academiaperu.com', 'alumno123', 'Luis Martínez', 'student'),
('alumno.carlos@academiaperu.com', 'alumno123', 'Carlos Rodríguez', 'student'),
('alumno.sofia@academiaperu.com', 'alumno123', 'Sofía Fernández', 'student')
ON CONFLICT (email) DO NOTHING;

-- 4. Insert courses
WITH profe_juan AS (SELECT id FROM users WHERE email = 'profesor.juan@academiaperu.com'),
     profe_maria AS (SELECT id FROM users WHERE email = 'profesor.maria@academiaperu.com')
INSERT INTO courses (title, description, image_url, preview_video_url, price, category, instructor_id, instructor_name, published)
VALUES 
('Introducción a JavaScript', 'Aprende los fundamentos del lenguaje JavaScript desde cero', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop', 'https://www.w3schools.com/html/mov_bbb.mp4', 49.99, 'Programación', (SELECT id FROM profe_juan), 'Juan Pérez', true),
('Desarrollo Web con React', 'Crea aplicaciones web modernas con React y Redux', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop', 'https://www.w3schools.com/html/movie.mp4', 79.99, 'Programación', (SELECT id FROM profe_juan), 'Juan Pérez', true),
('Diseño UX/UI para Principiantes', 'Aprende a crear interfaces de usuario atractivas y funcionales', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=400&fit=crop', 'https://www.w3schools.com/html/mov_bbb.mp4', 59.99, 'Diseño', (SELECT id FROM profe_maria), 'María López', true)
ON CONFLICT DO NOTHING;

-- 5. Insert lessons for each course
WITH js_course AS (SELECT id FROM courses WHERE title = 'Introducción a JavaScript'),
     react_course AS (SELECT id FROM courses WHERE title = 'Desarrollo Web con React'),
     ux_course AS (SELECT id FROM courses WHERE title = 'Diseño UX/UI para Principiantes')
INSERT INTO lessons (course_id, title, content, duration, order_index)
VALUES 
-- JavaScript course lessons
((SELECT id FROM js_course), 'Introducción a JavaScript', 'JavaScript es un lenguaje de programación interpretado que se utiliza para crear contenido interactivo en las páginas web.', 30, 1),
((SELECT id FROM js_course), 'Variables y Tipos de Datos', 'Aprende sobre variables, constantes y tipos de datos en JavaScript.', 45, 2),
((SELECT id FROM js_course), 'Funciones y Scope', 'Entiende cómo funcionan las funciones y el concepto de scope en JavaScript.', 60, 3),
((SELECT id FROM js_course), 'Condicionales y Bucles', 'Aprende sobre if/else, switch y bucles for/while en JavaScript.', 45, 4),
-- React course lessons
((SELECT id FROM react_course), 'Introducción a React', 'React es una biblioteca JavaScript para construir interfaces de usuario.', 40, 1),
((SELECT id FROM react_course), 'Componentes y Props', 'Entiende cómo crear y usar componentes en React.', 50, 2),
((SELECT id FROM react_course), 'Estado y Efectos', 'Aprende sobre el estado de los componentes y los efectos secundarios.', 60, 3),
((SELECT id FROM react_course), 'Hooks Customizados', 'Crea tus propios hooks para reutilizar lógica en tus componentes.', 45, 4),
-- UX/UI course lessons
((SELECT id FROM ux_course), 'Introducción a UX/UI', 'UX (Experiencia de Usuario) y UI (Interfaz de Usuario) son fundamentales para un producto exitoso.', 35, 1),
((SELECT id FROM ux_course), 'Investigación de Usuario', 'Aprende a realizar investigaciones para entender las necesidades de tus usuarios.', 50, 2),
((SELECT id FROM ux_course), 'Wireframing y Prototyping', 'Crea wireframes y prototipos para tu diseño.', 45, 3),
((SELECT id FROM ux_course), 'Herramientas de Diseño', 'Conoce las herramientas más utilizadas en el diseño UX/UI.', 40, 4)
ON CONFLICT DO NOTHING;

-- 6. Insert live classes
WITH js_course AS (SELECT id FROM courses WHERE title = 'Introducción a JavaScript'),
     react_course AS (SELECT id FROM courses WHERE title = 'Desarrollo Web con React'),
     ux_course AS (SELECT id FROM courses WHERE title = 'Diseño UX/UI para Principiantes'),
     profe_juan AS (SELECT id FROM users WHERE email = 'profesor.juan@academiaperu.com'),
     profe_maria AS (SELECT id FROM users WHERE email = 'profesor.maria@academiaperu.com')
INSERT INTO live_classes (course_id, title, description, start_time, end_time, meeting_url, instructor_id, instructor_name)
VALUES 
((SELECT id FROM js_course), 'Clase Live: Debugging en JavaScript', 'Aprende técnicas de debugging efectivas en JavaScript', 
  NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'https://zoom.us/j/1234567890', (SELECT id FROM profe_juan), 'Juan Pérez'),
((SELECT id FROM react_course), 'Clase Live: React Hooks Avanzados', 'Explora hooks avanzados como useMemo y useCallback', 
  NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', 'https://zoom.us/j/0987654321', (SELECT id FROM profe_juan), 'Juan Pérez'),
((SELECT id FROM ux_course), 'Clase Live: Principios de Diseño', 'Aprende los principios básicos del diseño visual', 
  NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 2 hours', 'https://zoom.us/j/5678901234', (SELECT id FROM profe_maria), 'María López')
ON CONFLICT DO NOTHING;

-- 7. Insert enrollments
WITH js_course AS (SELECT id FROM courses WHERE title = 'Introducción a JavaScript'),
     react_course AS (SELECT id FROM courses WHERE title = 'Desarrollo Web con React'),
     ux_course AS (SELECT id FROM courses WHERE title = 'Diseño UX/UI para Principiantes'),
     ana AS (SELECT id FROM users WHERE email = 'alumno.ana@academiaperu.com'),
     luis AS (SELECT id FROM users WHERE email = 'alumno.luis@academiaperu.com'),
     carlos AS (SELECT id FROM users WHERE email = 'alumno.carlos@academiaperu.com'),
     sofia AS (SELECT id FROM users WHERE email = 'alumno.sofia@academiaperu.com')
INSERT INTO enrollments (user_id, course_id, enrolled_at, progress)
VALUES 
((SELECT id FROM ana), (SELECT id FROM js_course), NOW() - INTERVAL '7 days', 65),
((SELECT id FROM ana), (SELECT id FROM react_course), NOW() - INTERVAL '3 days', 25),
((SELECT id FROM luis), (SELECT id FROM js_course), NOW() - INTERVAL '10 days', 85),
((SELECT id FROM luis), (SELECT id FROM ux_course), NOW() - INTERVAL '5 days', 40),
((SELECT id FROM carlos), (SELECT id FROM react_course), NOW() - INTERVAL '2 days', 10),
((SELECT id FROM sofia), (SELECT id FROM js_course), NOW() - INTERVAL '15 days', 95),
((SELECT id FROM sofia), (SELECT id FROM ux_course), NOW() - INTERVAL '8 days', 70)
ON CONFLICT DO NOTHING;

-- 8. Insert comments
WITH js_course AS (SELECT id FROM courses WHERE title = 'Introducción a JavaScript'),
     first_lesson AS (SELECT id FROM lessons WHERE course_id = (SELECT id FROM js_course) AND order_index = 1),
     second_lesson AS (SELECT id FROM lessons WHERE course_id = (SELECT id FROM js_course) AND order_index = 2),
     ana AS (SELECT id FROM users WHERE email = 'alumno.ana@academiaperu.com'),
     luis AS (SELECT id FROM users WHERE email = 'alumno.luis@academiaperu.com'),
     sofia AS (SELECT id FROM users WHERE email = 'alumno.sofia@academiaperu.com')
INSERT INTO comments (course_id, lesson_id, user_id, user_name, content)
VALUES 
((SELECT id FROM js_course), (SELECT id FROM first_lesson), (SELECT id FROM ana), 'Ana García', 'Excelente explicación sobre los fundamentos de JavaScript!'),
((SELECT id FROM js_course), (SELECT id FROM first_lesson), (SELECT id FROM luis), 'Luis Martínez', 'Me ayudó mucho a entender la diferencia entre var, let y const.'),
((SELECT id FROM js_course), (SELECT id FROM second_lesson), (SELECT id FROM sofia), 'Sofía Fernández', '¿Alguien puede explicar mejor cómo funciona el tipo Symbol?'),
((SELECT id FROM js_course), (SELECT id FROM second_lesson), (SELECT id FROM ana), 'Ana García', 'Symbol es un tipo de dato primitivo que se usa para crear identificadores únicos.')
ON CONFLICT DO NOTHING;

-- 9. Insert messages
WITH profe_juan AS (SELECT id FROM users WHERE email = 'profesor.juan@academiaperu.com'),
     profe_maria AS (SELECT id FROM users WHERE email = 'profesor.maria@academiaperu.com'),
     ana AS (SELECT id FROM users WHERE email = 'alumno.ana@academiaperu.com'),
     luis AS (SELECT id FROM users WHERE email = 'alumno.luis@academiaperu.com'),
     js_course AS (SELECT id FROM courses WHERE title = 'Introducción a JavaScript')
INSERT INTO messages (sender_id, sender_name, recipient_id, course_id, content)
VALUES 
((SELECT id FROM ana), 'Ana García', (SELECT id FROM profe_juan), (SELECT id FROM js_course), 'Buenas tardes profesor, tengo una duda sobre la clase de hoy.'),
((SELECT id FROM profe_juan), 'Juan Pérez', (SELECT id FROM ana), (SELECT id FROM js_course), 'Claro Ana, ¿puedes especificar qué tema te gustaría aclarar?'),
((SELECT id FROM luis), 'Luis Martínez', (SELECT id FROM profe_juan), (SELECT id FROM js_course), 'Hola profesor, ¿cuándo se publicará la tarea de la semana?'),
((SELECT id FROM profe_juan), 'Juan Pérez', (SELECT id FROM luis), (SELECT id FROM js_course), 'La tarea estará disponible mañana antes de las 10am.')
ON CONFLICT DO NOTHING;

-- 10. Insert exams
WITH js_course AS (SELECT id FROM courses WHERE title = 'Introducción a JavaScript'),
     profe_juan AS (SELECT id FROM users WHERE email = 'profesor.juan@academiaperu.com')
INSERT INTO exams (course_id, title, description, questions, passing_score, created_by)
VALUES 
((SELECT id FROM js_course), 'Examen Final JavaScript', 'Evaluación final del curso de JavaScript', 
 '[
   {
     "id": "1",
     "question": "¿Cuál es la diferencia entre let y var?",
     "options": ["Ninguna", "let es de scope local, var es de scope global", "var es de scope local, let es de scope global", "let solo se usa para números"],
     "correctAnswer": 1
   },
   {
     "id": "2",
     "question": "¿Qué es un closure?",
     "options": ["Una función dentro de otra función", "Un tipo de bucle", "Un método de array", "Una variable global"],
     "correctAnswer": 0
   },
   {
     "id": "3",
     "question": "¿Cómo se define una función arrow en JavaScript?",
     "options": ["function() =>", "() =>", "function arrow()", "=> function()"],
     "correctAnswer": 1
   }
 ]'::jsonb, 70, (SELECT id FROM profe_juan))
ON CONFLICT DO NOTHING;

-- Display completion message
SELECT 'Database initialization completed successfully!' AS status;
SELECT 'Tables created: users, courses, lessons, enrollments, comments, messages, exams, exam_submissions, certificates, live_classes' AS tables_created;
SELECT 'Sample data inserted: 1 admin, 2 instructors, 4 students, 3 courses, 12 lessons, 3 live classes, 7 enrollments, 4 comments, 4 messages, 1 exam' AS sample_data;