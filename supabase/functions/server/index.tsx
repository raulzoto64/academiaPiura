import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c2d91f01/health", (c) => {
  return c.json({ status: "ok" });
});

// ============== AUTH ==============

// Sign up endpoint
app.post("/make-server-c2d91f01/auth/signup", async (c) => {
  try {
    const { email, password, name, role = 'student' } = await c.req.json();
    
    // Check if user already exists
    const existingUsers = await kv.getByPrefix('user:');
    const userExists = existingUsers.some(user => user.email === email);
    if (userExists) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    // Create user ID
    const userId = `user:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

    // Store user in KV
    const user = {
      id: userId,
      email,
      password, // Store password (in real app, hash it)
      name,
      role,
      createdAt: new Date().toISOString()
    };

    await kv.set(userId, user);

    return c.json({ user: { id: userId, email, name, role } });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Error creating user' }, 500);
  }
});

// Sign in endpoint
app.post("/make-server-c2d91f01/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Find user by email
    const existingUsers = await kv.getByPrefix('user:');
    const user = existingUsers.find(u => u.email === email);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check password
    if (user.password !== password) {
      return c.json({ error: 'Invalid password' }, 401);
    }

    // Generate a simple token (in real app, use JWT)
    const token = `token:${user.id}:${Date.now()}`;
    await kv.set(token, { userId: user.id, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }); // 24h expiration

    return c.json({ 
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (error) {
    console.log('Signin error:', error);
    return c.json({ error: 'Error signing in' }, 500);
  }
});

// Get current user profile
app.get("/make-server-c2d91f01/auth/me", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tokenData = await kv.get(token);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const user = await kv.get(tokenData.userId);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: 'Error fetching user' }, 500);
  }
});

// ============== COURSES ==============

// Helper to authenticate user from token
const authenticateToken = async (token: string) => {
  const tokenData = await kv.get(token);
  if (!tokenData || tokenData.expiresAt < Date.now()) {
    return null;
  }

  const user = await kv.get(tokenData.userId);
  if (!user) {
    return null;
  }

  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Create a new course (instructor only)
app.post("/make-server-c2d91f01/courses", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'instructor' && user.role !== 'admin') {
      return c.json({ error: 'Only instructors can create courses' }, 403);
    }

    const courseData = await c.req.json();
    const courseId = `course:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    const course = {
      id: courseId,
      ...courseData,
      instructorId: user.id,
      instructorName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false
    };

    await kv.set(courseId, course);
    
    // Add to instructor's courses
    const instructorCourses = await kv.get(`instructor:${user.id}:courses`) || [];
    instructorCourses.push(courseId);
    await kv.set(`instructor:${user.id}:courses`, instructorCourses);

    return c.json({ course });
  } catch (error) {
    console.log('Create course error:', error);
    return c.json({ error: 'Error creating course' }, 500);
  }
});

// Get all published courses
app.get("/make-server-c2d91f01/courses", async (c) => {
  try {
    const allCourses = await kv.getByPrefix('course:');
    const publishedCourses = allCourses.filter(course => course.published);
    return c.json({ courses: publishedCourses });
  } catch (error) {
    console.log('Get courses error:', error);
    return c.json({ error: 'Error fetching courses' }, 500);
  }
});

// Get instructor's courses
app.get("/make-server-c2d91f01/instructor/courses", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const courseIds = await kv.get(`instructor:${user.id}:courses`) || [];
    const courses = await kv.mget(courseIds);
    
    return c.json({ courses });
  } catch (error) {
    console.log('Get instructor courses error:', error);
    return c.json({ error: 'Error fetching courses' }, 500);
  }
});

// Update course
app.put("/make-server-c2d91f01/courses/:id", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const courseId = c.req.param('id');
    const course = await kv.get(courseId);
    
    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }

    if (course.instructorId !== user.id) {
      return c.json({ error: 'Not authorized to edit this course' }, 403);
    }

    const updates = await c.req.json();
    const updatedCourse = {
      ...course,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(courseId, updatedCourse);
    return c.json({ course: updatedCourse });
  } catch (error) {
    console.log('Update course error:', error);
    return c.json({ error: 'Error updating course' }, 500);
  }
});

// ============== ENROLLMENTS ==============

// Enroll in a course
app.post("/make-server-c2d91f01/enrollments", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { courseId } = await c.req.json();
    const enrollmentId = `enrollment:${user.id}:${courseId}`;
    
    const enrollment = {
      id: enrollmentId,
      userId: user.id,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedLessons: []
    };

    await kv.set(enrollmentId, enrollment);
    
    // Add to user's enrollments
    const userEnrollments = await kv.get(`user:${user.id}:enrollments`) || [];
    userEnrollments.push(courseId);
    await kv.set(`user:${user.id}:enrollments`, userEnrollments);

    return c.json({ enrollment });
  } catch (error) {
    console.log('Enrollment error:', error);
    return c.json({ error: 'Error enrolling in course' }, 500);
  }
});

// Get user's enrollments
app.get("/make-server-c2d91f01/enrollments", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const courseIds = await kv.get(`user:${user.id}:enrollments`) || [];
    const enrollments = [];
    
    for (const courseId of courseIds) {
      const enrollment = await kv.get(`enrollment:${user.id}:${courseId}`);
      const course = await kv.get(courseId);
      if (enrollment && course) {
        enrollments.push({ ...enrollment, course });
      }
    }

    return c.json({ enrollments });
  } catch (error) {
    console.log('Get enrollments error:', error);
    return c.json({ error: 'Error fetching enrollments' }, 500);
  }
});

// Update progress
app.put("/make-server-c2d91f01/enrollments/:courseId/progress", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const courseId = c.req.param('courseId');
    const { lessonId, progress } = await c.req.json();
    
    const enrollmentId = `enrollment:${user.id}:${courseId}`;
    const enrollment = await kv.get(enrollmentId);
    
    if (!enrollment) {
      return c.json({ error: 'Enrollment not found' }, 404);
    }

    if (lessonId && !enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }
    
    if (progress !== undefined) {
      enrollment.progress = progress;
    }
    
    enrollment.updatedAt = new Date().toISOString();
    await kv.set(enrollmentId, enrollment);

    return c.json({ enrollment });
  } catch (error) {
    console.log('Update progress error:', error);
    return c.json({ error: 'Error updating progress' }, 500);
  }
});

// ============== COMMENTS ==============

// Add comment to lesson
app.post("/make-server-c2d91f01/comments", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { courseId, lessonId, content } = await c.req.json();
    
    const commentId = `comment:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const comment = {
      id: commentId,
      courseId,
      lessonId,
      userId: user.id,
      userName: user.name || 'Usuario',
      content,
      createdAt: new Date().toISOString(),
      replies: []
    };

    await kv.set(commentId, comment);
    
    // Add to lesson's comments
    const lessonComments = await kv.get(`lesson:${lessonId}:comments`) || [];
    lessonComments.push(commentId);
    await kv.set(`lesson:${lessonId}:comments`, lessonComments);

    return c.json({ comment });
  } catch (error) {
    console.log('Add comment error:', error);
    return c.json({ error: 'Error adding comment' }, 500);
  }
});

// Get comments for a lesson
app.get("/make-server-c2d91f01/comments/:lessonId", async (c) => {
  try {
    const lessonId = c.req.param('lessonId');
    const commentIds = await kv.get(`lesson:${lessonId}:comments`) || [];
    const comments = await kv.mget(commentIds);
    
    return c.json({ comments: comments.filter(c => c) });
  } catch (error) {
    console.log('Get comments error:', error);
    return c.json({ error: 'Error fetching comments' }, 500);
  }
});

// ============== MESSAGES ==============

// Send message
app.post("/make-server-c2d91f01/messages", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { recipientId, courseId, content } = await c.req.json();
    
    const messageId = `message:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      senderId: user.id,
      senderName: user.name || 'Usuario',
      recipientId,
      courseId,
      content,
      read: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(messageId, message);
    
    // Add to user's messages
    const userMessages = await kv.get(`user:${recipientId}:messages`) || [];
    userMessages.push(messageId);
    await kv.set(`user:${recipientId}:messages`, userMessages);

    return c.json({ message });
  } catch (error) {
    console.log('Send message error:', error);
    return c.json({ error: 'Error sending message' }, 500);
  }
});

// Get user's messages
app.get("/make-server-c2d91f01/messages", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const messageIds = await kv.get(`user:${user.id}:messages`) || [];
    const messages = await kv.mget(messageIds);
    
    return c.json({ messages: messages.filter(m => m) });
  } catch (error) {
    console.log('Get messages error:', error);
    return c.json({ error: 'Error fetching messages' }, 500);
  }
});

// ============== EXAMS ==============

// Create exam
app.post("/make-server-c2d91f01/exams", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'instructor' && user.role !== 'admin') {
      return c.json({ error: 'Only instructors can create exams' }, 403);
    }

    const examData = await c.req.json();
    const examId = `exam:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    const exam = {
      id: examId,
      ...examData,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(examId, exam);
    
    // Add to course exams
    const courseExams = await kv.get(`course:${examData.courseId}:exams`) || [];
    courseExams.push(examId);
    await kv.set(`course:${examData.courseId}:exams`, courseExams);

    return c.json({ exam });
  } catch (error) {
    console.log('Create exam error:', error);
    return c.json({ error: 'Error creating exam' }, 500);
  }
});

// Submit exam
app.post("/make-server-c2d91f01/exams/:examId/submit", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const examId = c.req.param('examId');
    const { answers } = await c.req.json();
    
    const exam = await kv.get(examId);
    if (!exam) {
      return c.json({ error: 'Exam not found' }, 404);
    }

    // Calculate score
    let correctAnswers = 0;
    exam.questions.forEach((question: any, index: number) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / exam.questions.length) * 100;
    const passed = score >= (exam.passingScore || 70);

    const submissionId = `submission:${user.id}:${examId}:${Date.now()}`;
    const submission = {
      id: submissionId,
      examId,
      userId: user.id,
      answers,
      score,
      passed,
      submittedAt: new Date().toISOString()
    };

    await kv.set(submissionId, submission);
    
    // Add to user's submissions
    const userSubmissions = await kv.get(`user:${user.id}:submissions`) || [];
    userSubmissions.push(submissionId);
    await kv.set(`user:${user.id}:submissions`, userSubmissions);

    return c.json({ submission });
  } catch (error) {
    console.log('Submit exam error:', error);
    return c.json({ error: 'Error submitting exam' }, 500);
  }
});

// ============== CERTIFICATES ==============

// Generate certificate
app.post("/make-server-c2d91f01/certificates", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { courseId } = await c.req.json();
    const course = await kv.get(courseId);
    
    if (!course) {
      return c.json({ error: 'Course not found' }, 404);
    }

    const enrollmentId = `enrollment:${user.id}:${courseId}`;
    const enrollment = await kv.get(enrollmentId);
    
    if (!enrollment || enrollment.progress < 100) {
      return c.json({ error: 'Course not completed' }, 400);
    }

    const certificateId = `certificate:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const certificate = {
      id: certificateId,
      userId: user.id,
      userName: user.name,
      courseId,
      courseTitle: course.title,
      instructorName: course.instructorName,
      issuedAt: new Date().toISOString(),
      certificateNumber: `CERT-${Date.now()}`
    };

    await kv.set(certificateId, certificate);
    
    // Add to user's certificates
    const userCertificates = await kv.get(`user:${user.id}:certificates`) || [];
    userCertificates.push(certificateId);
    await kv.set(`user:${user.id}:certificates`, userCertificates);

    return c.json({ certificate });
  } catch (error) {
    console.log('Generate certificate error:', error);
    return c.json({ error: 'Error generating certificate' }, 500);
  }
});

// Get user's certificates
app.get("/make-server-c2d91f01/certificates", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const certificateIds = await kv.get(`user:${user.id}:certificates`) || [];
    const certificates = await kv.mget(certificateIds);
    
    return c.json({ certificates: certificates.filter(c => c) });
  } catch (error) {
    console.log('Get certificates error:', error);
    return c.json({ error: 'Error fetching certificates' }, 500);
  }
});

// ============== LIVE CLASSES ==============

// Create live class
app.post("/make-server-c2d91f01/live-classes", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'instructor' && user.role !== 'admin') {
      return c.json({ error: 'Only instructors can create live classes' }, 403);
    }

    const liveClassData = await c.req.json();
    const liveClassId = `liveclass:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    const liveClass = {
      id: liveClassId,
      ...liveClassData,
      instructorId: user.id,
      instructorName: user.name,
      createdAt: new Date().toISOString()
    };

    await kv.set(liveClassId, liveClass);
    
    // Add to course live classes
    const courseLiveClasses = await kv.get(`course:${liveClassData.courseId}:liveclasses`) || [];
    courseLiveClasses.push(liveClassId);
    await kv.set(`course:${liveClassData.courseId}:liveclasses`, courseLiveClasses);

    return c.json({ liveClass });
  } catch (error) {
    console.log('Create live class error:', error);
    return c.json({ error: 'Error creating live class' }, 500);
  }
});

// Get live classes for course
app.get("/make-server-c2d91f01/live-classes/:courseId", async (c) => {
  try {
    const courseId = c.req.param('courseId');
    const liveClassIds = await kv.get(`course:${courseId}:liveclasses`) || [];
    const liveClasses = await kv.mget(liveClassIds);
    
    return c.json({ liveClasses: liveClasses.filter(lc => lc) });
  } catch (error) {
    console.log('Get live classes error:', error);
    return c.json({ error: 'Error fetching live classes' }, 500);
  }
});

// ============== ADMIN ==============

// Get all users (admin only)
app.get("/make-server-c2d91f01/admin/users", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    const filteredUsers = users.filter(u => u.email); // Only user profiles
    
    return c.json({ users: filteredUsers });
  } catch (error) {
    console.log('Get users error:', error);
    return c.json({ error: 'Error fetching users' }, 500);
  }
});

// Get all courses (admin only)
app.get("/make-server-c2d91f01/admin/courses", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const courses = await kv.getByPrefix('course:');
    
    return c.json({ courses });
  } catch (error) {
    console.log('Get all courses error:', error);
    return c.json({ error: 'Error fetching courses' }, 500);
  }
});

// Get platform statistics (admin only)
app.get("/make-server-c2d91f01/admin/stats", async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await authenticateToken(token);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    const courses = await kv.getByPrefix('course:');
    const enrollments = await kv.getByPrefix('enrollment:');
    const certificates = await kv.getByPrefix('certificate:');

    const stats = {
      totalUsers: users.filter(u => u.email).length,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalCertificates: certificates.length,
      instructors: users.filter(u => u.role === 'instructor').length,
      students: users.filter(u => u.role === 'student').length
    };
    
    return c.json({ stats });
  } catch (error) {
    console.log('Get stats error:', error);
    return c.json({ error: 'Error fetching stats' }, 500);
  }
});

Deno.serve(app.fetch);