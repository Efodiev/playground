"use client";

import React, { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  X,
  Save,
  MapPin,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Baby,
  Dumbbell,
  TreePine,
  Shield,
  Wrench,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// ==================== TYPES ====================
interface Playground {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  type: string;
  condition: string;
  rating: number;
  status: string;
  photos: string;
  equipment: string;
  submitterName: string | null;
  submitterEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PlaygroundEditFormProps {
  playground: Playground;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<Playground>) => void;
}

// ==================== CONSTANTS ====================
const CONDITION_SCORES: Record<string, number> = {
  excellent: 40,
  good: 28,
  needs_repair: 12,
  dangerous: 0,
};

const EQUIPMENT_SCORE_PER_ITEM = 4;
const MAX_EQUIPMENT_SCORE = 60;

const DISTRICTS = [
  "Тираспольский",
  "Бендерский",
  "Слободзейский",
  "Григориопольский",
  "Дубоссарский",
  "Рыбницкий",
  "Каменский",
];

const EQUIPMENT_CATEGORIES = {
  entertainment: {
    label: "Развлечения",
    icon: "🎢",
    items: [
      "Горки",
      "Качели",
      "Песочница",
      "Карусель",
      "Качалки",
      "Игровой домик",
      "Лабиринт",
      "Канатная сетка",
      "Батут",
      "Горка-туннель",
      "Сенсорные панели",
    ],
  },
  sport: {
    label: "Спорт",
    icon: "🏅",
    items: [
      "Турники",
      "Брусья",
      "Баскетбольное кольцо",
      "Мини-футбол",
      "Волейбол",
      "Шведская стенка",
      "Кольца",
      "Скамья для пресса",
      "Беговая дорожка",
    ],
  },
  comfort: {
    label: "Удобства",
    icon: "🪑",
    items: [
      "Лавочки",
      "Освещение",
      "Резиновое покрытие",
      "Ограждение",
      "Раздевалка",
      "Скамейки",
      "Урны",
      "Теневой навес",
      "Питьевая вода",
    ],
  },
  safety: {
    label: "Безопасность",
    icon: "🛡️",
    items: [
      "Резиновое покрытие",
      "Ограждение",
      "Инклюзивные качели",
      "Мягкие углы",
      "Возрастные зоны",
      "Знаки безопасности",
    ],
  },
};

const TYPE_OPTIONS = [
  { value: "kids", label: "Детская", icon: <Baby className="w-4 h-4" /> },
  { value: "sports", label: "Спортивная", icon: <Dumbbell className="w-4 h-4" /> },
  { value: "both", label: "Комбинированная", icon: <TreePine className="w-4 h-4" /> },
];

const CONDITION_OPTIONS = [
  { value: "excellent", label: "Идеально", icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-emerald-50 border-emerald-200 text-emerald-700 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500" },
  { value: "good", label: "Хорошее", icon: <Star className="w-4 h-4" />, color: "bg-primary/5 border-primary/20 text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary" },
  { value: "needs_repair", label: "Ремонт", icon: <AlertTriangle className="w-4 h-4" />, color: "bg-amber-50 border-amber-200 text-amber-700 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-500" },
  { value: "dangerous", label: "Опасно", icon: <XCircle className="w-4 h-4" />, color: "bg-red-50 border-red-200 text-red-700 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:border-red-500" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "На рассмотрении", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { value: "approved", label: "Одобрена", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { value: "rejected", label: "Отклонена", color: "bg-red-50 border-red-200 text-red-700" },
];

// ==================== HELPERS ====================
function calculateRating(condition: string, equipment: string[]): number {
  const conditionScore = CONDITION_SCORES[condition] || 0;
  const equipScore = Math.min(
    equipment.length * EQUIPMENT_SCORE_PER_ITEM,
    MAX_EQUIPMENT_SCORE
  );
  return Math.min(conditionScore + equipScore, 100);
}

function getRatingLabel(rating: number): { label: string; color: string } {
  if (rating >= 80) return { label: "Отлично", color: "text-emerald-600" };
  if (rating >= 60) return { label: "Хорошо", color: "text-primary" };
  if (rating >= 35) return { label: "Средне", color: "text-amber-600" };
  if (rating >= 15) return { label: "Ниже среднего", color: "text-orange-600" };
  return { label: "Плохо", color: "text-red-600" };
}

function getRatingBarColor(rating: number): string {
  if (rating >= 80) return "bg-emerald-500";
  if (rating >= 60) return "bg-primary";
  if (rating >= 35) return "bg-amber-500";
  if (rating >= 15) return "bg-orange-500";
  return "bg-red-500";
}

function parseEquipment(equipmentStr: string): string[] {
  try {
    return JSON.parse(equipmentStr || "[]");
  } catch {
    return [];
  }
}

// ==================== RATING PREVIEW ====================
function RatingPreview({ rating, conditionScore, equipScore }: { rating: number; conditionScore: number; equipScore: number }) {
  const info = getRatingLabel(rating);
  const barColor = getRatingBarColor(rating);

  return (
    <div className="rounded-2xl p-5 bg-muted/30 border border-border/30">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Star className="w-4 h-4 text-primary" />
        Предварительный рейтинг
      </h3>
      <div className="flex items-end justify-between mb-3">
        <span className={`text-2xl font-bold ${info.color}`}>{rating}</span>
        <span className={`text-sm font-semibold ${info.color}`}>
          {info.label}
        </span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden mb-4">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${rating}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Состояние
          </span>
          <span className="font-semibold">
            {conditionScore}/40
          </span>
        </div>
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${(conditionScore / 40) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Wrench className="w-3 h-3" />
            Оборудование
          </span>
          <span className="font-semibold">
            {equipScore}/60
          </span>
        </div>
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(equipScore / 60) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function PlaygroundEditForm({
  playground,
  isOpen,
  onClose,
  onSave,
}: PlaygroundEditFormProps) {
  // Form state
  const [name, setName] = useState(playground.name);
  const [description, setDescription] = useState(playground.description || "");
  const [type, setType] = useState(playground.type);
  const [condition, setCondition] = useState(playground.condition);
  const [address, setAddress] = useState(playground.address);
  const [district, setDistrict] = useState(playground.district);
  const [city, setCity] = useState(playground.city);
  const [equipment, setEquipment] = useState<string[]>(
    parseEquipment(playground.equipment)
  );
  const [status, setStatus] = useState(playground.status);
  const [lat, setLat] = useState(playground.lat.toString());
  const [lng, setLng] = useState(playground.lng.toString());

  // Reset form when playground prop changes
  // React pattern: adjust state during render when a prop changes
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevPlaygroundId, setPrevPlaygroundId] = useState(playground.id);
  if (prevPlaygroundId !== playground.id) {
    setPrevPlaygroundId(playground.id);
    setName(playground.name);
    setDescription(playground.description || "");
    setType(playground.type);
    setCondition(playground.condition);
    setAddress(playground.address);
    setDistrict(playground.district);
    setCity(playground.city);
    setEquipment(parseEquipment(playground.equipment));
    setStatus(playground.status);
    setLat(playground.lat.toString());
    setLng(playground.lng.toString());
  }

  // Auto-calculate rating
  const calculatedRating = useMemo(
    () => calculateRating(condition, equipment),
    [condition, equipment]
  );
  const conditionScore = CONDITION_SCORES[condition] || 0;
  const equipScore = Math.min(
    equipment.length * EQUIPMENT_SCORE_PER_ITEM,
    MAX_EQUIPMENT_SCORE
  );

  // Equipment toggle
  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Handle save
  const handleSave = () => {
    const updatedData: Partial<Playground> = {
      name,
      description: description || null,
      type,
      condition,
      address,
      district,
      city,
      equipment: JSON.stringify(equipment),
      status,
      lat: parseFloat(lat) || 0,
      lng: parseFloat(lng) || 0,
      rating: calculatedRating,
    };
    onSave(updatedData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-2xl bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="shrink-0 border-b border-border/30 px-6 py-4 flex items-center justify-between bg-background/95 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Редактирование площадки
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    ID: {playground.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="px-6 py-6 space-y-8">
                {/* ===== Basic Info Section ===== */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Основная информация
                  </h3>
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-name" className="text-sm font-medium">
                        Название площадки
                      </Label>
                      <Input
                        id="edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Название площадки"
                        className="rounded-xl"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-description"
                        className="text-sm font-medium"
                      >
                        Описание
                      </Label>
                      <Textarea
                        id="edit-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Описание площадки..."
                        className="rounded-xl min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* ===== Type Section ===== */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Тип площадки
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          type === opt.value
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/50 text-foreground border-border/30 hover:bg-muted hover:border-border/50"
                        }`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* ===== Condition Section ===== */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Состояние
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {CONDITION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCondition(opt.value)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          condition === opt.value
                            ? (() => {
                                if (opt.value === "excellent")
                                  return "bg-emerald-500 text-white border-emerald-500 shadow-sm";
                                if (opt.value === "good")
                                  return "bg-primary text-primary-foreground border-primary shadow-sm";
                                if (opt.value === "needs_repair")
                                  return "bg-amber-500 text-white border-amber-500 shadow-sm";
                                return "bg-red-500 text-white border-red-500 shadow-sm";
                              })()
                            : "bg-muted/50 text-foreground border-border/30 hover:bg-muted hover:border-border/50"
                        }`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* ===== Location Section ===== */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Расположение
                  </h3>
                  <div className="space-y-4">
                    {/* Address */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-address"
                        className="text-sm font-medium"
                      >
                        Адрес
                      </Label>
                      <Input
                        id="edit-address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Улица, дом"
                        className="rounded-xl"
                      />
                    </div>

                    {/* District */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Район</Label>
                      <Select value={district} onValueChange={setDistrict}>
                        <SelectTrigger className="w-full rounded-xl">
                          <SelectValue placeholder="Выберите район" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTRICTS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-city" className="text-sm font-medium">
                        Населённый пункт
                      </Label>
                      <Input
                        id="edit-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Город или село"
                        className="rounded-xl"
                      />
                    </div>

                    {/* Lat / Lng */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-lat"
                          className="text-sm font-medium"
                        >
                          Широта
                        </Label>
                        <Input
                          id="edit-lat"
                          type="number"
                          step="0.000001"
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          placeholder="46.84"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="edit-lng"
                          className="text-sm font-medium"
                        >
                          Долгота
                        </Label>
                        <Input
                          id="edit-lng"
                          type="number"
                          step="0.000001"
                          value={lng}
                          onChange={(e) => setLng(e.target.value)}
                          placeholder="29.63"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ===== Equipment Section ===== */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    Оборудование
                    <Badge variant="secondary" className="rounded-full text-xs ml-1">
                      {equipment.length}
                    </Badge>
                  </h3>
                  <div className="space-y-5">
                    {Object.entries(EQUIPMENT_CATEGORIES).map(
                      ([key, category]) => (
                        <div key={key}>
                          <p className="text-sm font-medium text-foreground mb-2.5 flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {category.items.map((item) => {
                              const isChecked = equipment.includes(item);
                              return (
                                <label
                                  key={item}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer border transition-all ${
                                    isChecked
                                      ? "bg-primary/5 border-primary/30 text-primary"
                                      : "bg-muted/30 border-border/20 text-muted-foreground hover:bg-muted/50 hover:border-border/40"
                                  }`}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() =>
                                      toggleEquipment(item)
                                    }
                                    className={
                                      isChecked
                                        ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        : ""
                                    }
                                  />
                                  <span className="truncate text-xs leading-tight">
                                    {item}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>

                {/* ===== Status Section ===== */}
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Статус модерации
                  </h3>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            {opt.value === "pending" && (
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            {opt.value === "approved" && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            {opt.value === "rejected" && (
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                            )}
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Status badge preview */}
                  <div className="mt-3 flex">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        STATUS_OPTIONS.find((o) => o.value === status)?.color
                      }`}
                    >
                      {status === "pending" && (
                        <Clock className="w-3 h-3" />
                      )}
                      {status === "approved" && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {status === "rejected" && (
                        <XCircle className="w-3 h-3" />
                      )}
                      {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                    </span>
                  </div>
                </section>

                {/* ===== Rating Preview ===== */}
                <section>
                  <RatingPreview
                    rating={calculatedRating}
                    conditionScore={conditionScore}
                    equipScore={equipScore}
                  />
                </section>

                {/* ===== Meta Info (Read-only) ===== */}
                <section className="rounded-2xl p-4 bg-muted/20 border border-border/20">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Системная информация
                  </h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Дата создания</span>
                      <span className="text-foreground">
                        {new Date(playground.createdAt).toLocaleDateString(
                          "ru-RU",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Последнее обновление</span>
                      <span className="text-foreground">
                        {new Date(playground.updatedAt).toLocaleDateString(
                          "ru-RU",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    {playground.submitterName && (
                      <div className="flex justify-between">
                        <span>Добавил(а)</span>
                        <span className="text-foreground">
                          {playground.submitterName}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="shrink-0 border-t border-border/30 px-6 py-4 bg-background/95 backdrop-blur-xl">
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl min-w-[100px]"
                >
                  Отменить
                </Button>
                <Button
                  onClick={handleSave}
                  className="rounded-xl min-w-[100px] bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
