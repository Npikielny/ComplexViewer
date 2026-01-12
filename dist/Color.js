import { pack_float } from "./vec2.js";
export class Color {
    values;
    constructor(r = 0.0, g = 0.0, b = 0.0) {
        this.values = [r, g, b];
    }
    toString() {
        return `vec3(${pack_float(this.values[0])}, ${pack_float(this.values[1])}, ${pack_float(this.values[2])})`;
    }
}
export var DEFAULT_COLORS = [
    new Color(0.1, 0.05, 0.013),
    new Color(1.0, 0.0, 0.0),
    new Color(0.0, 1.0, 0.0),
    new Color(0.0, 0.0, 1.0),
    new Color(1.0, 0.0, 1.0),
    new Color(0.003, 0.003, 0.003),
];
//# sourceMappingURL=Color.js.map