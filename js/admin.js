/**
 * admin.js - 老张工艺助手后台管理逻辑
 * 包含外观设置、内容管理、预览等功能
 */

const AdminManager = {
  // DOM元素
  elements: {},
  
  // 当前数据
  data: {
    theme: 'orange',
    bgImage: null,
    bgAudio: null,
    aboutTitle: '',
    aboutContent: '',
    aboutImages: [],
    advantages: [],
    chatMode: 'iframe',
    iframeUrl: ''
  },
  
  // 初始化
  async init() {
    // 检查登录状态
    if (!StorageManager.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }
    
    // 初始化DOM元素引用
    this.initElements();
    
    // 从服务器加载配置
    await this.loadDataFromServer();
    
    // 绑定事件
    this.bindEvents();
    
    // 初始化UI
    this.initUI();
  },
  
  // 从服务器加载配置
  async loadDataFromServer() {
    try {
      // 先尝试从服务器加载
      const serverConfig = await ServerStorage.loadConfig();
      
      if (serverConfig) {
        this.data.theme = serverConfig.theme || 'orange';
        this.data.bgImage = serverConfig.backgroundImage || null;
        this.data.aboutTitle = serverConfig.aboutTitle || '老张工艺助手';
        this.data.aboutContent = serverConfig.aboutContent || '';
        this.data.aboutImages = serverConfig.aboutImages || [];
        this.data.advantages = serverConfig.advantages || this.getDefaultAdvantages();
        this.data.chatMode = serverConfig.chatMode || 'iframe';
        this.data.iframeUrl = serverConfig.iframeUrl || 'https://yuanqi.tencent.com/webim/#/chat/edOjNA?appid=2055110454115566656&experience=true';
        
        console.log('已从服务器加载配置');
      } else {
        // 服务器无配置，使用默认值
        this.setDefaultData();
      }
    } catch (error) {
      console.error('从服务器加载配置失败:', error);
      this.showNotification('从服务器加载配置失败，使用默认设置', 'warning');
      this.setDefaultData();
    }
  },
  
  // 设置默认数据
  setDefaultData() {
    this.data.theme = 'orange';
    this.data.bgImage = null;
    this.data.aboutTitle = '老张工艺助手';
    this.data.aboutContent = '';
    this.data.aboutImages = [];
    this.data.advantages = this.getDefaultAdvantages();
    this.data.chatMode = 'iframe';
    this.data.iframeUrl = 'https://yuanqi.tencent.com/webim/#/chat/edOjNA?appid=2055110454115566656&experience=true';
  },
  
  // 获取默认优势
  getDefaultAdvantages() {
    return [
      { title: '老师傅人设', desc: '25年产线经验口语化讲解，不是冷冰冰的百科' },
      { title: '全网资源整合', desc: '视频+图文，B站/知乎/百科优质内容一键直达' },
      { title: '零代码搭建', desc: '基于腾讯元器/Coze，低门槛快速部署' },
      { title: '工艺全覆盖', desc: '车铣钻磨、铸锻焊、热处理、特种加工全涵盖' }
    ];
  },
  
  // 初始化DOM元素引用
  initElements() {
    this.elements = {
      // 侧边栏
      sidebar: document.getElementById('adminSidebar'),
      mobileToggle: document.getElementById('mobileToggle'),
      navLinks: document.querySelectorAll('.admin-nav-link'),
      pageTitle: document.getElementById('pageTitle'),
      logoutBtn: document.getElementById('logoutBtn'),
      
      // 按钮
      saveBtn: document.getElementById('saveBtn'),
      resetBtn: document.getElementById('resetBtn'),
      
      // 面板
      panels: document.querySelectorAll('.admin-panel'),
      
      // 外观设置
      themeSelector: document.getElementById('themeSelector'),
      themeOptions: document.querySelectorAll('.theme-option'),
      bgImageInput: document.getElementById('bgImageInput'),
      bgImageUpload: document.getElementById('bgImageUpload'),
      bgImagePreview: document.getElementById('bgImagePreview'),
      removeBgImage: document.getElementById('removeBgImage'),
      bgAudioInput: document.getElementById('bgAudioInput'),
      bgAudioUpload: document.getElementById('bgAudioUpload'),
      bgAudioPreview: document.getElementById('bgAudioPreview'),
      bgAudioPlayer: document.getElementById('bgAudioPlayer'),
      removeBgAudio: document.getElementById('removeBgAudio'),
      
      // 对话模式设置
      chatModeSelector: document.getElementById('chatModeSelector'),
      modeOptions: document.querySelectorAll('.mode-option'),
      iframeUrlSetting: document.getElementById('iframeUrlSetting'),
      iframeUrlInput: document.getElementById('iframeUrlInput'),
      
      // 内容管理
      aboutTitle: document.getElementById('aboutTitle'),
      aboutContent: document.getElementById('aboutContent'),
      aboutImagesGrid: document.getElementById('aboutImagesGrid'),
      aboutImageInput: document.getElementById('aboutImageInput'),
      addImageBtn: document.getElementById('addImageBtn'),
      advantagesList: document.getElementById('advantagesList')
    };
  },
  
  // 加载数据
  loadData() {
    this.data.theme = StorageManager.getTheme();
    this.data.bgImage = StorageManager.getBackgroundImage();
    this.data.bgAudio = StorageManager.getBackgroundAudio();
    this.data.aboutTitle = StorageManager.getAboutTitle();
    this.data.aboutContent = StorageManager.getAboutContent();
    this.data.aboutImages = StorageManager.getAboutImages();
    this.data.advantages = StorageManager.getAdvantages();
    this.data.chatMode = StorageManager.getChatMode();
    this.data.iframeUrl = StorageManager.getIframeUrl();
  },
  
  // 初始化UI
  initUI() {
    // 初始化主题选择
    this.elements.themeOptions.forEach(option => {
      option.classList.remove('selected');
      if (option.dataset.theme === this.data.theme) {
        option.classList.add('selected');
      }
    });
    
    // 初始化背景图片
    if (this.data.bgImage) {
      this.showBgImagePreview(this.data.bgImage);
    }
    
    // 初始化背景音乐
    if (this.data.bgAudio) {
      this.showBgAudioPreview(this.data.bgAudio);
    }
    
    // 初始化内容管理
    this.elements.aboutTitle.value = this.data.aboutTitle;
    this.elements.aboutContent.value = this.data.aboutContent;
    
    // 初始化图片列表
    this.renderAboutImages();
    
    // 初始化优势卡片
    this.renderAdvantages();
    
    // 初始化对话模式
    this.initChatModeUI();
  },
  
  // 初始化对话模式UI
  initChatModeUI() {
    // 设置模式选项选中状态
    this.elements.modeOptions.forEach(option => {
      option.classList.remove('selected');
      if (option.dataset.mode === this.data.chatMode) {
        option.classList.add('selected');
      }
    });
    
    // 设置iframe URL
    if (this.elements.iframeUrlInput) {
      this.elements.iframeUrlInput.value = this.data.iframeUrl || 'https://yuanqi.tencent.com/webim/#/chat/edOjNA?appid=2055110454115566656&experience=true';
    }
    
    // 根据模式显示/隐藏iframe URL设置
    this.toggleIframeUrlSetting();
  },
  
  // 切换iframe URL设置的显示
  toggleIframeUrlSetting() {
    if (this.elements.iframeUrlSetting) {
      if (this.data.chatMode === 'iframe') {
        this.elements.iframeUrlSetting.style.display = 'block';
      } else {
        this.elements.iframeUrlSetting.style.display = 'none';
      }
    }
  },
  
  // 绑定事件
  bindEvents() {
    // 移动端菜单切换
    this.elements.mobileToggle.addEventListener('click', () => {
      this.elements.sidebar.classList.toggle('open');
    });
    
    // 导航链接点击
    this.elements.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const panel = e.currentTarget.dataset.panel;
        this.switchPanel(panel);
        
        // 移动端关闭侧边栏
        this.elements.sidebar.classList.remove('open');
      });
    });
    
    // 退出登录
    this.elements.logoutBtn.addEventListener('click', () => {
      if (confirm('确定要退出登录吗？')) {
        StorageManager.setLoggedIn(false);
        window.location.href = 'login.html';
      }
    });
    
    // 保存设置
    this.elements.saveBtn.addEventListener('click', () => {
      this.saveSettings();
    });
    
    // 重置默认
    this.elements.resetBtn.addEventListener('click', () => {
      if (confirm('确定要重置所有设置吗？此操作不可恢复。')) {
        this.resetSettings();
      }
    });
    
    // 主题选择
    this.elements.themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.selectTheme(option.dataset.theme);
      });
    });
    
    // 对话模式选择
    this.elements.modeOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.selectChatMode(option.dataset.mode);
      });
    });
    
    // iframe URL输入框自动保存
    if (this.elements.iframeUrlInput) {
      this.elements.iframeUrlInput.addEventListener('blur', () => {
        this.data.iframeUrl = this.elements.iframeUrlInput.value;
        StorageManager.setIframeUrl(this.data.iframeUrl);
      });
    }
    
    // 背景图片上传
    this.elements.bgImageUpload.addEventListener('click', () => {
      this.elements.bgImageInput.click();
    });
    
    this.elements.bgImageUpload.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.elements.bgImageUpload.style.borderColor = 'var(--theme-primary)';
    });
    
    this.elements.bgImageUpload.addEventListener('dragleave', () => {
      this.elements.bgImageUpload.style.borderColor = '';
    });
    
    this.elements.bgImageUpload.addEventListener('drop', (e) => {
      e.preventDefault();
      this.elements.bgImageUpload.style.borderColor = '';
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleBgImageUpload(files[0]);
      }
    });
    
    this.elements.bgImageInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleBgImageUpload(e.target.files[0]);
      }
    });
    
    // 移除背景图片
    this.elements.removeBgImage.addEventListener('click', () => {
      this.removeBgImage();
    });
    
    // 背景音乐上传
    this.elements.bgAudioUpload.addEventListener('click', () => {
      this.elements.bgAudioInput.click();
    });
    
    this.elements.bgAudioInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleBgAudioUpload(e.target.files[0]);
      }
    });
    
    // 移除背景音乐
    this.elements.removeBgAudio.addEventListener('click', () => {
      this.removeBgAudio();
    });
    
    // 添加图片按钮
    this.elements.addImageBtn.addEventListener('click', () => {
      if (this.data.aboutImages.length < 5) {
        this.elements.aboutImageInput.click();
      } else {
        alert('最多只能上传5张图片');
      }
    });
    
    // 图片上传
    this.elements.aboutImageInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleAboutImageUpload(e.target.files[0]);
      }
    });
    
    // 自动保存输入内容
    this.elements.aboutTitle.addEventListener('blur', () => {
      StorageManager.setAboutTitle(this.elements.aboutTitle.value);
    });
    
    this.elements.aboutContent.addEventListener('blur', () => {
      StorageManager.setAboutContent(this.elements.aboutContent.value);
    });
  },
  
  // 切换面板
  switchPanel(panelName) {
    // 更新导航高亮
    this.elements.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.panel === panelName) {
        link.classList.add('active');
      }
    });
    
    // 切换面板显示
    this.elements.panels.forEach(panel => {
      panel.classList.remove('active');
    });
    
    const targetPanel = document.getElementById(`panel-${panelName}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }
    
    // 更新页面标题
    const titles = {
      appearance: '外观设置',
      content: '内容管理',
      preview: '预览'
    };
    this.elements.pageTitle.textContent = titles[panelName] || '后台管理';
  },
  
  // 选择主题
  selectTheme(theme) {
    this.data.theme = theme;
    
    // 更新UI
    this.elements.themeOptions.forEach(option => {
      option.classList.remove('selected');
      if (option.dataset.theme === theme) {
        option.classList.add('selected');
      }
    });
    
    // 应用主题
    const themeColors = {
      orange: { primary: '#ff6b35', primaryLight: '#ff8555' },
      blue: { primary: '#4a90d9', primaryLight: '#6aa8e8' },
      red: { primary: '#e74c3c', primaryLight: '#ec7063' }
    };
    
    const colors = themeColors[theme];
    const styleTag = document.getElementById('theme-style');
    styleTag.textContent = `
      :root {
        --theme-primary: ${colors.primary};
        --theme-primary-light: ${colors.primaryLight};
      }
    `;
  },
  
  // 选择对话模式
  selectChatMode(mode) {
    this.data.chatMode = mode;
    
    // 更新UI
    this.elements.modeOptions.forEach(option => {
      option.classList.remove('selected');
      if (option.dataset.mode === mode) {
        option.classList.add('selected');
      }
    });
    
    // 显示/隐藏iframe URL设置
    this.toggleIframeUrlSetting();
    
    // 保存设置
    StorageManager.setChatMode(mode);
    
    // 显示提示
    this.showNotification(`已切换到${mode === 'iframe' ? '腾讯元器嵌入' : '本地模拟回复'}模式，刷新首页后生效`, 'success');
  },
  
  // 处理背景图片上传 - 上传到服务器
  async handleBgImageUpload(file) {
    try {
      StorageManager.validateImage(file);
      
      this.showNotification('正在上传图片...', 'info');
      
      // 上传到服务器
      const result = await ServerStorage.uploadImage(file);
      
      if (result.success) {
        this.data.bgImage = result.url;
        this.showBgImagePreview(result.url);
        this.showNotification('图片上传成功！', 'success');
      }
    } catch (error) {
      this.showNotification('上传失败: ' + error.message, 'error');
    }
  },
  
  // 显示背景图片预览
  showBgImagePreview(imageData) {
    this.elements.bgImageUpload.style.display = 'none';
    this.elements.bgImagePreview.style.display = 'block';
    this.elements.bgImagePreview.querySelector('img').src = imageData;
  },
  
  // 移除背景图片
  removeBgImage() {
    this.data.bgImage = null;
    this.elements.bgImageUpload.style.display = 'flex';
    this.elements.bgImagePreview.style.display = 'none';
    this.elements.bgImagePreview.querySelector('img').src = '';
    this.elements.bgImageInput.value = '';
  },
  
  // 处理背景音乐上传 - 上传到服务器
  async handleBgAudioUpload(file) {
    try {
      StorageManager.validateAudio(file);
      
      this.showNotification('正在上传音频...', 'info');
      
      // 使用 FormData 上传音频文件
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('./api/upload.php', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer laozhang2024'
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.data.bgAudio = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: result.url
        };
        this.showBgAudioPreview(this.data.bgAudio);
        this.showNotification('音频上传成功！', 'success');
      } else {
        throw new Error(result.error || '上传失败');
      }
    } catch (error) {
      this.showNotification('上传失败: ' + error.message, 'error');
    }
  },
  
  // 显示背景音乐预览
  showBgAudioPreview(audioInfo) {
    this.elements.bgAudioUpload.style.display = 'none';
    this.elements.bgAudioPreview.style.display = 'block';
    
    // 如果有临时URL则播放，否则显示文件信息
    if (audioInfo.url) {
      this.elements.bgAudioPlayer.src = audioInfo.url;
    } else {
      // 只显示文件信息，提示用户重新上传
      this.elements.bgAudioPlayer.style.display = 'none';
      const infoDiv = document.createElement('div');
      infoDiv.className = 'audio-info';
      infoDiv.innerHTML = `
        <p>已选择: ${audioInfo.name}</p>
        <p class="text-muted">大小: ${(audioInfo.size / 1024 / 1024).toFixed(2)} MB</p>
        <p class="text-muted text-small">（请重新上传以播放）</p>
      `;
      this.elements.bgAudioPreview.appendChild(infoDiv);
    }
  },
  
  // 移除背景音乐
  removeBgAudio() {
    if (this.data.bgAudio && this.data.bgAudio.url) {
      URL.revokeObjectURL(this.data.bgAudio.url);
    }
    this.data.bgAudio = null;
    this.elements.bgAudioUpload.style.display = 'flex';
    this.elements.bgAudioPreview.style.display = 'none';
    this.elements.bgAudioPlayer.src = '';
    this.elements.bgAudioInput.value = '';
  },
  
  // 处理介绍页图片上传
  async handleAboutImageUpload(file) {
    try {
      if (this.data.aboutImages.length >= 5) {
        this.showNotification('最多只能上传5张图片', 'warning');
        return;
      }
      
      StorageManager.validateImage(file);
      
      this.showNotification('正在上传图片...', 'info');
      
      // 上传到服务器
      const result = await ServerStorage.uploadImage(file);
      
      if (result.success) {
        this.data.aboutImages.push(result.url);
        this.renderAboutImages();
        this.showNotification('图片上传成功！', 'success');
      }
    } catch (error) {
      this.showNotification('上传失败: ' + error.message, 'error');
    }
    
    // 清空input以便重复选择同一文件
    this.elements.aboutImageInput.value = '';
  },
  
  // 渲染介绍页图片列表
  renderAboutImages() {
    // 清空现有内容
    this.elements.aboutImagesGrid.innerHTML = '';
    
    // 添加图片缩略图
    this.data.aboutImages.forEach((image, index) => {
      const item = document.createElement('div');
      item.className = 'thumbnail-item';
      item.innerHTML = `
        <img src="${image}" alt="图片 ${index + 1}">
        <button class="thumbnail-remove" data-index="${index}" title="删除">×</button>
      `;
      this.elements.aboutImagesGrid.appendChild(item);
    });
    
    // 添加按钮
    if (this.data.aboutImages.length < 5) {
      const addBtn = document.createElement('div');
      addBtn.className = 'thumbnail-item thumbnail-add';
      addBtn.id = 'addImageBtn';
      addBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      `;
      addBtn.addEventListener('click', () => {
        this.elements.aboutImageInput.click();
      });
      this.elements.aboutImagesGrid.appendChild(addBtn);
    }
    
    // 绑定删除事件
    this.elements.aboutImagesGrid.querySelectorAll('.thumbnail-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.removeAboutImage(index);
      });
    });
  },
  
  // 删除介绍页图片
  removeAboutImage(index) {
    StorageManager.removeAboutImage(index);
    this.data.aboutImages.splice(index, 1);
    this.renderAboutImages();
  },
  
  // 渲染优势卡片编辑
  renderAdvantages() {
    this.elements.advantagesList.innerHTML = '';
    
    this.data.advantages.forEach((adv, index) => {
      const card = document.createElement('div');
      card.className = 'advantage-edit';
      card.innerHTML = `
        <div class="advantage-edit-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor">${index + 1}</text>
          </svg>
          优势卡片 ${index + 1}
        </div>
        <div class="form-group">
          <label class="form-label">标题</label>
          <input type="text" class="glass-input advantage-title" data-index="${index}" value="${adv.title}" placeholder="输入卡片标题">
        </div>
        <div class="form-group">
          <label class="form-label">描述</label>
          <textarea class="glass-input advantage-desc" data-index="${index}" rows="2" placeholder="输入卡片描述">${adv.desc}</textarea>
        </div>
      `;
      this.elements.advantagesList.appendChild(card);
    });
    
    // 绑定输入事件
    this.elements.advantagesList.querySelectorAll('.advantage-title, .advantage-desc').forEach(input => {
      input.addEventListener('blur', () => {
        this.updateAdvantages();
      });
    });
  },
  
  // 更新优势卡片数据
  updateAdvantages() {
    const titles = this.elements.advantagesList.querySelectorAll('.advantage-title');
    const descs = this.elements.advantagesList.querySelectorAll('.advantage-desc');
    
    this.data.advantages = Array.from(titles).map((title, index) => ({
      title: title.value,
      desc: descs[index].value
    }));
    
    StorageManager.setAdvantages(this.data.advantages);
  },
  
  // 保存所有设置到服务器
  async saveSettings() {
    try {
      this.showNotification('正在保存到服务器...', 'info');
      
      // 更新优势卡片数据
      this.updateAdvantages();
      
      // 构建配置对象
      const config = {
        theme: this.data.theme,
        backgroundImage: this.data.bgImage || '',
        backgroundAudio: this.data.bgAudio?.url || '',
        aboutTitle: this.elements.aboutTitle.value,
        aboutContent: this.elements.aboutContent.value,
        aboutImages: this.data.aboutImages,
        advantages: this.data.advantages,
        chatMode: this.data.chatMode,
        iframeUrl: this.elements.iframeUrlInput.value
      };
      
      // 保存到服务器
      const result = await ServerStorage.saveConfig(config);
      
      if (result.success) {
        this.showNotification('设置已保存到服务器！所有用户将看到更新', 'success');
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('保存失败:', error);
      this.showNotification('保存失败: ' + error.message, 'error');
    }
  },
  
  // 重置所有设置
  resetSettings() {
    StorageManager.resetAll();
    
    // 重置本地数据
    this.data = {
      theme: 'orange',
      bgImage: null,
      bgAudio: null,
      aboutTitle: '老张工艺助手',
      aboutContent: '',
      aboutImages: [],
      advantages: StorageManager.getAdvantages()
    };
    
    // 重新加载数据
    this.loadData();
    
    // 重新初始化UI
    this.initUI();
    
    // 重置主题
    this.selectTheme('orange');
    
    this.showNotification('已重置为默认设置', 'success');
  },
  
  // 显示通知
  showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' : type === 'error' ? 'rgba(231, 76, 60, 0.9)' : 'rgba(74, 144, 217, 0.9)'};
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      backdrop-filter: blur(8px);
    `;
    notification.textContent = message;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
};

// ==================== 页面加载完成后初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  AdminManager.init();
});
