module.exports = function (api) {
  api.cache(true);
  const isWeb = process.env.EXPO_PLATFORM === 'web';
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@app': './app',
            '@assets': './assets',
          },
        },
      ],
      ...(isWeb ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
