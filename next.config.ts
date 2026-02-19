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
        protocol: 'https',
        hostname: '10.10.46.3',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '10.10.46.2',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '35.186.144.224',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
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