import type { GetServerSideProps } from "next";
import { LEARNING_TOPICS } from "../lib/learning-content";

const SITE_URL = "https://traitbridge.com";

const staticPaths = [
  "",
  "/background",
  "/community-guidelines",
  "/imprint",
  "/learn",
  "/learn/articles",
  "/learn/contribution",
  "/learn/library",
  "/learn/opposites",
  "/privacy",
  "/test",
];

const escapeXml = (value: string) =>
  value.replace(/[<>&'\"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return entities[character];
  });

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const paths = [...staticPaths, ...LEARNING_TOPICS.map((topic) => `/learn/${topic.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc></url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400");
  res.write(xml);
  res.end();

  return { props: {} };
};

const Sitemap = () => null;

export default Sitemap;
