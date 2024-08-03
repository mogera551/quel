import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/exports.js',
	output: {
		file: 'dist/quel.js',
	},  
  plugins: [
    typescript()
  ]
}
