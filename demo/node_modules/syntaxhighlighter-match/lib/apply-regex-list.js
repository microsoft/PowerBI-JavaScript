import { find, sort, removeNested, compact } from './matches';

/**
 * Applies all regular expression to the code and stores all found
 * matches in the `this.matches` array.
 */
export function applyRegexList(code, regexList)
{
  let result = [];

  regexList = regexList || [];

  for (let i = 0, l = regexList.length; i < l; i++) {
    // BUG: length returns len+1 for array if methods added to prototype chain (oising@gmail.com)
    if (typeof regexList[i] === 'object')
      result = result.concat(find(code, regexList[i]));
  }

  result = sort(result);
  result = removeNested(result);
  result = compact(result);

  return result;
}
