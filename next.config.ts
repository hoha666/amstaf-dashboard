import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    output: "export",
    trailingSlash: true,
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "c22b61ac608c1d723c76589756c693b1.r2.cloudflarestorage.com",
                pathname: "/product-media/**",
            },
            {
                protocol: "https",
                hostname: "minio.qa.amstaf.ir",
                pathname: "/product-media/**",
            },
            // optional: local dev against MinIO
            {
                protocol: "http",
                hostname: "localhost",
                port: "9000",
                pathname: "/product-media/**",
            },
        ],
    },
};

export default nextConfig;
