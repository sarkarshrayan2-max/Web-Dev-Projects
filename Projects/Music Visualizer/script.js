(function () {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var audio = document.getElementById('audio');
  var fileInput = document.getElementById('fileInput');
  var playBtn = document.getElementById('playBtn');
  var themeBtn = document.getElementById('themeBtn');
  var sensitivity = document.getElementById('sensitivity');
  var trackName = document.getElementById('trackName');
  var statusBadge = document.getElementById('statusBadge');
  var onboard = document.getElementById('onboard');

  var audioCtx = null;
  var analyser = null;
  var source = null;
  var dataArray = null;
  var bufferLength = 0;
  var isPlaying = false;
  var visualMode = 'bars'; /* 'bars' or 'radial' */
  var rafId = null;
  var initialized = false;

  var FFT_SIZE = 256;
  var SMOOTHING = 0.8;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  /* ---- Audio Context init ---- */
  function initAudio() {
    if (initialized) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = SMOOTHING;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    initialized = true;
  }

  function connectSource() {
    if (!initialized) initAudio();
    if (source) {
      source.disconnect();
      analyser.disconnect();
    }
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  /* ---- Resume guard ---- */
  function ensureResume() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  /* ---- File load ---- */
  fileInput.addEventListener('change', function () {
    var file = fileInput.files[0];
    if (!file) return;
    onboard.classList.add('hidden');

    if (!initialized) initAudio();

    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      updatePlayBtn();
    }

    var url = URL.createObjectURL(file);
    audio.src = url;
    audio.load();

    trackName.textContent = file.name;
    statusBadge.textContent = '\u25CF loaded';
    playBtn.disabled = false;

    audio.addEventListener('canplaythrough', function onReady() {
      audio.removeEventListener('canplaythrough', onReady);
      connectSource();
    }, { once: true });
  });

  /* ---- Play / Pause ---- */
  function togglePlay() {
    if (!audio.src) return;
    ensureResume();

    if (isPlaying) {
      audio.pause();
    } else {
      var playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(function () {});
      }
    }
  }

  audio.addEventListener('play', function () {
    isPlaying = true;
    updatePlayBtn();
    statusBadge.textContent = '\u25CF playing';
    if (!rafId) loop();
  });

  audio.addEventListener('pause', function () {
    isPlaying = false;
    updatePlayBtn();
    statusBadge.textContent = '\u25CF paused';
  });

  audio.addEventListener('ended', function () {
    isPlaying = false;
    updatePlayBtn();
    statusBadge.textContent = '\u25CF ended';
  });

  function updatePlayBtn() {
    playBtn.innerHTML = isPlaying
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>';
  }

  playBtn.addEventListener('click', togglePlay);

  /* ---- Keyboard ---- */
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
  });

  /* ---- Click to init + resume ---- */
  function onFirstClick() {
    if (!initialized) initAudio();
    ensureResume();
    document.removeEventListener('click', onFirstClick);
    document.removeEventListener('keydown', onFirstKey);
  }

  function onFirstKey(e) {
    if (e.code === 'Space' || e.code === 'Enter') {
      if (!initialized) initAudio();
      ensureResume();
    }
  }

  document.addEventListener('click', onFirstClick);
  document.addEventListener('keydown', onFirstKey);

  /* ---- Theme toggle ---- */
  themeBtn.addEventListener('click', function () {
    visualMode = (visualMode === 'bars') ? 'radial' : 'bars';
    themeBtn.textContent = visualMode === 'bars' ? 'Wave' : 'Bars';
  });

  /* ---- Render loop ---- */
  function drawBars(w, h, sens) {
    analyser.getByteFrequencyData(dataArray);

    var barW = w / bufferLength * 2.4;
    var gap = 1;
    var halfH = h;

    for (var i = 0; i < bufferLength; i++) {
      var val = dataArray[i] / 255;
      var barH = val * halfH * sens;
      var x = i * (barW + gap);
      var y = h - barH;

      var t = i / bufferLength;
      var r = Math.round(0 + t * 255);
      var g = Math.round(240 * (1 - t));
      var b = Math.round(255 * (1 - t * 0.7));
      var alpha = 0.6 + val * 0.4;

      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
      ctx.fillRect(x, y, barW, barH);

      /* glow top */
      ctx.shadowColor = 'rgba(' + r + ',' + g + ',' + b + ',0.3)';
      ctx.shadowBlur = 12;
      ctx.fillRect(x, y, barW, 3);
      ctx.shadowBlur = 0;
    }
  }

  function drawRadial(w, h, sens) {
    analyser.getByteFrequencyData(dataArray);

    var cx = w / 2;
    var cy = h / 2;
    var baseR = Math.min(w, h) * 0.15;
    var maxR = Math.min(w, h) * 0.4;

    /* bass energy */
    var bassSum = 0;
    var bassCount = Math.min(6, bufferLength);
    for (var k = 0; k < bassCount; k++) {
      bassSum += dataArray[k];
    }
    var bassAvg = bassSum / (bassCount * 255);

    var ringR = baseR + bassAvg * maxR * sens;
    var thickness = 4 + bassAvg * 40 * sens;
    var bloom = 10 + bassAvg * 60;

    /* outer glow ring */
    ctx.shadowColor = 'rgba(0, 240, 255, 0.25)';
    ctx.shadowBlur = bloom;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = thickness + 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* main ring */
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    var hue = 180 + bassAvg * 120;
    ctx.strokeStyle = 'hsla(' + hue + ', 100%, 60%, 0.85)';
    ctx.lineWidth = thickness;
    ctx.stroke();

    /* inner pulsing circle */
    var innerR = Math.max(4, ringR * 0.3 - bassAvg * 20);
    var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR + 20);
    gradient.addColorStop(0, 'rgba(255, 42, 95, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 42, 95, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR + 20, 0, Math.PI * 2);
    ctx.fill();

    /* spectrum ring bars */
    var barCount = Math.min(64, bufferLength);
    var angleStep = (Math.PI * 2) / barCount;
    for (var j = 0; j < barCount; j++) {
      var idx = Math.floor((j / barCount) * bufferLength);
      var v = dataArray[idx] / 255;
      var barLen = 4 + v * maxR * 0.6 * sens;
      var angle = angleStep * j - Math.PI / 2;
      var inner = ringR - 2;
      var x1 = cx + Math.cos(angle) * inner;
      var y1 = cy + Math.sin(angle) * inner;
      var x2 = cx + Math.cos(angle) * (inner + barLen);
      var y2 = cy + Math.sin(angle) * (inner + barLen);

      var t2 = v;
      var r2 = Math.round(0 + t2 * 255);
      var g2 = Math.round(100 * (1 - t2));
      var b2 = Math.round(255);
      ctx.strokeStyle = 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  function loop() {
    rafId = requestAnimationFrame(loop);

    var w = canvas.width;
    var h = canvas.height;
    var sens = parseFloat(sensitivity.value);

    ctx.clearRect(0, 0, w, h);

    if (!initialized || !analyser || !isPlaying) {
      /* subtle idle animation */
      var idleGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
      idleGrad.addColorStop(0, 'rgba(0, 240, 255, 0.01)');
      idleGrad.addColorStop(1, 'rgba(3, 5, 10, 0)');
      ctx.fillStyle = idleGrad;
      ctx.fillRect(0, 0, w, h);
      return;
    }

    if (visualMode === 'bars') {
      drawBars(w, h, sens);
    } else {
      drawRadial(w, h, sens);
    }
  }

  loop();
})();
