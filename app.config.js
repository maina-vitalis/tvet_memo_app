export default ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    "@react-native-community/datetimepicker",
  ],
  android: {
    ...config.android,
    googleServicesFile: "./google-services.json",
  },
});
