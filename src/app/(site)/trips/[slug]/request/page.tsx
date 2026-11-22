import { permanentRedirect } from "next/navigation";

// Reads ?departure= to forward it, so the route blocks instead of prerendering.
export const instant = false;

// The request-a-seat flow is retired: seats are booked and paid at checkout now. Old links land there.
export default async function RequestPage({ params, searchParams }: PageProps<"/trips/[slug]/request">) {
  const { slug } = await params;
  const { departure } = await searchParams;
  const query = typeof departure === "string" ? `?departure=${encodeURIComponent(departure)}` : "";
  permanentRedirect(`/trips/${slug}/book${query}`);
}
