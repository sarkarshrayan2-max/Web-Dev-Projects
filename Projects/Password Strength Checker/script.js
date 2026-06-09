(function () {
  var pwInput = document.getElementById('pwInput');
  var toggleBtn = document.getElementById('toggleBtn');
  var eyeOpen = document.getElementById('eyeOpen');
  var eyeClosed = document.getElementById('eyeClosed');
  var copyBtn = document.getElementById('copyBtn');
  var barFill = document.getElementById('barFill');
  var strengthLabel = document.getElementById('strengthLabel');
  var scoreText = document.getElementById('scoreText');
  var checkItems = document.querySelectorAll('.check-item');
  var feedback = document.getElementById('feedback');

  var RULES = [
    { test: function (s) { return s.length >= 12; }, label: 'At least 12 characters' },
    { test: function (s) { return /[a-z]/.test(s); }, label: 'Contains lowercase (a-z)' },
    { test: function (s) { return /[A-Z]/.test(s); }, label: 'Contains uppercase (A-Z)' },
    { test: function (s) { return /[0-9]/.test(s); }, label: 'Contains number (0-9)' },
    { test: function (s) { return /[^A-Za-z0-9]/.test(s); }, label: 'Contains special character' },
  ];

  var RATINGS = [
    { min: 0, label: 'Weak', css: '#ef4444' },
    { min: 2, label: 'Medium', css: '#f59e0b' },
    { min: 4, label: 'Strong', css: '#10b981' },
    { min: 5, label: 'Bulletproof', css: '#06b6d4' },
  ];

  var FEEDBACK_MAP = [
    { missing: 0, msg: 'Use at least 12 characters for a stronger password.' },
    { missing: 1, msg: 'Add lowercase letters (a-z).' },
    { missing: 2, msg: 'Add uppercase letters (A-Z).' },
    { missing: 3, msg: 'Include at least one number (0-9).' },
    { missing: 4, msg: 'Include a special character (!@#$ etc.).' },
  ];

  function getRating(score) {
    var r = RATINGS[0];
    for (var i = 0; i < RATINGS.length; i++) {
      if (score >= RATINGS[i].min) r = RATINGS[i];
    }
    return r;
  }

  function evaluate() {
    var val = pwInput.value;
    var score = 0;
    var results = [];

    for (var i = 0; i < RULES.length; i++) {
      var passed = RULES[i].test(val);
      results.push(passed);
      if (passed) score++;
    }

    var rating = getRating(score);
    var pct = (score / RULES.length) * 100;

    barFill.style.width = pct + '%';
    barFill.style.background = val.length === 0 ? 'var(--text-muted)' : rating.css;
    strengthLabel.textContent = val.length === 0 ? '\u2014' : rating.label;
    strengthLabel.style.color = val.length === 0 ? '' : rating.css;
    scoreText.textContent = score + ' / 5';

    for (var j = 0; j < checkItems.length; j++) {
      var item = checkItems[j];
      if (results[j]) {
        item.classList.add('checked');
      } else {
        item.classList.remove('checked');
      }
    }

    if (val.length === 0) {
      feedback.textContent = '';
    } else if (score === 5) {
      feedback.textContent = '\u2705 Excellent \u2014 this password meets all security criteria.';
      feedback.style.color = '#06b6d4';
    } else {
      var missing = [];
      for (var k = 0; k < FEEDBACK_MAP.length; k++) {
        if (!results[FEEDBACK_MAP[k].missing]) missing.push(FEEDBACK_MAP[k].msg);
      }
      feedback.textContent = '\u2139\ufe0f ' + missing.join(' ');
      feedback.style.color = 'var(--text-muted)';
    }
  }

  pwInput.addEventListener('input', evaluate);

  toggleBtn.addEventListener('click', function () {
    if (pwInput.type === 'password') {
      pwInput.type = 'text';
      eyeOpen.classList.add('hidden');
      eyeClosed.classList.remove('hidden');
    } else {
      pwInput.type = 'password';
      eyeClosed.classList.add('hidden');
      eyeOpen.classList.remove('hidden');
    }
    pwInput.focus();
  });

  copyBtn.addEventListener('click', function () {
    var val = pwInput.value;
    if (!val) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val).then(function () {
        var orig = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(function () { copyBtn.innerHTML = orig; }, 1500);
      });
    }
  });
})();
