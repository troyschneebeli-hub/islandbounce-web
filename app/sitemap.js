import { SITE_URL } from "@/lib/site";
import { ROUTE_SLUGS } from "@/data/routePages";
import { TIMETABLE_UPDATED } from "@/data/timetables";

export default function sitemap() {
  const now = new Date();
  const pages = ["", "/about", "/indonesia", "/indonesia/routes", "/indonesia/book", "/indonesia/ports", "/indonesia/destinations", "/indonesia/split-charter", "/privacy"];
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: now })),
    ...ROUTE_SLUGS.map((slug) => ({ url: `${SITE_URL}/indonesia/routes/${slug}`, lastModified: new Date(TIMETABLE_UPDATED) })),
  ];
}
