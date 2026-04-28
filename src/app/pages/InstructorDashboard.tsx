import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, BookOpen, Users, BarChart, Video } from 'lucide-react';
import { coursesAPI } from '../lib/api';

export function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await coursesAPI.getInstructorCourses();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Instructor</h1>
            <p className="mt-2 text-gray-600">Gestiona tus cursos y estudiantes</p>
          </div>
          <Link to="/instructor/courses/new">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Crear Curso
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cursos</p>
                  <p className="mt-2 text-3xl font-bold">{courses.length}</p>
                </div>
                <BookOpen className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estudiantes</p>
                  <p className="mt-2 text-3xl font-bold">0</p>
                </div>
                <Users className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingresos</p>
                  <p className="mt-2 text-3xl font-bold">$0</p>
                </div>
                <BarChart className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clases en Vivo</p>
                  <p className="mt-2 text-3xl font-bold">0</p>
                </div>
                <Video className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-600">Cargando...</p>
            ) : courses.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold">No tienes cursos aún</h3>
                <p className="mb-4 text-gray-600">
                  Crea tu primer curso y comienza a enseñar
                </p>
                <Link to="/instructor/courses/new">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Curso
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course: any) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-gray-600">
                        {course.published ? 'Publicado' : 'Borrador'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/instructor/courses/${course.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Link to={`/instructor/courses/${course.id}/students`}>
                        <Button variant="outline" size="sm">
                          Estudiantes
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
