/**
 * main.js - 老张工艺助手展示网站主脚本
 * 包含粒子系统、导航、主题管理等通用功能
 */

// ==================== 主题管理 ====================

const ThemeManager = {
  // 默认主题
  defaultTheme: {
    primary: '#ff6b35',
    primaryLight: '#ff8555'
  },
  
  // 可选主题
  themes: {
    orange: {
      primary: '#ff6b35',
      primaryLight: '#ff8555'
    },
    blue: {
      primary: '#4a90d9',
      primaryLight: '#6aa8e8'
    },
    red: {
      primary: '#e74c3c',
      primaryLight: '#ec7063'
    }
  },
  
  // 初始化主题
  init() {
    const savedTheme = StorageManager.getTheme();
    this.applyTheme(savedTheme || 'orange');
  },
  
  // 应用主题
  applyTheme(themeName) {
    const theme = this.themes[themeName] || this.themes.orange;
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-light', theme.primaryLight);
    
    // 更新主题样式标签
    const styleTag = document.getElementById('theme-style');
    if (styleTag) {
      styleTag.textContent = `
        .text-accent { color: ${theme.primary} !important; }
        .btn-primary { background: ${theme.primary} !important; }
        .btn-primary:hover { background: ${theme.primaryLight} !important; }
        .chat-send-btn { background: ${theme.primary} !important; }
        .status-dot:not(.online):not(.offline) { 
          background: ${theme.primary} !important; 
          box-shadow: 0 0 8px ${theme.primary} !important;
        }
        .card-icon { color: ${theme.primary} !important; }
        .feature-number { color: ${theme.primary} !important; }
        .gear-decoration svg { stroke: ${theme.primary} !important; }
        .chat-input:focus { 
          border-color: ${theme.primary} !important; 
          box-shadow: 0 0 0 3px ${theme.primary}33 !important;
        }
        .glass-input:focus {
          border-color: ${theme.primary} !important;
          box-shadow: 0 0 0 3px ${theme.primary}33 !important;
        }
      `;
    }
    
    StorageManager.setTheme(themeName);
  }
};

// ==================== 粒子系统 ====================

const ParticleSystem = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,
  isActive: false,
  
  // 配置
  config: {
    particleCount: 200,
    connectionDistance: 100,
    maxConnections: 3,
    particleColor: 'rgba(255, 107, 53, 0.15)',
    lineColor: 'rgba(255, 107, 53, 0.1)'
  },
  
  // 初始化
  init() {
    this.canvas = document.getElementById('particlesCanvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.createParticles();
    this.start();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.resize();
    });
    
    // 监听页面可见性
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  },
  
  // 调整画布大小
  resize() {
    const hero = document.getElementById('hero');
    if (hero) {
      this.canvas.width = hero.offsetWidth;
      this.canvas.height = hero.offsetHeight;
    }
  },
  
  // 创建粒子
  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }
  },
  
  // 更新粒子
  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      // 边界处理
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
    });
  },
  
  // 绘制粒子
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制连线
    this.ctx.strokeStyle = this.config.lineColor;
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < this.particles.length; i++) {
      let connections = 0;
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.connectionDistance && connections < this.config.maxConnections) {
          const opacity = 1 - (distance / this.config.connectionDistance);
          this.ctx.strokeStyle = `rgba(255, 107, 53, ${opacity * 0.15})`;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
          connections++;
        }
      }
    }
    
    // 绘制粒子点
    this.particles.forEach(p => {
      this.ctx.fillStyle = this.config.particleColor;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  },
  
  // 动画循环
  animate() {
    if (!this.isActive) return;
    
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  },
  
  // 开始动画
  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.animate();
  },
  
  // 停止动画
  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
};

// ==================== 导航栏 ====================

const Navbar = {
  init() {
    const toggle = document.getElementById('navbarToggle');
    const nav = document.getElementById('navbarNav');
    
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
      });
      
      // 点击导航链接后关闭菜单
      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('open');
        });
      });
    }
    
    // 导航栏滚动效果
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
      } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
      }
      
      lastScroll = currentScroll;
    });
  }
};

// ==================== 平滑滚动 ====================

const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
};

// ==================== 背景管理 ====================

const BackgroundManager = {
  // 从服务器加载并应用背景
  async initFromServer() {
    try {
      const response = await fetch('./api/config.json?t=' + Date.now());
      if (response.ok) {
        const config = await response.json();
        
        // 应用背景图片
        if (config.backgroundImage) {
          this.applyBackground(config.backgroundImage);
        }
        
        // 应用主题
        if (config.theme) {
          this.applyTheme(config.theme);
        }
        
        console.log('已从服务器加载配置');
      }
    } catch (error) {
      console.log('从服务器加载配置失败，使用默认设置');
    }
  },
  
  // 应用主题
  applyTheme(theme) {
    const themeColors = {
      orange: { primary: '#ff6b35', primaryLight: '#ff8555' },
      blue: { primary: '#4a90d9', primaryLight: '#6aa8e8' },
      red: { primary: '#e74c3c', primaryLight: '#ec7063' }
    };
    
    const colors = themeColors[theme] || themeColors.orange;
    const styleTag = document.getElementById('theme-style');
    if (styleTag) {
      styleTag.textContent = `
        :root {
          --theme-primary: ${colors.primary};
          --theme-primary-light: ${colors.primaryLight};
        }
      `;
    }
  },
  
  // 应用背景图片
  applyBackground(imageData) {
    if (!imageData) return;
    
    // 首页应用到hero区域
    const hero = document.getElementById('hero');
    if (hero) {
      hero.style.backgroundImage = `url(${imageData})`;
      hero.style.backgroundSize = 'cover';
      hero.style.backgroundPosition = 'center';
      hero.style.backgroundRepeat = 'no-repeat';
    }
    
    // 其他页面应用到body背景
    const body = document.body;
    body.style.backgroundImage = `url(${imageData})`;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
    body.style.backgroundAttachment = 'fixed';
    
    // 添加半透明遮罩保证文字可读
    let overlay = document.getElementById('bg-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'bg-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 15, 0.85);
        z-index: -1;
      `;
      document.body.insertBefore(overlay, document.body.firstChild);
    }
  },
  
  // 应用背景音乐
  applyBackgroundAudio(audioInfo) {
    if (!audioInfo) return;
    
    // 注意：由于localStorage限制，只存储了音频信息，无法持久化音频文件
    // 如需背景音乐功能，建议使用外部音频链接或重新上传
    console.log('背景音乐文件信息:', audioInfo);
    
    // 如果有有效的URL（临时URL只在当前会话有效）
    if (audioInfo.url) {
      // 移除旧的音乐播放器
      const oldAudio = document.getElementById('bgAudio');
      if (oldAudio) {
        oldAudio.remove();
      }
      
      // 创建新的音乐播放器（默认静音）
      const audio = document.createElement('audio');
      audio.id = 'bgAudio';
      audio.loop = true;
      audio.volume = 0.3;
      
      const source = document.createElement('source');
      source.src = audioInfo.url;
      audio.appendChild(source);
      
      document.body.appendChild(audio);
      
      // 添加音乐控制按钮
      this.addAudioControl(audio);
    }
  },
  
  // 添加音乐控制按钮
  addAudioControl(audio) {
    // 移除旧按钮
    const oldBtn = document.getElementById('audioControlBtn');
    if (oldBtn) {
      oldBtn.remove();
    }
    
    const btn = document.createElement('button');
    btn.id = 'audioControlBtn';
    btn.className = 'btn-icon';
    btn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; background: rgba(20,20,30,0.8); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; width: 48px; height: 48px;';
    btn.innerHTML = `
      <svg id="audioIconOff" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      </svg>
      <svg id="audioIconOn" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    `;
    
    btn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(e => console.log('音频播放失败:', e));
        btn.querySelector('#audioIconOff').style.display = 'none';
        btn.querySelector('#audioIconOn').style.display = 'block';
      } else {
        audio.pause();
        btn.querySelector('#audioIconOff').style.display = 'block';
        btn.querySelector('#audioIconOn').style.display = 'none';
      }
    });
    
    document.body.appendChild(btn);
  },
  
  // 初始化背景（从服务器加载）
  init() {
    // 优先从服务器加载配置
    this.initFromServer();
  }
};

// ==================== 通用工具函数 ====================

const Utils = {
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // 节流函数
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // 格式化时间
  formatTime(date = new Date()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // 转义HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  // 简单的Markdown渲染
  renderMarkdown(text) {
    // 代码块
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // 行内代码
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 粗体
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // 斜体
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // 链接
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 段落
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  }
};

// ==================== 页面初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  // 初始化主题
  ThemeManager.init();
  
  // 初始化导航栏
  Navbar.init();
  
  // 初始化平滑滚动
  SmoothScroll.init();
  
  // 初始化粒子系统
  ParticleSystem.init();
  
  // 初始化背景
  BackgroundManager.init();
});
