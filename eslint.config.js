import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-empty": "warn"
    },
    languageOptions: { globals: { ...globals.browser, ...globals.node } }
  },
];