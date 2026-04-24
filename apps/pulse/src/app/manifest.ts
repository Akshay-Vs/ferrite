import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Ferrite Pulse',
		short_name: 'Pulse',
		description: 'Ferrite Pulse dashboard',
		start_url: '/',
		display: 'standalone',
		background_color: '#141317',
		theme_color: '#3e3c48',
		icons: [
			{
				purpose: 'maskable',
				src: '/icon512_maskable.png',
				sizes: '512x512',
				type: 'image/png',
			},
			{
				purpose: 'any',
				src: '/icon512_rounded.png',
				sizes: '512x512',
				type: 'image/png',
			},
		],
	};
}
