module.exports = {
  root: true,
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
    parser: "babel-eslint"
  },
  plugins: ["vue"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",

    semi: ["warning", "all"],
    "max-len": "off",
    "linebreak-style": "off",
    camelcase: [
      "error",
      { properties: "never", ignoreDestructuring: true, ignoreImports: true }
    ],
    "arrow-parens": ["error", "as-needed"],
    "vue/multiline-html-element-content-newline": "off"
  }
};
