import { SITE_URL } from "@/lib/site";
import { ROUTE_SLUGS } from "@/data/routePages";
import { SAILINGS_UPDATED } from "@/data/sailings";

export default function sitemap() {
  // Pages that show sailing data change when the timetable does; the others carry no date rather than
  // "now" on every deploy, which would tell Google every page changed each time.
  const pages = ["", "/about", "/indonesia/book", "/indonesia/ports", "/indonesia/destinations", "/indonesia/split-charter", "/privacy"];
  const dataPages = ["/indonesia", "/indonesia/routes"];
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...dataPages.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: new Date(SAILINGS_UPDATED) })),
    ...ROUTE_SLUGS.map((slug) => ({ url: `${SITE_URL}/indonesia/routes/${slug}`, lastModified: new Date(SAILINGS_UPDATED) })),
  ];
}
