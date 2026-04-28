import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Award, Download, Share2 } from 'lucide-react';
import { certificatesAPI } from '../lib/api';

export function Certificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const data = await certificatesAPI.getAll();
      setCertificates(data.certificates || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando certificados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Certificados</h1>
          <p className="mt-2 text-gray-600">
            Certificados obtenidos por completar cursos
          </p>
        </div>

        {certificates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Award className="mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold">No tienes certificados aún</h2>
              <p className="mb-6 text-gray-600">
                Completa un curso y aprueba el examen final para obtener tu certificado
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="overflow-hidden">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-8 text-white">
                  <div className="mb-4 flex justify-center">
                    <Award className="h-16 w-16" />
                  </div>
                  <h3 className="mb-2 text-center text-lg font-bold">
                    Certificado de Finalización
                  </h3>
                  <p className="text-center text-sm opacity-90">
                    Academia Digital
                  </p>
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="mb-1 text-sm text-gray-600">Curso</p>
                    <p className="font-semibold">{certificate.courseTitle}</p>
                  </div>
                  <div className="mb-4">
                    <p className="mb-1 text-sm text-gray-600">Instructor</p>
                    <p className="font-semibold">{certificate.instructorName}</p>
                  </div>
                  <div className="mb-4">
                    <p className="mb-1 text-sm text-gray-600">Fecha de emisión</p>
                    <p className="font-semibold">
                      {new Date(certificate.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mb-6">
                    <p className="mb-1 text-sm text-gray-600">Número de certificado</p>
                    <p className="font-mono text-xs">{certificate.certificateNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
