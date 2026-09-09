module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Required for react-native-reanimated
      "react-native-reanimated/plugin",
      // Resolve @shared/* alias
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@shared": "../shared",
          },
        },
      ],
    ],
  };
};
