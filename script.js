const passwordInput = document.getElementById('passwordInput');
const strengthMeter = document.getElementById('strengthMeter');
const strengthText = document.getElementById('strengthText');
const crackTimeDiv = document.getElementById('crackTime');
const crackTimeText = document.getElementById('crackTimeText');
const suggestionsDiv = document.getElementById('suggestions');
const suggestionsList = document.getElementById('suggestionsList');

passwordInput.addEventListener('input', checkPassword);

function togglePassword() {
  const input = passwordInput;
  const toggle = document.querySelector('.toggle-password');
  const eyeIcon = document.getElementById('eyeIcon');
  
  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    `;
  } else {
    input.type = 'password';
    eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
  }
}

function closeSuggestions() {
  suggestionsDiv.classList.remove('show');
}

function checkPassword() {
  const password = passwordInput.value;
  
  if (password.length === 0) {
    resetChecker();
    return;
  }

  // Check requirements
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  // Update requirement indicators
  updateRequirement('req-length', requirements.length);
  updateRequirement('req-uppercase', requirements.uppercase);
  updateRequirement('req-lowercase', requirements.lowercase);
  updateRequirement('req-number', requirements.number);
  updateRequirement('req-special', requirements.special);

  // Calculate strength
  const strength = calculateStrength(password, requirements);
  updateStrengthMeter(strength);

  // Calculate crack time
  const crackTime = estimateCrackTime(password, requirements);
  displayCrackTime(crackTime);

  // Suggestions
  generateSuggestions(requirements, password);
}

function updateRequirement(id, met) {
  const element = document.getElementById(id);
  if (met) {
    element.classList.add('met');
  } else {
    element.classList.remove('met');
  }
}

function calculateStrength(password, req) {
  let score = 0;
  
  if (req.length) score += 20;
  if (req.uppercase) score += 20;
  if (req.lowercase) score += 20;
  if (req.number) score += 20;
  if (req.special) score += 20;
  
  // Bonus for length
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Penalty for common patterns
  if (/^[a-zA-Z]+$/.test(password)) score -= 10;
  if (/^[0-9]+$/.test(password)) score -= 10;
  if (/(.)\1{2,}/.test(password)) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function updateStrengthMeter(score) {
  strengthMeter.style.width = score + '%';
  
  if (score < 40) {
    strengthMeter.className = 'strength-meter-fill weak';
    strengthText.textContent = 'Weak. Do better.';
    strengthText.style.color = '#d34a28';
  } else if (score < 60) {
    strengthMeter.className = 'strength-meter-fill medium';
    strengthText.textContent = 'Okay, Could be better';
    strengthText.style.color = '#e7a33e';
  } else if (score < 80) {
    strengthMeter.className = 'strength-meter-fill strong';
    strengthText.textContent = 'Good';
    strengthText.style.color = '#6ba368';
  } else {
    strengthMeter.className = 'strength-meter-fill very-strong';
    strengthText.textContent = 'Perfect!';
    strengthText.style.color = '#5b8a5b';
  }
}

function estimateCrackTime(password, req) {
  let charsetSize = 0;
  if (req.lowercase) charsetSize += 26;
  if (req.uppercase) charsetSize += 26;
  if (req.number) charsetSize += 10;
  if (req.special) charsetSize += 32;
  
  const combinations = Math.pow(charsetSize, password.length);
  const guessesPerSecond = 1000000000;
  const seconds = combinations / guessesPerSecond;
  
  return formatTime(seconds);
}

function formatTime(seconds) {
  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return seconds.toFixed(0) + ' seconds';
  if (seconds < 3600) return (seconds / 60).toFixed(0) + ' minutes';
  if (seconds < 86400) return (seconds / 3600).toFixed(0) + ' hours';
  if (seconds < 2592000) return (seconds / 86400).toFixed(0) + ' days';
  if (seconds < 31536000) return (seconds / 2592000).toFixed(0) + ' months';
  if (seconds < 3153600000) return (seconds / 31536000).toFixed(0) + ' years';
  return (seconds / 31536000).toFixed(0) + ' years (very secure!)';
}

function displayCrackTime(time) {
  crackTimeDiv.style.display = 'block';
  crackTimeText.textContent = `It would take approximately ${time} to crack this password using brute force.`;
}

function generateSuggestions(req, password) {
  const suggestions = [];
  
  if (!req.length) suggestions.push('Use at least 8 characters');
  if (!req.uppercase) suggestions.push('Add uppercase letters');
  if (!req.lowercase) suggestions.push('Add lowercase letters');
  if (!req.number) suggestions.push('Include numbers');
  if (!req.special) suggestions.push('Add special characters (!@#$%^&*)');
  if (password.length < 12) suggestions.push('Consider using 12+ characters for better security');
  if (/(.)\1{2,}/.test(password)) suggestions.push('Avoid repeating characters');
  if (/^[a-zA-Z]+$/.test(password)) suggestions.push('Mix letters with numbers and symbols');
  
  if (suggestions.length > 0) {
    suggestionsDiv.classList.add('show');
    suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
  } else {
    suggestionsDiv.classList.remove('show');
  }
}

function resetChecker() {
  strengthMeter.style.width = '0%';
  strengthText.textContent = '';
  crackTimeDiv.style.display = 'none';
  suggestionsDiv.classList.remove('show');
  
  ['req-length', 'req-uppercase', 'req-lowercase', 'req-number', 'req-special'].forEach(id => {
    document.getElementById(id).classList.remove('met');
  });
}