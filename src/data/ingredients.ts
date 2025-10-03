// 食材类型定义
export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  seconds: number;
  category: string;
  hint?: string;
}

export const INGREDIENTS: Ingredient[] = [
  // —— 肉类 ——
  { id: "beef_roll", name: "肥牛卷", emoji: "🥩", seconds: 25, category: "肉类", hint: "薄片涮至变色卷边即食（20-35s）" },
  { id: "lamb_slice", name: "羊肉卷", emoji: "🐑", seconds: 30, category: "肉类", hint: "变色捞起，厚片可到 40s" },

  // —— 内脏/爽脆 ——
  { id: "tripe", name: "毛肚", emoji: "🐄", seconds: 15, category: "内脏/爽脆", hint: "七上八下 ~15s" },
  { id: "duck_intestine", name: "鸭肠", emoji: "🦆", seconds: 12, category: "内脏/爽脆", hint: "抖松涮至变色即起" },
  { id: "artery", name: "黄喉", emoji: "✨", seconds: 60, category: "内脏/爽脆", hint: "60-90s 区间，依喜好调节" },

  // —— 丸滑/加工 ——
  { id: "shrimp_paste", name: "虾滑", emoji: "🍤", seconds: 120, category: "丸滑/加工", hint: "定型浮起 + 1-2 分钟" },
  { id: "beef_ball", name: "牛筋丸", emoji: "🧆", seconds: 360, category: "丸滑/加工" },
  { id: "fish_ball", name: "鱼丸", emoji: "🐟", seconds: 180, category: "丸滑/加工", hint: "浮起后再煮 1-2 分钟" },
  { id: "luncheon", name: "午餐肉", emoji: "🥫", seconds: 60, category: "丸滑/加工" },
  { id: "xiang_ling_roll", name: "响铃卷", emoji: "🥠", seconds: 15, category: "丸滑/加工", hint: "豆腐皮卷，压汤 10–20s 即起" }, // ➕ 新增

  // —— 海鲜 ——
  { id: "shrimp", name: "鲜虾", emoji: "🦐", seconds: 90, category: "海鲜", hint: "虾身弯曲、通体变红即可" },
  { id: "fish_slice", name: "鱼片", emoji: "🐟", seconds: 60, category: "海鲜", hint: "薄片 45-70s；厚片加时" },
  { id: "squid_ring", name: "鱿鱼圈", emoji: "🦑", seconds: 80, category: "海鲜" },
  { id: "crab_stick", name: "蟹棒", emoji: "🦀", seconds: 80, category: "海鲜" },
  { id: "scallop", name: "北极贝", emoji: "🐚", seconds: 90, category: "海鲜", hint: "微张即可，避免久煮" }, // ➕ 新增

  // —— 蔬菜&菌菇 ——
  { id: "enoki", name: "金针菇", emoji: "🍄", seconds: 60, category: "蔬菜菌菇" },
  { id: "king_oyster", name: "杏鲍菇", emoji: "🍄", seconds: 120, category: "蔬菜菌菇" },
  { id: "shimeji", name: "白玉菇", emoji: "🍄", seconds: 100, category: "蔬菜菌菇" },
  { id: "mushroom_mix", name: "菌菇拼", emoji: "🍄", seconds: 120, category: "蔬菜菌菇" },
  { id: "lotus", name: "藕片", emoji: "🪷", seconds: 120, category: "蔬菜菌菇" },
  { id: "potato", name: "土豆片", emoji: "🥔", seconds: 150, category: "蔬菜菌菇" },
  { id: "winter_melon", name: "冬瓜", emoji: "🍈", seconds: 120, category: "蔬菜菌菇" },
  { id: "baby_cabbage", name: "娃娃菜", emoji: "🥬", seconds: 60, category: "蔬菜菌菇" },
  { id: "leaf_lettuce", name: "油麦菜", emoji: "🥬", seconds: 20, category: "蔬菜菌菇", hint: "烫至断生即起" },
  { id: "spinach", name: "菠菜", emoji: "🥬", seconds: 20, category: "蔬菜菌菇", hint: "变深绿即起" },
  { id: "cilantro", name: "香菜", emoji: "🌿", seconds: 5, category: "蔬菜菌菇", hint: "点缀即可，不需久煮" }, // ➕ 新增
  { id: "celery", name: "芹菜", emoji: "🥬", seconds: 40, category: "蔬菜菌菇", hint: "切段，保持脆口" }, // ➕ 新增
  { id: "asparagus_lettuce", name: "莴笋片", emoji: "🥗", seconds: 60, category: "蔬菜菌菇" }, // ➕ 新增
  { id: "kelp_knot", name: "海带结", emoji: "🔗", seconds: 240, category: "蔬菜菌菇" },
  { id: "baby_kelp", name: "海带苗", emoji: "🪴", seconds: 8, category: "蔬菜菌菇", hint: "8-12s 脆口最佳" },
  { id: "baby_corn", name: "玉米笋", emoji: "🌽", seconds: 120, category: "蔬菜菌菇" },

  // —— 豆制品/主食 ——
  { id: "tofu", name: "北豆腐", emoji: "🧊", seconds: 120, category: "豆制品/主食" },
  { id: "frozen_tofu", name: "冻豆腐", emoji: "❄️", seconds: 240, category: "豆制品/主食" },
  { id: "tofu_skin", name: "千张", emoji: "🥟", seconds: 45, category: "豆制品/主食", hint: "薄张 30-50s" }, // 修正 emoji
  { id: "fried_tofu_skin", name: "炸腐皮", emoji: "🥠", seconds: 15, category: "豆制品/主食", hint: "压汤下锅 10–20s 即起" },
  { id: "tofu_puff", name: "豆腐泡", emoji: "🫧", seconds: 60, category: "豆制品/主食", hint: "吸汤后更入味" },
  { id: "fu_zhu", name: "腐竹", emoji: "🥢", seconds: 180, category: "豆制品/主食", hint: "泡发后煮 3 分钟以上" }, // ➕ 新增
  { id: "glass_noodle", name: "粉丝", emoji: "🍜", seconds: 180, category: "豆制品/主食" },
  { id: "wide_noodle", name: "宽粉", emoji: "🍜", seconds: 240, category: "豆制品/主食" },
  { id: "instant_noodle", name: "方便面", emoji: "🍜", seconds: 150, category: "豆制品/主食" },
  { id: "rice_cake", name: "年糕片", emoji: "🍘", seconds: 180, category: "豆制品/主食" },

  // —— 其他 ——
  { id: "gong_cai", name: "贡菜（莴笋干/茎）", emoji: "🥗", seconds: 45, category: "其他" },
  { id: "corn", name: "玉米段", emoji: "🌽", seconds: 300, category: "其他" },
];


// 分类定义
export const CATEGORIES = [
  "肉类",
  "内脏/爽脆", 
  "丸滑/加工",
  "海鲜",
  "蔬菜菌菇",
  "豆制品/主食",
  "其他"
];

// 推荐食材
export const RECOMMENDED_INGREDIENTS = [
  "beef_roll",
  "lamb_slice", 
  "tripe",
  "duck_intestine",
  "shrimp_paste",
  "shrimp",
  "enoki",
  "baby_cabbage",
  "tofu",
  "glass_noodle"
];
