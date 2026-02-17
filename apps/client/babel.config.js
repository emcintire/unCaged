module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/services': './src/services',
            '@/components': './src/components',
            '@/config': './src/config',
            '@/constants': './src/constants',
            '@/hooks': './src/hooks',
            '@/navigation': './src/navigation',
            '@/screens': './src/screens',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/assets': './src/assets',
            '@uncaged/shared': '../../packages/shared/src',
          },
        },
      ],
    ],
  };
};
