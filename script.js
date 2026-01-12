import { loadShader } from "./shader.js";
import { ComplexMode, State, generate_shader } from "./dist/state.js";
import { CircleTrap, CombinationTrap, DistanceTrap, LineTrap } from "./dist/trap.js";
import { pack_float, Vec2 } from "./dist/vec2.js";
import { DEFAULT_COLORS } from "./dist/Color.js";

main()

var state
var vao
var shaderProgram
var gl
function main() {
    state = new State(new Vec2(0.3, 0.2), new Vec2(0.0, 0.0), ComplexMode.Julia, DEFAULT_COLORS, 1);
    const canvas = document.querySelector("#gl");

    gl = canvas.getContext("webgl2", { antialias: false });

    window.addEventListener("resize", () => { resizeCanvas(gl, canvas) });

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
        "Unable to initialize WebGL. Your browser or machine may not support it.",
        );
        return;
    }
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    resizeCanvas(gl, canvas)
    update()
    draw(gl, canvas)

    var isDragging = false;
    var mousepos = new Vec2();
    // Mouse button pressed
    window.addEventListener('mousedown', (e) => {
      isDragging = true;
      console.log('Mouse pressed at:', e.clientX, e.clientY);
      mousepos = new Vec2(e.clientX, e.clientY);
    });

    // Mouse released
    window.addEventListener('mouseup', (e) => {
      if (isDragging) {
        isDragging = false;
        console.log('Mouse released at:', e.clientX, e.clientY);
      }
    });

    // Mouse moved
    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        console.log('Mouse dragged at:', e.clientX, e.clientY);
        // dragArea.textContent = `Dragging at (${e.clientX}, ${e.clientY})`;
        let new_pos = new Vec2(e.clientX, e.clientY);

        switch (state.mode) {
            case ComplexMode.Julia:
                state.C = state.C.add(new_pos.subtract(mousepos).scale(1 / 1000 * state.zoom))
                break;
            case ComplexMode.mandelbrot:
                state.Z = state.Z.add(new_pos.subtract(mousepos).scale(1 / 1000 * state.zoom))
        }

        mousepos = new_pos;
        update();
        draw(gl, canvas)
      }
    });

    // window.addEventListener('keyup', (e) => {
    //   if (e.code === 'Space') {
    //     console.log("PRESSED")
    //     draw(gl, canvas)
    //     save(canvas, gl)
    //   }
    // });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        switch (state.mode) {
            case ComplexMode.Julia:
                state.mode = ComplexMode.mandelbrot
                break
            case ComplexMode.mandelbrot:
                state.mode = ComplexMode.Julia
                break
        }
        update()
        draw(gl, canvas)
      } else if (e.code === 'ArrowUp') {
        state.antialising += 1
        update()
        draw(gl, canvas)
      } else if (e.code === 'ArrowDown') {
        state.antialising = Math.max(state.antialising - 1, 1)
        update()
        draw(gl, canvas)
      } else if (e.code === 'Digit1') {
        state.antialising = 1
        update()
        draw(gl, canvas)
      } else if (e.code === 'Enter') {
        draw(gl, canvas)
        save(canvas, gl)
      }
      console.log(state.antialising, e.code)
    });

    window.addEventListener('wheel', (e) => {
        e.preventDefault(); // prevent page scroll

        const delta = Math.exp(e.deltaY * 0.001);

        state.zoom *= delta;
        state.zoom = Math.min(2, Math.max(state.zoom, 0.0000001));

        update()
        draw(gl, canvas)
        console.log("WHEEL")
});
}

function update() {
    shaderProgram = attach_shader(gl);
}

function draw(gl, canvas) {
    if (shaderProgram === undefined) {
        console.log("TRIED DRAWING WITH NO PROGRAM")
        return
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    console.log("Bogos binted")

    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);

    const uResolutionLoc = gl.getUniformLocation(shaderProgram, "resolution");
    gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
}

function resizeCanvas(gl, canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    const width  = Math.round(rect.width  * dpr);
    const height = Math.round(rect.height * dpr);

    if (canvas.width !== width || canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        // const uResolutionLoc = gl.getUniformLocation(shaderProgram, "resolution");
        // gl.useProgram(shaderProgram);
        // gl.uniform2f(uResolutionLoc, width, height);
    }

  console.log("RESIZED", canvas.width, canvas.height)

  draw(gl, canvas)
}

function write_shader() {
    // var trap = new DistanceTrap(4.0, new Vec2())
    var trap = new CircleTrap(new Vec2(), 1.0, 0.005);
    // var trap = new LineTrap(new Vec2(3.0, 3.0), 1, 0.025);
    // var trap = new CombinationTrap(
    //     new CircleTrap(new Vec2(), 1.0, 0.005),
    //     new LineTrap(new Vec2(3.0, 3.0), 1, 0.025)
    // )
    var x = generate_shader(trap, state);
    return x;
}

function attach_shader(gl) {
    const vertex_shader = `#version 300 es
precision highp float;

const vec2 corners[6] = vec2[](
  vec2(-1.0, -1.0),
  vec2( 1.0,  1.0),
  vec2(-1.0,  1.0),
  vec2(-1.0, -1.0),
  vec2( 1.0,  -1.0),
  vec2( 1.0,  1.0) 
);

out vec2 coords;

void main() {
    coords = corners[gl_VertexID] * ${pack_float(state.zoom)} + ${state.Z.scale2(new Vec2(-1, 1))};
    gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}
    `;
    console.log(vertex_shader)

    const fragment_shader = write_shader();
    // console.log(fragment_shader);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, loadShader(gl, gl.VERTEX_SHADER, vertex_shader));
    gl.attachShader(shaderProgram, loadShader(gl, gl.FRAGMENT_SHADER, fragment_shader));
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
            shaderProgram,
        )}`,
        );
        return null;
    }

    return shaderProgram;
}

function save(canvas, gl) {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    let scale = 4;
    canvas.width *= scale;
    canvas.height *= scale;
    gl.viewport(0, 0, canvas.width, canvas.height);

    draw(gl, canvas); // redraw at high resolution
    gl.finish()

    const imageURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = 'my_drawing_highres.png';
    link.click();

    // Restore old size
    canvas.width = oldWidth;
    canvas.height = oldHeight;
    gl.viewport(0, 0, oldWidth, oldHeight);
    draw(gl, canvas)
}