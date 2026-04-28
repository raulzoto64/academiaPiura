import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Play,
  MessageSquare,
  Video,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronLeft,
  Users,
  List,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { coursesAPI, commentsAPI, liveClassesAPI, cacheService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ClassroomTabs } from '../components/course/ClassroomTabs';
import VideoPlayer from '../components/course/VideoPlayer';

export function Classroom() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && courseId) {
      return !cacheService.get(`course_${courseId}`) || !cacheService.get(`classes_course_${courseId}`);
    }
    return true;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const LIMIT = 20;

  const currentLesson = allLessons[currentLessonIndex];
  const progressPercentage = allLessons.length > 0 
    ? Math.round((completedLessons.size / allLessons.length) * 100) 
    : 0;

  // Cargar lecciones completadas desde localStorage
  useEffect(() => {
    if (user?.id && courseId) {
      const saved = localStorage.getItem(`completed_lessons_${user.id}_${courseId}`);
      if (saved) {
        try {
          setCompletedLessons(new Set(JSON.parse(saved)));
        } catch (e) {
          console.error("Error parsing completed lessons", e);
        }
      }
    }
  }, [user?.id, courseId]);

  // Sincronizar progreso con localStorage para que aparezca en "Mis Cursos"
  useEffect(() => {
    if (user?.id && courseId && allLessons.length > 0) {
      localStorage.setItem(`course_progress_${user.id}_${courseId}`, progressPercentage.toString());
    }
  }, [progressPercentage, user?.id, courseId, allLessons.length]);

  const toggleLessonComplete = () => {
    if (!currentLesson || !user?.id || !courseId) return;
    
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentLesson.id)) {
        newSet.delete(currentLesson.id);
        toast.info("Lección marcada como no completada");
      } else {
        newSet.add(currentLesson.id);
        toast.success("¡Lección completada!");
        // Auto-avanzar a la siguiente lección si es posible
        if (currentLessonIndex < allLessons.length - 1) {
          setTimeout(() => setCurrentLessonIndex(currentLessonIndex + 1), 1500);
        }
      }
      
      localStorage.setItem(`completed_lessons_${user.id}_${courseId}`, JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // 0. Cargar datos desde cache inicialmente (Optimistic UI) - RESPUESTA INSTANTÁNEA
  useEffect(() => {
    if (!courseId) return;
    const id = Number(courseId);
    const cachedCourse = cacheService.get(`course_${id}`);
    const cachedLessons = cacheService.get(`classes_course_${id}`);

    if (cachedCourse) {
        setCourse(cachedCourse);
        if (cachedLessons) {
          setAllLessons(cachedLessons);
          setLoading(false);
        }
    }
  }, [courseId]);

  // 1. Cargar datos del curso, módulos y clases
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.error("Debes iniciar sesión para acceder al aula");
      navigate('/auth');
      return;
    }

    const fetchClassroomData = async () => {
      if (!courseId) return;
      
      // 2. Solo mostramos loading si NO tenemos nada en cache
      const id = Number(courseId);
      const hasCourseCache = cacheService.get(`course_${id}`);
      const hasLessonsCache = cacheService.get(`classes_course_${id}`);
      
      if (!hasCourseCache || !hasLessonsCache) {
        setLoading(true);
      }
      
      try {
        const id = Number(courseId);
        // 1. Cargar curso primero para tener el título (para el fallback de comparación)
        const courseData = await coursesAPI.getCourseById(id);
        
        if (!courseData) {
          if (!course) {
            toast.error("Curso no encontrado");
            navigate('/');
          }
          return;
        }

        setCourse(courseData);

        // 2. Verificar inscripción
        if (user?.id) {
          const enrolledCourses = await coursesAPI.getUserEnrolledCourses(Number(user.id));

          const isEnrolled = enrolledCourses.some((c: any) => {
            const matchId = Number(c.id) === id;
            const matchCursoId = Number(c.curso_id) === id;
            const matchTitle = (courseData.title && c.titulo === courseData.title) || (courseData.titulo && c.titulo === courseData.titulo);
            return matchId || matchCursoId || matchTitle;
          });
          
          if (!isEnrolled && user.role !== 'admin') {
            toast.error("No tienes acceso a este curso. Por favor inscríbete primero.");
            navigate(`/course/${courseId}`);
            return;
          }
        }

        // 3. Cargar módulos y clases
        const modulesData = await coursesAPI.getModulesByCourse(id);
        
        // Cargar clases para cada módulo y aplanarlas para la navegación
        const flatLessons: any[] = [];
        for (const mod of modulesData) {
          const classes = await coursesAPI.getClassesByModule(mod.id);
          flatLessons.push(...classes.map((c: any) => ({ ...c, moduleTitle: mod.titulo })));
        }
        setAllLessons(flatLessons);
      } catch (error) {

        toast.error("Error al cargar el contenido del curso");
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomData();
  }, [courseId, user?.id]);

  // 2. Cargar comentarios y recursos al cambiar de lección
  useEffect(() => {
    if (currentLesson) {
      setComments([]);
      setResources([]);
      setOffset(0);
      setHasMore(true);
      loadComments(currentLesson.id, 0);
      loadResources(currentLesson.id);
    }
  }, [currentLessonIndex, currentLesson?.id]);

  const loadComments = async (lessonId: number, currentOffset: number, append: boolean = false) => {
    if (currentOffset === 0) setLoadingMore(false);
    else setLoadingMore(true);

    try {
      const data = await commentsAPI.getForLesson(lessonId, LIMIT, currentOffset);
      const newComments = data.comments || [];
      
      if (append) {
        setComments(prev => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }
      setHasMore(newComments.length === LIMIT);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadResources = async (lessonId: number) => {
    try {
      const data = await coursesAPI.getClassResources(lessonId);
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const loadLiveClasses = async () => {
    try {
      const data = await liveClassesAPI.getLiveClasses(Number(courseId));
      setLiveClasses(data || []);
    } catch (error) {
      console.error('Error loading live classes:', error);
    }
  };

  useEffect(() => {
    if (courseId) loadLiveClasses();
  }, [courseId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !currentLesson) return;
    
    try {
      const success = await commentsAPI.postComment(
        currentLesson.id,
        Number(user.id),
        newComment
      );
      
      if (success) {
        setNewComment('');
        loadComments(currentLesson.id, 0);
        toast.success("Comentario publicado");
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("No se pudo publicar el comentario");
    }
  };

  const handleLoadMore = () => {
    if (!currentLesson) return;
    const nextOffset = offset + LIMIT;
    setOffset(nextOffset);
    loadComments(currentLesson.id, nextOffset, true);
  };

  const handleShowLess = () => {
    setComments(prev => prev.slice(0, LIMIT));
    setOffset(0);
    setHasMore(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando aula virtual...</p>
        </div>
      </div>
    );
  }

  if (!course || allLessons.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-gray-50">
        <Video className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="mb-2 text-2xl font-bold text-gray-800">No se encontró contenido</h2>
        <p className="mb-6 text-gray-600 max-w-md">Este curso aún no tiene lecciones publicadas o no tienes los permisos necesarios para acceder.</p>
        <Button onClick={() => navigate(-1)} className="bg-purple-600 hover:bg-purple-700">
          Volver a detalles del curso
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-full overflow-x-hidden">
      {/* Header bar with Back button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="shrink-0 h-9 px-2">
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline ml-1">Volver</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-[10px] sm:text-xs font-medium text-gray-500 truncate uppercase tracking-wider">{course?.titulo}</h2>
              <h1 className="text-sm sm:text-lg font-bold truncate text-gray-900 leading-tight">{currentLesson?.titulo}</h1>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-1.5 sm:gap-1 shrink-0 w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
              <span className="text-[10px] text-gray-400 font-medium sm:hidden">Progreso del curso</span>
              <div className="text-xs sm:text-sm font-bold text-gray-700">
                {progressPercentage}%
              </div>
            </div>
            <div className="w-full sm:w-32 h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div 
                className="h-full bg-green-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 min-w-0 overflow-hidden">
            {/* Video Player */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-black relative group">
                  {currentLesson?.url_video ? (
                    <VideoPlayer 
                      videoUrl={currentLesson.url_video}
                      thumbnail={course?.portada_targeta || course?.image || course?.imagen || course?.url_banner}
                      onVideoCompleted={toggleLessonComplete}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white flex-col gap-2">
                      <Video className="h-12 w-12 text-gray-600" />
                      <p>Esta clase no tiene video disponible.</p>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <Badge variant="outline" className="text-purple-600 border-purple-200 w-fit h-auto py-1 px-2.5 whitespace-normal break-words text-left leading-tight text-[10px] sm:text-xs">
                      {currentLesson?.moduleTitle || 'Módulo'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {currentLesson?.duracion_segundos 
                          ? `${Math.floor(currentLesson.duracion_segundos / 60)} min` 
                          : 'Duración no especificada'}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-bold mb-3 break-words overflow-wrap-anywhere whitespace-normal leading-tight text-gray-900">
                    {currentLesson?.titulo}
                  </h1>
                  <p className="text-xs sm:text-base text-gray-600 leading-relaxed break-words overflow-wrap-anywhere whitespace-normal">
                    {currentLesson?.descripcion}
                  </p>
                </div>
              </CardContent>
            </Card>
            {/* Navigation and Completion Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                  disabled={currentLessonIndex === 0}
                  className="flex-1 sm:flex-none"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentLessonIndex(Math.min(allLessons.length - 1, currentLessonIndex + 1))}
                  disabled={currentLessonIndex === allLessons.length - 1}
                  className="flex-1 sm:flex-none"
                >
                  Siguiente <ChevronLeft className="ml-1 h-4 w-4 rotate-180" />
                </Button>
              </div>

              <Button 
                variant={completedLessons.has(currentLesson?.id) ? "outline" : "default"}
                className={`w-full sm:w-auto transition-all duration-300 whitespace-normal h-auto py-2.5 ${
                  completedLessons.has(currentLesson?.id) 
                    ? "border-green-500 text-green-600 hover:bg-green-50" 
                    : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                }`}
                onClick={toggleLessonComplete}
              >
                <CheckCircle2 className={`mr-2 h-4 w-4 shrink-0 ${completedLessons.has(currentLesson?.id) ? "animate-pulse" : ""}`} />
                <span className="text-left">{completedLessons.has(currentLesson?.id) ? 'Lección completada' : 'Marcar como terminada'}</span>
              </Button>

              {/* Mobile Lessons Button */}
              <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full lg:hidden border-purple-200 text-purple-700 hover:bg-purple-50 whitespace-normal h-auto py-2.5">
                    <List className="mr-2 h-4 w-4 shrink-0" />
                    <span className="text-left">Ver todas las clases</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85%] sm:w-[400px] p-0 flex flex-col h-full">
                  <SheetHeader className="p-4 border-b bg-gray-50 shrink-0">
                    <SheetTitle>Contenido del Curso</SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto flex-1 thin-scrollbar pb-20">
                    <div className="divide-y">
                      {allLessons.map((lesson: any, index: number) => (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setCurrentLessonIndex(index);
                            setIsMobileSheetOpen(false);
                          }}
                          className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50 ${
                            currentLessonIndex === index ? 'bg-purple-50' : ''
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                              completedLessons.has(lesson.id)
                                ? 'bg-green-100 text-green-600'
                                : currentLessonIndex === index
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {completedLessons.has(lesson.id) ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : currentLessonIndex === index ? (
                              <Play className="h-4 w-4 fill-current" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-tight break-words whitespace-normal ${currentLessonIndex === index ? 'text-purple-700' : 'text-gray-700'}`}>
                              {lesson.titulo}
                            </p>
                            <Badge variant="secondary" className="text-[9px] mt-1 px-1.5 h-auto py-0.5 bg-gray-100 text-gray-500 font-normal whitespace-normal break-words">
                              {lesson.moduleTitle}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>


            <ClassroomTabs 
              comments={comments}
              resources={resources}
              liveClasses={liveClasses}
              newComment={newComment}
              setNewComment={setNewComment}
              handleAddComment={handleAddComment}
              handleLoadMore={handleLoadMore}
              handleShowLess={handleShowLess}
              loadingMore={loadingMore}
              hasMore={hasMore}
              limit={LIMIT}
            />
          </div>

          {/* Sidebar - Lesson List (Hidden on Mobile) */}
          <div className="hidden lg:block space-y-4">
            <Card className="sticky top-24">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="text-lg">Contenido del Curso</CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[calc(100vh-250px)] overflow-y-auto thin-scrollbar">
                <div className="divide-y">
                  {allLessons.map((lesson: any, index: number) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(index)}
                      className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50 ${
                        currentLessonIndex === index ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          completedLessons.has(lesson.id)
                            ? 'bg-green-100 text-green-600'
                            : currentLessonIndex === index
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {completedLessons.has(lesson.id) ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : currentLessonIndex === index ? (
                          <Play className="h-4 w-4 fill-current" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm font-semibold leading-tight break-words whitespace-normal ${currentLessonIndex === index ? 'text-purple-700' : 'text-gray-700'}`}>
                            {lesson.titulo}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 h-auto bg-gray-100 text-gray-500 font-normal whitespace-normal break-words">
                            {lesson.moduleTitle}
                          </Badge>
                          <span className="text-[10px] text-gray-400 flex items-center whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-0.5" />
                            {lesson.duracion_segundos ? `${Math.floor(lesson.duracion_segundos / 60)}m` : '0m'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
