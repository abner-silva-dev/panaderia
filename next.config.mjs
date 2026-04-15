/** @type {import('next').NextConfig} */
let remotePatterns = [];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    remotePatterns = [
      {
        protocol: supabaseUrl.protocol.replace(":", ""),
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    remotePatterns = [];
  }
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
