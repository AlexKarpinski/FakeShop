module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/integration/**/*.int.test.js'],
  testTimeout: 60000,
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/integration/setup.int.js'],
  collectCoverage: false,
  clearMocks: true,
};
