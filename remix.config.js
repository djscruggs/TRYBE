/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: 'app',
  browserBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildDirectory: 'build',
  devServerPort: 8002,
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: [
    /remix-utils/
  ],
  // TODO: when mui has esm support, remove this (default is esm)
  // check it https://github.com/mui/material-ui/issues/30671
  serverModuleFormat: 'cjs',
};
