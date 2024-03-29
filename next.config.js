/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/client",
      "bcrypt",
      "@react-pdf/renderer",
    ],
  },
  transpilePackages: ["@react-pdf/renderer"],

  images: {
    domains: [
      "https://kangaroopakistan-prod.s3.us-east-1.amazonaws.com/",
      "kangaroopakistan-prod.s3.us-east-1.amazonaws.com",
    ],
  },
};

module.exports = nextConfig
