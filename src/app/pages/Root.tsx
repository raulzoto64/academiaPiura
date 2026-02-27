import { Outlet } from "react-router";
import { Header } from "../components/Header";
import { AuthProvider } from "../contexts/AuthContext";

export function Root() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <Outlet />
        </main>
        <footer className="border-t bg-gray-900 py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <h3 className="mb-4 font-semibold">Academia Digital</h3>
                <p className="text-sm text-gray-400">
                  Aprende nuevas habilidades con expertos de todo el mundo
                </p>
              </div>
              <div>
                <h3 className="mb-4 font-semibold">Categorías</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Programación</li>
                  <li>Diseño</li>
                  <li>Marketing</li>
                  <li>Negocios</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-semibold">Soporte</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Centro de ayuda</li>
                  <li>Contacto</li>
                  <li>FAQ</li>
                  <li>Términos</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-semibold">Síguenos</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Facebook</li>
                  <li>Twitter</li>
                  <li>Instagram</li>
                  <li>LinkedIn</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              © 2026 Academia Digital. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}