import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/**/*.ts', 'src/hooks/!(*.test|*.spec).ts'],
	format: ['cjs', 'esm'],
	splitting: true,
	sourcemap: true,
	clean: true,
	bundle: true,
	outDir: 'dist',
	dts: {
		resolve: true,
		compilerOptions: {
			ignoreDeprecations: '6.0',
		},
	},
});
