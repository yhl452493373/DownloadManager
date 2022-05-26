import Enum from "./Enum.js";

class OSType extends Enum {
    static mac = new OSType("mac");
    static win = new OSType("win");
    static android = new OSType("android");
    static cros = new OSType("cros");
    static linux = new OSType("linux");
    static openbsd = new OSType("openbsd");
    static fuchsia = new OSType("fuchsia");
}

export default OSType