import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'],
	splitting: true,
	sourcemap: true,
	clean: true,
	bundle: true,
	outDir: 'dist',
	dts: {
		compilerOptions: {
			ignoreDeprecations: '6.0',
		},
	},
});
