import { ADDR, DOM } from './config.js';

// IO Video Mapper ------------------------------------------------------------

const CONST = {
  SCREEN_WIDTH: 160,
  SCREEN_HEIGHT: 144,
  VIDEO_SIZE: (160 * 144) / 4,

  VERTEX_SHADER_SOURCE: `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `,

  FRAGMENT_SHADER_SOURCE: `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texCoord;
    void main() {
      gl_FragColor = texture2D(u_texture, v_texCoord);
    }
  `
};

export const VideoMapper = {
  memory: null,
  gl: null,
  videoBuffer: null,
  vertexBuffer: null,
  attributes: {},
  uniforms: {},
  resizeHandler: null,

  init(memory) {
    this.memory = memory;

    this.gl = DOM.ScreenCanvas.getContext('webgl');
    this.videoBuffer = new Uint8Array(CONST.SCREEN_WIDTH * CONST.SCREEN_HEIGHT * 4); // 23040 pixels * 4 bytes per pixel (RGBA)
    this.vertexBuffer = null;
    this.attributes = {
      position: null,
      texCoord: null
    };
    this.uniforms = {
      texture: null
    };

    this.setupVideo();
    this.setupColors();
    this.setupResize();
    this.resize();
  },

  setupVideo() {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, this.compileShader(CONST.VERTEX_SHADER_SOURCE, this.gl.VERTEX_SHADER));
    this.gl.attachShader(program, this.compileShader(CONST.FRAGMENT_SHADER_SOURCE, this.gl.FRAGMENT_SHADER));
    this.gl.linkProgram(program);
    this.gl.useProgram(program);

    this.attributes.position = this.gl.getAttribLocation(program, 'a_position');
    this.attributes.texCoord = this.gl.getAttribLocation(program, 'a_texCoord');
    this.uniforms.texture = this.gl.getUniformLocation(program, 'u_texture');

    const vertices = new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0]);
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    const FSIZE = vertices.BYTES_PER_ELEMENT;
    this.gl.vertexAttribPointer(this.attributes.position, 2, this.gl.FLOAT, false, FSIZE * 4, 0);
    this.gl.enableVertexAttribArray(this.attributes.position);
    this.gl.vertexAttribPointer(this.attributes.texCoord, 2, this.gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    this.gl.enableVertexAttribArray(this.attributes.texCoord);

    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0,
      this.gl.RGBA,
      CONST.SCREEN_WIDTH,
      CONST.SCREEN_HEIGHT,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      null
    );
  },

  setupColors() {
    const colors = [
      [15, 15, 27],     // #0F0F1B chinese black
      [86, 90, 117],    // #565A75 black coral
      [198, 183, 190],  // #C6B7BE pale silver
      [250, 251, 246]   // #FAFBF6 milk
    ];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        this.memory[ADDR.PALETTE + (i * 3 + j)] = colors[i][j];
      }
    }
  },

  setupResize() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }

    this.resizeHandler = () => {
      this.resize();
    };

    window.addEventListener('resize', this.resizeHandler);
  },

  resize() {
    const maxWidth = Math.min(window.innerWidth * 0.8, 600);
    const scale = Math.min(maxWidth / CONST.SCREEN_WIDTH, 2.2);

    DOM.ScreenCanvas.style.width = (CONST.SCREEN_WIDTH * scale) + 'px';
    DOM.ScreenCanvas.style.height = (CONST.SCREEN_HEIGHT * scale) + 'px';
    DOM.Console.style.visibility = "inherit";
  },

  compileShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      console.log('❌ shader compilation failed', error);
      
      this.gl.deleteShader(shader);

      return null;
    }

    return shader;
  },

  updateVideoBuffer() {
    let idx = 0;
    
    for (let byteIdx = 0; byteIdx < CONST.VIDEO_SIZE; byteIdx++) {
      // process four pixel with byte

      const byteColors = this.memory[ADDR.VIDEO + byteIdx];
      const colors = [
        (byteColors >> 6) & 0x03,
        (byteColors >> 4) & 0x03,
        (byteColors >> 2) & 0x03,
        (byteColors >> 0) & 0x03
      ];
      
      for (let i = 0; i < 4; i++) {
        const colorAddr = ADDR.PALETTE + (colors[i] * 3);

        this.videoBuffer[idx] = this.memory[colorAddr];         // red
        this.videoBuffer[idx + 1] = this.memory[colorAddr + 1]; // green
        this.videoBuffer[idx + 2] = this.memory[colorAddr + 2]; // blue
        this.videoBuffer[idx + 3] = 255;                        // alpha

        idx += 4;
      }
    }
  },

  render() {
    this.updateVideoBuffer();

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.uniform1i(this.uniforms.texture, 0);
    this.gl.texSubImage2D(
      this.gl.TEXTURE_2D,
      0, 0, 0,
      CONST.SCREEN_WIDTH,
      CONST.SCREEN_HEIGHT,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.videoBuffer
    );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
};
