import next from "eslint-config-next";
import prettier from "eslint-config-prettier";
import ts from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

/** @type {import('typescript-eslint').Config} */
export default ts.config(
  {
    // Global ignores
    ignores: ["**/.next/", "**/node_modules/"],
  },

  // Base configurations from plugins
  ...ts.configs.recommended,

  // Next.js specific config
  next,

  // Main custom configuration
  {
    plugins: {
      "import": importPlugin,
      "unused-imports": unusedImports,
      "react-refresh": reactRefresh,
      "react-hooks": hooks,
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Spread recommended rules first
      ...hooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // Your custom rules (can override recommended)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_"
        }
      ],

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off", // Using unused-imports instead
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          "prefer": "type-imports",
          "fixStyle": "separate-type-imports"
        }
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          "checksVoidReturn": false
        }
      ],

      "react/jsx-no-bind": ["warn", {
        "allowArrowFunctions": true,
        "allowBind": false,
        "ignoreRefs": true
      }],
      "react/jsx-no-constructed-context-values": "warn",

      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/click-events-have-key-events": "warn",

      "import/order": [
        "error",
        {
          "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          "pathGroups": [
            { "pattern": "react", "group": "external", "position": "before" },
            { "pattern": "@/components/**", "group": "internal", "position": "after" },
            { "pattern": "@/lib/**", "group": "internal", "position": "after" },
            { "pattern": "@/hooks/**", "group": "internal", "position": "after" }
          ],
          "pathGroupsExcludedImportTypes": ["react"],
          "newlines-between": "always",
          "alphabetize": { "order": "asc", "caseInsensitive": true }
        }
      ],

      "react-refresh/only-export-components": ["warn", { "allowConstantExport": true }],

      "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
      "prefer-const": "error",
      "no-var": "error"
    }
  },

  // Overrides for specific file types
  {
    files: ["**/__tests__/**/*", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off"
    }
  },
  {
    files: ["**/workers/**/*"],
    languageOptions: {
      globals: {
        ...globals.worker
      }
    },
    rules: {
      "no-restricted-globals": "off"
    }
  },

  prettier
);
