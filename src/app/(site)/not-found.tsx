import type { Metadata } from "next";
import { NotFoundView } from "../_components/not-found-view";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// T16 404 for notFound() in a (site) page (unknown trip or destination). The (site) layout already draws the header and footer.
export default function SiteNotFound() {
  return <NotFoundView />;
}
