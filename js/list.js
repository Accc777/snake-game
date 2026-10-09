/* =========================================
   list.js — 排行榜
   ========================================= */

const listEl = document.getElementById('scoreList');

if (listEl) {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const sortSelect = document.getElementById('sortSelect');
  const clearBtn = document.getElementById('clearBtn');
  const emptyMsg = document.getElementById('emptyMsg');

  function render() {
    let list = getScores();

    // 1. 搜索
    const kw = searchInput.value.trim().toLowerCase();
    if (kw) list = list.filter(r => r.nickname.toLowerCase().includes(kw));

    // 2. 排序
    const sortValue = sortSelect.value;
    if (sortValue === 'score') {
      list.sort((a, b) => b.score - a.score);        // 分数从高到低
    } else if (sortValue === 'time_desc') {
      list.sort((a, b) => b.time - a.time);          // 最新在前
    } else if (sortValue === 'time_asc') {
      list.sort((a, b) => a.time - b.time);          // 最老在前（从早到晚）
    }

    // 3. 渲染列表
    listEl.innerHTML = '';
    if (!list.length) {
      emptyMsg.hidden = false;
      return;
    }
    emptyMsg.hidden = true;

    list.forEach((r, i) => {
      const li = document.createElement('li');
      li.className = 'score-item';
      const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
      const timeStr = new Date(r.time).toLocaleString('zh-CN');

      li.innerHTML = `
        <span class="score-rank ${rankClass}">${i + 1}</span>
        <div class="score-info">
          <strong>${escapeHtml(r.nickname)}</strong>
          <small>${escapeHtml(r.difficulty)} · ${timeStr}</small>
        </div>
        <span class="score-value">${r.score}</span>
        <button class="score-del" data-id="${r.id}">删除</button>
      `;
      listEl.appendChild(li);
    });
  }

  /* ---------- 删除（事件委托） ---------- */
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.score-del');
    if (!btn) return;
    const id = btn.dataset.id;
    saveScores(getScores().filter(r => String(r.id) !== String(id)));
    render();
  });

  /* ---------- 点击“搜索”按钮才筛选 ---------- */
  searchBtn.addEventListener('click', render);

  /* ---------- 搜索框按回车也触发搜索 ---------- */
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      render();
    }
  });

  /* ---------- 排序切换立即生效 ---------- */
  sortSelect.addEventListener('change', render);

  /* ---------- 清空全部 ---------- */
  clearBtn.addEventListener('click', () => {
    if (confirm('确定清空全部记录吗？')) {
      saveScores([]);
      render();
    }
  });

  /* ---------- 初始化 ---------- */
  render();
}