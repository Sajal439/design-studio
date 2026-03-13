/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/(marketing)/**/*": ["../../packages/database/src/generated/client/*"],
    "/api/**/*": ["../../packages/database/src/generated/client/*"],
    "/admin/**/*": ["../../packages/database/src/generated/client/*"],
  },
};

export default nextConfig;
