document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // ==================== [新增] 动态加载组件 ========================
    // ===================================================================
    fetch('statusBar.html')
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('status-bar-container');
            if (container) {
                container.innerHTML = html;
            }
        });

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
    // [新增] 五个新页面的选择器
    const injectPage = document.getElementById('page-inject');
    const favoritesPage = document.getElementById('page-favorites');
    const beautifyPage = document.getElementById('page-beautify');
    const walletPage = document.getElementById('page-wallet');
    const specialPage = document.getElementById('page-special');

    // [新增] 注入页面控件
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

    // --- Elements for Dynamic User Info Display ---
    const sidebarProfileName = document.querySelector('#sidebar-profile-link .profile-name');
    const sidebarProfileStatus = document.querySelector('#sidebar-profile-link .profile-status');
    const headerUsername = document.querySelector('.header-username');
    const feedUsername = document.querySelector('#page-feed .feed-user-info span');

    // --- Character Settings Page Elements ---
    const btnCreateCharacter = document.getElementById('btn-create-character');
    const charAvatarPreview = document.getElementById('char-avatar-preview');
    const charAvatarInput = document.getElementById('char-avatar-input');
    const characterSettingsForm = {
        name: document.getElementById('input-char-name'),
        gender: document.getElementById('input-char-gender'),
        birthday: document.getElementById('input-char-birthday'),
        age: document.getElementById('input-char-age'),
        settings: document.getElementById('textarea-char-settings')
    };

    // --- Data Management Page Elements ---
    const sidebarDataLink = document.getElementById('sidebar-data-link');
    const btnClearData = document.getElementById('btn-clear-data');

    // [新增] 新侧边栏链接的选择器
    const sidebarInjectLink = document.getElementById('sidebar-inject-link');
    const sidebarFavoritesLink = document.getElementById('sidebar-favorites-link');
    const sidebarBeautifyLink = document.getElementById('sidebar-beautify-link');
    const sidebarWalletLink = document.getElementById('sidebar-wallet-link');
    const sidebarSpecialLink = document.getElementById('sidebar-special-link');

    // --- API Settings Page Elements ---
    const sidebarApiLink = document.getElementById('sidebar-api-link');
    const apiSettingsForm = document.getElementById('api-settings-form');
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

    // --- Grids & Interactive Items ---
    const actionGrids = document.querySelectorAll('.actions-grid');

    // --- Popovers ---
    const headerPlusBtn = document.getElementById('header-plus-btn');
    const headerPopoverMenu = document.getElementById('header-popover-menu');
    
    // --- Cropper Modal Elements ---
    const cropperModal = document.getElementById('cropper-modal');
    const imageToCrop = document.getElementById('image-to-crop');
    const confirmCropBtn = document.getElementById('confirm-crop-btn');
    const cancelCropBtn = document.getElementById('cancel-crop-btn');

    // ===================================================================
    // ==================== 2. STATE MANAGEMENT ==========================
    // ===================================================================

    const STORAGE_KEY = 'felotusAppData';
    let appData = {};
    let newCharacterAvatarData = null;
    let newUserAvatarData = null;
    let currentCropContext = null; 
    let cropper = null;

    const initialData = {
        userProfiles: [
            { id: 'default', name: '用户', isDefault: true, avatar: 'https://i.imgur.com/uG2g8xX.png', gender: '女', birthday: '', age: '', settings: '' }
        ],
        activeUserProfileId: 'default',
        prompts: [
    {
        id: `prompt_${Date.now()}_1`,
        name: '聊天默认提示词',
        settings: { maxContext: 99000, maxResponse: 9000, temperature: 0.75, topP: 0.75, ability: 'auto', mode: 'chat' }
    },
    {
        id: `prompt_${Date.now()}_2`,
        name: '剧情默认提示词',
        settings: { maxContext: 199000, maxResponse: 30000, temperature: 0.85, topP: 0.85, ability: 'auto', mode: 'story' }
    }
],
activePromptId: `prompt_${Date.now()}_1`,
        globalSignature: '', 
        characters: [],
        weather: { options: ['☀️', '⛅️', '☁️', '🌧️', '❄️', '⚡️'], selected: '☀️' },
        locations: [],
        status: { options: ['在线', '离开', '请勿打扰', '听歌中', 'emo中', '恋爱中', '睡觉中'], selected: '在线' },
        injectionSettings: {
            maxContext: 99000,
            maxResponse: 9000,
            temperature: 0.75,
            topP: 0.75,
            ability: 'auto',
            mode: 'chat'
        }
    };

    function getActiveUserProfile() {
        return appData.userProfiles.find(p => p.id === appData.activeUserProfileId) || appData.userProfiles[0];
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    }

    function loadData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                appData = { ...initialData, ...parsedData };
                appData.userProfiles = parsedData.userProfiles && parsedData.userProfiles.length > 0 ? parsedData.userProfiles : [ ...initialData.userProfiles ];
                appData.characters = parsedData.characters || [];
            } catch (e) {
                appData = { ...initialData };
            }
        } else {
            appData = { ...initialData };
        }
        
        loadUserProfileDetails();
        renderUserProfileTags();
        if (inputSignature) inputSignature.value = appData.globalSignature || '';
        
        updateHeaderStatus();
        renderWeatherOptions();
        renderLocationCards();
        renderStatusOptions();
        renderChatList();
        renderContactList();
        updateUserDisplayInfo(); 
    }

    // ===================================================================
    // ==================== 3. UI RENDERING FUNCTIONS ====================
    // ===================================================================

    function renderUserProfileTags() {
        if (!userProfileTagsContainer) return;
        userProfileTagsContainer.innerHTML = '';
        appData.userProfiles.forEach(profile => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = profile.name;
            tag.dataset.id = profile.id;
            if (profile.id === appData.activeUserProfileId) {
                tag.classList.add('active');
            }
            tag.addEventListener('click', () => {
                appData.activeUserProfileId = profile.id;
                loadUserProfileDetails();
                renderUserProfileTags();
            });
            userProfileTagsContainer.appendChild(tag);
        });
        const addTag = document.createElement('span');
        addTag.className = 'tag add-tag';
        addTag.textContent = '添加设定 +';
        addTag.addEventListener('click', () => {
            const newName = prompt('请输入新设定的名称：');
            if (newName && newName.trim()) {
                const newProfile = {
                    id: `profile_${Date.now()}`,
                    name: newName.trim(),
                    isDefault: false,
                    avatar: 'https://i.imgur.com/uG2g8xX.png',
                    gender: '', birthday: '', age: '', settings: ''
                };
                appData.userProfiles.push(newProfile);
                appData.activeUserProfileId = newProfile.id;
                saveData();
                loadUserProfileDetails();
                renderUserProfileTags();
            }
        });
        userProfileTagsContainer.appendChild(addTag);
    }

    function loadUserProfileDetails() {
        const profile = getActiveUserProfile();
        if (!profile) return;
        if (inputName) inputName.value = profile.name || '';
        if (inputGender) inputGender.value = profile.gender || '';
        if (inputBirthday) inputBirthday.value = profile.birthday || '';
        if (inputAge) inputAge.value = profile.age || '';
        if (textareaSettings) textareaSettings.value = profile.settings || '';
        updateUserAvatars(profile.avatar);
        if (userSettingsDeleteBtn) {
            userSettingsDeleteBtn.style.display = profile.isDefault ? 'none' : 'inline-block';
        }
        updateUserDisplayInfo();
    }

    function saveActiveUserProfileDetails() {
        const profile = getActiveUserProfile();
        if (!profile) return;
        if (inputName) profile.name = inputName.value;
        if (inputGender) profile.gender = inputGender.value;
        if (inputBirthday) profile.birthday = inputBirthday.value;
        if (inputAge) profile.age = inputAge.value;
        if (textareaSettings) profile.settings = textareaSettings.value;
        if (inputSignature) appData.globalSignature = inputSignature.value;
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
            const signature = appData.globalSignature || '此处展示个性签名';
            sidebarProfileStatus.textContent = signature.length > 13 ? signature.substring(0, 13) + '…' : signature;
        }
    }
    
    function renderChatList() { 
        if (!chatListContainer) return; 
        chatListContainer.innerHTML = ''; 
        const groupChatItemHTML = `<div class="chat-item"><div class="avatar-group-logo">LOG</div><div class="chat-details"><div class="chat-title">相亲相爱一家人</div><div class="chat-message">AI助手: @全体成员 今天...</div></div><div class="chat-meta">06/05 <i class="fa-solid fa-bell-slash"></i></div></div>`; 
        chatListContainer.insertAdjacentHTML('beforeend', groupChatItemHTML); 
        appData.characters.forEach(char => { 
            const chatItemHTML = `<div class="chat-item"><img src="${char.avatar}" alt="avatar"><div class="chat-details"><div class="chat-title">${char.name}</div><div class="chat-message">我们已经是好友了，现在开始聊天吧！</div></div><div class="chat-meta">${char.creationTime}</div></div>`; 
            chatListContainer.insertAdjacentHTML('beforeend', chatItemHTML); 
        }); 
    }

    function renderContactList() { 
        if (!defaultGroupContactsContainer || !defaultGroupCount) return; 
        defaultGroupContactsContainer.innerHTML = ''; 
        defaultGroupCount.textContent = appData.characters.length; 
        appData.characters.forEach(char => { 
            const contactItemHTML = `<div class="chat-item"><img src="${char.avatar}" alt="avatar"><div class="chat-details"><div class="chat-title">${char.name}</div></div></div>`; 
            defaultGroupContactsContainer.insertAdjacentHTML('beforeend', contactItemHTML); 
        }); 
    }

    function renderStatusOptions() {
        if (!statusOptionsGrid) return;
        statusOptionsGrid.innerHTML = '';
        appData.status.options.forEach(statusText => {
            const btn = document.createElement('button');
            btn.className = 'status-option-btn';
            btn.textContent = statusText;
            if (statusText === appData.status.selected) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                appData.status.selected = statusText;
                saveData();
                updateHeaderStatus();
                renderStatusOptions();
            });
            addLongPressListener(btn, () => {
                if (confirm(`确定要删除状态 "${statusText}" 吗？`)) {
                    appData.status.options = appData.status.options.filter(s => s !== statusText);
                    if (appData.status.selected === statusText) {
                        appData.status.selected = appData.status.options[0] || '在线';
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
            if (appData.status.options.includes(newStatus)) return alert('此状态已存在！');
            appData.status.options.push(newStatus);
            saveData();
            renderStatusOptions();
        });
        statusOptionsGrid.appendChild(addBtn);
    }

    function renderWeatherOptions() {
        if(!weatherOptionsGrid) return;
        weatherOptionsGrid.innerHTML = '';
        appData.weather.options.forEach(icon => {
            const btn = document.createElement('button');
            btn.className = 'weather-option-btn';
            btn.textContent = icon;
            if (icon === appData.weather.selected) btn.classList.add('active');
            btn.addEventListener('click', () => {
                appData.weather.selected = icon;
                saveData();
                renderWeatherOptions();
            });
            addLongPressListener(btn, () => {
                if (confirm(`确定要删除天气 "${icon}" 吗？`)) {
                    appData.weather.options = appData.weather.options.filter(i => i !== icon);
                    if (appData.weather.selected === icon) {
                        appData.weather.selected = appData.weather.options[0] || null;
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
            if (newWeather && !appData.weather.options.includes(newWeather)) {
                appData.weather.options.push(newWeather);
                saveData();
                renderWeatherOptions();
            }
        });
        weatherOptionsGrid.appendChild(addBtn);
    }

    function renderLocationCards() {
        if (!locationCardsContainer) return;
        locationCardsContainer.innerHTML = '';
        appData.locations.forEach(location => {
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
                    appData.locations = appData.locations.filter(loc => loc.id !== location.id);
                    saveData();
                    renderLocationCards();
                }
            });
            card.querySelector('.location-select-indicator').addEventListener('click', () => {
                appData.locations.forEach(loc => loc.selected = (loc.id === location.id) ? !loc.selected : false);
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
        if(headerStatusText) headerStatusText.textContent = appData.status.selected; 
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
        modalContainer.classList.add('visible'); 
        modalElement.classList.add('visible'); 
    }

    function closeModal() { 
        modalContainer.classList.remove('visible'); 
        [weatherModal, locationModal, statusModal, clearDataModal, cropperModal].forEach(m => { 
            if (m) m.classList.remove('visible'); 
        }); 
    }
    
    function setupPageTransition(link, page, onBack) {
        if (!link || !page) return;
        
        const backBtn = page.querySelector('.fa-chevron-left');

        link.addEventListener('click', (e) => {
            e.preventDefault();
            page.classList.add('active');
            appContainer.classList.remove('sidebar-open');
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

    function setupCharacterCreation() {
        const backBtn = document.querySelector('#page-character-settings .fa-chevron-left');
        const saveBtn = document.getElementById('character-settings-save-btn');
        
        btnCreateCharacter.addEventListener('click', () => {
            headerPopoverMenu.classList.remove('visible');
            clearCharacterForm();
            characterSettingsPage.classList.add('active');
        });
        
        if(backBtn) backBtn.addEventListener('click', () => characterSettingsPage.classList.remove('active'));
        
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
        
        function clearCharacterForm() {
            Object.values(characterSettingsForm).forEach(input => {
                if (input) input.value = '';
            });
            if (charAvatarPreview) charAvatarPreview.src = 'https://i.imgur.com/Jz9v5aB.png';
            newCharacterAvatarData = null;
            if(charAvatarInput) charAvatarInput.value = null;
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const name = characterSettingsForm.name ? characterSettingsForm.name.value.trim() : '';
                if (!name) return alert('角色姓名不能为空！');
                const timeString = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
                const newCharacter = {
                    id: Date.now(),
                    name: name,
                    gender: characterSettingsForm.gender ? characterSettingsForm.gender.value : '',
                    birthday: characterSettingsForm.birthday ? characterSettingsForm.birthday.value : '',
                    age: characterSettingsForm.age ? characterSettingsForm.age.value : '',
                    settings: characterSettingsForm.settings ? characterSettingsForm.settings.value : '',
                    avatar: newCharacterAvatarData || 'https://i.imgur.com/Jz9v5aB.png',
                    creationTime: timeString
                };
                appData.characters.push(newCharacter);
                saveData();
                renderChatList();
                renderContactList();
                characterSettingsPage.classList.remove('active');
                document.querySelector('.nav-button[data-target="page-messages"]').click();
                clearCharacterForm();
                alert(`角色 "${name}" 已成功创建！`);
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
            if (currentCropContext.target === 'character') {
                newCharacterAvatarData = croppedImageData;
                if (currentCropContext.previewElement) currentCropContext.previewElement.src = croppedImageData;
            } else if (currentCropContext.target === 'user') {
                newUserAvatarData = croppedImageData;
                updateUserAvatars(croppedImageData);
            }
            cropper.destroy();
            cropper = null;
            currentCropContext = null;
            closeModal();
            if (charAvatarInput) charAvatarInput.value = null;
            if (userAvatarInput) userAvatarInput.value = null;
        });
        cancelCropBtn.addEventListener('click', () => {
            if (cropper) cropper.destroy();
            cropper = null;
            currentCropContext = null;
            closeModal();
            if (charAvatarInput) charAvatarInput.value = null;
            if (userAvatarInput) userAvatarInput.value = null;
        });
    }

    function setupDataManagement() {
        const exportBtn = document.getElementById('btn-export-data');
        const importBtn = document.getElementById('btn-import-data');
        const importInput = document.getElementById('import-file-input');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                saveData();
                const jsonString = JSON.stringify(appData, null, 2);
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
                        appData = Object.assign({}, initialData, importedData);
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
                alert('本地数据已成功清除！应用将重新加载。');
                location.reload();
            });
        }
    }
    
// ===================================================================
// ==================== [核心修改区域] API 设置页面逻辑 =================
// ===================================================================
function setupApiSettingsPage() { 
    if (!apiSettingsPage) return; 
    const API_SETTINGS_KEY = 'aiChatApiSettings_v2'; 
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
    const defaultModels = { openai: {}, gemini: {} }; 
    let apiSettings = {}; 
    
    const getSettings = () => JSON.parse(localStorage.getItem(API_SETTINGS_KEY) || 'null'); 
    // 在 setupApiSettingsPage 函数内
const saveSettings = () => { 
    localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(apiSettings)); 
    // [修改] 从直接调用函数，改为发送一个全局通知
    document.dispatchEvent(new CustomEvent('apiSettingsUpdated')); 
};

    // [新增] 辅助函数：根据配置数量更新删除按钮的可见性
    const updateDeleteButtonVisibility = () => {
        if (btnDeleteConfig) {
            // 当配置数量大于2时，才显示删除按钮
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
        // [新增] 每次更新下拉菜单时，都检查删除按钮状态
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
        const newConfig = { 
            id: Date.now(), 
            name, 
            type: 'openai', 
            apiUrl: '', 
            apiKey: '', 
            model: '' 
        }; 
        apiSettings.configurations.push(newConfig); 
        apiSettings.activeConfigurationId = newConfig.id; 
        saveSettings(); 
        populateConfigSelector(); 
        loadConfigurationDetails(newConfig.id); 
    }; 
    
    const handleDeleteConfig = () => { 
        // [修改] 核心逻辑：保护前两个配置不被删除
        if (apiSettings.configurations.length <= 2) {
            alert('默认配置无法删除！');
            updateDeleteButtonVisibility(); // 确保按钮是隐藏的
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
        
        if (configToSave.type === 'gemini') {
            configToSave.apiUrl = GEMINI_API_URL;
        } else {
            configToSave.apiUrl = apiUrlInput.value.trim(); 
        }
        
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
                const response = await fetch(`${baseUrl}/v1/models`, { 
                    headers: { 'Authorization': `Bearer ${apiKey}` } 
                }); 
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`); 
                const data = await response.json(); 
                fetchedModels = data.data.reduce((acc, model) => ({ ...acc, [model.id]: model.id }), {}); 
            } else { // Gemini
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
            console.log('Initializing API settings from config.js presets.');
            apiSettings = {
                configurations: JSON.parse(JSON.stringify(API_PRESETS)),
                activeConfigurationId: API_PRESETS[0].id 
            };
        } else {
            console.log('config.js not found or is empty. Initializing with a single default API configuration.');
            const defaultConfigId = Date.now(); 
            apiSettings = { 
                configurations: [{ 
                    id: defaultConfigId, 
                    name: '默认配置', 
                    type: 'openai', 
                    apiUrl: '', 
                    apiKey: '', 
                    model: '' 
                }], 
                activeConfigurationId: defaultConfigId 
            }; 
        }
        saveSettings(); 
    } 
    
    populateConfigSelector(); 
    loadConfigurationDetails(apiSettings.activeConfigurationId); 
    
    if (apiConfigSelect) {
        apiConfigSelect.addEventListener('change', (e) => { 
            apiSettings.activeConfigurationId = e.target.value; 
            saveSettings(); 
            loadConfigurationDetails(e.target.value); 
        });
    }
    
    if (apiTypeSelect) {
        apiTypeSelect.addEventListener('change', (e) => { 
            const newType = e.target.value; 
            updateFormForApiType(newType); 
            if (newType === 'openai') { 
                const currentConfig = apiSettings.configurations.find(c => c.id == (apiConfigSelect ? apiConfigSelect.value : null)); 
                if (apiUrlInput) apiUrlInput.value = currentConfig?.apiUrl || ''; 
            } 
            populateModels(defaultModels[newType], newType); 
        });
    }
    
    if (btnNewConfig) btnNewConfig.addEventListener('click', handleNewConfig); 
    if (btnDeleteConfig) btnDeleteConfig.addEventListener('click', handleDeleteConfig); 
    if (apiSettingsForm) apiSettingsForm.addEventListener('submit', handleSaveConfig); 
    
    if (btnSaveConfig) {
        btnSaveConfig.addEventListener('click', () => {
            if (apiSettingsForm) {
                apiSettingsForm.requestSubmit();
            }
        });
    }

    if (fetchModelsButtonNew) fetchModelsButtonNew.addEventListener('click', fetchModels);
            
    if (apiKeyInput) {
        apiKeyInput.addEventListener('focus', () => { 
            apiKeyInput.type = 'text'; 
        }); 
        apiKeyInput.addEventListener('blur', () => { 
            apiKeyInput.type = 'password'; 
        });
    }
}

    

    // ===================================================================
    // ==================== 5. INITIALIZATION & EVENTS ===================
    // ===================================================================

    // --- Initial Data Load ---
    loadData();

    // --- Event Listeners ---
    if(userSettingsDeleteBtn) {
        userSettingsDeleteBtn.addEventListener('click', () => {
            const profile = getActiveUserProfile();
            if (!profile || profile.isDefault) return;
            if (confirm(`确定要删除设定 "${profile.name}" 吗？此操作不可撤销。`)) {
                appData.userProfiles = appData.userProfiles.filter(p => p.id !== profile.id);
                appData.activeUserProfileId = 'default';
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
        appData.locations.push({ id: Date.now(), name: '', address: '', selected: false }); 
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
    
    // 页面跳转设置
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

// ===================================================================
// ==================== 6. INJECTION SETTINGS LOGIC (V2) =============
// ===================================================================
function setupInjectionSettingsPage() {
    if (!injectPage) return;

    // [新增] 辅助函数：根据提示词数量更新删除按钮的可见性
    const updatePromptDeleteButtonVisibility = () => {
        if (btnDeletePrompt) {
            // 当提示词数量大于2时，才显示删除按钮
            const canDelete = appData.prompts.length > 2;
            btnDeletePrompt.style.display = canDelete ? 'inline-block' : 'none';
        }
    };

    // 加载或初始化提示词数据
    if (!appData.prompts || appData.prompts.length === 0) {
        appData.prompts = JSON.parse(JSON.stringify(initialData.prompts));
        appData.activePromptId = appData.prompts[0].id;
        saveData();
    }

    // 填充提示词下拉菜单
    const populatePromptSelector = () => {
        if (!promptSelect) return;
        promptSelect.innerHTML = '';
        appData.prompts.forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt.id;
            option.textContent = prompt.name;
            if (prompt.id == appData.activePromptId) {
                option.selected = true;
            }
            promptSelect.appendChild(option);
        });
        // [新增] 每次更新下拉菜单时，都检查删除按钮状态
        updatePromptDeleteButtonVisibility();
    };

    // 根据ID加载提示词的详细设置到UI
    const loadPromptDetails = (promptId) => {
        const prompt = appData.prompts.find(p => p.id == promptId);
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

    // 保存当前UI上的设置到激活的提示词对象
    const saveActivePrompt = () => {
        const activePrompt = appData.prompts.find(p => p.id == appData.activePromptId);
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

    // 处理新建提示词
    const handleNewPrompt = () => {
        const name = prompt('请输入新提示词的名称:', `我的提示词 ${appData.prompts.length + 1}`);
        if (!name || name.trim() === '') return;
        const newPrompt = {
            id: `prompt_${Date.now()}`,
            name: name.trim(),
            settings: { ...initialData.injectionSettings }
        };
        appData.prompts.push(newPrompt);
        appData.activePromptId = newPrompt.id;
        saveData();
        populatePromptSelector();
        loadPromptDetails(newPrompt.id);
    };
    
    // 处理删除提示词
    const handleDeletePrompt = () => {
        // [修改] 核心逻辑：保护前两个提示词不被删除
        if (appData.prompts.length <= 2) {
            alert('默认提示词无法删除！');
            updatePromptDeleteButtonVisibility(); // 确保按钮是隐藏的
            return;
        }
        const promptToDelete = appData.prompts.find(p => p.id == appData.activePromptId);
        if (confirm(`确定要删除提示词 "${promptToDelete.name}" 吗？`)) {
            appData.prompts = appData.prompts.filter(p => p.id != appData.activePromptId);
            appData.activePromptId = appData.prompts[0].id;
            saveData();
            populatePromptSelector();
            loadPromptDetails(appData.activePromptId);
        }
    };

    // 初始化UI联动
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

    // 绑定事件监听
    if (promptSelect) {
        promptSelect.addEventListener('change', (e) => {
            appData.activePromptId = e.target.value;
            saveData();
            loadPromptDetails(e.target.value);
        });
    }
    if (btnNewPromptIcon) btnNewPromptIcon.addEventListener('click', handleNewPrompt);
    if (btnDeletePrompt) btnDeletePrompt.addEventListener('click', handleDeletePrompt);
    if (btnSavePrompt) btnSavePrompt.addEventListener('click', saveActivePrompt);
    
    // 首次加载和初始化
    populatePromptSelector();
    loadPromptDetails(appData.activePromptId);
    setupUIInteractions();
}

// 辅助函数：更新滑块背景
function updateSliderTrack(slider) {
    if (!slider) return;
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const clampedVal = Math.max(min, Math.min(val, max));
    const percentage = ((clampedVal - min) * 100) / (max - min);
    slider.style.background = `linear-gradient(to right, var(--primary-blue) ${percentage}%, #ddd ${percentage}%)`;
}

    

    // 功能模块初始化
    setupUserSettingsAvatarUpload();
    setupCharacterCreation();
    setupCropperModal();
    setupDataManagement();
    setupApiSettingsPage();
    setupInjectionSettingsPage(); // [修改] 调用新的主函数

});