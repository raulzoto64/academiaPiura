import { useState } from "react";
import { courses, categories } from "../data/courses";
import { CourseCard } from "../components/CourseCard";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

export function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

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
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Empezar ahora
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full overflow-x-auto flex justify-start">
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
      <section className="py-12">
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
            {filteredCourses.map((course) => (
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
