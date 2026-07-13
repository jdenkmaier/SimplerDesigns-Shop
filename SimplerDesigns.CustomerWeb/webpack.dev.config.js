import path from "node:path";
import { fileURLToPath } from "node:url";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

// In Node.js versions prior to native support for import.meta.dirname,
// derive __dirname from import.meta.url.
// (Node 20.11+ supports import.meta.dirname and import.meta.filename.)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: 'development',
    entry: "./src/index.js",
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
        }),
        //Kopiert alles aus public/ (Favicons, manifest.json, sw.js) nach dist/ –> wird sonst bei Build gelöscht
        new CopyWebpackPlugin({
            patterns: [{ from: 'public', to: '.' }],
        }),
    ],    
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    devtool: 'inline-source-map',
    devServer: {
        static: {
            directory: path.resolve(__dirname, "dist"),
        },
        host: 'localhost',
        port: '5501',
        hot: true,
        compress: true,
        historyApiFallback: true,
        // proxy: {
        //     '/article': {
        //         target: 'http://localhost:5000',
        //         secure: false,
        //         changeOrigin: true,
        //     },
        //     '/user': {
        //         target: 'http://localhost:5000',
        //         secure: false,
        //         changeOrigin: true,
        //     },
        //     '/category': {
        //         target: 'http://localhost:5000',
        //         secure: false,
        //         changeOrigin: true,
        //     },
        //     '/file': {
        //         target: 'http://localhost:5000',
        //         secure: false,
        //         changeOrigin: true,
        //     },
        //     '/page': {
        //         target: 'http://localhost:5000',
        //         secure: false,
        //         changeOrigin: true,
        //     },
        //     '/inventory': {
        //         target: 'http://localhost:5000',
        //         secure: false,
        //         changeOrigin: true,
        //     }
        // }
    },
    optimization: {
        runtimeChunk: 'single',
    },   
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },            
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },  
            {
                test: /\.html$/i,
                loader: "html-loader",
                exclude: path.resolve(__dirname, 'index.html'),
            },
        ],
    },     
};