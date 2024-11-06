/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',  // Use 'https' if the domains support it
        hostname: 'utfs.io',
        port: '',           // Leave empty for default ports
        pathname: '/**',    // Matches all paths under this domain
      },
      {
        protocol: 'https',  // Use 'https' if the domains support it
        hostname: 'i.pravatar.cc',
        port: '',           // Leave empty for default ports
        pathname: '/**',    // Matches all paths under this domain
      },
    ],
  },
};

export default nextConfig;
