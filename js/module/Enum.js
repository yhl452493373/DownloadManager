class Enum {

    /**
     *
     * @param code {string|boolean|number}
     * @param name {string?}
     */
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }

    toString() {
        return this.name;
    }

    static valueOf(code) {
        let keys = Object.keys(this);
        if (keys.indexOf(code) === -1)
            return null;
        return this[code];
    }

    static toEnum(object) {
        if (object == null)
            return null;
        if (typeof object === 'string') {
            return this.valueOf(object);
        } else if (typeof object === 'object' && object.hasOwnProperty('code') && object.hasOwnProperty('name')) {
            return this.valueOf(object.code);
        }
    }
}

export default Enum