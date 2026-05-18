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
    iframeUrl: '',
    overview: null,
    tech: null,
    scenarios: null,
    team: null,
    cta: null
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
        this.data.bgAudio = serverConfig.backgroundAudio ? { url: serverConfig.backgroundAudio } : null;
        this.data.aboutTitle = serverConfig.aboutTitle || '老张工艺助手';
        this.data.aboutContent = serverConfig.aboutContent || '';
        this.data.aboutImages = serverConfig.aboutImages || [];
        this.data.advantages = serverConfig.advantages || this.getDefaultAdvantages();
        this.data.chatMode = serverConfig.chatMode || 'iframe';
        this.data.iframeUrl = serverConfig.iframeUrl || 'https://yuanqi.tencent.com/webim/#/chat/edOjNA?appid=2055110454115566656&experience=true';
        this.data.overview = serverConfig.overview || this.getDefaultOverview();
        this.data.tech = serverConfig.tech || this.getDefaultTech();
        this.data.scenarios = serverConfig.scenarios || this.getDefaultScenarios();
        this.data.team = serverConfig.team || this.getDefaultTeam();
        this.data.cta = serverConfig.cta || this.getDefaultCTA();
        
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
    this.data.bgAudio = null;
    this.data.aboutTitle = '老张工艺助手';
    this.data.aboutContent = '';
    this.data.aboutImages = [];
    this.data.advantages = this.getDefaultAdvantages();
    this.data.chatMode = 'iframe';
    this.data.iframeUrl = 'https://yuanqi.tencent.com/webim/#/chat/edOjNA?appid=2055110454115566656&experience=true';
    this.data.overview = this.getDefaultOverview();
    this.data.tech = this.getDefaultTech();
    this.data.scenarios = this.getDefaultScenarios();
    this.data.team = this.getDefaultTeam();
    this.data.cta = this.getDefaultCTA();
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
  
  // 获取默认产品概述
  getDefaultOverview() {
    return {
      title: '为什么做老张工艺助手？',
      leadText: '机械加工工艺是机械工程的核心技能，但学习过程中存在三大痛点：',
      painPoints: [
        { icon: '📚', title: '工艺基础薄弱', desc: '机械专业学生在校期间以理论学习为主，缺乏实际操作经验。' },
        { icon: '👨‍🏭', title: '老师傅经验断层', desc: '经验丰富的老师傅即将退休，年轻学徒很难获得系统的工艺指导。' },
        { icon: '🔍', title: '优质资源分散', desc: 'B站、知乎上的工艺知识良莠不齐，缺乏权威系统的学习平台。' }
      ],
      solutionTitle: '解决方案',
      solutionContent: '老张工艺助手基于腾讯元器AI平台开发，以25年机加老师傅人设，用口语化方式讲解机械加工工艺。',
      image: ''
    };
  },

  // 获取默认技术架构
  getDefaultTech() {
    return {
      title: '技术实现方案',
      cards: [
        { title: '大模型能力', items: ['DeepSeek-R1 - 深度推理能力', '腾讯混元 - 中文语义理解', '人设Prompt工程 - 精准调教'] },
        { title: '知识来源', items: ['内置知识库 - 工艺手册', 'DuckDuckGo搜索 - 实时信息', '视频资源索引 - B站教程'] },
        { title: '前端技术栈', items: ['纯HTML/CSS/JS - 轻量高效', '液态玻璃UI - 美观现代', 'Canvas粒子系统 - 性能友好'] }
      ],
      image: ''
    };
  },

  // 获取默认应用场景
  getDefaultScenarios() {
    return {
      title: '适合谁使用',
      cards: [
        { icon: '📖', title: '课堂预习', desc: '课前先用老张过一遍概念，带着问题去上课。', tags: ['大学生', '课前准备'] },
        { icon: '🔧', title: '实训备考', desc: '金工实习前恶补操作要领，实习时心里有底。', tags: ['金工实习', '技能考证'] },
        { icon: '🎓', title: '毕业设计', desc: '工艺规程编制遇到瓶颈？从毛坯选择到工序安排给你建议。', tags: ['毕业设计', '工艺设计'] }
      ]
    };
  },

  // 获取默认团队介绍
  getDefaultTeam() {
    return {
      title: '关于我们',
      name: 'CICAS 参赛团队',
      desc: '我们是一支热爱机械工程与人工智能的学生团队。\n本项目基于腾讯元器平台开发，融合大模型能力。',
      stats: [
        { number: '25年', label: '虚拟经验' },
        { number: '100+', label: '工艺知识' },
        { number: '7×24', label: '在线服务' }
      ],
      image: ''
    };
  },

  // 获取默认CTA
  getDefaultCTA() {
    return {
      title: '准备好开始学习了吗？',
      desc: '立即与老张对话，开启你的工艺学习之旅',
      buttonText: '开始对话',
      backgroundImage: ''
    };
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
      advantagesList: document.getElementById('advantagesList'),

      // 产品概述
      overviewTitle: document.getElementById('overviewTitle'),
      overviewLead: document.getElementById('overviewLead'),
      painPointsList: document.getElementById('painPointsList'),
      solutionTitle: document.getElementById('solutionTitle'),
      solutionContent: document.getElementById('solutionContent'),
      overviewImageUpload: document.getElementById('overviewImageUpload'),
      overviewImageInput: document.getElementById('overviewImageInput'),
      overviewImagePreview: document.getElementById('overviewImagePreview'),
      removeOverviewImage: document.getElementById('removeOverviewImage'),

      // 技术架构
      techTitle: document.getElementById('techTitle'),
      techCardsList: document.getElementById('techCardsList'),
      techImageUpload: document.getElementById('techImageUpload'),
      techImageInput: document.getElementById('techImageInput'),
      techImagePreview: document.getElementById('techImagePreview'),
      removeTechImage: document.getElementById('removeTechImage'),

      // 应用场景
      scenariosTitle: document.getElementById('scenariosTitle'),
      scenariosList: document.getElementById('scenariosList'),

      // 团队介绍
      teamTitle: document.getElementById('teamTitle'),
      teamName: document.getElementById('teamName'),
      teamDesc: document.getElementById('teamDesc'),
      teamStatsList: document.getElementById('teamStatsList'),
      teamImageUpload: document.getElementById('teamImageUpload'),
      teamImageInput: document.getElementById('teamImageInput'),
      teamImagePreview: document.getElementById('teamImagePreview'),
      removeTeamImage: document.getElementById('removeTeamImage'),

      // CTA
      ctaTitle: document.getElementById('ctaTitle'),
      ctaDesc: document.getElementById('ctaDesc'),
      ctaButton: document.getElementById('ctaButton'),
      ctaBgUpload: document.getElementById('ctaBgUpload'),
      ctaBgInput: document.getElementById('ctaBgInput'),
      ctaBgPreview: document.getElementById('ctaBgPreview'),
      removeCtaBg: document.getElementById('removeCtaBg')
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
    if (this.elements.aboutTitle) {
      this.elements.aboutTitle.value = this.data.aboutTitle;
    }

    // 初始化优势卡片
    this.renderAdvantages();
    
    // 初始化产品概述
    this.renderOverviewEditor();
    
    // 初始化技术架构
    this.renderTechEditor();
    
    // 初始化应用场景
    this.renderScenariosEditor();
    
    // 初始化团队介绍
    this.renderTeamEditor();
    
    // 初始化CTA
    this.renderCTAEditor();
    
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
    if (this.elements.mobileToggle) {
      this.elements.mobileToggle.addEventListener('click', () => {
        this.elements.sidebar.classList.toggle('open');
      });
    }
    
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
    if (this.elements.logoutBtn) {
      this.elements.logoutBtn.addEventListener('click', () => {
        if (confirm('确定要退出登录吗？')) {
          StorageManager.setLoggedIn(false);
          window.location.href = 'login.html';
        }
      });
    }
    
    // 保存设置
    if (this.elements.saveBtn) {
      this.elements.saveBtn.addEventListener('click', () => {
        this.saveSettings();
      });
    }
    
    // 重置默认
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => {
        if (confirm('确定要重置所有设置吗？此操作不可恢复。')) {
          this.resetSettings();
        }
      });
    }
    
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
    if (this.elements.bgImageUpload) {
      this.elements.bgImageUpload.addEventListener('click', () => {
        if (this.elements.bgImageInput) this.elements.bgImageInput.click();
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
    }
    
    if (this.elements.bgImageInput) {
      this.elements.bgImageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleBgImageUpload(e.target.files[0]);
        }
      });
    }
    
    // 移除背景图片
    if (this.elements.removeBgImage) {
      this.elements.removeBgImage.addEventListener('click', () => {
        this.removeBgImage();
      });
    }
    
    // 背景音乐上传
    if (this.elements.bgAudioUpload) {
      this.elements.bgAudioUpload.addEventListener('click', () => {
        if (this.elements.bgAudioInput) this.elements.bgAudioInput.click();
      });
    }
    
    if (this.elements.bgAudioInput) {
      this.elements.bgAudioInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleBgAudioUpload(e.target.files[0]);
        }
      });
    }
    
    // 移除背景音乐
    if (this.elements.removeBgAudio) {
      this.elements.removeBgAudio.addEventListener('click', () => {
        this.removeBgAudio();
      });
    }
    
    // 自动保存输入内容
    if (this.elements.aboutTitle) {
      this.elements.aboutTitle.addEventListener('blur', () => {
        StorageManager.setAboutTitle(this.elements.aboutTitle.value);
      });
    }

    // 各模块图片上传事件
    this.bindModuleImageEvents('overview');
    this.bindModuleImageEvents('tech');
    this.bindModuleImageEvents('team');
    this.bindModuleImageEvents('cta');
  },

  // 绑定模块图片上传事件
  bindModuleImageEvents(module) {
    const uploadMap = {
      overview: { upload: 'overviewImageUpload', input: 'overviewImageInput', remove: 'removeOverviewImage', dataKey: 'overview', imageKey: 'image' },
      tech: { upload: 'techImageUpload', input: 'techImageInput', remove: 'removeTechImage', dataKey: 'tech', imageKey: 'image' },
      team: { upload: 'teamImageUpload', input: 'teamImageInput', remove: 'removeTeamImage', dataKey: 'team', imageKey: 'image' },
      cta: { upload: 'ctaBgUpload', input: 'ctaBgInput', remove: 'removeCtaBg', dataKey: 'cta', imageKey: 'backgroundImage' }
    };
    const cfg = uploadMap[module];
    if (!cfg) return;
    const uploadEl = this.elements[cfg.upload];
    const inputEl = this.elements[cfg.input];
    const removeEl = this.elements[cfg.remove];
    if (uploadEl && inputEl) {
      uploadEl.addEventListener('click', () => inputEl.click());
      inputEl.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleModuleImageUpload(module, e.target.files[0]);
        }
      });
    }
    if (removeEl) {
      removeEl.addEventListener('click', () => {
        if (this.data[cfg.dataKey]) {
          this.data[cfg.dataKey][cfg.imageKey] = '';
        }
        this.showModuleImagePreview(module, '');
      });
    }
  },

  // 处理模块图片上传
  async handleModuleImageUpload(module, file) {
    try {
      StorageManager.validateImage(file);
      this.showNotification('正在上传图片...', 'info');
      const result = await ServerStorage.uploadImage(file);
      if (result.success) {
        const dataKey = module === 'cta' ? 'cta' : module;
        const imageKey = module === 'cta' ? 'backgroundImage' : 'image';
        if (!this.data[dataKey]) {
          this.data[dataKey] = {};
        }
        this.data[dataKey][imageKey] = result.url;
        this.showModuleImagePreview(module, result.url);
        this.showNotification('图片上传成功！', 'success');
      }
    } catch (error) {
      this.showNotification('上传失败: ' + error.message, 'error');
    }
    const inputMap = { overview: 'overviewImageInput', tech: 'techImageInput', team: 'teamImageInput', cta: 'ctaBgInput' };
    const inputEl = this.elements[inputMap[module]];
    if (inputEl) inputEl.value = '';
  },

  // 显示模块图片预览
  showModuleImagePreview(module, url) {
    const map = {
      overview: { upload: 'overviewImageUpload', preview: 'overviewImagePreview' },
      tech: { upload: 'techImageUpload', preview: 'techImagePreview' },
      team: { upload: 'teamImageUpload', preview: 'teamImagePreview' },
      cta: { upload: 'ctaBgUpload', preview: 'ctaBgPreview' }
    };
    const cfg = map[module];
    if (!cfg) return;
    const uploadEl = this.elements[cfg.upload];
    const previewEl = this.elements[cfg.preview];
    if (!uploadEl || !previewEl) return;
    if (url) {
      uploadEl.style.display = 'none';
      previewEl.style.display = 'block';
      const img = previewEl.querySelector('img');
      if (img) img.src = url;
    } else {
      uploadEl.style.display = 'flex';
      previewEl.style.display = 'none';
      const img = previewEl.querySelector('img');
      if (img) img.src = '';
    }
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
    if (this.elements.bgImageUpload) this.elements.bgImageUpload.style.display = 'none';
    if (this.elements.bgImagePreview) {
      this.elements.bgImagePreview.style.display = 'block';
      const img = this.elements.bgImagePreview.querySelector('img');
      if (img) img.src = imageData;
    }
  },
  
  // 移除背景图片
  removeBgImage() {
    this.data.bgImage = null;
    if (this.elements.bgImageUpload) this.elements.bgImageUpload.style.display = 'flex';
    if (this.elements.bgImagePreview) {
      this.elements.bgImagePreview.style.display = 'none';
      const img = this.elements.bgImagePreview.querySelector('img');
      if (img) img.src = '';
    }
    if (this.elements.bgImageInput) this.elements.bgImageInput.value = '';
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
    if (this.elements.bgAudioUpload) this.elements.bgAudioUpload.style.display = 'none';
    if (this.elements.bgAudioPreview) this.elements.bgAudioPreview.style.display = 'block';
    
    // 如果有临时URL则播放，否则显示文件信息
    if (audioInfo.url) {
      if (this.elements.bgAudioPlayer) this.elements.bgAudioPlayer.src = audioInfo.url;
    } else {
      // 只显示文件信息，提示用户重新上传
      if (this.elements.bgAudioPlayer) this.elements.bgAudioPlayer.style.display = 'none';
      if (this.elements.bgAudioPreview) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'audio-info';
        infoDiv.innerHTML = `
          <p>已选择: ${audioInfo.name}</p>
          <p class="text-muted">大小: ${(audioInfo.size / 1024 / 1024).toFixed(2)} MB</p>
          <p class="text-muted text-small">（请重新上传以播放）</p>
        `;
        this.elements.bgAudioPreview.appendChild(infoDiv);
      }
    }
  },
  
  // 移除背景音乐
  removeBgAudio() {
    if (this.data.bgAudio && this.data.bgAudio.url) {
      URL.revokeObjectURL(this.data.bgAudio.url);
    }
    this.data.bgAudio = null;
    if (this.elements.bgAudioUpload) this.elements.bgAudioUpload.style.display = 'flex';
    if (this.elements.bgAudioPreview) this.elements.bgAudioPreview.style.display = 'none';
    if (this.elements.bgAudioPlayer) this.elements.bgAudioPlayer.src = '';
    if (this.elements.bgAudioInput) this.elements.bgAudioInput.value = '';
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
  
  // 渲染产品概述编辑器
  renderOverviewEditor() {
    const ov = this.data.overview || this.getDefaultOverview();
    if (this.elements.overviewTitle) this.elements.overviewTitle.value = ov.title;
    if (this.elements.overviewLead) this.elements.overviewLead.value = ov.leadText;
    if (this.elements.solutionTitle) this.elements.solutionTitle.value = ov.solutionTitle;
    if (this.elements.solutionContent) this.elements.solutionContent.value = ov.solutionContent;
    this.showModuleImagePreview('overview', ov.image || '');

    // 渲染痛点列表
    if (this.elements.painPointsList) {
      this.elements.painPointsList.innerHTML = '';
      ov.painPoints.forEach((pp, index) => {
        const div = document.createElement('div');
        div.className = 'advantage-edit';
        div.innerHTML = `
          <div class="advantage-edit-header">痛点 ${index + 1}</div>
          <div class="form-group">
            <label class="form-label">图标</label>
            <input type="text" class="glass-input pp-icon" data-index="${index}" value="${pp.icon}" placeholder="📚">
          </div>
          <div class="form-group">
            <label class="form-label">标题</label>
            <input type="text" class="glass-input pp-title" data-index="${index}" value="${pp.title}" placeholder="标题">
          </div>
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea class="glass-input pp-desc" data-index="${index}" rows="2" placeholder="描述">${pp.desc}</textarea>
          </div>
        `;
        this.elements.painPointsList.appendChild(div);
      });
    }
  },
  
  // 渲染技术架构编辑器
  renderTechEditor() {
    const tech = this.data.tech || this.getDefaultTech();
    if (this.elements.techTitle) this.elements.techTitle.value = tech.title;
    this.showModuleImagePreview('tech', tech.image || '');

    if (this.elements.techCardsList) {
      this.elements.techCardsList.innerHTML = '';
      tech.cards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'advantage-edit';
        div.innerHTML = `
          <div class="advantage-edit-header">技术卡片 ${index + 1}</div>
          <div class="form-group">
            <label class="form-label">卡片标题</label>
            <input type="text" class="glass-input tech-card-title" data-index="${index}" value="${card.title}" placeholder="标题">
          </div>
          <div class="form-group">
            <label class="form-label">列表项（每行一个，用 - 分隔标题和描述）</label>
            <textarea class="glass-input tech-card-items" data-index="${index}" rows="4" placeholder="标题 - 描述">${card.items.join('\n')}</textarea>
          </div>
        `;
        this.elements.techCardsList.appendChild(div);
      });
    }
  },
  
  // 渲染应用场景编辑器
  renderScenariosEditor() {
    const sc = this.data.scenarios || this.getDefaultScenarios();
    if (this.elements.scenariosTitle) this.elements.scenariosTitle.value = sc.title;
    
    if (this.elements.scenariosList) {
      this.elements.scenariosList.innerHTML = '';
      sc.cards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'advantage-edit';
        div.innerHTML = `
          <div class="advantage-edit-header">场景卡片 ${index + 1}</div>
          <div class="form-group">
            <label class="form-label">图标</label>
            <input type="text" class="glass-input sc-icon" data-index="${index}" value="${card.icon}" placeholder="📖">
          </div>
          <div class="form-group">
            <label class="form-label">标题</label>
            <input type="text" class="glass-input sc-title" data-index="${index}" value="${card.title}" placeholder="标题">
          </div>
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea class="glass-input sc-desc" data-index="${index}" rows="2" placeholder="描述">${card.desc}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">标签（用逗号分隔）</label>
            <input type="text" class="glass-input sc-tags" data-index="${index}" value="${card.tags.join(', ')}" placeholder="标签1, 标签2">
          </div>
        `;
        this.elements.scenariosList.appendChild(div);
      });
    }
  },
  
  // 渲染团队介绍编辑器
  renderTeamEditor() {
    const team = this.data.team || this.getDefaultTeam();
    if (this.elements.teamTitle) this.elements.teamTitle.value = team.title;
    if (this.elements.teamName) this.elements.teamName.value = team.name;
    if (this.elements.teamDesc) this.elements.teamDesc.value = team.desc;
    this.showModuleImagePreview('team', team.image || '');

    if (this.elements.teamStatsList) {
      this.elements.teamStatsList.innerHTML = '';
      team.stats.forEach((stat, index) => {
        const div = document.createElement('div');
        div.className = 'advantage-edit';
        div.innerHTML = `
          <div class="advantage-edit-header">统计数据 ${index + 1}</div>
          <div class="form-group" style="display:flex;gap:12px;">
            <div style="flex:1">
              <label class="form-label">数字</label>
              <input type="text" class="glass-input stat-number" data-index="${index}" value="${stat.number}" placeholder="25年">
            </div>
            <div style="flex:1">
              <label class="form-label">标签</label>
              <input type="text" class="glass-input stat-label" data-index="${index}" value="${stat.label}" placeholder="虚拟经验">
            </div>
          </div>
        `;
        this.elements.teamStatsList.appendChild(div);
      });
    }
  },

  // 渲染CTA编辑器
  renderCTAEditor() {
    const cta = this.data.cta || this.getDefaultCTA();
    if (this.elements.ctaTitle) this.elements.ctaTitle.value = cta.title;
    if (this.elements.ctaDesc) this.elements.ctaDesc.value = cta.desc;
    if (this.elements.ctaButton) this.elements.ctaButton.value = cta.buttonText;
    this.showModuleImagePreview('cta', cta.backgroundImage || '');
  },
  
  // 更新产品概述数据
  updateOverview() {
    const icons = this.elements.painPointsList.querySelectorAll('.pp-icon');
    const titles = this.elements.painPointsList.querySelectorAll('.pp-title');
    const descs = this.elements.painPointsList.querySelectorAll('.pp-desc');
    const prevImage = this.data.overview ? (this.data.overview.image || '') : '';

    this.data.overview = {
      title: this.elements.overviewTitle.value,
      leadText: this.elements.overviewLead.value,
      painPoints: Array.from(titles).map((_, index) => ({
        icon: icons[index]?.value || '📚',
        title: titles[index]?.value || '',
        desc: descs[index]?.value || ''
      })),
      solutionTitle: this.elements.solutionTitle.value,
      solutionContent: this.elements.solutionContent.value,
      image: prevImage
    };
  },

  // 更新技术架构数据
  updateTech() {
    const titles = this.elements.techCardsList.querySelectorAll('.tech-card-title');
    const items = this.elements.techCardsList.querySelectorAll('.tech-card-items');
    const prevImage = this.data.tech ? (this.data.tech.image || '') : '';

    this.data.tech = {
      title: this.elements.techTitle.value,
      cards: Array.from(titles).map((title, index) => ({
        title: title.value,
        items: (items[index]?.value || '').split('\n').filter(l => l.trim())
      })),
      image: prevImage
    };
  },

  // 更新应用场景数据
  updateScenarios() {
    const icons = this.elements.scenariosList.querySelectorAll('.sc-icon');
    const titles = this.elements.scenariosList.querySelectorAll('.sc-title');
    const descs = this.elements.scenariosList.querySelectorAll('.sc-desc');
    const tags = this.elements.scenariosList.querySelectorAll('.sc-tags');

    this.data.scenarios = {
      title: this.elements.scenariosTitle.value,
      cards: Array.from(titles).map((_, index) => ({
        icon: icons[index]?.value || '📖',
        title: titles[index]?.value || '',
        desc: descs[index]?.value || '',
        tags: (tags[index]?.value || '').split(',').map(t => t.trim()).filter(t => t)
      }))
    };
  },

  // 更新团队介绍数据
  updateTeam() {
    const numbers = this.elements.teamStatsList.querySelectorAll('.stat-number');
    const labels = this.elements.teamStatsList.querySelectorAll('.stat-label');
    const prevImage = this.data.team ? (this.data.team.image || '') : '';

    this.data.team = {
      title: this.elements.teamTitle.value,
      name: this.elements.teamName.value,
      desc: this.elements.teamDesc.value,
      stats: Array.from(numbers).map((num, index) => ({
        number: num.value,
        label: labels[index]?.value || ''
      })),
      image: prevImage
    };
  },

  // 更新CTA数据
  updateCTA() {
    const prevBg = this.data.cta ? (this.data.cta.backgroundImage || '') : '';
    this.data.cta = {
      title: this.elements.ctaTitle.value,
      desc: this.elements.ctaDesc.value,
      buttonText: this.elements.ctaButton.value,
      backgroundImage: prevBg
    };
  },

  // 保存所有设置到服务器
  async saveSettings() {
    try {
      this.showNotification('正在保存到服务器...', 'info');

      // 更新各模块数据
      this.updateAdvantages();
      this.updateOverview();
      this.updateTech();
      this.updateScenarios();
      this.updateTeam();
      this.updateCTA();

      // 构建配置对象
      const config = {
        theme: this.data.theme,
        backgroundImage: this.data.bgImage || '',
        backgroundAudio: this.data.bgAudio?.url || '',
        aboutTitle: this.elements.aboutTitle ? this.elements.aboutTitle.value : '老张工艺助手',
        advantages: this.data.advantages,
        overview: this.data.overview,
        tech: this.data.tech,
        scenarios: this.data.scenarios,
        team: this.data.team,
        cta: this.data.cta,
        chatMode: this.data.chatMode,
        iframeUrl: this.elements.iframeUrlInput ? this.elements.iframeUrlInput.value : ''
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
    this.setDefaultData();
    
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
