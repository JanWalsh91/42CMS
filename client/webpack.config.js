const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	context: __dirname,
	entry: path.join(__dirname, './src/index.tsx'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, './dist')
    },

    // Enable sourcemaps for debugging webpack's output.
	devtool: 'inline-source-map',
	devServer: {
		contentBase: path.join(__dirname, './dist')
	},

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
			{
				test: /\.tsx?$/,
				loader: 'awesome-typescript-loader',
				options: {
					configFileName: path.join(__dirname, 'tsconfig.json')
				},
			},

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			{ enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
			
			// css, scss
			{
				// look for .css or .scss files
				test: /\.(css|scss)$/,
				// // in the `src` directory
				// include: '/src',
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
        ]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(__dirname, './src/index.html')
		})
	]
};
