import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import ProductList from "./components/ProductList.jsx";
import ProductPage from "./components/ProductPage.jsx";
import NotFound from "./components/NotFound.jsx";

export default function App() {
  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
