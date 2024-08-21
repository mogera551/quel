
export function CacheKey(pattern:string, indexesString:string) {
  return `${pattern}:${indexesString}`;
}