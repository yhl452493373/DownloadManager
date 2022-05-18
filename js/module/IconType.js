import Enum from "./Enum.js";

class IconType extends Enum {
    static light = new IconType("light");
    static dark = new IconType("dark");
    static default = new IconType("default");
}


export default IconType