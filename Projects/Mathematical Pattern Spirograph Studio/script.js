// Gather structural workspace target identifiers
const canvas = document.getElementById('spiroCanvas');
const ctx = canvas.getContext('2d');

const radiusOuterInput = document.getElementById('radiusOuter');
const radiusInnerInput = document.getElementById('radiusInner');
const penOffsetInput = document.getElementById('penOffset');
const traceSpeedInput = document.getElementById('traceSpeed');
const gradientPresetSelect = document.getElementById('gradientPreset');

const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Iterative Operational Variables
let t = 0; // Theta parameter step variable configuration
let animationFrameId = null;
let pointsCache = [];

// Base coordinate centering settings
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Aesthetic color map preset schemes
const GRADIENTS = {
  cyber: ['#ec4899', '#a855f7', '#6366f1'],
  aurora: ['#10b981', '#06b6d4', '#3b82f6'],
  solar: ['#f97316', '#eab308', '#ef4444'],
  monochrome: ['#f1f5f9', '#94a3b8', '#334155']
};

/**
 * Updates UI numeric tracking fields immediately
 */
function updateLabel(id, val) {
  document.getElementById(`val${id}`).textContent = val;
}

/**
 * Computes parametric coordinates utilizing hypotrochoid mathematical equations
 */
function calculateSpirographPoint(theta, R, r, p) {
  // Classic Hypotrochoid parametric equations model
  const x = (R - r) * Math.cos(theta) + p * Math.cos(((R - r) * theta) / r);
  const y = (R - r) * Math.sin(theta) - p * Math.sin(((R - r) * theta) / r);
  return { x: centerX + x, y: centerY + y };
}

/**
 * Sweeps coordinates cache stack to render multi-stop linear gradients lines
 */
function drawSpirograph() {
  if (pointsCache.length < 2) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Instantiates structural custom colored canvas linear stroke grids
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  const colors = GRADIENTS[gradientPresetSelect.value] || GRADIENTS.cyber;
  
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.5, colors[1]);
  gradient.addColorStop(1, colors[2]);

  ctx.beginPath();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 4;
  ctx.shadowColor = colors[1];

  ctx.moveTo(pointsCache[0].x, pointsCache[0].y);
  for (let i = 1; i < pointsCache.length; i++) {
    ctx.lineTo(pointsCache[i].x, pointsCache[i].y);
  }
  ctx.stroke();
  
  // Clean down global canvas trace layers shadow offsets configurations leaks
  ctx.shadowBlur = 0;
}

/**
 * Handles fast execution calculations inside the animation sequence cycle loop
 */
function loopTraceAnimation() {
  const R = parseInt(radiusOuterInput.value, 10);
  const r = parseInt(radiusInnerInput.value, 10);
  const p = parseInt(penOffsetInput.value, 10);
  const stepsPerFrame = parseInt(traceSpeedInput.value, 10);

  updateLabel('R', R);
  updateLabel('r', r);
  updateLabel('P', p);

  // Multi-step calculations per single repaint lifecycle step for speed enhancement
  for (let i = 0; i < stepsPerFrame; i++) {
    t += 0.04;
    const pt = calculateSpirographPoint(t, R, r, p);
    pointsCache.push(pt);

    // Caps bounds limits to clear memory heaps arrays allocations overflow leaks
    if (pointsCache.length > 25000) {
      pointsCache.shift();
    }
  }

  drawSpirograph();
  animationFrameId = requestAnimationFrame(loopTraceAnimation);
}

/**
 * Hard reset workspace buffers to calculate brand new geometric maps from index zero
 */
function clearAndReinitialize() {
  cancelAnimationFrame(animationFrameId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pointsCache = [];
  t = 0;
  animationFrameId = requestAnimationFrame(loopTraceAnimation);
}

// --- Dynamic Event Controls Hookups ---
const triggersList = [radiusOuterInput, radiusInnerInput, penOffsetInput, gradientPresetSelect];
triggersList.forEach(input => input.addEventListener('input', clearAndReinitialize));

resetBtn.addEventListener('click', clearAndReinitialize);

// --- Local PNG Snapshot File Export Feature ---
downloadBtn.addEventListener('click', () => {
  const targetUrl = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.href = targetUrl;
  anchor.download = `spirograph-${radiusOuterInput.value}-${radiusInnerInput.value}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
});

// Boot kickstart runtime initialization
animationFrameId = requestAnimationFrame(loopTraceAnimation);