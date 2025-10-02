import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, BellRing, Check, Plus, Pause, Play, X, Timer, Clock, Settings, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// ----------------------
// 火锅计时器（Card View）
// ----------------------
// 设计目标：移动优先、点卡片即可开计时、支持多份、完成提醒（声/震/通知）、UI简洁。
// 使用：把此组件放入任意 React（Vite/Next）项目；项目需启用 Tailwind 与 shadcn/ui。
// ----------------------

// 推荐食材与默认时间（秒）。时间取中式火锅常见“熟透/最佳口感”建议值。
const INGREDIENTS: Array<{
  id: string;
  name: string;
  emoji?: string;
  seconds: number; // 推荐时长（秒）
  category: "肉类" | "内脏/爽脆" | "丸滑/加工" | "海鲜" | "蔬菜菌菇" | "豆制品/主食" | "其他";
  hint?: string;
}> = [
  { id: "beef_roll", name: "肥牛卷", emoji: "🥩", seconds: 45, category: "肉类", hint: "涮至变色即可" },
  { id: "lamb_slice", name: "羊肉片", emoji: "🥩", seconds: 60, category: "肉类" },
  { id: "tripe", name: "毛肚", emoji: "🐄", seconds: 15, category: "内脏/爽脆", hint: "七上八下 ~15s" },
  { id: "duck_intestine", name: "鸭肠", emoji: "🦆", seconds: 20, category: "内脏/爽脆" },
  { id: "artery", name: "黄喉", emoji: "✨", seconds: 120, category: "内脏/爽脆" },
  { id: "shrimp_paste", name: "虾滑", emoji: "🍤", seconds: 180, category: "丸滑/加工" },
  { id: "beef_ball", name: "牛筋丸", emoji: "🥣", seconds: 420, category: "丸滑/加工" },
  { id: "fish_ball", name: "鱼丸", emoji: "🐟", seconds: 300, category: "丸滑/加工" },
  { id: "luncheon", name: "午餐肉", emoji: "🥫", seconds: 120, category: "丸滑/加工" },
  { id: "shrimp", name: "鲜虾", emoji: "🦐", seconds: 180, category: "海鲜" },
  { id: "crab_stick", name: "蟹棒", emoji: "🦀", seconds: 120, category: "海鲜" },
  { id: "enoki", name: "金针菇", emoji: "🍄", seconds: 120, category: "蔬菜菌菇" },
  { id: "mushroom_mix", name: "菌菇拼", emoji: "🍄", seconds: 180, category: "蔬菜菌菇" },
  { id: "lotus", name: "藕片", emoji: "🥢", seconds: 180, category: "蔬菜菌菇" },
  { id: "spinach", name: "菠菜", emoji: "🥬", seconds: 60, category: "蔬菜菌菇" },
  { id: "kelp_knot", name: "海带结", emoji: "🔗", seconds: 300, category: "蔬菜菌菇" },
  { id: "tofu", name: "北豆腐", emoji: "🧊", seconds: 180, category: "豆制品/主食" },
  { id: "frozen_tofu", name: "冻豆腐", emoji: "🧊", seconds: 300, category: "豆制品/主食" },
  { id: "tofu_skin", name: "千张/百叶", emoji: "🧆", seconds: 90, category: "豆制品/主食" },
  { id: "glass_noodle", name: "粉丝", emoji: "🍜", seconds: 240, category: "豆制品/主食" },
  { id: "wide_noodle", name: "宽粉", emoji: "🍜", seconds: 300, category: "豆制品/主食" },
  { id: "corn", name: "玉米段", emoji: "🌽", seconds: 480, category: "其他" },
];

const CATEGORIES = [
  "全部",
  "肉类",
  "内脏/爽脆",
  "丸滑/加工",
  "海鲜",
  "蔬菜菌菇",
  "豆制品/主食",
  "其他",
] as const;

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
  const [, setT] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setT((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);
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
  useTicking(true, 200);

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
  }, [timers, soundOn, vibrateOn]);

  const running = timers.filter((t) => t.status !== "done");
  const done = timers.filter((t) => t.status === "done");

  function addTimer(ing: (typeof INGREDIENTS)[number]) {
    setTimers((prev) => [createTimerFromIngredient(ing), ...prev]);
  }

  function addTimerWithAdjust(ing: (typeof INGREDIENTS)[number], secondsDelta: number) {
    setTimers((prev) => [createTimerFromIngredient(ing, secondsDelta), ...prev]);
  }

  function pauseResumeTimer(id: string) {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "running") {
          const left = t.endAt - Date.now();
          return { ...t, status: "paused", pausedLeftMs: Math.max(0, left) };
        }
        if (t.status === "paused") {
          const now = Date.now();
          const left = t.pausedLeftMs ?? 0;
          return { ...t, status: "running", startAt: now, endAt: now + left, pausedLeftMs: undefined };
        }
        return t;
      })
    );
  }

  function removeTimer(id: string) {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }

  function snoozeTimer(id: string, addSeconds = 30) {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "running", endAt: Date.now() + addSeconds * 1000 } : t))
    );
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
            <Button key={c} size="sm" variant={category === c ? "default" : "outline"} className="rounded-full"
              onClick={() => setCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* 快捷食材（推荐）*/}
      <div className="mx-auto max-w-screen-md px-4 mt-4">
        <div className="text-sm text-gray-500 mb-2">常用推荐</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {["beef_roll", "tripe", "shrimp_paste", "fish_ball", "enoki", "tofu", "glass_noodle", "shrimp"].map((id) => {
            const ing = INGREDIENTS.find((x) => x.id === id)!;
            return (
              <Card key={id} className="hover:shadow transition cursor-pointer" onClick={() => addTimer(ing)}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ing.emoji}</span>
                    <div>
                      <div className="font-medium leading-tight">{ing.name}</div>
                      <div className="text-xs text-gray-500">{Math.round(ing.seconds / 60) > 0 ? `${Math.round(ing.seconds / 60)}分` : `${ing.seconds}s`}</div>
                    </div>
                  </div>
                  <Button size="icon" variant="secondary"><Plus className="w-4 h-4" /></Button>
                </CardContent>
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
              <Card className="hover:shadow-md transition relative">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2"><span className="text-xl">{ing.emoji}</span>{ing.name}</span>
                    <Badge variant="secondary">{Math.round(ing.seconds / 60) > 0 ? `${Math.round(ing.seconds / 60)}分` : `${ing.seconds}s`}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {ing.hint && <div className="text-xs text-gray-500 mb-2">{ing.hint}</div>}
                  <div className="flex items-center gap-2">
                    <Button className="flex-1" onClick={() => addTimer(ing)}>开始</Button>
                    <AdjustButton onConfirm={(delta) => addTimerWithAdjust(ing, delta)} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 底部活动计时器栏 */}
      <BottomDock
        running={running}
        done={done}
        onPauseResume={pauseResumeTimer}
        onRemove={removeTimer}
        onSnooze={snoozeTimer}
        onClearDone={clearDone}
        percent={percent}
      />
    </div>
  );
}

function AdjustButton({ onConfirm }: { onConfirm: (deltaSeconds: number) => void }) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState(0);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} title="微调时长">±秒</Button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="relative z-10 w-full sm:w-[420px] bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-xl">
              <div className="font-medium mb-2">微调推荐时长（-60s ~ +60s）</div>
              <div className="px-2">
                <Slider min={-60} max={60} step={5} value={[delta]} onValueChange={(v) => setDelta(v[0])} />
                <div className="text-center text-sm text-gray-600 mt-2">{delta > 0 ? `+${delta}s` : `${delta}s`}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button className="flex-1" onClick={() => { onConfirm(delta); setOpen(false); }}>加入并开始</Button>
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">取消</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BottomDock({
  running,
  done,
  onPauseResume,
  onRemove,
  onSnooze,
  onClearDone,
  percent,
}: {
  running: TimerItem[];
  done: TimerItem[];
  onPauseResume: (id: string) => void;
  onRemove: (id: string) => void;
  onSnooze: (id: string, addSeconds?: number) => void;
  onClearDone: () => void;
  percent: (t: TimerItem) => number;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto max-w-screen-md m-3 p-3 rounded-2xl shadow-xl bg-white border">
        {/* Running section */}
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4" />
          <div className="font-medium">进行中</div>
          <div className="text-xs text-gray-500">{running.length} 个</div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {running.length === 0 && <div className="text-sm text-gray-500">还没有计时，点上面的食材卡片开始吧～</div>}
          {running.map((t) => (
            <div key={t.id} className="shrink-0 w-[220px]">
              <TimerChip item={t} onPauseResume={onPauseResume} onRemove={onRemove} onSnooze={onSnooze} percent={percent(t)} />
            </div>
          ))}
        </div>

        {/* Done section */}
        {done.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2 text-emerald-700">
              <Check className="w-4 h-4" />
              <div className="font-medium">已完成</div>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={onClearDone}>清除全部</Button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {done.map((t) => (
                <div key={t.id} className="shrink-0 w-[220px] opacity-90">
                  <TimerChip item={t} onPauseResume={onPauseResume} onRemove={onRemove} onSnooze={onSnooze} percent={100} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimerChip({
  item,
  onPauseResume,
  onRemove,
  onSnooze,
  percent,
}: {
  item: TimerItem;
  onPauseResume: (id: string) => void;
  onRemove: (id: string) => void;
  onSnooze: (id: string, addSeconds?: number) => void;
  percent: number;
}) {
  const leftMs = item.status === "paused" ? (item.pausedLeftMs ?? 0) : Math.max(0, item.endAt - Date.now());
  const leftText = formatTimeLeft(leftMs);
  const isDone = item.status === "done";

  return (
    <Card className={`border ${isDone ? "border-emerald-300 bg-emerald-50" : ""}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-lg">{item.emoji}</div>
          <div className="font-medium truncate flex-1">{item.name}</div>
          <div className="text-xs tabular-nums">{leftText}</div>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gray-800" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex items-center gap-1 mt-2">
          {!isDone && (
            <Button size="icon" variant="secondary" onClick={() => onPauseResume(item.id)} title={item.status === "paused" ? "继续" : "暂停"}>
              {item.status === "paused" ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          )}
          {isDone ? (
            <Button size="sm" variant="default" className="ml-auto" onClick={() => onRemove(item.id)}><Check className="w-4 h-4 mr-1" />知道了</Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => onSnooze(item.id, 30)}>+30s</Button>
              <Button size="sm" variant="outline" onClick={() => onSnooze(item.id, 60)}>+60s</Button>
              <Button size="icon" variant="ghost" className="ml-auto" onClick={() => onRemove(item.id)} title="移除">
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
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
