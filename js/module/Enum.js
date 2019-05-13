class Enum {
    constructor(code = null, name = null) {
        this.code = code;
        this.name = name;
    }

    toString() {
        return this.name;
    }

    static valueOf(code) {
        return this[code];
    }
}

export {Enum}