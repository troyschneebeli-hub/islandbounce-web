/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Trip Planner now lives on the Indonesia hub page. Old links and
  // bookmarks to /indonesia/planner keep working.
  async redirects() {
    return [
      { source: "/indonesia/planner", destination: "/indonesia", permanent: true },
      // The old transport-and-activities guide was replaced by the Places page.
      { source: "/indonesia/guide/:slug", destination: "/indonesia/destinations", permanent: true },
      // Split Charters was dropped (23 Oct 2026); old links and search results land on the Indonesia hub.
      { source: "/indonesia/split-charter", destination: "/indonesia", permanent: true },
    ];
  },
};

module.exports = nextConfig;
