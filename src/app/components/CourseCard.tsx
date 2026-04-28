import { Link } from "react-router";
import { Star, Users, Clock } from "lucide-react";
import { Course } from "../data/courses";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      to={`/course/${course.id}`}
      className="group block overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-lg"
    >
      <div className="aspect-video w-full overflow-hidden">
        <ImageWithFallback
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs">
            {course.category}
          </Badge>
        </div>
        <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
          {course.title}
        </h3>
        <p className="mb-3 text-sm text-gray-600">{course.instructor}</p>
        
        <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{course.students.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{course.rating}</span>
          </div>
          <div className="text-lg font-bold text-purple-600">
            ${course.price}
          </div>
        </div>
      </div>
    </Link>
  );
}
