import { headers } from "next/headers";

export async function getContributors() {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  try {
    const response = await fetch(`${baseUrl}/api/contributors`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
