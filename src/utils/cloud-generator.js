class Vertex {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Line {
  constructor(vertices) {
    this.vertices = vertices;
  }

  getLength() {
    const { vertices } = this;
    const v0 = vertices[0];
    const v1 = vertices[1];

    return Math.sqrt((v1.x - v0.x) ** 2 + (v1.y - v0.y) ** 2);
  }

  getMidpoint() {
    const { vertices } = this;
    const v0 = vertices[0];
    const v1 = vertices[1];

    return {
      x: (v0.x + v1.x) / 2,
      y: (v0.y + v1.y) / 2
    };
  }

  getNormal() {
    const { vertices } = this;
    const v0 = vertices[0];
    const v1 = vertices[1];

    // the two points can not be the same
    let nx = v1.x - v0.x; // as vector
    let ny = v1.y - v0.y;
    const len = Math.sqrt(nx * nx + ny * ny); // length of line
    nx = nx / len; // make one unit long
    ny = ny / len; // which we call normalising a vector
    return [-ny, nx]; // return the normal  rotated 90 deg
  }

  getNormalLine(length = 0.5) {
    return {
      vertices: [
        this.vertices[1],
        {
          x:
            this.getMidpoint().x -
            this.getNormal()[0] * this.getLength() * length,
          y:
            this.getMidpoint().y -
            this.getNormal()[1] * this.getLength() * length
        }
      ]
    };
  }
}

//-------------------------------------

function qs(selector) {
  return document.querySelector(selector);
}

/**
 * Creates a pseudo-random value generator. The seed must be an integer.
 *
 * Uses an optimized version of the Park-Miller PRNG.
 * http://www.firstpr.com.au/dsp/rand31/
 */
class PRNG {
  constructor(seed = 0) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) {
      this.seed += 2147483646;
    }
  }

  /**
   * Returns a pseudo-random value between 1 and 2^32 - 2.
   */
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed;
  }

  /**
   * Returns a pseudo-random floating point number in range [0, 1).
   */
  generate(min = 0, max = 1) {
    // We know that result of next() will be 1 to 2147483646 (inclusive).
    return min + ((this.next() - 1) / 2147483646) * (max - min);
  }
}

//--------------------------------------

class ValueNoise {
  /**
   * ValueNoise object
   * @param {number} wavelength space between noise nodes
   * @param {number} amplitude max value of output
   */
  constructor(
    seed = ~~(Math.random() * 2 ** 31),
    wavelength = 20,
    amplitude = 1,
    width = 500,
    height = 500
  ) {
    this.width = width;
    this.height = height;
    this.wavelengthx = wavelength;
    this.wavelengthy = wavelength;
    this.amplitude = amplitude || 1;
    this.seed = seed;

    this.octaves = 1;
    this.oFactor = 2;

    this.randomise(this.seed);

    this.interpolate = this.cosine;
  }

  cosine(pa, pb, px) {
    const ft = px * Math.PI;
    const f = (1 - Math.cos(ft)) * 0.5;
    return pa * (1 - f) + pb * f;
  }

  cubic(pa, pb, px) {
    return px < 0.5
      ? 4 * px ** 3 * (pb - pa) + pa
      : ((px - 1) * (2 * px - 2) * (2 * px - 2) + 1) * (pb - pa) + pa;
  }

  quadratic(pa, pb, px) {
    return px < 0.5
      ? 2 * px ** 2 * (pb - pa) + pa
      : (-1 + (4 - 2 * px) * px) * (pb - pa) + pa;
  }

  /**
   * Linearly interpolate between 2 points
   * @param {number} pa point a
   * @param {number} pb point b
   * @param {number} px fractional distance
   */
  linear(pa, pb, px) {
    return pa + (pb - pa) * px;
  }

  /**
   * Regenerate rows array
   */
  randomise(seed = ~~(Math.random() * (2 ** 31 - 1))) {
    const rand = new PRNG(seed);

    this.rows = Array(this.height)
      .fill(0)
      .map(() =>
        Array(this.width)
          .fill(0)
          .map(() => rand.generate() * this.amplitude)
      );
  }

  /**
   * Generate a point in 2d noise
   * @param {number} x x position
   * @param {number} y y position
   * @param {number} wavelengthx xwavelength
   * @param {number} wavelengthy y wavelength
   * @param {number} amplitude max height of noise
   */
  gen2d(x, y, wavelengthx, wavelengthy, amplitude) {
    // get node indices from array closest to supplied position
    let currx = ~~(x / wavelengthx);
    let nextx = ~~(x / wavelengthx) + 1;
    let curry = ~~(y / wavelengthy);
    let nexty = ~~(y / wavelengthy) + 1;

    if (y % wavelengthy === 0) {
      // y is a node

      if (x % wavelengthx === 0) {
        // x is a node
        return this.rows[curry][currx] * amplitude;
      } else {
        // between x nodes
        return (
          this.interpolate(
            this.rows[curry][currx],
            this.rows[curry][nextx],
            (x % wavelengthx) / wavelengthx
          ) * amplitude
        );
        // return 0;
      }
    } else {
      // between y nodes
      if (x % wavelengthx === 0) {
        // x is a node
        return (
          this.interpolate(
            this.rows[curry][currx],
            this.rows[nexty][currx],
            (y % wavelengthy) / wavelengthy
          ) * amplitude
        );
      } else {
        // between x nodes
        return this.interpolate(
          this.interpolate(
            this.rows[curry][currx],
            this.rows[nexty][currx],
            (y % wavelengthy) / wavelengthy
          ) * amplitude, //
          this.interpolate(
            this.rows[curry][nextx],
            this.rows[nexty][nextx],
            (y % wavelengthy) / wavelengthy
          ) * amplitude,
          (x % wavelengthx) / wavelengthx
        );
      }
    }
  }

  /**
   * Generate a point in 2d noise with octaves
   * @param {number} x x position
   * @param {number} y y position
   */
  generate(x, y = 0) {
    let ret = 0;
    let offset = 0;

    // generate each octave and add it
    for (let i = 0; i < this.octaves; i++) {
      const amplitude = this.amplitude / this.oFactor ** i;
      const wavelengthx = Math.max(this.wavelengthx / this.oFactor ** i, 1);
      const wavelengthy = Math.max(this.wavelengthy / this.oFactor ** i, 1);

      ret += this.gen2d(x, y, wavelengthx, wavelengthy, amplitude);
      offset += 1 / this.oFactor ** i;
    }

    return ret / offset;
  }
}

//--------------------------------

let svg = document.createElement("svg");
const xmlns = "http://www.w3.org/2000/svg";

//--------------------------------

function drawClouds(
  settings = {
    offset: 20,
    fill: "rgba(255,255,255,0.3",
    turbulence: 50,
    stepSize: 30
  }
) {
  const points = [];
  const lines = [];

  const { offset, fill, turbulence, stepSize, noise } = settings;

  noise.octaves = 2;

  // add first point
  points.push(
    new Vertex(
      -50,
      offset + noise.generate(0, offset * 2) * turbulence + stepSize * 0.4
    )
  );

  const svgHeight = +svg.getAttribute("height");
  const svgWidth = +svg.getAttribute("width");

  // svg
  let svgPath = `M 0 ${svgHeight} L ${points[0].x} ${points[0].y}`;

  let i = 1;
  while (points[points.length - 1].x < svgWidth) {
    const step = stepSize;
    const offsetX = Math.random() * step * 1.5 - step * 0.75;
    const x = points[i - 1].x + step + offsetX;

    const offsetY = noise.generate(x, offset * 2) * turbulence;
    const y = offset + offsetY + stepSize / 2;

    const newVertex = new Vertex(x, y);
    points.push(newVertex);

    const newLine = new Line([points[i - 1], points[i]]);
    lines.push(newLine);

    // svg
    svgPath += ` Q ${newLine.getNormalLine().vertices[1].x} ${
      newLine.getNormalLine().vertices[1].y
    } ${newLine.vertices[1].x} ${newLine.vertices[1].y}`;

    i++;
  }
  // svg
  svgPath += ` L ${svgWidth} ${svgHeight}`;

  const path = document.createElementNS(xmlns, "path");
  path.setAttribute("d", svgPath);
  path.setAttribute("fill", fill);
  svg.appendChild(path);
}

const turb = 50;

/**
 * Generate a group of clouds
 * @param {object} count number of layers
 */
export function drawMultiClouds(_settings) {
  const settings = Object.assign(
    {
      count: 3,
      turbulence: turb,
      seed: 0,
      offset: 50,
      step: 50,
      width: 0,
      current: 1
    },
    _settings
  );

  const { count, turbulence, seed, offset, step, current } = settings;
  const noise = new ValueNoise(seed, 100, 1, 1000, 1000);

  if (!svg) {
    svg = document.createElement("svg");
  }

  svg.innerHTML = "";
  // resize canvas to max height of the clouds
  const svgHeight =
    offset * (count === 1 ? current - 1 : count - 1) + turbulence + step * 0.75;
  const svgWidth = settings.width;

  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", svgHeight);

  for (let i = 0; i < count; i++) {
    drawClouds({
      fill: `rgb(${Array(3).fill(
        count === 1
          ? 255
          : 255 - count * 10 + (count * 10 * i) / (count - 1 || 1)
      )})`, //`rgba(${hexToRgb('#e14').join(',')},${(i+1)/count})`,
      gradient: { from: "", to: "" },
      offset:
        ((offset * (1 + i / ((count === 1 ? current - 1 : count - 1) || 1))) /
          2) *
        i,
      turbulence,
      noise,
      stepSize: step * (1 + i / ((count === 1 ? current - 1 : count - 1) || 1))
    });
  }

  return { html: svg.innerHTML, height: svgHeight };
}
