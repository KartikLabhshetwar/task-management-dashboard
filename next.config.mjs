/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://task-management-dashboard-backend.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
