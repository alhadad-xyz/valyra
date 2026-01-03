/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["ui"],
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "placehold.co",
            },
        ],
    },
};

module.exports = nextConfig;
