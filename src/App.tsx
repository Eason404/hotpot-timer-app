import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, BellRing, Check, Timer, Clock, Settings, Volume2, VolumeX, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { INGREDIENTS, CATEGORIES, RECOMMENDED_INGREDIENTS } from "@/data/ingredients";

// ----------------------
// 火锅计时器（Card View）
// ----------------------
// 设计目标：移动优先、点卡片即可开计时、支持多份、完成提醒（声/震/通知）、UI简洁。
// 使用：把此组件放入任意 React（Vite/Next）项目；项目需启用 Tailwind 与 shadcn/ui。
// ----------------------

// 一个简单的可听提示（不依赖音频文件）
function playBeep(duration = 250, frequency = 1000, volume = 0.2) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(frequency, ctx.currentTime);
    g.gain.value = volume;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, duration);
  } catch {}
}

function requestNotifyPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function fireNativeNotification(title: string, body?: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try { new Notification(title, { body }); } catch {}
  }
}

function formatTimeLeft(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${r.toString().padStart(2, "0")}` : `${r}s`;
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

// 单个计时条目
export type TimerItem = {
  id: string;
  name: string;
  emoji?: string;
  totalMs: number;
  startAt: number;
  endAt: number;
  status: "running" | "paused" | "done";
  pausedLeftMs?: number; // 暂停时的剩余毫秒
  note?: string;
};

function createTimerFromIngredient(ing: (typeof INGREDIENTS)[number], offsetSec = 0): TimerItem {
  const now = Date.now();
  const totalMs = (ing.seconds + offsetSec) * 1000;
  return {
    id: `${ing.id}_${now}`,
    name: ing.name,
    emoji: ing.emoji,
    totalMs,
    startAt: now,
    endAt: now + totalMs,
    status: "running",
  };
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

  useEffect(() => saveToStorage("hotpot_timers", timers), [timers]);
  useEffect(() => saveToStorage("hotpot_sound", soundOn), [soundOn]);
  useEffect(() => saveToStorage("hotpot_vibrate", vibrateOn), [vibrateOn]);

  useEffect(() => {
    // 首次交互请求通知权限（非强制）
    const t = setTimeout(() => requestNotifyPermission(), 1200);
    return () => clearTimeout(t);
  }, []);

  // 驱动重渲染
  const tick = useTicking(true, 200);

  // 过滤后的食材
  const filtered = useMemo(() => {
    const q = query.trim();
    return INGREDIENTS.filter((i) =>
      (category === "全部" || i.category === category) &&
      (q === "" || i.name.includes(q))
    );
  }, [query, category]);

  // 计时完成 side effects
  useEffect(() => {
    const now = Date.now();
    const hasDue = timers.some((t) => t.status === "running" && t.endAt <= now);
    if (!hasDue) return;

    setTimers((prev) =>
      prev.map((t) => (t.status === "running" && t.endAt <= Date.now() ? { ...t, status: "done" } : t))
    );

    if (vibrateOn && navigator.vibrate) navigator.vibrate([180, 100, 180]);
    if (soundOn) playBeep(240, 1100, 0.25);
    fireNativeNotification("可以起锅啦！", "有食材到时间了～");
  }, [tick, timers, soundOn, vibrateOn]);

  const running = timers.filter((t) => t.status !== "done");
  const done = timers.filter((t) => t.status === "done");

  function addTimer(ing: (typeof INGREDIENTS)[number]) {
    setTimers((prev) => [createTimerFromIngredient(ing), ...prev]);
  }

  function removeTimer(id: string) {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }

  function clearDone() { setTimers((p) => p.filter((t) => t.status !== "done")); }

  function percent(t: TimerItem) {
    const total = t.totalMs;
    const passed = Math.min(total, Math.max(0, (Date.now() - t.startAt)));
    return Math.round((passed / total) * 100);
  }

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

      {/* 搜索 & 分类 */}
      <div className="mx-auto max-w-screen-md px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索食材（如：毛肚、虾滑）"
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((c) => (
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

      {/* 快捷食材（推荐）*/}
      <div className="mx-auto max-w-screen-md px-4 mt-4">
        <div className="text-sm text-gray-500 mb-2">常用推荐</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {RECOMMENDED_INGREDIENTS.map((id) => {
            const ing = INGREDIENTS.find((x) => x.id === id)!;
            return (
              <Card key={id} className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group" 
                onClick={() => addTimer(ing)}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ing.emoji}</span>
                    <div>
                      <div className="font-medium leading-tight">{ing.name}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round(ing.seconds / 60) > 0 ? `${Math.round(ing.seconds / 60)}分` : `${ing.seconds}s`}
                      </div>
                    </div>
                  </div>
                </CardContent>
                {/* Subtle hover indicator */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
              </Card>
            );
          })}
        </div>
      </div>

      {/* 所有食材网格 */}
      <div className="mx-auto max-w-screen-md px-4 mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((ing) => (
            <motion.div key={ing.id} layout>
              <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer relative group" 
                onClick={() => addTimer(ing)}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{ing.emoji}</span>
                      {ing.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(ing.seconds / 60) > 0 ? `${Math.round(ing.seconds / 60)}分` : `${ing.seconds}s`}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {ing.hint && <div className="text-xs text-gray-500 mb-3">{ing.hint}</div>}
                </CardContent>
                {/* Subtle hover indicator */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 底部活动计时器栏 */}
      <BottomDock
        running={running}
        done={done}
        onRemove={removeTimer}
        onClearDone={clearDone}
        percent={percent}
      />
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
        className="mx-auto max-w-screen-md m-3 p-3 rounded-2xl shadow-xl bg-white border"
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header with expand/collapse and minimize buttons */}
        <div className="flex items-center gap-2 mb-2">
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
          <>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

            {/* Running section - 在锅里的食物显示在下面 */}
            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? "auto" : running.length === 0 ? "auto" : "60px"
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`overflow-hidden ${running.length === 0 ? '' : isExpanded ? '' : 'overflow-hidden'}`}
            >
              {running.length === 0 ? (
                <div className="text-sm text-gray-500">锅里空空的，点上面的食材卡片开始煮吧～</div>
              ) : isExpanded ? (
                // Expanded view: 响应式网格布局
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {running.map((t) => (
                    <div key={t.id}>
                      <TimerChip item={t} onRemove={onRemove} percent={percent(t)} />
                    </div>
                  ))}
                </div>
              ) : (
                // Collapsed view: Horizontal scroll
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {running.slice(0, 2).map((t) => (
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
          </>
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
      {/* 进度条作为背景 - 加深颜色 */}
      <div 
        className={`absolute inset-0 transition-all duration-300`} 
        style={{ 
          width: isDone ? '100%' : `${percent}%`,
          background: isDone 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)'
            : `linear-gradient(to right, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 70%, transparent 100%)`
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
                  {/* 进度圆环 */}
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="rgb(59 130 246)"
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
