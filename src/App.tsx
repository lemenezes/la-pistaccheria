import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Loja = lazy(() => import("./pages/Loja"));
const Produto = lazy(() => import("./pages/Produto"));
const Sobre = lazy(() => import("./pages/Sobre"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminWorkspace = lazy(() => import("./pages/admin/AdminWorkspace"));
const AdminProdutos = lazy(() => import("./pages/admin/AdminProdutos"));
const AdminProdutoNovo = lazy(() => import("./pages/admin/AdminProdutoNovo"));
const AdminProdutoEditar = lazy(() => import("./pages/admin/AdminProdutoEditar"));
const AdminCategorias = lazy(() => import("./pages/admin/AdminCategorias"));

function PageFallback() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-[12px] tracking-[0.2em] uppercase text-warm-gray font-light">
        Carregando…
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Home />
                  </Suspense>
                }
              />
              <Route
                path="/sobre"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Sobre />
                  </Suspense>
                }
              />
              <Route
                path="/loja"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Loja />
                  </Suspense>
                }
              />
              <Route
                path="/produto/:slug"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Produto />
                  </Suspense>
                }
              />
            </Route>

            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route
              element={
                <Suspense fallback={<PageFallback />}>
                  <ProtectedRoute />
                </Suspense>
              }
            >
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <AdminWorkspace />
                  </Suspense>
                }
              />
              <Route path="/admin/produtos" element={<AdminProdutos />} />
              <Route path="/admin/produtos/novo" element={<AdminProdutoNovo />} />
              <Route path="/admin/produtos/:id" element={<AdminProdutoEditar />} />
              <Route path="/admin/categorias" element={<AdminCategorias />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
