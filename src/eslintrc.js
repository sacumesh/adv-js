module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  plugins: ["prettier", "unused-imports"],
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 2017,
    requireConfigFile: false,
  },
  env: {
    node: true,
    mocha: true,
  },
  rules: {
    "unused-imports/no-unused-imports": "error",
  },
};
