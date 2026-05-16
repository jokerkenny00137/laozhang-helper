/**
 * storage-server.js - 服务器端存储管理
 * 替代localStorage，使用后端API保存配置
 */

const ServerStorage = {
  // API基础URL
  apiBase: './api',
  
  // 管理员Token
  token: 'laozhang2024',
  
  // 缓存的配置
  cachedConfig: null,
  
  // 加载配置
  async loadConfig() {
    try {
      const response = await fetch(`${this.apiBase}/config.json?t=${Date.now()}`);
      if (response.ok) {
        this.cachedConfig = await response.json();
        return this.cachedConfig;
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
    return null;
  },
  
  // 保存配置到服务器
  async saveConfig(config) {
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
        this.cachedConfig = { ...this.cachedConfig, ...config };
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Save failed');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    }
  },
  
  // 上传图片
  async uploadImage(file) {
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
        throw new Error(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  },
  
  // 获取主题
  getTheme() {
    return this.cachedConfig?.theme || 'orange';
  },
  
  // 获取背景图片
  getBackgroundImage() {
    return this.cachedConfig?.backgroundImage || '';
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
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServerStorage;
}
