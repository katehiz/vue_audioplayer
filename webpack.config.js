const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
	entry: {
		'js/vue-audio-player': "./src/index.js"
	},
	output: {
		path: path.resolve(__dirname, "./dist/"),
		filename: "[name].js",
		publicPath: "dist/"
	},
	devServer: {
		overlay: true
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
						js: 'babel-loader',
						scss: 'vue-style-loader!css-loader!sass-loader'
					}
				}
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [{
					loader: "babel-loader",
				}]
			},
			{
				test: /\.(sc|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader',
				]
			},
		]
	},
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: 'css/vue-audio-player.css',
			publicPath: 'dist/'
		})
	],
	resolve: {
		alias: {
			'vue': 'vue/dist/vue.js'
		},
		extensions: ['*', '.js', '.vue']
	}
};

module.exports = (env, options) => {
	return config;
};