import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/exports.ts',
	output: {
		file: 'dist/quel.js',
	},  
  plugins: [
    typescript()
  ]
}
