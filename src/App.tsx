import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Loja from "./pages/Loja";
import Produto from "./pages/Produto";
import Sobre from "./pages/Sobre";

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminProdutos = lazy(() => import("./pages/admin/AdminProdutos"));
const AdminProdutoNovo = lazy(() => import("./pages/admin/AdminProdutoNovo"));
const AdminProdutoEditar = lazy(() => import("./pages/admin/AdminProdutoEditar"));

function AdminFallback() {
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
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/loja" element={<Loja />} />
              <Route path="/produto/:slug" element={<Produto />} />
            </Route>

            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route
              element={
                <Suspense fallback={<AdminFallback />}>
                  <ProtectedRoute />
                </Suspense>
              }
            >
              <Route path="/admin/produtos" element={<AdminProdutos />} />
              <Route path="/admin/produtos/novo" element={<AdminProdutoNovo />} />
              <Route path="/admin/produtos/:id" element={<AdminProdutoEditar />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
