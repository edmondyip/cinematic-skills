import { createOcean, swell } from "../skills/interactive-ocean/scripts/ocean.mjs";
import { stepFloats } from "../skills/floating-object-physics/scripts/floats.mjs";
import { dayNight } from "../skills/procedural-day-night/scripts/day-night.mjs";

const canvas = document.querySelector("canvas");
const status = document.querySelector("#status");
const gl = canvas.getContext("webgl2");
if (!gl) {
  status.textContent = "WebGL 2 is required.";
  throw new Error(status.textContent);
}

const vertex = `#version 300 es
layout(location=0) in vec3 position;
layout(location=1) in vec3 color;
layout(location=2) in float size;
out vec3 tint;
void main() {
  gl_Position = vec4(position.x/5.5, position.y*.36-position.z*.19+.18,
    -position.z*.13-position.y*.15, 1.);
  gl_PointSize = size;
  tint = color;
}`;
const fragment = `#version 300 es
precision highp float;
in vec3 tint;
out vec4 pixel;
uniform bool markers;
void main() {
  vec3 color = tint;
  if (markers) {
    vec2 xy = gl_PointCoord*2.-1.;
    float d = dot(xy, xy);
    if (d>1.) discard;
    vec3 n = vec3(xy.x,-xy.y,sqrt(1.-d));
    color *= .63+.37*max(0., dot(n, normalize(vec3(-.6,.75,1.))));
  }
  pixel = vec4(color,1.);
}`;

const program = gl.createProgram();
for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]]) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
  gl.attachShader(program, shader);
  gl.deleteShader(shader);
}
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
gl.useProgram(program);

const ocean = createOcean();
const { columns, rows, width, length } = ocean;
const grid = new Float32Array(columns * rows * 7);
const indices = [];
for (let j = 0; j < rows - 1; j++) {
  for (let i = 0; i < columns - 1; i++) {
    const n = j * columns + i;
    indices.push(n, n + 1, n + columns, n + 1, n + columns + 1, n + columns);
  }
}
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

const body = (x, z, r, color) => ({ x, z, r, y: r * .48, x0: x, z0: z, vx: 0, vy: 0, vz: 0, color });
const floats = [
  body(-1.8, -.65, .29, [1, .68, .28]),
  body(.2, .33, .32, [.94, .55, .25]),
  body(1.7, 1.05, .27, [.49, .88, .94]),
];
const markers = new Float32Array(floats.length * 7);
const points = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, points);
for (const [index, size, offset] of [[0, 3, 0], [1, 3, 12], [2, 1, 24]]) {
  gl.enableVertexAttribArray(index);
  gl.vertexAttribPointer(index, size, gl.FLOAT, false, 28, offset);
}
const markerUniform = gl.getUniformLocation(program, "markers");
const clock = document.querySelector("#hour");
const time = document.querySelector("#time");
const fixed = 1 / 90;
let seconds = 0, remainder = 0, previous = performance.now();

const heightAt = (x, z) => .36 * swell(x, z, seconds, .55) + ocean.sample(x, z);
function step() {
  seconds += fixed;
  ocean.advance(fixed);
  stepFloats(floats, heightAt, fixed);
}

function render() {
  const hour = Number(clock.value);
  const { sun, daylight, twilight, lamps } = dayNight(hour);
  time.value = hour.toFixed(2) + " h";
  gl.clearColor(.019 + daylight * .07, .038 + daylight * .095, .065 + daylight * .115, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < columns; i++) {
      const x = width * (i / (columns - 1) - .5), z = length * (j / (rows - 1) - .5);
      const h = heightAt(x, z);
      const dx = (heightAt(x + .12, z) - heightAt(x - .12, z)) / .24;
      const dz = (heightAt(x, z + .12) - heightAt(x, z - .12)) / .24;
      const cosine = Math.max(0, (sun[1] - dx * sun[0] - dz * sun[2]) / Math.hypot(dx, 1, dz));
      const lines = (i % 8 === 0 || j % 8 === 0) ? .085 : 0;
      const wave = Math.max(-.09, Math.min(.09, h * .8));
      const light = .19 + daylight * (.26 + cosine * .55);
      grid.set([x, h, z, light * (.09 + twilight * daylight * .14 + lines),
        light * (.45 + wave + lines), light * (.61 + wave + lines), 1], (j * columns + i) * 7);
    }
  }
  gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STREAM_DRAW);
  gl.uniform1i(markerUniform, 0);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  for (const [i, b] of floats.entries()) {
    const gain = .55 + daylight * .45 + lamps * .18;
    markers.set([b.x, b.y + b.r * .26, b.z, ...b.color.map(c => c * gain), b.r * 155], i * 7);
  }
  gl.bufferData(gl.ARRAY_BUFFER, markers, gl.STREAM_DRAW);
  gl.uniform1i(markerUniform, 1);
  gl.drawArrays(gl.POINTS, 0, floats.length);
}

function animate(now) {
  remainder += Math.min(.075, Math.max(0, (now - previous) / 1000));
  previous = now;
  while (remainder >= fixed) {
    step();
    remainder -= fixed;
  }
  render();
  requestAnimationFrame(animate);
}

const sendRipple = (x, z) => ocean.stamp(x, z, 0, 0, 4);
document.querySelector("#ripple").onclick = () => sendRipple(0, .7);
canvas.onpointerdown = (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width * 2 - 1) * 5.5;
  const z = (((event.clientY - rect.top) / rect.height * 2 - 1) + .18) / .19;
  if (Math.abs(x) <= width / 2 && Math.abs(z) <= length / 2) sendRipple(x, z);
};
sendRipple(-.4, .8);
status.value = "WebGL 2";
requestAnimationFrame(animate);
