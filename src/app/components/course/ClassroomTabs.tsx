import { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { MessageSquare, FileText, Video, Calendar, Users } from "lucide-react";

interface ClassroomTabsProps {
  comments: any[];
  resources: any[];
  liveClasses: any[];
  newComment: string;
  setNewComment: (value: string) => void;
  handleAddComment: () => void;
  handleLoadMore: () => void;
  handleShowLess: () => void;
  loadingMore: boolean;
  hasMore: boolean;
  limit: number;
}

export function ClassroomTabs({
  comments,
  resources,
  liveClasses,
  newComment,
  setNewComment,
  handleAddComment,
  handleLoadMore,
  handleShowLess,
  loadingMore,
  hasMore,
  limit
}: ClassroomTabsProps) {

  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {

      if (scrollRef.current && listRef.current) {
        const container = scrollRef.current;
        const list = listRef.current;
        const triggers = list.querySelectorAll('[data-radix-collection-item]');
        
        const triggerWidths = Array.from(triggers).map((t, i) => ({
          index: i,
          width: (t as HTMLElement).offsetWidth,
          text: (t as HTMLElement).innerText
        }));


      }
    };
    
    checkScroll();
    // Check again after a short delay for late rendering
    const timer = setTimeout(checkScroll, 1000);
    
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Card className="max-w-full overflow-hidden" style={{ maxWidth: '100%' }}>
      <CardContent className="p-0 sm:p-0 max-w-full overflow-hidden">
        <Tabs defaultValue="discussion" className="w-full max-w-full overflow-hidden">
          <div className="relative w-full border-b overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto pb-0 thin-scrollbar snap-x snap-mandatory min-w-0 w-full"
            >
              <div ref={listRef} className="w-max flex-nowrap flex min-w-full">
                <TabsList 
                  className="flex h-auto w-max justify-start rounded-none bg-transparent p-0 flex-nowrap gap-4"
                >
                  <TabsTrigger 
                    value="discussion" 
                    className="flex-none !w-auto min-w-[250px] shrink-0 snap-start rounded-lg border-b-2 border-transparent px-8 py-3 text-sm font-bold transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600"
                  >
                    <MessageSquare className="mr-1 sm:mr-2 h-3.5 w-3.5 shrink-0" />
                    <span>Discusión y Foro</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="resources" 
                    className="flex-none !w-auto min-w-[250px] shrink-0 snap-start rounded-lg border-b-2 border-transparent px-8 py-3 text-sm font-bold transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600"
                  >
                    <FileText className="mr-1 sm:mr-2 h-3.5 w-3.5 shrink-0" />
                    <span>Recursos de Clase</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="live" 
                    className="flex-none !w-auto min-w-[250px] shrink-0 snap-start rounded-lg border-b-2 border-transparent px-8 py-3 text-sm font-bold transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600"
                  >
                    <Video className="mr-1 sm:mr-2 h-3.5 w-3.5 shrink-0" />
                    <span>Sesiones en Vivo</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">

          <TabsContent value="discussion" className="mt-6 space-y-6 max-h-[600px] overflow-y-auto thin-scrollbar pr-2">
            {/* Add Comment */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="mb-3 font-semibold">Agregar comentario</h3>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario o pregunta sobre esta clase..."
                rows={3}
                className="bg-white"
              />
              <Button
                onClick={handleAddComment}
                disabled={loadingMore || !newComment.trim()}
                className="mt-2 bg-purple-600 hover:bg-purple-700"
              >
                Publicar
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                Comentarios ({comments.length})
              </h3>
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No hay comentarios aún en esta clase. ¡Sé el primero en preguntar!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border p-4 bg-white shadow-sm">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-600">
                          {comment.nombre?.charAt(0) || comment.userName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {comment.nombre || comment.userName || 'Usuario'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {comment.fecha ? new Date(comment.fecha).toLocaleDateString() : 'Reciente'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed break-words overflow-wrap-anywhere whitespace-normal">
                        {comment.contenido || comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center gap-4 pt-4">
                {hasMore && comments.length >= limit && (
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Cargando...' : 'Cargar más'}
                  </Button>
                )}
                
                {comments.length > limit && (
                  <Button 
                    variant="ghost" 
                    onClick={handleShowLess}
                    className="text-gray-500"
                  >
                    Mostrar menos
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6 max-h-[600px] overflow-y-auto thin-scrollbar pr-2">
            <div className="space-y-3">
              {resources.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No hay recursos descargables para esta clase.</p>
                </div>
              ) : (
                resources.map((resource, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{resource.nombre || resource.titulo}</p>
                        <p className="text-sm text-gray-600 truncate">{resource.descripcion || 'Archivo descargable'}</p>
                      </div>
                    </div>
                    <a href={resource.url_archivo || resource.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        Descargar
                      </Button>
                    </a>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="live" className="mt-6 max-h-[600px] overflow-y-auto thin-scrollbar pr-2">
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Estas son sesiones programadas. Mantente atento a las fechas.
                </p>
              </div>

              {liveClasses.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Video className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No hay clases en vivo programadas aún para este curso.</p>
                </div>
              ) : (
                liveClasses.map((liveClass) => (
                  <Card key={liveClass.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="mb-2 font-semibold text-lg break-words whitespace-normal">
                            {liveClass.title}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span>
                                {liveClass.date} a las {liveClass.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-purple-500" />
                              <span>Instructor: {liveClass.instructorName || 'Academia Piura'}</span>
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
        </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
