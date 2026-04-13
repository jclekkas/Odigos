import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

// ── Custom rule: require .js extension on relative imports ────────────
// Prevents the ERR_MODULE_NOT_FOUND crashes that occur when Node.js ESM
// tries to resolve extensionless relative imports at runtime (e.g. on Vercel).
const requireJsExtension = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require .js extension on relative imports for Node.js ESM compatibility",
    },
    schema: [],
  },
  create(context) {
    function check(node) {
      const source = node.source || (node.arguments && node.arguments[0]);
      if (
        !source ||
        source.type !== "Literal" ||
        typeof source.value !== "string"
      )
        return;
      const val = source.value;
      // Only check relative imports (./  ../)
      if (!val.startsWith("./") && !val.startsWith("../")) return;
      // Skip if already has a file extension
      const lastSegment = val.split("/").pop();
      if (lastSegment && /\.[a-zA-Z0-9]+$/.test(lastSegment)) return;
      context.report({
        node: source,
        message: `Relative import "${val}" must include a .js extension for ESM compatibility.`,
      });
    }
    return {
      ImportDeclaration: check,
      ImportExpression: check,
      ExportNamedDeclaration(node) {
        if (node.source) check(node);
      },
      ExportAllDeclaration: check,
    };
  },
};

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".cache/**",
      "client/**",
      "*.config.ts",
      "*.config.mjs",
      "script/**",
    ],
  },
  {
    files: ["server/**/*.ts", "tests/**/*.ts", "shared/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      custom: { rules: { "require-js-extension": requireJsExtension } },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
      "custom/require-js-extension": "error",
    },
  },
];
