module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-duplicate-imports': ['error', { includeExports: false }],
    'no-irregular-whitespace': ['error', { skipStrings: true, skipRegExps: true }],
    'block-spacing': ['error', 'always'],
    'brace-style': ['error', '1tbs'],
    'comma-spacing': ['error', { before: false, after: true }],
    'arrow-spacing': ['error', { before: true, after: true }],
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    'array-bracket-spacing': ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],
    'eol-last': ['error', 'always'],
    'no-unused-private-class-members': ['error'],
    'no-unused-vars': ['error', { 
      vars: 'all', 
      varsIgnorePattern: '^_', 
      argsIgnorePattern: '^_', 
      args: 'all', 
      caughtErrors: 'all', 
      ignoreRestSiblings: false 
    }],
    'no-unused-expressions': ['error']
  }
};
