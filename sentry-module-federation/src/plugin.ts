import * as webpack from "webpack";

export class SentryModuleDataPlugin {
  public constructor(private data: any) {}

  public apply(compiler: webpack.Compiler) {
    const BannerPlugin =
      compiler?.webpack?.BannerPlugin || webpack?.BannerPlugin;
    compiler.options.plugins = compiler.options.plugins || [];
    compiler.options.plugins.push(
      new BannerPlugin({
        raw: true,
        include: /\.(js|ts|jsx|tsx|mjs|cjs)$/,
        banner: `window.__SMF_STACK_TRACES__ = window.__SMF_STACK_TRACES__ || {};window.__SMF_STACK_TRACES__[new Error().stack] = ${JSON.stringify(
          this.data
        )};`,
      })
    );
  }
}
