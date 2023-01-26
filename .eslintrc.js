module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: "plugin:vue/essential",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module"
  },
  plugins: ["vue"],
  rules: {}
};
