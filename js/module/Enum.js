import Util from "./Util.js";

class Enum {
    /**
     *
     * @param code {string|boolean|number}
     * @param name {string?}
     */
    constructor(code, name) {
        this.code = code;
        if(Util.emptyString(name))
            this.name = code;
        else
            this.name = name;
    }

    toString() {
        return this.name;
    }

    static valueOfCode(code) {
        let keys = Object.keys(this);
        let that = this;
        let findEnum = null;
        keys.forEach(key => {
            if (that[key].code === code) {
                findEnum = that[key];
            }
        });
        return findEnum;
    }

    static valueOf(key) {
        let keys = Object.keys(this);
        if (keys.indexOf(key) === -1)
            return null;
        return this[key];
    }

    static toEnum(object) {
        if (object == null)
            return null;
        if (typeof object === 'string') {
            return this.valueOf(object) || this.valueOfCode(object);
        } else if (typeof object === 'object' && object.hasOwnProperty('code') && object.hasOwnProperty('name')) {
            return this.valueOf(object.code);
        }
    }
}

export default Enum