var path = require('path');

module.exports = {
	entry: __dirname + '/src/client/client.tsx',
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'client.bundle.js'
	},
	devtool: "source-map",
	mode: 'development', // TODO: production option
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader"
			},{
				test: /\.js$/, 
				enforce: "pre", 
				loader: "source-map-loader" 
			}
		],
	},
	resolve: {
		extensions: [ ".tsx", ".ts", ".jsx", ".js", ".json"]
	},
	externals: {
		uws: "uws",
		react: "React",
		"react-dom": "ReactDOM"
	}
};