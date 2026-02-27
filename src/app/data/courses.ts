export interface Course {
  id: number;
  title: string;
  instructor: string;
  price: number;
  rating: number;
  students: number;
  image: string;
  category: string;
  duration: string;
  level: string;
  description: string;
  topics: string[];
  requirements: string[];
  learningOutcomes: string[];
}

export const courses: Course[] = [
  {
    id: 1,
    title: "Desarrollo Web Completo: HTML, CSS, JavaScript y React",
    instructor: "María González",
    price: 89.99,
    rating: 4.8,
    students: 45230,
    image: "https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGxhcHRvcCUyMGNvZGV8ZW58MXx8fHwxNzcyMDUzOTAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Programación",
    duration: "42 horas",
    level: "Principiante",
    description: "Aprende desarrollo web desde cero hasta crear aplicaciones profesionales con React. Este curso te llevará paso a paso desde los fundamentos hasta las técnicas más avanzadas.",
    topics: ["HTML5 y CSS3", "JavaScript ES6+", "React y Hooks", "APIs REST", "Git y GitHub"],
    requirements: ["Computadora con acceso a internet", "Ganas de aprender", "No se requiere experiencia previa"],
    learningOutcomes: [
      "Crear sitios web responsivos desde cero",
      "Dominar JavaScript moderno",
      "Construir aplicaciones con React",
      "Trabajar con APIs y datos externos",
      "Implementar proyectos en producción"
    ]
  },
  {
    id: 2,
    title: "Diseño Gráfico Profesional con Adobe Creative Suite",
    instructor: "Carlos Ruiz",
    price: 79.99,
    rating: 4.7,
    students: 32150,
    image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MjEwMTQ5Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Diseño",
    duration: "35 horas",
    level: "Intermedio",
    description: "Domina las herramientas profesionales de diseño gráfico. Aprende Photoshop, Illustrator e InDesign para crear diseños increíbles.",
    topics: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Teoría del color", "Composición visual"],
    requirements: ["Conocimientos básicos de computación", "Adobe Creative Cloud instalado", "Interés en el diseño"],
    learningOutcomes: [
      "Crear diseños profesionales para marcas",
      "Dominar las herramientas de Adobe",
      "Desarrollar tu portfolio de diseño",
      "Aplicar principios de diseño efectivos",
      "Preparar archivos para impresión y digital"
    ]
  },
  {
    id: 3,
    title: "Marketing Digital y Estrategias de Redes Sociales",
    instructor: "Ana Martínez",
    price: 69.99,
    rating: 4.9,
    students: 58900,
    image: "https://images.unsplash.com/photo-1599658880436-c61792e70672?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc3MjA4MTM2Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Marketing",
    duration: "28 horas",
    level: "Principiante",
    description: "Aprende a crear estrategias de marketing digital efectivas. Domina SEO, SEM, redes sociales y analítica web.",
    topics: ["SEO y SEM", "Redes Sociales", "Email Marketing", "Google Analytics", "Publicidad Online"],
    requirements: ["Conocimientos básicos de internet", "Cuenta en redes sociales", "Ganas de emprender"],
    learningOutcomes: [
      "Crear campañas de marketing efectivas",
      "Optimizar sitios web para buscadores",
      "Gestionar redes sociales profesionalmente",
      "Analizar métricas y KPIs",
      "Generar leads y conversiones"
    ]
  },
  {
    id: 4,
    title: "Fotografía Digital: De Principiante a Profesional",
    instructor: "Luis Fernández",
    price: 94.99,
    rating: 4.8,
    students: 28450,
    image: "https://images.unsplash.com/photo-1588420635201-3a9e2a2a0a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGNhbWVyYSUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzIwODE5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Fotografía",
    duration: "38 horas",
    level: "Principiante",
    description: "Aprende fotografía profesional desde los fundamentos hasta técnicas avanzadas de composición, iluminación y edición.",
    topics: ["Fundamentos de fotografía", "Composición", "Iluminación", "Adobe Lightroom", "Retrato y paisaje"],
    requirements: ["Cámara digital o smartphone", "Ganas de aprender", "No se requiere experiencia"],
    learningOutcomes: [
      "Dominar tu cámara en modo manual",
      "Componer fotografías impactantes",
      "Trabajar con luz natural y artificial",
      "Editar fotos profesionalmente",
      "Desarrollar tu estilo fotográfico"
    ]
  },
  {
    id: 5,
    title: "Producción Musical: Crea Música con Ableton Live",
    instructor: "Diego Torres",
    price: 109.99,
    rating: 4.7,
    students: 19870,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHByb2R1Y3Rpb24lMjBzdHVkaW98ZW58MXx8fHwxNzcyMTE5NDgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Música",
    duration: "45 horas",
    level: "Intermedio",
    description: "Aprende producción musical profesional con Ableton Live. Desde la teoría musical hasta la mezcla y masterización.",
    topics: ["Ableton Live", "Teoría musical", "Síntesis de sonido", "Mezcla", "Masterización"],
    requirements: ["Ableton Live instalado", "Conocimientos básicos de música", "Interfaz de audio (recomendado)"],
    learningOutcomes: [
      "Producir música de calidad profesional",
      "Dominar Ableton Live",
      "Mezclar y masterizar tus tracks",
      "Diseñar tus propios sonidos",
      "Crear beats y melodías originales"
    ]
  },
  {
    id: 6,
    title: "Estrategia de Negocios y Liderazgo Empresarial",
    instructor: "Patricia López",
    price: 84.99,
    rating: 4.6,
    students: 41250,
    image: "https://images.unsplash.com/photo-1758691736545-5c33b6255dca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBwcmVzZW50YXRpb258ZW58MXx8fHwxNzcyMTM3Mzk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Negocios",
    duration: "32 horas",
    level: "Intermedio",
    description: "Desarrolla habilidades de liderazgo y aprende a crear estrategias de negocio efectivas para impulsar tu carrera.",
    topics: ["Liderazgo", "Estrategia empresarial", "Gestión de equipos", "Toma de decisiones", "Innovación"],
    requirements: ["Experiencia laboral básica", "Ganas de crecer profesionalmente", "Mente abierta al aprendizaje"],
    learningOutcomes: [
      "Liderar equipos de alto rendimiento",
      "Desarrollar estrategias de negocio",
      "Tomar decisiones estratégicas",
      "Gestionar proyectos complejos",
      "Innovar en tu organización"
    ]
  },
  {
    id: 7,
    title: "Yoga y Meditación: Bienestar Integral",
    instructor: "Laura Sánchez",
    price: 49.99,
    rating: 4.9,
    students: 62340,
    image: "https://images.unsplash.com/photo-1641971215245-b4ac37f97bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIweW9nYSUyMGV4ZXJjaXNlfGVufDF8fHx8MTc3MjEyNjEwOXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Salud y Fitness",
    duration: "25 horas",
    level: "Principiante",
    description: "Transforma tu vida con yoga y meditación. Aprende técnicas para mejorar tu salud física, mental y emocional.",
    topics: ["Posturas de yoga", "Meditación", "Respiración", "Mindfulness", "Bienestar"],
    requirements: ["Mat de yoga", "Ropa cómoda", "Espacio tranquilo para practicar"],
    learningOutcomes: [
      "Practicar yoga de forma segura",
      "Meditar efectivamente",
      "Reducir estrés y ansiedad",
      "Mejorar flexibilidad y fuerza",
      "Desarrollar una práctica diaria"
    ]
  },
  {
    id: 8,
    title: "Cocina Internacional: Técnicas Culinarias Avanzadas",
    instructor: "Roberto Martín",
    price: 74.99,
    rating: 4.8,
    students: 35680,
    image: "https://images.unsplash.com/photo-1617735605078-8a9336be0816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwa2l0Y2hlbiUyMGluZ3JlZGllbnRzfGVufDF8fHx8MTc3MjA5NTc0MXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Gastronomía",
    duration: "40 horas",
    level: "Intermedio",
    description: "Aprende técnicas culinarias profesionales y descubre la cocina de diferentes culturas. De aficionado a chef.",
    topics: ["Técnicas culinarias", "Cocina francesa", "Cocina italiana", "Cocina asiática", "Repostería"],
    requirements: ["Utensilios básicos de cocina", "Ingredientes frescos", "Conocimientos básicos de cocina"],
    learningOutcomes: [
      "Dominar técnicas de chefs profesionales",
      "Preparar platos de diferentes culturas",
      "Trabajar con ingredientes premium",
      "Presentar platos de forma profesional",
      "Crear menús completos"
    ]
  }
];

export const categories = [
  "Todos",
  "Programación",
  "Diseño",
  "Marketing",
  "Fotografía",
  "Música",
  "Negocios",
  "Salud y Fitness",
  "Gastronomía"
];
