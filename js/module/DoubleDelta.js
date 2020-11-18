import {Delta} from "./Delta.js";

class DoubleDelta extends Delta {
    /**
     *
     * @param object {{
     *     previous: number,
     *     current: number
     * }}
     * @return {DoubleDelta}
     */
    static toDelta(object) {
        if (object === undefined)
            return new DoubleDelta();
        return new DoubleDelta(object.previous, object.current);
    }
}

export {DoubleDelta}