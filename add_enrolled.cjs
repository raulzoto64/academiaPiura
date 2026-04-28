const fs = require('fs');
let c = fs.readFileSync('src/app/pages/CourseDetail.tsx', 'utf8');
const lines = c.split('\n');
let insertIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '/>' && lines[i+1] && lines[i+1].includes('{purchaseSuccess')) {
    insertIdx = i;
    break;
  }
}

if (insertIdx === -1) {
  console.log('FATAL: Cannot find insertion point');
  process.exit(1);
}

console.log('Found insertion point at line ' + (insertIdx + 1));

const insertContent = `                  )}
                </div>
                <CardContent className="p-6">
                  <div className="mb-4 text-3xl font-bold">\${course.price}</div>
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
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => navigate(\`/classroom/\${id}\`)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Acceder al curso
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                        onClick={() => setShowFreeModal(true)}
                      >
                        <Award className="mr-2 h-4 w-4" />
                        Acceso gratis por 1 mes
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
                      <span>Acceso en m\u00F3vil y TV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span>Certificado de finalizaci\u00F3n</span>
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
                  <TabsTrigger value="overview">Descripci\u00F3n</TabsTrigger>
                  <TabsTrigger value="content">Contenido</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Rese\u00F1as</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-bold">Lo que aprender\u00E1s</h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {course.learningOutcomes.map((outcome: any, index: any) => (
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
                        {course.requirements.map((req: any, index: any) => (
                          <li key={index} className="flex gap-3 text-sm">
                            <span className="text-gray-500">\u2022</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-xl font-bold">Descripci\u00F3n del curso</h2>
                      <p className="mb-4 text-gray-700">{course.description}</p>
                      <h3 className="mb-3 font-semibold">Temas cubiertos:</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.topics.map((topic: any, index: any) => (
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
                        {modules.length > 0 ? (
                          modules.map((module) => (
                            <div key={module.id} className="border-b pb-4 last:border-0">
                              <div className="mb-2 flex items-center justify-between">
                                <h3 className="font-semibold">{module.titulo}</h3>
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
                          <p className="text-gray-500 italic">No hay m\u00F3dulos disponibles para este curso.</p>
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
                            {instructor ? \`\${instructor.nombre} \${instructor.apellido}\` : 'Instructor'}
                          </h2>
                          <p className="text-gray-600">Instructor profesional</p>
                        </div>
                      </div>
                      <div className="mb-4 flex gap-8 text-sm">
                        <div>
                          <div className="font-semibold">4.8</div>
                          <div className="text-gray-600">Calificaci\u00F3n</div>
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
                        {instructor?.biografia || \`Experto en \${course.category.toLowerCase()} con amplia experiencia en la industria.\`}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-6 text-xl font-bold">Rese\u00F1as de estudiantes</h2>
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
                                  <div className="font-semibold">{comment.nombre}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(comment.fecha_comentario).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">
                                {comment.contenido}
                              </p>
                              {comment.es_respuesta_profesor === 1 && (
                                <div className="mt-3 ml-8 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                                  <p className="text-xs font-bold text-blue-600 mb-1">Respuesta del Instructor:</p>
                                  <p className="text-sm text-gray-700">{comment.contenido}</p>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No hay rese\u00F1as para este curso todav\u00EDa.</p>
                        )}
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
                    <span className="text-2xl font-bold">\${course.price}</span>
                    {isEnrolled ? (
                      <Button 
                        className="mr-2 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => navigate(\`/classroom/\${id}\`)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Acceder
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        className="mr-2 border-purple-600 text-purple-600"
                        onClick={() => setShowFreeModal(true)}
                      >
                        Gratis 1 mes
                      </Button>
                    )}
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
            <CardContent className="p-6">`;

lines.splice(insertIdx + 1, 0, insertContent);
fs.writeFileSync('src/app/pages/CourseDetail.tsx', lines.join('\n'));
console.log('SUCCESS: Inserted missing content after line ' + (insertIdx + 1));
