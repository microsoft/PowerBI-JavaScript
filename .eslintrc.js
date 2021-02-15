// TODO: Remove "warn" settings for the rules after resolving them
module.exports = {
  "env": {
    "browser": true,
    "node": true
  },
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "webpack.test.tsconfig.json",
    "sourceType": "module"
  },
  "plugins": [
    "eslint-plugin-jsdoc",
    "eslint-plugin-prefer-arrow",
    "eslint-plugin-import",
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/adjacent-overload-signatures": "warn",
    "@typescript-eslint/array-type": [
      "warn",
      {
        "default": "array-simple"
      }
    ],
    "@typescript-eslint/await-thenable": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/ban-types": [
      "warn",
      {
        "types": {
          "Object": {
            "message": "Avoid using the `Object` type. Did you mean `object`?"
          },
          "Function": {
            "message": "Avoid using the `Function` type. Prefer a specific function type, like `() => void`."
          },
          "Boolean": {
            "message": "Avoid using the `Boolean` type. Did you mean `boolean`?"
          },
          "Number": {
            "message": "Avoid using the `Number` type. Did you mean `number`?"
          },
          "String": {
            "message": "Avoid using the `String` type. Did you mean `string`?"
          },
          "Symbol": {
            "message": "Avoid using the `Symbol` type. Did you mean `symbol`?"
          }
        }
      }
    ],
    "@typescript-eslint/consistent-type-assertions": "warn",
    "@typescript-eslint/consistent-type-definitions": "warn",
    "@typescript-eslint/dot-notation": "warn",
    "@typescript-eslint/explicit-member-accessibility": [
      "off",
      {
        "accessibility": "explicit"
      }
    ],
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/indent": [
      "warn",
      2,
      {
        "SwitchCase": 1,
        "FunctionDeclaration": {
          "parameters": "first"
        },
        "FunctionExpression": {
          "parameters": "first"
        }
      }
    ],
    "@typescript-eslint/member-delimiter-style": [
      "warn",
      {
        "multiline": {
          "delimiter": "semi",
          "requireLast": true
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false
        }
      }
    ],
    "@typescript-eslint/member-ordering": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/no-array-constructor": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-empty-interface": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-extra-non-null-assertion": "warn",
    "@typescript-eslint/no-extra-semi": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-for-in-array": "warn",
    "@typescript-eslint/no-implied-eval": "warn",
    "@typescript-eslint/no-inferrable-types": "warn",
    "@typescript-eslint/no-misused-new": "warn",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/no-namespace": "warn",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-this-alias": "warn",
    "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "warn",
    "@typescript-eslint/no-unused-expressions": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "warn",
    "@typescript-eslint/prefer-as-const": "warn",
    "@typescript-eslint/prefer-for-of": "warn",
    "@typescript-eslint/prefer-function-type": "warn",
    "@typescript-eslint/prefer-namespace-keyword": "warn",
    "@typescript-eslint/prefer-regexp-exec": "off",
    "@typescript-eslint/quotes": [
      "off",
      {
        "avoidEscape": true
      }
    ],
    "@typescript-eslint/require-await": "warn",
    "@typescript-eslint/restrict-plus-operands": "warn",
    "@typescript-eslint/restrict-template-expressions": "warn",
    "@typescript-eslint/semi": [
      "warn",
      "always"
    ],
    "@typescript-eslint/triple-slash-reference": [
      "warn",
      {
        "path": "always",
        "types": "prefer-import",
        "lib": "always"
      }
    ],
    "@typescript-eslint/type-annotation-spacing": "warn",
    "@typescript-eslint/unbound-method": "warn",
    "@typescript-eslint/unified-signatures": "warn",
    "arrow-body-style": "warn",
    "arrow-parens": [
      "warn",
      "always"
    ],
    "brace-style": [
      "off",
      "1tbs"
    ],
    "comma-dangle": "off",
    "complexity": "off",
    "constructor-super": "warn",
    "curly": "warn",
    "eol-last": "warn",
    "eqeqeq": [
      "warn",
      "smart"
    ],
    "guard-for-in": "warn",
    "id-blacklist": [
      "warn",
      "any",
      "Number",
      "number",
      "String",
      "string",
      "Boolean",
      "boolean",
      "Undefined",
    ],
    "id-match": "warn",
    "import/order": "warn",
    "jsdoc/check-alignment": "warn",
    "jsdoc/check-indentation": "warn",
    "jsdoc/newline-after-description": "warn",
    "max-classes-per-file": [
      "warn",
      1
    ],
    "max-len": "off",
    "new-parens": "warn",
    "no-array-constructor": "off",
    "no-bitwise": "warn",
    "no-caller": "warn",
    "no-cond-assign": "warn",
    "no-console": "off",
    "no-debugger": "warn",
    "no-empty": "warn",
    "no-empty-function": "off",
    "no-eval": "warn",
    "no-extra-semi": "off",
    "no-fallthrough": "off",
    "no-implied-eval": "off",
    "no-invalid-this": "off",
    "no-multiple-empty-lines": "warn",
    "no-new-wrappers": "warn",
    "no-shadow": [
      "warn",
      {
        "hoist": "all"
      }
    ],
    "no-throw-literal": "warn",
    "no-trailing-spaces": "warn",
    "no-undef-init": "warn",
    "no-underscore-dangle": "warn",
    "no-unsafe-finally": "warn",
    "no-unused-labels": "warn",
    "no-unused-vars": "off",
    "no-var": "warn",
    "object-shorthand": ["warn", "never"],
    "one-var": [
      "warn",
      "never"
    ],
    "prefer-arrow/prefer-arrow-functions": "off",
    "prefer-const": "warn",
    "prefer-rest-params": "warn",
    "quote-props": [
      "warn",
      "consistent-as-needed"
    ],
    "radix": "warn",
    "require-await": "off",
    "space-before-function-paren": [
      "warn",
      {
        "anonymous": "never",
        "asyncArrow": "always",
        "named": "never"
      }
    ],
    "spaced-comment": [
      "warn",
      "always",
      {
        "markers": [
          "/"
        ]
      }
    ],
    "use-isnan": "warn",
    "valid-typeof": "off"
  }
};
