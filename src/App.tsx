import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Loja from "./pages/Loja";
import Produto from "./pages/Produto";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/loja" element={<Loja />} />
            <Route path="/produto/:slug" element={<Produto />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
