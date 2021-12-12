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
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/await-thenable": "warn",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/ban-types": [
      "warn",
      {
        "types": {
          "Object": {
            "message": "Avoid using the `Object` type. Did you mean `object`?"
          },
          "Function": false,
          "object": false,
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
    "@typescript-eslint/consistent-type-definitions": "warn",
    "@typescript-eslint/dot-notation": "off",
    "@typescript-eslint/explicit-member-accessibility": [
      "off",
      {
        "accessibility": "explicit"
      }
    ],
    "@typescript-eslint/explicit-module-boundary-types": [
      "warn",
      { "allowArgumentsExplicitlyTypedAsAny": true }
    ],
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
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        "allowExpressions": true,
        "allowDirectConstAssertionInArrowFunctions": true
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
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-for-in-array": "warn",
    "@typescript-eslint/no-implied-eval": "warn",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-misused-new": "warn",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-namespace": "warn",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-this-alias": "warn",
    "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unused-expressions": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "args": "after-used", "argsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "warn",
    "@typescript-eslint/prefer-as-const": "warn",
    "@typescript-eslint/prefer-for-of": "warn",
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
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/semi": [
      "error",
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
    "@typescript-eslint/unbound-method": "off",
    "@typescript-eslint/unified-signatures": "warn",
    "arrow-parens": "off",
    "brace-style": [
      "off",
      "1tbs"
    ],
    "comma-dangle": "off",
    "complexity": "off",
    "constructor-super": "warn",
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
    "import/order": "off",
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
    "no-multiple-empty-lines": ["error", { "max": 1 }],
    "no-new-wrappers": "warn",
    "no-shadow": "off",
    "no-trailing-spaces": "warn",
    "no-undef-init": "warn",
    "no-underscore-dangle": "off",
    "no-unsafe-finally": "warn",
    "no-unused-labels": "warn",
    "no-var": "warn",
    "object-shorthand": "off",
    "one-var": "off",
    "prefer-const": "off",
    "prefer-rest-params": "warn",
    "quote-props": [
      "warn",
      "consistent-as-needed"
    ],
    "radix": "warn",
    "require-await": "off",
    "space-before-function-paren": "off",
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
