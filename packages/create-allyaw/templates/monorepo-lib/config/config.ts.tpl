import { defineConfig } from 'dumi'

export default defineConfig({
    apiParser: {
      propFilter: {
        // 是否忽略从 node_modules 继承的属性，默认值为 false
        skipNodeModules: true,
      }
    },
    dynamicImport: {},
    resolve: {
      includes: [
        'docs',
        'packages',
        'components',
      ]
    },
    extraBabelPlugins: [
      /** antd */
      // [
      //   'babel-plugin-import',
      //   {
      //     libraryName: 'antd',
      //     libraryDirectory: 'es',
      //     style: true
      //   },
      //   'antd'
      // ]
    ],
    forkTSChecker: {},
    locales: [['zh-CN', '中文']],
    mode: 'doc',
    title: "@allyaw/lib"
  }
)
