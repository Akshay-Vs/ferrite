import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'img.clerk.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'images.pexels.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'ik.imagekit.io',
				port: '',
				pathname: '/0ujcywips/**',
			},
		],
	},
};

export default nextConfig;
