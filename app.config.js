import appJson from "./app.json";
export default {
  expo: {
    ...appJson.expo,
    plugins: [
      ...(appJson.expo.plugins ?? []),
      "@react-native-community/datetimepicker",
    ],
    android: {
      ...appJson.expo.android,
      googleServicesFile: "./google-services.json",
    },
  },
};
