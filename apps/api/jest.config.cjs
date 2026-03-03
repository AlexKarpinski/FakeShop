module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/unit/**/*.unit.test.js',
    '**/__tests__/component/**/*.component.test.js',
    '**/__tests__/contract/**/*.contract.test.js',
  ],
  setupFiles: ['<rootDir>/src/__tests__/setupEnv.js'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
    '!src/models/**',
    '!src/docs/**',
    '!src/seed/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60,
    },
  },
};
