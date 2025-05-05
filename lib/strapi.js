export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

export async function strapiRegister({
  email,
  password,
  username,
}) {
  const res = await fetch(`${API_URL}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      username
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Register failed");
  }
  return data;
}

export async function strapiLogin(email, password) {
  const res = await fetch(`${API_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Login failed");
  }
  return data;
}

export async function strapiFetch(path, jwt) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status}`);
  }
  return res.json();
}
