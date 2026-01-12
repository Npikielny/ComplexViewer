export declare function pack_float(n: number): String;
export declare class Vec2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    toString(): string;
    normalize(): Vec2;
    subtract(vec: Vec2): Vec2;
    add(vec: Vec2): Vec2;
    scale(f: number): Vec2;
    scale2(f: Vec2): Vec2;
}
//# sourceMappingURL=vec2.d.ts.map