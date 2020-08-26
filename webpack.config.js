const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const miniCss = require('mini-css-extract-plugin');

const config = {
	entry: {
		build: "./src/index.js"
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
						js: 'babel-loader'
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
				test: /\.scss$/,
				use: [
					miniCss.loader,
					'css-loader',
					'sass-loader',
				]
			},
		]
	},
	plugins: [
		new VueLoaderPlugin(),
		new miniCss({
			filename: 'style.css',
		})
	]
};

module.exports = (env, options) => {
	return config;
};