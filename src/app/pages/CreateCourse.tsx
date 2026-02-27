import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { coursesAPI } from '../lib/api';

export function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState([{ title: '', description: '', videoUrl: '' }]);
  const [liveClasses, setLiveClasses] = useState([
    { title: '', date: '', time: '', discordLink: '' },
  ]);

  const handleAddLesson = () => {
    setLessons([...lessons, { title: '', description: '', videoUrl: '' }]);
  };

  const handleRemoveLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleAddLiveClass = () => {
    setLiveClasses([...liveClasses, { title: '', date: '', time: '', discordLink: '' }]);
  };

  const handleRemoveLiveClass = (index: number) => {
    setLiveClasses(liveClasses.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const courseData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price') as string),
      level: formData.get('level'),
      duration: formData.get('duration'),
      image: formData.get('image'),
      lessons,
      liveClasses,
      topics: (formData.get('topics') as string).split(',').map((t) => t.trim()),
      requirements: (formData.get('requirements') as string)
        .split('\n')
        .filter((r) => r.trim()),
      learningOutcomes: (formData.get('learningOutcomes') as string)
        .split('\n')
        .filter((o) => o.trim()),
    };

    try {
      await coursesAPI.create(courseData);
      navigate('/instructor/dashboard');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error al crear el curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/instructor/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Curso</h1>
          <p className="mt-2 text-gray-600">Completa la información de tu curso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Curso</Label>
                <Input id="title" name="title" required />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" rows={4} required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    name="category"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    required
                  >
                    <option value="Programación">Programación</option>
                    <option value="Diseño">Diseño</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Fotografía">Fotografía</option>
                    <option value="Música">Música</option>
                    <option value="Negocios">Negocios</option>
                    <option value="Salud y Fitness">Salud y Fitness</option>
                    <option value="Gastronomía">Gastronomía</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="level">Nivel</Label>
                  <select
                    id="level"
                    name="level"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    required
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="price">Precio ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duración (ej: 40 horas)</Label>
                  <Input id="duration" name="duration" required />
                </div>
              </div>

              <div>
                <Label htmlFor="image">URL de Imagen</Label>
                <Input id="image" name="image" type="url" required />
              </div>

              <div>
                <Label htmlFor="topics">Temas (separados por comas)</Label>
                <Input id="topics" name="topics" placeholder="HTML, CSS, JavaScript" required />
              </div>
            </CardContent>
          </Card>

          {/* Learning Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle>¿Qué aprenderán los estudiantes?</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="learningOutcomes">
                Resultados de Aprendizaje (uno por línea)
              </Label>
              <Textarea
                id="learningOutcomes"
                name="learningOutcomes"
                rows={5}
                placeholder="Crear sitios web responsivos&#10;Dominar JavaScript moderno&#10;Construir aplicaciones con React"
                required
              />
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requisitos</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="requirements">
                Requisitos del Curso (uno por línea)
              </Label>
              <Textarea
                id="requirements"
                name="requirements"
                rows={3}
                placeholder="Computadora con acceso a internet&#10;Ganas de aprender&#10;No se requiere experiencia previa"
                required
              />
            </CardContent>
          </Card>

          {/* Lessons */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lecciones del Curso</CardTitle>
                <Button type="button" onClick={handleAddLesson} size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Lección
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold">Lección {index + 1}</h4>
                    {lessons.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLesson(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={lesson.title}
                        onChange={(e) => {
                          const newLessons = [...lessons];
                          newLessons[index].title = e.target.value;
                          setLessons(newLessons);
                        }}
                        required
                      />
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={lesson.description}
                        onChange={(e) => {
                          const newLessons = [...lessons];
                          newLessons[index].description = e.target.value;
                          setLessons(newLessons);
                        }}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>URL del Video</Label>
                      <Input
                        value={lesson.videoUrl}
                        onChange={(e) => {
                          const newLessons = [...lessons];
                          newLessons[index].videoUrl = e.target.value;
                          setLessons(newLessons);
                        }}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Classes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Clases en Vivo (Discord)</CardTitle>
                <Button type="button" onClick={handleAddLiveClass} size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Clase en Vivo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Los estudiantes necesitarán una cuenta de Discord para unirse a las clases en vivo
              </p>
              {liveClasses.map((liveClass, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold">Clase en Vivo {index + 1}</h4>
                    {liveClasses.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLiveClass(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Título</Label>
                      <Input
                        value={liveClass.title}
                        onChange={(e) => {
                          const newLiveClasses = [...liveClasses];
                          newLiveClasses[index].title = e.target.value;
                          setLiveClasses(newLiveClasses);
                        }}
                        placeholder="Sesión de Q&A en vivo"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Fecha</Label>
                        <Input
                          type="date"
                          value={liveClass.date}
                          onChange={(e) => {
                            const newLiveClasses = [...liveClasses];
                            newLiveClasses[index].date = e.target.value;
                            setLiveClasses(newLiveClasses);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Hora</Label>
                        <Input
                          type="time"
                          value={liveClass.time}
                          onChange={(e) => {
                            const newLiveClasses = [...liveClasses];
                            newLiveClasses[index].time = e.target.value;
                            setLiveClasses(newLiveClasses);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Enlace de Discord</Label>
                      <Input
                        value={liveClass.discordLink}
                        onChange={(e) => {
                          const newLiveClasses = [...liveClasses];
                          newLiveClasses[index].discordLink = e.target.value;
                          setLiveClasses(newLiveClasses);
                        }}
                        placeholder="https://discord.gg/..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Curso'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/instructor/dashboard')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
