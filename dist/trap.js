import { Vec2, pack_float } from "./vec2.js";
export class DistanceTrap {
    escape;
    centroid;
    constructor(escape = 1.0, centroid = new Vec2()) {
        this.escape = escape;
        this.centroid = centroid;
    }
    trap(header) {
        return `
${header}
    return length(p - ${this.centroid}) >= ${pack_float(this.escape)};
}
`;
    }
}
export class CircleTrap {
    center;
    radius;
    escape;
    constructor(center = new Vec2(), radius = 1.0, escape = 1.0) {
        this.center = center;
        this.radius = radius;
        this.escape = escape;
    }
    trap(header) {
        return `
${header}
    return abs(length(p - ${this.center}) - ${pack_float(this.radius)}) < ${pack_float(this.escape)};
}
`;
    }
}
export class LineTrap {
    normal;
    offset;
    escape;
    constructor(normal = new Vec2(0.5, 0.2), offset = 0.1, escape = 0.3) {
        this.normal = normal.normalize();
        this.offset = offset;
        this.escape = escape;
    }
    trap(header) {
        return `
${header}
    return abs(p.x * ${pack_float(this.normal.x)} + p.y * ${pack_float(this.normal.y)} - ${pack_float(this.offset)}) < ${pack_float(this.escape)};
}
`;
    }
}
var combinations = 0;
export class CombinationTrap {
    a;
    b;
    ID;
    constructor(a, b) {
        this.a = a;
        this.b = b;
        this.ID = combinations;
        combinations += 1;
    }
    trap(header) {
        return `
${this.a.trap(`bool trap_helper_${this.ID}_A(vec2 p) {\n`)}

${this.b.trap(`bool trap_helper_${this.ID}_B(vec2 p) {\n`)}

${header} 
    bool a = trap_helper_${this.ID}_A(p);
    bool b = trap_helper_${this.ID}_B(p);
    return a || b;
}
`;
    }
}
//# sourceMappingURL=trap.js.map