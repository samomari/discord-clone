/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',  
        hostname: 'utfs.io',
        port: '',           
        pathname: '/**',    
      },
      {
        protocol: 'https',  
        hostname: 'i.pravatar.cc',
        port: '',           
        pathname: '/**',    
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/servers',
        destination: '/',
        permanent: true,
      },
      {
        source: '/servers/:serverId/channels',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
