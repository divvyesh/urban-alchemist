/* ============================================================
   Urban Alchemist — hero WebGL
   A drifting spore field and a slowly turning brass armillary.
   Hand-rolled: no dependencies, ~6KB, one draw pass per program.
   ============================================================ */
(function () {
  'use strict';
  var cvs = document.getElementById('gl');
  if (!cvs) return;
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var gl = cvs.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power' })
        || cvs.getContext('experimental-webgl', { alpha: true, antialias: true });
  if (!gl) return;

  /* ---------- tiny mat4 ---------- */
  function persp(fovy, a, n, f) {
    var t = 1 / Math.tan(fovy / 2);
    return [t / a,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0];
  }
  function ident(){ return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }
  function mul(a,b){
    var o = new Array(16);
    for (var i=0;i<4;i++) for (var j=0;j<4;j++){
      var s=0; for (var k=0;k<4;k++) s += a[k*4+j]*b[i*4+k];
      o[i*4+j]=s;
    }
    return o;
  }
  function translate(x,y,z){ var m=ident(); m[12]=x;m[13]=y;m[14]=z; return m; }
  function rotY(r){ var c=Math.cos(r),s=Math.sin(r),m=ident(); m[0]=c;m[2]=-s;m[8]=s;m[10]=c; return m; }
  function rotX(r){ var c=Math.cos(r),s=Math.sin(r),m=ident(); m[5]=c;m[6]=s;m[9]=-s;m[10]=c; return m; }
  function rotZ(r){ var c=Math.cos(r),s=Math.sin(r),m=ident(); m[0]=c;m[1]=s;m[4]=-s;m[5]=c; return m; }

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  function program(vs, fs) {
    var p = gl.createProgram(), a = compile(gl.VERTEX_SHADER, vs), b = compile(gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return null;
    gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); return null; }
    return p;
  }

  /* ---------- spores ---------- */
  var SPORE_VS = [
    'attribute vec3 a_pos; attribute vec2 a_seed;',
    'uniform mat4 u_proj, u_view; uniform float u_time, u_dpr, u_h;',
    'varying float v_a; varying float v_t;',
    'void main(){',
    '  float sp = 0.06 + a_seed.x * 0.16;',
    '  float y = mod(a_pos.y + u_time * sp + a_seed.y * 10.0, u_h) - u_h * 0.5;',
    '  float sway = sin(u_time * (0.22 + a_seed.x * 0.4) + a_seed.y * 6.283) * (0.22 + a_seed.x * 0.4);',
    '  vec3 p = vec3(a_pos.x + sway, y, a_pos.z + sway * 0.5);',
    '  vec4 mv = u_view * vec4(p, 1.0);',
    '  gl_Position = u_proj * mv;',
    '  float d = max(0.35, -mv.z);',
    '  gl_PointSize = (5.0 + a_seed.x * 20.0) * u_dpr * (5.0 / d);',
    '  v_a = smoothstep(26.0, 3.0, d) * (0.52 + a_seed.y * 0.72);',
    '  v_t = a_seed.y;',
    '}'
  ].join('\n');

  var SPORE_FS = [
    'precision mediump float; varying float v_a; varying float v_t;',
    'void main(){',
    '  float d = length(gl_PointCoord - 0.5);',
    '  if (d > 0.5) discard;',
    '  float a = pow(smoothstep(0.5, 0.0, d), 1.9) * v_a;',
    '  vec3 warm = mix(vec3(0.85,0.58,0.20), vec3(1.0,0.86,0.56), v_t);',
    '  gl_FragColor = vec4(warm, a);',
    '}'
  ].join('\n');

  /* ---------- brass armillary ---------- */
  var LINE_VS = [
    'attribute vec3 a_pos; attribute float a_fade;',
    'uniform mat4 u_proj, u_view, u_model; varying float v_f; varying float v_z;',
    'void main(){',
    '  vec4 mv = u_view * u_model * vec4(a_pos, 1.0);',
    '  gl_Position = u_proj * mv;',
    '  v_f = a_fade; v_z = mv.z;',
    '}'
  ].join('\n');

  var LINE_FS = [
    'precision mediump float; varying float v_f; varying float v_z;',
    'uniform float u_alpha;',
    'void main(){',
    '  float depth = smoothstep(-16.0, -4.0, v_z);',
    '  vec3 brass = mix(vec3(0.55,0.38,0.14), vec3(0.87,0.68,0.36), depth);',
    '  gl_FragColor = vec4(brass, v_f * u_alpha * (0.34 + depth * 0.78));',
    '}'
  ].join('\n');

  var pSpore = program(SPORE_VS, SPORE_FS);
  var pLine  = program(LINE_VS, LINE_FS);
  if (!pSpore || !pLine) return;

  /* ---------- geometry ---------- */
  var HEIGHT = 22.0;
  var N = Math.min(1500, Math.max(420, Math.round(window.innerWidth * 0.9)));
  var pos = new Float32Array(N * 3), seed = new Float32Array(N * 2);
  for (var i = 0; i < N; i++) {
    pos[i*3]     = (Math.random() - 0.5) * 30;
    pos[i*3 + 1] = Math.random() * HEIGHT;
    pos[i*3 + 2] = (Math.random() - 0.5) * 22 - 3;
    seed[i*2]     = Math.random();
    seed[i*2 + 1] = Math.random();
  }
  function buf(data) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; }
  var bPos = buf(pos), bSeed = buf(seed);

  /* rings + triangle — the alchemical mark, in three dimensions */
  var lineVerts = [], lineFades = [], groups = [];
  function ring(radius, segs, fade) {
    var start = lineVerts.length / 3;
    for (var k = 0; k <= segs; k++) {
      var t = k / segs * Math.PI * 2;
      lineVerts.push(Math.cos(t) * radius, Math.sin(t) * radius, 0);
      lineFades.push(fade);
    }
    groups.push({ first: start, count: segs + 1, mode: 'strip' });
  }
  function triangle(radius, fade) {
    var start = lineVerts.length / 3;
    for (var k = 0; k <= 3; k++) {
      var t = -Math.PI / 2 + k / 3 * Math.PI * 2;
      lineVerts.push(Math.cos(t) * radius, Math.sin(t) * radius, 0);
      lineFades.push(fade);
    }
    groups.push({ first: start, count: 4, mode: 'strip' });
  }
  ring(4.10, 128, 0.80);
  ring(4.85, 128, 0.26);
  ring(3.05, 96, 0.18);
  triangle(4.10, 0.70);
  var bLV = buf(new Float32Array(lineVerts)), bLF = buf(new Float32Array(lineFades));

  /* ---------- attribute/uniform locations ---------- */
  var L = {
    sPos: gl.getAttribLocation(pSpore, 'a_pos'),
    sSeed: gl.getAttribLocation(pSpore, 'a_seed'),
    sProj: gl.getUniformLocation(pSpore, 'u_proj'),
    sView: gl.getUniformLocation(pSpore, 'u_view'),
    sTime: gl.getUniformLocation(pSpore, 'u_time'),
    sDpr: gl.getUniformLocation(pSpore, 'u_dpr'),
    sH: gl.getUniformLocation(pSpore, 'u_h'),
    lPos: gl.getAttribLocation(pLine, 'a_pos'),
    lFade: gl.getAttribLocation(pLine, 'a_fade'),
    lProj: gl.getUniformLocation(pLine, 'u_proj'),
    lView: gl.getUniformLocation(pLine, 'u_view'),
    lModel: gl.getUniformLocation(pLine, 'u_model'),
    lAlpha: gl.getUniformLocation(pLine, 'u_alpha')
  };

  /* ---------- state ---------- */
  var dpr = 1, W = 0, H = 0, proj = null;
  var mx = 0, my = 0, tx = 0, ty = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = cvs.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    cvs.width = W; cvs.height = H;
    gl.viewport(0, 0, W, H);
    proj = persp(52 * Math.PI / 180, r.width / Math.max(1, r.height), 0.1, 100);
  }
  resize();
  var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(cvs); else window.addEventListener('resize', resize);

  window.addEventListener('pointermove', function (e) {
    tx = (e.clientX / window.innerWidth - 0.5);
    ty = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var running = true, scheduled = false, t0 = performance.now();
  function start() { if (!scheduled && running) { scheduled = true; requestAnimationFrame(frame); } }
  var io = new IntersectionObserver(function (es) { running = es[0].isIntersecting; start(); }, { threshold: 0 });
  io.observe(cvs);
  document.addEventListener('visibilitychange', function () { running = !document.hidden; start(); });

  function frame(now) {
    scheduled = false;
    if (!running) return;
    var t = (now - t0) / 1000;
    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var view = mul(mul(translate(0, 0, -13), rotX(my * 0.18)), rotY(-mx * 0.30));

    /* spores */
    gl.useProgram(pSpore);
    gl.uniformMatrix4fv(L.sProj, false, new Float32Array(proj));
    gl.uniformMatrix4fv(L.sView, false, new Float32Array(view));
    gl.uniform1f(L.sTime, t);
    gl.uniform1f(L.sDpr, dpr);
    gl.uniform1f(L.sH, HEIGHT);
    gl.bindBuffer(gl.ARRAY_BUFFER, bPos);
    gl.enableVertexAttribArray(L.sPos); gl.vertexAttribPointer(L.sPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bSeed);
    gl.enableVertexAttribArray(L.sSeed); gl.vertexAttribPointer(L.sSeed, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, N);

    /* the mark */
    gl.useProgram(pLine);
    gl.uniformMatrix4fv(L.lProj, false, new Float32Array(proj));
    gl.uniformMatrix4fv(L.lView, false, new Float32Array(view));
    gl.uniform1f(L.lAlpha, 0.85);
    gl.bindBuffer(gl.ARRAY_BUFFER, bLV);
    gl.enableVertexAttribArray(L.lPos); gl.vertexAttribPointer(L.lPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bLF);
    gl.enableVertexAttribArray(L.lFade); gl.vertexAttribPointer(L.lFade, 1, gl.FLOAT, false, 0, 0);

    var ox = (W / Math.max(1, H) > 1.15) ? -2.6 : 0.0;
    var base = mul(translate(ox, 0.35, -2.2), rotX(-0.28 + my * 0.22));
    for (var g = 0; g < groups.length; g++) {
      var spin = t * (0.11 + g * 0.045) + g * 0.6;
      var tilt = g === 3 ? rotZ(t * 0.05) : rotZ(g * 0.5);
      var model = mul(mul(base, rotY(spin)), tilt);
      gl.uniformMatrix4fv(L.lModel, false, new Float32Array(model));
      gl.drawArrays(gl.LINE_STRIP, groups[g].first, groups[g].count);
    }

    scheduled = true;
    requestAnimationFrame(frame);
  }
  start();
})();
