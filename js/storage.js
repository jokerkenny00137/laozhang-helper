/**
 * storage.js - 老张工艺助手 localStorage 封装模块
 * 用于存储管理员设置、背景图、背景音乐等数据
 */

const StorageManager = {
  // 存储键名
  keys: {
    THEME: 'lz_theme',
    BACKGROUND_IMAGE: 'lz_bg_image',
    BACKGROUND_AUDIO: 'lz_bg_audio',
    ABOUT_TITLE: 'lz_about_title',
    ABOUT_CONTENT: 'lz_about_content',
    ABOUT_IMAGES: 'lz_about_images',
    ADVANTAGES: 'lz_advantages',
    ADMIN_LOGGED_IN: 'lz_admin_logged_in',
    CHAT_MODE: 'lz_chat_mode',
    IFRAME_URL: 'lz_iframe_url'
  },
  
  // ==================== 主题管理 ====================
  
  /**
   * 获取当前主题
   * @returns {string} 主题名称 (orange/blue/red)
   */
  getTheme() {
    return localStorage.getItem(this.keys.THEME) || 'orange';
  },
  
  /**
   * 设置主题
   * @param {string} theme - 主题名称 (orange/blue/red)
   */
  setTheme(theme) {
    localStorage.setItem(this.keys.THEME, theme);
  },
  
  // ==================== 背景图片 ====================
  
  /**
   * 获取背景图片
   * @returns {string|null} Base64编码的图片数据
   */
  getBackgroundImage() {
    return localStorage.getItem(this.keys.BACKGROUND_IMAGE);
  },
  
  /**
   * 设置背景图片
   * @param {string} imageData - Base64编码的图片数据
   */
  setBackgroundImage(imageData) {
    localStorage.setItem(this.keys.BACKGROUND_IMAGE, imageData);
  },
  
  /**
   * 清除背景图片
   */
  clearBackgroundImage() {
    localStorage.removeItem(this.keys.BACKGROUND_IMAGE);
  },
  
  // ==================== 背景音乐 ====================
  // 注意：由于localStorage有5MB限制，不存储音频文件本身
  // 只存储音频文件信息（名称、大小等）
  
  /**
   * 获取背景音乐信息
   * @returns {Object|null} 音频文件信息
   */
  getBackgroundAudio() {
    const data = localStorage.getItem(this.keys.BACKGROUND_AUDIO);
    return data ? JSON.parse(data) : null;
  },
  
  /**
   * 设置背景音乐信息（不存储文件本身，避免超出localStorage限制）
   * @param {Object} audioInfo - 音频文件信息 {name, size, type}
   */
  setBackgroundAudio(audioInfo) {
    localStorage.setItem(this.keys.BACKGROUND_AUDIO, JSON.stringify(audioInfo));
  },
  
  /**
   * 清除背景音乐
   */
  clearBackgroundAudio() {
    localStorage.removeItem(this.keys.BACKGROUND_AUDIO);
  },
  
  // ==================== 介绍页内容 ====================
  
  /**
   * 获取介绍页标题
   * @returns {string}
   */
  getAboutTitle() {
    return localStorage.getItem(this.keys.ABOUT_TITLE) || '老张工艺助手';
  },
  
  /**
   * 设置介绍页标题
   * @param {string} title
   */
  setAboutTitle(title) {
    localStorage.setItem(this.keys.ABOUT_TITLE, title);
  },
  
  /**
   * 获取介绍页内容
   * @returns {string}
   */
  getAboutContent() {
    return localStorage.getItem(this.keys.ABOUT_CONTENT) || '';
  },
  
  /**
   * 设置介绍页内容
   * @param {string} content
   */
  setAboutContent(content) {
    localStorage.setItem(this.keys.ABOUT_CONTENT, content);
  },
  
  /**
   * 获取介绍页图片列表
   * @returns {string[]} Base64图片数据数组
   */
  getAboutImages() {
    const images = localStorage.getItem(this.keys.ABOUT_IMAGES);
    return images ? JSON.parse(images) : [];
  },
  
  /**
   * 添加介绍页图片
   * @param {string} imageData - Base64编码的图片数据
   */
  addAboutImage(imageData) {
    const images = this.getAboutImages();
    if (images.length < 5) {
      images.push(imageData);
      localStorage.setItem(this.keys.ABOUT_IMAGES, JSON.stringify(images));
      return true;
    }
    return false;
  },
  
  /**
   * 删除介绍页图片
   * @param {number} index - 图片索引
   */
  removeAboutImage(index) {
    const images = this.getAboutImages();
    if (index >= 0 && index < images.length) {
      images.splice(index, 1);
      localStorage.setItem(this.keys.ABOUT_IMAGES, JSON.stringify(images));
    }
  },
  
  /**
   * 清除所有介绍页图片
   */
  clearAboutImages() {
    localStorage.removeItem(this.keys.ABOUT_IMAGES);
  },
  
  // ==================== 优势卡片 ====================
  
  /**
   * 获取优势卡片数据
   * @returns {Array}
   */
  getAdvantages() {
    const defaultAdvantages = [
      { title: '老师傅人设', desc: '25年产线经验口语化讲解，不是冷冰冰的百科' },
      { title: '全网资源整合', desc: '视频+图文，B站/知乎/百科优质内容一键直达' },
      { title: '零代码搭建', desc: '基于腾讯元器/Coze，低门槛快速部署' },
      { title: '工艺全覆盖', desc: '车铣钻磨、铸锻焊、热处理、特种加工全涵盖' }
    ];
    
    const stored = localStorage.getItem(this.keys.ADVANTAGES);
    return stored ? JSON.parse(stored) : defaultAdvantages;
  },
  
  /**
   * 设置优势卡片数据
   * @param {Array} advantages
   */
  setAdvantages(advantages) {
    localStorage.setItem(this.keys.ADVANTAGES, JSON.stringify(advantages));
  },
  
  // ==================== 登录状态 ====================
  
  /**
   * 检查是否已登录
   * @returns {boolean}
   */
  isLoggedIn() {
    return localStorage.getItem(this.keys.ADMIN_LOGGED_IN) === 'true';
  },
  
  /**
   * 设置登录状态
   * @param {boolean} status
   */
  setLoggedIn(status) {
    localStorage.setItem(this.keys.ADMIN_LOGGED_IN, status ? 'true' : 'false');
  },
  
  // ==================== 文件处理工具 ====================
  
  /**
   * 将文件转换为Base64
   * @param {File} file
   * @returns {Promise<string>}
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  /**
   * 验证图片文件
   * @param {File} file
   * @returns {boolean}
   */
  validateImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('请上传有效的图片文件 (JPG, PNG, GIF, WebP)');
    }
    
    if (file.size > maxSize) {
      throw new Error('图片大小不能超过5MB');
    }
    
    return true;
  },
  
  /**
   * 验证音频文件
   * @param {File} file
   * @returns {boolean}
   */
  validateAudio(file) {
    // 使用文件扩展名验证，避免MIME类型不准确的问题
    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validExts.includes(ext)) {
      throw new Error('请上传有效的音频文件 (MP3, WAV, OGG, M4A, AAC)');
    }
    
    if (file.size > maxSize) {
      throw new Error('音频大小不能超过10MB');
    }
    
    return true;
  },
  
  // ==================== 清除所有数据 ====================
  
  // ==================== 对话模式 ====================
  
  /**
   * 获取对话模式
   * @returns {string} 'iframe' 或 'mock'
   */
  getChatMode() {
    return localStorage.getItem(this.keys.CHAT_MODE) || 'iframe';
  },
  
  /**
   * 设置对话模式
   * @param {string} mode - 'iframe' 或 'mock'
   */
  setChatMode(mode) {
    localStorage.setItem(this.keys.CHAT_MODE, mode);
  },
  
  /**
   * 获取iframe嵌入链接
   * @returns {string}
   */
  getIframeUrl() {
    return localStorage.getItem(this.keys.IFRAME_URL) || '';
  },
  
  /**
   * 设置iframe嵌入链接
   * @param {string} url
   */
  setIframeUrl(url) {
    localStorage.setItem(this.keys.IFRAME_URL, url);
  },
  
  // ==================== 清除所有数据 ====================
  
  /**
   * 重置所有设置到默认值
   */
  resetAll() {
    Object.values(this.keys).forEach(key => {
      localStorage.removeItem(key);
    });
  },
  
  /**
   * 获取存储使用情况
   * @returns {Object}
   */
  getStorageInfo() {
    let totalSize = 0;
    const items = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      totalSize += size;
      
      if (Object.values(this.keys).includes(key)) {
        items[key] = {
          size: (size / 1024).toFixed(2) + ' KB',
          type: typeof value
        };
      }
    }
    
    return {
      total: (totalSize / 1024).toFixed(2) + ' KB',
      items: items
    };
  }
};
