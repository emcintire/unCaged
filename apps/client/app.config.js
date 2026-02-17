import "dotenv/config";

export default {
  expo: {
    name: "unCaged",
    slug: "unCaged",
    icon: "./src/assets/imgs/icon.png",
    version: "10.0.0",
    orientation: "portrait",
    scheme: "uncaged",
    platforms: ["ios", "android", "web"],
    jsEngine: "hermes",
    extra: {
      apiBaseUrl:  process.env.API_BASE_URL,
      eas: {
        projectId: "8b66d794-89ac-4204-8dcd-3d8e025423fd",
      },
    },
    splash: {
      image: "./src/assets/imgs/icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    updates: {
      url: "https://u.expo.dev/8b66d794-89ac-4204-8dcd-3d8e025423fd",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "uncaged.app",
      googleServicesFile: "./GoogleService-Info.plist",
      config: {},
    },
    android: {
      package: "uncaged.app",
      versionCode: 11,
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./src/assets/imgs/icon.png",
        backgroundColor: "#000000",
      },
      config: {},
    },
    web: {
      favicon: "./src/assets/imgs/icon.png",
    },
    plugins: [
      "expo-font",
      "expo-secure-store",
      "@react-native-firebase/app",
      "./plugins/withModularHeaders",
    ],
  },
};
