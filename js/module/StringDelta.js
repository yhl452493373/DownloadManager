import {Delta} from "./Delta.js";

class StringDelta extends Delta {
    /**
     *
     * @param object {{
     *     previous: string,
     *     current: string
     * }}
     * @return {StringDelta}
     */
    static toDelta(object) {
        if (object === undefined)
            return new StringDelta();
        return new StringDelta(object.previous, object.current);
    }
}

export {StringDelta}