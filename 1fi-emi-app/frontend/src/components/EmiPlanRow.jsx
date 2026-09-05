import { formatINR } from "../format.js";

export default function EmiPlanRow({ plan, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative flex cursor-pointer items-center justify-between rounded-xl bg-surface p-4 transition-all duration-150 ${
        selected
          ? "border-2 border-brand shadow-sm ring-1 ring-brand/20"
          : "border border-line hover:border-slate-400 hover:shadow-sm"
      }`}
    >
      <div className="flex-1 pr-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold tracking-tight text-ink">
            {formatINR(plan.monthlyAmount)}
          </span>
          <span className="text-sm font-normal text-muted">
            x {plan.tenureMonths} months
          </span>
        </div>
        {plan.cashbackAmount > 0 && (
          <p className="mt-1 text-xs font-medium text-savings">
            Additional cashback of {formatINR(plan.cashbackAmount)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3.5">
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            plan.interestRate === 0
              ? "bg-savings-soft text-savings"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {plan.interestRate === 0 ? "0% interest" : `${plan.interestRate}% interest`}
        </span>

        <span
          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
            selected ? "border-brand bg-brand" : "border-slate-300 group-hover:border-slate-400"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
      </div>
    </div>
  );
}
