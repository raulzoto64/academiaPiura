# Academia digital como Udemy

This is a code bundle for Academia digital como Udemy. The original project is available at https://www.figma.com/design/Jkwu11wgMR5CDSVtjcScVm/Academia-digital-como-Udemy.

## Running the code

1. Run `npm i` to install the dependencies.

2. **Initialize the database**:
   - Go to your Supabase project: https://supabase.com/dashboard/project/svavlvvcjilzmvdentaj
   - Click on "SQL Editor" in the left sidebar
   - Click on "New Query"
   - Copy the entire content from `supabase/init.sql`
   - Paste it into the query editor
   - Click the "Run" button to execute the script

3. Run `npm run dev` to start the development server.

## Database Initialization

The `supabase/init.sql` script creates all necessary tables:

### Tables Created:
- `users`: User accounts (students, instructors, admins)
- `courses`: Course information
- `lessons`: Course lessons
- `enrollments`: User course enrollments
- `comments`: Lesson comments
- `messages`: Direct messages
- `exams`: Course exams
- `exam_submissions`: Exam submissions and results
- `certificates`: Course completion certificates
- `live_classes`: Live class sessions

### Initial Admin User:
- Email: admin@academiaperu.com
- Password: admin123 (CHANGE THIS IN PRODUCTION!)

### Verification:
After running the script:
1. Click on "Table Editor" in the left sidebar
2. Verify that all tables are listed under the "public" schema
3. Check that the `users` table contains the admin user

If you see any errors or the tables aren't created, try re-running the script.