import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-purple-600">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          Página no encontrada
        </h2>
        <p className="mb-8 text-gray-600">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link to="/">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Home className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
