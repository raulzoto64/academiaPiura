# Academia digital como Udemy

This is a code bundle for Academia digital como Udemy. The original project is available at https://www.figma.com/design/Jkwu11wgMR5CDSVtjcScVm/Academia-digital-como-Udemy.

## Running the code

1. Run `npm i` to install the dependencies.

2. Run `npm run dev` to start the development server.

## API Endpoints

This project uses the Hitpoly Academy API for all backend operations:

### Authentication & User Management
- **Base URL:** `https://apiweb.hitpoly.com/ajax/`
- **Endpoints:**
  - `auth.php` - Login, registro y validación de tokens JWT
  - `traerCargoController.php` - Cargar cargos/sectores

### Courses & Content Management
- **Base URL:** `https://apiacademy.hitpoly.com/ajax/`
- **Endpoints:**
  - `traerCursosController.php` - Obtener cursos
  - `getModulosPorCursoController.php` - Obtener módulos por curso
  - `traerTodasClasesController.php` - Obtener clases
  - `getComentariosController.php` - Obtener comentarios
  - `comentarioController.php` - Publicar comentarios
  - `traerAlumnoProfesorController.php` - Obtener información del instructor
  - `getCategoriasController.php` - Obtener categorías
  - `cargarInscripcionController.php` - Inscribir usuario en curso
  - `getInfoUserController.php` - Obtener cursos inscritos del usuario

For detailed API documentation, see [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md).

## Project Structure

```
src/
├── main.tsx          # Entry point
├── app/
│   ├── lib/
│   │   └── hitpolyApi.ts  # API service for Hitpoly endpoints
│   └── pages/
│       ├── Home.tsx       # Home page with course listings
│       └── CourseDetail.tsx # Course detail page
└── styles/           # Global styles
```

## Technologies Used

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Material-UI components
- Radix UI components