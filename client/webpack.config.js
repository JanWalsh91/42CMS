const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	context: __dirname,
	entry: path.join(__dirname, './src/index'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, './dist')
    },

    // Enable sourcemaps for debugging webpack's output.
	devtool: 'inline-source-map',
	devServer: {
		contentBase: path.join(__dirname, './dist'),
		historyApiFallback: true
	},

    resolve: {
		extensions: ['.jsx', '.ts', '.tsx', '.js', '.json', '.scss']
    },

    module: {
        rules: [
			{
				test: /\.tsx?$/,
				loader: 'awesome-typescript-loader',
				options: {
					configFileName: path.join(__dirname, 'tsconfig.json')
				},
			},

			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
				  loader: "babel-loader"
				}
			},

			{
				enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'
			},
			
			{
				test: /\.(css|scss)$/,
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
		}),
		
	]
};
