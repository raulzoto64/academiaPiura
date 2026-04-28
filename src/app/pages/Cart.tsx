import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router";

export function Cart() {
  // Datos de ejemplo - en una aplicación real vendrían de un estado global
  const cartItems: any[] = [];

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Carrito de compras</h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold">Tu carrito está vacío</h2>
              <p className="mb-6 text-gray-600">
                Agrega cursos para comenzar tu aprendizaje
              </p>
              <Link to="/">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Explorar cursos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-24 w-32 rounded object-cover"
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.instructor}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-600">
                            ${item.price}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-bold">Resumen</h2>
                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Descuento:</span>
                      <span className="font-semibold text-green-600">-$0.00</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Proceder al pago
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
