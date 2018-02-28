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

/**
 * Function to imitate Python's range function
 * Returns an Array that produces a sequence of integers from start (inclusive) to stop (exclusive) by step.
 * @generator
 * @param {number} [start] - The starting number. Defaults to 0.
 * @param {number} stop - The end number.
 * @param {number} [step] - Specifies the increment (or decrement). Defaults to 1.
 * @yields {array} - An Array containing the specified range.
 */
function* range(start, stop, step=1) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        yield [];
    }

    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        yield i;
    }
}

module.exports = {
    split,
    range
};
