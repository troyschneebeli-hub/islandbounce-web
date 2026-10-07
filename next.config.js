/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Trip Planner now lives on the Indonesia hub page. Old links and
  // bookmarks to /indonesia/planner keep working.
  async redirects() {
    return [{ source: "/indonesia/planner", destination: "/indonesia", permanent: true }];
  },
};

module.exports = nextConfig;
