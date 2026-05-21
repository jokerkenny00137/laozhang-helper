/**
 * chat.js - 老张工艺助手对话功能
 * 支持三种模式：
 * 1. iframe嵌入模式（推荐，免费）- 使用腾讯元器官方嵌入代码
 * 2. API调用模式 - 直接调用腾讯元器API（需要解决跨域）
 * 3. 模拟回复模式（演示用）- 本地预设回复
 */

// ==================== 对话管理器 ====================

const ChatManager = {
  // DOM元素
  messagesContainer: null,
  inputElement: null,
  sendButton: null,
  clearButton: null,
  
  // 状态
  isTyping: false,
  currentConversation: [],
  typingInterval: null,
  
  // API配置（腾讯元器）
  // ⚠️ 安全提示：不要在代码中硬编码敏感信息！
  // 这些配置将从 window.appConfig（config.js）动态加载
  apiConfig: {
    url: 'https://open.hunyuan.tencent.com/openapi/v1/agent/chat/completions',
    appKey: '',
    assistantId: '',
    userId: ''
  },
  
  // 初始化 API 配置（从全局配置加载）
  initApiConfig() {
    // 优先从 window.appConfig 加载
    if (typeof window !== 'undefined' && window.appConfig?.YUANQI) {
      this.apiConfig = {
        url: 'api/chat-proxy.php', // 使用后端代理解决跨域
        appKey: '', // 代理模式下不需要前端配置 key
        assistantId: window.appConfig.YUANQI.ASSISTANT_ID || '',
        userId: window.appConfig.YUANQI.USER_ID || ''
      };
    }
    
    // 检查是否配置了 Assistant ID
    if (!this.apiConfig.assistantId) {
      console.warn('Assistant ID 未配置，API 模式将不可用。请在 config.js 中配置 YUANQI.ASSISTANT_ID');
    }
  },
  
    // 获取配置（优先从服务器配置读取，其次 localStorage，最后默认值）
  getConfig() {
    const serverConfig = window.serverConfig || {};
    const chatMode = serverConfig.chatMode || localStorage.getItem('lz_chat_mode') || 'api';
    
    // 获取 iframe URL：服务器配置 > localStorage > 全局配置 > 空字符串
    const defaultIframeUrl = (typeof window !== 'undefined' && window.appConfig?.DEFAULT_IFRAME_URL) || '';
    const iframeUrl = serverConfig.iframeUrl 
      || localStorage.getItem('lz_iframe_url') 
      || defaultIframeUrl;

    return {
      mode: chatMode,
      iframe: {
        url: iframeUrl,
        containerId: 'yuanqi-iframe-container'
      }
    };
  },
  
  // 初始化
  init() {
    this.messagesContainer = document.getElementById('chatMessages');
    this.inputElement = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendBtn');
    this.clearButton = document.getElementById('clearChatBtn');
    
    if (!this.messagesContainer) return;
    
    // 初始化 API 配置（从全局配置加载）
    this.initApiConfig();
    
    // 获取配置
    const config = this.getConfig();
    
    // 根据模式初始化
    if (config.mode === 'iframe' && config.iframe.url) {
      this.initIframeMode();
    } else if (config.mode === 'api') {
      this.initApiMode();
    } else {
      this.initMockMode();
    }
  },
  
  // ========== iframe嵌入模式 ==========
  
  initIframeMode() {
    console.log('使用iframe嵌入模式');
    
    // 隐藏原有的输入区域
    const inputArea = document.querySelector('.chat-input-area');
    if (inputArea) {
      inputArea.style.display = 'none';
    }
    
    // 清空消息区域
    this.messagesContainer.innerHTML = '';
    
    // 获取配置
    const config = this.getConfig();
    
    // 创建iframe容器
    const iframeContainer = document.createElement('div');
    iframeContainer.id = config.iframe.containerId;
    iframeContainer.style.cssText = `
      width: 100%;
      height: 650px;
      border: none;
      overflow: hidden;
      border-radius: 12px;
    `;
    
    // 创建iframe
    const iframe = document.createElement('iframe');
    iframe.src = config.iframe.url;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      min-height: 650px;
      border: none;
      border-radius: 12px;
    `;
    iframe.allow = 'microphone';
    iframe.scrolling = 'auto';
    
    iframeContainer.appendChild(iframe);
    this.messagesContainer.appendChild(iframeContainer);
    
    // 修改头部提示
    const headerStatus = document.querySelector('.chat-header-status span:last-child');
    if (headerStatus) {
      headerStatus.textContent = '腾讯元器';
    }
  },
  
  // ========== API调用模式 ==========
  
  initApiMode() {
    console.log('使用API调用模式');
    
    if (!this.inputElement) return;
    
    // 显示API模式标识
    const headerStatus = document.querySelector('.chat-header-status span:last-child');
    if (headerStatus) {
      headerStatus.textContent = 'AI引擎';
    }
    
    // 绑定事件
    this.bindEvents();
    
    // 加载历史对话
    this.loadHistory();
    
    // 自动调整输入框高度
    this.initAutoResize();
    
    // 添加系统提示
    this.addSystemMessage('👋 我是老张！正在使用AI引擎为您服务。');
  },
  
  // 添加系统消息
  addSystemMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-message ai';
    div.innerHTML = `
      <div class="chat-avatar">张</div>
      <div class="chat-bubble">
        <p>${text}</p>
      </div>
    `;
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
  },
  
  // 调用腾讯元器API
  async callYuanqiAPI(message) {
    try {
      this.showTypingIndicator();
      
      console.log('调用API:', this.apiConfig.url);
      console.log('Assistant ID:', this.apiConfig.assistantId);
      
      // 将message转换为数组格式
      const messageText = typeof message === 'string' ? message : String(message);
      
      const requestBody = {
        assistant_id: this.apiConfig.assistantId,
        user_id: this.apiConfig.userId,
        stream: false,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: messageText
              }
            ]
          }
        ]
      };
      
      console.log('请求体:', requestBody);
      
      const response = await fetch(this.apiConfig.url, {
        method: 'POST',
        headers: {
          'X-Source': 'openapi',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiConfig.appKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      this.removeTypingIndicator();
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API错误:', response.status, errorText);
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API完整响应:', JSON.stringify(data, null, 2));
      
      // 解析回复内容 - 根据腾讯元器API格式
      let reply = '';
      
      // 尝试多种可能的响应格式
      if (data.choices && data.choices[0]) {
        const choice = data.choices[0];
        if (choice.message && choice.message.content) {
          const content = choice.message.content;
          if (Array.isArray(content)) {
            reply = content.map(item => {
              if (typeof item === 'string') return item;
              return item.text || item.value || '';
            }).join('');
          } else if (typeof content === 'string') {
            reply = content;
          }
        } else if (choice.text) {
          reply = choice.text;
        }
      } else if (data.output && data.output.text) {
        reply = data.output.text;
      } else if (data.result) {
        reply = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
      } else if (data.message && typeof data.message === 'string') {
        reply = data.message;
      } else if (data.data && data.data.text) {
        reply = data.data.text;
      }
      
      // 如果仍然没有解析到内容，显示原始响应供调试
      if (!reply || reply.trim() === '') {
        console.warn('无法解析API响应，原始数据:', data);
        reply = '抱歉，我暂时无法回答这个问题。响应格式：' + JSON.stringify(data).substring(0, 100) + '...';
      }
      
      // 使用打字机效果显示回复
      this.typeMessage(reply);
      
    } catch (error) {
      console.error('API调用失败:', error);
      this.removeTypingIndicator();
      
      // 如果API调用失败，使用模拟回复
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        console.log('API调用失败，切换到模拟回复');
        const mockResponse = this.getMockResponse(message);
        this.typeMessage(mockResponse + '\n\n*(提示：API连接失败，当前为模拟回复)*');
      } else {
        this.addAIMessage('抱歉，服务器出了点小问题，请稍后再试。错误：' + error.message);
      }
    }
  },
  
  // ========== 模拟回复模式 ==========
  
  initMockMode() {
    console.log('使用模拟回复模式');
    
    if (!this.inputElement) return;
    
    // 绑定事件
    this.bindEvents();
    
    // 加载历史对话
    this.loadHistory();
    
    // 自动调整输入框高度
    this.initAutoResize();
  },
  
  // 绑定事件
  bindEvents() {
    // 发送按钮点击
    if (this.sendButton) {
      this.sendButton.addEventListener('click', () => this.sendMessage());
    }
    
    // 输入框回车发送
    if (this.inputElement) {
      this.inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
    
    // 清空按钮
    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => this.clearChat());
    }
  },
  
  // 自动调整输入框高度
  initAutoResize() {
    if (!this.inputElement) return;
    
    this.inputElement.addEventListener('input', () => {
      this.inputElement.style.height = 'auto';
      this.inputElement.style.height = Math.min(
        this.inputElement.scrollHeight,
        120
      ) + 'px';
    });
  },
  
  // 发送消息
  async sendMessage() {
    if (this.isTyping) return;
    
    const message = this.inputElement.value.trim();
    if (!message) return;
    
    // 添加用户消息
    this.addUserMessage(message);
    
    // 清空输入框
    this.inputElement.value = '';
    this.inputElement.style.height = 'auto';
    
    // 显示loading状态
    this.showTypingIndicator();
    
    // 根据模式调用不同的API
    const config = this.getConfig();
    
    try {
      if (config.mode === 'api') {
        // API模式：调用腾讯元器API
        await this.callYuanqiAPI(message);
      } else {
        // 模拟模式：使用本地回复
        await this.callMockAPI(message);
      }
    } catch (error) {
      console.error('回复生成失败:', error);
      this.removeTypingIndicator();
      this.addAIMessage('抱歉，出了点小问题，请稍后再试。');
    }
    
    // 保存对话历史
    this.saveHistory();
  },
  
  // 模拟API调用
  async callMockAPI(message) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    
    this.removeTypingIndicator();
    
    // 获取模拟回复
    const mockResponse = this.getMockResponse(message);
    
    // 使用打字机效果显示回复
    this.typeMessage(mockResponse);
  },
  
  // 获取模拟回复
  getMockResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // 关键词匹配
    if (lowerMessage.includes('车削') || lowerMessage.includes('车床')) {
      return `车削啊，这是最基础的加工方法了。

**车削**就是在车床上让工件旋转，然后用车刀去切削它。主要用来加工回转体零件，比如轴、盘、套这些。

**关键要点：**
• 工件旋转是主运动，车刀移动是进给运动
• 粗车留量半毫米，精车一刀走到底
• 45钢车削速度一般80-120米/分钟
• 注意冷却液要充足，否则刀具磨损快

你要是想学具体操作，我可以给你推荐几个B站上的实战视频，跟着老师傅学最快！`;
    }
    
    if (lowerMessage.includes('铣削') || lowerMessage.includes('铣床')) {
      return `铣削跟车削正好相反！

**铣削**是刀具旋转，工件移动。铣刀像齿轮一样转，工件慢慢送进去。适合加工平面、沟槽、齿轮、曲面这些。

**常见铣刀类型：**
• 端铣刀 - 加工平面
• 立铣刀 - 加工沟槽、型腔
• 三面刃铣刀 - 加工台阶面
• 成形铣刀 - 加工特殊形状

**老师傅提醒：**
铣削时振动比较大，工件一定要夹紧！进给速度要根据刀具直径和材料来调整，不能太快。`;
    }
    
    if (lowerMessage.includes('钻') || lowerMessage.includes('孔')) {
      return `钻孔是机械加工的基本功！

**麻花钻**是最常用的钻头，两刃对称，中间有横刃。钻的时候要加冷却液，特别是钻钢件。

**钻孔要点：**
• 钻头要先对准中心，不能偏
• 转速要根据钻头直径调整，大钻头要慢
• 要经常退刀排屑，不然钻头容易卡死
• 钻深孔要分几次，不能一次钻到底

**小技巧：** 钻盲孔的时候，深度要算准，钻头尖头是118度，不是平的，所以深度要比实际深一点。`;
    }
    
    if (lowerMessage.includes('淬火') || lowerMessage.includes('热处理')) {
      return `淬火！这可是提高硬度的关键工序。

**淬火**就是把钢加热到一定温度（一般是780-860°C），然后快速冷却。常用的冷却介质有水、油、盐水。

**常见热处理工艺：**
• 淬火 - 提高硬度
• 回火 - 消除淬火应力，调整硬度
• 正火 - 改善组织，细化晶粒
• 退火 - 软化材料，便于加工

**老师傅经验：**
淬火后一定要回火！不然工件太脆，容易开裂。回火温度越高，硬度越低，韧性越好。45钢淬火后硬度能达到HRC55-60，回火后根据用途调整。

你要是想学具体工艺参数，可以看看《热处理手册》，或者去车间跟着老师傅实操几次就明白了。`;
    }
    
    if (lowerMessage.includes('45钢') || lowerMessage.includes('45#')) {
      return `45钢！这是最常用的中碳钢了，新手必学。

**45钢特性：**
• 含碳量0.45%，属于中碳钢
• 强度高，韧性好，容易加工
• 热处理后硬度能到HRC55-60

**加工工艺路线：**
1. 下料
2. 粗车（留2-3mm余量）
3. 调质处理（提高综合性能）
4. 精车（达到尺寸要求）
5. 需要高硬度的部位淬火+回火

**切削参数参考：**
• 粗车：转速300-500转/分，进给0.2-0.4mm/转
• 精车：转速800-1200转/分，进给0.05-0.1mm/转

45钢用YW1或YT15硬质合金刀具最合适，切削液用乳化液就行。`;
    }
    
    if (lowerMessage.includes('磨削') || lowerMessage.includes('砂轮')) {
      return `磨削是精密加工，尺寸精度能达到IT6-IT5！

**磨削特点：**
• 尺寸精度高，表面质量好
• 适合加工淬硬钢件
• 切削深度小（0.005-0.05mm）

**常用砂轮：**
• 白刚玉(WA) - 磨削淬硬钢
• 棕刚玉(A) - 磨削未淬硬钢、铸铁
• 碳化硅(C) - 磨削铸铁、有色金属

**安全提醒：**
砂轮转速很高，装好后一定要试转！防护罩不能拆，站在砂轮侧面操作，别站正面。

平面磨、外圆磨、内圆磨各有各的技巧，你想学哪种？`;
    }
    
    if (lowerMessage.includes('铸造') || lowerMessage.includes('锻造')) {
      return `铸造和锻造是毛坯制造的基本方法。

**铸造：** 把金属熔化后倒入模具冷却成型
• 适合形状复杂的零件
• 成本较低，适合批量生产
• 常见的有砂型铸造、精密铸造、压铸

**锻造：** 用锤或压力机对金属施加压力成形
• 内部组织致密，力学性能好
• 适合承受重载的零件
• 自由锻、模锻、精密模锻

**老师傅建议：**
学机加首先要懂毛坯是怎么来的，这样你才知道加工余量留多少、怎么装夹。铸造件表面硬，第一刀要轻；锻件性能好，但形状不规则，找正比较麻烦。

你们学校有铸造实训吗？亲手浇一次铁水印象特别深！`;
    }
    
    // 默认回复
    return `这个问题问得好！老张干了25年，这类问题见得多了。

你可以问得更具体一些，比如：
• 某种材料怎么加工（如45钢、铝合金、不锈钢）
• 某种工艺的原理和参数（如车削、铣削、热处理）
• 具体的加工问题（如刀具选择、切削参数）
• 推荐学习资源（如视频教程、书籍）

老师傅的经验就是要多问、多练、多总结。你想了解哪方面的内容？`;
  },
  
  // 添加用户消息
  addUserMessage(content) {
    const messageData = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      type: 'user',
      content: content,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    
    this.currentConversation.push(messageData);
    
    const div = document.createElement('div');
    div.className = 'chat-message user';
    div.id = `msg-${messageData.id}`;
    div.innerHTML = `
      <div class="chat-avatar">我</div>
      <div class="chat-bubble">
        <p>${this.escapeHtml(content)}</p>
      </div>
    `;
    
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
  },
  
  // 添加AI消息（打字机效果）
  addAIMessage(content) {
    const messageData = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      type: 'ai',
      content: content,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    
    this.currentConversation.push(messageData);
    
    const div = document.createElement('div');
    div.className = 'chat-message ai';
    div.id = `msg-${messageData.id}`;
    div.innerHTML = `
      <div class="chat-avatar">张</div>
      <div class="chat-bubble"><div class="message-content"></div></div>
    `;
    
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
    
    return messageData.id;
  },
  
  // 打字机效果显示消息
  typeMessage(content) {
    this.isTyping = true;
    
    const messageId = this.addAIMessage('');
    const messageEl = document.querySelector(`#msg-${messageId} .message-content`);
    
    if (!messageEl) {
      this.isTyping = false;
      return;
    }
    
    // 先将Markdown转换为HTML
    const htmlContent = this.renderMarkdown(content);
    
    // 临时容器来存储完整HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // 获取纯文本用于打字效果
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    let index = 0;
    const speed = 25; // 打字速度（毫秒/字符）
    
    this.typingInterval = setInterval(() => {
      if (index < textContent.length) {
        messageEl.textContent = textContent.substring(0, index + 1);
        index++;
        this.scrollToBottom();
      } else {
        clearInterval(this.typingInterval);
        this.typingInterval = null;
        this.isTyping = false;
        
        // 打字完成后，显示完整的Markdown格式
        messageEl.innerHTML = htmlContent;
        
        // 更新消息内容
        const msgData = this.currentConversation.find(m => m.id === messageId);
        if (msgData) {
          msgData.content = content;
        }
        
        this.saveHistory();
      }
    }, speed);
  },
  
  // 渲染Markdown
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
  },
  
  // 转义HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  // 显示打字指示器
  showTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'chat-message ai';
    div.id = 'typing-indicator';
    div.innerHTML = `
      <div class="chat-avatar">张</div>
      <div class="chat-bubble">
        <div class="chat-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    this.messagesContainer.appendChild(div);
    this.scrollToBottom();
  },
  
  // 移除打字指示器
  removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  },
  
  // 滚动到底部
  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  },
  
  // 清空对话
  clearChat() {
    if (this.isTyping) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
      this.isTyping = false;
    }
    
    this.currentConversation = [];
    sessionStorage.removeItem('chatHistory');
    
    // 保留欢迎消息
    this.messagesContainer.innerHTML = `
      <div class="chat-message ai">
        <div class="chat-avatar">张</div>
        <div class="chat-bubble">
          <p>👋 小伙子/姑娘，我是老张！干了25年机加，车铣钻磨、铸锻焊、热处理这些我都门儿清。</p>
          <p>有啥工艺问题尽管问我，比如：</p>
          <p>• "车削和铣削有什么区别？"</p>
          <p>• "淬火和回火有啥用？"</p>
          <p>• "45钢怎么加工最省事？"</p>
        </div>
      </div>
    `;
  },
  
  // 保存对话历史
  saveHistory() {
    try {
      sessionStorage.setItem('chatHistory', JSON.stringify(this.currentConversation));
    } catch (e) {
      console.error('保存对话历史失败:', e);
    }
  },
  
  // 加载对话历史
  loadHistory() {
    try {
      const history = sessionStorage.getItem('chatHistory');
      if (history) {
        this.currentConversation = JSON.parse(history);
        this.renderHistory();
      }
    } catch (e) {
      console.error('加载对话历史失败:', e);
    }
  },
  
  // 渲染历史消息
  renderHistory() {
    if (this.currentConversation.length === 0) return;
    
    this.messagesContainer.innerHTML = '';
    
    this.currentConversation.forEach(msg => {
      if (msg.type === 'user') {
        const div = document.createElement('div');
        div.className = 'chat-message user';
        div.id = `msg-${msg.id}`;
        div.innerHTML = `
          <div class="chat-avatar">我</div>
          <div class="chat-bubble">
            <p>${this.escapeHtml(msg.content)}</p>
          </div>
        `;
        this.messagesContainer.appendChild(div);
      } else {
        const div = document.createElement('div');
        div.className = 'chat-message ai';
        div.id = `msg-${msg.id}`;
        div.innerHTML = `
          <div class="chat-avatar">张</div>
          <div class="chat-bubble">
            <div class="message-content">${this.renderMarkdown(msg.content)}</div>
          </div>
        `;
        this.messagesContainer.appendChild(div);
      }
    });
    
    this.scrollToBottom();
  }
};

// ==================== 页面加载完成后初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  ChatManager.init();
});
