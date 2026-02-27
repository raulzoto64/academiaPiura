import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { CourseDetail } from "./pages/CourseDetail";
import { MyCourses } from "./pages/MyCourses";
import { Cart } from "./pages/Cart";
import { NotFound } from "./pages/NotFound";
import { Auth } from "./pages/Auth";
import { InstructorDashboard } from "./pages/InstructorDashboard";
import { CreateCourse } from "./pages/CreateCourse";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Classroom } from "./pages/Classroom";
import { Exam } from "./pages/Exam";
import { Certificates } from "./pages/Certificates";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "auth", Component: Auth },
      { path: "course/:id", Component: CourseDetail },
      { path: "classroom/:courseId", Component: Classroom },
      { path: "exam/:examId", Component: Exam },
      { path: "certificates", Component: Certificates },
      { path: "my-courses", Component: MyCourses },
      { path: "cart", Component: Cart },
      { path: "instructor/dashboard", Component: InstructorDashboard },
      { path: "instructor/courses/new", Component: CreateCourse },
      { path: "admin/dashboard", Component: AdminDashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);