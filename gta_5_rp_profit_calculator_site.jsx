import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trash2, Fish, Wallet, Target, PlusCircle, TrendingUp, Sparkles, ChevronDown, CheckCircle2 } from "lucide-react";

type FishItem = {
  id: number;
  name: string;
  kg: number;
  price: number;
};

type ExpenseItem = {
  id: number;
  title: string;
  amount: number;
};

type TabKey = "goal" | "expenses" | "catch" | "summary";

const formatMoney = (value: number) => {
  if (!Number.isFinite(value)) return "$0";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function GtaProfitCalculator() {
  const [activeTab, setActiveTab] = useState<TabKey>("goal");
  const [useGoal, setUseGoal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState(0);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  const [fish, setFish] = useState<FishItem[]>([]);

  const [selectedFishName, setSelectedFishName] = useState("");
  const [newFishName, setNewFishName] = useState("");
  const [entryKg, setEntryKg] = useState(0);
  const [entryPrice, setEntryPrice] = useState(0);
  const [useCustomFishName, setUseCustomFishName] = useState(false);

  const tabs = [
    { key: "goal" as TabKey, label: "Цель", icon: Target },
    { key: "expenses" as TabKey, label: "Расходы", icon: Wallet },
    { key: "catch" as TabKey, label: "Улов", icon: Fish },
    { key: "summary" as TabKey, label: "Итог", icon: Sparkles },
  ];

  const uniqueFishNames = useMemo(() => {
    const names = fish.map((item) => item.name).filter(Boolean);
    return Array.from(new Set(names));
  }, [fish]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [expenses]
  );

  const totalRevenue = useMemo(
    () => fish.reduce((sum, item) => sum + (Number(item.price) || 0), 0),
    [fish]
  );

  const totalKg = useMemo(
    () => fish.reduce((sum, item) => sum + (Number(item.kg) || 0), 0),
    [fish]
  );

  const profitByFish = useMemo(() => {
    const grouped = new Map<string, { kg: number; price: number; count: number }>();

    fish.forEach((item) => {
      const key = item.name || "Без названия";
      const current = grouped.get(key) || { kg: 0, price: 0, count: 0 };
      grouped.set(key, {
        kg: current.kg + (Number(item.kg) || 0),
        price: current.price + (Number(item.price) || 0),
        count: current.count + 1,
      });
    });

    return Array.from(grouped.entries()).map(([name, data]) => ({ name, ...data }));
  }, [fish]);

  const netProfit = totalRevenue - totalExpenses;
  const progress = useGoal && goalAmount > 0 ? Math.max(0, Math.min(100, (netProfit / goalAmount) * 100)) : 0;
  const remaining = useGoal ? Math.max(0, goalAmount - netProfit) : 0;

  const updateExpense = (id: number, field: keyof ExpenseItem, value: string) => {
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "title" ? value : Number(value) || 0,
            }
          : item
      )
    );
  };

  const removeExpense = (id: number) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const removeFish = (id: number) => {
    setFish((prev) => prev.filter((item) => item.id !== id));
  };

  const addExpense = () => {
    setExpenses((prev) => [...prev, { id: Date.now(), title: "Новый расход", amount: 0 }]);
  };

  const addFishEntry = () => {
    const finalName = useCustomFishName ? newFishName.trim() : selectedFishName.trim();
    if (!finalName || (!entryKg && !entryPrice)) return;

    setFish((prev) => [
      {
        id: Date.now(),
        name: finalName,
        kg: Number(entryKg) || 0,
        price: Number(entryPrice) || 0,
      },
      ...prev,
    ]);

    setEntryKg(0);
    setEntryPrice(0);
    if (useCustomFishName) {
      setSelectedFishName(finalName);
      setUseCustomFishName(false);
      setNewFishName("");
    }
  };

  const renderTabContent = () => {
    if (activeTab === "goal") {
      return (
        <Card className="rounded-3xl border border-cyan-300/20 bg-[#071b2b]/85 backdrop-blur-xl shadow-[0_0_40px_rgba(14,165,233,0.08)]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-cyan-50">
              <Target className="h-5 w-5 text-cyan-300" />
              Цель накопления
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-cyan-300/15 bg-[#0a2438] p-4">
              <div>
                <Label className="text-base text-cyan-50">Использовать цель</Label>
                <p className="text-sm text-cyan-100/70">Сначала укажи мечту, либо отключи цель и просто считай прибыль.</p>
              </div>
              <Switch checked={useGoal} onCheckedChange={setUseGoal} />
            </div>

            {useGoal && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-cyan-100">На что копишь</Label>
                  <Input
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="Например: Дом в Вайнвуде"
                    className="h-12 rounded-2xl border-cyan-300/15 bg-[#0a2438] text-cyan-50 placeholder:text-cyan-100/35"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-cyan-100">Сумма цели</Label>
                  <Input
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(Number(e.target.value) || 0)}
                    placeholder="500000"
                    className="h-12 rounded-2xl border-cyan-300/15 bg-[#0a2438] text-cyan-50 placeholder:text-cyan-100/35"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("expenses")} className="h-12 rounded-2xl bg-cyan-300 text-[#02263b] hover:bg-cyan-200 font-bold px-6">
                Дальше: расходы
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "expenses") {
      return (
        <Card className="rounded-3xl border border-cyan-300/20 bg-[#071b2b]/85 backdrop-blur-xl shadow-[0_0_40px_rgba(14,165,233,0.08)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl text-cyan-50">
              <Wallet className="h-5 w-5 text-cyan-300" />
              Расходы
            </CardTitle>
            <Button onClick={addExpense} className="rounded-2xl bg-cyan-300 text-[#02263b] hover:bg-cyan-200 font-bold">
              <PlusCircle className="mr-2 h-4 w-4" /> Добавить
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_auto] items-center rounded-2xl border border-cyan-300/15 bg-[#0a2438] p-3"
              >
                <Input
                  value={item.title}
                  onChange={(e) => updateExpense(item.id, "title", e.target.value)}
                  placeholder="Название расхода"
                  className="h-11 rounded-2xl border-cyan-300/15 bg-[#081f31] text-cyan-50 placeholder:text-cyan-100/35"
                />
                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) => updateExpense(item.id, "amount", e.target.value)}
                  placeholder="Сумма"
                  className="h-11 rounded-2xl border-cyan-300/15 bg-[#081f31] text-cyan-50 placeholder:text-cyan-100/35"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExpense(item.id)}
                  className="rounded-2xl text-cyan-100 hover:bg-red-400/10 hover:text-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="rounded-2xl bg-cyan-400/10 p-4 border border-cyan-300/10">
              <p className="text-sm text-cyan-100/75">Сумма всех расходов</p>
              <p className="mt-1 text-3xl font-black text-cyan-200">{formatMoney(totalExpenses)}</p>
            </div>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setActiveTab("goal")} className="h-12 rounded-2xl border-cyan-300/20 bg-transparent text-cyan-100 hover:bg-cyan-400/10">
                Назад
              </Button>
              <Button onClick={() => setActiveTab("catch")} className="h-12 rounded-2xl bg-cyan-300 text-[#02263b] hover:bg-cyan-200 font-bold px-6">
                Дальше: улов
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === "catch") {
      return (
        <div className="space-y-6">
          <Card className="rounded-3xl border border-cyan-300/20 bg-[#071b2b]/85 backdrop-blur-xl shadow-[0_0_40px_rgba(14,165,233,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl text-cyan-50">
                <Fish className="h-5 w-5 text-cyan-300" />
                Добавить улов
              </CardTitle>
              <div className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100 border border-cyan-300/20">
                Красиво и быстро
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => setUseCustomFishName(false)}
                  className={`rounded-2xl border p-4 text-left transition ${!useCustomFishName ? "border-cyan-300 bg-cyan-400/15 text-cyan-50 shadow-[0_0_25px_rgba(34,211,238,0.16)]" : "border-cyan-300/15 bg-[#0a2438] text-cyan-100/75"}`}
                >
                  <p className="font-semibold">Добавить существующую рыбу</p>
                  <p className="mt-1 text-sm opacity-80">Чтобы не писать название заново.</p>
                </button>
                <button
                  onClick={() => setUseCustomFishName(true)}
                  className={`rounded-2xl border p-4 text-left transition ${useCustomFishName ? "border-cyan-300 bg-cyan-400/15 text-cyan-50 shadow-[0_0_25px_rgba(34,211,238,0.16)]" : "border-cyan-300/15 bg-[#0a2438] text-cyan-100/75"}`}
                >
                  <p className="font-semibold">Добавить новую рыбу</p>
                  <p className="mt-1 text-sm opacity-80">Новый вид улова с новым названием.</p>
                </button>
              </div>

              {useCustomFishName ? (
                <div className="space-y-2">
                  <Label className="text-cyan-100">Название рыбы</Label>
                  <Input
                    value={newFishName}
                    onChange={(e) => setNewFishName(e.target.value)}
                    placeholder="Например: Осётр"
                    className="h-12 rounded-2xl border-cyan-300/15 bg-[#0a2438] text-cyan-50 placeholder:text-cyan-100/35"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-cyan-100">Выбери рыбу</Label>
                  <div className="relative">
                    <select$1>
                      <option value="" disabled>
                        Выбери сохранённую рыбу
                      </option>
                      {uniqueFishNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200" />
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-cyan-100">Вес рыбы</Label>
                  <Input
                    type="number"
                    value={entryKg}
                    onChange={(e) => setEntryKg(Number(e.target.value) || 0)}
                    placeholder="Кг"
                    className="h-12 rounded-2xl border-cyan-300/15 bg-[#0a2438] text-cyan-50 placeholder:text-cyan-100/35"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-cyan-100">Цена за эту рыбу</Label>
                  <Input
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value) || 0)}
                    placeholder="Например: 25200"
                    className="h-12 rounded-2xl border-cyan-300/15 bg-[#0a2438] text-cyan-50 placeholder:text-cyan-100/35"
                  />
                </div>
              </div>

              <Button
                onClick={addFishEntry}
                className="h-12 rounded-2xl bg-cyan-300 text-[#02263b] hover:bg-cyan-200 font-bold shadow-[0_0_30px_rgba(103,232,249,0.25)]"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Добавить в улов
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-cyan-300/20 bg-[#071b2b]/85 backdrop-blur-xl shadow-[0_0_40px_rgba(14,165,233,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl text-cyan-50">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                Прибыль по каждой рыбе
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {profitByFish.length > 0 ? profitByFish.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-cyan-300/15 bg-[#0a2438] p-4 shadow-[0_0_25px_rgba(14,165,233,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-cyan-50">{item.name}</p>
                        <p className="text-sm text-cyan-100/70">Записей: {item.count}</p>
                      </div>
                      <div className="rounded-xl bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100 border border-cyan-300/15">
                        {item.kg.toLocaleString("ru-RU")} кг
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl bg-cyan-400/10 p-4 border border-cyan-300/10">
                      <p className="text-sm text-cyan-100/75">Прибыль с этой рыбы</p>
                      <p className="mt-1 text-3xl font-black text-cyan-200 drop-shadow-[0_0_16px_rgba(103,232,249,0.2)]">
                        {formatMoney(item.price)}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-cyan-300/15 bg-[#0a2438] p-6 text-center text-cyan-100/70 md:col-span-2">
                    Пока нет добавленной рыбы.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-cyan-300/20 bg-[#071b2b]/85 backdrop-blur-xl shadow-[0_0_40px_rgba(14,165,233,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-cyan-50">
                <Fish className="h-5 w-5 text-cyan-300" />
                Последний улов
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fish.length > 0 ? fish.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-cyan-300/15 bg-[#0a2438] p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-lg font-bold text-cyan-50">{item.name || "Без названия"}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-cyan-100 border border-cyan-300/15">
                        Вес: {item.kg.toLocaleString("ru-RU")} кг
                      </span>
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-cyan-100 border border-cyan-300/15">
                        Цена: {formatMoney(item.price)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFish(item.id)}
                    className="self-end rounded-2xl text-cyan-100 hover:bg-red-400/10 hover:text-red-200 md:self-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-cyan-300/15 bg-[#0a2438] p-6 text-center text-cyan-100/70">
                  Улов пока пустой.
                </div>
              )}

              <div className="flex justify-between gap-3 pt-2">
                <Button variant="outline" onClick={() => setActiveTab("expenses")} className="h-12 rounded-2xl border-cyan-300/20 bg-transparent text-cyan-100 hover:bg-cyan-400/10">
                  Назад
                </Button>
                <Button onClick={() => setActiveTab("summary")} className="h-12 rounded-2xl bg-cyan-300 text-[#02263b] hover:bg-cyan-200 font-bold px-6">
                  Смотреть итог
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/15 to-sky-400/10 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.12)]">
          <CardHeader>
            <CardTitle className="text-xl text-cyan-50">Итоги</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-[#082133] p-4 border border-cyan-300/10">
              <p className="text-sm font-medium text-cyan-100/80">Общий вес рыбы</p>
              <p className="mt-1 text-2xl font-black text-white">{totalKg.toLocaleString("ru-RU")} кг</p>
            </div>
            <div className="rounded-2xl bg-[#082133] p-4 border border-cyan-300/10">
              <p className="text-sm font-medium text-cyan-100/80">Общая прибыль с рыбы</p>
              <p className="mt-1 text-2xl font-black text-cyan-200">{formatMoney(totalRevenue)}</p>
            </div>
            <div className="rounded-2xl bg-[#082133] p-4 border border-cyan-300/10">
              <p className="text-sm font-medium text-cyan-100/80">Все расходы</p>
              <p className="mt-1 text-2xl font-black text-white">{formatMoney(totalExpenses)}</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/12 p-4 shadow-[0_0_25px_rgba(34,211,238,0.08)]">
              <p className="text-sm font-medium text-cyan-100/85">Чистая прибыль</p>
              <p className={`mt-1 text-3xl font-black ${netProfit >= 0 ? "text-cyan-200" : "text-red-300"}`}>
                {formatMoney(netProfit)}
              </p>
            </div>
          </CardContent>
        </Card>

        {useGoal && (
          <Card className="rounded-3xl border border-cyan-300/20 bg-[#071b2b]/85 backdrop-blur-xl shadow-[0_0_40px_rgba(14,165,233,0.08)]">
            <CardHeader>
              <CardTitle className="text-xl text-cyan-50">Прогресс к цели</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-center">
                <div>
                  <p className="text-sm text-cyan-100/70">Цель</p>
                  <p className="mt-1 text-lg font-bold text-cyan-100">{goalName || "Без названия"}</p>
                </div>
                <div className="rounded-2xl bg-[#0a2438] p-4 border border-cyan-300/10 min-w-[220px]">
                  <p className="text-sm text-cyan-100/75">Осталось накопить</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatMoney(remaining)}</p>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-cyan-100/75">
                  <span>{formatMoney(netProfit)}</span>
                  <span>{formatMoney(goalAmount)}</span>
                </div>
                <Progress value={progress} className="h-3 rounded-full bg-cyan-950/60" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={() => setActiveTab("catch")} className="h-12 rounded-2xl border-cyan-300/20 bg-transparent text-cyan-100 hover:bg-cyan-400/10">
            Назад
          </Button>
          <Button onClick={() => setActiveTab("goal")} className="h-12 rounded-2xl bg-cyan-300 text-[#02263b] hover:bg-cyan-200 font-bold px-6">
            В начало
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#03131f] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,225,255,0.24),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(35,140,255,0.24),transparent_35%),linear-gradient(180deg,#021018_0%,#062235_100%)]" />
      <div className="absolute inset-0 opacity-100">
        <div className="absolute -top-10 left-0 h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <TrendingUp className="h-4 w-4 text-cyan-200" />
            GTA 5 RP • Яркий калькулятор прибыли
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl leading-tight">
            Считай улов и <span className="text-cyan-300 drop-shadow-[0_0_18px_rgba(103,232,249,0.5)]">прибыль</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-cyan-50/85 md:text-base leading-7">
            Теперь всё разложено по вкладкам: сначала цель, потом расходы, потом улов и в конце готовый итог.
          </p>
        </motion.div>

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const isDone = index < tabs.findIndex((item) => item.key === activeTab);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl border p-4 text-left transition-all ${isActive ? "border-cyan-300 bg-cyan-400/15 shadow-[0_0_25px_rgba(34,211,238,0.16)]" : "border-cyan-300/15 bg-[#0a2438]/80 hover:bg-[#102b42]"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 ${isActive ? "bg-cyan-300 text-[#02263b]" : "bg-cyan-400/10 text-cyan-200"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-cyan-100/65">Шаг {index + 1}</p>
                      <p className="font-bold text-cyan-50">{tab.label}</p>
                    </div>
                  </div>
                  {isDone && <CheckCircle2 className="h-5 w-5 text-cyan-300" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>

          <div className="space-y-6">
            <Card className="rounded-3xl border border-cyan-300/20 bg-[#071b2b]/85 backdrop-blur-xl shadow-[0_0_40px_rgba(14,165,233,0.08)]">
              <CardHeader>
                <CardTitle className="text-xl text-cyan-50">Быстрый итог</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-[#082133] p-4 border border-cyan-300/10">
                  <p className="text-sm text-cyan-100/80">Улов</p>
                  <p className="mt-1 text-2xl font-black text-white">{totalKg.toLocaleString("ru-RU")} кг</p>
                </div>
                <div className="rounded-2xl bg-[#082133] p-4 border border-cyan-300/10">
                  <p className="text-sm text-cyan-100/80">С рыбы</p>
                  <p className="mt-1 text-2xl font-black text-cyan-200">{formatMoney(totalRevenue)}</p>
                </div>
                <div className="rounded-2xl bg-[#082133] p-4 border border-cyan-300/10">
                  <p className="text-sm text-cyan-100/80">Расходы</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatMoney(totalExpenses)}</p>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/12 p-4 shadow-[0_0_25px_rgba(34,211,238,0.08)]">
                  <p className="text-sm text-cyan-100/85">Чистая прибыль</p>
                  <p className={`mt-1 text-3xl font-black ${netProfit >= 0 ? "text-cyan-200" : "text-red-300"}`}>
                    {formatMoney(netProfit)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {useGoal && (
              <Card className="rounded-3xl border border-cyan-300/20 bg-[#071b2b]/85 backdrop-blur-xl shadow-[0_0_40px_rgba(14,165,233,0.08)]">
                <CardHeader>
                  <CardTitle className="text-xl text-cyan-50">Твоя цель</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-cyan-100/70">Копишь на</p>
                    <p className="mt-1 text-lg font-bold text-cyan-100">{goalName || "Без названия"}</p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-cyan-100/75">
                      <span>{formatMoney(netProfit)}</span>
                      <span>{formatMoney(goalAmount)}</span>
                    </div>
                    <Progress value={progress} className="h-3 rounded-full bg-cyan-950/60" />
                  </div>
                  <div className="rounded-2xl bg-[#0a2438] p-4 border border-cyan-300/10">
                    <p className="text-sm text-cyan-100/75">Осталось</p>
                    <p className="mt-1 text-2xl font-black text-white">{formatMoney(remaining)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
