import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://svavlvvcjilzmvdentaj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2YXZsdnZjamlsem12ZGVudGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNTcwNzgsImV4cCI6MjA4NzczMzA3OH0.-P6nUbbt5WDKjgVwnVag8cAM7THMzuKG4Mks3tGm_Kg'
);

// Auth API
export const authAPI = {
  signUp: async (email: string, password: string, name: string, role: string = 'student') => {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST301') {
      throw new Error('Error checking user existence');
    }

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password, // Store password (in real app, hash it)
        name,
        role
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error creating user');
    }

    // Create a simple token
    const token = `token:${user.id}:${Date.now()}`;
    
    return { 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      token 
    };
  },

  signIn: async (email: string, password: string) => {
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (error) {
      throw new Error('User not found');
    }

    // Check password
    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    // Create a simple token
    const token = `token:${user.id}:${Date.now()}`;
    
    return { 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      token 
    };
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token (format: token:user:timestamp)
    const parts = token.split(':');
    if (parts.length < 3) {
      throw new Error('Invalid token');
    }

    const userId = parts[1];

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error('User not found');
    }

    return { 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    };
  },
};

// Courses API
export const coursesAPI = {
  getAll: async () => {
    const { data: courses, error } = await supabase
      .from('courses')
      .select()
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Error fetching courses');
    }

    return { courses };
  },

  getInstructorCourses: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    const { data: courses, error } = await supabase
      .from('courses')
      .select()
      .eq('instructor_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Error fetching courses');
    }

    return { courses };
  },

  create: async (courseData: any) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    // Create course
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        ...courseData,
        instructor_id: userId,
        instructor_name: user.name,
        published: false
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error creating course');
    }

    return { course };
  },

  // New method to simulate purchase
  simulatePurchase: async (courseId: string, paymentData: any) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (checkError && checkError.code !== 'PGRST301') {
      throw new Error('Error checking enrollment');
    }

    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    // Create enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress: 0,
        completed_lessons: []
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error enrolling in course');
    }

    return { 
      success: true, 
      message: 'Purchase completed successfully',
      enrollment 
    };
  },

  update: async (courseId: string, courseData: any) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Check if user is owner of the course
    const { data: existingCourse, error: checkError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (checkError) {
      throw new Error('Course not found');
    }

    if (existingCourse.instructor_id !== userId) {
      throw new Error('Not authorized to edit this course');
    }

    // Update course
    const { data: course, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      throw new Error('Error updating course');
    }

    return { course };
  },
};

// Enrollments API
export const enrollmentsAPI = {
  enroll: async (courseId: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Check if already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (checkError && checkError.code !== 'PGRST301') {
      throw new Error('Error checking enrollment');
    }

    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    // Create enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress: 0,
        completed_lessons: []
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error enrolling in course');
    }

    return { enrollment };
  },

  getAll: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Get user's enrollments with course data
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses(*)
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error('Error fetching enrollments');
    }

    return { enrollments };
  },

  updateProgress: async (courseId: string, lessonId: string, progress: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Get current enrollment
    const { data: enrollment, error: getError } = await supabase
      .from('enrollments')
      .select('id, completed_lessons')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (getError) {
      throw new Error('Enrollment not found');
    }

    // Update progress and completed lessons
    let updatedCompletedLessons = [...enrollment.completed_lessons];
    if (!updatedCompletedLessons.includes(lessonId)) {
      updatedCompletedLessons.push(lessonId);
    }

    const { data: updatedEnrollment, error } = await supabase
      .from('enrollments')
      .update({
        progress,
        completed_lessons: updatedCompletedLessons
      })
      .eq('id', enrollment.id)
      .select()
      .single();

    if (error) {
      throw new Error('Error updating progress');
    }

    return { enrollment: updatedEnrollment };
  },
};

// Comments API
export const commentsAPI = {
  add: async (courseId: string, lessonId: string, content: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    // Add comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        course_id: courseId,
        lesson_id: lessonId,
        user_id: userId,
        user_name: user.name,
        content,
        replies: []
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error adding comment');
    }

    return { comment };
  },

  getForLesson: async (lessonId: string) => {
    const { data: comments, error } = await supabase
      .from('comments')
      .select()
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error('Error fetching comments');
    }

    return { comments };
  },
};

// Messages API
export const messagesAPI = {
  send: async (recipientId: string, courseId: string, content: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    // Send message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: userId,
        sender_name: user.name,
        recipient_id: recipientId,
        course_id: courseId,
        content,
        read: false
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error sending message');
    }

    return { message };
  },

  getAll: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    const { data: messages, error } = await supabase
      .from('messages')
      .select()
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Error fetching messages');
    }

    return { messages };
  },
};

// Exams API
export const examsAPI = {
  create: async (examData: any) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Create exam
    const { data: exam, error } = await supabase
      .from('exams')
      .insert({
        ...examData,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error creating exam');
    }

    return { exam };
  },

  submit: async (examId: string, answers: any[]) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('questions, passing_score')
      .eq('id', examId)
      .single();

    if (examError) {
      throw new Error('Exam not found');
    }

    // Calculate score
    let correctAnswers = 0;
    exam.questions.forEach((question: any, index: number) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / exam.questions.length) * 100;
    const passed = score >= (exam.passing_score || 70);

    // Create submission
    const { data: submission, error } = await supabase
      .from('exam_submissions')
      .insert({
        exam_id: examId,
        user_id: userId,
        answers,
        score,
        passed
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error submitting exam');
    }

    return { submission };
  },
};

// Certificates API
export const certificatesAPI = {
  generate: async (courseId: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Check enrollment and course completion
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, progress')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (enrollmentError) {
      throw new Error('Enrollment not found');
    }

    if (enrollment.progress < 100) {
      throw new Error('Course not completed');
    }

    // Get course and user details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('title, instructor_name')
      .eq('id', courseId)
      .single();

    if (courseError) {
      throw new Error('Course not found');
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    // Generate certificate
    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        user_name: user.name,
        course_id: courseId,
        course_title: course.title,
        instructor_name: course.instructor_name,
        certificate_number: `CERT-${Date.now()}`
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error generating certificate');
    }

    return { certificate };
  },

  getAll: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    const { data: certificates, error } = await supabase
      .from('certificates')
      .select()
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) {
      throw new Error('Error fetching certificates');
    }

    return { certificates };
  },
};

// Live Classes API
export const liveClassesAPI = {
  create: async (liveClassData: any) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    // Create live class
    const { data: liveClass, error } = await supabase
      .from('live_classes')
      .insert({
        ...liveClassData,
        instructor_id: userId,
        instructor_name: user.name
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error creating live class');
    }

    return { liveClass };
  },

  getForCourse: async (courseId: string) => {
    const { data: liveClasses, error } = await supabase
      .from('live_classes')
      .select()
      .eq('course_id', courseId)
      .order('start_time', { ascending: true });

    if (error) {
      throw new Error('Error fetching live classes');
    }

    return { liveClasses };
  },
};

// Admin API
export const adminAPI = {
  getUsers: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    if (user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { data: users, error } = await supabase
      .from('users')
      .select()
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Error fetching users');
    }

    return { users };
  },

  getCourses: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    if (user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { data: courses, error } = await supabase
      .from('courses')
      .select()
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Error fetching courses');
    }

    return { courses };
  },

  getStats: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Extract user ID from token
    const parts = token.split(':');
    const userId = parts[1];

    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('User not found');
    }

    if (user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    // Get statistics
    const { data: users = [] } = await supabase.from('users').select();
    const { data: courses = [] } = await supabase.from('courses').select();
    const { data: enrollments = [] } = await supabase.from('enrollments').select();
    const { data: certificates = [] } = await supabase.from('certificates').select();

    const stats = {
      totalUsers: users.filter(u => u.email).length,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalCertificates: certificates.length,
      instructors: users.filter(u => u.role === 'instructor').length,
      students: users.filter(u => u.role === 'student').length
    };

    return { stats };
  },
};