import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Clock, AlertCircle } from 'lucide-react';
import { examsAPI } from '../lib/api';

export function Exam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock exam data - in real app, fetch from API
  const exam = {
    id: examId,
    title: 'Examen Final - Desarrollo Web',
    courseTitle: 'Desarrollo Web Completo',
    passingScore: 70,
    timeLimit: 60,
    questions: [
      {
        id: 0,
        question: '¿Qué significa HTML?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlinks and Text Markup Language',
        ],
        correctAnswer: 0,
      },
      {
        id: 1,
        question: '¿Cuál es la forma correcta de declarar una variable en JavaScript?',
        options: [
          'variable x = 5;',
          'var x = 5;',
          'x := 5;',
          'dim x = 5;',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: '¿Qué propiedad CSS se usa para cambiar el color del texto?',
        options: ['text-color', 'font-color', 'color', 'text-style'],
        correctAnswer: 2,
      },
      {
        id: 3,
        question: '¿Cuál es el método correcto para seleccionar un elemento por ID en JavaScript?',
        options: [
          'document.querySelector("#id")',
          'document.getElement("id")',
          'document.select("id")',
          'document.find("id")',
        ],
        correctAnswer: 0,
      },
      {
        id: 4,
        question: '¿Qué etiqueta HTML se usa para crear un hipervínculo?',
        options: ['<link>', '<a>', '<href>', '<url>'],
        correctAnswer: 1,
      },
    ],
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < exam.questions.length) {
      alert('Por favor responde todas las preguntas antes de enviar.');
      return;
    }

    setLoading(true);
    try {
      const answerArray = exam.questions.map((_, index) => answers[index]);
      const data = await examsAPI.submit(examId!, answerArray);
      setResult(data.submission);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Error al enviar el examen');
    } finally {
      setLoading(false);
    }
  };

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div
                className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
                  result.passed ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <span
                  className={`text-4xl font-bold ${
                    result.passed ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {Math.round(result.score)}%
                </span>
              </div>

              <h2 className="mb-2 text-2xl font-bold">
                {result.passed ? '¡Felicitaciones!' : 'No aprobaste'}
              </h2>
              <p className="mb-6 text-gray-600">
                {result.passed
                  ? `Has aprobado el examen con ${Math.round(result.score)}%`
                  : `Necesitas al menos ${exam.passingScore}% para aprobar. Obtuviste ${Math.round(
                      result.score
                    )}%`}
              </p>

              {result.passed ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Ahora puedes obtener tu certificado
                  </p>
                  <Button
                    onClick={() => navigate('/certificates')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Ver mi certificado
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setAnswers({});
                    setResult(null);
                  }}
                  variant="outline"
                >
                  Intentar de nuevo
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{exam.title}</h1>
          <p className="text-gray-600">{exam.courseTitle}</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="text-sm">
                    Tiempo límite: {exam.timeLimit} minutos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  <span className="text-sm">
                    Puntaje mínimo: {exam.passingScore}%
                  </span>
                </div>
              </div>
              <div className="text-sm font-semibold">
                {Object.keys(answers).length} / {exam.questions.length} respondidas
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {exam.questions.map((question, qIndex) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Pregunta {qIndex + 1}: {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[qIndex]?.toString()}
                  onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
                >
                  <div className="space-y-3">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={oIndex.toString()}
                          id={`q${qIndex}-o${oIndex}`}
                        />
                        <Label
                          htmlFor={`q${qIndex}-o${oIndex}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || Object.keys(answers).length < exam.questions.length}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Enviando...' : 'Enviar Examen'}
          </Button>
        </div>
      </div>
    </div>
  );
}
