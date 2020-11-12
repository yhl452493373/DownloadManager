import {Delta} from "./Delta.js";

class BooleanDelta extends Delta {
    /**
     *
     * @param object {{
     *     previous: boolean,
     *     current: boolean
     * }}
     * @return {BooleanDelta}
     */
    static toDelta(object) {
        if (object === undefined)
            return new BooleanDelta();
        return new BooleanDelta(object.previous, object.current);
    }
}

export {BooleanDelta}