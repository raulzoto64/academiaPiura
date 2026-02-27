import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c2d91f01`;

// Helper to get auth token from localStorage
export const getAuthToken = async () => {
  return localStorage.getItem('authToken');
};

// API client
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
};

// Auth API
export const authAPI = {
  signUp: (email: string, password: string, name: string, role: string = 'student') =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    }),
  
  signIn: (email: string, password: string) =>
    apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  getCurrentUser: () => apiRequest('/auth/me'),
};

// Courses API
export const coursesAPI = {
  getAll: () => apiRequest('/courses'),
  getInstructorCourses: () => apiRequest('/instructor/courses'),
  create: (courseData: any) =>
    apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }),
  update: (courseId: string, courseData: any) =>
    apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    }),
};

// Enrollments API
export const enrollmentsAPI = {
  enroll: (courseId: string) =>
    apiRequest('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    }),
  getAll: () => apiRequest('/enrollments'),
  updateProgress: (courseId: string, lessonId: string, progress: number) =>
    apiRequest(`/enrollments/${courseId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ lessonId, progress }),
    }),
};

// Comments API
export const commentsAPI = {
  add: (courseId: string, lessonId: string, content: string) =>
    apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify({ courseId, lessonId, content }),
    }),
  getForLesson: (lessonId: string) => apiRequest(`/comments/${lessonId}`),
};

// Messages API
export const messagesAPI = {
  send: (recipientId: string, courseId: string, content: string) =>
    apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, courseId, content }),
    }),
  getAll: () => apiRequest('/messages'),
};

// Exams API
export const examsAPI = {
  create: (examData: any) =>
    apiRequest('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    }),
  submit: (examId: string, answers: any[]) =>
    apiRequest(`/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};

// Certificates API
export const certificatesAPI = {
  generate: (courseId: string) =>
    apiRequest('/certificates', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    }),
  getAll: () => apiRequest('/certificates'),
};

// Live Classes API
export const liveClassesAPI = {
  create: (liveClassData: any) =>
    apiRequest('/live-classes', {
      method: 'POST',
      body: JSON.stringify(liveClassData),
    }),
  getForCourse: (courseId: string) => apiRequest(`/live-classes/${courseId}`),
};

// Admin API
export const adminAPI = {
  getUsers: () => apiRequest('/admin/users'),
  getCourses: () => apiRequest('/admin/courses'),
  getStats: () => apiRequest('/admin/stats'),
};
