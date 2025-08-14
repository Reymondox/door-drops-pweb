export function Contains (array, value, options) {
    if (array && Array.isArray(array)) {
        const numValue = Number(value);
        const numArray = array.map(item => Number(item));
        if (numArray.includes(numValue)) {
            return options.fn(this);
        }
    } else if (array !== undefined && array !== null && Number(array) === Number(value)) {
        return options.fn(this);
    }
    return options.inverse(this);
}
