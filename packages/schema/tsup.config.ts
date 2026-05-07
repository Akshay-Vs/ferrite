import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/**/*.ts'],
	format: ['cjs', 'esm'],
	splitting: false,
	sourcemap: true,
	clean: true,
	bundle: false,
	outDir: 'dist',
	dts: {
		compilerOptions: {
			ignoreDeprecations: '6.0',
		},
	},
});
