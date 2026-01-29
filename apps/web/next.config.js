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
            {
                protocol: "https",
                hostname: "gateway.lighthouse.storage",
            },
            {
                protocol: "https",
                hostname: "gateway.pinata.cloud",
            },
        ],
    },
};

module.exports = nextConfig;
