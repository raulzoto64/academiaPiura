import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { CourseCard } from "../components/CourseCard";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { coursesAPI, mapHitpolyCourseToUI, type HitpolyCourse } from "../lib/hitpolyApi";
import { useAuth } from "../contexts/AuthContext";

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollToCourses = () => {
    const section = document.getElementById('courses-grid');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar cursos (con conteo de alumnos) y categorías en paralelo
        const [allCoursesData, hitpolyCategories] = await Promise.all([
          coursesAPI.getAll(),
          coursesAPI.getCategories()
        ]);

        const hitpolyCourses = allCoursesData.courses;

        // Mapear categorías
        const dynamicCategories = hitpolyCategories.map((cat: any) => cat.nombre || cat.titulo || cat).filter(Boolean);
        setCategories(["Todos", ...dynamicCategories]);

        setCourses(hitpolyCourses);
        setError(null);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('No se pudieron cargar los datos. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = selectedCategory === "Todos"
    ? courses
    : courses.filter(course => course.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              Aprende sin límites
            </h1>
            <p className="mb-8 text-lg text-purple-100">
              Accede a miles de cursos en línea. Desarrolla nuevas habilidades y
              alcanza tus metas profesionales con instructores expertos.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => user ? scrollToCourses() : navigate('/auth')}
            >
              {user ? "Descubre los mejores cursos" : "Empezar ahora"}
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full overflow-x-auto flex justify-start thin-scrollbar pb-2">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Courses Grid */}
      <section id="courses-grid" className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === "Todos" 
                ? "Cursos populares" 
                : `Cursos de ${selectedCategory}`}
            </h2>
            <p className="mt-2 text-gray-600">
              {filteredCourses.length} cursos disponibles
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            ¿Listo para transformar tu carrera?
          </h2>
          <p className="mb-8 text-lg text-gray-300">
            Únete a miles de estudiantes que ya están aprendiendo
          </p>
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            Ver todos los cursos
          </Button>
        </div>
      </section>
    </div>
  );
}
