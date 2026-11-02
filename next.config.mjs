/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Layero запускает SSR-приложение (runtime ssr_next) через standalone-сервер
  output: "standalone",
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
