module.exports = function (api) {
  api.cache.using(() => require("react-native-worklets/package.json").version);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
