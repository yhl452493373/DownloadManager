import Enum from "./Enum.js";

class IconType extends Enum {
    static light = new IconType("light");
    static dark = new IconType("dark");
    static auto = new IconType("auto");
}


export default IconType