import { Vec2 } from "./vec2.js";
export interface Trap {
    trap(header: String): String;
}
export declare class DistanceTrap implements Trap {
    escape: number;
    centroid: Vec2;
    constructor(escape?: number, centroid?: Vec2);
    trap(header: String): String;
}
export declare class CircleTrap implements Trap {
    center: Vec2;
    radius: number;
    escape: number;
    constructor(center?: Vec2, radius?: number, escape?: number);
    trap(header: String): String;
}
export declare class LineTrap implements Trap {
    normal: Vec2;
    offset: number;
    escape: number;
    constructor(normal?: Vec2, offset?: number, escape?: number);
    trap(header: String): String;
}
export declare class CombinationTrap implements Trap {
    a: Trap;
    b: Trap;
    ID: number;
    constructor(a: Trap, b: Trap);
    trap(header: String): String;
}
//# sourceMappingURL=trap.d.ts.map