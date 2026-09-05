import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductBySlug, imageUrl } from "../api.js";
import { formatINR } from "../format.js";
import EmiPlanRow from "./EmiPlanRow.jsx";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [variantId, setVariantId] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    getProductBySlug(slug)
      .then((data) => {
        if (!isCurrent) return;
        setProduct(data);
        const defaultVariant = data.variants.find((v) => v.isDefault) || data.variants[0];
        setVariantId(defaultVariant?.id ?? null);
        setPlanId(null);
        setIsModalOpen(false);
        setIsConfirmed(false);
        setError(null);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(err.message);
      });

    return () => {
      isCurrent = false;
    };
  }, [slug]);

  const variant = useMemo(
    () => product?.variants.find((v) => v.id === variantId) ?? null,
    [product, variantId]
  );

  // Derive distinct color finishes and storage sizes
  const finishes = useMemo(() => {
    if (!product) return [];
    const map = new Map();
    for (const v of product.variants) {
      if (!map.has(v.colorName)) {
        map.set(v.colorName, v);
      }
    }
    return [...map.values()];
  }, [product]);

  const storageOptions = useMemo(() => {
    if (!product) return [];
    return [...new Set(product.variants.map((v) => v.storage))];
  }, [product]);

  function handleSelectFinish(targetColor) {
    if (!product) return;
    // Find matching variant with same storage if possible, else first matching color
    const match =
      product.variants.find(
        (v) => v.colorName === targetColor && v.storage === variant?.storage
      ) || product.variants.find((v) => v.colorName === targetColor);

    if (match) {
      setVariantId(match.id);
      setPlanId(null);
      setIsConfirmed(false);
    }
  }

  function handleSelectStorage(targetStorage) {
    if (!product) return;
    const match =
      product.variants.find(
        (v) => v.storage === targetStorage && v.colorName === variant?.colorName
      ) || product.variants.find((v) => v.storage === targetStorage);

    if (match) {
      setVariantId(match.id);
      setPlanId(null);
      setIsConfirmed(false);
    }
  }

  function handleProceed() {
    if (!selectedPlan) return;
    setIsConfirmed(false);
    setIsModalOpen(true);
  }

  function handleConfirmPlan() {
    const randomId = "1FI-" + Math.floor(100000 + Math.random() * 900000);
    setApplicationId(randomId);
    setIsConfirmed(true);
  }

  const selectedPlan = variant?.emiPlans.find((p) => p.id === planId) ?? null;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/70 p-8 text-center">
        <h2 className="font-display text-xl font-medium text-red-900">
          Couldn&apos;t load product
        </h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm ring-1 ring-line hover:bg-surface"
        >
          ← Back to all products
        </Link>
      </div>
    );
  }

  const isLoading = !product || product.slug !== slug || !variant;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <div className="h-8 w-60 rounded bg-slate-200" />
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="aspect-[4/3] rounded-2xl bg-slate-200" />
          </div>
          <div className="space-y-4">
            <div className="h-10 w-48 rounded bg-slate-200" />
            <div className="h-24 rounded-xl bg-slate-200" />
            <div className="h-24 rounded-xl bg-slate-200" />
            <div className="h-24 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  const savings = variant.mrp - variant.price;

  // Calculate totals for modal breakdown
  const totalAmount = selectedPlan
    ? selectedPlan.monthlyAmount * selectedPlan.tenureMonths
    : 0;
  const totalInterest = selectedPlan
    ? Math.max(0, totalAmount - variant.price)
    : 0;

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-muted">
        <Link to="/" className="transition hover:text-brand">
          Shop on EMI
        </Link>
        <span>/</span>
        <span className="capitalize">{product.category}s</span>
        <span>/</span>
        <span className="font-medium text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-14">
        {/* Left Column: Product Visual & Details (matches reference design hierarchy) */}
        <div>
          {/* Badge: NEW (if present) */}
          {product.badge && (
            <span className="inline-block rounded px-2 py-0.5 text-xs font-bold tracking-wide text-red-600 ring-1 ring-red-200 bg-red-50">
              {product.badge}
            </span>
          )}

          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-1 text-base text-muted">
            {variant.storage} · {variant.colorName}
          </p>

          {/* Smartphone Visual Display */}
          <div className="mt-6 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-surface p-4 ring-1 ring-line/80 shadow-sm transition">
            <img
              src={imageUrl(variant.imageUrl)}
              alt={`${product.name} ${variant.colorName}`}
              className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Finishes Selector with Color Dots (matching reference layout) */}
          {finishes.length > 1 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Available in {finishes.length} finishes
                </p>
                <span className="text-xs font-semibold text-ink">
                  {variant.colorName}
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-3">
                {finishes.map((f) => {
                  const isSelected = f.colorName === variant.colorName;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFinish(f.colorName)}
                      title={f.colorName}
                      className={`group relative grid h-9 w-9 place-items-center rounded-full transition-all duration-150 ${
                        isSelected
                          ? "ring-2 ring-brand ring-offset-2"
                          : "hover:scale-110"
                      }`}
                    >
                      <span
                        className="h-7 w-7 rounded-full shadow-inner ring-1 ring-black/10"
                        style={{ backgroundColor: f.colorHex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Storage Capacity Selector */}
          {storageOptions.length > 1 && (
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Storage Capacity
              </p>
              <div className="mt-2 flex gap-2.5">
                {storageOptions.map((st) => {
                  const isSelected = st === variant.storage;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleSelectStorage(st)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? "bg-brand text-white shadow-sm"
                          : "border border-line bg-surface text-ink hover:border-slate-400"
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product Description */}
          {product.description && (
            <div className="mt-8 rounded-xl border border-line/60 bg-surface/50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Overview
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Selectable EMI Plans */}
        <div>
          {/* Price Header */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-semibold tracking-tight text-ink">
              {formatINR(variant.price)}
            </span>
            {savings > 0 && (
              <span className="text-lg text-muted line-through">
                {formatINR(variant.mrp)}
              </span>
            )}
            {savings > 0 && (
              <span className="rounded-full bg-savings-soft px-2.5 py-0.5 text-xs font-semibold text-savings">
                Save {formatINR(savings)}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm font-medium text-muted">
            EMI plans backed by mutual funds
          </p>

          {/* EMI Plans Card List */}
          <div className="mt-6 space-y-3">
            {variant.emiPlans.map((plan) => (
              <EmiPlanRow
                key={plan.id}
                plan={plan}
                selected={plan.id === planId}
                onSelect={() => setPlanId(plan.id)}
              />
            ))}
          </div>

          {/* Proceed Button */}
          <button
            type="button"
            disabled={!planId}
            onClick={handleProceed}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-light active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Proceed with this plan</span>
            {selectedPlan && (
              <span className="text-xs font-normal opacity-90">
                ({formatINR(selectedPlan.monthlyAmount)}/mo)
              </span>
            )}
          </button>

          {/* Trust Banner */}
          <div className="mt-5 rounded-xl border border-line bg-surface/70 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-savings-soft text-savings font-bold text-sm">
                ✓
              </span>
              <div>
                <p className="text-xs font-semibold text-ink">
                  Zero CIBIL Impact • Backed by Portfolio
                </p>
                <p className="text-xs text-muted">
                  Keep earning fund returns while funding your purchase with zero downpayment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Plan Breakdown & Confirmation Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10 sm:p-8">
            {!isConfirmed ? (
              <div>
                <div className="flex items-start justify-between border-b border-line pb-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      Review EMI Plan
                    </h2>
                    <p className="text-xs text-muted">
                      1Fi Mutual Fund-backed EMI application
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-slate-100 hover:text-ink"
                  >
                    ✕
                  </button>
                </div>

                {/* Selected Product Summary */}
                <div className="mt-4 flex items-center gap-4 rounded-xl bg-slate-50 p-3.5">
                  <img
                    src={imageUrl(variant.imageUrl)}
                    alt={product.name}
                    className="h-16 w-16 object-contain"
                  />
                  <div>
                    <h4 className="font-display font-medium text-ink">
                      {product.name}
                    </h4>
                    <p className="text-xs text-muted">
                      {variant.storage} · {variant.colorName}
                    </p>
                    <p className="text-sm font-semibold text-ink">
                      {formatINR(variant.price)}
                    </p>
                  </div>
                </div>

                {/* Detailed Plan Breakdown */}
                <div className="mt-5 space-y-2.5 text-sm">
                  <div className="flex justify-between py-1 border-b border-dashed border-line">
                    <span className="text-muted">Monthly Installment</span>
                    <span className="font-semibold text-ink">
                      {formatINR(selectedPlan.monthlyAmount)} / month
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-line">
                    <span className="text-muted">Tenure</span>
                    <span className="font-medium text-ink">
                      {selectedPlan.tenureMonths} Months
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-line">
                    <span className="text-muted">Interest Rate</span>
                    <span className="font-medium text-ink">
                      {selectedPlan.interestRate === 0
                        ? "0% Interest"
                        : `${selectedPlan.interestRate}% p.a. (reducing balance)`}
                    </span>
                  </div>
                  {totalInterest > 0 && (
                    <div className="flex justify-between py-1 border-b border-dashed border-line">
                      <span className="text-muted">Total Interest</span>
                      <span className="font-medium text-slate-700">
                        {formatINR(totalInterest)}
                      </span>
                    </div>
                  )}
                  {selectedPlan.cashbackAmount > 0 && (
                    <div className="flex justify-between py-1 border-b border-dashed border-line">
                      <span className="text-savings font-medium">Cashback Reward</span>
                      <span className="font-semibold text-savings">
                        + {formatINR(selectedPlan.cashbackAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 text-base font-bold">
                    <span className="text-ink">Total Repayment</span>
                    <span className="text-brand">
                      {formatINR(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Collateral Security Note */}
                <div className="mt-4 rounded-lg bg-savings-soft p-3 text-xs text-savings">
                  <strong>Collateral Pledge:</strong> ₹{Math.round(variant.price * 1.5).toLocaleString("en-IN")} in mutual fund units will be pledged as security. Your funds continue to earn compounding market returns throughout the tenure.
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-muted hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPlan}
                    className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-light"
                  >
                    Confirm & Apply
                  </button>
                </div>
              </div>
            ) : (
              /* Success State */
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-savings-soft text-2xl text-savings">
                  ✓
                </div>
                <h3 className="font-display text-2xl font-semibold text-ink">
                  Application Submitted!
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Your EMI plan for {product.name} has been initiated.
                </p>

                <div className="mt-5 rounded-xl border border-line bg-slate-50 p-4 text-left">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Application ID</span>
                    <span className="font-mono font-bold text-ink">
                      {applicationId}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span>Monthly EMI</span>
                    <span className="font-semibold text-ink">
                      {formatINR(selectedPlan.monthlyAmount)} x {selectedPlan.tenureMonths} mos
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span>Status</span>
                    <span className="font-semibold text-savings">
                      Pledge Verification Pending
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-light"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
