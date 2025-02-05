import { URLS } from '../utils/urls';
describe('URLS object', () => {
  /**
   * This test checks if the githubOrgUrl property of the URLS object
   * exists and has the correct value.
   */
  it('should have the correct githubOrgUrl', () => {
    expect(URLS.githubOrgUrl).toBeDefined();
    expect(URLS.githubOrgUrl).toBe('https://github.com/inkonchain');
  });
});
