import { useParams, Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Star,
  Users,
  Clock,
  BarChart,
  ShoppingCart,
  Play,
  Globe,
  Award,
  Smartphone,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect, useMemo } from "react";
import { coursesAPI, mapHitpolyCourseToUI, type HitpolyCourse, cacheService } from "../lib/hitpolyApi";
import { CourseTabs } from "../components/course/CourseTabs";

export function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [instructor, setInstructor] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && id) {
      return !cacheService.get(`course_${id}`);
    }
    return true;
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [freeLoading, setFreeLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);

  const checkEnrollment = async () => {
    if (user?.id) {
      try {
        const enrolledCourses = await coursesAPI.getUserEnrolledCourses(Number(user.id));
        const enrollment = enrolledCourses.find((c: any) => {
          const matchId = Number(c.id) === Number(id);
          const matchCursoId = Number(c.curso_id) === Number(id);
          const matchTitle = (course?.title && c.titulo === course.title);
          
          if (matchId || matchCursoId || matchTitle) {
            return true;
          }
          return false;
        });

        if (enrollment) {
          const fechaInscripcion = enrollment.fecha_inscripcion ? new Date(enrollment.fecha_inscripcion) : new Date();
          const hoy = new Date();
          const diferenciaTiempo = hoy.getTime() - fechaInscripcion.getTime();
          const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));
          const diasRestantes = Math.max(0, 30 - diasTranscurridos);
          
          setIsEnrolled(true);
          setRemainingDays(diasRestantes);
        } else {
          // If we haven't loaded the course title yet, don't finalize the 'false' state
          // because we might need to match by title later.
          if (course?.title) {
            setIsEnrolled(false);
            setRemainingDays(null);
          }
        }
      } catch (e) {
        console.error('Error checking enrollment:', e);
      }
    }
  };

  // Run check on mount / when user or id changes
  useEffect(() => {
    if (user && id) {
      checkEnrollment();
    }
  }, [user, id, course?.title]);

  // 1. Cargar datos desde cache inicialmente (Optimistic UI) - RESPUESTA INSTANTÁNEA
  useEffect(() => {
    if (!id) return;
    const courseId = Number(id);
    const cachedCourse = cacheService.get(`course_${courseId}`);
    const cachedModules = cacheService.get(`modules_${courseId}`);
    const cachedCategories = cacheService.get(`categories`);

    if (cachedCourse) {
      const mappedCourse = mapHitpolyCourseToUI(cachedCourse, cachedCategories || []);
      setCourse({ ...mappedCourse, raw: cachedCourse });
      
      if (cachedModules) {
        setModules(cachedModules);
      }
      
      // QUITAMOS EL LOADING DE INMEDIATO si hay cache
      setLoading(false);
      console.log('⚡ [CACHE] Datos cargados instantáneamente desde localStorage');
    }
    
    // También verificar inscripción de forma instantánea si hay cache
    if (user?.id) {
      const enrollmentCacheKey = `enrollment_${id}_${user.id}`;
      const cachedEnrollment = cacheService.get(enrollmentCacheKey);
      if (cachedEnrollment) {
        setIsEnrolled(cachedEnrollment.isEnrolled);
        setRemainingDays(cachedEnrollment.remainingDays);
      }
    }
  }, [id, user?.id]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      
      // 2. Solo mostramos loading si NO tenemos nada en cache
      const courseId = Number(id);
      const hasCache = cacheService.get(`course_${courseId}`);
      if (!hasCache) {
        setLoading(true);
      }
      
      try {
        const courseId = Number(id);
        
        // 1. Cargar datos básicos del curso y categorías para el mapeo
        const [hitpolyCourse, hitpolyCategories] = await Promise.all([
          coursesAPI.getCourseById(courseId),
          coursesAPI.getCategories()
        ]);

        if (hitpolyCourse) {
          const mappedCourse = mapHitpolyCourseToUI(hitpolyCourse, hitpolyCategories);
          setCourse({
            ...mappedCourse,
            raw: hitpolyCourse
          });

          // 2. Cargar Módulos y Clases
          const hitpolyModules = await coursesAPI.getModulesByCourse(courseId);

          
          // Para cada módulo, cargar sus clases
          const modulesWithClasses = await Promise.all(
            hitpolyModules.map(async (mod: any) => {
              const classes = await coursesAPI.getClassesByModule(mod.id);

              return { ...mod, classes };
            })
          );
          setModules(modulesWithClasses);

          // 4. Cargar Comentarios de todas las clases
          // Los comentarios se cargarán después (limitados)
          // 5. Cargar Recursos (solo los primeros 20 para no saturar)
          const allResources: any[] = [];

          let resourceCount = 0;
          for (const mod of modulesWithClasses) {
            if (resourceCount >= 20) break;
            if (mod.classes && mod.classes.length > 0) {
              for (const clase of mod.classes) {
                if (resourceCount >= 20) break;
                const classResources = await coursesAPI.getClassResources(clase.id);
                allResources.push(...classResources);
                resourceCount += classResources.length;
              }
            }
          }

          setResources(allResources);

          // 6. Cargar Comentarios (solo los primeros 20 para no saturar)
          const allComments: any[] = [];

          let commentCount = 0;
          for (const mod of modulesWithClasses) {
            if (commentCount >= 20) break;
            if (mod.classes && mod.classes.length > 0) {
              for (const clase of mod.classes) {
                if (commentCount >= 20) break;
                const classComments = await coursesAPI.getCommentsByClass(clase.id);
                allComments.push(...classComments);
                commentCount += classComments.length;
              }
            }
          }

          setComments(allComments);

          // 3. Cargar Instructor
          if (hitpolyCourse.profesor_id) {
            const instructorData = await coursesAPI.getInstructor(hitpolyCourse.profesor_id);
            setInstructor(instructorData);
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const handleFreeAccess = async () => {

    setFreeLoading(true);
    try {
      let currentUser = user;
      
      if (!currentUser) {
        if (!formData.email || !formData.password || !formData.name) {
          toast.error("Por favor completa todos los campos de registro");
          setFreeLoading(false);
          return;
        }
        
        await signUp(formData.email, formData.password, formData.name, 'customer');
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
        }
      }

      if (currentUser) {
        // Intentar inscribir al usuario (solo si aún no está inscrito)
        if (!isEnrolled) {
          const success = await coursesAPI.enrollUser(Number(currentUser.id), Number(id), {
            objetivo_curso: "Acceso gratuito 1 mes",
          });

          if (success) {
            setIsEnrolled(true);
            setRemainingDays(30); // Mes completo
            // Actualizar cache para respuesta instantánea al volver
            const enrollmentCacheKey = `enrollment_${id}_${currentUser.id}`;
            cacheService.set(enrollmentCacheKey, { isEnrolled: true, remainingDays: 30 }, 1);
            
            toast.success("¡Acceso concedido! Disfruta de tu mes gratis.");
            setShowFreeModal(false);
            navigate(`/classroom/${id}`);
          } else {
            toast.error("No se pudo procesar el acceso gratuito.");
          }
        } else {
          // Ya está inscrito, redirigir directamente
          navigate(`/classroom/${id}`);
        }
      }
    } catch (error) {
      console.error("🚨 [FREE_ACCESS] Error crítico durante el proceso:", error);
      toast.error("Error al registrarse u obtener acceso.");
    } finally {
      setFreeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <h1 className="text-2xl font-bold mb-4">Cargando curso...</h1>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Curso no encontrado</h1>
          <Link to="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePurchase = async () => {
    setPurchaseLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPurchaseSuccess(true);
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gray-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3 overflow-hidden">
            <div className="lg:col-span-2 min-w-0">
              <Badge className="mb-4">{course.category}</Badge>
              <h1 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl break-words leading-tight">
                {course.title}
              </h1>
              <p className="mb-6 text-base sm:text-lg text-gray-300 leading-relaxed max-w-3xl">{course.description}</p>
              
              <div className="mb-6 flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-400">({course.students.toLocaleString()} estudiantes)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  <span>{course.level}</span>
                </div>
              </div>

              <p className="text-gray-400">
                Instructor: <span className="text-white font-semibold">
                  {instructor ? `${instructor.nombre} ${instructor.apellido}` : 'Cargando...'}
                </span>
              </p>
            </div>

            {/* Course Preview Card - Desktop */}
            <div className="hidden lg:block">
              <Card className="sticky top-24 overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  {course.previewVideoUrl ? (
                    <video 
                      src={course.previewVideoUrl} 
                      className="h-full w-full object-cover"
                      controls
                      poster={course.image}
                    />
                  ) : (
                    <ImageWithFallback
                      src={course.image}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="mb-4 text-3xl font-bold">${course.price}</div>
                  <div className="space-y-3">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Agregar al carrito
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowPurchaseModal(true)}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Comprar ahora
                    </Button>
                    {isEnrolled ? (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2"
                        onClick={() => {
                          navigate(`/classroom/${id}`);
                        }}
                      >
                        <div className="flex items-center">
                          <Play className="mr-2 h-4 w-4" />
                          <span>Ver curso</span>
                        </div>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                        onClick={() => setShowFreeModal(true)}
                      >
                        <Award className="mr-2 h-4 w-4" />
                        Aprovechar gratis
                      </Button>
                    )}
                  </div>
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span>Acceso de por vida</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                      <span>Acceso en móvil y TV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span>Certificado de finalización</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 min-w-0">
              <CourseTabs 
                course={course}
                modules={modules}
                resources={resources}
                instructor={instructor}
                comments={comments}
              />
            </div>

            {/* Mobile Purchase Card */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
              <Card className="shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase font-bold tracking-tight">Precio</span>
                      <span className="text-xl font-bold">${course.price}</span>
                    </div>
                    <div className="flex flex-1 gap-2">
                      {isEnrolled ? (
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-10 flex flex-col items-center justify-center py-1 leading-none"
                          onClick={() => navigate(`/classroom/${id}`)}
                        >
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            <span>Ver curso</span>
                          </div>
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          className="flex-1 border-purple-600 text-purple-600 text-xs h-10 px-1 whitespace-normal leading-tight font-medium"
                          onClick={() => setShowFreeModal(true)}
                        >
                          Aprovechar gratis
                        </Button>
                      )}
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs h-10">
                        <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                        Comprar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              {purchaseSuccess ? (
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </div>
                  <h2 className="mb-2 text-xl font-bold">Â¡Compra exitosa!</h2>
                  <p className="mb-6 text-gray-600">
                    Has comprado el curso "{course.title}" con éxito.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        setShowPurchaseModal(false);
                        setPurchaseSuccess(false);
                        // Redirect to course content
                      }}
                    >
                      Ver curso
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setShowPurchaseModal(false);
                        setPurchaseSuccess(false);
                      }}
                    >
                      Continuar navegando
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="mb-4 text-xl font-bold">Finalizar compra</h2>
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Curso</span>
                      <span className="font-semibold">{course.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio</span>
                      <span className="font-semibold">${course.price}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">${course.price}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="mb-3 font-semibold">Datos de pago (ficticios)</h3>
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="text-sm text-gray-600">Número de tarjeta</label>
                      <div className="mt-1 p-2 border rounded text-sm">4111 1111 1111 1111</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Nombre en tarjeta</label>
                      <div className="mt-1 p-2 border rounded text-sm">Juan Pérez</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-600">Fecha de expiración</label>
                        <div className="mt-1 p-2 border rounded text-sm">12/26</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">CVV</label>
                        <div className="mt-1 p-2 border rounded text-sm">123</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={handlePurchase}
                      disabled={purchaseLoading}
                    >
                      {purchaseLoading ? (
                        <div className="flex items-center">
                          <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Procesando...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pagar ${course.price}
                        </div>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowPurchaseModal(false)}
                      disabled={purchaseLoading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Free Access Modal */}
      {showFreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <Award className="h-10 w-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Acceso Gratis</h2>
                <p className="mt-2 text-gray-600">
                  Regístrate y obtén acceso total a este curso por 30 días.
                </p>
              </div>

              {user ? (
                <div className="mb-6 rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-700">
                    Hola <span className="font-bold">{user.name}</span>, haz clic debajo para activar tu mes de regalo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-purple-500 focus:outline-none"
                      placeholder="Ej. Juan Pérez"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
                    <input
                      type="email"
                      className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-purple-500 focus:outline-none"
                      placeholder="juan@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                      type="password"
                      className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-purple-500 focus:outline-none"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  className="w-full bg-purple-600 py-6 text-lg hover:bg-purple-700"
                  onClick={handleFreeAccess}
                  disabled={freeLoading}
                >
                  {freeLoading ? "Procesando..." : user ? "Activar mi mes gratis" : "Registrarme y empezar"}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-500"
                  onClick={() => setShowFreeModal(false)}
                  disabled={freeLoading}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
