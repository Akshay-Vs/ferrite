import {
	PHASE_DEVELOPMENT_SERVER,
	PHASE_PRODUCTION_BUILD,
} from 'next/constants.js';
import path from 'path';

export default function config(phase: string) {
	const isDev = phase === PHASE_DEVELOPMENT_SERVER;
	const isProd = phase === PHASE_PRODUCTION_BUILD;

	const common = {
		reactStrictMode: true,
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
					hostname: 'ik.imagekit.io',
					port: '',
					pathname: '/0ujcywips/**',
				},
			],
		},
	};

	const devConfig = {
		images: {
			remotePatterns: [
				...common.images.remotePatterns,
				// Test only
				{
					protocol: 'https',
					hostname: 'i.pravatar.cc',
					port: '',
					pathname: '/**',
				},
				{
					protocol: 'https',
					hostname: 'images.pexels.com',
					port: '',
					pathname: '/**',
				},
			],
		},
		turbopack: {
			debugIds: false,
			root: path.join(__dirname, '../..'),
		},
		experimental: {
			preloadEntriesOnStart: false,
		},
		typescript: {
			ignoreBuildErrors: true, // run tsc separately
		},
	};

	const prodConfig = {
		productionBrowserSourceMaps: false,
	};

	return {
		...common,
		...(isDev ? devConfig : {}),
		...(isProd ? prodConfig : {}),
	};
}
