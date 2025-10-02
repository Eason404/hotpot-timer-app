// 推荐食材与默认时间（秒）。时间取中式火锅常见"熟透/最佳口感"建议值。

export type IngredientCategory = "肉类" | "内脏/爽脆" | "丸滑/加工" | "海鲜" | "蔬菜菌菇" | "豆制品/主食" | "其他";

export interface Ingredient {
  id: string;
  name: string;
  emoji?: string;
  seconds: number; // 推荐时长（秒）
  category: IngredientCategory;
  hint?: string;
}

export const INGREDIENTS: Ingredient[] = [
  // —— 肉类 ——
  { id: "beef_roll", name: "肥牛卷", emoji: "🥩", seconds: 45, category: "肉类", hint: "涮至变色即可" },
  { id: "lamb_slice", name: "羊肉片", emoji: "🥩", seconds: 60, category: "肉类" },

  // —— 内脏/爽脆 ——
  { id: "tripe", name: "毛肚", emoji: "🐄", seconds: 15, category: "内脏/爽脆", hint: "七上八下 ~15s" },
  { id: "duck_intestine", name: "鸭肠", emoji: "🦆", seconds: 20, category: "内脏/爽脆" },
  { id: "artery", name: "黄喉", emoji: "✨", seconds: 120, category: "内脏/爽脆" },

  // —— 丸滑/加工 ——
  { id: "shrimp_paste", name: "虾滑", emoji: "🍤", seconds: 180, category: "丸滑/加工" },
  { id: "beef_ball", name: "牛筋丸", emoji: "🥣", seconds: 420, category: "丸滑/加工" },
  { id: "fish_ball", name: "鱼丸", emoji: "🐟", seconds: 300, category: "丸滑/加工" },
  { id: "luncheon", name: "午餐肉", emoji: "🥫", seconds: 120, category: "丸滑/加工" },

  // —— 海鲜 ——
  { id: "shrimp", name: "鲜虾", emoji: "🦐", seconds: 180, category: "海鲜" },
  { id: "fish_slice", name: "巴沙鱼片", emoji: "🐟", seconds: 120, category: "海鲜", hint: "薄片更快" },
  { id: "squid_ring", name: "鱿鱼圈", emoji: "🦑", seconds: 90, category: "海鲜" },
  { id: "crab_stick", name: "蟹棒", emoji: "🦀", seconds: 120, category: "海鲜" },

  // —— 蔬菜&菌菇 ——
  { id: "enoki", name: "金针菇", emoji: "🍄", seconds: 120, category: "蔬菜菌菇" },
  { id: "king_oyster", name: "杏鲍菇", emoji: "🍄", seconds: 180, category: "蔬菜菌菇" },
  { id: "shimeji", name: "白玉菇", emoji: "🍄", seconds: 150, category: "蔬菜菌菇" },
  { id: "mushroom_mix", name: "菌菇拼", emoji: "🍄", seconds: 180, category: "蔬菜菌菇" },
  { id: "lotus", name: "藕片", emoji: "🥢", seconds: 180, category: "蔬菜菌菇" },
  { id: "potato", name: "土豆片", emoji: "🥔", seconds: 180, category: "蔬菜菌菇" },
  { id: "winter_melon", name: "冬瓜", emoji: "🍈", seconds: 150, category: "蔬菜菌菇" },
  { id: "baby_cabbage", name: "娃娃菜/大白菜", emoji: "🥬", seconds: 120, category: "蔬菜菌菇" },
  { id: "leaf_lettuce", name: "油麦菜/生菜", emoji: "🥬", seconds: 45, category: "蔬菜菌菇" },
  { id: "spinach", name: "菠菜", emoji: "🥬", seconds: 60, category: "蔬菜菌菇" },
  { id: "kelp_knot", name: "海带结", emoji: "🔗", seconds: 300, category: "蔬菜菌菇" },
  { id: "baby_kelp", name: "海带苗", emoji: "🪴", seconds: 20, category: "蔬菜菌菇", hint: "8秒海带苗同款，脆口即起" },
  { id: "baby_corn", name: "玉米笋", emoji: "🌽", seconds: 180, category: "蔬菜菌菇" },

  // —— 豆制品/主食 ——
  { id: "tofu", name: "北豆腐", emoji: "🧊", seconds: 180, category: "豆制品/主食" },
  { id: "frozen_tofu", name: "冻豆腐", emoji: "🧊", seconds: 300, category: "豆制品/主食" },
  { id: "tofu_skin", name: "千张/百叶", emoji: "🧆", seconds: 90, category: "豆制品/主食" },
  { id: "fried_tofu_skin", name: "炸腐皮", emoji: "🥠", seconds: 60, category: "豆制品/主食" },
  { id: "tofu_puff", name: "豆腐泡", emoji: "🫧", seconds: 90, category: "豆制品/主食", hint: "吸汤后更好吃" },
  { id: "glass_noodle", name: "粉丝", emoji: "🍜", seconds: 240, category: "豆制品/主食" },
  { id: "wide_noodle", name: "宽粉", emoji: "🍜", seconds: 300, category: "豆制品/主食" },
  { id: "instant_noodle", name: "方便面", emoji: "🍜", seconds: 180, category: "豆制品/主食" },
  { id: "rice_cake", name: "年糕片", emoji: "🍘", seconds: 240, category: "豆制品/主食" },

  // —— 其他 ——
  { id: "gong_cai", name: "贡菜（莴笋干/茎）", emoji: "🥗", seconds: 90, category: "其他" },
  { id: "corn", name: "玉米段", emoji: "🌽", seconds: 480, category: "其他" },
];

export const CATEGORIES = [
  "全部",
  "肉类",
  "内脏/爽脆",
  "丸滑/加工",
  "海鲜",
  "蔬菜菌菇",
  "豆制品/主食",
  "其他",
] as const;

// 推荐食材组合（用于快捷推荐区域）
export const RECOMMENDED_INGREDIENTS = [
  "beef_roll", 
  "tripe", 
  "shrimp_paste", 
  "fish_ball", 
  "enoki", 
  "tofu", 
  "glass_noodle", 
  "shrimp"
];