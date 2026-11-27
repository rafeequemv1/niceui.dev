type Uniform = number | boolean | number[] | number[][];

// Minimal WebGL2 host for a Paper Shaders fragment shader: uniforms, textures,
// resizing and the animation clock. Returns a cleanup function.
function paperShader(
  el: HTMLElement,
  o: { vertex: string; fragment: string; uniforms: Record<string, Uniform>; images: Record<string, string>; mipmaps: string[]; speed: number; frame: number }
) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
  el.prepend(canvas);
  const gl = canvas.getContext('webgl2', { antialias: false, depth: false, stencil: false });
  if (!gl) return () => canvas.remove();
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, o.vertex));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, o.fragment));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const U = (name: string) => gl.getUniformLocation(prog, name);
  for (const [name, v] of Object.entries(o.uniforms)) {
    const loc = U(name);
    if (!loc) continue;
    if (typeof v === 'number') gl.uniform1f(loc, v);
    else if (typeof v === 'boolean') gl.uniform1i(loc, v ? 1 : 0);
    else {
      const nested = Array.isArray(v[0]);
      const flat = (nested ? (v as number[][]).flat() : v) as number[];
      const n = nested ? (v as number[][])[0].length : flat.length;
      if (n === 2) gl.uniform2fv(loc, flat);
      else if (n === 3) gl.uniform3fv(loc, flat);
      else if (n === 4) gl.uniform4fv(loc, flat);
      else if (n === 9) gl.uniformMatrix3fv(loc, false, flat);
      else if (n === 16) gl.uniformMatrix4fv(loc, false, flat);
    }
  }
  let unit = 0;
  const texture = (name: string, src: string) =>
    new Promise<void>((done) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const u = unit++;
        gl.activeTexture(gl.TEXTURE0 + u);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        if (o.mipmaps.includes(name)) {
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
        gl.uniform1i(U(name), u);
        gl.uniform1f(U(name + 'AspectRatio'), img.naturalWidth / img.naturalHeight);
        done();
      };
      img.onerror = () => done();
      img.src = src;
    });
  const rate = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : o.speed;
  let time = o.frame;
  let last = performance.now();
  let raf = 0;
  let alive = true;
  const draw = () => {
    const scale = Math.max(window.devicePixelRatio || 1, 2);
    let w = el.clientWidth * scale;
    let h = el.clientHeight * scale;
    const fit = Math.min(1, Math.sqrt((1920 * 1080 * 4) / Math.max(1, w * h)));
    w = Math.max(1, Math.round(w * fit));
    h = Math.max(1, Math.round(h * fit));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U('u_resolution'), w, h);
    gl.uniform1f(U('u_pixelRatio'), w / Math.max(1, el.clientWidth));
    gl.uniform1f(U('u_time'), time * 0.001);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
  const tick = (now: number) => {
    if (!alive) return;
    time += (now - last) * rate;
    last = now;
    draw();
    raf = requestAnimationFrame(tick);
  };
  Promise.all(Object.entries(o.images).map(([name, src]) => texture(name, src))).then(() => {
    if (!alive) return;
    last = performance.now();
    if (rate) raf = requestAnimationFrame(tick);
    else draw();
  });
  const ro = new ResizeObserver(() => {
    if (!rate) draw();
  });
  ro.observe(el);
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    canvas.remove();
  };
}
