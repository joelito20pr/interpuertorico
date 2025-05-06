/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'vercel.app'],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  // Añadir bcryptjs a la lista de paquetes externos del servidor
  serverComponentsExternalPackages: ['bcryptjs'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
