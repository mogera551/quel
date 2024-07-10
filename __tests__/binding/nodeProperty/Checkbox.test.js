import {expect, jest, test} from '@jest/globals';

jest.unstable_mockModule('../../src/filter/Manager.js', () => {
  return {
    applyFilter: jest.fn((value, filters) => {
      return filters.reduce((acc, filter) => {
        return acc;
      }, value);
    })
  };
});
