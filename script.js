// script.js 

class ChatManager {
    constructor() {
        this.currentCharacterId = null;
        this.currentCharacter = null;
        this.currentUserProfile = null;
        this.chatHistory = [];
        this.allChats = {};
        this.isAITyping = false;
        this.waitingMessages = []; // 用于暂存消息的数组

        // 这些元素在 DOMContentLoaded 后才会被赋值
        this.chatArea = null;
        this.chatInput = null;
        this.sendButton = null;
        this.headerName = null;
        this.chatPage = null;
        this.chatInputBar = null;
        this.batchSendActions = null;
        this.btnWaitSend = null;
        this.btnConfirmSend = null;
        
        // [新增]
        this.smileIcon = null;
        this.emojiPanel = null;
    }

    init() {
        this.chatArea = document.querySelector('#page-chat-interface .chat-area');
        this.chatInput = document.getElementById('chat-textarea');
        this.sendButton = document.getElementById('chat-send-btn');
        this.headerName = document.getElementById('chat-interface-char-name');
        this.chatPage = document.getElementById('page-chat-interface');
        this.chatInputBar = document.querySelector('#page-chat-interface .chat-input-bar');

        // 获取批量发送按钮元素
        this.batchSendActions = document.getElementById('batch-send-actions');
        this.btnWaitSend = document.getElementById('btn-wait-send');
        this.btnConfirmSend = document.getElementById('btn-confirm-send');
        
        // [新增]
        this.smileIcon = document.getElementById('chat-smile-icon');
        this.emojiPanel = document.getElementById('emoji-panel');

        this.loadChatHistory();
        this.setupChatInterface();
        this.bindEvents();
    }

    // ===== 数据管理 =====
    loadChatHistory() {
        const saved = localStorage.getItem('felotus_chat_history');
        if (saved) {
            try { this.allChats = JSON.parse(saved); } catch (e) { this.allChats = {}; }
        }
    }

    saveChatHistory() {
        localStorage.setItem('felotus_chat_history', JSON.stringify(this.allChats));
    }

// script.js -> class ChatManager

// 找到这个方法...
// ===== 聊天界面管理 =====
openChat(characterId, characterData, userProfile) {
    this.currentCharacterId = characterId;
    this.currentCharacter = characterData;
    this.currentUserProfile = userProfile;
    
    // 清理旧状态
    this.waitingMessages = []; 
    this.toggleBatchActions(false);
    if(this.chatInput) this.chatInput.value = '';

    this.chatHistory = this.allChats[characterId] || [];

    // ««« [新增] 从历史记录中恢复“等待中”的消息队列
    this.waitingMessages = this.chatHistory.filter(msg => msg.status === 'waiting');
    if (this.waitingMessages.length > 0) {
        this.toggleBatchActions(true); // 如果有等待消息，则显示按钮
    }
    
    if (this.chatHistory.length === 0) {
        this.addWelcomeMessage();
    }
    
    this.renderChatHistory();
    this.updateChatHeader();
    if(this.chatPage) this.chatPage.classList.add('active');
}

    // ==================== [新增] 收起表情面板的专用方法 ====================
closeEmojiPanel() {
    if (this.emojiPanel && this.emojiPanel.classList.contains('visible')) {
        this.emojiPanel.classList.remove('visible');
        // [移除] 不再需要切换 keyboard-mode 类
        this.smileIcon.classList.remove('active');
    }
}
// ======================================================================

addWelcomeMessage() {
        const welcomeMessage = {
            id: Date.now(),
            type: 'received',
            content: '你好呀！我们已经是好友了，现在开始聊天吧！',
            timestamp: new Date().toISOString(),
            avatar: this.currentCharacter.avatar
        };
        this.chatHistory.push(welcomeMessage);
        this.saveCurrentChat();
    }

    // ===== 新增的批量发送相关方法 (已移至正确位置) =====

    // 控制“等待/确认”按钮的显示和隐藏
    toggleBatchActions(show) {
        if (!this.batchSendActions) return;
        if (show) {
            this.batchSendActions.classList.add('visible');
        } else {
            this.batchSendActions.classList.remove('visible');
        }
    }

    // “等待”按钮的逻辑
    // script.js -> class ChatManager

// 找到这个方法...
// “等待”按钮的逻辑
waitAndSend() {
    if (!this.chatInput) return;
    const content = this.chatInput.value.trim();
    if (!content) return;

    const userMessage = {
        id: Date.now(),
        type: 'sent',
        content: content,
        timestamp: new Date().toISOString(),
        avatar: this.currentUserProfile.avatar || 'https://i.imgur.com/uG2g8xX.png',
        status: 'waiting' // ««« [新增] 给消息打上“等待中”的标记
    };

    this.chatHistory.push(userMessage);
    this.waitingMessages.push(userMessage);

    this.saveCurrentChat();
    this.appendMessageToUI(userMessage);
    this.chatInput.value = '';
    
    const event = new Event('input', { bubbles: true });
    this.chatInput.dispatchEvent(event);
    this.chatInput.focus(); // 让输入框保持焦点，方便连续输入
}

// script.js -> class ChatManager

// 找到这个方法...
// “确认”按钮的逻辑
async confirmAndSendBatch() {
    // 如果输入框里还有内容，先把它作为最后一条消息“等待”
    if (this.chatInput && this.chatInput.value.trim()) {
        this.waitAndSend();
    }

    if (this.waitingMessages.length === 0) return;

    this.toggleBatchActions(false);

    const combinedContent = this.waitingMessages.map(msg => msg.content).join('\n\n');
    const messageContext = {
        character: this.currentCharacter,
        userProfile: this.currentUserProfile,
        chatHistory: this.chatHistory.slice(0, -this.waitingMessages.length)
    };

    this.showTypingIndicator();
    this.isAITyping = true;

    try {
        const aiResponse = await this.callAI(combinedContent, messageContext);
        
        // 在得到AI回复后，清理已发送消息的状态
        this.waitingMessages.forEach(msg => delete msg.status);

        // ««« [核心修改开始] »»»

        // 1. 使用正则表达式按换行符分割AI的回复
        const messages = aiResponse.split(/\n+/).filter(m => m.trim() !== '');

        // 2. 隐藏“正在输入”提示
        this.hideTypingIndicator();

        // 3. 如果没有有效消息，则直接返回
        if (messages.length === 0) {
            this.saveCurrentChat(); // 即使AI没回复，也要保存用户消息的状态
            return;
        }

        // 4. 遍历分割后的消息，并逐条显示
        for (const [index, content] of messages.entries()) {
            const aiMessage = {
                id: Date.now() + index + 1, // 确保ID唯一
                type: 'received',
                content: content.trim(),
                timestamp: new Date().toISOString(),
                avatar: messageContext.character.avatar
            };
            
            // 将每一条小消息都存入历史记录
            this.chatHistory.push(aiMessage);

            // 加入一个200ms到700ms的随机延迟，模拟打字间隔
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
            
            // 在UI上显示这条消息
            this.appendMessageToUI(aiMessage);
        }

        // 5. 所有消息都显示完毕后，保存一次完整的聊天记录
        this.saveCurrentChat();

        // ««« [核心修改结束] »»»

    } catch (error) {
        console.error('AI调用失败:', error);
        const errorMessage = {
            id: Date.now() + 1,
            type: 'received',
            content: `抱歉，我现在无法回复。\n错误: ${error.message}`,
            timestamp: new Date().toISOString(),
            avatar: messageContext.character.avatar,
            isError: true
        };
        this.hideTypingIndicator();
        this.appendMessageToUI(errorMessage);
    } finally {
        this.isAITyping = false;
        this.waitingMessages = []; // 清空等待队列
    }
}


    // ===== AI接口调用 =====
    async callAI(userMessage, messageContext) {
        const apiSettings = this.getAPISettings();
        if (!apiSettings || !apiSettings.apiKey || !apiSettings.model) {
            throw new Error('API配置不完整');
        }

        const prompt = this.buildPrompt(userMessage, messageContext);
        
        if (apiSettings.type === 'openai') {
            return await this.callOpenAI(apiSettings, prompt);
        } else if (apiSettings.type === 'gemini') {
            return await this.callGemini(apiSettings, prompt);
        } else {
            throw new Error('不支持的API类型');
        }
    }

    buildPrompt(userMessage, messageContext) {
        const { character, userProfile, chatHistory } = messageContext;

        let systemPrompt = '';
        if (character?.settings) {
            systemPrompt += `# 角色设定\n${character.settings}\n\n`;
        } else {
            systemPrompt += `# 角色设定\n你是${character.name}，请保持角色的一致性。\n\n`;
        }
        if (userProfile?.settings) {
            systemPrompt += `# 用户设定\n${userProfile.settings}\n\n`;
        }
        systemPrompt += `# 基本信息\n角色名: ${character.name}\n`;
        if (character.gender) systemPrompt += `角色性别: ${character.gender}\n`;
        if (character.age) systemPrompt += `角色年龄: ${character.age}\n`;
        systemPrompt += `用户名: ${userProfile.name}\n`;
        if (userProfile.gender) systemPrompt += `用户性别: ${userProfile.gender}\n`;
        if (userProfile.age) systemPrompt += `用户年龄: ${userProfile.age}\n\n`;

        const recentHistory = chatHistory.slice(-8);
        if (recentHistory.length > 1) {
            systemPrompt += `# 对话历史\n`;
            recentHistory.slice(0, -1).forEach(msg => {
                const speaker = msg.type === 'sent' ? userProfile.name : character.name;
                systemPrompt += `${speaker}: ${msg.content}\n`;
            });
            systemPrompt += `\n`;
        }
        systemPrompt += `请以${character.name}的身份回复${userProfile.name}的消息，保持角色一致性。\n\n`;
        systemPrompt += `${userProfile.name}: ${userMessage}`;
        return systemPrompt;
    }

    async callOpenAI(apiSettings, prompt) {
        const injectSettings = this.getInjectSettings();
        const response = await fetch(`${apiSettings.apiUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiSettings.apiKey}`
            },
            body: JSON.stringify({
                model: apiSettings.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: injectSettings.temperature || 0.7,
                max_tokens: injectSettings.maxResponse || 2000,
                top_p: injectSettings.topP || 0.9,
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
             throw new Error('OpenAI API返回格式错误');
        }
        return data.choices[0].message.content.trim();
    }

    async callGemini(apiSettings, prompt) {
        const injectSettings = this.getInjectSettings();
        const response = await fetch(
            `${apiSettings.apiUrl}/models/${apiSettings.model}:generateContent?key=${apiSettings.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: injectSettings.temperature || 0.7,
                        maxOutputTokens: injectSettings.maxResponse || 2000,
                        topP: injectSettings.topP || 0.9
                    }
                })
            }
        );
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Gemini API返回格式错误');
        }
        return data.candidates[0].content.parts[0].text.trim();
    }

    // ===== UI界面更新 =====
    renderChatHistory() {
        if (!this.chatArea) return;
        this.chatArea.innerHTML = '';
        this.chatHistory.forEach(message => { this.appendMessageToUI(message, false); });
        this.scrollToBottom();
    }

// ==================== [新增] 渲染聊天底部表情面板的方法 ====================
// ===== UI界面更新 =====
// ...
renderEmojiPanel() {
    // 找到小面板里的网格容器
    const panelGrid = this.emojiPanel?.querySelector('.emoji-grid');
    if (!panelGrid) return;

    // 1. 清空旧内容
    panelGrid.innerHTML = '';

    // 2. 创建“+”号按钮，用于打开管理页面
    const openManagerBtn = document.createElement('div');
    openManagerBtn.className = 'emoji-item';
    openManagerBtn.id = 'btn-open-emoji-management';
    openManagerBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    
    // 【核心修复】在这里直接绑定事件，打开管理页并调用渲染函数
    openManagerBtn.addEventListener('click', () => {
        const emojiManagementPage = document.getElementById('page-emoji-management');
        if (emojiManagementPage) {
            // 在打开页面前，先调用全局的渲染函数
            // 注意：renderEmojiManagementGrid() 是我们在下面定义的全局函数
            if (typeof renderEmojiManagementGrid === 'function') {
                renderEmojiManagementGrid();
            }
            emojiManagementPage.classList.add('active');
            this.closeEmojiPanel(); 
        }
    });
    panelGrid.appendChild(openManagerBtn);

    // 3. 遍历“中央仓库”里的表情数据
    window.appData.emojis.forEach(emoji => {
        const emojiCell = document.createElement('div');
        emojiCell.className = 'emoji-item';
        
        const img = document.createElement('img');
        img.src = emoji.data;
        img.alt = emoji.name;
        emojiCell.appendChild(img);

        // 4. 给每个表情格子添加点击发送事件
        emojiCell.addEventListener('click', () => {
            this.sendEmojiMessage(emoji);
        });

        panelGrid.appendChild(emojiCell);
    });
}
// ...
// ========================================================================

// script.js -> class ChatManager

// ... renderEmojiPanel() 方法 ...

// ==================== [新增] 发送表情包消息的方法 ====================
// script.js -> class ChatManager

// ... 在其他方法之间找到这个方法 ...

// ==================== [修改] 发送表情包消息的方法 ====================
sendEmojiMessage(emoji) {
    if (!this.currentCharacterId) return;

    // 1. 创建一条特殊的消息对象
    const emojiMessage = {
        id: Date.now(),
        type: 'sent', // 是我发送的
        isEmoji: true, // 【关键】标记这是一条表情消息
        content: emoji.data, // 消息内容就是图片的Base64数据
        timestamp: new Date().toISOString(),
        avatar: this.currentUserProfile.avatar || 'https://i.imgur.com/uG2g8xX.png'
    };

    // 2. 更新聊天记录
    this.chatHistory.push(emojiMessage);
    this.saveCurrentChat();

    // 3. 在UI上显示这条新消息
    this.appendMessageToUI(emojiMessage);

    // 4. 【核心修改】根据你的要求，我们注释掉了这一行，这样表情面板就不会自动关闭了
    // this.closeEmojiPanel(); 
}
// ====================================================================

// ... 其他方法保持不变 ...
// ====================================================================


    appendMessageToUI(message, shouldScroll = true) {
        if (!this.chatArea) return;
        const messageElement = this.createMessageElement(message);
        this.chatArea.appendChild(messageElement);
        if (shouldScroll) this.scrollToBottom();
    }

    // [修改] 升级 createMessageElement 方法
createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${message.type} ${message.isError ? 'error' : ''}`;
    messageDiv.dataset.messageId = message.id;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // ==================== [核心修改] ====================
    if (message.isEmoji) {
        // 如果是表情消息
        contentDiv.classList.add('is-emoji-message'); // 添加一个特殊类，用于CSS样式
        const img = document.createElement('img');
        img.src = message.content;
        img.alt = 'emoji';
        img.className = 'message-emoji-img';
        contentDiv.appendChild(img);
    } else {
        // 如果是普通文本消息 (旧逻辑)
        const textP = document.createElement('p');
        textP.textContent = message.content;
        contentDiv.appendChild(textP);
    }
    // ====================================================

    if (message.type === 'received') {
            const avatar = document.createElement('img');
            avatar.src = message.avatar || 'https://i.imgur.com/Jz9v5aB.png';
            avatar.alt = 'avatar';
            avatar.className = 'message-avatar';
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(contentDiv);
        } else if (message.type === 'sent') {
            const avatar = document.createElement('img');
            avatar.src = this.currentUserProfile.avatar || 'https://i.imgur.com/uG2g8xX.png';
            avatar.alt = 'avatar';
            avatar.className = 'message-avatar';
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(avatar);
        }
        
        return messageDiv;
    }

    showTypingIndicator() {
        if (!this.chatArea) return;
        const existingIndicator = this.chatArea.querySelector('.typing-indicator');
        if (existingIndicator) existingIndicator.remove();

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message-bubble received typing-indicator';
        typingDiv.innerHTML = `
            <img src="${this.currentCharacter.avatar}" alt="avatar" class="message-avatar">
            <div class="message-content">
                <p>正在输入<span class="typing-dots">...</span></p>
            </div>
        `;
        this.chatArea.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        if (!this.chatArea) return;
        const typingIndicator = this.chatArea.querySelector('.typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    }

    updateChatHeader() {
        if (this.headerName && this.currentCharacter) {
            this.headerName.textContent = this.currentCharacter.name;
        }
    }

    scrollToBottom() {
        if (this.chatArea) {
            setTimeout(() => { this.chatArea.scrollTop = this.chatArea.scrollHeight; }, 100);
        }
    }

    // ===== 事件绑定 =====
    setupChatInterface() {
        if (this.chatInput) {
            
            this.chatInput.addEventListener('focus', () => {
                if (this.chatPage) {
                    this.chatPage.classList.add('keyboard-active');
                    this.scrollToBottom();
                }
            });
    
            this.chatInput.addEventListener('blur', () => {
                if (this.chatPage) {
                    this.chatPage.classList.remove('keyboard-active');
                }
            });
    
            this.chatInput.addEventListener('input', () => {
                const textarea = this.chatInput;
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
    
                const maxHeight = parseInt(getComputedStyle(textarea).maxHeight, 10);
                if (textarea.scrollHeight >= maxHeight) {
                    textarea.style.overflowY = 'auto';
                } else {
                    textarea.style.overflowY = 'hidden';
                }

                if (textarea.value.trim().length > 0) {
                    this.toggleBatchActions(true);
                } else {
                    if (this.waitingMessages.length === 0) {
                        this.toggleBatchActions(false);
                    }
                }
            });
    
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!this.isAITyping) {
                        this.confirmAndSendBatch();
                    }
                }
            });
        }
    
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => {
                if (!this.isAITyping) {
                   this.confirmAndSendBatch();
                }
            });
        }
    // ==================== [修改] 表情面板切换逻辑 ====================
        if (this.smileIcon) {
            this.smileIcon.addEventListener('click', () => {
                const isPanelVisible = this.emojiPanel.classList.contains('visible');

                if (isPanelVisible) {
                    // 如果面板是可见的，就关闭它
                    this.closeEmojiPanel();
                } else {
                    // 如果面板是隐藏的，就渲染并打开它
                    this.renderEmojiPanel(); // 【核心】在打开前，先渲染最新的表情
                    this.emojiPanel.classList.add('visible');
                    this.smileIcon.classList.add('active');
                    // 如果键盘是打开的，就收起它
                    if (this.chatInput) {
                        this.chatInput.blur();
                    }
                }
            });
        }
    } // <-- setupChatInterface 方法在这里结束


    bindEvents() {
        document.body.addEventListener('click', (e) => {
            const chatItem = e.target.closest('.chat-item[data-char-id]');
            if (chatItem) {
                const mainChatList = document.querySelector('#page-messages .chat-list');
                if (mainChatList && mainChatList.contains(chatItem)) {
                    const charId = chatItem.dataset.charId;
                    const character = window.appData.characters.find(c => c.id == charId);
                    const userProfile = window.getActiveUserProfile();
                    if (character && userProfile) {
                        this.openChat(charId, character, userProfile);
                    }
                }
            }
        });

        // [新增] 为对话区域添加点击事件，用于收起表情面板
    if (this.chatArea) {
        this.chatArea.addEventListener('click', () => {
            this.closeEmojiPanel();
        });
    }

    const menuBtn = document.getElementById('chat-interface-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                if (!this.currentCharacterId) return;
                this.openChatSettings();
            });
        }
        
        // 为等待和确认按钮绑定点击事件 (已移至正确位置)
        if (this.btnWaitSend) {
            this.btnWaitSend.addEventListener('click', () => this.waitAndSend());
        }
        if (this.btnConfirmSend) {
            this.btnConfirmSend.addEventListener('click', () => this.confirmAndSendBatch());
        }
    }
    
    // ===== 辅助方法 =====
    saveCurrentChat() {
        if (this.currentCharacterId) {
            this.allChats[this.currentCharacterId] = this.chatHistory;
            this.saveChatHistory();
        }
    }

    getAPISettings() {
        const settings = JSON.parse(localStorage.getItem('aiChatApiSettings_v2') || 'null');
        if (!settings || !settings.configurations || !settings.activeConfigurationId) return null;
        return settings.configurations.find(c => c.id == settings.activeConfigurationId);
    }

    getInjectSettings() {
        const activePromptId = window.appData.activePromptId;
        const prompt = window.appData.prompts?.find(p => p.id == activePromptId);
        return prompt?.settings || { temperature: 0.7, maxResponse: 2000, topP: 0.9 };
    }
    
    // ===== 聊天设置页面管理 (V2 - 新版UI) =====
    openChatSettings() {
        if (!this.currentCharacter) return;
        
        const charChatSettingsPage = document.getElementById('page-char-chat-settings');
        if (!charChatSettingsPage) return;
        
        const title = document.getElementById('char-chat-settings-title');
        const avatar = document.getElementById('chat-settings-char-avatar-2');
        const name = document.getElementById('chat-settings-char-name-2');
        
        if (title) title.textContent = `${this.currentCharacter.name} - 聊天设置`;
        if (avatar) avatar.src = this.currentCharacter.avatar;
        if (name) name.textContent = this.currentCharacter.name;
        
        charChatSettingsPage.classList.add('active');
    }
    
    // ===== 公共方法 =====
    clearCurrentChat() {
        if (this.currentCharacterId && confirm('确定要清空当前聊天记录吗？')) {
            this.chatHistory = [];
            delete this.allChats[this.currentCharacterId];
            this.saveChatHistory();
            this.addWelcomeMessage();
            this.renderChatHistory();
        }
    }

    exportChatHistory() {
        if (!this.currentCharacterId) return;
        const chatData = {
            character: this.currentCharacter,
            user: this.currentUserProfile,
            messages: this.chatHistory,
            exportTime: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `chat-${this.currentCharacter.name}-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}





document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // ==================== [新增] 动态加载组件 ========================
    // ===================================================================
    // 在 DOMContentLoaded 事件监听器中，找到动态加载状态栏的部分，修改为：

// 在 DOMContentLoaded 事件监听器中，找到动态加载状态栏的部分，修改为：

fetch('statusBar.html')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(html => {
        // 为主页面加载状态栏
        const container = document.getElementById('status-bar-container');
        if (container) {
            container.innerHTML = html;
        }
        
        // 为所有页面覆盖层添加状态栏
        const pageOverlays = document.querySelectorAll('.page-overlay');
        pageOverlays.forEach(overlay => {
            // 检查是否已经有状态栏容器
            if (!overlay.querySelector('.status-bar')) {
                // 在页面头部之前插入状态栏
                const header = overlay.querySelector('.user-settings-header');
                if (header) {
                    const statusBarDiv = document.createElement('div');
                    statusBarDiv.className = 'status-bar-overlay';
                    statusBarDiv.innerHTML = html;
                    overlay.insertBefore(statusBarDiv, header);
                }
            }
        });
        
        // 【关键修改】触发状态栏功能初始化
        document.dispatchEvent(new CustomEvent('statusBarLoaded'));
        
        // 【新增】为所有状态栏实例启动功能
        initializeAllStatusBars();
    })
    .catch(error => {
        console.error('Failed to load status bar:', error);
        document.dispatchEvent(new CustomEvent('statusBarLoaded'));
    });

// 【新增】初始化所有状态栏功能的函数
function initializeAllStatusBars() {
    // 获取所有状态栏实例
    const allStatusBars = document.querySelectorAll('.status-bar');
    
    allStatusBars.forEach(statusBar => {
        // 初始化时间显示
        const timeElement = statusBar.querySelector('#status-bar-time');
        const batteryLiquid = statusBar.querySelector('#battery-capsule-liquid');
        const batteryLevelText = statusBar.querySelector('#battery-capsule-level');
        const batteryCapsule = statusBar.querySelector('#battery-capsule');
        const modelStatusKey = statusBar.querySelector('#model-status-key');

        // 时间更新函数
        function updateClock() { 
            if(!timeElement) return; 
            const beijingTime = new Date().toLocaleString('en-GB', { 
                timeZone: 'Asia/Shanghai', 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
            }); 
            timeElement.textContent = beijingTime; 
        }

        // 电池状态函数
        function setupBattery() {
            if ('getBattery' in navigator) { 
                navigator.getBattery().then(battery => { 
                    const updateBatteryStatus = () => { 
                        if(!batteryLevelText || !batteryLiquid) return; 
                        const level = Math.round(battery.level * 100); 
                        batteryLevelText.textContent = level; 
                        batteryLiquid.style.width = `${100 - level}%`; 
                    }; 
                    updateBatteryStatus(); 
                    battery.addEventListener('levelchange', updateBatteryStatus); 
                    battery.addEventListener('chargingchange', updateBatteryStatus); 
                }).catch(e => {
                    if(batteryCapsule) batteryCapsule.style.display = 'none';
                });
            } else {
                if(batteryCapsule) batteryCapsule.style.display = 'none';
            }
        }

        // 钥匙状态函数
        function updateModelStatusKey() {
            if (!modelStatusKey) return;
            // 正确的代码
const API_SETTINGS_KEY = 'aiChatApiSettings_v2';
const settings = JSON.parse(localStorage.getItem(API_SETTINGS_KEY) || 'null');
            if (settings && settings.configurations && settings.activeConfigurationId) {
                const activeConfig = settings.configurations.find(c => c.id == settings.activeConfigurationId);
                if (activeConfig && activeConfig.apiKey && activeConfig.model) {
                    modelStatusKey.style.display = 'inline-block';
                } else {
                    modelStatusKey.style.display = 'none';
                }
            } else {
                modelStatusKey.style.display = 'none';
            }
        }

        // 启动功能
        updateClock(); 
        setInterval(updateClock, 1000); 
        setupBattery();
        updateModelStatusKey();

        // 监听API设置变化
        document.addEventListener('apiSettingsUpdated', updateModelStatusKey);
    });
}

    // ===================================================================
    // ==================== 1. ELEMENT SELECTORS =========================
    // ===================================================================

    // --- App & Navigation ---
    const appContainer = document.querySelector('.app-container');
    const navButtons = document.querySelectorAll('.nav-button');
    const pages = document.querySelectorAll('.page');

    // --- Sidebar ---
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const openSidebarTriggers = document.querySelectorAll('.js-open-sidebar');

    // --- Dynamic Lists & Tabs ---
    const chatListContainer = document.querySelector('.chat-list');
    const defaultGroupContactsContainer = document.getElementById('default-group-contacts');
    const defaultGroupCount = document.getElementById('default-group-count');
    const contactGroupsContainer = document.querySelector('.contact-groups');
    const contactTabs = document.querySelectorAll('.contact-tab-btn');
    const tabContents = document.querySelectorAll('.contact-tab-content');

    // --- Page Overlays ---
    const userSettingsPage = document.getElementById('page-user-settings');
    const characterSettingsPage = document.getElementById('page-character-settings');
    const dataManagementPage = document.getElementById('page-data-management');
    const apiSettingsPage = document.getElementById('page-api-settings');
    const injectPage = document.getElementById('page-inject');
    const favoritesPage = document.getElementById('page-favorites');
    const beautifyPage = document.getElementById('page-beautify');
    const walletPage = document.getElementById('page-wallet');
    const specialPage = document.getElementById('page-special');
    const chatInterfacePage = document.getElementById('page-chat-interface');
    const chatInterfaceBackBtn = document.getElementById('chat-interface-back-btn');

    // --- Injection Page Controls ---
    const injectMaxContextValue = document.getElementById('inject-max-context');
    const injectMaxContextSlider = document.getElementById('inject-max-context-slider');
    const injectMaxResponseValue = document.getElementById('inject-max-response');
    const injectMaxResponseSlider = document.getElementById('inject-max-response-slider');
    const injectTempSlider = document.getElementById('inject-temp-slider');
    const injectTempValue = document.getElementById('inject-temp-value');
    const injectTopPSlider = document.getElementById('inject-top-p-slider');
    const injectTopPValue = document.getElementById('inject-top-p-value');
    const injectAbilitySelect = document.getElementById('inject-ability-select');
    const injectModeSelect = document.getElementById('inject-mode-select');
    const btnNewPromptIcon = document.getElementById('btn-new-prompt-icon');
    const btnDeletePrompt = document.getElementById('btn-delete-prompt');
    const btnSavePrompt = document.getElementById('btn-save-prompt');
    const promptSelect = document.getElementById('prompt-select');

    // --- User Settings Page Elements ---
    const sidebarProfileLink = document.getElementById('sidebar-profile-link');
    const userAvatarPreview = document.getElementById('user-avatar-preview');
    const userAvatarInput = document.getElementById('user-avatar-input');
    const sidebarAvatar = document.querySelector('#sidebar-profile-link .avatar');
    const headerAvatar = document.querySelector('#page-messages .user-info .avatar');
    const feedAvatar = document.getElementById('feed-avatar');
    const inputName = document.getElementById('input-name');
    const inputGender = document.getElementById('input-gender');
    const inputBirthday = document.getElementById('input-birthday');
    const inputAge = document.getElementById('input-age');
    const textareaSettings = document.getElementById('textarea-settings');
    const inputSignature = document.getElementById('input-signature');
    const userProfileTagsContainer = document.getElementById('user-profile-tags');
    const userSettingsDeleteBtn = document.getElementById('user-settings-delete-btn');
    const userSettingsSaveBtn = document.getElementById('user-settings-save-btn');
    const addUserProfileBtn = document.getElementById('add-user-profile-btn');
    const toggleGlobalApply = document.getElementById('toggle-global-apply');
    const characterBindingContainer = document.getElementById('character-binding-container');
    const bindCharacterSelect = document.getElementById('bind-character-select');

    // --- Dynamic User Info Display ---
    const sidebarProfileName = document.querySelector('#sidebar-profile-link .profile-name');
    const sidebarProfileStatus = document.querySelector('#sidebar-profile-link .profile-status');
    const headerUsername = document.querySelector('.header-username');
    const feedUsername = document.querySelector('#page-feed .feed-user-info span');

    // --- Character Settings Page Elements ---
    const charAvatarPreview = document.getElementById('char-avatar-preview');
    const charAvatarInput = document.getElementById('char-avatar-input');
    const boundUserInfoCard = document.getElementById('bound-user-info-card');
    const boundUserName = document.getElementById('bound-user-name');
    
    const characterSettingsForm = {
        name: document.getElementById('input-char-name'),
        gender: document.getElementById('input-char-gender'),
        birthday: document.getElementById('input-char-birthday'),
        age: document.getElementById('input-char-age'),
        settings: document.getElementById('textarea-char-settings')
    };

    // --- [新增] Character Homepage Page Elements ---
    const characterHomepagePage = document.getElementById('page-character-homepage');
    const characterHomepageBackBtn = document.getElementById('character-homepage-back-btn');
    const characterHomepageSaveBtn = document.getElementById('character-homepage-save-btn');
    const charHomepageAvatarPreview = document.getElementById('char-homepage-avatar-preview');
    const charHomepageAvatarInput = document.getElementById('char-homepage-avatar-input');
    const boundUserInfoCardHomepage = document.getElementById('bound-user-info-card-homepage');
    const boundUserNameHomepage = document.getElementById('bound-user-name-homepage');
    const characterHomepageForm = {
        name: document.getElementById('input-char-homepage-name'),
        gender: document.getElementById('input-char-homepage-gender'),
        birthday: document.getElementById('input-char-homepage-birthday'),
        age: document.getElementById('input-char-homepage-age'),
        settings: document.getElementById('textarea-char-homepage-settings')
    };


    // --- Data Management Page Elements ---
    const sidebarDataLink = document.getElementById('sidebar-data-link');
    const btnClearData = document.getElementById('btn-clear-data');

    // --- New Sidebar Links ---
    const sidebarInjectLink = document.getElementById('sidebar-inject-link');
    const sidebarFavoritesLink = document.getElementById('sidebar-favorites-link');
    const sidebarBeautifyLink = document.getElementById('sidebar-beautify-link');
    const sidebarWalletLink = document.getElementById('sidebar-wallet-link');
    const sidebarSpecialLink = document.getElementById('sidebar-special-link');

    // --- API Settings Page Elements ---
    const sidebarApiLink = document.getElementById('sidebar-api-link');
    const apiSettingsFormEl = document.getElementById('api-settings-form');
    const apiConfigSelect = document.getElementById('api-config-select');
    const apiTypeSelect = document.getElementById('api-type-select');
    const apiUrlInput = document.getElementById('api-url');
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
    const btnNewConfig = document.getElementById('btn-new-config-icon');
    const fetchModelsButtonNew = document.getElementById('fetch-models-button-new');
    const btnDeleteConfig = document.getElementById('btn-delete-config');
    const btnSaveConfig = document.getElementById('btn-save-config');
    const openaiModelsGroup = document.getElementById('openai-models');
    const geminiModelsGroup = document.getElementById('gemini-models');

    // --- Modals ---
    const modalContainer = document.getElementById('modal-container');
    const weatherModal = document.getElementById('weather-modal');
    const locationModal = document.getElementById('location-modal');
    const statusModal = document.getElementById('status-modal');
    const clearDataModal = document.getElementById('clear-data-modal');
    const openWeatherModalBtn = document.getElementById('btn-open-weather-modal');
    const openLocationModalBtn = document.getElementById('btn-open-location-modal');
    const headerStatusTrigger = document.getElementById('header-status-trigger');
    const headerStatusText = document.getElementById('header-status-text');
    const weatherOptionsGrid = document.getElementById('weather-options-grid');
    const locationCardsContainer = document.getElementById('location-cards-container');
    const statusOptionsGrid = document.getElementById('status-options-grid');
    const addLocationBtn = document.getElementById('btn-add-location');
    const closeButtons = document.querySelectorAll('.modal-close-btn');
    const clearDataConfirmInput = document.getElementById('clear-data-confirm-input');
    const confirmClearDataBtn = document.getElementById('confirm-clear-data-btn');

    // --- Popovers & Grids ---
    const actionGrids = document.querySelectorAll('.actions-grid');
    const headerPlusBtn = document.getElementById('header-plus-btn');
    const headerPopoverMenu = document.getElementById('header-popover-menu');
    
    // --- Cropper Modal Elements ---
    const cropperModal = document.getElementById('cropper-modal');
    const imageToCrop = document.getElementById('image-to-crop');
    const confirmCropBtn = document.getElementById('confirm-crop-btn');
    const cancelCropBtn = document.getElementById('cancel-crop-btn');

    // --- Chat Settings Page Elements ---
    const charChatSettingsPage = document.getElementById('page-char-chat-settings');
    const charChatSettingsBackBtn = document.getElementById('char-chat-settings-back-btn');
    const clearChatHistoryBtn = document.getElementById('clear-chat-history-btn');
    const exportChatHistoryBtn = document.getElementById('export-chat-history-btn');
    const editCharacterHomepageBtn = document.getElementById('edit-character-homepage-btn');


    // --- Fullscreen Editor Elements ---
    const fullscreenEditorPage = document.getElementById('page-fullscreen-editor');
    const fullscreenEditorTextarea = document.getElementById('fullscreen-editor-textarea');
    const fullscreenEditorBackBtn = document.getElementById('fullscreen-editor-back-btn');

    // [新增] 表情包管理页面元素
    const emojiManagementPage = document.getElementById('page-emoji-management');
    const btnOpenEmojiManagement = document.getElementById('btn-open-emoji-management');
    const emojiManagementBackBtn = document.getElementById('emoji-management-back-btn');
    const btnUploadEmoji = document.getElementById('btn-upload-emoji');
    const emojiUploadInput = document.getElementById('emoji-upload-input');
   // ==================== [新增] 网络表情模态框元素 ====================
const webEmojiModal = document.getElementById('web-emoji-modal');
const webEmojiUrlInput = document.getElementById('web-emoji-url-input');
const confirmAddWebEmojiBtn = document.getElementById('confirm-add-web-emoji-btn');
// ==================================================================


     // ===================================================================
    // ==================== 2. STATE MANAGEMENT ==========================
    // ===================================================================

    const STORAGE_KEY = 'felotusAppData';
    window.appData = {};
    window.chatManager = new ChatManager();

    let newCharacterAvatarData = null;
    let newUserAvatarData = null;
    let currentCropContext = null; 
    let cropper = null;
    let currentEditingTextarea = null;

    const initialData = {
        userProfiles: [
            { id: 'default', name: '用户', isDefault: true, avatar: 'https://i.imgur.com/uG2g8xX.png', gender: '女', birthday: '', age: '', settings: '', isGlobal: true, boundCharacterId: null }
        ],
        activeUserProfileId: 'default',
        prompts: [
            { id: `prompt_${Date.now()}_1`, name: '聊天默认提示词', settings: { maxContext: 99000, maxResponse: 9000, temperature: 0.75, topP: 0.75, ability: 'auto', mode: 'chat' }},
            { id: `prompt_${Date.now()}_2`, name: '剧情默认提示词', settings: { maxContext: 199000, maxResponse: 30000, temperature: 0.85, topP: 0.85, ability: 'auto', mode: 'story' }}
        ],
        activePromptId: `prompt_${Date.now()}_1`,
        globalSignature: '', 
        characters: [],
        weather: { options: ['☀️', '⛅️', '☁️', '🌧️', '❄️', '⚡️'], selected: '☀️' },
        locations: [],
        status: { options: ['在线', '离开', '请勿打扰', '听歌中', 'emo中', '恋爱中', '睡觉中'], selected: '在线' },
        injectionSettings: { maxContext: 99000, maxResponse: 9000, temperature: 0.75, topP: 0.75, ability: 'auto', mode: 'chat' }, // <-- 在这里加上逗号！
    // [新增]
    emojis: [] // 用于存储所有用户上传的表情包
};

    window.getActiveUserProfile = () => {
        return window.appData.userProfiles.find(p => p.id === window.appData.activeUserProfileId) || window.appData.userProfiles[0];
    }

    function updateUserAvatars(avatarUrl) {
        const activeProfile = getActiveUserProfile();
        const finalAvatarUrl = avatarUrl || (activeProfile ? activeProfile.avatar : null) || 'https://i.imgur.com/uG2g8xX.png';
        if (userAvatarPreview) userAvatarPreview.src = finalAvatarUrl;
        if (sidebarAvatar) sidebarAvatar.src = finalAvatarUrl;
        if (headerAvatar) headerAvatar.src = finalAvatarUrl;
        if (feedAvatar) feedAvatar.src = finalAvatarUrl;
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.appData));
    }

    function loadData() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                window.appData = { ...initialData, ...parsedData };
                window.appData.userProfiles = parsedData.userProfiles && parsedData.userProfiles.length > 0 
                    ? parsedData.userProfiles 
                    : [...initialData.userProfiles];
                window.appData.characters = parsedData.characters || [];
            // [新增] 确保 emojis 数组存在
            window.appData.emojis = parsedData.emojis || [];

        } else {
                window.appData = { ...initialData };
            }
            
            loadUserProfileDetails();
            renderUserProfileTags();
            if (inputSignature) inputSignature.value = window.appData.globalSignature || '';
            
            updateHeaderStatus();
            renderWeatherOptions();
            renderLocationCards();
            renderStatusOptions();
            renderChatList();
            renderContactList();
            updateUserDisplayInfo();
        } catch (error) {
            console.error('Error loading data:', error);
            window.appData = { ...initialData };
            try {
                renderChatList();
                renderContactList();
                updateUserDisplayInfo();
            } catch (retryError) {
                console.error('Error in fallback initialization:', retryError);
            }
        }
    }

    // ===================================================================
    // ==================== 3. UI RENDERING FUNCTIONS ====================
    // ===================================================================

    function renderUserProfileTags() {
        if (!userProfileTagsContainer) return;
        userProfileTagsContainer.innerHTML = '';
        window.appData.userProfiles.forEach(profile => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = profile.name;
            tag.dataset.id = profile.id;
            if (profile.id === window.appData.activeUserProfileId) {
                tag.classList.add('active');
            }
            tag.addEventListener('click', () => {
                window.appData.activeUserProfileId = profile.id;
                loadUserProfileDetails();
                renderUserProfileTags();
            });
            userProfileTagsContainer.appendChild(tag);
        });
    }

    function loadUserProfileDetails() {
        const profile = getActiveUserProfile();
        if (!profile) return;
        if (inputName) inputName.value = profile.name || '';
        if (inputGender) inputGender.value = profile.gender || '女';
        if (inputBirthday) inputBirthday.value = profile.birthday || '';
        if (inputAge) inputAge.value = profile.age || '';
        if (textareaSettings) textareaSettings.value = profile.settings || '';
        updateUserAvatars(profile.avatar);
        if (userSettingsDeleteBtn) {
            userSettingsDeleteBtn.style.display = profile.isDefault ? 'none' : 'inline-block';
        }
        updateUserDisplayInfo();
        loadScopeSettingsUI();
    }

    function saveActiveUserProfileDetails() {
        const profile = getActiveUserProfile();
        if (!profile) return;
        if (inputName) profile.name = inputName.value;
        if (inputBirthday) profile.birthday = inputBirthday.value;
        if (inputAge) profile.age = inputAge.value;
        if (textareaSettings) profile.settings = textareaSettings.value;
        if (inputSignature) window.appData.globalSignature = inputSignature.value;

        if (toggleGlobalApply) {
            profile.isGlobal = toggleGlobalApply.checked;
            profile.boundCharacterId = profile.isGlobal ? null : (bindCharacterSelect ? bindCharacterSelect.value : null);
        }

        if (newUserAvatarData) {
            profile.avatar = newUserAvatarData;
            newUserAvatarData = null;
        }
        saveData();
        renderUserProfileTags();
        updateUserDisplayInfo();
    }

    function updateUserDisplayInfo() {
        const profile = getActiveUserProfile();
        if (!profile) return;
        if (sidebarProfileName) sidebarProfileName.textContent = profile.name;
        if (headerUsername) headerUsername.textContent = profile.name;
        if (feedUsername) feedUsername.textContent = profile.name;
        if (sidebarProfileStatus) {
            const signature = window.appData.globalSignature || '此处展示个性签名';
            sidebarProfileStatus.textContent = signature.length > 13 ? signature.substring(0, 13) + '…' : signature;
        }
    }
    
    function renderChatList() { 
        if (!chatListContainer) return; 
        chatListContainer.innerHTML = ''; 
        const groupChatItemHTML = `<div class="chat-item"><div class="avatar-group-logo">LOG</div><div class="chat-details"><div class="chat-title">相亲相爱一家人</div><div class="chat-message">AI助手: @全体成员 今天...</div></div><div class="chat-meta">06/05 <i class="fa-solid fa-bell-slash"></i></div></div>`; 
        chatListContainer.insertAdjacentHTML('beforeend', groupChatItemHTML); 
        window.appData.characters.forEach(char => { 
            const chatItemHTML = `
                <div class="chat-item" data-char-id="${char.id}">
                    <img src="${char.avatar}" alt="avatar">
                    <div class="chat-details">
                        <div class="chat-title">${char.name}</div>
                        <div class="chat-message">我们已经是好友了，现在开始聊天吧！</div>
                    </div>
                    <div class="chat-meta">${char.creationTime}</div>
                </div>`; 
            chatListContainer.insertAdjacentHTML('beforeend', chatItemHTML); 
        }); 
    }

    function renderContactList() { 
        if (!defaultGroupContactsContainer || !defaultGroupCount) return; 
        defaultGroupContactsContainer.innerHTML = ''; 
        defaultGroupCount.textContent = window.appData.characters.length; 
        window.appData.characters.forEach(char => { 
            const contactItemHTML = `<div class="chat-item" data-char-id="${char.id}"><img src="${char.avatar}" alt="avatar"><div class="chat-details"><div class="chat-title">${char.name}</div></div></div>`; 
            defaultGroupContactsContainer.insertAdjacentHTML('beforeend', contactItemHTML); 
        }); 
    }

    function renderStatusOptions() {
        if (!statusOptionsGrid) return;
        statusOptionsGrid.innerHTML = '';
        window.appData.status.options.forEach(statusText => {
            const btn = document.createElement('button');
            btn.className = 'status-option-btn';
            btn.textContent = statusText;
            if (statusText === window.appData.status.selected) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                window.appData.status.selected = statusText;
                saveData();
                updateHeaderStatus();
                renderStatusOptions();
            });
            addLongPressListener(btn, () => {
                if (confirm(`确定要删除状态 "${statusText}" 吗？`)) {
                    window.appData.status.options = window.appData.status.options.filter(s => s !== statusText);
                    if (window.appData.status.selected === statusText) {
                        window.appData.status.selected = window.appData.status.options[0] || '在线';
                    }
                    saveData();
                    updateHeaderStatus();
                    renderStatusOptions();
                }
            });
            statusOptionsGrid.appendChild(btn);
        });
        const addBtn = document.createElement('button');
        addBtn.className = 'status-option-btn add-new';
        addBtn.textContent = '+';
        addBtn.addEventListener('click', () => {
            const newStatus = prompt('请输入新状态');
            if (newStatus === null) return;
            if (newStatus.trim() === '') return alert('状态不能为空！');
            if (newStatus.length > 20) return alert('状态内容不能超过20个字！');
            if (window.appData.status.options.includes(newStatus)) return alert('此状态已存在！');
            window.appData.status.options.push(newStatus);
            saveData();
            renderStatusOptions();
        });
        statusOptionsGrid.appendChild(addBtn);
    }

    function renderWeatherOptions() {
        if(!weatherOptionsGrid) return;
        weatherOptionsGrid.innerHTML = '';
        window.appData.weather.options.forEach(icon => {
            const btn = document.createElement('button');
            btn.className = 'weather-option-btn';
            btn.textContent = icon;
            if (icon === window.appData.weather.selected) btn.classList.add('active');
            btn.addEventListener('click', () => {
                window.appData.weather.selected = icon;
                saveData();
                renderWeatherOptions();
            });
            addLongPressListener(btn, () => {
                if (confirm(`确定要删除天气 "${icon}" 吗？`)) {
                    window.appData.weather.options = window.appData.weather.options.filter(i => i !== icon);
                    if (window.appData.weather.selected === icon) {
                        window.appData.weather.selected = window.appData.weather.options[0] || null;
                    }
                    saveData();
                    renderWeatherOptions();
                }
            });
            weatherOptionsGrid.appendChild(btn);
        });
        const addBtn = document.createElement('button');
        addBtn.className = 'weather-option-btn add-new';
        addBtn.textContent = '+';
        addBtn.addEventListener('click', () => {
            const newWeather = prompt('请输入天气');
            if (newWeather && !window.appData.weather.options.includes(newWeather)) {
                window.appData.weather.options.push(newWeather);
                saveData();
                renderWeatherOptions();
            }
        });
        weatherOptionsGrid.appendChild(addBtn);
    }

    function renderLocationCards() {
        if (!locationCardsContainer) return;
        locationCardsContainer.innerHTML = '';
        window.appData.locations.forEach(location => {
            const card = document.createElement('div');
            card.className = 'location-card';
            card.innerHTML = `
                <div class="input-group">
                    <label for="loc-name-${location.id}">名称</label>
                    <input type="text" id="loc-name-${location.id}" value="${location.name}" placeholder="如：家">
                </div>
                <div class="input-group">
                    <label for="loc-addr-${location.id}">地址</label>
                    <input type="text" id="loc-addr-${location.id}" value="${location.address}" placeholder="如：XX省XX市">
                </div>
                <div class="location-card-actions">
                    <button class="location-delete-btn" data-id="${location.id}">删除</button>
                    <div class="location-select-indicator ${location.selected ? 'selected' : ''}" data-id="${location.id}">
                        <i class="fa-solid fa-check"></i>
                    </div>
                </div>
            `;
            card.querySelector(`#loc-name-${location.id}`).addEventListener('change', (e) => {
                location.name = e.target.value;
                saveData();
            });
            card.querySelector(`#loc-addr-${location.id}`).addEventListener('change', (e) => {
                location.address = e.target.value;
                saveData();
            });
            card.querySelector('.location-delete-btn').addEventListener('click', (e) => {
                if (confirm(`确定要删除定位 "${location.name}" 吗？`)) {
                    window.appData.locations = window.appData.locations.filter(loc => loc.id !== location.id);
                    saveData();
                    renderLocationCards();
                }
            });
            card.querySelector('.location-select-indicator').addEventListener('click', () => {
                window.appData.locations.forEach(loc => loc.selected = (loc.id === location.id) ? !loc.selected : false);
                saveData();
                renderLocationCards();
            });
            locationCardsContainer.appendChild(card);
        });
    }

    // ===================================================================
    // ==================== 4. CORE LOGIC & FEATURES =====================
    // ===================================================================

    function updateHeaderStatus() { 
        if(headerStatusText) headerStatusText.textContent = window.appData.status.selected; 
    }

    function addLongPressListener(element, callback) { 
        let longPressTimer; 
        const start = (e) => { 
            longPressTimer = setTimeout(callback, 600); 
        }; 
        const cancel = () => clearTimeout(longPressTimer); 
        element.addEventListener('mousedown', start); 
        element.addEventListener('mouseup', cancel); 
        element.addEventListener('mouseleave', cancel); 
        element.addEventListener('touchstart', start, { passive: true });
        element.addEventListener('touchend', cancel); 
    }

    function openModal(modalElement) { 
        if (modalContainer && modalElement) {
            modalContainer.classList.add('visible'); 
            modalElement.classList.add('visible'); 
        }
    }

    function closeModal() { 
    if (modalContainer) {
        modalContainer.classList.remove('visible'); 
        // [修改] 将 webEmojiModal 添加到数组中
        [weatherModal, locationModal, statusModal, clearDataModal, cropperModal, webEmojiModal].forEach(m => { 
            if (m) m.classList.remove('visible'); 
        }); 
    }
}

    function setupPageTransition(link, page, onBack) {
        if (!link || !page) return;
        
        const backBtn = page.querySelector('.fa-chevron-left');

        link.addEventListener('click', (e) => {
            e.preventDefault();
            page.classList.add('active');
            if (appContainer) appContainer.classList.remove('sidebar-open');
        });

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                page.classList.remove('active');
                if (onBack && typeof onBack === 'function') {
                    onBack();
                }
            });
        }
    }

    function openCharacterEditor(characterId = null) {
    const pageTitle = characterSettingsPage.querySelector('.user-settings-header span');
    const floatingChatBtn = document.getElementById('floating-chat-btn');
    
    // 清理表单和状态
    Object.values(characterSettingsForm).forEach(input => {
        if (input) input.value = '';
    });
    if (charAvatarPreview) charAvatarPreview.src = 'https://i.imgur.com/Jz9v5aB.png';
    newCharacterAvatarData = null;
    if (charAvatarInput) charAvatarInput.value = null;
    if (boundUserInfoCard) boundUserInfoCard.classList.add('hidden');

    // 根据是否有 characterId 判断是创建还是编辑
    if (characterId) {
        // --- 编辑模式 ---
        const characterToEdit = window.appData.characters.find(c => c.id == characterId);
        if (!characterToEdit) {
            console.error("要编辑的角色未找到:", characterId);
            return;
        }
        
        if (pageTitle) pageTitle.textContent = `编辑 - ${characterToEdit.name}`;
        characterSettingsForm.name.value = characterToEdit.name;
        characterSettingsForm.gender.value = characterToEdit.gender;
        characterSettingsForm.birthday.value = characterToEdit.birthday;
        characterSettingsForm.age.value = characterToEdit.age;
        characterSettingsForm.settings.value = characterToEdit.settings;
        if (charAvatarPreview) charAvatarPreview.src = characterToEdit.avatar;

        const boundProfile = window.appData.userProfiles.find(p => !p.isGlobal && p.boundCharacterId == characterToEdit.id);
        if (boundProfile && boundUserInfoCard && boundUserName) {
            boundUserName.textContent = boundProfile.name;
            boundUserInfoCard.classList.remove('hidden');
        }
        
        // [修正] 启用悬浮聊天按钮，并放在编辑模式的逻辑块内
if (floatingChatBtn) {
    floatingChatBtn.disabled = false;
    // 【修改】将<i>图标替换为<svg>代码
    floatingChatBtn.innerHTML = '<span>发消息</span><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="send-icon-svg" viewBox="0 0 16 16"><path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/></svg>';
}
        
        // 关键：将当前编辑的ID存到页面的 dataset 中
        characterSettingsPage.dataset.editingId = characterId;

    } else {
        // --- 创建模式 ---
        if (pageTitle) pageTitle.textContent = '创建新角色';
        
        // [修正] 禁用悬浮聊天按钮，并放在创建模式的逻辑块内
        if (floatingChatBtn) {
    floatingChatBtn.disabled = true;
    // 【修改】将<i>图标替换为<svg>代码
    floatingChatBtn.innerHTML = '<span>设置后保存</span><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="send-icon-svg" viewBox="0 0 16 16"><path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/></svg>';
}
        
        delete characterSettingsPage.dataset.editingId;
    }

    // 统一打开页面
    characterSettingsPage.classList.add('active');
}
    
    // [新增] 打开角色主页的函数
function openCharacterHomepage(characterId) {
    if (!characterId || !characterHomepagePage) return;

    const characterToEdit = window.appData.characters.find(c => c.id == characterId);
    if (!characterToEdit) {
        console.error("要编辑的角色未找到:", characterId);
        return;
    }

    // 填充表单
    characterHomepageForm.name.value = characterToEdit.name;
    characterHomepageForm.gender.value = characterToEdit.gender;
    characterHomepageForm.birthday.value = characterToEdit.birthday;
    characterHomepageForm.age.value = characterToEdit.age;
    characterHomepageForm.settings.value = characterToEdit.settings;
    if (charHomepageAvatarPreview) charHomepageAvatarPreview.src = characterToEdit.avatar;
    
    // 显示绑定的用户信息
    const boundProfile = window.appData.userProfiles.find(p => !p.isGlobal && p.boundCharacterId == characterToEdit.id);
    if (boundProfile && boundUserInfoCardHomepage && boundUserNameHomepage) {
        boundUserNameHomepage.textContent = boundProfile.name;
        boundUserInfoCardHomepage.classList.remove('hidden');
    } else {
        if (boundUserInfoCardHomepage) boundUserInfoCardHomepage.classList.add('hidden');
    }

    // 存储ID并显示页面
    characterHomepagePage.dataset.editingId = characterId;
    characterHomepagePage.classList.add('active');
    
    // [新增] 确保页面能够获得焦点，提升用户体验
    setTimeout(() => {
        characterHomepagePage.scrollTop = 0;
    }, 100);
}


    function setupUserSettingsAvatarUpload() {
        if (userAvatarPreview) {
            userAvatarPreview.addEventListener('click', () => userAvatarInput.click());
        }
        if (userAvatarInput) {
            userAvatarInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    currentCropContext = { target: 'user', previewElement: userAvatarPreview };
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        openModal(cropperModal);
                        imageToCrop.src = e.target.result;
                        if (cropper) cropper.destroy();
                        cropper = new Cropper(imageToCrop, {
                            aspectRatio: 1,
                            viewMode: 1,
                            dragMode: 'move',
                            background: false,
                            autoCropArea: 0.8,
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // 在 script.js 中找到并替换整个 setupCharacterSettingsPage 函数

function setupCharacterSettingsPage() {
    if (!characterSettingsPage) return;

    const backBtn = document.getElementById('character-settings-back-btn');
    const saveBtn = document.getElementById('character-settings-save-btn');
    const floatingChatBtn = document.getElementById('floating-chat-btn'); // 获取按钮

    // --- 头像上传逻辑 (保持不变) ---
    if (charAvatarPreview) charAvatarPreview.addEventListener('click', () => charAvatarInput.click());
    if (charAvatarInput) {
        charAvatarInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                currentCropContext = { target: 'character', previewElement: charAvatarPreview };
                const reader = new FileReader();
                reader.onload = (e) => {
                    openModal(cropperModal);
                    imageToCrop.src = e.target.result;
                    if (cropper) cropper.destroy();
                    cropper = new Cropper(imageToCrop, {
                        aspectRatio: 1, viewMode: 1, dragMode: 'move', background: false, autoCropArea: 0.8,
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 保存按钮逻辑 (保持不变) ---
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const name = characterSettingsForm.name.value.trim();
            if (!name) return alert('角色姓名不能为空！');

            const currentlyEditingCharacterId = characterSettingsPage.dataset.editingId;

            if (currentlyEditingCharacterId) {
                // 编辑现有角色
                const characterToUpdate = window.appData.characters.find(c => c.id == currentlyEditingCharacterId);
                if (characterToUpdate) {
                    characterToUpdate.name = name;
                    characterToUpdate.gender = characterSettingsForm.gender.value;
                    characterToUpdate.birthday = characterSettingsForm.birthday.value;
                    characterToUpdate.age = characterSettingsForm.age.value;
                    characterToUpdate.settings = characterSettingsForm.settings.value;
                    if (newCharacterAvatarData) {
                        characterToUpdate.avatar = newCharacterAvatarData;
                    }
                    alert(`角色 "${name}" 已成功更新！`);
                }
            } else {
                // 创建新角色
                const timeString = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
                const newCharacter = {
                    id: Date.now(),
                    name: name,
                    gender: characterSettingsForm.gender.value,
                    birthday: characterSettingsForm.birthday.value,
                    age: characterSettingsForm.age.value,
                    settings: characterSettingsForm.settings.value,
                    signature: '', // 初始化个性签名
                    avatar: newCharacterAvatarData || 'https://i.imgur.com/Jz9v5aB.png',
                    creationTime: timeString
                };
                window.appData.characters.push(newCharacter);
                alert(`角色 "${name}" 已成功创建！`);
            }

            saveData();
            renderChatList();
            renderContactList();
            characterSettingsPage.classList.remove('active');
            delete characterSettingsPage.dataset.editingId; // 清理ID
        });
    }

    // --- 返回按钮逻辑 (保持不变) ---
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            characterSettingsPage.classList.remove('active');
            delete characterSettingsPage.dataset.editingId; // 清理ID
        });
    }

    // --- [修正] 悬浮聊天按钮点击事件监听器 ---
    // 将这个逻辑块从函数外部移到内部
    if (floatingChatBtn) {
        floatingChatBtn.addEventListener('click', () => {
            // 按钮被禁用时，不执行任何操作
            if (floatingChatBtn.disabled) return;

            const currentlyEditingCharacterId = characterSettingsPage.dataset.editingId;
            
            if (currentlyEditingCharacterId) {
                const character = window.appData.characters.find(c => c.id == currentlyEditingCharacterId);
                const userProfile = window.getActiveUserProfile();
                
                if (character && userProfile) {
                    // 【核心修改】不再关闭角色编辑页面，直接打开聊天页
                    // characterSettingsPage.classList.remove('active');
                    // delete characterSettingsPage.dataset.editingId;
                    window.chatManager.openChat(currentlyEditingCharacterId, character, userProfile);
                } else {
                    alert('无法找到角色信息，角色角色设置');
                }
            } else {
                // 理论上在禁用状态下不会触发，但作为保险
                alert('请先保存角色后再开始聊天');
            }
        });
    }
}

    // [新增] 设置角色主页的函数
    function setupCharacterHomepagePage() {
        if (!characterHomepagePage) return;

        // 头像上传
        if (charHomepageAvatarPreview) charHomepageAvatarPreview.addEventListener('click', () => charHomepageAvatarInput.click());
        if (charHomepageAvatarInput) {
            charHomepageAvatarInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    // 使用新的预览元素
                    currentCropContext = { target: 'character', previewElement: charHomepageAvatarPreview };
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        openModal(cropperModal);
                        imageToCrop.src = e.target.result;
                        if (cropper) cropper.destroy();
                        cropper = new Cropper(imageToCrop, {
                            aspectRatio: 1, viewMode: 1, dragMode: 'move', background: false, autoCropArea: 0.8,
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // 保存按钮
        if (characterHomepageSaveBtn) {
            characterHomepageSaveBtn.addEventListener('click', () => {
                const name = characterHomepageForm.name.value.trim();
                if (!name) return alert('角色姓名不能为空！');

                const currentlyEditingCharacterId = characterHomepagePage.dataset.editingId;
                if (currentlyEditingCharacterId) {
                    const characterToUpdate = window.appData.characters.find(c => c.id == currentlyEditingCharacterId);
                    if (characterToUpdate) {
                        characterToUpdate.name = name;
                        characterToUpdate.gender = characterHomepageForm.gender.value;
                        characterToUpdate.birthday = characterHomepageForm.birthday.value;
                        characterToUpdate.age = characterHomepageForm.age.value;
                        characterToUpdate.settings = characterHomepageForm.settings.value;
                        if (newCharacterAvatarData) {
                            characterToUpdate.avatar = newCharacterAvatarData;
                        }
                        alert(`角色主页信息已成功更新！`);
                    }
                }
                saveData();
                renderChatList();
                renderContactList();
                characterHomepagePage.classList.remove('active');
                delete characterHomepagePage.dataset.editingId;
            });
        }

        // 返回按钮
        if (characterHomepageBackBtn) {
            characterHomepageBackBtn.addEventListener('click', () => {
                characterHomepagePage.classList.remove('active');
                delete characterHomepagePage.dataset.editingId;
            });
        }
    }


    function setupCropperModal() {
        if (!cropperModal) return;
        confirmCropBtn.addEventListener('click', () => {
            if (!cropper || !currentCropContext) return;
            const canvas = cropper.getCroppedCanvas({
                width: 256,
                height: 256,
                imageSmoothingQuality: 'high',
            });
            const croppedImageData = canvas.toDataURL('image/png');
            
            // 数据赋值
            if (currentCropContext.target === 'character') {
                newCharacterAvatarData = croppedImageData;
            } else if (currentCropContext.target === 'user') {
                newUserAvatarData = croppedImageData;
            }
            
            // 预览更新
            if (currentCropContext.previewElement) {
                currentCropContext.previewElement.src = croppedImageData;
            } else if (currentCropContext.target === 'user') {
                updateUserAvatars(croppedImageData);
            }
            
            cropper.destroy();
            cropper = null;
            currentCropContext = null;
            closeModal();
            if (charAvatarInput) charAvatarInput.value = null;
            if (userAvatarInput) userAvatarInput.value = null;
            if (charHomepageAvatarInput) charHomepageAvatarInput.value = null;
        });
        cancelCropBtn.addEventListener('click', () => {
            if (cropper) cropper.destroy();
            cropper = null;
            currentCropContext = null;
            closeModal();
            if (charAvatarInput) charAvatarInput.value = null;
            if (userAvatarInput) userAvatarInput.value = null;
            if (charHomepageAvatarInput) charHomepageAvatarInput.value = null;
        });
    }

    function setupDataManagement() {
        const exportBtn = document.getElementById('btn-export-data');
        const importBtn = document.getElementById('btn-import-data');
        const importInput = document.getElementById('import-file-input');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                saveData();
                const jsonString = JSON.stringify(window.appData, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `felotus-data-${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(link.href);
                link.remove();
                alert('数据已成功导出！');
            });
        }
        
        if (importBtn) importBtn.addEventListener('click', () => importInput.click());
        
        if (importInput) {
            importInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        window.appData = Object.assign({}, initialData, importedData);
                        saveData();
                        loadData();
                        alert('数据导入成功！');
                    } catch (error) {
                        alert('导入失败，请确保上传的是正确的 JSON 数据文件。');
                    } finally {
                        event.target.value = null;
                    }
                };
                reader.readAsText(file);
            });
        }
        
        if(btnClearData) {
            btnClearData.addEventListener('click', () => {
                openModal(clearDataModal);
            });
        }
        
        if(clearDataConfirmInput) {
            clearDataConfirmInput.addEventListener('input', () => {
                confirmClearDataBtn.disabled = clearDataConfirmInput.value.trim() !== 'delete';
            });
        }
        
        if(confirmClearDataBtn) {
            confirmClearDataBtn.addEventListener('click', () => {
                if(confirmClearDataBtn.disabled) return;
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem('aiChatApiSettings_v2');
                localStorage.removeItem('felotus_chat_history');
                alert('本地数据已成功清除！应用将重新加载。');
                location.reload();
            });
        }
    }
    
    function setupApiSettingsPage() { 
        if (!apiSettingsPage) return; 
        const API_SETTINGS_KEY = 'aiChatApiSettings_v2'; 
        const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
        const defaultModels = { openai: {}, gemini: {} }; 
        let apiSettings = {}; 
        
        const getSettings = () => JSON.parse(localStorage.getItem(API_SETTINGS_KEY) || 'null'); 
        const saveSettings = () => { 
            localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(apiSettings)); 
            document.dispatchEvent(new CustomEvent('apiSettingsUpdated')); 
        };

        const updateDeleteButtonVisibility = () => {
            if (btnDeleteConfig) {
                const canDelete = apiSettings.configurations.length > 2;
                btnDeleteConfig.style.display = canDelete ? 'inline-block' : 'none';
            }
        };
        
        const populateConfigSelector = () => { 
            if (!apiConfigSelect) return;
            apiConfigSelect.innerHTML = ''; 
            apiSettings.configurations.forEach(config => { 
                const option = document.createElement('option'); 
                option.value = config.id; 
                option.textContent = config.name; 
                if (config.id == apiSettings.activeConfigurationId) { 
                    option.selected = true; 
                } 
                apiConfigSelect.appendChild(option); 
            }); 
            updateDeleteButtonVisibility();
        }; 
        
        const updateFormForApiType = (type) => { 
            if (apiUrlInput) {
                if (type === 'gemini') {
                    apiUrlInput.value = GEMINI_API_URL;
                    apiUrlInput.disabled = true;
                } else {
                    apiUrlInput.disabled = false;
                }
            }
        }; 
        
        const populateModels = (models, type) => { 
            const group = type === 'openai' ? openaiModelsGroup : geminiModelsGroup; 
            if (!group) return;
            group.innerHTML = ''; 
            Object.keys(models).forEach(modelId => { 
                const option = document.createElement('option'); 
                option.value = modelId; 
                option.textContent = type === 'gemini' ? models[modelId] : modelId; 
                group.appendChild(option); 
            }); 
        }; 
        
        const loadConfigurationDetails = (configId) => { 
            const config = apiSettings.configurations.find(c => c.id == configId); 
            if (!config) return; 
            if (apiTypeSelect) apiTypeSelect.value = config.type; 
            if (apiKeyInput) apiKeyInput.value = config.apiKey || ''; 

            updateFormForApiType(config.type); 
            if (config.type === 'openai' && apiUrlInput) {
                apiUrlInput.value = config.apiUrl || ''; 
            }
            
            populateModels(defaultModels[config.type], config.type); 
            if(config.model && modelSelect) { 
                const tempOption = document.createElement('option'); 
                tempOption.value = config.model; 
                tempOption.textContent = config.model; 
                const group = config.type === 'openai' ? openaiModelsGroup : geminiModelsGroup; 
                if (group && !group.querySelector(`option[value="${config.model}"]`)) { 
                    group.appendChild(tempOption); 
                } 
                modelSelect.value = config.model; 
            } 
        }; 
        
        const handleNewConfig = () => { 
            const name = prompt('请输入新配置的名称:', `我的配置 ${apiSettings.configurations.length + 1}`); 
            if (!name) return; 
            const newConfig = { id: Date.now(), name, type: 'openai', apiUrl: '', apiKey: '', model: '' }; 
            apiSettings.configurations.push(newConfig); 
            apiSettings.activeConfigurationId = newConfig.id; 
            saveSettings(); 
            populateConfigSelector(); 
            loadConfigurationDetails(newConfig.id); 
        }; 
        
        const handleDeleteConfig = () => { 
            if (apiSettings.configurations.length <= 2) {
                alert('默认配置无法删除！');
                updateDeleteButtonVisibility();
                return;
            }
            const configIdToDelete = apiConfigSelect ? apiConfigSelect.value : null;
            if (!configIdToDelete) return;
            const configToDelete = apiSettings.configurations.find(c => c.id == configIdToDelete); 
            if (confirm(`确定要删除配置 "${configToDelete.name}" 吗？`)) { 
                apiSettings.configurations = apiSettings.configurations.filter(c => c.id != configIdToDelete); 
                if (apiSettings.activeConfigurationId == configIdToDelete) { 
                    apiSettings.activeConfigurationId = apiSettings.configurations[0].id; 
                } 
                saveSettings(); 
                populateConfigSelector(); 
                loadConfigurationDetails(apiSettings.activeConfigurationId); 
            } 
        }; 
        
        const handleSaveConfig = (e) => { 
            e.preventDefault(); 
            const configId = apiConfigSelect ? apiConfigSelect.value : null;
            if (!configId) return;
            const configToSave = apiSettings.configurations.find(c => c.id == configId); 
            if (!configToSave) return; 
            
            configToSave.type = apiTypeSelect.value; 
            configToSave.apiUrl = (configToSave.type === 'gemini') ? GEMINI_API_URL : apiUrlInput.value.trim(); 
            if (apiKeyInput) configToSave.apiKey = apiKeyInput.value.trim(); 
            if (modelSelect) configToSave.model = modelSelect.value; 
            saveSettings(); 
            alert(`配置 "${configToSave.name}" 已保存！`); 
        }; 
        
        const fetchModels = async () => { 
            const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
            const apiType = apiTypeSelect ? apiTypeSelect.value : 'openai';
            const baseUrl = apiUrlInput ? apiUrlInput.value.trim() : '';

            if (!fetchModelsButtonNew) return;
            fetchModelsButtonNew.textContent = '正在拉取...'; 
            fetchModelsButtonNew.disabled = true; 
            
            try { 
                let fetchedModels; 
                if (apiType === 'openai') { 
                    if (!baseUrl || !apiKey) throw new Error('请先填写 API 地址和密钥！'); 
                    const response = await fetch(`${baseUrl}/v1/models`, { headers: { 'Authorization': `Bearer ${apiKey}` } }); 
                    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`); 
                    const data = await response.json(); 
                    fetchedModels = data.data.reduce((acc, model) => ({ ...acc, [model.id]: model.id }), {}); 
                } else {
                    if (!apiKey) throw new Error('请先填写 Gemini API Key！'); 
                    const response = await fetch(`${baseUrl}/models?key=${apiKey}`); 
                    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`); 
                    const data = await response.json(); 
                    fetchedModels = data.models
                        .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                        .reduce((acc, model) => ({ ...acc, [model.name]: model.displayName }), {});
                } 
                defaultModels[apiType] = fetchedModels; 
                populateModels(fetchedModels, apiType); 
                alert('模型列表拉取成功！'); 
            } catch (error) { 
                const errorMsg = `模型列表拉取失败！\n\n${error.message}\n\n如果使用Gemini，可能是以下配置问题，请检查：\n1. API Key是否解除了"应用限制"。\n2. 项目是否启用了"Vertex AI API"。\n3. 项目是否已关联结算账号。`;
                alert(errorMsg); 
                populateModels(defaultModels[apiType], apiType); 
            } finally { 
                fetchModelsButtonNew.textContent = '拉取模型'; 
                fetchModelsButtonNew.disabled = false; 
            } 
        }; 
        
        apiSettings = getSettings(); 
        if (!apiSettings || !apiSettings.configurations || apiSettings.configurations.length === 0) { 
            if (typeof API_PRESETS !== 'undefined' && API_PRESETS.length > 0) {
                apiSettings = { configurations: JSON.parse(JSON.stringify(API_PRESETS)), activeConfigurationId: API_PRESETS[0].id };
            } else {
                const defaultConfigId = Date.now(); 
                apiSettings = { configurations: [{ id: defaultConfigId, name: '默认配置', type: 'openai', apiUrl: '', apiKey: '', model: '' }], activeConfigurationId: defaultConfigId }; 
            }
            saveSettings(); 
        } 
        
        populateConfigSelector(); 
        loadConfigurationDetails(apiSettings.activeConfigurationId); 
        
        if (apiConfigSelect) apiConfigSelect.addEventListener('change', (e) => { 
            apiSettings.activeConfigurationId = e.target.value; 
            saveSettings(); 
            loadConfigurationDetails(e.target.value); 
        });
        if (apiTypeSelect) apiTypeSelect.addEventListener('change', (e) => { 
            const newType = e.target.value; 
            updateFormForApiType(newType); 
            if (newType === 'openai') { 
                const currentConfig = apiSettings.configurations.find(c => c.id == (apiConfigSelect ? apiConfigSelect.value : null)); 
                if (apiUrlInput) apiUrlInput.value = currentConfig?.apiUrl || ''; 
            } 
            populateModels(defaultModels[newType], newType); 
        });
        if (btnNewConfig) btnNewConfig.addEventListener('click', handleNewConfig); 
        if (btnDeleteConfig) btnDeleteConfig.addEventListener('click', handleDeleteConfig); 
        if (apiSettingsFormEl) apiSettingsFormEl.addEventListener('submit', handleSaveConfig); 
        if (btnSaveConfig) btnSaveConfig.addEventListener('click', () => apiSettingsFormEl && apiSettingsFormEl.requestSubmit());
        if (fetchModelsButtonNew) fetchModelsButtonNew.addEventListener('click', fetchModels);
        if (apiKeyInput) {
            apiKeyInput.addEventListener('focus', () => { apiKeyInput.type = 'text'; }); 
            apiKeyInput.addEventListener('blur', () => { apiKeyInput.type = 'password'; });
        }
    }

    function setupFullscreenEditor() {
        if (!fullscreenEditorPage || !fullscreenEditorTextarea || !fullscreenEditorBackBtn) return;

        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-expand')) {
                const card = e.target.closest('.settings-card');
                if (!card) return;
                const targetTextarea = card.querySelector('textarea');
                if (!targetTextarea) return;

                currentEditingTextarea = targetTextarea;
                fullscreenEditorTextarea.value = currentEditingTextarea.value;
                fullscreenEditorPage.classList.add('active');
                fullscreenEditorTextarea.focus();
            }
        });

        fullscreenEditorBackBtn.addEventListener('click', () => {
            if (currentEditingTextarea) {
                currentEditingTextarea.value = fullscreenEditorTextarea.value;
            }
            fullscreenEditorPage.classList.remove('active');
            currentEditingTextarea = null;
            fullscreenEditorTextarea.value = '';
        });
    }

    // ===================================================================
    // ==================== 5. INITIALIZATION & EVENTS ===================
    // ===================================================================

    loadData();
    window.chatManager.init();

    if(addUserProfileBtn) {
        addUserProfileBtn.addEventListener('click', () => {
            const newName = prompt('请输入新设定的名称', `我的设定 ${window.appData.userProfiles.length + 1}`);
            if (!newName || newName.trim() === '') return;

            const newProfile = {
                id: `profile_${Date.now()}`,
                name: newName.trim(),
                isDefault: false,
                avatar: 'https://i.imgur.com/uG2g8xX.png',
                gender: '女',
                birthday: '',
                age: '',
                settings: '',
                isGlobal: true,
                boundCharacterId: null
            };

            window.appData.userProfiles.push(newProfile);
            window.appData.activeUserProfileId = newProfile.id;
            saveData();
            loadUserProfileDetails();
            renderUserProfileTags();
        });
    }

    if(userSettingsDeleteBtn) {
        userSettingsDeleteBtn.addEventListener('click', () => {
            const profile = getActiveUserProfile();
            if (!profile || profile.isDefault) return;
            if (confirm(`确定要删除设定 "${profile.name}" 吗？此操作不可撤销。`)) {
                window.appData.userProfiles = window.appData.userProfiles.filter(p => p.id !== profile.id);
                window.appData.activeUserProfileId = 'default';
                saveData();
                loadUserProfileDetails();
                renderUserProfileTags();
            }
        });
    }

    if(userSettingsSaveBtn) {
        userSettingsSaveBtn.addEventListener('click', () => {
            saveActiveUserProfileDetails();
            alert('设置已保存！');
        });
    }

    navButtons.forEach(button => { 
        button.addEventListener('click', () => { 
            const targetId = button.dataset.target; 
            navButtons.forEach(btn => btn.classList.remove('active')); 
            pages.forEach(page => page.classList.remove('active')); 
            button.classList.add('active'); 
            const targetPage = document.getElementById(targetId);
            if (targetPage) targetPage.classList.add('active'); 
        }); 
    });

    if (chatInterfaceBackBtn) {
        chatInterfaceBackBtn.addEventListener('click', () => {
            if (chatInterfacePage) {
                chatInterfacePage.classList.remove('active');
            }
        });
    }
    
    openSidebarTriggers.forEach(trigger => trigger.addEventListener('click', () => appContainer.classList.add('sidebar-open')));
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => appContainer.classList.remove('sidebar-open'));
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => appContainer.classList.remove('sidebar-open'));
    
    if(contactTabs) {
        contactTabs.forEach(tab => { 
            tab.addEventListener('click', () => { 
                const targetId = tab.dataset.target; 
                contactTabs.forEach(t => t.classList.remove('active')); 
                tabContents.forEach(c => c.classList.remove('active')); 
                tab.classList.add('active'); 
                const targetContent = document.getElementById(targetId);
                if (targetContent) targetContent.classList.add('active'); 
            }); 
        });
    }
    
    if(contactGroupsContainer) { 
        contactGroupsContainer.addEventListener('click', (e) => { 
            const header = e.target.closest('.group-header'); 
            if (header && header.parentElement.querySelector('.contact-list')) { 
                header.closest('.group-item').classList.toggle('open'); 
            } 
        }); 
    }
    
    if(openWeatherModalBtn) openWeatherModalBtn.addEventListener('click', () => openModal(weatherModal));
    if(openLocationModalBtn) openLocationModalBtn.addEventListener('click', () => openModal(locationModal));
    if(headerStatusTrigger) headerStatusTrigger.addEventListener('click', () => openModal(statusModal));
    if(closeButtons) closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
    if(modalContainer) modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) closeModal(); });
    if(addLocationBtn) addLocationBtn.addEventListener('click', () => { 
        window.appData.locations.push({ id: Date.now(), name: '', address: '', selected: false }); 
        saveData(); 
        renderLocationCards(); 
    });
    
    if (headerPlusBtn && headerPopoverMenu) { 
        headerPlusBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            headerPopoverMenu.classList.toggle('visible'); 
        }); 
        document.addEventListener('click', (e) => { 
            if (!headerPopoverMenu.contains(e.target) && !headerPlusBtn.contains(e.target)) { 
                headerPopoverMenu.classList.remove('visible'); 
            } 
        }); 
    }
    
    setupPageTransition(sidebarProfileLink, userSettingsPage, () => appContainer.classList.add('sidebar-open'));
    setupPageTransition(sidebarDataLink, dataManagementPage, () => appContainer.classList.add('sidebar-open'));
    setupPageTransition(sidebarApiLink, apiSettingsPage, () => appContainer.classList.add('sidebar-open'));
    setupPageTransition(sidebarInjectLink, injectPage, () => appContainer.classList.add('sidebar-open'));
    setupPageTransition(sidebarFavoritesLink, favoritesPage, () => appContainer.classList.add('sidebar-open'));
    setupPageTransition(sidebarBeautifyLink, beautifyPage, () => appContainer.classList.add('sidebar-open'));
    setupPageTransition(sidebarWalletLink, walletPage, () => appContainer.classList.add('sidebar-open'));
    setupPageTransition(sidebarSpecialLink, specialPage, () => appContainer.classList.add('sidebar-open'));

    if (actionGrids) {
        actionGrids.forEach(grid => {
            grid.addEventListener('click', (e) => {
                const actionItem = e.target.closest('.action-item');
                if (actionItem) {
                    alert('该功能待开发…');
                }
            });
        });
    }

    // --- [修改] 新的角色创建/编辑入口绑定 ---
    const btnCreateCharacter = document.getElementById('btn-create-character');
    if (btnCreateCharacter) {
        btnCreateCharacter.addEventListener('click', () => {
            if (headerPopoverMenu) headerPopoverMenu.classList.remove('visible');
            openCharacterEditor(); // 调用旧函数，不传ID，表示创建
        });
    }

    if (defaultGroupContactsContainer) {
        defaultGroupContactsContainer.addEventListener('click', (e) => {
            const clickedItem = e.target.closest('.chat-item[data-char-id]');
            if (clickedItem) {
                const charId = clickedItem.dataset.charId;
                openCharacterEditor(charId); // 调用旧函数，传入ID，表示编辑
            }
        });
    }

    // [修改] “编辑主页”按钮的点击事件，现在调用新函数
    if (editCharacterHomepageBtn) {
        editCharacterHomepageBtn.addEventListener('click', () => {
            const charId = window.chatManager.currentCharacterId;
            if (charId) {
                openCharacterHomepage(charId); // 调用新函数，打开角色主页
            }
        });
    }

    // ===================================================================
    // ==================== 6. INJECTION SETTINGS LOGIC ==================
    // ===================================================================
    function setupInjectionSettingsPage() {
        if (!injectPage) return;

        const toggleInjectLock = document.getElementById('toggle-inject-lock');
        const injectSettingsCard = injectPage.querySelector('.inject-settings-card');

        const setInjectLockState = (locked) => {
            if (!injectSettingsCard || !toggleInjectLock) return;
            if (locked) {
                injectSettingsCard.classList.add('locked');
                toggleInjectLock.classList.remove('fa-lock-open');
                toggleInjectLock.classList.add('fa-lock');
            } else {
                injectSettingsCard.classList.remove('locked');
                toggleInjectLock.classList.remove('fa-lock');
                toggleInjectLock.classList.add('fa-lock-open');
            }
        };

        if (toggleInjectLock) {
            toggleInjectLock.addEventListener('click', () => {
                const isCurrentlyLocked = injectSettingsCard.classList.contains('locked');
                setInjectLockState(!isCurrentlyLocked);
            });
        }

        const updatePromptDeleteButtonVisibility = () => {
            if (btnDeletePrompt) {
                const canDelete = window.appData.prompts.length > 2;
                btnDeletePrompt.style.display = canDelete ? 'inline-block' : 'none';
            }
        };

        if (!window.appData.prompts || window.appData.prompts.length === 0) {
            window.appData.prompts = JSON.parse(JSON.stringify(initialData.prompts));
            window.appData.activePromptId = window.appData.prompts[0].id;
            saveData();
        }

        const populatePromptSelector = () => {
            if (!promptSelect) return;
            promptSelect.innerHTML = '';
            window.appData.prompts.forEach(prompt => {
                const option = document.createElement('option');
                option.value = prompt.id;
                option.textContent = prompt.name;
                if (prompt.id == window.appData.activePromptId) {
                    option.selected = true;
                }
                promptSelect.appendChild(option);
            });
            updatePromptDeleteButtonVisibility();
        };

        const loadPromptDetails = (promptId) => {
            const prompt = window.appData.prompts.find(p => p.id == promptId);
            if (!prompt) return;
            const settings = prompt.settings;

            const updateControl = (slider, input, value, isFloat = false) => {
                if (slider && input) {
                    slider.value = value;
                    input.value = isFloat ? parseFloat(value).toFixed(2) : Math.round(value);
                    updateSliderTrack(slider);
                }
            };
            
            updateControl(injectMaxContextSlider, injectMaxContextValue, settings.maxContext);
            updateControl(injectMaxResponseSlider, injectMaxResponseValue, settings.maxResponse);
            updateControl(injectTempSlider, injectTempValue, settings.temperature, true);
            updateControl(injectTopPSlider, injectTopPValue, settings.topP, true);

            if (injectAbilitySelect) injectAbilitySelect.value = settings.ability;
            if (injectModeSelect) injectModeSelect.value = settings.mode;
        };

        const saveActivePrompt = () => {
            const activePrompt = window.appData.prompts.find(p => p.id == window.appData.activePromptId);
            if (!activePrompt) return;
            
            activePrompt.settings = {
                maxContext: parseInt(injectMaxContextValue.value, 10),
                maxResponse: parseInt(injectMaxResponseValue.value, 10),
                temperature: parseFloat(injectTempValue.value),
                topP: parseFloat(injectTopPValue.value),
                ability: injectAbilitySelect.value,
                mode: injectModeSelect.value
            };
            saveData();
            alert(`提示词 "${activePrompt.name}" 已保存！`);
        };

        const handleNewPrompt = () => {
            const name = prompt('请输入新提示词的名称:', `我的提示词 ${window.appData.prompts.length + 1}`);
            if (!name || name.trim() === '') return;
            const newPrompt = {
                id: `prompt_${Date.now()}`,
                name: name.trim(),
                settings: { ...initialData.injectionSettings }
            };
            window.appData.prompts.push(newPrompt);
            window.appData.activePromptId = newPrompt.id;
            saveData();
            populatePromptSelector();
            loadPromptDetails(newPrompt.id);
        };
        
        const handleDeletePrompt = () => {
            if (window.appData.prompts.length <= 2) {
                alert('默认提示词无法删除！');
                updatePromptDeleteButtonVisibility();
                return;
            }
            const promptToDelete = window.appData.prompts.find(p => p.id == window.appData.activePromptId);
            if (confirm(`确定要删除提示词 "${promptToDelete.name}" 吗？`)) {
                window.appData.prompts = window.appData.prompts.filter(p => p.id != window.appData.activePromptId);
                window.appData.activePromptId = window.appData.prompts[0].id;
                saveData();
                populatePromptSelector();
                loadPromptDetails(window.appData.activePromptId);
                setInjectLockState(true); 
            }
        };

        const setupUIInteractions = () => {
            const linkSliderAndInput = (slider, input, isFloat = false) => {
                if (!slider || !input) return;
                const updateFromSlider = () => {
                    input.value = isFloat ? parseFloat(slider.value).toFixed(2) : Math.round(slider.value);
                    updateSliderTrack(slider);
                };
                const updateFromInput = () => {
                    const min = parseFloat(slider.min);
                    const max = parseFloat(slider.max);
                    let value = isFloat ? parseFloat(input.value) : parseInt(input.value, 10);
                    if (isNaN(value)) value = min;
                    slider.value = Math.max(min, Math.min(value, max));
                    input.value = isFloat ? parseFloat(slider.value).toFixed(2) : Math.round(slider.value);
                    updateSliderTrack(slider);
                };
                slider.addEventListener('input', updateFromSlider);
                input.addEventListener('change', updateFromInput);
            };
            linkSliderAndInput(injectMaxContextSlider, injectMaxContextValue);
            linkSliderAndInput(injectMaxResponseSlider, injectMaxResponseValue);
            linkSliderAndInput(injectTempSlider, injectTempValue, true);
            linkSliderAndInput(injectTopPSlider, injectTopPValue, true);
        };

        if (promptSelect) {
            promptSelect.addEventListener('change', (e) => {
                window.appData.activePromptId = e.target.value;
                saveData();
                loadPromptDetails(e.target.value);
            });
        }
        if (btnNewPromptIcon) btnNewPromptIcon.addEventListener('click', handleNewPrompt);
        if (btnDeletePrompt) btnDeletePrompt.addEventListener('click', handleDeletePrompt);
        if (btnSavePrompt) btnSavePrompt.addEventListener('click', saveActivePrompt);
        
        populatePromptSelector();
        loadPromptDetails(window.appData.activePromptId);
        setupUIInteractions();
        setInjectLockState(true);
    }

    function updateSliderTrack(slider) {
        if (!slider) return;
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const val = parseFloat(slider.value) || 0;
        const clampedVal = Math.max(min, Math.min(val, max));
        const percentage = ((clampedVal - min) * 100) / (max - min);
        slider.style.background = `linear-gradient(to right, var(--primary-blue) ${percentage}%, #ddd ${percentage}%)`;
    }

    setupUserSettingsAvatarUpload();
    setupCharacterSettingsPage();
    setupCropperModal();
    setupDataManagement();
    setupApiSettingsPage();
    setupInjectionSettingsPage();
    setupFullscreenEditor();
    setupCharacterHomepagePage(); // [新增] 调用新页面的设置函数

// ===================================================================
    // ==================== [新增] 表情包管理逻辑 =======================
    // ===================================================================
    // script.js

// [替换] 用这个新函数完整替换掉旧的 setupEmojiManagement 函数
// script.js

// [替换] 用这个新函数完整替换掉旧的 setupEmojiManagement 函数
function setupEmojiManagement() {
    const emojiManagementPage = document.getElementById('page-emoji-management');
    const gridContainer = document.getElementById('emoji-management-grid-container');
    const emojiUploadInput = document.getElementById('emoji-upload-input');
    const emojiManagementBackBtn = document.getElementById('emoji-management-back-btn');

    // --- 1. 渲染表情包管理网格的函数 (现在包含删除功能) ---
    // 将这个函数暴露到全局，以便 ChatManager 可以调用它
    window.renderEmojiManagementGrid = function() {
        if (!gridContainer) return;
        gridContainer.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'emoji-management-grid';

        // “上传”功能格
        const uploadCell = document.createElement('div');
        uploadCell.className = 'emoji-item special-function';
        uploadCell.innerHTML = '<i class="fa-solid fa-images"></i>';
        uploadCell.addEventListener('click', () => {
            if (emojiUploadInput) emojiUploadInput.click();
        });
        grid.appendChild(uploadCell);

        // script.js -> 找到 setupEmojiManagement 函数

// 在 window.renderEmojiManagementGrid 函数内部找到这部分
// ...
    // “网络星球”功能格
    const webCell = document.createElement('div');
    webCell.className = 'emoji-item special-function';
    webCell.innerHTML = '<i class="fa-solid fa-globe"></i>';
    // [修改] 修改这里的点击事件
    webCell.addEventListener('click', () => {
        if (webEmojiModal) {
            openModal(webEmojiModal); // 调用通用的打开模态框函数
        } else {
            alert('网络表情模态框未找到！');
        }
    });
    grid.appendChild(webCell);
// ...

        // 遍历仓库，创建每个表情包格子
        window.appData.emojis.forEach(emoji => {
            const emojiCell = document.createElement('div');
            emojiCell.className = 'emoji-item';
            
            const img = document.createElement('img');
            img.src = emoji.data;
            img.alt = emoji.name;
            emojiCell.appendChild(img);
            
            // 【新增】创建删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'emoji-delete-btn';
            deleteBtn.innerHTML = '<i class="fa-solid fa-times"></i>';

            // 【新增】删除按钮的点击事件
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止触发其他事件
                if (confirm(`确定要删除表情 “${emoji.name}” 吗？`)) {
                    window.appData.emojis = window.appData.emojis.filter(e => e.id !== emoji.id);
                    saveData();
                    renderEmojiManagementGrid(); // 重新渲染管理网格
                }
            });
            
            emojiCell.appendChild(deleteBtn);
            grid.appendChild(emojiCell);
        });

        gridContainer.appendChild(grid);
    }

    // --- 2. 处理图片文件读取的函数 ---
    function handleFiles(files) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageDataUrl = e.target.result;
                const name = prompt('请输入表情包名称:', file.name.split('.').slice(0, -1).join('.'));
                if (name === null) return;
                const newEmoji = {
                    id: `emoji_${Date.now()}_${Math.random()}`,
                    name: name || '未命名表情',
                    data: imageDataUrl
                };
                window.appData.emojis.push(newEmoji);
                saveData();
                renderEmojiManagementGrid(); // 上传成功后重新渲染网格
            };
            reader.readAsDataURL(file);
        }
    }

    // --- 3. 绑定页面内部的事件 ---
    if (emojiManagementBackBtn) {
        emojiManagementBackBtn.addEventListener('click', () => {
            if (emojiManagementPage) emojiManagementPage.classList.remove('active');
        });
    }

    if (emojiUploadInput) {
        emojiUploadInput.addEventListener('change', (event) => {
            if (event.target.files.length > 0) handleFiles(event.target.files);
            event.target.value = '';
        });
    }
}

    // ===================================================================
    // ==================== 7. 应用范围设置逻辑 ==========================
    // ===================================================================

    function loadScopeSettingsUI() {
        const profile = getActiveUserProfile();
        if (!profile || !toggleGlobalApply || !characterBindingContainer || !bindCharacterSelect) return;

        toggleGlobalApply.checked = profile.isGlobal;

        if (profile.isGlobal) {
            characterBindingContainer.classList.remove('visible');
        } else {
            characterBindingContainer.classList.add('visible');
        }

        bindCharacterSelect.innerHTML = '';
        if (window.appData.characters.length === 0) {
            const option = document.createElement('option');
            option.textContent = '暂无可选角色';
            option.disabled = true;
            bindCharacterSelect.appendChild(option);
        } else {
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = '请选择一个角色';
            bindCharacterSelect.appendChild(placeholder);

            window.appData.characters.forEach(char => {
                const option = document.createElement('option');
                option.value = char.id;
                option.textContent = char.name;
                bindCharacterSelect.appendChild(option);
            });
        }
        
        bindCharacterSelect.value = profile.boundCharacterId || '';
    }

    if (toggleGlobalApply) {
        toggleGlobalApply.addEventListener('change', () => {
            const profile = getActiveUserProfile();
            if (!profile) return;
            
            profile.isGlobal = toggleGlobalApply.checked;
            if (profile.isGlobal) {
                profile.boundCharacterId = null;
                characterBindingContainer.classList.remove('visible');
            } else {
                characterBindingContainer.classList.add('visible');
            }
            saveData();
        });
    }

    if (bindCharacterSelect) {
        bindCharacterSelect.addEventListener('change', () => {
            const profile = getActiveUserProfile();
            if (!profile) return;

            profile.boundCharacterId = bindCharacterSelect.value;
            saveData();
        });
    }

    if (charChatSettingsBackBtn) {
        charChatSettingsBackBtn.addEventListener('click', () => {
            if (charChatSettingsPage) {
                charChatSettingsPage.classList.remove('active');
            }
        });
    }

    if (clearChatHistoryBtn) {
        clearChatHistoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.chatManager.currentCharacterId) {
                window.chatManager.clearCurrentChat();
            }
        });
    }

    if (exportChatHistoryBtn) {
        exportChatHistoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.chatManager.currentCharacterId) {
                window.chatManager.exportChatHistory();
            }
        });
    }

// script.js -> 在文件末尾，`setupEmojiManagement();` 之前

// script.js -> 在文件末尾，`setupEmojiManagement();` 之前

// script.js -> 找到并替换这个逻辑块

// ===================================================================
// ==================== [修改] 批量网络表情添加逻辑 (V2 - 更强大) ====================
// ===================================================================
if (confirmAddWebEmojiBtn) {
    confirmAddWebEmojiBtn.addEventListener('click', () => {
        if (!webEmojiUrlInput) return;
        const inputText = webEmojiUrlInput.value.trim();

        // 1. 验证输入是否为空
        if (!inputText) {
            alert('输入内容不能为空！');
            return;
        }

        // 2. 定义固定的URL前缀
        const urlPrefix = 'https://i.postimg.cc/';
        const newEmojis = [];
        let errorCount = 0;

        // 3. 【核心优化】先将所有换行符替换为逗号，然后再按逗号分割
        //    这样就能同时支持逗号分隔和换行分隔！
        const entries = inputText.replace(/\n/g, ',').split(',');

        entries.forEach(entry => {
            const trimmedEntry = entry.trim();
            if (!trimmedEntry) return; // 跳过处理后的空条目

            const separatorIndex = trimmedEntry.indexOf(':');

            if (separatorIndex <= 0 || separatorIndex === trimmedEntry.length - 1) {
                errorCount++;
                return; 
            }

            const name = trimmedEntry.substring(0, separatorIndex).trim();
            const suffix = trimmedEntry.substring(separatorIndex + 1).trim();

            if (!name || !suffix) {
                errorCount++;
                return;
            }
            
            const fullUrl = urlPrefix + suffix;

            const newEmoji = {
                id: `emoji_${Date.now()}_${Math.random()}`,
                name: name,
                data: fullUrl
            };
            newEmojis.push(newEmoji);
        });

        // 4. 检查是否有成功解析的表情
        if (newEmojis.length > 0) {
            window.appData.emojis.push(...newEmojis);
            saveData();

            if (typeof window.renderEmojiManagementGrid === 'function') {
                window.renderEmojiManagementGrid();
            }
            if (window.chatManager && typeof window.chatManager.renderEmojiPanel === 'function') {
                window.chatManager.renderEmojiPanel();
            }

            webEmojiUrlInput.value = '';
            closeModal();
            let successMessage = `成功添加了 ${newEmojis.length} 个表情！`;
            if (errorCount > 0) {
                successMessage += `\n有 ${errorCount} 个条目格式错误，已被忽略。`;
            }
            alert(successMessage);
        } else {
            alert('添加失败！请检查所有条目是否都遵循 "名称:后缀" 的格式。');
        }
    });
}
// ===================================================================
// ===================================================================

setupEmojiManagement();
}); // 这是 DOMContentLoaded 的结束括号