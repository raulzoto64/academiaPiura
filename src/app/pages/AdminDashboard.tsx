import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { adminAPI } from '../lib/api';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, usersData, coursesData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getCourses(),
      ]);
      setStats(statsData.stats);
      setUsers(usersData.users);
      setCourses(coursesData.courses);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="mt-2 text-gray-600">Gestiona toda la plataforma</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Usuarios</p>
                  <p className="mt-2 text-3xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cursos</p>
                  <p className="mt-2 text-3xl font-bold">{stats?.totalCourses || 0}</p>
                </div>
                <BookOpen className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inscripciones</p>
                  <p className="mt-2 text-3xl font-bold">{stats?.totalEnrollments || 0}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Certificados</p>
                  <p className="mt-2 text-3xl font-bold">{stats?.totalCertificates || 0}</p>
                </div>
                <Award className="h-10 w-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users">
              <TabsList>
                <TabsTrigger value="users">Usuarios</TabsTrigger>
                <TabsTrigger value="courses">Cursos</TabsTrigger>
                <TabsTrigger value="instructors">Instructores</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 text-left text-sm font-semibold">Nombre</th>
                        <th className="pb-3 text-left text-sm font-semibold">Email</th>
                        <th className="pb-3 text-left text-sm font-semibold">Rol</th>
                        <th className="pb-3 text-left text-sm font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3 text-sm">{user.name}</td>
                          <td className="py-3 text-sm">{user.email}</td>
                          <td className="py-3 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs ${
                                user.role === 'admin'
                                  ? 'bg-red-100 text-red-800'
                                  : user.role === 'instructor'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="courses" className="mt-6">
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{course.title}</h3>
                          <p className="text-sm text-gray-600">
                            Instructor: {course.instructorName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Categoría: {course.category}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            course.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {course.published ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="instructors" className="mt-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {users
                    .filter((u) => u.role === 'instructor' || u.role === 'admin')
                    .map((instructor) => (
                      <Card key={instructor.id}>
                        <CardContent className="p-6">
                          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-600">
                            {instructor.name?.charAt(0) || 'I'}
                          </div>
                          <h3 className="font-semibold">{instructor.name}</h3>
                          <p className="text-sm text-gray-600">{instructor.email}</p>
                          <p className="mt-2 text-sm">
                            Cursos:{' '}
                            {courses.filter((c) => c.instructorId === instructor.id).length}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
