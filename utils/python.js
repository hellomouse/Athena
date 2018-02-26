/**
 * Function to imitate Python's str.split method, since JavaScript can't split x times
 * @func
 * @param {string} string - The string you want split.
 * @param {string} sep - The seperator by which you want the string to be split
 * @param {number} maxCount - The maximum count of times you wish to split
 * @return {array} - An Array containing the split string
 */
function split(string, sep, maxCount) {
    string = string.split(sep);
    const first = string.slice(0, maxCount);
    const second = string.slice(maxCount).join(sep);

    return [...first, second];
}

module.exports = {
    split
};
