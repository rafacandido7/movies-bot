import config from '@rocketseat/eslint-config/node.mjs'

export default {
  ...config,
  rules: {
    ...config.rules,
    'new-cap': 'off',
    '@stylistic/max-len': 'off',
    '@stylistic/multiline-ternary': 'off',
    'no-unused-vars': ['error'],
  },
}
