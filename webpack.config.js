import path from 'path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

const banner = `/*!
 * Copyright (c) 2025 Pixalo
 * @Repository: https://github.com/pixalo 
 * @License: MIT
 */`;

export default [
    // Bundle
    {
        mode: 'production',
        entry: './src/index.js',
        output: {
            path: path.resolve(process.cwd(), 'dist'),
            filename: 'pixalo.bundle.js',
            library: { name: 'Pixalo', type: 'umd', export: 'default' },
            globalObject: 'this',
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: { format: { comments: /^!/ } },
                }),
            ],
        },
        plugins: [
            new webpack.BannerPlugin({ banner, raw: true, entryOnly: true }),
        ],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } },
                },
            ],
        },
    },
    // UMD
    {
        mode: 'production',
        entry: './src/index.js',
        output: {
            path: path.resolve(process.cwd(), 'dist'),
            filename: 'pixalo.umd.js',
            library: { name: 'Pixalo', type: 'umd', export: 'default' },
            globalObject: 'this',
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: { format: { comments: /^!/ } },
                }),
            ],
        },
        plugins: [
            new webpack.BannerPlugin({ banner, raw: true, entryOnly: true }),
        ],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } },
                },
            ],
        },
    },
    // ESM
    {
        mode: 'production',
        entry: './src/index.js',
        experiments: { outputModule: true },
        output: {
            path: path.resolve(process.cwd(), 'dist'),
            filename: 'pixalo.esm.js',
            library: { type: 'module' },
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: { format: { comments: /^!/ } },
                }),
            ],
        },
        plugins: [
            new webpack.BannerPlugin({ banner, raw: true, entryOnly: true }),
        ],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } },
                },
            ],
        },
    },
];