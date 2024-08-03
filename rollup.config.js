import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/exports.js',
	output: {
		file: 'dist/quel.min.js',
	},  
  plugins: [
    typescript(), 
    terser()
  ]
}