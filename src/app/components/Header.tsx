import { Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, Search, Menu, User, BookOpen, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { coursesAPI } from "../lib/hitpolyApi";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, profile, signOut, isInstructor, isAdmin } = useAuth();

  const [courses, setCourses] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    coursesAPI.getCourses().then(data => setCourses(data)).catch(() => {});
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowDropdown(true);
  };

  const searchResults = courses.filter(c => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    const titleMatch = c.titulo && c.titulo.toLowerCase().includes(q);
    const descMatch = c.descripcion && c.descripcion.toLowerCase().includes(q);
    return titleMatch || descMatch;
  }).slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">AcademiaDigital</span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden flex-1 max-w-xl mx-8 md:block" ref={searchRef}>
            <div className="relative">
              <form className="relative" onSubmit={handleSearchSubmit}>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar cursos..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                />
              </form>
              
              {showDropdown && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-md shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto thin-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map(course => (
                      <div 
                        key={course.id} 
                        className="p-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3 transition-colors"
                        onClick={() => {
                          navigate(`/course/${course.id}`);
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {course.url_foto || course.imagen ? (
                            <img src={course.url_foto || course.imagen} alt={course.titulo} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-gray-400 m-2.5" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{course.titulo}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      No se encontraron cursos
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm hover:text-purple-600 ${
                location.pathname === "/" ? "text-purple-600" : "text-gray-700"
              }`}
            >
              Explorar
            </Link>
            {user && (
              <>
                <Link
                  to="/my-courses"
                  className={`text-sm hover:text-purple-600 ${
                    location.pathname === "/my-courses" ? "text-purple-600" : "text-gray-700"
                  }`}
                >
                  Mis Cursos
                </Link>
                {isInstructor && (
                  <Link
                    to="/instructor/dashboard"
                    className={`text-sm hover:text-purple-600 ${
                      location.pathname.startsWith("/instructor") ? "text-purple-600" : "text-gray-700"
                    }`}
                  >
                    Panel Instructor
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`text-sm hover:text-purple-600 ${
                      location.pathname.startsWith("/admin") ? "text-purple-600" : "text-gray-700"
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
            {user ? (
              <>
                <Link to="/cart" className="relative">
                  <ShoppingCart className="h-5 w-5 text-gray-700 hover:text-purple-600" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-600 text-xs text-white flex items-center justify-center">
                    0
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{profile?.name}</span>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5 mr-2" />
                    Ingresar
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Search - Mobile */}
        <div className="pb-4 md:hidden relative" ref={searchRef}>
          <form className="relative" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar cursos..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
            />
          </form>
          {showDropdown && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-md shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto thin-scrollbar">
              {searchResults.length > 0 ? (
                searchResults.map(course => (
                  <div 
                    key={course.id} 
                    className="p-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3 transition-colors"
                    onClick={() => {
                      navigate(`/course/${course.id}`);
                      setShowDropdown(false);
                      setSearchQuery('');
                      setIsMenuOpen(false);
                    }}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {course.url_foto || course.imagen ? (
                        <img src={course.url_foto || course.imagen} alt={course.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-gray-400 m-2.5" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{course.titulo}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No se encontraron cursos
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-sm hover:text-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Explorar
              </Link>
              {user && (
                <>
                  <Link
                    to="/my-courses"
                    className="text-sm hover:text-purple-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis Cursos
                  </Link>
                  {isInstructor && (
                    <Link
                      to="/instructor/dashboard"
                      className="text-sm hover:text-purple-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Panel Instructor
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="text-sm hover:text-purple-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/cart"
                    className="text-sm hover:text-purple-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Carrito
                  </Link>
                </>
              )}
              {user ? (
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-sm font-semibold">{profile?.name}</span>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Ingresar
                    </Button>
                  </Link>
                  <Link to="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}