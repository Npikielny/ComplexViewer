import { DEFAULT_COLORS, type Color } from "./Color.js";
import type { Trap } from "./trap.js";
import { pack_float, Vec2 } from "./vec2.js";

const COMPRESSED = false;

export enum ComplexMode {
    Julia = 0,
    mandelbrot = 1
}

export class State {
    public C: Vec2;
    public Z: Vec2;
    public mode: ComplexMode;
    public colors: Color[];
    public antialising: number;
    public zoom: number;

    constructor(
        C = new Vec2(),
        Z = new Vec2(),
        mode: ComplexMode = ComplexMode.Julia,
        colors = DEFAULT_COLORS,
        antialising = 1
    ) {
        this.C = C
        this.Z = Z
        this.mode = mode
        this.colors = colors
        this.antialising = antialising
        this.zoom = 1;
    }
}

function n_to_escape(state: State, trap: Trap) {
    switch (state.mode) {
        case ComplexMode.Julia:
            return `
${trap.trap("bool julia_trap(vec2 p) {")}
int n_to_escape(vec2 coords, int max_n) {
    vec2 z = coords;
    for (int i = 0; i < max_n; i++) {
        if (julia_trap(z)) {
            return i;
        }
        z = complex_mul(z, z) + ${state.C};
    }
    return 0;
}
`;
        case ComplexMode.mandelbrot:
return `
${trap.trap("bool mandelbrot_trap(vec2 p) {")}
int n_to_escape(vec2 coords, int max_n) {
    vec2 z = vec2(0.0);
    for (int i = 0; i < max_n; i++) {
        if (mandelbrot_trap(z)) {
            return i;
        }
        z = complex_mul(z, z) + coords;
    }
    return 0;
}
`
    }
}

function compile_legend(state: State): String {
    const color_str = state.colors
        .map((c) => `${c}`)
        .reduce((total: string, current: String) => total + (total.length > 0 ? ",\n" : "") + "    " + current)

    return `
const vec3 colors[${state.colors.length}] = vec3[](
${color_str}
);

vec3 complex_color(int value, int max_n) {
    int color_size = ${state.colors.length};
    int min_color_id = value / color_size;
    if (min_color_id >= color_size - 1) {
        return colors[color_size - 1];
    }
    return mix(
        colors[min_color_id],
        colors[min_color_id + 1],
        float(value - min_color_id * color_size) / float(color_size)
    );
}
`
}

function compile_samples(state: State): String {
    var res = "";
    for (let i = 0; i < state.antialising * state.antialising; i ++) {
        let xc = ((i % state.antialising) + 1) / (state.antialising + 1) - 0.5;
        let yc = (Math.floor(i / state.antialising) + 1) / (state.antialising + 1) - 0.5;
        res += `c += float(n_to_escape(coords + vec2(${pack_float(xc)}, ${pack_float(yc)}) * pixel_size, max_n));\n`
    }
    return res;
}

// vec2 compress(vec2 x) {
//     float theta = atan2(x.y, x.x);
//     float mag = length(x);
//     return vec2(theta, log(mag));
// }

// vec2 compress_complex_mul(vec2 a, vec2 b) {
//     return a + b;
// }

// vec2 decompress_complex(vec2 x) {
//     return exp()
// }




export function generate_shader(trap: Trap, state: State): String {
    return `#version 300 es
precision highp float;

in vec2 coords;
out vec4 outColor;
uniform vec2 resolution;

vec2 complex_mul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}${n_to_escape(state, trap)}${compile_legend(state)}
const int max_n = 255;

const int n_antialiasing = ${state.antialising};

void main() {
    float c = 0.0;
    vec2 pixel_size = vec2(1.0) / vec2(float(resolution.x), float(resolution.y)) * ${pack_float(state.zoom)} * 2.f;

    ${COMPRESSED ? "coords = compress(coords);" : ""}
    ${compile_samples(state)}
    c *= ${pack_float(1.0 / (state.antialising * state.antialising))};

    outColor = vec4(complex_color(int(c), max_n), 1.0);
}
`;
}