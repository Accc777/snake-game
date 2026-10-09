/* =========================================
   common.js — LocalStorage + 主题切换
   ========================================= */

const STORAGE_KEY = 'snake_scores';
const BEST_KEY = 'snake_best';
const COUNT_KEY = 'snake_play_count';

function getScores() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveScores(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function addScore(record) {
  const list = getScores();
  list.push(record);
  saveScores(list);
}
function getBestScore() {
  return Number(localStorage.getItem(BEST_KEY) || 0);
}
function setBestScore(n) {
  if (n > getBestScore()) localStorage.setItem(BEST_KEY, n);
}
function getPlayCount() {
  return Number(localStorage.getItem(COUNT_KEY) || 0);
}
function addPlayCount() {
  const n = getPlayCount() + 1;
  localStorage.setItem(COUNT_KEY, n);
  return n;
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------- 主题切换 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeBtn');
  const saved = localStorage.getItem('snake_theme');
  if (saved === 'light') document.body.classList.add('light');

  if (btn) {
    btn.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
    btn.addEventListener('click', () => {
      document.body.classList.toggle('light');
      const isLight = document.body.classList.contains('light');
      localStorage.setItem('snake_theme', isLight ? 'light' : 'dark');
      btn.textContent = isLight ? '☀️' : '🌙';

      // 通知游戏画布重新绘制
      document.dispatchEvent(new Event('themechange'));
    });
  }

  // 根据当前主题重绘
  document.dispatchEvent(new Event('themechange'));
});