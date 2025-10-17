// 食材类型定义
export interface Ingredient {
  id: string;
  name: string;
  emoji?: string;
  seconds: number;
  category: string;
  hint?: string;
}

export const INGREDIENTS: Ingredient[] = [
  // —— Mushroom & Tofu ——
  { id: "mushroom_combo", name: "菌菇拼盘 Mushroom Combo", seconds: 60, category: "Mushroom & Tofu" },
  { id: "fried_tofu_skin_combo", name: "油豆皮 Fried Tofu Skin", seconds: 60, category: "Mushroom & Tofu" },
  { id: "brined_bean_curd_skin", name: "泡泡豆干 Brined Bean Curd Skin", seconds: 300, category: "Mushroom & Tofu" },
  { id: "bamboo_fungus", name: "竹笙 Bamboo Fungus", seconds: 30, category: "Mushroom & Tofu" },
  { id: "enoki_mushroom", name: "金针菇 Enoki Mushroom", seconds: 60, category: "Mushroom & Tofu" },
  { id: "shiitake_mushroom", name: "香菇 Shiitake Mushroom", seconds: 120, category: "Mushroom & Tofu" },
  { id: "oyster_mushroom", name: "平菇 Oyster Mushroom", seconds: 120, category: "Mushroom & Tofu" },
  { id: "king_oyster_mushroom", name: "鸡腿菇 King Oyster Mushroom", seconds: 60, category: "Mushroom & Tofu" },
  { id: "wood_fungus", name: "木耳 Wood Fungus", seconds: 300, category: "Mushroom & Tofu" },
  { id: "fresh_tofu", name: "嫩豆腐 Fresh Tofu", seconds: 60, category: "Mushroom & Tofu" },
  { id: "frozen_tofu", name: "冻豆腐 Frozen Tofu", seconds: 60, category: "Mushroom & Tofu" },
  { id: "bean_curd_stick", name: "腐竹 Bean Curd Stick", seconds: 180, category: "Mushroom & Tofu" },
  { id: "bean_curd_roll", name: "响铃卷 Bean Curd Roll", seconds: 60, category: "Mushroom & Tofu" },
  { id: "brined_soft_tofu", name: "卤水豆腐 Brined Soft Tofu", seconds: 60, category: "Mushroom & Tofu" },

  // —— Appetizer/Dessert ——
  { id: "taro_swan_pastry", name: "香芋天鹅酥 Taro Swan Pastry", seconds: 180, category: "Appetizer/Dessert" },
  { id: "lady_m_matcha", name: "Lady M抹茶千层 Lady M Matcha Cake", seconds: 0, category: "Appetizer/Dessert" },
  { id: "brined_pork_feet", name: "妈妈猪蹄 Mom's Brined Pork Feet", seconds: 300, category: "Appetizer/Dessert" },
  { id: "glutinous_rice_cake", name: "黄米糍粑 Glutinous Rice Cake", seconds: 480, category: "Appetizer/Dessert" },
  { id: "milk_mochi", name: "鲜奶麻薯 Milk Mochi", seconds: 60, category: "Appetizer/Dessert" },
  { id: "tiramisu", name: "提拉米苏 Tiramisu", seconds: 0, category: "Appetizer/Dessert" },
  { id: "fried_rice_bean_sprout", name: "芽菜香炒饭 Fried Rice w. Mung Bean Sprout & Egg", seconds: 300, category: "Appetizer/Dessert" },
  { id: "brined_beef_shank", name: "卤水牛展 Brined Beef Shank", seconds: 120, category: "Appetizer/Dessert" },
  { id: "brined_duck_gizzard", name: "卤水鸭胗 Brined Duck Gizzard", seconds: 300, category: "Appetizer/Dessert" },
  { id: "brined_quail_egg", name: "卤水鹌鹑蛋 Brined Quail Egg", seconds: 300, category: "Appetizer/Dessert" },
  { id: "brined_chicken_feet", name: "卤水鸡爪 Brined Chicken Feet", seconds: 480, category: "Appetizer/Dessert" },
  { id: "brined_beef_tendon", name: "卤水牛筋 Brined Beef Tendon", seconds: 300, category: "Appetizer/Dessert" },
  { id: "spicy_beef_salad", name: "香辣金钱展 Spicy Beef Salad", seconds: 300, category: "Appetizer/Dessert" },
  { id: "seaweed_salad", name: "海草 Seaweed Salad", seconds: 0, category: "Appetizer/Dessert" },
  { id: "stinky_tofu", name: "臭豆腐 Stinky Tofu", seconds: 480, category: "Appetizer/Dessert" },
  { id: "fried_chicken_tenders", name: "炸鸡柳 Fried Chicken Tenders", seconds: 300, category: "Appetizer/Dessert" },

  // —— Noodles & Dumpling ——
  { id: "fresh_noodle", name: "阳春面 Fresh Noodle", seconds: 300, category: "Noodles & Dumpling" },
  { id: "instant_noodle", name: "公仔面 Instant Noodle", seconds: 300, category: "Noodles & Dumpling" },
  { id: "japanese_udon", name: "乌冬面 Japanese Udon Noodle", seconds: 180, category: "Noodles & Dumpling" },
  { id: "bean_vermicelli", name: "粉丝 Bean Vermicelli", seconds: 30, category: "Noodles & Dumpling" },
  { id: "pork_dumpling", name: "手工饺子 House Made Pork Dumpling", seconds: 420, category: "Noodles & Dumpling" },
  { id: "beef_wonton", name: "牛肉云吞 Beef Wonton", seconds: 180, category: "Noodles & Dumpling" },
  { id: "sweet_potato_noodle", name: "火锅宽粉 Sweet Potato Noodle", seconds: 300, category: "Noodles & Dumpling" },
  { id: "special_potato_noodle", name: "粉耗子 Special Potato Noodle", seconds: 120, category: "Noodles & Dumpling" },
  { id: "fried_chinese_donut", name: "油条 Fried Chinese Donut", seconds: 30, category: "Noodles & Dumpling" },
  { id: "rice_cake", name: "年糕 Rice Cake", seconds: 300, category: "Noodles & Dumpling" },
  { id: "shrimp_egg_dumpling", name: "蛋饺 Whole Shrimp Egg Dumpling", seconds: 180, category: "Noodles & Dumpling" },
  { id: "steam_rice", name: "白饭 Steam Rice", seconds: 0, category: "Noodles & Dumpling" },

  // —— Seafood ——
  { id: "snakehead_fish_fillet", name: "黑鱼片 Snakehead Fish Fillet", seconds: 60, category: "Seafood" },
  { id: "special_fish", name: "耗儿鱼 Special Fish", seconds: 120, category: "Seafood" },
  { id: "grass_fish_fillets", name: "胭脂鱼 Grass Fish Fillets", seconds: 60, category: "Seafood" },
  { id: "jumbo_scallop", name: "带子 Jumbo Scallop", seconds: 30, category: "Seafood" },
  { id: "abalone", name: "鲍鱼 Abalone", seconds: 180, category: "Seafood" },
  { id: "prawn", name: "大虾 Prawn", seconds: 180, category: "Seafood" },
  { id: "mussels", name: "青口 Mussels", seconds: 60, category: "Seafood" },
  { id: "fried_fish_tofu", name: "鱼豆腐 Fried Fish Tofu", seconds: 30, category: "Seafood" },
  { id: "crab_imitation", name: "蟹肉棒 Crab Imitation", seconds: 30, category: "Seafood" },
  { id: "fish_fillet", name: "龙利鱼片 Fish Fillet", seconds: 120, category: "Seafood" },
  { id: "rocket_squid_wing", name: "火箭鱿鱼 Rocket Shaped Squid Wing", seconds: 480, category: "Seafood" },
  { id: "boneless_eel", name: "鳗鱼丝 Boneless Eel Strip", seconds: 180, category: "Seafood" },
  { id: "lobster_tail", name: "龙虾尾 Lobster Tail", seconds: 180, category: "Seafood" },

  // —— Meat ——
  { id: "japanese_a5_shoulder", name: "A5和牛 Japanese A5 Shoulder Cold", seconds: 30, category: "Meat" },
  { id: "spicy_marinated_beef", name: "麻辣牛肉 Spicy Marinated Beef", seconds: 120, category: "Meat" },
  { id: "duck_intestine", name: "鸭肠 Duck Intestine", seconds: 30, category: "Meat" },
  { id: "fresh_tripe", name: "鲜毛肚 Fresh Tripe", seconds: 30, category: "Meat" },
  { id: "american_kobe_beef", name: "美式和牛 American Kobe Beef-SRF", seconds: 180, category: "Meat" },
  { id: "double_layered_chili_beef", name: "双椒牛肉 Double Layered Chili Beef", seconds: 180, category: "Meat" },
  { id: "pork_belly", name: "五花肉 Pork Belly", seconds: 120, category: "Meat" },
  { id: "garlic_chicken", name: "蒜香鸡肉 Garlic Chicken", seconds: 180, category: "Meat" },
  { id: "beef_tongue", name: "精选牛舌 Beef Tongue (Not Marinated)", seconds: 60, category: "Meat" },
  { id: "layered_tripe", name: "千层肚 Layered Tripe", seconds: 30, category: "Meat" },
  { id: "aorta", name: "大动脉 Aorta", seconds: 180, category: "Meat" },
  { id: "pork_brain", name: "猪脑花 Pork Brain", seconds: 600, category: "Meat" },
  { id: "duck_gizzard_flowers", name: "泡椒鸭胗花 Duck Gizzard Flowers", seconds: 180, category: "Meat" },
  { id: "brined_pork_intestine", name: "卤肥肠 Brined Pork Intestine", seconds: 180, category: "Meat" },
  { id: "frog_legs", name: "秘制牛蛙腿 House Special Frog Legs", seconds: 120, category: "Meat" },
  { id: "blood_tofu", name: "血豆腐 Blood Tofu", seconds: 480, category: "Meat" },
  { id: "boneless_duck_feet", name: "脱骨鸭掌 Boneless Duck Feet", seconds: 300, category: "Meat" },
  { id: "luncheon_pork", name: "午餐肉 Luncheon Pork", seconds: 180, category: "Meat" },
  { id: "quail_egg", name: "鹌鹑蛋 Quail Egg", seconds: 180, category: "Meat" },
  { id: "crispy_pork_sausage", name: "脆皮肠 Crispy Pork Sausage", seconds: 30, category: "Meat" },
  { id: "raw_egg", name: "生鸡蛋 Raw Egg", seconds: 480, category: "Meat" },
];

// 分类定义
export const CATEGORIES = [
  "全部",
  "Meat",
  "Seafood",
  "Mushroom & Tofu",
  "Noodles & Dumpling",
  "Appetizer/Dessert",
];

// 推荐食材
export const RECOMMENDED_INGREDIENTS = [
  "japanese_a5_shoulder",
  "spicy_marinated_beef",
  "duck_intestine",
  "snakehead_fish_fillet",
  "pork_dumpling",
  "bean_curd_stick",
  "bamboo_fungus",
  "fresh_noodle",
  "fried_chicken_tenders",
  "glutinous_rice_cake",
];
