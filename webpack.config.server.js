var webpack = require('webpack');

var path = require('path');

module.exports = {
	target: 'node',
	entry: __dirname + '/src/server/server.ts',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'server.js'
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				loader: "ts-loader"
			}
		],
	},
	resolve: {
		extensions: [".ts", ".js", ".json"]
	},
	plugins: [],
	devServer: {
		contentBase: __dirname + '/build',
		inline: true
	},
	externals: {
		uws: "uws"
	}
};