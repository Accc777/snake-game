/* =========================================
   index.js — 首页统计 + 提交成绩表单
   ========================================= */

const bestEl = document.getElementById('bestScore');
if (bestEl) {
  bestEl.textContent = getBestScore();
  document.getElementById('playCount').textContent = getPlayCount();
  document.getElementById('rankCount').textContent = getScores().length;

  // 读取上一局分数，自动填入只读输入框
  const last = localStorage.getItem('snake_last_score');
  const scoreInput = document.getElementById('score');
  if (last && Number(last) > 0) {
    scoreInput.value = last;
  } else {
    scoreInput.value = '';
    scoreInput.placeholder = '请先玩一局游戏再来提交';
  }
}

const form = document.getElementById('submitForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nickname = document.getElementById('nickname').value.trim();
    const email = document.getElementById('email').value.trim();
    const scoreInput = document.getElementById('score');
    const score = Number(scoreInput.value);
    const difficulty = document.getElementById('difficulty').value;
    const msg = document.getElementById('formMsg');

    // 1. 校验：是否玩过游戏
    if (!scoreInput.value || score <= 0) {
      msg.textContent = '请先去玩一局游戏，获得分数后再来提交！';
      msg.className = 'form-msg error';
      return;
    }

    // 2. 校验昵称
    if (nickname.length < 2 || nickname.length > 12) {
      msg.textContent = '昵称需 2-12 个字符';
      msg.className = 'form-msg error';
      return;
    }

    // 3. 校验邮箱
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = '邮箱格式不正确';
      msg.className = 'form-msg error';
      return;
    }

    // 4. 保存成绩
    addScore({
      id: Date.now() + Math.random(),
      nickname,
      email,
      score,
      difficulty,
      time: Date.now()
    });

    setBestScore(score);

    msg.textContent = '提交成功！去排行榜看看吧 🎉';
    msg.className = 'form-msg success';
    form.reset();

    // 5. 提交后清空上一局分数，防止重复提交
    localStorage.removeItem('snake_last_score');
    scoreInput.value = '';
    scoreInput.placeholder = '请先玩一局游戏再来提交';

    // 6. 刷新首页统计数字
    document.getElementById('rankCount').textContent = getScores().length;
    document.getElementById('bestScore').textContent = getBestScore();
  });
}