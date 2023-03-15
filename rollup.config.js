import terser from '@rollup/plugin-terser';

export default {
  input: 'src/main.js',
	output: {
		file: 'dist/quel.min.js',
	},  
  plugins: [
    terser()
  ]
}