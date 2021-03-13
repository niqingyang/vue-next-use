module.exports = {
    presets: [],
    plugins: [
        [
            "@vue/babel-plugin-jsx",
            {
                // 把 on: { click: xx } 转成 onClick: xxx
                "transformOn": true,
                // 是否开启优化. 如果你对 Vue 3 不太熟悉，不建议打开
                "optimize": true,
                // 合并 class / style / onXXX handlers
                "mergeProps": true
            }
        ]
    ]
}