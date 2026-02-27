import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { BookOpen, Play, Award } from "lucide-react";
import { Link } from "react-router";

export function MyCourses() {
  // Datos de ejemplo - en una aplicación real vendrían de un backend
  const enrolledCourses = [
    {
      id: 1,
      title: "Desarrollo Web Completo: HTML, CSS, JavaScript y React",
      progress: 45,
      lastAccessed: "Hace 2 días",
      thumbnail: "https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGxhcHRvcCUyMGNvZGV8ZW58MXx8fHwxNzcyMDUzOTAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 3,
      title: "Marketing Digital y Estrategias de Redes Sociales",
      progress: 78,
      lastAccessed: "Hace 1 día",
      thumbnail: "https://images.unsplash.com/photo-1599658880436-c61792e70672?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc3MjA4MTM2Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    }
  ];

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
              <Card key={course.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 flex-shrink-0">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <h3 className="mb-2 text-xl font-semibold">{course.title}</h3>
                        <p className="mb-4 text-sm text-gray-600">
                          Último acceso: {course.lastAccessed}
                        </p>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progreso del curso</span>
                          <span className="font-semibold">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="mb-6" />
                      </div>
                      <div className="flex gap-3">
                        <Link to={`/classroom/${course.id}`} className="flex-1 md:flex-initial">
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            <Play className="mr-2 h-4 w-4" />
                            Ir al aula
                          </Button>
                        </Link>
                        {course.progress === 100 && (
                          <Link to="/certificates">
                            <Button variant="outline">
                              <Award className="mr-2 h-4 w-4" />
                              Ver certificado
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
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
                    enrolledCourses.reduce((acc, c) => acc + c.progress, 0) /
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