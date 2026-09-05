import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-brand font-display text-sm font-semibold text-white">
            1Fi
          </span>
          <span className="text-sm text-muted">EMI plans backed by mutual funds</span>
        </Link>
      </div>
    </header>
  );
}
