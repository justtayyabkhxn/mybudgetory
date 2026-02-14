export const fetchWithToken = async (url: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("API request failed");
  return res.json();
};
