module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true
  },
  // base, essential(默认), strongly-recommended, recommended
  extends: ['plugin:vue/strongly-recommended', '@vue/prettier'],
  rules: {
    'space-before-function-paren': 0,
    // 禁止出现未使用过的变量
    'no-unused-vars': 'off',
    'no-useless-escape': 'off',
    'vue/no-parsing-error': [2, { 'x-invalid-end-tag': false }]
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    DDLogin: true
  }
}
