module.exports = {
    plugins: {
        'postcss-preset-env': {
            browserslist: [
                'ie 11',
                'last 2 versions'
            ],
            autoprefixer: { grid: true }
        }
    }
}