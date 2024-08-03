export default {
  preset: 'ts-jest',
//  testEnvironment: 'jest-environment-node',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },  
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