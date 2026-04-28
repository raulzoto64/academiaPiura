import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { BookOpen, Play, Award } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI, cacheService } from "../lib/hitpolyApi";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function MyCourses() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchMyCourses = async () => {
      // 0. Carga inicial desde cache
      const cachedEnrollments = cacheService.get(`user_enrolled_${user.id}`);
      const cachedCatalog = cacheService.get(`all_courses`);

      if (cachedEnrollments && cachedCatalog) {
        const mappedFromCache = cachedEnrollments.map((enrollment: any) => {
          const courseDetails = cachedCatalog.find((c: any) =>
            Number(c.id) === Number(enrollment.id) ||
            Number(c.id) === Number(enrollment.curso_id) ||
            c.titulo === enrollment.titulo
          );

          const realId = courseDetails?.id || enrollment.id || enrollment.curso_id;

          // Obtener progreso de localStorage como fallback
          const localProgressData = localStorage.getItem(`course_progress_${user.id}_${realId}`);
          const progress = localProgressData ? parseInt(localProgressData) : (enrollment.progreso || 0);

          return {
            id: realId,
            title: courseDetails?.titulo || enrollment.titulo,
            progress: progress,
            lastAccessed: "Recientemente",
            thumbnail: courseDetails?.portada_targeta || courseDetails?.url_banner
          };
        }).filter((c: any) => c.id);

        if (mappedFromCache.length > 0) {
          setEnrolledCourses(mappedFromCache);
          setLoading(false);
        }
      }

      try {
        if (enrolledCourses.length === 0) setLoading(true);
        // Traer inscripciones y el catálogo completo para cruzar datos
        const [myEnrollments, allCoursesData] = await Promise.all([
          coursesAPI.getUserEnrolledCourses(Number(user.id)),
          coursesAPI.getAll()
        ]);

        const myEnrollments = await coursesAPI.getUserEnrolledCourses(Number(user.id));
        const catalog = allCoursesData.courses || [];

        // Cruzar datos para obtener imágenes, IDs reales, etc.
        const mappedCourses = myEnrollments.map((enrollment: any) => {
          // 1. Resolver el curso en el catálogo primero para tener el ID real
          const courseDetails = catalog.find((c: any) =>
            Number(c.id) === Number(enrollment.id) ||
            Number(c.id) === Number(enrollment.curso_id) ||
            c.title === enrollment.titulo ||
            c.titulo === enrollment.titulo
          );

          const realId = courseDetails?.id || enrollment.id || enrollment.curso_id;

          // 2. Ahora que tenemos el realId, buscar progreso en localStorage
          const localProgressData = localStorage.getItem(`course_progress_${user.id}_${realId}`);
          const progress = localProgressData ? parseInt(localProgressData) : (enrollment.progreso || 0);

          console.log(`DEBUG [MyCourses]: Mapeando curso "${enrollment.titulo || enrollment.title}"`, {
            idRel: realId,
            progresoAPI: enrollment.progreso,
            progresoLocal: localProgressData,
            resultadoFinal: progress
          });

          return {
            id: realId,
            title: courseDetails?.title || enrollment.titulo || enrollment.title,
            progress: progress,
            lastAccessed: "Recientemente",
            thumbnail: courseDetails?.image || "https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGxhcHRvcCUyMGNvZGV8ZW58MXx8fHwxNzcyMDUzOTAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
          };
        }).filter((c: any) => c.id); // Filtrar los que no pudieron ser mapeados correctamente (sin ID)

        setEnrolledCourses(mappedCourses);
        setEnrolledCourses(mappedCourses);
      } catch (error) {
        console.error("Error al cargar mis cursos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando tus cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Mis Cursos</h1>
          <p className="text-gray-600">Continúa tu aprendizaje donde lo dejaste</p>
        </div>

        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold">No tienes cursos aún</h2>
              <p className="mb-6 text-gray-600">
                Explora nuestro catálogo y comienza a aprender hoy
              </p>
              <Link to="/">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Explorar cursos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden gap-0 border-none shadow-sm bg-white">
                <div className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch md:h-52 overflow-hidden bg-white">
                    <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
                      <ImageWithFallback
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover block"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center p-6 overflow-hidden">
                      <div className="w-full">
                        <h3 className="mb-1 text-xl font-semibold leading-tight line-clamp-2">{course.title}</h3>
                        <p className="mb-4 text-xs text-gray-500">
                          Último acceso: {course.lastAccessed}
                        </p>

                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">Progreso</span>
                          <span className="font-bold text-purple-600">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="mb-5 h-1.5" />

                        <div className="flex gap-3">
                          <Link to={`/classroom/${course.id}`} className="flex-1 md:flex-initial">
                            <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                              <Play className="mr-1.5 h-3.5 w-3.5" />
                              Ir al aula
                            </Button>
                          </Link>
                          {course.progress === 100 && (
                            <Link to="/certificates">
                              <Button variant="outline" size="sm">
                                <Award className="mr-1.5 h-3.5 w-3.5" />
                                Certificado
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Section */}
        {enrolledCourses.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-purple-600">
                  {enrolledCourses.length}
                </div>
                <div className="text-sm text-gray-600">Cursos activos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-purple-600">
                  {Math.round(
                    enrolledCourses.reduce((acc, c) => acc + Number(c.progress || 0), 0) /
                    enrolledCourses.length
                  )}%
                </div>
                <div className="text-sm text-gray-600">Progreso promedio</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-purple-600">
                  {enrolledCourses.filter((c) => c.progress === 100).length}
                </div>
                <div className="text-sm text-gray-600">Cursos completados</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}