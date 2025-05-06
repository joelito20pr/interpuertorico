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
  serverComponentsExternalPackages: ['bcryptjs', '@prisma/client'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Añadir esta configuración para evitar problemas con Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'bcryptjs']
    }
    return config
  },
};

export default nextConfig;
