/**
 * config-loader.js - 全局配置加载器
 * 负责从服务器加载配置并应用到页面
 */

const ConfigLoader = {
  // 配置缓存
  config: null,
  
  // 从服务器加载配置
  async load() {
    try {
      const response = await fetch('./api/config.json?t=' + Date.now());
      if (response.ok) {
        this.config = await response.json();
        this.apply();
        console.log('[ConfigLoader] 配置已从服务器加载');
        return this.config;
      }
    } catch (error) {
      console.error('[ConfigLoader] 加载配置失败:', error);
    }
    return null;
  },
  
  // 应用配置到页面
  apply() {
    if (!this.config) return;
    
    // 应用主题
    this.applyTheme();
    
    // 应用背景图片
    this.applyBackground();
    
    // 应用背景音乐
    this.applyBackgroundAudio();
    
    // 应用关于页面内容
    this.applyAboutContent();
    
    // 应用对话模式设置
    this.applyChatMode();
  },
  
  // 应用主题
  applyTheme() {
    const theme = this.config.theme || 'orange';
    const themeColors = {
      orange: { primary: '#ff6b35', primaryLight: '#ff8555' },
      blue: { primary: '#4a90d9', primaryLight: '#6aa8e8' },
      red: { primary: '#e74c3c', primaryLight: '#ec7063' }
    };
    
    const colors = themeColors[theme] || themeColors.orange;
    
    // 更新CSS变量
    document.documentElement.style.setProperty('--theme-primary', colors.primary);
    document.documentElement.style.setProperty('--theme-primary-light', colors.primaryLight);
    
    // 更新主题样式标签
    let styleTag = document.getElementById('dynamic-theme-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-theme-style';
      document.head.appendChild(styleTag);
    }
    
    styleTag.textContent = `
      :root {
        --theme-primary: ${colors.primary};
        --theme-primary-light: ${colors.primaryLight};
      }
    `;
  },
  
  // 应用背景图片
  applyBackground() {
    const bgImage = this.config.backgroundImage;
    if (!bgImage) return;
    
    // 查找或创建背景元素
    let bgElement = document.getElementById('page-background');
    if (!bgElement) {
      bgElement = document.createElement('div');
      bgElement.id = 'page-background';
      bgElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      `;
      document.body.insertBefore(bgElement, document.body.firstChild);
    }
    
    bgElement.style.backgroundImage = `url(${bgImage})`;
    
    // 调整网格背景透明度
    const gridBg = document.querySelector('.grid-bg');
    if (gridBg) {
      gridBg.style.background = 'rgba(10, 10, 15, 0.85)';
    }
  },
  
  // 应用背景音乐
  applyBackgroundAudio() {
    const audioUrl = this.config.backgroundAudio;
    if (!audioUrl) return;
    
    let audioElement = document.getElementById('page-background-audio');
    if (!audioElement) {
      audioElement = document.createElement('audio');
      audioElement.id = 'page-background-audio';
      audioElement.loop = true;
      audioElement.volume = 0.3;
      audioElement.style.display = 'none';
      document.body.appendChild(audioElement);
    }
    
    if (audioElement.src !== audioUrl) {
      audioElement.src = audioUrl;
      // 自动播放（需要用户交互后）
      const playAudio = () => {
        audioElement.play().catch(() => {});
        document.removeEventListener('click', playAudio);
      };
      document.addEventListener('click', playAudio);
    }
  },
  
  // 应用关于页面内容
  applyAboutContent() {
    // 更新标题
    const aboutTitleEl = document.getElementById('about-title');
    if (aboutTitleEl && this.config.aboutTitle) {
      aboutTitleEl.textContent = this.config.aboutTitle;
    }
    
    // 更新内容
    const aboutContentEl = document.getElementById('about-content');
    if (aboutContentEl && this.config.aboutContent) {
      aboutContentEl.innerHTML = this.config.aboutContent.replace(/\n/g, '<br>');
    }
    
    // 更新图片
    const aboutImagesContainer = document.getElementById('about-images');
    if (aboutImagesContainer && this.config.aboutImages && this.config.aboutImages.length > 0) {
      aboutImagesContainer.innerHTML = this.config.aboutImages.map(img => `
        <div class="about-image-item">
          <img src="${img}" alt="介绍图片" loading="lazy">
        </div>
      `).join('');
    }
    
    // 更新优势卡片
    const advantagesContainer = document.getElementById('advantages-container');
    if (advantagesContainer && this.config.advantages) {
      advantagesContainer.innerHTML = this.config.advantages.map((adv, index) => `
        <div class="advantage-card" style="animation-delay: ${index * 0.1}s">
          <h3>${adv.title}</h3>
          <p>${adv.desc}</p>
        </div>
      `).join('');
    }
  },
  
  // 应用对话模式设置
  applyChatMode() {
    // 将配置保存到 window 对象供 chat.js 使用
    window.serverConfig = {
      chatMode: this.config.chatMode || 'iframe',
      iframeUrl: this.config.iframeUrl || 'https://yuanqi.tencent.com/webim/#/chat/edOjNA?appid=2055110454115566656&experience=true'
    };
  },
  
  // 获取配置
  getConfig() {
    return this.config;
  },
  
  // 获取主题
  getTheme() {
    return this.config?.theme || 'orange';
  },
  
  // 获取背景图片
  getBackgroundImage() {
    return this.config?.backgroundImage || '';
  },
  
  // 获取背景音乐
  getBackgroundAudio() {
    return this.config?.backgroundAudio || '';
  },
  
  // 获取关于标题
  getAboutTitle() {
    return this.config?.aboutTitle || '老张工艺助手';
  },
  
  // 获取关于内容
  getAboutContent() {
    return this.config?.aboutContent || '';
  },
  
  // 获取关于图片
  getAboutImages() {
    return this.config?.aboutImages || [];
  },
  
  // 获取优势列表
  getAdvantages() {
    return this.config?.advantages || [
      { title: '老师傅人设', desc: '25年产线经验口语化讲解，不是冷冰冰的百科' },
      { title: '全网资源整合', desc: '视频+图文，B站/知乎/百科优质内容一键直达' },
      { title: '零代码搭建', desc: '基于腾讯元器/Coze，低门槛快速部署' },
      { title: '工艺全覆盖', desc: '车铣钻磨、铸锻焊、热处理、特种加工全涵盖' }
    ];
  },
  
  // 获取对话模式
  getChatMode() {
    return this.config?.chatMode || 'iframe';
  },
  
  // 获取iframe URL
  getIframeUrl() {
    return this.config?.iframeUrl || 'https://yuanqi.tencent.com/webim/#/chat/edOjNA?appid=2055110454115566656&experience=true';
  }
};

// 页面加载时自动加载配置
document.addEventListener('DOMContentLoaded', () => {
  ConfigLoader.load();
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigLoader;
}
