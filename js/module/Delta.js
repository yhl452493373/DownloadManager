class Delta {
    /**
     * @type string|boolean|number
     */
    previous;

    /**
     * @type string|boolean|number
     */
    current;

    /**
     *
     * @param previous {string|boolean|number?}
     * @param current {string|boolean|number?}
     */
    constructor(previous, current) {
        this.previous = previous;
        this.current = current;
    }

    isEmpty() {
        return !this.isNotEmpty();
    }

    isNotEmpty() {
        return this.previous !== undefined || this.current !== undefined;
    }

    /**
     *
     * @param object {{
     *     previous: string|boolean|number,
     *     current: string|boolean|number
     * }}
     * @return {Delta}
     */
    static toDelta(object) {
        return new Delta(object.previous, object.current);
    }
}

export {Delta}