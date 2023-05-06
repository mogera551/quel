export default {
//  testEnvironment: 'jest-environment-node',
  testEnvironment: 'jsdom',
  transform: {},
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules/", 
    "/demo/",
    "/test/",
    "/tutorial/",
    "/modules/",
  ]
};