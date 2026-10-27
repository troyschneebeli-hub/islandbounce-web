import { SITE_URL } from "@/lib/site";
import { ROUTE_SLUGS } from "@/data/routePages";
import { SAILINGS_UPDATED } from "@/data/sailings";
import { PORT_PAGE_SLUGS } from "@/lib/portPages";
import { OPERATOR_SLUGS } from "@/lib/operatorPages";
import { GUIDE_SLUGS } from "@/data/guides";

export default function sitemap() {
  // Pages that show sailing data change when the timetable does; the others carry no date rather than
  // "now" on every deploy, which would tell Google every page changed each time.
  const pages = ["", "/about", "/indonesia/book", "/indonesia/destinations", "/privacy"];
  const dataPages = ["/indonesia", "/indonesia/routes", "/indonesia/ports", "/indonesia/operators", "/indonesia/guides"];
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...dataPages.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: new Date(SAILINGS_UPDATED) })),
    ...ROUTE_SLUGS.map((slug) => ({ url: `${SITE_URL}/indonesia/routes/${slug}`, lastModified: new Date(SAILINGS_UPDATED) })),
    ...PORT_PAGE_SLUGS.map((slug) => ({ url: `${SITE_URL}/indonesia/ports/${slug}`, lastModified: new Date(SAILINGS_UPDATED) })),
    ...OPERATOR_SLUGS.map((slug) => ({ url: `${SITE_URL}/indonesia/operators/${slug}`, lastModified: new Date(SAILINGS_UPDATED) })),
    ...GUIDE_SLUGS.map((slug) => ({ url: `${SITE_URL}/indonesia/guides/${slug}`, lastModified: new Date(SAILINGS_UPDATED) })),
  ];
}
