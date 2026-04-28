/**
 * Servicio API para conectar con el backend PHP de HitpolyAcademy
 * Endpoints de cursos: https://apiacademy.hitpoly.com/ajax/
 * Endpoints de autenticación y cargos: https://apiweb.hitpoly.com/ajax/
 */

const API_COURSES_BASE_URL = 'https://apiacademy.hitpoly.com/ajax';
const API_AUTH_BASE_URL = 'https://apiweb.hitpoly.com/ajax';

// Tipos de datos del backend PHP
export interface HitpolyCourse {
  id: number;
  titulo: string;
  subtitulo: string;
  descripcion_corta: string;
  descripcion_larga: string;
  url_banner: string;
  portada_targeta: string;
  url_video_introductorio: string;
  precio: number;
  moneda: string;
  nivel: string;
  duracion_estimada: string;
  estado: string;
  profesor_id: number;
  categoria_id: number;
  horas_por_semana: string;
  fecha_inicio_clases: string;
  fecha_limite_inscripcion: string;
  ritmo_aprendizaje: string;
  tipo_clase: string;
  titulo_credencial: string;
  descripcion_credencial: string;
  temario?: string; // JSON string
  preguntas_frecuentes?: string; // JSON string
}

export interface HitpolyModule {
  id: number;
  curso_id: number;
  titulo: string;
  descripcion: string;
  orden: number;
}

export interface HitpolyClass {
  id: number;
  modulo_id: number;
  titulo: string;
  descripcion: string;
  url_video: string;
  duracion_segundos: number;
  orden: number;
  tipo_clase: string;
  es_gratis_vista_previa: number;
}

export interface HitpolyComment {
  id: number;
  clase_id: number;
  usuario_id: number;
  nombre: string;
  contenido: string;
  fecha_comentario: string;
  respuesta_a_comentario_id: number | null;
  es_respuesta_profesor: number;
  editado: number;
  destacado: number;
}

export interface HitpolyInstructor {
  id: number;
  nombre: string;
  apellido: string;
  biografia: string;
  avatar: string;
}

// Mappers para convertir datos de Hitpoly al formato de la UI
export const mapHitpolyCourseToUI = (course: HitpolyCourse, categories: any[] = []) => {
  // Mapear nivel
  const levelMap: Record<string, string> = {
    'principiante': 'Principiante',
    'intermedio': 'Intermedio',
    'avanzado': 'Avanzado'
  };
  
  // Extraer temas del temario
  let topics: string[] = [];
  if (course.temario) {
    try {
      const temario = typeof course.temario === 'string' 
        ? JSON.parse(course.temario) 
        : course.temario;
      
      if (Array.isArray(temario)) {
        topics = temario.map((t: any) => t.titulo || t).filter(Boolean);
      }
    } catch (e) {
      // console.log('Error parsing temario:', e);
    }
  }
  
  // Resolver nombre de categoría por ID
  let categoryName = (course as any).categoria || (course as any).nombre_categoria;
  
  if (!categoryName && course.categoria_id && categories.length > 0) {
    const categoryObj = categories.find(cat => Number(cat.id) === Number(course.categoria_id));
    if (categoryObj) {
      categoryName = categoryObj.nombre || categoryObj.titulo;
    }
  }
  
  if (!categoryName) categoryName = 'General';
  
  // Extraer resultados de aprendizaje
  const learningOutcomes = topics.length > 0 
    ? topics.slice(0, 5) 
    : ['Curso completo con certificación', 'Acceso de por vida', 'Soporte de instructores'];
  
  return {
    id: course.id,
    title: course.titulo,
    instructor: 'Instructor Hitpoly',
    price: course.precio,
    rating: 4.8,
    students: 0,
    image: course.portada_targeta || course.url_banner || 'https://via.placeholder.com/800x400?text=Curso+Hitpoly',
    previewVideoUrl: course.url_video_introductorio || '',
    category: categoryName,
    duration: course.duracion_estimada || '',
    level: levelMap[course.nivel?.toLowerCase()] || course.nivel || 'Todos los niveles',
    description: course.descripcion_corta,
    topics: topics,
    requirements: ['Computadora con acceso a internet', 'Ganas de aprender'],
    learningOutcomes: learningOutcomes
  };
};

export const mapHitpolyInstructorToUI = (instructor: HitpolyInstructor) => {
  return {
    id: instructor.id,
    name: `${instructor.nombre} ${instructor.apellido}`,
    bio: instructor.biografia,
    avatar: instructor.avatar
  };
};
// Servicio de Cache
export const cacheService = {
  get: (key: string) => {
    const cached = localStorage.getItem(`hitpoly_cache_${key}`);
    if (!cached) return null;
    try {
      const { data, expiry } = JSON.parse(cached);
      if (Date.now() > expiry) {
        localStorage.removeItem(`hitpoly_cache_${key}`);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  },
  set: (key: string, data: any, ttlHours: number = 24) => {
    const expiry = Date.now() + (ttlHours * 60 * 60 * 1000);
    localStorage.setItem(`hitpoly_cache_${key}`, JSON.stringify({ data, expiry }));
  },
  remove: (key: string) => {
    localStorage.removeItem(`hitpoly_cache_${key}`);
  }
};

// Funciones de API
export const hitpolyApi = {
  // Obtener todos los cursos
  getCourses: async (): Promise<HitpolyCourse[]> => {
    const cacheKey = 'all_courses';
    const cached = cacheService.get(cacheKey);

    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/traerCursosController.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'getCursos' })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.cursos) {
        const result = Array.isArray(data.cursos) ? data.cursos : (data.cursos.cursos || []);
        cacheService.set(cacheKey, result);
        return result;
      }
      return cached || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return cached || [];
    }
  },

  getCourseById: async (id: number): Promise<HitpolyCourse | null> => {
    const cacheKey = `course_${id}`;
    const cached = cacheService.get(cacheKey);

    try {
      const courses = await hitpolyApi.getCourses();
      const course = courses.find((c: any) => Number(c.id) === Number(id)) || null;
      
      if (course) {
        cacheService.set(cacheKey, course);
        return course;
      }
      return cached || null;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      return cached || null;
    }
  },

  // Obtener módulos de un curso
  getModulesByCourse: async (courseId: number): Promise<HitpolyModule[]> => {
    const cacheKey = `modules_${courseId}`;
    const cached = cacheService.get(cacheKey);

    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/getModulosPorCursoController.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'getModulosCurso', id: courseId })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.modulos)) {
        const result = data.modulos.sort((a: HitpolyModule, b: HitpolyModule) => a.orden - b.orden);
        cacheService.set(cacheKey, result);
        return result;
      }
      return cached || [];
    } catch (error) {
      console.error(`Error fetching modules for course ${courseId}:`, error);
      return cached || [];
    }
  },

  // Obtener categorías
  getCategories: async (): Promise<any[]> => {
    const cacheKey = 'categories';
    const cached = cacheService.get(cacheKey);

    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/getCategoriasController.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'getcategorias' })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.categorias)) {
        cacheService.set(cacheKey, data.categorias);
        return data.categorias;
      }
      return cached || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return cached || [];
    }
  },

  // Obtener clases por curso ID
  getClassesByCourse: async (courseId: number): Promise<HitpolyClass[]> => {
    const cacheKey = `classes_course_${courseId}`;
    const cached = cacheService.get(cacheKey);

    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/traerTodasClasesController.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'getClases', curso_id: courseId })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.clases)) {
        cacheService.set(cacheKey, data.clases);
        return data.clases;
      }
      return cached || [];
    } catch (error) {
      console.error(`Error fetching classes for course ${courseId}:`, error);
      return cached || [];
    }
  },

  // Obtener clases de un módulo
  getClassesByModule: async (moduleId: number): Promise<HitpolyClass[]> => {
    const cacheKey = `classes_mod_${moduleId}`;
    const cached = cacheService.get(cacheKey);

    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/traerTodasClasesController.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'getClases', modulo_id: moduleId })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.clases)) {
        const result = data.clases.filter((c: any) => String(c.modulo_id) === String(moduleId))
                                  .sort((a: HitpolyClass, b: HitpolyClass) => a.orden - b.orden);
        cacheService.set(cacheKey, result);
        return result;
      }
      return cached || [];
    } catch (error) {
      console.error(`Error fetching classes for module ${moduleId}:`, error);
      return cached || [];
    }
  },

  // Obtener cursos inscritos de un usuario
  getUserEnrolledCourses: async (userId: number): Promise<any[]> => {
    const cacheKey = `user_enrolled_${userId}`;
    const cached = cacheService.get(cacheKey);

    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/getInfoUserController.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'getInfo', id: userId })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      if (!text || text.trim() === "") return cached || [];
      
      let data;
      try {
        data = JSON.parse(text);
        console.log('📡 [DEBUG_API] Raw data from getInfoUser:', data);
      } catch (e) {
        return cached || [];
      }
      
      if (data.status === 'success') {
        const courses = data.cursos || (data.usuario && data.usuario.cursos) || [];
        if (Array.isArray(courses)) {
          cacheService.set(cacheKey, courses, 1);
          return courses;
        }
      }
      return cached || [];
    } catch (error) {
      return cached || [];
    }
  },

  // Obtener comentarios de una clase con paginación
  getCommentsByClass: async (classId: number, limit: number = 20, offset: number = 0): Promise<HitpolyComment[]> => {
    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/getComentariosController.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'getComentarios',
          clase_id: String(classId),
          limit: limit,
          offset: offset
        })
      });

      const data = await response.json();
      
      if (data.status === 'success' && data.comentarios) {
        if (Array.isArray(data.comentarios)) {
          return data.comentarios;
        } else if (typeof data.comentarios === 'object' && data.comentarios.error) {
          return [];
        } else if (typeof data.comentarios === 'object') {
          return Object.values(data.comentarios);
        }
      }
      
      return [];
    } catch (error) {
      return [];
    }
  },

  // Publicar un comentario
  postComment: async (commentData: {
    clase_id: number;
    usuario_id: number;
    contenido: string;
    respuesta_a_comentario_id?: number | null;
  }): Promise<boolean> => {
    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/comentarioController.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accion: 'comentarios',
          ...commentData,
          es_respuesta_profesor: 0,
          editado: 0,
          destacado: 0
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.status === 'success';
    } catch (error) {
      return false;
    }
  },

  // Obtener información del instructor
  getInstructor: async (instructorId: number): Promise<HitpolyInstructor | null> => {
    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/traerAlumnoProfesorController.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'getAlumnoProfesor', id: instructorId })
      });

      const data = await response.json();
      if (data.status === 'success' && data.usuario) {
        return data.usuario;
      }
      
      const altResponse = await fetch(`${API_COURSES_BASE_URL}/getInfoUserController.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'getInfo', id: instructorId })
      });

      const altData = await altResponse.json();

      if (altData.status === 'success' && altData.usuario) {
        const user = altData.usuario;
        return {
          id: user.id,
          nombre: user.nombre || user.name,
          apellido: user.apellido || '',
          biografia: user.biografia || user.bio || 'Instructor de la academia',
          avatar: user.avatar || user.url_foto || ''
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  // Login de usuario
  login: async (email: string, password: string): Promise<{ user: any; token: string } | null> => {
    try {
      const response = await fetch(`${API_AUTH_BASE_URL}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.user && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return {
          user: data.user,
          token: data.token
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },

  // Registro de usuario
  register: async (userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: any; token: string } | null> => {
    try {
      const response = await fetch(`${API_AUTH_BASE_URL}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'register',
          name: userData.name,
          email: userData.email,
          password: userData.password
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.user && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return {
          user: data.user,
          token: data.token
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },

  // Validar token JWT
  validateToken: async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_AUTH_BASE_URL}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'validateToken',
          token
        })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'success';
    } catch (error) {
      return false;
    }
  },

  // Cargar cargos / sectores
  getCargos: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_AUTH_BASE_URL}/traerCargoController.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.cargos)) {
        return data.cargos;
      }
      
      return [];
    } catch (error) {
      return [];
    }
  },

  // Obtener cursos destacados
  getFeaturedCourses: async (): Promise<HitpolyCourse[]> => {
    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/traerCursosDestacadosController.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.cursos) {
        const courses = data.cursos.cursos || data.cursos || [];
        return Array.isArray(courses) ? courses : [];
      }
      
      return [];
    } catch (error) {
      return [];
    }
  },

  // Inscribir usuario en curso
  enrollUser: async (userId: number, courseId: number, data?: {
    objetivo_curso?: string;
    industria_actual?: string;
    fecha_inscripcion?: string;
  }): Promise<boolean> => {

    try {
      const requestBody = {
        accion: "inscripciones",
        usuario_id: userId,
        curso_id: courseId,
        fecha_inscripcion: data?.fecha_inscripcion || new Date().toISOString().split('T')[0],
        progreso: 0,
        completado: 0,
        fecha_completado: null,
        ...data
      };


      const response = await fetch(`${API_COURSES_BASE_URL}/cargarInscripcionController.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.status === 'success' || responseData.status === 'warning') {
        cacheService.remove(`user_enrolled_${userId}`);
        return true;
      }
      return false;
    } catch (error) {

      return false;
    }
  },

  // Obtener exámenes
  getExams: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/getExamenController.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accion: 'getExamen' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.examenes)) {
        return data.examenes;
      }
      
      return [];
    } catch (error) {
      // console.log('Error fetching exams:', error);
      return [];
    }
  },

  // Obtener FAQs de un curso
  getCourseFAQs: async (courseId: number): Promise<any[]> => {
    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/getPreguntasYrespuestasController.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accion: 'getFaqs',
          curso_id: courseId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.faqs)) {
        return data.faqs;
      }
      
      return [];
    } catch (error) {
      // console.log('Error fetching FAQs:', error);
      return [];
    }
  },

  // Obtener comentarios destacados (para landing)
  getFeaturedComments: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/traerComentariosDestacadosController.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accion: 'getAll' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.comentarios)) {
        return data.comentarios;
      }
      
      return [];
    } catch (error) {
      // console.log('Error fetching featured comments:', error);
      return [];
    }
  },

  // Obtener nombre del curso por ID de clase
  getCourseNameByClassId: async (classId: number): Promise<string | null> => {
    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/traerNombreCursoPorIdClaseController.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accion: 'getCursosPorIdClase',
          id: classId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.cursos && data.cursos.titulo) {
        return data.cursos.titulo;
      }
      
      return null;
    } catch (error) {
      // console.log('Error fetching course name by class ID:', error);
      return null;
    }
  },

  // Obtener recursos de una clase
  getClassResources: async (classId?: number): Promise<any[]> => {
    try {
      const body = classId 
        ? { accion: 'getRecursos', clase_id: classId }
        : { accion: 'getRecursos' };

      const response = await fetch(`${API_COURSES_BASE_URL}/getAllRecursosController.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.recursos)) {
        return data.recursos;
      }
      
      return [];
    } catch (error) {
      // console.log('Error fetching class resources:', error);
      return [];
    }
  },

  // Obtener valoraciones/resúmen de un curso
  getCourseRatings: async (courseId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/valoracionesController.php?accion=getResumen&curso_id=${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        return data.resumen || data;
      }
      
      return null;
    } catch (error) {
      // console.log('Error fetching course ratings:', error);
      return null;
    }
  }
};

// Exportar funciones de compatibilidad para usar en los componentes existentes
// Exportar funciones de compatibilidad para usar en los componentes existentes
export const coursesAPI = {
  ...hitpolyApi,
  
  // Mantener compatibilidad con la interfaz anterior
  getAll: async () => {
    const courses = await hitpolyApi.getCourses();
    return { courses: courses.map((c) => mapHitpolyCourseToUI(c)) };
  },

  getCourseById: async (id: number) => {
    return await hitpolyApi.getCourseById(id);
  },

  getModulesByCourse: async (courseId: number) => {
    return await hitpolyApi.getModulesByCourse(courseId);
  },

  getClassesByModule: async (moduleId: number) => {
    return await hitpolyApi.getClassesByModule(moduleId);
  },

  getClassesByCourse: async (courseId: number) => {
    return await hitpolyApi.getClassesByCourse(courseId);
  },

  getCategories: async () => {
    return await hitpolyApi.getCategories();
  },

  getUserEnrolledCourses: async (userId: number) => {
    return await hitpolyApi.getUserEnrolledCourses(userId);
  },
  
  getInstructorCourses: async () => {
    // Por ahora retorna todos los cursos (se puede filtrar por instructor_id si es necesario)
    const courses = await hitpolyApi.getCourses();
    return { courses: courses.map((c) => mapHitpolyCourseToUI(c)) };
  },
  
  create: async (courseData: any) => {
    // console.log('Create course not implemented in Hitpoly API yet');
    return { course: null };
  },
  
  update: async (courseId: string, courseData: any) => {
    // console.log('Update course not implemented in Hitpoly API yet');
    return { course: null };
  },
  
  simulatePurchase: async (courseId: string, paymentData: any) => {
    // console.log('Purchase simulation not implemented in Hitpoly API yet');
    return { success: false, message: 'Not implemented' };
  }
};

// Auth API - Compatibility layer for existing components
export const authAPI = {
  signIn: async (email: string, password: string) => {
    const result = await hitpolyApi.login(email, password);
    if (!result) throw new Error('Login failed');
    return { user: result.user, token: result.token };
  },
  
  signUp: async (email: string, password: string, name: string, role: string = 'customer') => {
    const result = await hitpolyApi.register({ email, password, name });
    if (!result) throw new Error('Registration failed');
    return { user: result.user, token: result.token };
  },
  
  getCurrentUser: async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) throw new Error('No user session');
    return { user: JSON.parse(storedUser) };
  },
  
  signOut: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};


// Certificates API - Compatibility layer for existing components
export const certificatesAPI = {
  getCertificates: async (userId: number) => {
    // Return empty array for now - can be connected to real API
    return [];
  },
  
  generateCertificate: async (userId: number, courseId: number) => {
    // Return mock certificate
    return { id: Date.now(), userId, courseId, issuedAt: new Date().toISOString() };
  }
};

// Comments API - Compatibility layer for existing components
export const commentsAPI = {
  getComments: async (classId: number, limit: number = 20, offset: number = 0) => {
    return await hitpolyApi.getCommentsByClass(classId, limit, offset);
  },
  
  // Alias para compatibilidad con Classroom.tsx
  getForLesson: async (classId: any, limit: number = 20, offset: number = 0) => {
    const comments = await hitpolyApi.getCommentsByClass(Number(classId), limit, offset);
    return { comments };
  },
  
  postComment: async (classId: number, userId: number, content: string, parentId?: number) => {
    return await hitpolyApi.postComment({
      clase_id: classId,
      usuario_id: userId,
      contenido: content,
      respuesta_a_comentario_id: parentId || null
    });
  }
};

// Live Classes API - Compatibility layer for existing components
export const liveClassesAPI = {
  getLiveClasses: async (courseId: number) => {
    // Return empty array for now - can be connected to real API
    return [];
  },
  
  joinLiveClass: async (classId: number) => {
    // Return mock join URL
    return { joinUrl: `https://meet.example.com/class/${classId}` };
  }
};

// Exams API - Compatibility layer for existing components
export const examsAPI = {
  getExams: async () => {
    return await hitpolyApi.getExams();
  },
  
  getExamById: async (examId: number) => {
    const exams = await hitpolyApi.getExams();
    return exams.find(e => e.id === examId) || null;
  },
  
  submitExam: async (examId: number, answers: any[]) => {
    // Return mock submission result
    return { success: true, score: 0, submittedAt: new Date().toISOString() };
  }
};

// Admin API - Para compatibilidad con AdminDashboard
export const adminAPI = {
  getStats: async () => {
    try {
      // Intentamos calcular stats reales
      const usersData = await adminAPI.getUsers();
      const coursesData = await adminAPI.getCourses();
      
      return {
        stats: {
          totalUsers: usersData?.users?.length || 0,
          totalCourses: coursesData?.courses?.length || 0,
          totalRevenue: 0, // Mock
          activeStudents: Math.floor((usersData?.users?.length || 0) * 0.8) // Mock
        }
      };
    } catch (e) {
      return {
        stats: { totalUsers: 0, totalCourses: 0, totalRevenue: 0, activeStudents: 0 }
      };
    }
  },
  
  getUsers: async () => {
    try {
      const response = await fetch(`${API_COURSES_BASE_URL}/getAllUserController.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'getAllUser' })
      });
      const data = await response.json();
      if (data.status === 'success') {
        return { users: data.data || data.usuarios || [] };
      }
      return { users: [] };
    } catch (error) {
      // console.log('Error fetching admin users:', error);
      return { users: [] };
    }
  },
  
  getCourses: async () => {
    try {
      const courses = await hitpolyApi.getCourses();
      return { courses };
    } catch (error) {
      // console.log('Error fetching admin courses:', error);
      return { courses: [] };
    }
  }
};
