# Documentación de Endpoints - HitpolyAcademy

Este documento describe los endpoints del backend PHP de HitpolyAcademy que se utilizan en el proyecto academiaPiura-main.

## Base URLs

**Para Cursos (y sus módulos, clases, comentarios, instructores):**
```
https://apiacademy.hitpoly.com/ajax/
```

**Para Autenticación (Login, Registro, Validar Token) y Cargos/Sectores:**
```
https://apiweb.hitpoly.com/ajax/
```

---

## 1. CURSOS

### Obtener todos los cursos
**Endpoint:** `traerCursosController.php`  
**Método:** POST  
**Body:**
```json
{
  "accion": "getCursos"
}
```
**Respuesta exitosa:**
```json
{
  "status": "success",
  "cursos": {
    "cursos": [
      {
        "id": 1,
        "titulo": "Nombre del curso",
        "subtitulo": "Subtítulo del curso",
        "descripcion_corta": "Descripción breve",
        "descripcion_larga": "Descripción completa",
        "url_banner": "https://...",
        "portada_targeta": "https://...",
        "url_video_introductorio": "https://...",
        "precio": 99.99,
        "moneda": "USD",
        "nivel": "principiante",
        "duracion_estimada": "42 horas",
        "estado": "Publicado",
        "profesor_id": 1,
        "categoria_id": 1,
        "horas_por_semana": "10",
        "fecha_inicio_clases": "2024-01-15",
        "fecha_limite_inscripcion": "2024-01-10",
        "ritmo_aprendizaje": "Flexible",
        "tipo_clase": "En vivo",
        "titulo_credencial": "Certificado",
        "descripcion_credencial": "Descripción del certificado",
        "temario": "[{\"titulo\":\"Tema 1\"},{\"titulo\":\"Tema 2\"}]"
      }
    ]
  }
}
```

---

## 2. MÓDULOS

### Obtener módulos de un curso
**Endpoint:** `getModulosPorCursoController.php`  
**Método:** POST  
**Body:**
```json
{
  "accion": "getModulosCurso",
  "id": 1
}
```
**Respuesta exitosa:**
```json
{
  "status": "success",
  "modulos": [
    {
      "id": 1,
      "curso_id": 1,
      "titulo": "Módulo 1: Introducción",
      "descripcion": "Descripción del módulo",
      "orden": 1
    }
  ]
}
```

---

## 3. CLASES

### Obtener clases de un módulo
**Endpoint:** `traerTodasClasesController.php`  
**Método:** POST  
**Body:**
```json
{
  "accion": "getClases",
  "modulo_id": 1
}
```
**Respuesta exitosa:**
```json
{
  "status": "success",
  "clases": [
    {
      "id": 1,
      "modulo_id": 1,
      "titulo": "Clase 1: Bienvenida",
      "descripcion": "Descripción de la clase",
      "url_video": "https://youtube.com/watch?v=...",
      "duracion_segundos": 1800,
      "orden": 1,
      "tipo_clase": "video",
      "es_gratis_vista_previa": 1
    }
  ]
}
```

---

## 4. COMENTARIOS

### Obtener comentarios de una clase
**Endpoint:** `getComentariosController.php`  
**Método:** POST  
**Body:**
```json
{
  "accion": "getComentarios",
  "clase_id": 1,
  "limit": 20,
  "offset": 0
}
```
**Respuesta exitosa:**
```json
{
  "status": "success",
  "comentarios": [
    {
      "id": 1,
      "clase_id": 1,
      "usuario_id": 1,
      "nombre": "Juan Pérez",
      "contenido": "Excelente clase!",
      "fecha_comentario": "2024-01-15 10:30:00",
      "respuesta_a_comentario_id": null,
      "es_respuesta_profesor": 0,
      "editado": 0,
      "destacado": 0
    }
  ]
}
```

### Publicar un comentario
**Endpoint:** `comentarioController.php`  
**Método:** POST  
**Body:**
```json
{
  "accion": "comentarios",
  "clase_id": 1,
  "usuario_id": 1,
  "contenido": "Mi comentario",
  "respuesta_a_comentario_id": null,
  "es_respuesta_profesor": 0,
  "editado": 0,
  "destacado": 0
}
```
**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Comentario publicado correctamente"
}
```

---

## 5. INSTRUCTORES

### Obtener información del instructor
**Endpoint:** `traerAlumnoProfesorController.php`  
**Método:** POST  
**Body:**
```json
{
  "accion": "getAlumnoProfesor",
  "id": 1
}
```
**Respuesta exitosa:**
```json
{
  "status": "success",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "biografia": "Instructor con 10 años de experiencia",
    "avatar": "https://..."
  }
}
```

---

## 6. AUTENTICACIÓN

### Login
**Endpoint:** `auth.php`  
**Método:** POST  
**Body:**
```json
{
  "action": "login",
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```
**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "name": "Nombre Usuario",
    "email": "usuario@ejemplo.com",
    "role": "customer"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...."
}
```

### Registro
**Endpoint:** `auth.php`  
**Método:** POST  
**Body:**
```json
{
  "action": "register",
  "name": "Nombre Usuario",
  "email": "nuevo@ejemplo.com",
  "password": "contraseña123"
}
```
**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Registro exitoso",
  "user": {
    "id": 123,
    "name": "Nombre Usuario",
    "email": "nuevo@ejemplo.com",
    "role": "customer"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...."
}
```

### Validar Token JWT
**Endpoint:** `auth.php`  
**Método:** POST  
**Body:**
```json
{
  "action": "validateToken",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...."
}
```
**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Token válido"
}
```

---

## 7. CARGOS / SECTORES

### Obtener cargos disponibles
**Endpoint:** `traerCargoController.php`  
**Método:** POST  
**Body:** Sin parámetros
**Respuesta exitosa:**
```json
{
  "status": "success",
  "cargos": [
    {
      "id": 1,
      "nombre": "Estudiante"
    },
    {
      "id": 2,
      "nombre": "Profesor"
    }
  ]
}
```

---

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@academiaperu.com` | `admin123` | Admin |
| `profesor.juan@academiaperu.com` | `profesor123` | Instructor |
| `profesor.maria@academiaperu.com` | `profesor123` | Instructor |
| `alumno.ana@academiaperu.com` | `alumno123` | Estudiante |
| `alumno.luis@academiaperu.com` | `alumno123` | Estudiante |

---

## Implementación en academiaPiura-main

El servicio API se encuentra en `src/app/lib/hitpolyApi.ts` y proporciona:

1. **`hitpolyApi.getCourses()`** - Obtiene todos los cursos
2. **`hitpolyApi.getCourseById(id)`** - Obtiene un curso por ID
3. **`hitpolyApi.getModulesByCourse(courseId)`** - Obtiene módulos de un curso
4. **`hitpolyApi.getClassesByModule(moduleId)`** - Obtiene clases de un módulo
5. **`hitpolyApi.getCommentsByClass(classId, limit, offset)`** - Obtiene comentarios
6. **`hitpolyApi.postComment(data)`** - Publica un comentario
7. **`hitpolyApi.getInstructor(instructorId)`** - Obtiene información del instructor
8. **`hitpolyApi.login(email, password)`** - Inicia sesión
9. **`hitpolyApi.register(data)`** - Registra un usuario
10. **`hitpolyApi.validateToken(token)`** - Valida token JWT
11. **`hitpolyApi.getCargos()`** - Obtiene lista de cargos/sectores

### Mappers de datos

- **`mapHitpolyCourseToUI(course)`** - Convierte el formato de Hitpoly al formato de la UI
- **`mapHitpolyInstructorToUI(instructor)`** - Convierte el formato del instructor

---

## Notas importantes

1. Todos los endpoints usan `POST` con `Content-Type: application/json`
2. Las respuestas incluyen un campo `status` que indica éxito (`success`) o error
3. Los IDs son numéricos en el backend de Hitpoly
4. El campo `temario` viene como string JSON que debe ser parseado
5. Las fechas vienen en formato `YYYY-MM-DD` o `YYYY-MM-DD HH:MM:SS`