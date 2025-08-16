// statusBar.js

// [修改] 将 'DOMContentLoaded' 替换为 'statusBarLoaded'
document.addEventListener('statusBarLoaded', () => {
    // 1. 获取状态栏所需的元素
    const timeElement = document.getElementById('status-bar-time');
    const batteryLiquid = document.getElementById('battery-capsule-liquid');
    const batteryLevelText = document.getElementById('battery-capsule-level');
    const batteryCapsule = document.getElementById('battery-capsule');
    const modelStatusKey = document.getElementById('model-status-key');

    // 2. 状态栏自身的功能函数
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

    // 这是“监听钥匙”的核心逻辑
    function updateModelStatusKey() {
        if (!modelStatusKey) return;
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

    // 3. 初始化和事件监听
    updateClock(); 
    setInterval(updateClock, 1000); 
    setupBattery();
    updateModelStatusKey(); // 页面加载时立即检查一次

    // 关键：监听从主脚本发来的通知，当API设置变化时更新钥匙状态
    document.addEventListener('apiSettingsUpdated', updateModelStatusKey);
}); // [修改] 确保这里是 'statusBarLoaded' 事件的闭合括号
