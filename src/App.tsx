import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, BellRing, Check, Timer, Clock, Settings, Volume2, VolumeX, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INGREDIENTS, CATEGORIES, RECOMMENDED_INGREDIENTS } from "@/data/ingredients";
import type { Ingredient } from "@/data/ingredients";
import {
  addIngredientToPrepList,
  addTimerFromPrepItem,
  calculatePercent,
  clearDoneTimers,
  completeDueTimers,
  formatTimeLeft,
  removePrepItem,
  updatePrepItemSeconds,
} from "@/lib/timer-utils";
import type { PrepItem, TimerItem } from "@/types";

// ----------------------
// 火锅计时器（Card View）
// ----------------------
// 设计目标：移动优先、点卡片即可开计时、支持多份、完成提醒（声/震/通知）、UI简洁。
// 使用：把此组件放入任意 React（Vite/Next）项目；项目需启用 Tailwind 与 shadcn/ui。
// ----------------------

// 播放完成提示音 - 更悦耳的"叮咚"声
function playCompleteSound() {
  try {
    // 检查浏览器是否支持 Web Audio API
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    // 确保 AudioContext 处于运行状态
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // 第一个音符 (高音)
    const o1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    o1.type = "sine";
    o1.frequency.setValueAtTime(800, ctx.currentTime);
    g1.gain.setValueAtTime(0.4, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    o1.connect(g1);
    g1.connect(ctx.destination);
    o1.start();
    o1.stop(ctx.currentTime + 0.3);
    
    // 第二个音符 (低音) - 延迟0.1秒
    setTimeout(() => {
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = "sine";
      o2.frequency.setValueAtTime(600, ctx.currentTime);
      g2.gain.setValueAtTime(0.3, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      o2.connect(g2);
      g2.connect(ctx.destination);
      o2.start();
      o2.stop(ctx.currentTime + 0.4);
      
      // 清理
      setTimeout(() => {
        try {
          ctx.close();
        } catch (e) {
          // 忽略关闭错误
        }
      }, 500);
    }, 100);
  } catch (error) {
    // 回退到简单的 beep 声
    try {
      const ctx = new ((window as any).webkitAudioContext || window.AudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 800;
      g.gain.value = 0.3;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 200);
    } catch (fallbackError) {
      // 静默失败
    }
  }
}

// 播放点击反馈音 - 轻快的点击声
function playClickSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(400, ctx.currentTime);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.1);
    
    setTimeout(() => {
      try {
        ctx.close();
      } catch (e) {
        // 忽略关闭错误
      }
    }, 150);
  } catch (error) {
    // 静默失败
  }
}

// Haptic 触觉反馈函数
function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    // 检查设备是否支持触觉反馈
    if ('vibrate' in navigator) {
      let pattern: number[] = [];
      
      switch (type) {
        case 'light':
          pattern = [10]; // 轻微震动 10ms
          break;
        case 'medium':
          pattern = [20]; // 中等震动 20ms
          break;
        case 'heavy':
          pattern = [50]; // 重震动 50ms
          break;
      }
      
      navigator.vibrate(pattern);
    }
    
    // iOS 设备的 Haptic Feedback API (如果可用)
    if ((window as any).DeviceMotionEvent && typeof (window as any).DeviceMotionEvent.requestPermission === 'function') {
      // iOS 的 Haptic Feedback 需要特殊处理，但在 web 中比较有限
      // 这里我们依赖标准的 vibrate API
    }
  } catch (error) {
    // 静默失败 - 不是所有设备都支持触觉反馈
  }
}

function requestNotifyPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function useTicking(enabled: boolean, intervalMs = 200) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);
  return tick;
}

function saveToStorage(key: string, data: any) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}

export default function HotpotTimerApp() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("全部");
  const [timers, setTimers] = useState<TimerItem[]>(() => loadFromStorage<TimerItem[]>("hotpot_timers", []));
  const [soundOn, setSoundOn] = useState<boolean>(() => loadFromStorage("hotpot_sound", true));
  const [vibrateOn, setVibrateOn] = useState<boolean>(() => loadFromStorage("hotpot_vibrate", true));
  
  // Tab和备菜状态
  const [activeTab, setActiveTab] = useState<"cook" | "prep">("cook");
  const [prepList, setPrepList] = useState<PrepItem[]>(() => loadFromStorage<PrepItem[]>("hotpot_prep_list", []));

  useEffect(() => saveToStorage("hotpot_timers", timers), [timers]);
  useEffect(() => saveToStorage("hotpot_sound", soundOn), [soundOn]);
  useEffect(() => saveToStorage("hotpot_vibrate", vibrateOn), [vibrateOn]);
  useEffect(() => saveToStorage("hotpot_prep_list", prepList), [prepList]);

  useEffect(() => {
    // 首次交互请求通知权限（非强制）
    const t = setTimeout(() => requestNotifyPermission(), 1200);
    return () => clearTimeout(t);
  }, []);

  // 驱动重渲染
  const tick = useTicking(true, 200);

  // 所有食材映射
  const ingredientLookup = useMemo<Map<string, Ingredient>>(
    () => new Map(INGREDIENTS.map((ingredient) => [ingredient.id, ingredient] as const)),
    [],
  );

  // 过滤后的食材
  const filtered = useMemo<Ingredient[]>(() => {
    const q = query.trim();
    return INGREDIENTS.filter((ingredient) =>
      (category === "全部" || ingredient.category === category) &&
      (q === "" || ingredient.name.includes(q))
    );
  }, [query, category]);

  // 检查完成的计时器，播放提示音 & 震动
  useEffect(() => {
    const result = completeDueTimers(timers);
    if (result.completedIds.length === 0) return;
    
    setTimers(result.updated);
    
    if (vibrateOn && "vibrate" in navigator) navigator.vibrate([200, 100, 200]);
    
    // 使用增强的完成提示音
    if (soundOn) {
      playCompleteSound();
    }
    
    requestNotifyPermission(); // 尝试请求通知权限
  }, [tick, timers, soundOn, vibrateOn]);

  function removeTimer(id: string) {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }

  function clearDone() { setTimers((p) => clearDoneTimers(p)); }

  // 备菜相关函数
  function addToPrepList(ing: (typeof INGREDIENTS)[number]) {
    if (soundOn) playClickSound();
    if (vibrateOn) triggerHapticFeedback('light');
    setPrepList((prev) => addIngredientToPrepList(prev, ing));
  }

  function removeFromPrepList(id: string) {
    setPrepList((prev) => removePrepItem(prev, id));
  }

  function updatePrepTime(id: string, customSeconds: number) {
    setPrepList((prev) => updatePrepItemSeconds(prev, id, customSeconds));
  }

  function clearPrepList() {
    setPrepList([]);
  }

  function addFromPrepToTimer(prepItem: PrepItem) {
    if (soundOn) playClickSound();
    if (vibrateOn) triggerHapticFeedback('medium');
    setTimers((prev) => addTimerFromPrepItem(prev, prepItem, ingredientLookup));
  }

  function percent(t: TimerItem) { return calculatePercent(t); }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-40">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b">
        <div className="mx-auto max-w-screen-md px-4 py-3 flex items-center gap-3">
          <Timer className="w-6 h-6" />
          <h1 className="text-xl font-semibold tracking-tight">火锅计时器</h1>
          <Badge className="ml-1" variant="secondary">Card View</Badge>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSoundOn((s) => !s)} title={soundOn ? "关闭提示音" : "开启提示音"}>
              {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setVibrateOn((v) => !v)} title={vibrateOn ? "关闭震动" : "开启震动"}>
              {vibrateOn ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={requestNotifyPermission} title="浏览器通知">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab导航 */}
      <Tabs value={activeTab} onValueChange={(value: string) => {
        if (value === "cook" || value === "prep") {
          setActiveTab(value);
        }
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sticky top-[73px] z-20 mx-auto max-w-screen-md px-4 bg-white/70 backdrop-blur">
          <TabsTrigger value="cook" className="flex items-center gap-2">
            🔥 开煮
          </TabsTrigger>
          <TabsTrigger value="prep" className="flex items-center gap-2">
            🛒 备菜
          </TabsTrigger>
        </TabsList>

        {/* 开煮Tab内容 */}
        <TabsContent value="cook" className="mt-0">
          <CookingTab 
            timers={timers}
            onRemoveTimer={removeTimer}
            onClearDone={clearDone}
            percent={percent}
            prepList={prepList}
            onAddFromPrepToTimer={addFromPrepToTimer}
            onSwitchToPrep={() => setActiveTab("prep")}
          />
        </TabsContent>

        {/* 备菜Tab内容 */}
        <TabsContent value="prep" className="mt-0">
          <PreparationTab
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            filtered={filtered}
            prepList={prepList}
            onAddToPrepList={addToPrepList}
            onRemoveFromPrepList={removeFromPrepList}
            onUpdatePrepTime={updatePrepTime}
            onClearPrepList={clearPrepList}
            onSwitchToCook={() => setActiveTab("cook")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 备菜卡片组件 - 支持翻面调整时间
function PrepItemCard({
  prepItem,
  displayTime,
  onUpdateTime,
  onRemove,
}: {
  prepItem: PrepItem;
  displayTime: string;
  onUpdateTime: (id: string, customSeconds: number) => void;
  onRemove: (id: string) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const currentTime = prepItem.customSeconds || prepItem.seconds;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="relative perspective-1000"
    >
      <div 
        className={`relative w-full transition-transform duration-300 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 正面 - 简洁显示 */}
        <Card className="border-orange-200 bg-orange-50/50 hover:shadow-md hover:scale-[1.02] transition-all duration-200 relative group backface-hidden">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xl mb-1">{prepItem.emoji}</div>
              <div className="text-xs font-medium truncate mb-1">{prepItem.name}</div>
              <Badge 
                variant="secondary" 
                className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 border-orange-200 cursor-pointer hover:bg-orange-200 transition-colors"
                onClick={() => setIsFlipped(true)}
                title="点击调整时间"
              >
                {displayTime}
              </Badge>
              {/* 删除按钮 */}
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(prepItem.id);
                }}
                className="absolute top-1 right-1 w-4 h-4 p-0 text-xs text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="移除"
              >
                ×
              </Button>
            </div>
          </CardContent>
          {/* Hover indicator */}
          <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
        </Card>

        {/* 背面 - 时间调整 */}
        <Card 
          className="absolute inset-0 border-orange-300 bg-orange-100 shadow-lg rotate-y-180 backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-sm mb-2 font-medium text-orange-800">{prepItem.name}</div>
              
              {/* 时间调整区域 */}
              <div className="flex items-center justify-center gap-1 mb-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const newTime = Math.max(15, currentTime - 15);
                    onUpdateTime(prepItem.id, newTime);
                  }}
                  className="w-6 h-6 p-0 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  title="减少15秒"
                >
                  −
                </Button>
                <div className="bg-white border border-orange-300 rounded px-2 py-1 min-w-[50px] text-xs font-medium text-orange-800">
                  {displayTime}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const newTime = currentTime + 15;
                    onUpdateTime(prepItem.id, newTime);
                  }}
                  className="w-6 h-6 p-0 text-xs hover:bg-green-50 hover:border-green-200 hover:text-green-600"
                  title="增加15秒"
                >
                  +
                </Button>
              </div>
              
              {/* 原始时间参考 */}
              <div className="text-[10px] text-orange-600 mb-2">
                建议 {Math.round(prepItem.seconds / 60) > 0 ? `${Math.round(prepItem.seconds / 60)}分` : `${prepItem.seconds}s`}
              </div>
              
              {/* 完成按钮 */}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setIsFlipped(false)}
                className="text-xs bg-orange-200 hover:bg-orange-300 text-orange-800 px-3 py-1 h-6"
              >
                完成
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// 开煮Tab组件
function CookingTab({
  timers,
  onRemoveTimer,
  onClearDone,
  percent,
  prepList,
  onAddFromPrepToTimer,
  onSwitchToPrep,
}: {
  timers: TimerItem[];
  onRemoveTimer: (id: string) => void;
  onClearDone: () => void;
  percent: (t: TimerItem) => number;
  prepList: PrepItem[];
  onAddFromPrepToTimer: (prepItem: PrepItem) => void;
  onSwitchToPrep: () => void;
}) {
  const running = timers.filter((t) => t.status !== "done").sort((a, b) => {
    // 按剩余时间排序，剩余时间最少的排在前面
    // 这样快要煮好的食材会优先显示
    const now = Date.now();
    const timeLeftA = Math.max(0, a.endAt - now);
    const timeLeftB = Math.max(0, b.endAt - now);
    
    // 如果都已经到时间了（剩余时间为0），按结束时间排序（先完成的在前）
    if (timeLeftA === 0 && timeLeftB === 0) {
      return a.endAt - b.endAt;
    }
    
    // 否则按剩余时间排序
    return timeLeftA - timeLeftB;
  });
  const done = timers.filter((t) => t.status === "done");

  return (
    <div className="mx-auto max-w-screen-md px-4 pt-4">
      {/* 备菜清单快速添加 */}
      {prepList.length > 0 && (
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">备菜清单</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {prepList.map((prepItem) => (
              <Card key={prepItem.id} className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group" 
                onClick={() => onAddFromPrepToTimer(prepItem)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{prepItem.emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium leading-tight text-sm">{prepItem.name}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((prepItem.customSeconds || prepItem.seconds) / 60) > 0 
                          ? `${Math.round((prepItem.customSeconds || prepItem.seconds) / 60)}分` 
                          : `${prepItem.customSeconds || prepItem.seconds}s`}
                      </div>
                    </div>
                  </div>
                </CardContent>
                {/* Hover indicator */}
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 温馨提示：引导用户先备菜 */}
      {prepList.length === 0 && (
        <div className="mb-6 text-center py-8">
          <div className="text-6xl mb-4">🍲</div>
          <div className="text-lg font-medium text-gray-700 mb-2">开始你的火锅之旅</div>
          <div className="text-sm text-gray-500 mb-4">
            建议先到"备菜"页面选择今天要吃的食材<br />
            然后回来这里开始计时哦～
          </div>
          <Button 
            onClick={onSwitchToPrep}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            去备菜 🛒
          </Button>
        </div>
      )}

      {/* 底部活动计时器栏 */}
      <BottomDock
        running={running}
        done={done}
        onRemove={onRemoveTimer}
        onClearDone={onClearDone}
        percent={percent}
      />
    </div>
  );
}

// 备菜Tab组件
function PreparationTab({
  query,
  setQuery,
  category,
  setCategory,
  filtered,
  prepList,
  onAddToPrepList,
  onRemoveFromPrepList,
  onUpdatePrepTime,
  onClearPrepList,
  onSwitchToCook,
}: {
  query: string;
  setQuery: (query: string) => void;
  category: (typeof CATEGORIES)[number];
  setCategory: (category: (typeof CATEGORIES)[number]) => void;
  filtered: (typeof INGREDIENTS);
  prepList: PrepItem[];
  onAddToPrepList: (ing: (typeof INGREDIENTS)[number]) => void;
  onRemoveFromPrepList: (id: string) => void;
  onUpdatePrepTime: (id: string, customSeconds: number) => void;
  onClearPrepList: () => void;
  onSwitchToCook: () => void;
}) {
  return (
    <div className="mx-auto max-w-screen-md px-4 pt-4">
      {/* 备菜清单 - 置顶显示，最重要 */}
      {prepList.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">🛒 我的备菜 ({prepList.length})</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onClearPrepList}>
                清空
              </Button>
              <Button size="sm" onClick={onSwitchToCook} className="bg-orange-500 hover:bg-orange-600 text-white">
                开始下锅 🔥
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {prepList.map((prepItem) => {
              const currentTime = prepItem.customSeconds || prepItem.seconds;
              const displayTime = currentTime >= 60 
                ? `${Math.round(currentTime / 60)}分` 
                : `${currentTime}s`;
              
              return (
                <PrepItemCard 
                  key={prepItem.id}
                  prepItem={prepItem}
                  displayTime={displayTime}
                  onUpdateTime={onUpdatePrepTime}
                  onRemove={onRemoveFromPrepList}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 常用推荐 - 紧凑版本 */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-600 mb-2">🔥 常用推荐</div>
        <div className="flex flex-wrap gap-2">
          {RECOMMENDED_INGREDIENTS
            .filter((id: (typeof RECOMMENDED_INGREDIENTS)[number]) => {
              const ing = INGREDIENTS.find((item) => item.id === id)!;
              return !prepList.some(item => item.ingredientId === ing.id);
            })
            .map((id: (typeof RECOMMENDED_INGREDIENTS)[number]) => {
            const ing = INGREDIENTS.find((item) => item.id === id)!;
            return (
              <motion.div 
                key={ing.id} 
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddToPrepList(ing)}
                  className="h-8 px-3 rounded-full text-xs transition-all bg-white border-gray-200 hover:bg-gray-50"
                >
                  <span className="text-sm mr-1">{ing.emoji}</span>
                  {ing.name}
                </Button>
              </motion.div>
            );
          })}
          {RECOMMENDED_INGREDIENTS.filter((id: (typeof RECOMMENDED_INGREDIENTS)[number]) => {
            const ing = INGREDIENTS.find((item) => item.id === id)!;
            return !prepList.some(item => item.ingredientId === ing.id);
          }).length === 0 && (
            <div className="text-xs text-gray-400 py-2">常用推荐已全部选择 ✨</div>
          )}
        </div>
      </div>

      {/* 搜索 & 分类 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              placeholder="搜索食材（如：毛肚、虾滑）"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((c: (typeof CATEGORIES)[number]) => (
            <Button 
              key={c} 
              size="sm" 
              variant={category === c ? "default" : "outline"} 
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                category === c 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* 所有食材网格 - 紧凑版 */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {filtered
          .filter((ing: Ingredient) => !prepList.some(item => item.ingredientId === ing.id))
          .map((ing: Ingredient) => {
          return (
            <motion.div 
              key={ing.id} 
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer relative group border-gray-100" 
                onClick={() => onAddToPrepList(ing)}>
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="text-xl mb-1">{ing.emoji}</div>
                    <div className="text-xs font-medium truncate mb-1">{ing.name}</div>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {Math.round(ing.seconds / 60) > 0 ? `${Math.round(ing.seconds / 60)}m` : `${ing.seconds}s`}
                    </Badge>
                  </div>
                </CardContent>
                {/* Hover indicator */}
                <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
              </Card>
            </motion.div>
          );
        })}
        {filtered.filter((ing: Ingredient) => !prepList.some(item => item.ingredientId === ing.id)).length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-sm">该分类下的食材已全部选择</div>
          </div>
        )}
      </div>
    </div>
  );
}

function BottomDock({
  running,
  done,
  onRemove,
  onClearDone,
  percent,
}: {
  running: TimerItem[];
  done: TimerItem[];
  onRemove: (id: string) => void;
  onClearDone: () => void;
  percent: (t: TimerItem) => number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const totalTimers = running.length + done.length;
  
  // 智能排序：快完成的排在前面
  const sortedRunning = [...running].sort((a, b) => {
    const timeLeftA = Math.max(0, a.endAt - Date.now());
    const timeLeftB = Math.max(0, b.endAt - Date.now());
    return timeLeftA - timeLeftB; // 剩余时间最少的排在前面
  });
  
  // Auto-collapse when no timers
  useEffect(() => {
    if (totalTimers === 0) {
      setIsExpanded(false);
      setIsMinimized(false);
    }
  }, [totalTimers]);

  const showExpandButton = running.length > 2 || done.length > 2 || (running.length > 0 && done.length > 0);

  // Don't render if no timers and minimized
  if (totalTimers === 0 && isMinimized) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <motion.div 
        className={`mx-auto max-w-screen-md m-3 rounded-2xl shadow-xl bg-white border transition-all duration-300 ${
          isExpanded ? 'max-h-[65vh]' : ''
        }`}
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* 拖拽指示条 - 只在展开时显示 */}
        {isExpanded && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}

        {/* Header with expand/collapse and minimize buttons */}
        <div className="flex items-center gap-2 mb-2 px-3 pt-3">
          <div 
            className={`flex items-center gap-2 flex-1 ${showExpandButton && !isMinimized ? 'cursor-pointer' : ''}`}
            onClick={() => showExpandButton && !isMinimized && setIsExpanded(!isExpanded)}
          >
            <Clock className="w-4 h-4" />
            <div className="font-medium">在锅里</div>
            <div className="text-xs text-gray-500">{running.length} 个还在煮</div>
            {done.length > 0 && (
              <>
                <div className="text-xs text-gray-300">•</div>
                <div className="text-xs text-emerald-600">{done.length} 个出锅啦</div>
              </>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {isExpanded && (
              <motion.button
                className="p-1 hover:bg-gray-100 rounded-md transition-colors text-xs text-gray-500"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(false)}
              >
                收起
              </motion.button>
            )}
            
            {showExpandButton && !isMinimized && (
              <motion.button
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                )}
              </motion.button>
            )}
            
            {totalTimers > 0 && (
              <motion.button
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "展开火锅状态" : "收起火锅状态"}
              >
                <Minus className="w-4 h-4 text-gray-400" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Content - hide when minimized */}
        {!isMinimized && (
          <div className={`px-3 pb-3 ${isExpanded ? 'overflow-y-auto max-h-[calc(65vh-100px)]' : ''}`}>
            {/* Done section - 出锅啦的食物显示在最上面 */}
            {done.length > 0 && (
              <motion.div 
                className="mb-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                  <Check className="w-4 h-4" />
                  <div className="font-medium">出锅啦</div>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={onClearDone}>全部盛起</Button>
                </div>
                {isExpanded ? (
                  // Expanded view: 完成的食材使用更紧凑的三列布局
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {done.map((t) => (
                      <div key={t.id} className="opacity-90">
                        <TimerChip item={t} onRemove={onRemove} percent={100} />
                      </div>
                    ))}
                  </div>
                ) : (
                  // Collapsed view: Horizontal scroll
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {done.map((t) => (
                      <div key={t.id} className="shrink-0 w-[160px] opacity-90">
                        <TimerChip item={t} onRemove={onRemove} percent={100} />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Running section - 在锅里的食物显示在下面，按剩余时间排序 */}
            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? "auto" : running.length === 0 ? "auto" : "60px"
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`overflow-hidden ${running.length === 0 ? '' : isExpanded ? '' : 'overflow-hidden'}`}
            >
              {running.length === 0 ? (
                totalTimers === 0 ? (
                  <div className="text-sm text-gray-500">锅里空空的，点上面的食材卡片开始煮吧～</div>
                ) : (
                  <div className="text-sm text-gray-500">正在煮的食材都出锅啦～继续添加新的吧</div>
                )
              ) : isExpanded ? (
                // Expanded view: 响应式网格布局，快完成的排在前面
                <div className="space-y-2">
                  {/* 快完成提醒 */}
                  {sortedRunning.filter(t => Math.max(0, t.endAt - Date.now()) <= 30000).length > 0 && (
                    <div className="text-xs text-orange-600 font-medium mb-2">
                      ⚡ 快完成的食材（30秒内）
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sortedRunning.map((t) => {
                      const timeLeft = Math.max(0, t.endAt - Date.now());
                      const isUrgent = timeLeft <= 30000 && timeLeft > 0;
                      return (
                        <div key={t.id} className={isUrgent ? 'ring-2 ring-orange-300 rounded-lg' : ''}>
                          <TimerChip item={t} onRemove={onRemove} percent={percent(t)} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Collapsed view: Horizontal scroll，显示最紧急的
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {sortedRunning.slice(0, 2).map((t) => (
                    <div key={t.id} className="shrink-0 w-[220px]">
                      <TimerChip item={t} onRemove={onRemove} percent={percent(t)} />
                    </div>
                  ))}
                  {running.length > 2 && (
                    <div className="shrink-0 w-[100px] flex items-center justify-center text-sm text-gray-500">
                      +{running.length - 2} 还在煮...
                    </div>
                  )}
                </div>
              )}
            </motion.div>
            
            {/* 底部渐变遮罩提示 - 只在展开且内容可滚动时显示 */}
            {isExpanded && (running.length + done.length) > 6 && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-2xl"></div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function TimerChip({
  item,
  onRemove,
  percent,
}: {
  item: TimerItem;
  onRemove: (id: string) => void;
  percent: number;
}) {
  const leftMs = Math.max(0, item.endAt - Date.now());
  const leftText = formatTimeLeft(leftMs);
  const isDone = item.status === "done";

  return (
    <Card className={`border-2 transition-all relative overflow-hidden cursor-pointer ${
      isDone 
        ? "border-emerald-300 shadow-md hover:shadow-lg hover:border-emerald-400" 
        : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300"
    }`}
    onClick={() => onRemove(item.id)}
    >
      {/* 进度条作为背景 - 使用温暖橙色系 */}
      <div 
        className={`absolute inset-0 transition-all duration-300`} 
        style={{ 
          width: isDone ? '100%' : `${percent}%`,
          background: isDone 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.12) 100%)'
            : `linear-gradient(to right, 
                rgba(251, 146, 60, 0.25) 0%, 
                rgba(249, 115, 22, 0.18) 25%,
                rgba(234, 88, 12, 0.15) 50%,
                rgba(194, 65, 12, 0.08) 75%,
                transparent 100%)`
        }} 
      />
      
      <CardContent className={`relative z-10 ${isDone ? 'p-2' : 'p-3'}`}>
        {isDone ? (
          // 完成状态：紧凑布局，只显示 emoji + 名称 + 筷子
          <div className="flex items-center gap-2">
            <div className="text-lg">{item.emoji}</div>
            <div className="font-medium truncate flex-1 text-sm">{item.name}</div>
            <span className="text-emerald-600 text-lg">🥢</span>
          </div>
        ) : (
          // 进行中状态：保持原有布局
          <div className="flex items-center gap-3">
            <div className="text-xl">{item.emoji}</div>
            <div className="font-semibold truncate flex-1">{item.name}</div>
            <div className="flex items-center gap-2">
              {/* 圆形进度指示器 */}
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                  {/* 背景圆环 */}
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="rgb(229 231 235)"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  {/* 进度圆环 - 使用温暖橙色 */}
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="rgb(249, 115, 22)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 12}`}
                    strokeDashoffset={`${2 * Math.PI * 12 * (1 - percent / 100)}`}
                    className="transition-all duration-300 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="text-sm font-mono px-2 py-1 rounded-md bg-white/90 text-gray-700 border border-gray-200">
                {leftText}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 小样式：隐藏滚动条（仅视觉）
const css = `
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

if (typeof document !== "undefined") {
  const styleId = "hotpot-no-scrollbar";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = css;
    document.head.appendChild(style);
  }
}
