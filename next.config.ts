import type { NextConfig } from "next";
import type webpack from 'webpack';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;", 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '35.186.144.224',
        // port: '80',
        pathname: '/**',
      },
    ],
  },
  webpack(config: webpack.Configuration) {
    const fileLoaderRule = config.module?.rules?.find((rule) =>
      (rule as any).test?.test?.('.svg')
    );

    if (fileLoaderRule) {
      (fileLoaderRule as any).exclude = /\.svg$/;
    }

    config.module?.rules?.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);