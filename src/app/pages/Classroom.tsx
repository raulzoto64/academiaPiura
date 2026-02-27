import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Play,
  MessageSquare,
  Video,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react';
import { commentsAPI, liveClassesAPI } from '../lib/api';

export function Classroom() {
  const { courseId } = useParams();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock course data - in real app, fetch from API
  const course = {
    id: courseId,
    title: 'Desarrollo Web Completo',
    lessons: [
      {
        id: 'lesson1',
        title: 'Introducción al Curso',
        duration: '15:30',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        completed: true,
      },
      {
        id: 'lesson2',
        title: 'HTML y CSS Básico',
        duration: '28:45',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        completed: false,
      },
      {
        id: 'lesson3',
        title: 'JavaScript Fundamentals',
        duration: '35:20',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        completed: false,
      },
    ],
  };

  useEffect(() => {
    if (course.lessons[currentLesson]) {
      loadComments(course.lessons[currentLesson].id);
    }
  }, [currentLesson]);

  useEffect(() => {
    loadLiveClasses();
  }, [courseId]);

  const loadComments = async (lessonId: string) => {
    try {
      const data = await commentsAPI.getForLesson(lessonId);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadLiveClasses = async () => {
    try {
      const data = await liveClassesAPI.getForCourse(courseId!);
      setLiveClasses(data.liveClasses || []);
    } catch (error) {
      console.error('Error loading live classes:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);

    try {
      await commentsAPI.add(
        courseId!,
        course.lessons[currentLesson].id,
        newComment
      );
      setNewComment('');
      loadComments(course.lessons[currentLesson].id);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={course.lessons[currentLesson].videoUrl}
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
                <div className="p-6">
                  <h1 className="mb-2 text-2xl font-bold">
                    {course.lessons[currentLesson].title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.lessons[currentLesson].duration}</span>
                    </div>
                    <Badge variant={course.lessons[currentLesson].completed ? 'default' : 'secondary'}>
                      {course.lessons[currentLesson].completed ? 'Completada' : 'En progreso'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Discussion, Resources, Live Classes */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="discussion">
                  <TabsList className="w-full">
                    <TabsTrigger value="discussion" className="flex-1">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Discusión
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="flex-1">
                      <FileText className="mr-2 h-4 w-4" />
                      Recursos
                    </TabsTrigger>
                    <TabsTrigger value="live" className="flex-1">
                      <Video className="mr-2 h-4 w-4" />
                      Clases en Vivo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="discussion" className="mt-6 space-y-6">
                    {/* Add Comment */}
                    <div>
                      <h3 className="mb-3 font-semibold">Agregar comentario</h3>
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe tu comentario o pregunta..."
                        rows={3}
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={loading || !newComment.trim()}
                        className="mt-2 bg-purple-600 hover:bg-purple-700"
                      >
                        Publicar
                      </Button>
                    </div>

                    {/* Comments List */}
                    <div>
                      <h3 className="mb-4 font-semibold">
                        Comentarios ({comments.length})
                      </h3>
                      <div className="space-y-4">
                        {comments.length === 0 ? (
                          <p className="text-center text-gray-600">
                            No hay comentarios aún. ¡Sé el primero en comentar!
                          </p>
                        ) : (
                          comments.map((comment) => (
                            <div key={comment.id} className="rounded-lg border p-4">
                              <div className="mb-2 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-600">
                                  {comment.userName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">
                                    {comment.userName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="mt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-semibold">Presentación del curso</p>
                            <p className="text-sm text-gray-600">PDF • 2.5 MB</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Descargar
                        </Button>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-semibold">Código de ejemplos</p>
                            <p className="text-sm text-gray-600">ZIP • 5.8 MB</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="live" className="mt-6">
                    <div className="space-y-4">
                      <div className="rounded-lg bg-blue-50 p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Nota:</strong> Necesitas una cuenta de Discord para
                          unirte a las clases en vivo.
                        </p>
                      </div>

                      {liveClasses.length === 0 ? (
                        <p className="text-center text-gray-600">
                          No hay clases en vivo programadas aún.
                        </p>
                      ) : (
                        liveClasses.map((liveClass) => (
                          <Card key={liveClass.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="mb-2 font-semibold">
                                    {liveClass.title}
                                  </h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {liveClass.date} a las {liveClass.time}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Video className="h-4 w-4" />
                                      <span>Instructor: {liveClass.instructorName}</span>
                                    </div>
                                  </div>
                                </div>
                                {liveClass.discordLink && (
                                  <a
                                    href={liveClass.discordLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                                      Unirse a Discord
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Lesson List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contenido del Curso</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {course.lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(index)}
                      className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50 ${
                        currentLesson === index ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          lesson.completed
                            ? 'bg-green-100 text-green-600'
                            : currentLesson === index
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {lesson.completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 text-sm font-semibold">{lesson.title}</p>
                        <p className="text-xs text-gray-600">{lesson.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
