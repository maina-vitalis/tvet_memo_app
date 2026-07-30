const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

const webAliases = {
  'react-native-webview': '@10play/react-native-web-webview',
  'react-native/Libraries/Utilities/codegenNativeComponent':
    '@10play/react-native-web-webview/shim',
  crypto: 'expo-crypto',
};

config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web') {
      const alias = webAliases[moduleName];
      if (alias) {
        return {
          filePath: require.resolve(alias),
          type: 'sourceFile',
        };
      }
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  polyfills: { rem: 14 },
});
