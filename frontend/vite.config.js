import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import locatorBabelJsxModule from '@locator/babel-jsx/dist/index.js'

const locatorBabelJsx = locatorBabelJsxModule.default

function locatorBabelJsxWithEscapedWindowsPath(api) {
  const plugin = locatorBabelJsx(api)
  const programVisitor = plugin.visitor.Program

  return {
    ...plugin,
    visitor: {
      ...plugin.visitor,
      Program: {
        ...programVisitor,
        exit(path, state) {
          programVisitor.exit(path, state)

          // Locator Babel 2.0 interpolates this key into JavaScript without
          // escaping Windows `\\`. Repair the AST value so Babel emits a
          // valid string matching the path encoded in data-locatorjs-id.
          path.traverse({
            MemberExpression(memberPath) {
              const node = memberPath.node
              const isLocatorRegistryKey = node.computed &&
                node.object.type === 'MemberExpression' &&
                node.object.object.type === 'Identifier' &&
                node.object.object.name === 'window' &&
                node.object.property.type === 'Identifier' &&
                node.object.property.name === '__LOCATOR_DATA__' &&
                node.property.type === 'StringLiteral'

              if (isLocatorRegistryKey) {
                node.property.value = state.filename
                delete node.property.extra
              }
            },
          })
        },
      },
    },
  }
}

function locatorJsxPlugin() {
  return {
    name: 'toeic-learning:locator-jsx',
    enforce: 'pre',
    apply: 'serve',
    async transform(code, id) {
      const fileId = id.split('?')[0]
      if (!/\.[jt]sx$/.test(fileId) || /[/\\]node_modules[/\\]/.test(fileId)) return null

      const { transformAsync } = await import('@babel/core')
      const result = await transformAsync(code, {
        filename: fileId,
        cwd: process.cwd(),
        configFile: false,
        babelrc: false,
        parserOpts: { plugins: ['jsx', 'typescript'] },
        // Extension 1.3.x resolves [data-locatorjs-id] through __LOCATOR_DATA__;
        // the alternate `path` attribute is not recognized by that resolver.
        plugins: [[locatorBabelJsxWithEscapedWindowsPath, { env: 'development' }]],
        sourceMaps: true,
      })

      return result ? { code: result.code, map: result.map } : null
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    locatorJsxPlugin(),
    react(),
    tailwindcss(),
  ],
})
