module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/config/**', '!src/models/**'],
  coverageDirectory: 'coverage',
};
