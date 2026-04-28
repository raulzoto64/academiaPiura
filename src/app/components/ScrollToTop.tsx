import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Forzar scroll arriba siempre, incluso en retroceso
    const handleScroll = () => {
      window.scrollTo(0, 0);
      
      // Un segundo intento para asegurar que el renderizado no lo mueva
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
      
      return () => clearTimeout(timer);
    };

    // Deshabilitar la restauración automática del navegador si es posible
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    handleScroll();
  }, [pathname, navType]);

  return null;
}
