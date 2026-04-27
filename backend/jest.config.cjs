module.exports = {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/src/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/middlewares/**/*.js',
  ],
  coverageReporters: ['text', 'lcov'],
  verbose: true,
};
