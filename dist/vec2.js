export function pack_float(n) {
    var x = `${n}`;
    return (x.includes(".") || x.includes("e")) ? x : x + ".f";
}
export class Vec2 {
    x;
    y;
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `vec2(${pack_float(this.x)}, ${pack_float(this.y)})`;
    }
    normalize() {
        let mag = this.x * this.x + this.y * this.y;
        let inv_mag = 1 / Math.sqrt(mag);
        return new Vec2(this.x * inv_mag, this.y * inv_mag);
    }
    subtract(vec) {
        return new Vec2(this.x - vec.x, this.y - vec.y);
    }
    add(vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }
    scale(f) {
        return new Vec2(this.x * f, this.y * f);
    }
    scale2(f) {
        return new Vec2(this.x * f.x, this.y * f.y);
    }
}
//# sourceMappingURL=vec2.js.map