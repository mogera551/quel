export default {
//  testEnvironment: 'jest-environment-node',
  testEnvironment: 'jsdom',
  transform: {},
  collectCoverage: true,
//  setupFilesAfterEnv: ['<rootDir>/mock/setup-mock.js'],
  coveragePathIgnorePatterns: [
    "/node_modules/", 
    "/demo/",
    "/test/",
    "/tutorial/",
    "/modules/",
  ]
};