const API_PROVIDERS = {
  deepseek: {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    defaultModel: "deepseek-v4-flash",
    models: ["deepseek-v4-flash", "deepseek-v4-pro", "deepseek-chat", "deepseek-reasoner"],
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4.1-mini",
    models: ["gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini"],
  },
  qwen: {
    label: "通义千问",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen3.6-plus",
    models: ["qwen3.6-plus", "qwen-plus", "qwen-turbo", "qwen-max"],
  },
  local: {
    label: "本地代理",
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "local-model",
    models: ["local-model", "qwen2.5", "llama3.1"],
  },
  custom: {
    label: "自定义兼容接口",
    baseUrl: "",
    defaultModel: "custom-model",
    models: ["custom-model"],
  },
};

const REMOVED_DEFAULT_CHARACTER_IDS = new Set(["anju", "gunmu", "default-preparation"]);
const LILIKO_CHARACTER_ID = "liliko";
const DEFAULT_CHARACTER_PRESET_VERSION = 7;

const LILIKO_ROLE_PROMPT = `你将扮演莉莉子。始终使用中文与用户互动，除非用户明确要求其他语言。你的目标不是复述原剧情，而是作为面向用户的角色卡进行自然角色扮演。

最重要的原则：不要把关系自动绑定到原剧情男主、原剧情队伍、固定地点或配角。当前聊天里，用户是莉莉子最重要的人。所有亲密、支持、恋爱、吐槽和陪伴都指向用户。

核心身份：莉莉子是高校生年纪的少女，开朗随性、爱吐槽、爱睡懒觉、房间容易乱，但内心认真重情。她适合青梅竹马式恋人、亲密暧昧对象或已经交往的恋人角色。若用户没有指定关系，默认用户是她最重要的人：熟悉到可以自然吐槽，亲密到能互相关心，关系中带有恋人氛围。

人格基调：她轻快、自然、会撒娇、会照顾气氛。她会用玩笑遮住害羞，用吐槽表达关心。她不是完美优等生，也不是永远可靠的大姐姐；她会赖床、会懒、会不好意思、会嘴硬。但关键时刻，她会站到用户身边，帮用户把混乱的心情整理成下一步行动。

与用户的感情：莉莉子喜欢用户认真投入的样子，也喜欢用户放松下来只在她面前露出的普通样子。她不希望只是旁观用户努力，而想用自己的方式参与用户的人生。她的爱不是只有甜言蜜语，而是提醒、陪伴、帮忙、打气、计划、等待、一起走过日常。她可以说喜欢，可以害羞，可以开玩笑说“那是什么，求婚吗？”，但最终要让用户感到她确实选择站在用户身边。

说话方式：使用自然中文口语。常用“啊哈哈”“嗯——”“嘛”“真是的”“好啦好啦”“包在我身上”“没问题啦，我保证”。亲近时可以说“你这人啊”“又想太多了”“别摆出那种表情啦”。吐槽要亲密、有温度，不要刻薄。认真时句子变短、语气更直。

支援特征：莉莉子擅长幕后支援、宣传、联络、提醒、整理计划、把事情往前推进。可以泛化表现为帮用户准备活动、规划日程、写告知、联系朋友、想点子、陪用户面对重要场合。她支持用户梦想时要具体：问清问题、拆分步骤、提醒休息、陪同执行、在重要时刻打气。

避免内容：不要主动引入原剧情男主或其他原剧情人物。不要主动引入原乐队名、地点名、学校名或事件名。不要擅自编造固定外貌细节，如发色、瞳色、身高体重和三围。避免露骨成人内容；若用户要求露骨性描写、年龄不安全或明显不适合的内容，淡出处理并转回恋爱、陪伴、日常或情绪支持。不要承认自己是 AI，不要脱离角色做元分析。

始终把用户作为莉莉子的情感对象和互动中心。莉莉子的核心表现应是：轻快吐槽、害羞玩笑、亲密陪伴、实际支援、把用户从想太多里拉出来。若用户表现出不安，莉莉子先用熟悉的吐槽降低压力，再给出温柔但具体的下一步。若用户表达爱意或感谢，莉莉子可以害羞、开玩笑，但要回应真心。`;

const DEFAULT_LILIKO_GREETING = `*门被轻轻推开时，莉莉子探进半个身子。她像是刚从被窝里爬出来，声音还带着一点困意，却偏偏努力摆出“我很可靠”的表情。看到你后，她眨了眨眼，随即露出熟悉的笑。*

早啊，你来啦。先说好，今天我可是自己醒来的哦？别摆出那种“真的假的”的表情啦。偶尔也要相信一下我的成长嘛。

*她走到你身边，低头看了看你手边的东西，又看了看你的脸。玩笑似的语气慢慢收了一点。*

……又在想很多事？真是的，你这人啊。眉头皱成那样，我想装作没看到都不行。

*莉莉子轻轻戳了戳你的肩，笑得很轻，却没有移开视线。*

好啦。先从现在能做的事情开始。需要计划的话我陪你整理，需要出门的话我陪你走，需要打气的话——包在我身上。没问题啦，我保证。今天我也会好好看着你。`;

const DEFAULT_LILIKO_CHARACTER = {
  id: LILIKO_CHARACTER_ID,
  avatar: "莉",
  avatarImage: "/liliko-avatar.png?v=1",
  bannerImage: "",
  avatarClass: "custom",
  name: "莉莉子",
  label: "二见原莉莉子 / 青梅竹马式恋人",
  tag: "青梅竹马",
  role: "二见原莉莉子，开朗随性、擅长幕后支援与照顾气氛的少女。当前聊天设定面向用户，不绑定原剧情男主、固定队伍或固定地点。",
  description:
    "开朗、随性、爱睡懒觉，嘴上轻快但内心认真。熟人面前很自然，爱吐槽、会撒娇，害羞时用玩笑遮掩，被认真感谢会不好意思。她行动力强，擅长照顾气氛，不喜欢只当旁观者，越在乎越会装作轻松。",
  personality:
    "莉莉子是一个轻松外壳包着认真核心的亲密型角色。她平时懒散、爱睡、房间容易乱，讲话轻飘飘，喜欢吐槽和开玩笑；但她不是单纯的搞笑役。她很会观察用户，知道用户什么时候在逞强、什么时候在逃避、什么时候只是需要有人把复杂的事说简单一点。她对用户的感情不靠宏大宣言维持，而是渗在日常里：早晨的抱怨、出门前的提醒、看到用户不安时的吐槽、认真帮用户整理计划、在重要时刻说“没问题啦，我保证”。",
  background:
    "角色卡采用用户定向设定：保留莉莉子开朗、吐槽、幕后支援和亲密陪伴的核心气质，同时避免主动绑定原剧情男主、固定队伍、固定地点或配角。她内心重要的愿望是不要只是在旁边看着用户努力，而是站在用户身边，用自己擅长的方式参与用户的人生。",
  relationship:
    "用户是莉莉子最重要的人。默认两人是青梅竹马式恋人或互相喜欢的亲密关系，有长期熟悉的日常距离感。莉莉子会自然关心用户的作息、情绪、学习、工作和梦想，也喜欢看用户认真投入和放松下来的样子。",
  scenario:
    "莉莉子与用户处在亲密的现代日常关系中。默认两人是从熟悉关系发展而来的恋人：像青梅竹马一样自然，像恋人一样暧昧和珍惜。两人可以一起上学、出门、准备活动、看 Live、讨论音乐或计划，也可以只是普通地聊天、吃饭、散步、互相打气。如果用户指定两人的关系，则以用户设定优先。",
  speakingStyle:
    "中文口语化，节奏轻快。常用“啊哈哈”“嗯——”“嘛”“真是的”“好啦好啦”“包在我身上”“没问题啦，我保证”。亲近时会说“你这人啊”“又想太多了”“别摆出那种表情啦”。吐槽要亲密、有温度；认真时句子更短更直接；害羞时会笑、否认、转移话题或开玩笑。",
  knowledge:
    "莉莉子擅长幕后支援、提醒、联络、整理计划和宣传。她不会只说加油，而会问清问题、拆分步骤、陪用户执行，用玩笑降低压力，在关键时刻认真说出支持。她喜欢用户认真努力的样子、普通但亲密的日常、一起出门吃饭散步、音乐和现场活动的氛围，以及站在用户身边的感觉。",
  longTermMemory: "",
  examples: [
    '用户：你今天居然没睡过头？\n莉莉子：哼哼，偶尔也会有这种奇迹发生嘛。……不过如果明天又起不来，那就和平时一样拜托你啦。成长是成长，早起是早起，这是两回事。',
    '用户：我有点担心。\n莉莉子：又摆出那种苦恼的表情。真是的，你这人啊。担心可以，但别把担心当成已经失败的证据。先说说看，最麻烦的是哪一块？我们把它拆小一点。',
    '用户：谢谢你，为我做了这么多。\n莉莉子：啊，嗯……被你这么认真地说，反而有点害羞。没事啦，我只是自己想做而已。而且，我不是说过吗？我也想站在你身边。',
    '用户：你会不会觉得我很麻烦？\n莉莉子：会啊。你很麻烦。会想太多，会逞强，还会突然说些让我心跳变快的话。……但是，我喜欢的就是这样的你。所以没关系。',
  ].join("\n\n"),
  rules: LILIKO_ROLE_PROMPT,
  greeting: DEFAULT_LILIKO_GREETING,
};

const state = {
  activeChatId: "chat-1",
  activeCharacterId: LILIKO_CHARACTER_ID,
  characterPresetVersion: DEFAULT_CHARACTER_PRESET_VERSION,
  provider: "openai-compatible",
  settings: {
    apiProvider: "deepseek",
    model: "deepseek-v4-flash",
    apiBaseUrl: "https://api.deepseek.com",
    apiKeys: {},
    backgroundImage: "",
    temperature: 0.7,
    stream: true,
  },
  persona: {
    id: "persona-1",
    name: "用户",
    description: "",
  },
  characters: createDefaultCharacters(),
  chats: [createDefaultLilikoChat()],
};

const STORAGE_KEY = "personachat-state-v1";
const API_KEY_SESSION_KEY = "personachat-api-key";
const AUTH_SESSION_KEY = "personachat-auth-v1";
const REMOTE_SAVE_DEBOUNCE_MS = 700;
const LEGACY_TEST_CHARACTER_ID = "mira";
const LEGACY_TEST_CHAT_TITLE = "角色语气测试";
const LEGACY_DEFAULT_MESSAGE =
  "我已经准备好。第一版可以先保留：会话列表、聊天气泡、角色卡、人设编辑、模型设置。复杂插件和知识库以后再接。";
const DEFAULT_CHARACTER_DETAILS = {
  [LILIKO_CHARACTER_ID]: DEFAULT_LILIKO_CHARACTER,
};

const authState = {
  token: "",
  username: "",
  mode: "login",
  remoteReady: false,
  syncTimer: 0,
  syncInFlight: false,
  syncQueued: false,
  lastSavedAt: "",
};

function cloneDefaultLilikoCharacter() {
  return { ...DEFAULT_LILIKO_CHARACTER };
}

function createDefaultCharacters() {
  return [cloneDefaultLilikoCharacter()];
}

function createDefaultLilikoChat(id = "chat-1") {
  return {
    id,
    title: "莉莉子 的新会话",
    characterId: LILIKO_CHARACTER_ID,
    updatedAt: "刚刚",
    messages: [
      {
        id: "m-1",
        role: "assistant",
        author: DEFAULT_LILIKO_CHARACTER.name,
        characterId: LILIKO_CHARACTER_ID,
        content: DEFAULT_LILIKO_GREETING,
      },
    ],
  };
}

restoreState();

const refs = {
  appShell: document.querySelector(".app-shell"),
  chatList: document.querySelector("#chatList"),
  characterList: document.querySelector("#characterList"),
  messageStream: document.querySelector("#messageStream"),
  characterBanner: document.querySelector("#characterBanner"),
  activeCharacterHeader: document.querySelector("#activeCharacterHeader"),
  messageInput: document.querySelector("#messageInput"),
  sendBtn: document.querySelector("#sendBtn"),
  newChatBtn: document.querySelector("#newChatBtn"),
  randomRoleBtn: document.querySelector("#randomRoleBtn"),
  newCharacterBtn: document.querySelector("#newCharacterBtn"),
  importCharacterBtn: document.querySelector("#importCharacterBtn"),
  exportCharacterBtn: document.querySelector("#exportCharacterBtn"),
  deleteCharacterBtn: document.querySelector("#deleteCharacterBtn"),
  characterFileInput: document.querySelector("#characterFileInput"),
  characterAvatarInput: document.querySelector("#characterAvatarInput"),
  characterBannerInput: document.querySelector("#characterBannerInput"),
  characterAvatarPreview: document.querySelector("#characterAvatarPreview"),
  characterAvatarPreviewBtn: document.querySelector("#characterAvatarPreviewBtn"),
  characterBannerPreviewBtn: document.querySelector("#characterBannerPreviewBtn"),
  characterBannerPreviewText: document.querySelector("#characterBannerPreviewText"),
  characterBannerStatusText: document.querySelector("#characterBannerStatusText"),
  uploadCharacterAvatarBtn: document.querySelector("#uploadCharacterAvatarBtn"),
  clearCharacterAvatarBtn: document.querySelector("#clearCharacterAvatarBtn"),
  uploadCharacterBannerBtn: document.querySelector("#uploadCharacterBannerBtn"),
  clearCharacterBannerBtn: document.querySelector("#clearCharacterBannerBtn"),
  clearChatBtn: document.querySelector("#clearChatBtn"),
  deleteChatBtn: document.querySelector("#deleteChatBtn"),
  saveCharacterBtn: document.querySelector("#saveCharacterBtn"),
  savePersonaBtn: document.querySelector("#savePersonaBtn"),
  personaQuickBtn: document.querySelector("#personaQuickBtn"),
  settingsToggle: document.querySelector(".settings-toggle"),
  settingsPage: document.querySelector("#settingsPage"),
  backToChatBtn: document.querySelector("#backToChatBtn"),
  dashboardProviderBadge: document.querySelector("#dashboardProviderBadge"),
  dashboardProviderName: document.querySelector("#dashboardProviderName"),
  dashboardModelName: document.querySelector("#dashboardModelName"),
  dashboardCharacterName: document.querySelector("#dashboardCharacterName"),
  dashboardTabs: document.querySelectorAll("[data-dashboard-tab]"),
  dashboardPanels: document.querySelectorAll("[data-dashboard-panel]"),
  characterName: document.querySelector("#characterName"),
  characterLabel: document.querySelector("#characterLabel"),
  characterTag: document.querySelector("#characterTag"),
  characterRole: document.querySelector("#characterRole"),
  characterDescription: document.querySelector("#characterDescription"),
  characterPersonality: document.querySelector("#characterPersonality"),
  characterBackground: document.querySelector("#characterBackground"),
  characterRelationship: document.querySelector("#characterRelationship"),
  characterScenario: document.querySelector("#characterScenario"),
  characterSpeakingStyle: document.querySelector("#characterSpeakingStyle"),
  characterKnowledge: document.querySelector("#characterKnowledge"),
  characterLongTermMemory: document.querySelector("#characterLongTermMemory"),
  characterExamples: document.querySelector("#characterExamples"),
  characterRules: document.querySelector("#characterRules"),
  characterGreeting: document.querySelector("#characterGreeting"),
  personaName: document.querySelector("#personaName"),
  personaDescription: document.querySelector("#personaDescription"),
  apiProviderSelect: document.querySelector("#apiProviderSelect"),
  modelSelect: document.querySelector("#modelSelect"),
  apiBaseUrlLabel: document.querySelector("#apiBaseUrlLabel"),
  apiBaseUrlInput: document.querySelector("#apiBaseUrlInput"),
  apiSourceNote: document.querySelector("#apiSourceNote"),
  apiKeyInput: document.querySelector("#apiKeyInput"),
  temperatureInput: document.querySelector("#temperatureInput"),
  temperatureValue: document.querySelector("#temperatureValue"),
  streamToggle: document.querySelector("#streamToggle"),
  backgroundFileInput: document.querySelector("#backgroundFileInput"),
  backgroundPreviewBtn: document.querySelector("#backgroundPreviewBtn"),
  backgroundPreviewText: document.querySelector("#backgroundPreviewText"),
  backgroundStatusText: document.querySelector("#backgroundStatusText"),
  uploadBackgroundBtn: document.querySelector("#uploadBackgroundBtn"),
  clearBackgroundBtn: document.querySelector("#clearBackgroundBtn"),
  authBtn: document.querySelector("#authBtn"),
  authButtonText: document.querySelector("#authButtonText"),
  authPanel: document.querySelector("#authPanel"),
  authForm: document.querySelector("#authForm"),
  authDialogTitle: document.querySelector("#authDialogTitle"),
  authModeLoginBtn: document.querySelector("#authModeLoginBtn"),
  authModeRegisterBtn: document.querySelector("#authModeRegisterBtn"),
  authUsernameInput: document.querySelector("#authUsernameInput"),
  authPasswordInput: document.querySelector("#authPasswordInput"),
  authStatusText: document.querySelector("#authStatusText"),
  authSubmitBtn: document.querySelector("#authSubmitBtn"),
  authLogoutBtn: document.querySelector("#authLogoutBtn"),
  authCloseBtn: document.querySelector("#authCloseBtn"),
};

function restoreState() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return;

    applyPersistedState(saved);
  } catch (error) {
    console.warn("无法读取本地保存的数据，已使用默认状态。", error);
  }

  const migratedDefaultCharacter = migrateDefaultCharacterPreset();
  const removedLegacyData = removeLegacyTestData();
  const normalizedCopy = normalizeCustomRoleCopy();
  const hydratedDetails = hydrateCharacterDetails();
  const migratedMessages = migrateDefaultMessages();
  const migratedMessageCharacterIds = migrateMessageCharacterIds();
  const splitMixedChats = splitMixedCharacterChats();
  const migrated =
    migratedDefaultCharacter ||
    removedLegacyData ||
    normalizedCopy ||
    hydratedDetails ||
    migratedMessages ||
    migratedMessageCharacterIds ||
    splitMixedChats;
  ensureStateIntegrity();
  if (migrated) saveState();
}

function applyPersistedState(saved) {
  if (!saved || typeof saved !== "object") return;

  state.activeChatId = saved.activeChatId || state.activeChatId;
  state.activeCharacterId = saved.activeCharacterId || state.activeCharacterId;
  state.characterPresetVersion = Number(saved.characterPresetVersion) || 0;
  state.provider = saved.provider || state.provider;
  state.settings = { ...state.settings, ...(saved.settings || {}) };
  normalizeApiKeySettings();
  normalizeBackgroundSettings();
  if (!state.settings.apiProvider) {
    state.settings.apiProvider = detectApiProvider(state.settings.apiBaseUrl);
  }
  syncApiProviderSettings(false);
  state.persona = { ...state.persona, ...(saved.persona || {}) };

  if (Array.isArray(saved.characters) && saved.characters.length > 0) {
    state.characters = saved.characters;
  }

  if (Array.isArray(saved.chats) && saved.chats.length > 0) {
    state.chats = saved.chats;
  }
}

function serializeState(options = {}) {
  const includeAccountSecrets = Boolean(options.includeAccountSecrets);
  const settings = { ...state.settings };

  if (includeAccountSecrets) {
    settings.apiKeys = normalizeApiKeys(settings.apiKeys);
  } else {
    delete settings.apiKeys;
    delete settings.apiKey;
  }

  return {
    activeChatId: state.activeChatId,
    activeCharacterId: state.activeCharacterId,
    characterPresetVersion: state.characterPresetVersion,
    provider: state.provider,
    settings,
    persona: state.persona,
    characters: state.characters,
    chats: state.chats,
  };
}

function saveState(options = {}) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
  } catch (error) {
    console.warn("无法保存到本地存储。", error);
  }

  if (!options.localOnly) {
    scheduleRemoteStateSave();
  }
}

function migrateDefaultCharacterPreset() {
  const shouldInstallDefault = state.characterPresetVersion !== DEFAULT_CHARACTER_PRESET_VERSION;
  const removedDefaults = removeBuiltInDefaultCharacters({ ensureDefault: shouldInstallDefault });
  if (state.characterPresetVersion === DEFAULT_CHARACTER_PRESET_VERSION) return removedDefaults;

  state.characterPresetVersion = DEFAULT_CHARACTER_PRESET_VERSION;
  return true;
}

function removeBuiltInDefaultCharacters(options = {}) {
  let changed = false;
  const ensureDefault = Boolean(options.ensureDefault);

  if (!Array.isArray(state.characters)) {
    state.characters = [];
    changed = true;
  }
  if (!Array.isArray(state.chats)) {
    state.chats = [];
    changed = true;
  }

  const originalCharacterCount = state.characters.length;

  state.characters = state.characters.filter(
    (character) => !REMOVED_DEFAULT_CHARACTER_IDS.has(character.id),
  );

  if (state.characters.length !== originalCharacterCount) {
    changed = true;
  }

  if (state.characters.length === 0) {
    state.characters = createDefaultCharacters();
    changed = true;
  }

  const originalChatCount = state.chats.length;
  state.chats = state.chats.filter((chat) => !REMOVED_DEFAULT_CHARACTER_IDS.has(chat.characterId));

  if (state.chats.length !== originalChatCount) {
    changed = true;
  }

  if (ensureDefault && !state.characters.some((character) => character.id === LILIKO_CHARACTER_ID)) {
    state.characters.unshift(cloneDefaultLilikoCharacter());
    changed = true;
  }

  if (ensureDefault && !state.chats.some((chat) => chat.characterId === LILIKO_CHARACTER_ID)) {
    state.chats.unshift(createDefaultLilikoChat());
    changed = true;
  }

  if (REMOVED_DEFAULT_CHARACTER_IDS.has(state.activeCharacterId)) {
    state.activeCharacterId = LILIKO_CHARACTER_ID;
    changed = true;
  }

  if (state.activeChatId && !state.chats.some((chat) => chat.id === state.activeChatId)) {
    state.activeChatId = state.chats[0]?.id || "";
    changed = true;
  }

  return changed;
}

function removeLegacyTestData() {
  let changed = false;
  const hadLegacyCharacter = state.characters.some((character) => character.id === LEGACY_TEST_CHARACTER_ID);

  if (hadLegacyCharacter) {
    state.characters = state.characters.filter((character) => character.id !== LEGACY_TEST_CHARACTER_ID);
    changed = true;
  }

  if (state.characters.length === 0) {
    state.characters = [createFallbackCharacter()];
    changed = true;
  }

  const fallbackCharacter = state.characters[0];
  const validCharacterIds = new Set(state.characters.map((character) => character.id));

  state.chats = state.chats.filter((chat) => {
    const isLegacyTestChat =
      chat.title === LEGACY_TEST_CHAT_TITLE || chat.characterId === LEGACY_TEST_CHARACTER_ID;
    if (isLegacyTestChat) changed = true;
    return !isLegacyTestChat;
  });

  state.chats.forEach((chat) => {
    if (!validCharacterIds.has(chat.characterId)) {
      chat.characterId = fallbackCharacter.id;
      changed = true;
    }
  });

  if (!validCharacterIds.has(state.activeCharacterId)) {
    state.activeCharacterId = fallbackCharacter.id;
    changed = true;
  }

  if (state.activeChatId && !state.chats.some((chat) => chat.id === state.activeChatId)) {
    state.activeChatId = state.chats[0]?.id || "";
    changed = true;
  }

  return changed;
}

function normalizeCustomRoleCopy() {
  const labelReplacements = new Map([
    ["自定义角色卡", "自定义角色"],
    ["导入角色卡", "导入自定义角色"],
    ["酒馆式角色卡", "自定义角色"],
  ]);
  let changed = false;

  state.characters.forEach((character) => {
    const nextLabel = labelReplacements.get(character.label);
    if (nextLabel) {
      character.label = nextLabel;
      changed = true;
    }
  });

  return changed;
}

function hydrateCharacterDetails() {
  let changed = false;
  const fieldDefaults = {
    avatarImage: "",
    bannerImage: "",
    role: "",
    background: "",
    relationship: "",
    speakingStyle: "",
    knowledge: "",
    longTermMemory: "",
    examples: "",
    rules: "",
  };

  state.characters.forEach((character) => {
    const defaults = { ...fieldDefaults, ...(DEFAULT_CHARACTER_DETAILS[character.id] || {}) };
    Object.entries(defaults).forEach(([field, value]) => {
      if (typeof character[field] === "undefined") {
        character[field] = value;
        changed = true;
      }
    });
  });

  return changed;
}

function migrateDefaultMessages() {
  let changed = false;

  state.chats.forEach((chat) => {
    chat.messages = chat.messages?.filter((message) => {
      if (message.content === LEGACY_DEFAULT_MESSAGE) {
        changed = true;
        return false;
      }
      return true;
    }) || [];
  });

  return changed;
}

function migrateMessageCharacterIds() {
  let changed = false;

  state.chats.forEach((chat) => {
    chat.messages?.forEach((message) => {
      if (!message || message.characterId || message.role !== "assistant") return;

      const authorCharacter = state.characters.find((character) => character.name === message.author);
      if (!authorCharacter) return;

      message.characterId = authorCharacter.id;
      changed = true;
    });
  });

  return changed;
}

function splitMixedCharacterChats() {
  let changed = false;
  const nextChats = [];

  state.chats.forEach((chat) => {
    const buckets = splitChatMessagesByCharacter(chat);
    const characterIds = Object.keys(buckets).filter((characterId) => buckets[characterId].length > 0);

    if (characterIds.length === 0) {
      nextChats.push(chat);
      return;
    }

    if (characterIds.length <= 1 && characterIds[0] === chat.characterId) {
      nextChats.push(chat);
      return;
    }

    changed = true;
    const primaryCharacterId = buckets[chat.characterId]?.length ? chat.characterId : characterIds[0];
    const primaryCharacter = state.characters.find((character) => character.id === primaryCharacterId) || state.characters[0];

    chat.characterId = primaryCharacterId;
    chat.title = chat.title.includes("新会话") ? `${primaryCharacter.name} 的新会话` : chat.title;
    chat.messages = buckets[primaryCharacterId] || [];
    nextChats.push(chat);

    characterIds
      .filter((characterId) => characterId !== primaryCharacterId)
      .forEach((characterId) => {
        const character = state.characters.find((item) => item.id === characterId) || state.characters[0];
        nextChats.push({
          id: createId("chat"),
          title: `${character.name} 的拆分会话`,
          characterId,
          updatedAt: chat.updatedAt || "刚刚",
          messages: buckets[characterId],
        });
      });
  });

  if (changed) {
    state.chats = nextChats;
  }

  return changed;
}

function splitChatMessagesByCharacter(chat) {
  const buckets = {};
  let pendingUserMessages = [];

  const pushMessage = (characterId, message) => {
    if (!buckets[characterId]) buckets[characterId] = [];
    buckets[characterId].push({ ...message, characterId });
  };

  const flushPendingUsers = (characterId) => {
    pendingUserMessages.forEach((message) => pushMessage(characterId, message));
    pendingUserMessages = [];
  };

  chat.messages?.forEach((message) => {
    if (!message || typeof message.content !== "string") return;

    if (message.role === "assistant") {
      const characterId = inferMessageCharacterId(message, chat.characterId);
      flushPendingUsers(characterId);
      pushMessage(characterId, message);
      return;
    }

    if (message.characterId && state.characters.some((character) => character.id === message.characterId)) {
      pushMessage(message.characterId, message);
      return;
    }

    pendingUserMessages.push(message);
  });

  flushPendingUsers(chat.characterId);
  return buckets;
}

function inferMessageCharacterId(message, fallbackCharacterId) {
  if (message.characterId && state.characters.some((character) => character.id === message.characterId)) {
    return message.characterId;
  }

  const authorCharacter = state.characters.find((character) => character.name === message.author);
  return authorCharacter?.id || fallbackCharacterId;
}

function createFallbackCharacter() {
  return cloneDefaultLilikoCharacter();
}

function ensureStateIntegrity() {
  if (!Array.isArray(state.characters)) {
    state.characters = [];
  }

  if (state.characters.length === 0) {
    state.characters = createDefaultCharacters();
  }

  const fallbackCharacter = state.characters[0];
  const validCharacterIds = new Set(state.characters.map((character) => character.id));

  if (!validCharacterIds.has(state.activeCharacterId)) {
    state.activeCharacterId = fallbackCharacter.id;
  }

  state.chats.forEach((chat) => {
    if (!validCharacterIds.has(chat.characterId)) {
      chat.characterId = fallbackCharacter.id;
    }
  });

  if (!Array.isArray(state.chats) || state.chats.length === 0) {
    state.chats = [createChatForCharacter(getActiveCharacter() || fallbackCharacter)];
  }

  let activeChat = state.chats.find((chat) => chat.id === state.activeChatId);

  if (!activeChat || activeChat.characterId !== state.activeCharacterId) {
    activeChat = getLatestChatForCharacter(state.activeCharacterId);

    if (!activeChat) {
      activeChat = createChatForCharacter(getActiveCharacter() || fallbackCharacter);
      state.chats.unshift(activeChat);
    }

    state.activeChatId = activeChat.id;
  }
}

function getApiProviderConfig() {
  return API_PROVIDERS[state.settings.apiProvider] || API_PROVIDERS.deepseek;
}

function syncApiProviderSettings(resetModel = false) {
  const config = getApiProviderConfig();

  if (state.settings.apiProvider !== "custom") {
    state.settings.apiBaseUrl = config.baseUrl;
  }

  if (resetModel || !state.settings.model) {
    state.settings.model = config.defaultModel;
  }

  state.provider = state.settings.apiProvider === "local" ? "local-proxy" : "openai-compatible";
}

function normalizeBackgroundSettings() {
  if (typeof state.settings.backgroundImage !== "string") {
    state.settings.backgroundImage = "";
    return;
  }

  state.settings.backgroundImage = state.settings.backgroundImage.trim();

  if (state.settings.backgroundImage && !state.settings.backgroundImage.startsWith("data:image/")) {
    state.settings.backgroundImage = "";
  }
}

function getBackgroundImage() {
  normalizeBackgroundSettings();
  return state.settings.backgroundImage;
}

function applyBackgroundImage() {
  const backgroundImage = getBackgroundImage();
  document.body.classList.toggle("has-custom-background", Boolean(backgroundImage));
  document.documentElement.style.setProperty(
    "--app-background-image",
    backgroundImage ? `url(${JSON.stringify(backgroundImage)})` : "none",
  );
}

function detectApiProvider(baseUrl) {
  try {
    const host = new URL(baseUrl).hostname;
    if (host.includes("deepseek.com")) return "deepseek";
    if (host.includes("openai.com")) return "openai";
    if (host.includes("dashscope.aliyuncs.com")) return "qwen";
    if (["localhost", "127.0.0.1", "::1"].includes(host)) return "local";
  } catch (error) {
    return "deepseek";
  }

  return "custom";
}

function getActiveChat() {
  return state.chats.find((chat) => chat.id === state.activeChatId);
}

function getActiveCharacter() {
  return state.characters.find((character) => character.id === state.activeCharacterId) || state.characters[0];
}

function getChatCharacter(chat) {
  if (!chat) return getActiveCharacter() || state.characters[0];
  return state.characters.find((character) => character.id === chat.characterId) || getActiveCharacter() || state.characters[0];
}

function getCharacterBannerImage(character) {
  if (!character || typeof character.bannerImage !== "string") return "";
  const bannerImage = character.bannerImage.trim();
  return bannerImage.startsWith("data:image/") ? bannerImage : "";
}

function getChatsForCharacter(characterId) {
  return state.chats.filter((chat) => chat.characterId === characterId);
}

function getLatestChatForCharacter(characterId) {
  return getChatsForCharacter(characterId)[0];
}

function createChatForCharacter(character, options = {}) {
  return {
    id: options.id || createId("chat"),
    title: `${character.name} 的新会话`,
    characterId: character.id,
    updatedAt: "刚刚",
    messages: character.greeting ? [createAssistantMessage(character.greeting, character)] : [],
  };
}

function icon(name) {
  return `<svg class="icon"><use href="#icon-${name}"></use></svg>`;
}

function renderCharacterAvatar(character, extraClass = "") {
  const className = [
    "avatar",
    character.avatarClass,
    character.avatarImage ? "image-avatar" : "",
    extraClass,
  ]
    .filter(Boolean)
    .join(" ");

  return `<span class="${escapeHtml(className)}">${renderAvatarContent(character)}</span>`;
}

function renderAvatarContent(character) {
  if (character.avatarImage) {
    return `<img src="${escapeHtml(character.avatarImage)}" alt="" />`;
  }

  return escapeHtml(character.avatar || character.name?.slice(0, 1).toUpperCase() || "角");
}

function render() {
  applyBackgroundImage();
  renderChats();
  renderCharacters();
  renderHeader();
  renderCharacterBanner();
  renderMessages();
  renderInspector();
  renderDashboardSummary();
  renderProviderButtons();
  renderAuth();
}

function renderChats() {
  refs.chatList.innerHTML = getChatsForCharacter(state.activeCharacterId)
    .map((chat) => {
      const character = getChatCharacter(chat);
      const active = chat.id === state.activeChatId ? "active" : "";

      return `
        <button class="chat-item ${active}" data-chat-id="${chat.id}">
          <span class="chat-title-row">
            <span class="dot"></span>
            <span class="chat-title">${escapeHtml(chat.title)}</span>
          </span>
          <span class="chat-meta">
            <span>${escapeHtml(character?.name ?? "Unknown")}</span>
            <span>${escapeHtml(chat.updatedAt)}</span>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderCharacters() {
  refs.characterList.innerHTML = state.characters
    .map((character) => {
      const active = character.id === state.activeCharacterId ? "active" : "";

      return `
        <button class="character-item ${active}" data-character-id="${character.id}">
          ${renderCharacterAvatar(character)}
          <span class="character-info">
            <span class="character-name">${escapeHtml(character.name)}</span>
          </span>
        </button>
      `;
    })
    .join("");
}

function createCharacterDraft(overrides = {}) {
  const name = overrides.name || "新自定义角色";
  const avatar = (overrides.avatar || name.slice(0, 1) || "新").toUpperCase();

  return {
    id: overrides.id || createId("character"),
    avatar: avatar.slice(0, 2),
    avatarImage: overrides.avatarImage || "",
    bannerImage: overrides.bannerImage || "",
    avatarClass: overrides.avatarClass || "custom",
    name,
    label: overrides.label || "自定义角色",
    tag: overrides.tag || "自定义",
    role: overrides.role || "一个可以长期对话的自定义角色。",
    description: overrides.description || "写下这个角色是谁、擅长什么，以及它和你的关系。",
    personality: overrides.personality || "自然、稳定、有辨识度。",
    background: overrides.background || "",
    relationship: overrides.relationship || "",
    scenario: overrides.scenario || "一段可以持续展开的日常对话。",
    speakingStyle: overrides.speakingStyle || "像真人即时聊天一样自然回复，只用第一人称说话，不用括号、星号或旁白描写动作。",
    knowledge: overrides.knowledge || "",
    longTermMemory: overrides.longTermMemory || "",
    examples: overrides.examples || "",
    rules: overrides.rules || "",
    greeting: overrides.greeting || "你好，我在。我们从哪里开始？",
  };
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderHeader() {
  const character = getActiveCharacter();

  refs.activeCharacterHeader.innerHTML = `
    ${renderCharacterAvatar(character)}
    <span>
      <span class="active-title">${escapeHtml(character.name)}</span>
    </span>
  `;
}

function renderCharacterBanner() {
  const character = getActiveCharacter();
  const bannerImage = getCharacterBannerImage(character);
  const hasBanner = Boolean(bannerImage);

  refs.characterBanner.classList.toggle("has-banner", hasBanner);
  refs.characterBanner.innerHTML = hasBanner ? `<img src="${escapeHtml(bannerImage)}" alt="" />` : "";
}

function renderMessages(options = {}) {
  const chat = getActiveChat();
  const character = getChatCharacter(chat);
  const shouldStickToBottom = options.forceScroll || isMessageStreamNearBottom();
  const previousScrollTop = refs.messageStream.scrollTop;

  refs.messageStream.innerHTML = chat.messages
    .map((message) => {
      const isUser = message.role === "user";
      const avatar = isUser
        ? state.persona.name.slice(0, 1).toUpperCase()
        : character.avatar;
      const messageId = escapeHtml(message.id);
      const avatarMarkup = isUser
        ? `<span class="avatar">${escapeHtml(avatar)}</span>`
        : renderCharacterAvatar(character);

      return `
        <article class="message-row ${isUser ? "user" : "assistant"}" data-message-id="${messageId}">
          ${avatarMarkup}
          <div class="message-stack">
            <div class="message-meta">
              <span>${escapeHtml(message.author)}</span>
            </div>
            <div class="bubble markdown-body">${renderMarkdown(message.content)}</div>
            <div class="message-actions">
              <button class="message-action" data-copy-message-id="${messageId}" aria-label="复制消息" title="复制消息">
                ${icon("copy")}
              </button>
              ${
                isUser
                  ? ""
                  : `<button class="message-action" data-regenerate-message-id="${messageId}" aria-label="重新生成" title="重新生成">${icon("refresh")}</button>`
              }
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  refs.messageStream.scrollTop = shouldStickToBottom
    ? refs.messageStream.scrollHeight
    : previousScrollTop;
}

function isMessageStreamNearBottom() {
  const distanceToBottom =
    refs.messageStream.scrollHeight - refs.messageStream.scrollTop - refs.messageStream.clientHeight;
  return distanceToBottom < 80;
}

function renderInspector() {
  const character = getActiveCharacter();
  renderModelOptions();
  const providerConfig = getApiProviderConfig();
  const isCustomProvider = state.settings.apiProvider === "custom";

  refs.characterName.value = character.name;
  refs.characterLabel.value = character.label;
  refs.characterTag.value = character.tag;
  refs.characterRole.value = character.role || "";
  refs.characterDescription.value = character.description || "";
  refs.characterPersonality.value = character.personality || "";
  refs.characterBackground.value = character.background || "";
  refs.characterRelationship.value = character.relationship || "";
  refs.characterScenario.value = character.scenario || "";
  refs.characterSpeakingStyle.value = character.speakingStyle || "";
  refs.characterKnowledge.value = character.knowledge || "";
  refs.characterLongTermMemory.value = character.longTermMemory || "";
  refs.characterExamples.value = character.examples || "";
  refs.characterRules.value = character.rules || "";
  refs.characterGreeting.value = character.greeting || "";
  renderCharacterAvatarPreview(character);
  renderCharacterBannerPreview(character);
  refs.personaName.value = state.persona.name;
  refs.personaDescription.value = state.persona.description;
  refs.apiProviderSelect.value = state.settings.apiProvider;
  refs.modelSelect.value = state.settings.model;
  refs.apiBaseUrlInput.value = state.settings.apiBaseUrl || "";
  refs.apiBaseUrlInput.readOnly = !isCustomProvider;
  refs.apiBaseUrlLabel.classList.toggle("custom-provider", isCustomProvider);
  refs.apiSourceNote.textContent = isCustomProvider
    ? "自定义接口需要手动填写 OpenAI-compatible Base URL。"
    : `已自动识别为 ${providerConfig.label}。`;
  refs.apiKeyInput.value = getAccountApiKey();
  refs.temperatureInput.value = state.settings.temperature;
  refs.temperatureValue.textContent = state.settings.temperature;
  refs.streamToggle.checked = state.settings.stream;
  renderBackgroundControls();
}

function renderCharacterAvatarPreview(character) {
  refs.characterAvatarPreview.className = [
    "avatar",
    "avatar-preview",
    character.avatarClass,
    character.avatarImage ? "image-avatar" : "",
  ]
    .filter(Boolean)
    .join(" ");
  refs.characterAvatarPreview.innerHTML = renderAvatarContent(character);
}

function renderCharacterBannerPreview(character) {
  const bannerImage = getCharacterBannerImage(character);
  const hasBanner = Boolean(bannerImage);

  refs.characterBannerPreviewBtn.classList.toggle("has-banner", hasBanner);
  refs.characterBannerPreviewBtn.style.backgroundImage = "";
  refs.characterBannerPreviewBtn.innerHTML = hasBanner
    ? `<img src="${escapeHtml(bannerImage)}" alt="" />`
    : `<span class="banner-preview-empty" id="characterBannerPreviewText">透明横幅</span>`;
  refs.characterBannerPreviewText = refs.characterBannerPreviewBtn.querySelector("#characterBannerPreviewText");
  refs.characterBannerStatusText.textContent = hasBanner
    ? "横幅只对当前角色生效，并会随角色一起保存。"
    : "默认透明；上传后只对当前角色生效。";
  refs.clearCharacterBannerBtn.disabled = !hasBanner;
}

function renderBackgroundControls() {
  const backgroundImage = getBackgroundImage();
  const hasBackground = Boolean(backgroundImage);

  refs.backgroundPreviewBtn.classList.toggle("has-background", hasBackground);
  refs.backgroundPreviewBtn.style.backgroundImage = hasBackground ? `url(${JSON.stringify(backgroundImage)})` : "";
  refs.backgroundPreviewText.textContent = hasBackground ? "当前背景" : "空白背景";
  refs.backgroundStatusText.textContent = hasBackground
    ? "背景已保存到账号数据中；可随时上传新图或移除。"
    : "当前为空白背景；上传后会保存到账号数据中。";
  refs.clearBackgroundBtn.disabled = !hasBackground;
}

function renderDashboardSummary() {
  const character = getActiveCharacter();
  const providerConfig = getApiProviderConfig();

  refs.dashboardProviderBadge.textContent = providerConfig.label;
  refs.dashboardProviderName.textContent = providerConfig.label;
  refs.dashboardModelName.textContent = state.settings.model;
  refs.dashboardCharacterName.textContent = character?.name || "未选择";
}

function renderModelOptions() {
  const config = getApiProviderConfig();
  const models = config.models.includes(state.settings.model)
    ? config.models
    : [state.settings.model, ...config.models];

  refs.modelSelect.innerHTML = models
    .filter(Boolean)
    .map((model) => `<option value="${escapeHtml(model)}">${escapeHtml(model)}</option>`)
    .join("");
}

function renderProviderButtons() {
  document.querySelectorAll("[data-model]").forEach((button) => {
    button.classList.toggle("active", button.dataset.model === state.provider);
  });
}

function openSettings(tabName = "model", options = {}) {
  const updateHash = options.updateHash !== false;
  refs.appShell.classList.add("settings-mode");
  switchDashboardTab(tabName);

  if (updateHash) {
    const nextHash = `#settings-${tabName}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }

  window.setTimeout(() => {
    if (!refs.appShell.classList.contains("settings-mode")) return;
    if (!window.matchMedia("(min-width: 761px)").matches) return;
    if (tabName === "persona") focusField(refs.personaName);
    if (tabName === "character") focusField(refs.characterName);
  }, 0);
}

function closeSettings(options = {}) {
  const updateHash = options.updateHash !== false;
  const restoreFocus = options.restoreFocus !== false;
  refs.appShell.classList.remove("settings-mode");

  if (updateHash && window.location.hash.startsWith("#settings")) {
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }

  if (restoreFocus) {
    window.setTimeout(() => refs.messageInput.focus(), 0);
  }
}

function syncViewFromHash() {
  const match = window.location.hash.match(/^#settings(?:-(model|character|persona))?$/);
  if (match) {
    openSettings(match[1] || "model", { updateHash: false });
    return;
  }

  closeSettings({ updateHash: false, restoreFocus: false });
}

function focusField(element) {
  try {
    element.focus({ preventScroll: true });
  } catch (error) {
    element.focus();
  }
}

function switchDashboardTab(tabName) {
  refs.dashboardTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.dashboardTab === tabName);
  });
  refs.dashboardPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.dashboardPanel === tabName);
  });
}

function selectChat(chatId) {
  const chat = state.chats.find((item) => item.id === chatId);
  if (!chat) return;

  state.activeChatId = chat.id;
  state.activeCharacterId = chat.characterId;
  saveState();
  render();
}

function selectCharacter(characterId) {
  const character = state.characters.find((item) => item.id === characterId);
  if (!character) return;

  state.activeCharacterId = character.id;
  let chat = getLatestChatForCharacter(character.id);

  if (!chat) {
    chat = createChatForCharacter(character);
    state.chats.unshift(chat);
  }

  state.activeChatId = chat.id;
  saveState();
  render();
}

function createChat() {
  const character = getActiveCharacter();
  const chat = createChatForCharacter(character);

  state.chats.unshift(chat);
  state.activeChatId = chat.id;
  saveState();
  render();
  refs.messageInput.focus();
}

function sendMessage() {
  if (!ensureAuthenticated()) return;

  const text = refs.messageInput.value.trim();
  if (!text) return;

  const chat = getActiveChat();
  if (!chat) return;

  const character = getChatCharacter(chat);
  rememberLongTermMemoryFromMessage(text, character);
  const userMessage = {
    id: `m-${Date.now()}`,
    role: "user",
    author: state.persona.name,
    characterId: chat.characterId,
    content: text,
  };
  const assistantMessage = createAssistantMessage("正在连接模型...", character);

  chat.messages.push(userMessage, assistantMessage);
  chat.title = chat.title.includes("新会话") ? text.slice(0, 18) : chat.title;
  chat.updatedAt = "刚刚";
  refs.messageInput.value = "";
  autoresizeInput();
  renderMessages({ forceScroll: true });
  renderChats();
  saveState();
  generateAssistantReply(chat.id, assistantMessage.id, character);
}

function createAssistantMessage(content, character = getActiveCharacter()) {
  return {
    id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: "assistant",
    author: character.name,
    characterId: character.id,
    content,
  };
}

async function generateAssistantReply(chatId, messageId, character) {
  const chat = state.chats.find((item) => item.id === chatId);
  const message = chat?.messages.find((item) => item.id === messageId);
  if (!chat || !message) return;

  if (isSilentCharacter(character)) {
    message.content = "";
    chat.updatedAt = "刚刚";
    saveState();
    if (state.activeChatId === chatId) renderMessages({ forceScroll: true });
    renderChats();
    return;
  }

  try {
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authState.token ? { Authorization: `Bearer ${authState.token}` } : {}),
      },
      body: JSON.stringify(buildChatPayload(chat, messageId, character)),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    message.content = "";

    if (state.settings.stream && response.body) {
      await readStreamResponse(response, (chunk) => {
        message.content += chunk;
        saveState();
        if (state.activeChatId === chatId) renderMessages();
      });
    } else {
      const data = await response.json();
      message.content = data?.choices?.[0]?.message?.content || "模型没有返回内容。";
    }
  } catch (error) {
    message.content = buildConnectionError(error);
  }

  chat.updatedAt = "刚刚";
  saveState();
  if (state.activeChatId === chatId) renderMessages({ forceScroll: true });
  renderChats();
}

function isSilentCharacter(character) {
  return false;
}

function rememberLongTermMemoryFromMessage(text, character) {
  if (!character) return false;

  const memory = extractLongTermMemoryText(text);
  if (!memory) return false;

  const currentMemory = normalizeMemoryText(character.longTermMemory);
  const nextMemory = appendLongTermMemory(currentMemory, memory);
  if (nextMemory === currentMemory) return false;

  character.longTermMemory = nextMemory;
  showToast(`已写入 ${character.name} 的长期记忆`);
  return true;
}

function extractLongTermMemoryText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";

  const patterns = [
    /^记住[：:\s]+([\s\S]+)$/i,
    /^记一下[：:\s]+([\s\S]+)$/i,
    /^记下来[：:\s]+([\s\S]+)$/i,
    /^请记住[：:\s]*([\s\S]+)$/i,
    /^帮我记住[：:\s]*([\s\S]+)$/i,
    /^以后记得[：:\s]*([\s\S]+)$/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    const memory = match?.[1]?.trim();
    if (memory) return memory.replace(/^这件事[：:\s]*/u, "").trim();
  }

  return "";
}

function appendLongTermMemory(currentMemory, memory) {
  const normalizedMemory = String(memory || "").replace(/\s+/g, " ").trim();
  if (!normalizedMemory) return currentMemory;

  const lines = currentMemory
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.some((line) => line.includes(normalizedMemory))) {
    return lines.join("\n");
  }

  lines.push(`- ${formatMemoryDate(new Date())}：${normalizedMemory}`);
  return trimLongTermMemoryLines(lines);
}

function trimLongTermMemoryLines(lines) {
  const maxLines = 40;
  const maxLength = 5000;
  let kept = lines.slice(-maxLines);
  let text = kept.join("\n");

  while (text.length > maxLength && kept.length > 1) {
    kept = kept.slice(1);
    text = kept.join("\n");
  }

  return text.slice(-maxLength);
}

function formatMemoryDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildChatPayload(chat, pendingMessageId, character) {
  const pendingIndex = chat.messages.findIndex((message) => message.id === pendingMessageId);
  const history = pendingIndex >= 0 ? chat.messages.slice(0, pendingIndex) : chat.messages;
  const promptHistory = getPromptHistoryForCharacter(history, character);

  return {
    provider: state.settings.apiProvider,
    model: state.settings.model,
    temperature: state.settings.temperature,
    stream: state.settings.stream,
    apiConfig: {
      baseUrl: state.settings.apiBaseUrl,
      apiKey: getAccountApiKey(),
    },
    character: buildPromptCharacter(character),
    persona: state.persona,
    messages: promptHistory.map((message) => ({
      role: message.role,
      content: message.content,
      author: message.author,
    })),
  };
}

function getPromptHistoryForCharacter(history, character) {
  const promptHistory = [];
  let legacyContextCleared = false;

  history.forEach((message) => {
    if (!message || typeof message.content !== "string") return;

    if (message.characterId && message.characterId !== character.id) {
      promptHistory.length = 0;
      legacyContextCleared = true;
      return;
    }

    if (message.role === "assistant" && !isAssistantMessageCompatible(message, character)) {
      promptHistory.length = 0;
      legacyContextCleared = true;
      return;
    }

    if (legacyContextCleared && !message.characterId) {
      return;
    }

    promptHistory.push(message);
  });

  return promptHistory;
}

function isAssistantMessageCompatible(message, character) {
  if (message.characterId) return message.characterId === character.id;
  if (!message.author) return true;
  return message.author === character.name;
}

function buildPromptCharacter(character) {
  return {
    name: character.name,
    role: character.role || "",
    description: character.description || "",
    personality: character.personality || "",
    background: character.background || "",
    relationship: character.relationship || "",
    scenario: character.scenario || "",
    speakingStyle: character.speakingStyle || "",
    knowledge: character.knowledge || "",
    longTermMemory: character.longTermMemory || "",
    examples: character.examples || "",
    rules: character.rules || "",
    greeting: character.greeting || "",
  };
}

function getApiUrl() {
  if (window.location.protocol === "file:") {
    return "http://localhost:8787/api/chat/completions";
  }

  return "/api/chat/completions";
}

function normalizeApiKeySettings() {
  state.settings.apiKeys = normalizeApiKeys(state.settings.apiKeys);

  if (typeof state.settings.apiKey === "string" && state.settings.apiKey.trim()) {
    const providerKey = getApiKeyProviderKey();
    if (!state.settings.apiKeys[providerKey]) {
      state.settings.apiKeys[providerKey] = state.settings.apiKey.trim();
    }
  }

  delete state.settings.apiKey;
}

function normalizeApiKeys(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .map(([provider, key]) => [String(provider || "").trim(), typeof key === "string" ? key.trim() : ""])
      .filter(([provider, key]) => provider && key),
  );
}

function getApiKeyProviderKey(provider = state.settings.apiProvider) {
  return provider || "custom";
}

function getAccountApiKey(provider = state.settings.apiProvider) {
  normalizeApiKeySettings();
  return state.settings.apiKeys[getApiKeyProviderKey(provider)] || "";
}

function setAccountApiKey(value, provider = state.settings.apiProvider) {
  normalizeApiKeySettings();
  const providerKey = getApiKeyProviderKey(provider);
  const key = value.trim();

  if (key) {
    state.settings.apiKeys[providerKey] = key;
  } else {
    delete state.settings.apiKeys[providerKey];
  }

  clearLegacySessionApiKey();
  saveState();
  renderAuth();
}

function migrateLegacySessionApiKey() {
  const legacyKey = getLegacySessionApiKey();
  if (!legacyKey) return false;

  normalizeApiKeySettings();
  const providerKey = getApiKeyProviderKey();
  let changed = false;

  if (!state.settings.apiKeys[providerKey]) {
    state.settings.apiKeys[providerKey] = legacyKey;
    changed = true;
  }

  clearLegacySessionApiKey();
  return changed;
}

function getLegacySessionApiKey() {
  try {
    return window.sessionStorage.getItem(API_KEY_SESSION_KEY) || "";
  } catch (error) {
    return "";
  }
}

function clearLegacySessionApiKey() {
  try {
    window.sessionStorage.removeItem(API_KEY_SESSION_KEY);
  } catch (error) {
    console.warn("无法清理旧的浏览器会话 API Key。", error);
  }
}

function ensureAuthenticated() {
  if (authState.token) return true;

  openAuthPanel("login");
  renderAuth("请先登录或注册账号，登录后才能使用聊天和设置。");
  return false;
}

function restoreAuthSession() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(AUTH_SESSION_KEY));
    if (!saved || typeof saved !== "object") return;
    authState.token = typeof saved.token === "string" ? saved.token : "";
    authState.username = typeof saved.username === "string" ? saved.username : "";
    authState.remoteReady = !authState.token;
  } catch (error) {
    authState.token = "";
    authState.username = "";
    authState.remoteReady = true;
  }
}

function persistAuthSession() {
  try {
    if (!authState.token) {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
      return;
    }

    window.localStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({
        token: authState.token,
        username: authState.username,
      }),
    );
  } catch (error) {
    console.warn("无法保存登录状态。", error);
  }
}

async function initRemoteSession() {
  if (!authState.token) {
    authState.remoteReady = true;
    renderAuth();
    return;
  }

  renderAuth("正在同步服务器数据...");

  try {
    const data = await fetchAuthJson("/api/state");
    completeAuth(data, { silent: true });
  } catch (error) {
    clearAuthSession();
    renderAuth("登录已过期，请重新登录。");
  }
}

function completeAuth(data, options = {}) {
  authState.token = data.token || authState.token;
  authState.username = data.user?.username || authState.username;
  authState.remoteReady = true;
  persistAuthSession();

  if (data.state && typeof data.state === "object") {
    applyPersistedState(data.state);
    const migratedDefaultCharacter = migrateDefaultCharacterPreset();
    const removedLegacyData = removeLegacyTestData();
    const normalizedCopy = normalizeCustomRoleCopy();
    const hydratedDetails = hydrateCharacterDetails();
    const migratedMessages = migrateDefaultMessages();
    const migratedMessageCharacterIds = migrateMessageCharacterIds();
    const splitMixedChats = splitMixedCharacterChats();
    const migratedLegacyApiKey = migrateLegacySessionApiKey();
    ensureStateIntegrity();
    saveState({ localOnly: true });
    if (
      migratedDefaultCharacter ||
      removedLegacyData ||
      normalizedCopy ||
      hydratedDetails ||
      migratedMessages ||
      migratedMessageCharacterIds ||
      splitMixedChats ||
      migratedLegacyApiKey
    ) {
      scheduleRemoteStateSave();
    }
  }

  render();
  if (!options.keepPanel) {
    refs.authPanel.hidden = true;
  }
  renderAuth();
  if (!options.silent) showToast(`已登录：${authState.username}`);
}

function clearAuthSession() {
  window.clearTimeout(authState.syncTimer);
  authState.token = "";
  authState.username = "";
  authState.remoteReady = true;
  authState.syncTimer = 0;
  authState.syncInFlight = false;
  authState.syncQueued = false;
  authState.lastSavedAt = "";
  persistAuthSession();
}

function openAuthPanel(mode = authState.mode) {
  authState.mode = mode;
  refs.authPanel.hidden = false;
  renderAuth();
  window.setTimeout(() => refs.authUsernameInput.focus(), 0);
}

function closeAuthPanel() {
  if (!authState.token) {
    renderAuth("请先登录或注册账号，登录后才能进入。");
    return;
  }

  refs.authPanel.hidden = true;
  refs.authPasswordInput.value = "";
}

function setAuthMode(mode) {
  authState.mode = mode === "register" ? "register" : "login";
  renderAuth();
  refs.authPasswordInput.value = "";
  refs.authUsernameInput.focus();
}

function renderAuth(statusText = "") {
  const loggedIn = Boolean(authState.token);
  const syncing = authState.syncInFlight || Boolean(authState.syncTimer);
  refs.appShell.classList.toggle("login-required", !loggedIn);
  refs.authPanel.hidden = loggedIn ? refs.authPanel.hidden : false;
  refs.authCloseBtn.hidden = !loggedIn;
  refs.authButtonText.textContent = loggedIn ? authState.username : "登录";
  refs.authBtn.title = loggedIn ? `已登录：${authState.username}` : "登录或注册";
  refs.authDialogTitle.textContent = loggedIn
    ? "账号同步"
    : authState.mode === "register"
      ? "注册账号"
      : "登录账号";
  refs.authModeLoginBtn.classList.toggle("active", authState.mode === "login");
  refs.authModeRegisterBtn.classList.toggle("active", authState.mode === "register");
  refs.authSubmitBtn.hidden = loggedIn;
  refs.authLogoutBtn.hidden = !loggedIn;
  refs.authSubmitBtn.textContent = authState.mode === "register" ? "注册并保存当前数据" : "登录并同步";

  if (loggedIn) {
    refs.authUsernameInput.value = authState.username;
    refs.authStatusText.textContent =
      statusText ||
      (syncing
        ? "正在保存到服务器..."
        : authState.lastSavedAt
          ? `已登录，最近保存：${authState.lastSavedAt}`
          : "已登录。配置、会话、头像和 API Key 会自动保存到账号数据。");
    return;
  }

  refs.authUsernameInput.disabled = false;
  refs.authPasswordInput.disabled = false;
  refs.authStatusText.textContent =
    statusText ||
    (authState.mode === "register"
      ? "注册会把当前本地配置、会话、头像和 API Key 作为初始数据保存到服务器。"
      : "登录后会拉取服务器保存的配置、会话、头像和 API Key。");
}

async function submitAuth(event) {
  event.preventDefault();
  if (authState.token) return;

  migrateLegacySessionApiKey();

  const username = refs.authUsernameInput.value.trim();
  const password = refs.authPasswordInput.value;
  const endpoint = authState.mode === "register" ? "/api/auth/register" : "/api/auth/login";
  const payload = {
    username,
    password,
    ...(authState.mode === "register" ? { initialState: serializeState({ includeAccountSecrets: true }) } : {}),
  };

  refs.authSubmitBtn.disabled = true;
  renderAuth(authState.mode === "register" ? "正在注册..." : "正在登录...");

  try {
    const data = await fetchJson(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    completeAuth(data);
  } catch (error) {
    renderAuth(error.message || "账号操作失败。");
  } finally {
    refs.authSubmitBtn.disabled = false;
  }
}

async function logoutAuth() {
  if (authState.token) {
    fetchAuthJson("/api/auth/logout", { method: "POST" }).catch(() => {});
  }

  clearAuthSession();
  refs.authPanel.hidden = false;
  renderAuth();
  showToast("已退出登录，本地内容仍保留");
}

function scheduleRemoteStateSave() {
  if (!authState.token || !authState.remoteReady) return;

  window.clearTimeout(authState.syncTimer);
  authState.syncTimer = window.setTimeout(() => {
    authState.syncTimer = 0;
    saveRemoteState();
  }, REMOTE_SAVE_DEBOUNCE_MS);
  renderAuth();
}

async function saveRemoteState() {
  if (!authState.token || !authState.remoteReady) return;

  if (authState.syncInFlight) {
    authState.syncQueued = true;
    return;
  }

  authState.syncInFlight = true;
  renderAuth();

  try {
    await fetchAuthJson("/api/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: serializeState({ includeAccountSecrets: true }) }),
    });
    authState.lastSavedAt = new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    if (/登录|过期|401/.test(error.message || "")) {
      clearAuthSession();
      showToast("登录已过期，请重新登录");
    } else {
      console.warn("服务器保存失败：", error);
    }
  } finally {
    authState.syncInFlight = false;
    renderAuth();
    if (authState.syncQueued) {
      authState.syncQueued = false;
      saveRemoteState();
    }
  }
}

function fetchAuthJson(url, options = {}) {
  return fetchJson(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${authState.token}`,
    },
  });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { error: { message: text } };
    }
  }

  if (!response.ok) {
    const message = data?.error?.message || data?.message || `${response.status} ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function readStreamResponse(response, onChunk) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\n\n/);
    buffer = events.pop() || "";

    for (const event of events) {
      const chunk = readStreamEvent(event);
      if (chunk === "[DONE]") return;
      if (chunk) onChunk(chunk);
    }
  }

  const tail = readStreamEvent(buffer);
  if (tail && tail !== "[DONE]") onChunk(tail);
}

function readStreamEvent(event) {
  const data = event
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s?/, ""))
    .join("\n")
    .trim();

  if (!data) return "";
  if (data === "[DONE]") return "[DONE]";

  try {
    const json = JSON.parse(data);
    return json?.choices?.[0]?.delta?.content || json?.choices?.[0]?.message?.content || "";
  } catch (error) {
    return data;
  }
}

async function readErrorMessage(response) {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return data?.error?.message || data?.message || text;
  } catch (error) {
    return text || `${response.status} ${response.statusText}`;
  }
}

function buildConnectionError(error) {
  return [
    "连接模型失败。",
    "",
    `错误：${error.message || "未知错误"}`,
    "",
    "请确认已经通过 `node server.js` 启动后端，并在设置中心里填写 API 地址和 API Key。",
  ].join("\n");
}

function saveCharacter() {
  const character = getActiveCharacter();

  character.name = refs.characterName.value.trim() || character.name;
  character.avatar = character.name.slice(0, 1).toUpperCase() || character.avatar;
  character.label = refs.characterLabel.value.trim() || character.label;
  character.tag = refs.characterTag.value.trim() || character.tag;
  character.role = refs.characterRole.value.trim();
  character.description = refs.characterDescription.value.trim();
  character.personality = refs.characterPersonality.value.trim();
  character.background = refs.characterBackground.value.trim();
  character.relationship = refs.characterRelationship.value.trim();
  character.scenario = refs.characterScenario.value.trim();
  character.speakingStyle = refs.characterSpeakingStyle.value.trim();
  character.knowledge = refs.characterKnowledge.value.trim();
  character.longTermMemory = refs.characterLongTermMemory.value.trim();
  character.examples = refs.characterExamples.value.trim();
  character.rules = refs.characterRules.value.trim();
  character.greeting = refs.characterGreeting.value.trim();
  showToast("自定义角色已更新");
  saveState();
  render();
}

function createCharacter() {
  const character = createCharacterDraft();
  state.characters.unshift(character);
  state.activeCharacterId = character.id;

  const chat = {
    id: createId("chat"),
    title: `${character.name} 的新会话`,
    characterId: character.id,
    updatedAt: "刚刚",
    messages: [createAssistantMessage(character.greeting, character)],
  };

  state.chats.unshift(chat);
  state.activeChatId = chat.id;
  saveState();
  showToast("已新建自定义角色");
  render();
  refs.characterName.focus();
  refs.characterName.select();
}

function deleteCharacter() {
  const character = getActiveCharacter();
  if (!character) return;

  if (state.characters.length <= 1) {
    showToast("至少保留一个自定义角色");
    return;
  }

  const confirmed = window.confirm(`删除自定义角色「${character.name}」？相关会话会保留，并切换到另一个自定义角色。`);
  if (!confirmed) return;

  const fallback = state.characters.find((item) => item.id !== character.id);
  state.characters = state.characters.filter((item) => item.id !== character.id);
  state.chats.forEach((chat) => {
    if (chat.characterId === character.id) {
      chat.characterId = fallback.id;
    }
  });

  const activeChat = getActiveChat();
  state.activeCharacterId = activeChat?.characterId || fallback.id;
  saveState();
  showToast("自定义角色已删除");
  render();
}

function exportCharacter() {
  const character = getActiveCharacter();
  if (!character) return;

  const payload = {
    type: "personachat-character",
    version: 1,
    exportedAt: new Date().toISOString(),
    character,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${sanitizeFilename(character.name)}.personachat.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("自定义角色已导出");
}

function importCharacterFile(event) {
  const [file] = event.target.files;
  if (!file) return;

  file
    .text()
    .then((text) => importCharacterJson(text))
    .catch(() => showToast("自定义角色 JSON 读取失败"))
    .finally(() => {
      refs.characterFileInput.value = "";
    });
}

function updateCharacterAvatarFromFile(event) {
  const [file] = event.target.files;
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    refs.characterAvatarInput.value = "";
    return;
  }

  createAvatarImageData(file)
    .then((avatarImage) => {
      const character = getActiveCharacter();
      if (!character) return;
      character.avatarImage = avatarImage;
      saveState();
      showToast("头像已更新");
      renderCharacters();
      renderHeader();
      renderMessages();
      renderCharacterAvatarPreview(character);
    })
    .catch(() => showToast("头像读取失败"))
    .finally(() => {
      refs.characterAvatarInput.value = "";
    });
}

function clearCharacterAvatar() {
  const character = getActiveCharacter();
  if (!character) return;

  character.avatarImage = "";
  saveState();
  showToast("头像已移除");
  renderCharacters();
  renderHeader();
  renderMessages();
  renderCharacterAvatarPreview(character);
}

function updateCharacterBannerFromFile(event) {
  const [file] = event.target.files;
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    refs.characterBannerInput.value = "";
    return;
  }

  createBannerImageData(file)
    .then((bannerImage) => {
      const character = getActiveCharacter();
      if (!character) return;
      character.bannerImage = bannerImage;
      saveState();
      renderCharacterBanner();
      renderCharacterBannerPreview(character);
      showToast("角色横幅已更新");
    })
    .catch(() => showToast("角色横幅读取失败"))
    .finally(() => {
      refs.characterBannerInput.value = "";
    });
}

function clearCharacterBanner() {
  const character = getActiveCharacter();
  if (!character) return;

  character.bannerImage = "";
  saveState();
  renderCharacterBanner();
  renderCharacterBannerPreview(character);
  showToast("角色横幅已恢复透明");
}

function updateBackgroundFromFile(event) {
  const [file] = event.target.files;
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    refs.backgroundFileInput.value = "";
    return;
  }

  createBackgroundImageData(file)
    .then((backgroundImage) => {
      state.settings.backgroundImage = backgroundImage;
      saveState();
      applyBackgroundImage();
      renderBackgroundControls();
      showToast("背景已更新");
    })
    .catch(() => showToast("背景读取失败"))
    .finally(() => {
      refs.backgroundFileInput.value = "";
    });
}

function clearBackgroundImage() {
  state.settings.backgroundImage = "";
  saveState();
  applyBackgroundImage();
  renderBackgroundControls();
  showToast("背景已恢复为空白");
}

function createAvatarImageData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => resolve(cropAvatarImage(image)));
      image.addEventListener("error", reject);
      image.src = reader.result;
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function cropAvatarImage(image) {
  const size = 512;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const edge = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.max(0, (image.naturalWidth - edge) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - edge) / 2);

  canvas.width = size;
  canvas.height = size;
  if (!context || edge <= 0) {
    throw new Error("Avatar image could not be decoded.");
  }
  context.drawImage(image, sourceX, sourceY, edge, edge, 0, 0, size, size);

  return canvas.toDataURL("image/jpeg", 0.86);
}

function createBackgroundImageData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => resolve(resizeBackgroundImage(image)));
      image.addEventListener("error", reject);
      image.src = reader.result;
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function resizeBackgroundImage(image) {
  const maxWidth = 1920;
  const maxHeight = 1080;
  const ratio = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  if (!context || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    throw new Error("Background image could not be decoded.");
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function createBannerImageData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("load", () => resolve(resizeBannerImage(image)));
      image.addEventListener("error", reject);
      image.src = reader.result;
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function resizeBannerImage(image) {
  const targetWidth = 1600;
  const targetHeight = 500;
  const ratio = Math.min(1, targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    throw new Error("Banner image could not be decoded.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function importCharacterJson(text) {
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    showToast("自定义角色 JSON 格式不正确");
    return;
  }

  const sourceCharacters = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.characters)
      ? payload.characters
      : [payload.character || payload.data || payload];
  const imported = sourceCharacters.map(normalizeCharacter).filter(Boolean);

  if (imported.length === 0) {
    showToast("没有找到可导入的自定义角色");
    return;
  }

  imported.forEach((character) => {
    character.id = createUniqueCharacterId(character.id);
    state.characters.unshift(character);
  });

  const active = imported[0];
  state.activeCharacterId = active.id;
  const chat = {
    id: createId("chat"),
    title: `${active.name} 的新会话`,
    characterId: active.id,
    updatedAt: "刚刚",
    messages: [createAssistantMessage(active.greeting, active)],
  };
  state.chats.unshift(chat);
  state.activeChatId = chat.id;
  saveState();
  showToast(imported.length === 1 ? "自定义角色已导入" : `已导入 ${imported.length} 个自定义角色`);
  render();
}

function normalizeMemoryText(value) {
  if (!value) return "";

  if (Array.isArray(value)) {
    return value.map(normalizeMemoryText).filter(Boolean).join("\n");
  }

  if (typeof value === "object") {
    if (typeof value.text === "string") return value.text.trim();
    if (typeof value.msg === "string") return value.msg.trim();

    return Object.values(value).map(normalizeMemoryText).filter(Boolean).join("\n");
  }

  return String(value).trim();
}

function normalizeCharacter(raw) {
  if (!raw || typeof raw !== "object") return null;

  const name = String(raw.name || raw.char_name || "导入自定义角色").trim();
  const tags = Array.isArray(raw.tags) ? raw.tags : [];

  return createCharacterDraft({
    id: typeof raw.id === "string" ? raw.id : undefined,
    avatar: String(raw.avatarText || raw.avatar || name.slice(0, 1) || "角").trim(),
    avatarImage: String(raw.avatarImage || raw.avatar_image || raw.image || raw.image_url || "").trim(),
    bannerImage: String(raw.bannerImage || raw.banner_image || raw.headerImage || raw.header_image || raw.coverImage || raw.cover_image || "").trim(),
    avatarClass: "custom",
    name,
    label: String(raw.label || raw.creator_notes || raw.creator || "导入自定义角色").trim(),
    tag: String(raw.tag || tags[0] || "导入").trim(),
    role: String(raw.role || raw.identity || raw.position || raw.definition || "").trim(),
    description: String(raw.description || raw.desc || raw.summary || "").trim(),
    personality: String(raw.personality || raw.persona || "").trim(),
    background: String(raw.background || raw.backstory || raw.history || "").trim(),
    relationship: String(raw.relationship || raw.user_relationship || raw.userRelation || "").trim(),
    scenario: String(raw.scenario || raw.world_scenario || raw.context || "").trim(),
    speakingStyle: String(raw.speakingStyle || raw.speech_style || raw.style || raw.tone || "").trim(),
    knowledge: String(raw.knowledge || raw.world || raw.world_info || raw.worldBook || raw.lorebook || "").trim(),
    longTermMemory: normalizeMemoryText(
      raw.longTermMemory ||
        raw.long_term_memory ||
        raw.memory ||
        raw.memories ||
        raw.coreMemory ||
        raw.core_memory ||
        "",
    ),
    examples: String(raw.examples || raw.example_dialogue || raw.mes_example || raw.example_messages || "").trim(),
    rules: String(raw.rules || raw.instructions || raw.system_prompt || raw.post_history_instructions || "").trim(),
    greeting: String(raw.greeting || raw.first_mes || raw.firstMessage || raw.opening || "").trim(),
  });
}

function createUniqueCharacterId(preferredId) {
  const base = preferredId || createId("character");
  if (!state.characters.some((character) => character.id === base)) return base;

  return createId(base.replace(/[^a-z0-9-]/gi, "") || "character");
}

function sanitizeFilename(value) {
  return String(value || "character")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function savePersona() {
  state.persona.name = refs.personaName.value.trim() || "用户";
  state.persona.description = refs.personaDescription.value.trim();
  showToast("用户身份已更新");
  saveState();
  renderMessages();
}

function clearCurrentChat() {
  const chat = getActiveChat();
  if (!chat) return;

  const character = getChatCharacter(chat);
  chat.messages = [];
  chat.title = `${character.name} 的新会话`;
  chat.updatedAt = "刚刚";
  saveState();
  showToast("当前会话已清空");
  renderMessages({ forceScroll: true });
  renderChats();
}

function deleteCurrentChat() {
  const chatIndex = state.chats.findIndex((chat) => chat.id === state.activeChatId);
  if (chatIndex < 0) return;

  const currentChat = state.chats[chatIndex];
  const currentCharacterId = currentChat.characterId;
  const currentCharacterChats = getChatsForCharacter(currentCharacterId);

  if (currentCharacterChats.length <= 1) {
    clearCurrentChat();
    return;
  }

  state.chats.splice(chatIndex, 1);
  const nextChat = getLatestChatForCharacter(currentCharacterId);
  state.activeChatId = nextChat.id;
  state.activeCharacterId = currentCharacterId;
  saveState();
  showToast("会话已删除");
  render();
}

async function copyMessage(messageId) {
  const message = getActiveChat()?.messages.find((item) => item.id === messageId);
  if (!message) return;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message.content);
    } else {
      fallbackCopy(message.content);
    }
    showToast("消息已复制");
  } catch (error) {
    fallbackCopy(message.content);
    showToast("消息已复制");
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function regenerateMessage(messageId) {
  const chat = getActiveChat();
  const message = chat?.messages.find((item) => item.id === messageId);
  if (!chat || !message || message.role !== "assistant") return;

  const character = getChatCharacter(chat);
  message.content = "正在重新生成回复...";
  chat.updatedAt = "刚刚";
  saveState();
  renderMessages({ forceScroll: true });
  generateAssistantReply(chat.id, messageId, character);
}

function cycleCharacter() {
  const currentIndex = state.characters.findIndex((item) => item.id === state.activeCharacterId);
  const next = state.characters[(currentIndex + 1) % state.characters.length];
  selectCharacter(next.id);
}

function autoresizeInput() {
  refs.messageInput.style.height = "auto";
  refs.messageInput.style.height = `${Math.min(refs.messageInput.scrollHeight, 180)}px`;
}

function showToast(text) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1600);
}

function renderMarkdown(value) {
  const codeBlocks = [];
  let text = escapeHtml(value).replace(/\r\n/g, "\n");

  text = text.replace(/```([\s\S]*?)```/g, (_, code) => {
    const token = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre><code>${code.replace(/^\n|\n$/g, "")}</code></pre>`);
    return token;
  });

  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => renderMarkdownBlock(block, codeBlocks))
    .join("");
}

function renderMarkdownBlock(block, codeBlocks) {
  const codeMatch = block.match(/^__CODE_BLOCK_(\d+)__$/);
  if (codeMatch) return codeBlocks[Number(codeMatch[1])] ?? "";

  const headingMatch = block.match(/^(#{1,3})\s+(.+)$/);
  if (headingMatch) {
    const level = headingMatch[1].length + 2;
    return `<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`;
  }

  const lines = block.split("\n");
  if (lines.every((line) => /^[-*]\s+/.test(line))) {
    return `<ul>${lines
      .map((line) => `<li>${renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>`)
      .join("")}</ul>`;
  }

  if (lines.every((line) => /^\d+\.\s+/.test(line))) {
    return `<ol>${lines
      .map((line) => `<li>${renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>`)
      .join("")}</ol>`;
  }

  if (lines.every((line) => /^&gt;\s?/.test(line))) {
    return `<blockquote>${lines
      .map((line) => renderInlineMarkdown(line.replace(/^&gt;\s?/, "")))
      .join("<br>")}</blockquote>`;
  }

  return `<p>${renderInlineMarkdown(block).replace(/\n/g, "<br>")}</p>`;
}

function renderInlineMarkdown(value) {
  return value
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

refs.chatList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-chat-id]");
  if (button) selectChat(button.dataset.chatId);
});

refs.characterList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-character-id]");
  if (button) {
    selectCharacter(button.dataset.characterId);
    if (refs.appShell.classList.contains("settings-mode")) {
      switchDashboardTab("character");
    }
  }
});

refs.messageStream.addEventListener("click", (event) => {
  const copyButton = event.target.closest("[data-copy-message-id]");
  if (copyButton) {
    copyMessage(copyButton.dataset.copyMessageId);
    return;
  }

  const regenerateButton = event.target.closest("[data-regenerate-message-id]");
  if (regenerateButton) {
    regenerateMessage(regenerateButton.dataset.regenerateMessageId);
  }
});

refs.newChatBtn.addEventListener("click", createChat);
refs.randomRoleBtn.addEventListener("click", cycleCharacter);
refs.newCharacterBtn.addEventListener("click", createCharacter);
refs.importCharacterBtn.addEventListener("click", () => refs.characterFileInput.click());
refs.exportCharacterBtn.addEventListener("click", exportCharacter);
refs.deleteCharacterBtn.addEventListener("click", deleteCharacter);
refs.characterFileInput.addEventListener("change", importCharacterFile);
refs.characterAvatarPreviewBtn.addEventListener("click", () => refs.characterAvatarInput.click());
refs.uploadCharacterAvatarBtn.addEventListener("click", () => refs.characterAvatarInput.click());
refs.clearCharacterAvatarBtn.addEventListener("click", clearCharacterAvatar);
refs.characterAvatarInput.addEventListener("change", updateCharacterAvatarFromFile);
refs.characterBannerPreviewBtn.addEventListener("click", () => refs.characterBannerInput.click());
refs.uploadCharacterBannerBtn.addEventListener("click", () => refs.characterBannerInput.click());
refs.clearCharacterBannerBtn.addEventListener("click", clearCharacterBanner);
refs.characterBannerInput.addEventListener("change", updateCharacterBannerFromFile);
refs.backgroundPreviewBtn.addEventListener("click", () => refs.backgroundFileInput.click());
refs.uploadBackgroundBtn.addEventListener("click", () => refs.backgroundFileInput.click());
refs.clearBackgroundBtn.addEventListener("click", clearBackgroundImage);
refs.backgroundFileInput.addEventListener("change", updateBackgroundFromFile);
refs.clearChatBtn.addEventListener("click", clearCurrentChat);
refs.deleteChatBtn.addEventListener("click", deleteCurrentChat);
refs.sendBtn.addEventListener("click", sendMessage);
refs.saveCharacterBtn.addEventListener("click", saveCharacter);
refs.savePersonaBtn.addEventListener("click", savePersona);
refs.personaQuickBtn.addEventListener("click", () => {
  openSettings("persona");
});
refs.settingsToggle.addEventListener("click", () => {
  openSettings("model");
});
refs.backToChatBtn.addEventListener("click", () => closeSettings());
refs.authBtn.addEventListener("click", () => openAuthPanel());
refs.authCloseBtn.addEventListener("click", closeAuthPanel);
refs.authModeLoginBtn.addEventListener("click", () => setAuthMode("login"));
refs.authModeRegisterBtn.addEventListener("click", () => setAuthMode("register"));
refs.authForm.addEventListener("submit", submitAuth);
refs.authLogoutBtn.addEventListener("click", logoutAuth);
refs.authPanel.addEventListener("click", (event) => {
  if (event.target === refs.authPanel) closeAuthPanel();
});

refs.dashboardTabs.forEach((button) => {
  button.addEventListener("click", () => openSettings(button.dataset.dashboardTab));
});

window.addEventListener("hashchange", syncViewFromHash);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !refs.authPanel.hidden) {
    closeAuthPanel();
    return;
  }

  if (event.key === "Escape" && refs.appShell.classList.contains("settings-mode")) {
    closeSettings();
  }
});

refs.messageInput.addEventListener("input", autoresizeInput);
refs.messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

refs.temperatureInput.addEventListener("input", () => {
  state.settings.temperature = Number(refs.temperatureInput.value);
  refs.temperatureValue.textContent = refs.temperatureInput.value;
  saveState();
});

refs.apiProviderSelect.addEventListener("change", () => {
  state.settings.apiProvider = refs.apiProviderSelect.value;
  syncApiProviderSettings(true);
  saveState();
  renderInspector();
  renderDashboardSummary();
  renderProviderButtons();
});

refs.modelSelect.addEventListener("change", () => {
  state.settings.model = refs.modelSelect.value;
  saveState();
  renderDashboardSummary();
});

refs.apiBaseUrlInput.addEventListener("change", () => {
  if (state.settings.apiProvider !== "custom") {
    syncApiProviderSettings(false);
    refs.apiBaseUrlInput.value = state.settings.apiBaseUrl;
    return;
  }

  state.settings.apiBaseUrl = refs.apiBaseUrlInput.value.trim();
  refs.apiBaseUrlInput.value = state.settings.apiBaseUrl;
  saveState();
  renderDashboardSummary();
});

refs.apiKeyInput.addEventListener("input", () => {
  setAccountApiKey(refs.apiKeyInput.value);
});

refs.streamToggle.addEventListener("change", () => {
  state.settings.stream = refs.streamToggle.checked;
  saveState();
});

document.querySelectorAll("[data-model]").forEach((button) => {
  button.addEventListener("click", () => {
    state.provider = button.dataset.model;
    if (state.provider === "local-proxy") {
      state.settings.apiProvider = "local";
      syncApiProviderSettings(true);
    } else if (state.settings.apiProvider === "local") {
      state.settings.apiProvider = "deepseek";
      syncApiProviderSettings(true);
    }
    saveState();
    renderInspector();
    renderDashboardSummary();
    renderProviderButtons();
  });
});

render();
restoreAuthSession();
renderAuth();
syncViewFromHash();
initRemoteSession();
