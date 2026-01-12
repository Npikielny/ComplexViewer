import { Vec2, pack_float } from "./vec2.js";

export interface Trap {
    trap(header: String): String;
}

export class DistanceTrap implements Trap {
    public escape: number;
    public centroid: Vec2;

    constructor(escape: number = 1.0, centroid: Vec2 = new Vec2()) {
        this.escape = escape
        this.centroid = centroid
    }

    trap(header: String): String {
        return `
${header}
    return length(p - ${this.centroid}) >= ${pack_float(this.escape)};
}
`
    }
}

export class CircleTrap implements Trap {
    public center: Vec2;
    public radius: number;
    public escape: number;

    constructor(center = new Vec2(), radius=1.0, escape=1.0) {
        this.center = center;
        this.radius = radius;
        this.escape = escape;
    }

    trap(header: String): String {
        return `
${header}
    return abs(length(p - ${this.center}) - ${pack_float(this.radius)}) < ${pack_float(this.escape)};
}
`
    }
}

export class LineTrap implements Trap {
    public normal: Vec2;
    public offset: number;
    public escape: number;

    constructor(normal= new Vec2(0.5, 0.2), offset = 0.1, escape = 0.3) {
        this.normal = normal.normalize();
        this.offset = offset;
        this.escape = escape;
    }

    trap(header: String): String {
        return `
${header}
    return abs(p.x * ${pack_float(this.normal.x)} + p.y * ${pack_float(this.normal.y)} - ${pack_float(this.offset)}) < ${pack_float(this.escape)};
}
`
    }
}

var combinations = 0;

export class CombinationTrap implements Trap {
    public a: Trap;
    public b: Trap;
    public ID: number;
    constructor(a: Trap, b: Trap) {
        this.a = a;
        this.b = b;
        this.ID = combinations;
        combinations += 1;
    }

    trap(header: String): String {
        return `
${this.a.trap(`bool trap_helper_${this.ID}_A(vec2 p) {\n`)}

${this.b.trap(`bool trap_helper_${this.ID}_B(vec2 p) {\n`)}

${header} 
    bool a = trap_helper_${this.ID}_A(p);
    bool b = trap_helper_${this.ID}_B(p);
    return a || b;
}
`
    }
}