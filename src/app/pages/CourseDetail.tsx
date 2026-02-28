import { useParams, Link } from "react-router";
import { courses } from "../data/courses";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Star,
  Users,
  Clock,
  BarChart,
  ShoppingCart,
  Play,
  CheckCircle2,
  Globe,
  Award,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";
import { coursesAPI } from "../lib/api";

export function CourseDetail() {
  const { id } = useParams();
  const course = courses.find((c) => c.id === Number(id));
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

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
      // Simulate purchase with fake data
      const fakePaymentData = {
        cardNumber: "4111 1111 1111 1111",
        cardName: "Juan Pérez",
        expiryDate: "12/26",
        cvv: "123",
        address: "Calle Principal 123",
        city: "Lima",
        country: "Perú",
        zipCode: "15001"
      };

      // In a real app, this would connect to the payment gateway
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll just simulate success
      setPurchaseSuccess(true);
      
      // In real app, you would call the API
      // await coursesAPI.simulatePurchase(course.id.toString(), fakePaymentData);
      
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gray-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Badge className="mb-4">{course.category}</Badge>
              <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                {course.title}
              </h1>
              <p className="mb-6 text-lg text-gray-300">{course.description}</p>
              
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
                Instructor: <span className="text-white font-semibold">{course.instructor}</span>
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
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview">Descripción</TabsTrigger>
                  <TabsTrigger value="content">Contenido</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-bold">Lo que aprenderás</h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {course.learningOutcomes.map((outcome, index) => (
                          <div key={index} className="flex gap-3">
                            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                            <span className="text-sm">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-bold">Requisitos</h2>
                      <ul className="space-y-2">
                        {course.requirements.map((req, index) => (
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
                      <div className="flex flex-wrap gap-2">
                        {course.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary">
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
                        {[1, 2, 3, 4, 5].map((section) => (
                          <div key={section} className="border-b pb-4 last:border-0">
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="font-semibold">Sección {section}: Introducción</h3>
                              <span className="text-sm text-gray-500">6 clases • 45 min</span>
                            </div>
                            <ul className="ml-4 space-y-2 text-sm text-gray-600">
                              <li className="flex items-center gap-2">
                                <Play className="h-3 w-3" />
                                <span>Clase {section}.1: Introducción al tema</span>
                                <span className="ml-auto text-gray-400">8:30</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Play className="h-3 w-3" />
                                <span>Clase {section}.2: Conceptos fundamentales</span>
                                <span className="ml-auto text-gray-400">12:15</span>
                              </li>
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="instructor">
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-6 flex items-start gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl font-bold text-purple-600">
                          {course.instructor.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{course.instructor}</h2>
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
                          <div className="font-semibold">12</div>
                          <div className="text-gray-600">Cursos</div>
                        </div>
                      </div>
                      <p className="text-gray-700">
                        Experto en {course.category.toLowerCase()} con más de 10 años de experiencia
                        en la industria. Apasionado por la enseñanza y ayudar a estudiantes a alcanzar
                        sus metas profesionales.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-6 text-xl font-bold">Reseñas de estudiantes</h2>
                      <div className="space-y-6">
                        {[1, 2, 3].map((review) => (
                          <div key={review} className="border-b pb-6 last:border-0">
                            <div className="mb-2 flex items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold">
                                U{review}
                              </div>
                              <div>
                                <div className="font-semibold">Usuario {review}</div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">
                              Excelente curso, muy completo y bien explicado. El instructor tiene
                              una gran habilidad para enseñar conceptos complejos de manera simple.
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Mobile Purchase Card */}
            <div className="lg:hidden">
              <Card className="sticky bottom-0">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-2xl font-bold">${course.price}</span>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Agregar
                    </Button>
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
                  <h2 className="mb-2 text-xl font-bold">¡Compra exitosa!</h2>
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
    </div>
  );
}