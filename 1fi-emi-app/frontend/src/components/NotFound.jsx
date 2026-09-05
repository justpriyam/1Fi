import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-muted">That product doesn&apos;t exist.</p>
      <Link to="/" className="mt-4 inline-block text-sm text-brand underline">
        Back to all products
      </Link>
    </div>
  );
}
