
/**
 * @enum {number} 実行フェーズ
 */
export const Phase = {
  sleep: 0 ,
  updateViewModel: 1,
  gatherUpdatedProperties: 2,
  applyToNode: 3,
  terminate: 100,
};
