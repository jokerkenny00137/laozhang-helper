/**
 * storage-sync.js - 同步存储管理器
 * 整合 localStorage 和服务器存储，实现多设备同步
 */

const StorageSync = {
  // API基础URL
  apiBase: './api',
  
  // 管理员Token
  token: 'laozhang2024',
  
  // 缓存的配置
  cachedConfig: null,
  
  // 上次同步时间
  lastSync: 0,
  
  // 同步间隔（毫秒）
  syncInterval: 30000, // 30秒
  
  // 初始化
  async init() {
    // 先从服务器加载配置
    await this.loadFromServer();
    
    // 启动定期同步
    this.startAutoSync();
  },
  
  // 从服务器加载配置
  async loadFromServer() {
    try {
      const response = await fetch(`${this.apiBase}/config.json?t=${Date.now()}`);
      if (response.ok) {
        this.cachedConfig = await response.json();
        this.lastSync = Date.now();
        
        // 同时更新 localStorage（作为本地缓存）
        this.syncToLocalStorage();
        
        return this.cachedConfig;
      }
    } catch (error) {
      console.error('[StorageSync] 从服务器加载配置失败:', error);
      // 如果服务器加载失败，尝试从 localStorage 恢复
      this.loadFromLocalStorage();
    }
    return null;
  },
  
  // 保存配置到服务器
  async saveToServer(config) {
    try {
      const response = await fetch(`${this.apiBase}/config.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        const result = await response.json();
        // 更新缓存
        this.cachedConfig = { ...this.cachedConfig, ...config };
        this.lastSync = Date.now();
        
        // 同步到 localStorage
        this.syncToLocalStorage();
        
        return { success: true, data: result };
      } else {
        const error = await response.json();
        throw new Error(error.error || '保存失败');
      }
    } catch (error) {
      console.error('[StorageSync] 保存到服务器失败:', error);
      throw error;
    }
  },
  
  // 同步到 localStorage
  syncToLocalStorage() {
    if (!this.cachedConfig) return;
    
    const keys = {
      theme: 'lz_theme',
      backgroundImage: 'lz_bg_image',
      backgroundAudio: 'lz_bg_audio',
      aboutTitle: 'lz_about_title',
      aboutContent: 'lz_about_content',
      aboutImages: 'lz_about_images',
      advantages: 'lz_advantages',
      chatMode: 'lz_chat_mode',
      iframeUrl: 'lz_iframe_url'
    };
    
    Object.entries(keys).forEach(([configKey, storageKey]) => {
      if (this.cachedConfig[configKey] !== undefined) {
        const value = this.cachedConfig[configKey];
        if (typeof value === 'object') {
          localStorage.setItem(storageKey, JSON.stringify(value));
        } else {
          localStorage.setItem(storageKey, value);
        }
      }
    });
    
    // 保存同步时间戳
    localStorage.setItem('lz_last_sync', this.lastSync.toString());
  },
  
  // 从 localStorage 加载
  loadFromLocalStorage() {
    const keys = {
      theme: 'lz_theme',
      backgroundImage: 'lz_bg_image',
      backgroundAudio: 'lz_bg_audio',
      aboutTitle: 'lz_about_title',
      aboutContent: 'lz_about_content',
      aboutImages: 'lz_about_images',
      advantages: 'lz_advantages',
      chatMode: 'lz_chat_mode',
      iframeUrl: 'lz_iframe_url'
    };
    
    this.cachedConfig = {};
    
    Object.entries(keys).forEach(([configKey, storageKey]) => {
      const value = localStorage.getItem(storageKey);
      if (value !== null) {
        try {
          // 尝试解析JSON
          this.cachedConfig[configKey] = JSON.parse(value);
        } catch {
          // 如果不是JSON，直接存储
          this.cachedConfig[configKey] = value;
        }
      }
    });
    
    const lastSync = localStorage.getItem('lz_last_sync');
    if (lastSync) {
      this.lastSync = parseInt(lastSync);
    }
  },
  
  // 启动自动同步
  startAutoSync() {
    // 每30秒检查一次服务器配置是否有更新
    setInterval(async () => {
      await this.checkServerUpdate();
    }, this.syncInterval);
  },
  
  // 检查服务器是否有更新
  async checkServerUpdate() {
    try {
      const response = await fetch(`${this.apiBase}/config.json?t=${Date.now()}`);
      if (response.ok) {
        const serverConfig = await response.json();
        
        // 比较更新时间
        const serverTime = new Date(serverConfig.updatedAt).getTime();
        if (serverTime > this.lastSync) {
          console.log('[StorageSync] 检测到服务器配置更新，正在同步...');
          this.cachedConfig = serverConfig;
          this.lastSync = Date.now();
          this.syncToLocalStorage();
          
          // 触发配置更新事件
          window.dispatchEvent(new CustomEvent('configUpdated', { 
            detail: serverConfig 
          }));
        }
      }
    } catch (error) {
      console.error('[StorageSync] 检查服务器更新失败:', error);
    }
  },
  
  // 获取配置（优先使用服务器配置）
  getConfig() {
    return this.cachedConfig || {};
  },
  
  // 获取主题
  getTheme() {
    return this.cachedConfig?.theme || 'orange';
  },
  
  // 获取背景图片
  getBackgroundImage() {
    return this.cachedConfig?.backgroundImage || '';
  },
  
  // 获取背景音乐
  getBackgroundAudio() {
    return this.cachedConfig?.backgroundAudio || '';
  },
  
  // 获取关于标题
  getAboutTitle() {
    return this.cachedConfig?.aboutTitle || '老张工艺助手';
  },
  
  // 获取关于内容
  getAboutContent() {
    return this.cachedConfig?.aboutContent || '';
  },
  
  // 获取关于图片
  getAboutImages() {
    return this.cachedConfig?.aboutImages || [];
  },
  
  // 获取优势列表
  getAdvantages() {
    return this.cachedConfig?.advantages || [
      { title: '老师傅人设', desc: '25年产线经验口语化讲解' },
      { title: '全网资源整合', desc: '视频+图文优质内容一键直达' },
      { title: '零代码搭建', desc: '基于腾讯元器低门槛部署' },
      { title: '工艺全覆盖', desc: '车铣钻磨铸锻焊热处理全涵盖' }
    ];
  },
  
  // 获取对话模式
  getChatMode() {
    return this.cachedConfig?.chatMode || 'iframe';
  },
  
  // 获取iframe URL
  getIframeUrl() {
    return this.cachedConfig?.iframeUrl || 'https://yuanqi.tencent.com/webim/#/chat/edOjNA?appid=2055110454115566656&experience=true';
  },
  
  // 上传文件
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${this.apiBase}/upload.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.error || '上传失败');
      }
    } catch (error) {
      console.error('[StorageSync] 上传文件失败:', error);
      throw error;
    }
  }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  StorageSync.init();
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageSync;
}
