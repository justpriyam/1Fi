const rawBase = import.meta.env.VITE_API_BASE_URL || "";
const API_BASE_URL = rawBase.trim().replace(/\/+$/, "");

async function request(pathname) {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const res = await fetch(`${API_BASE_URL}${cleanPath}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request to ${cleanPath} failed with ${res.status}`);
  }
  return res.json();
}

export function getProducts() {
  return request("/api/products");
}

export function getProductBySlug(slug) {
  return request(`/api/products/${slug}`);
}

export function imageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
