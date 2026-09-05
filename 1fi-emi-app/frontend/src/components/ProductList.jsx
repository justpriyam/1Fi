import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, imageUrl } from "../api.js";
import { formatINR } from "../format.js";

export default function ProductList() {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function fetchProducts() {
    setLoading(true);
    setError(null);
    getProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    let isCurrent = true;
    getProducts()
      .then((data) => {
        if (isCurrent) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-8 text-center">
        <p className="font-display text-lg font-medium text-red-900">
          Couldn&apos;t load product catalog
        </p>
        <p className="mt-1 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={fetchProducts}
          className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm ring-1 ring-line hover:bg-surface"
        >
          🔄 Retry Connection
        </button>
      </div>
    );
  }

  if (loading || !products) {
    return (
      <div>
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-line bg-surface p-4"
            >
              <div className="aspect-[4/3] rounded-xl bg-slate-200" />
              <div className="mt-4 h-3 w-16 rounded bg-slate-200" />
              <div className="mt-2 h-6 w-36 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-24 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Shop on EMI
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Every plan below is backed by the mutual funds and shares you already hold —
          your portfolio is the collateral, not your credit score. Zero downpayment, instant approval.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => {
          const discount = p.mrp - p.startingPrice;
          return (
            <Link
              key={p.id}
              to={`/products/${p.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-md"
            >
              {/* Top Row: Badge & Brand */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {p.brand}
                </span>
                {p.badge && (
                  <span className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-600 ring-1 ring-red-200 bg-red-50">
                    {p.badge}
                  </span>
                )}
              </div>

              {/* Product Visual */}
              <div className="my-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50/60 p-2">
                <img
                  src={imageUrl(p.imageUrl)}
                  alt={p.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Product Name & Pricing */}
              <div>
                <h3 className="font-display text-lg font-medium text-ink group-hover:text-brand">
                  {p.name}
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-ink">
                    From {formatINR(p.startingPrice)}
                  </span>
                  {discount > 0 && (
                    <span className="text-xs text-muted line-through">
                      {formatINR(p.mrp)}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3 text-xs text-brand font-medium">
                  <span>Explore EMI Plans</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
