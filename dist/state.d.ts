import { type Color } from "./Color.js";
import type { Trap } from "./trap.js";
import { Vec2 } from "./vec2.js";
export declare enum ComplexMode {
    Julia = 0,
    mandelbrot = 1
}
export declare class State {
    C: Vec2;
    Z: Vec2;
    mode: ComplexMode;
    colors: Color[];
    antialising: number;
    zoom: number;
    constructor(C?: Vec2, Z?: Vec2, mode?: ComplexMode, colors?: Color[], antialising?: number);
}
export declare function generate_shader(trap: Trap, state: State): String;
//# sourceMappingURL=state.d.ts.map