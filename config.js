// config.js

/**
 * API 预设配置文件
 * 在这里添加或修改默认的 API 配置。
 * 当用户首次加载应用或清除本地数据后，这里的配置将被用作初始设置。
 *
 * 每个配置对象的结构:
 * {
 *   id: Number | String, // 唯一ID，建议使用 Date.now() 或一个独特的字符串
 *   name: String,        // 在下拉菜单中显示的名称
 *   type: 'openai' | 'gemini', // API 类型
 *   apiUrl: String,      // API 地址 (对于 'gemini' 类型，此项可留空)
 *   apiKey: String,      // 你的 API Key (建议留空，让用户自行填写)
 *   model: String        // 默认选择的模型 (可以留空)
 * }
 */

const API_PRESETS = [
    {
        id: `preset_${Date.now()}_1`,
        name: '兼容 OpenAI',
        type: 'openai',
        apiUrl: '',
        apiKey: '',
        model: ''
    },
    // 上面那个 "自定义中转" 的对象已经被删掉了
    {
        id: `preset_${Date.now()}_3`,
        name: 'Google Gemini',
        type: 'gemini',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta',
        apiKey: '',
        model: ''
    }
];