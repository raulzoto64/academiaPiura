import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle2, Play, FileText } from "lucide-react";

interface CourseTabsProps {
  course: any;
  modules: any[];
  resources: any[];
  instructor: any;
  comments: any[];
}

export function CourseTabs({ course, modules, resources, instructor, comments }: CourseTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-full overflow-hidden">
      <div className="relative w-full overflow-hidden border-b">
        <div className="flex overflow-x-auto pb-0 thin-scrollbar snap-x snap-mandatory min-w-0">
          <TabsList className="flex h-auto w-max justify-start rounded-none bg-transparent p-0 flex-nowrap">
            <TabsTrigger 
              value="overview" 
              className="shrink-0 snap-start rounded-lg border-b-2 border-transparent px-6 py-3 text-sm font-bold transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600"
            >
              Descripción
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="shrink-0 snap-start rounded-lg border-b-2 border-transparent px-6 py-3 text-sm font-bold transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600"
            >
              Contenido
            </TabsTrigger>
            <TabsTrigger 
              value="resources" 
              className="shrink-0 snap-start rounded-lg border-b-2 border-transparent px-6 py-3 text-sm font-bold transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600"
            >
              Recursos
            </TabsTrigger>
            <TabsTrigger 
              value="instructor" 
              className="shrink-0 snap-start rounded-lg border-b-2 border-transparent px-6 py-3 text-sm font-bold transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600"
            >
              Instructor
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="shrink-0 snap-start rounded-lg border-b-2 border-transparent px-6 py-3 text-sm font-bold transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600"
            >
              Reseñas
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="overview" className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold">Lo que aprenderás</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {course.learningOutcomes.map((outcome: any, index: number) => (
                <div key={index} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                  <span className="text-sm leading-tight break-words flex-1">{outcome}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold">Requisitos</h2>
            <ul className="space-y-2">
              {course.requirements.map((req: any, index: number) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="text-gray-500">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold">Descripción del curso</h2>
            <p className="mb-4 text-gray-700">{course.description}</p>
            <h3 className="mb-3 font-semibold">Temas cubiertos:</h3>
            <div className="flex flex-wrap gap-2 max-w-full">
              {course.topics.map((topic: any, index: number) => (
                <Badge key={index} variant="secondary" className="whitespace-normal break-words h-auto text-left">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="content">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold">Contenido del curso</h2>
            <div className="space-y-4">
              {modules.length > 0 ? (
                modules.map((module) => (
                  <div key={module.id} className="border-b pb-4 last:border-0 overflow-hidden">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-sm sm:text-base leading-tight min-w-0 flex-1">{module.titulo}</h3>
                      <span className="text-sm text-gray-500">
                        {module.classes?.length || 0} clases
                      </span>
                    </div>
                    <ul className="ml-4 space-y-2 text-sm text-gray-600">
                      {module.classes?.map((clase: any) => (
                        <li key={clase.id} className="flex items-center gap-2">
                          <Play className="h-3 w-3" />
                          <span>{clase.titulo}</span>
                          {clase.duracion_segundos && (
                            <span className="ml-auto text-gray-400">
                              {Math.floor(clase.duracion_segundos / 60)}:
                              {(clase.duracion_segundos % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No hay módulos disponibles para este curso.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resources">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold">Recursos del curso</h2>
            <div className="space-y-3">
              {resources.length > 0 ? (
                resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">{resource.nombre || resource.titulo || 'Recurso'}</p>
                        <p className="text-sm text-gray-600">{resource.descripcion || 'Archivo descargable'}</p>
                      </div>
                    </div>
                    <a href={resource.url_archivo || resource.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        Descargar
                      </Button>
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No hay recursos descargables para este curso.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="instructor">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex items-start gap-4">
              {instructor?.avatar ? (
                <img 
                  src={instructor.avatar} 
                  alt={instructor.nombre}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl font-bold text-purple-600">
                  {instructor?.nombre?.charAt(0) || 'I'}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {instructor ? `${instructor.nombre} ${instructor.apellido}` : 'Instructor'}
                </h2>
                <p className="text-gray-600">Instructor profesional</p>
              </div>
            </div>
            <div className="mb-4 flex gap-8 text-sm">
              <div>
                <div className="font-semibold">4.8</div>
                <div className="text-gray-600">Calificación</div>
              </div>
              <div>
                <div className="font-semibold">150,000+</div>
                <div className="text-gray-600">Estudiantes</div>
              </div>
              <div>
                <div className="font-semibold">Activo</div>
                <div className="text-gray-600">Estado</div>
              </div>
            </div>
            <p className="text-gray-700">
              {instructor?.biografia || `Experto en ${course.category.toLowerCase()} con amplia experiencia en la industria.`}
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-6 text-xl font-bold">Reseñas de estudiantes</h2>
            <div className="space-y-6">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-6 last:border-0">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold overflow-hidden">
                        {comment.avatar ? (
                          <img src={comment.avatar} alt={comment.nombre} className="h-full w-full object-cover" />
                        ) : (
                          comment.nombre?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{comment.nombre || 'Estudiante'}</div>
                        <div className="text-xs text-gray-500">Hace unos días</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{comment.contenido}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No hay reseñas para este curso aún.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function Button({ children, size, variant, className, ...props }: any) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
  };
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };
  
  return (
    <button 
      className={`${base} ${(variants as any)[variant || 'default']} ${(sizes as any)[size || 'default']} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
