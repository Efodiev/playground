"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Search, Plus, Shield, CheckCircle2, XCircle, Clock,
  TreePine, Dumbbell, Baby, ChevronDown, Upload, Camera,
  Navigation, Star, AlertTriangle, Eye, Trash2, Check,
  BarChart3, Users, Map, List, X, Menu,
  Filter, Heart, Sun, Info, Phone, Mail,
  ImagePlus, GripVertical, Crosshair
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// ==================== TYPES ====================
type ViewTab = "home" | "registry" | "add" | "admin";

interface Playground {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
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

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  kids: number;
  sports: number;
  both: number;
}

// ==================== CONSTANTS ====================
const CONDITION_MAP: Record<string, { label: string; color: string; bg: string }> = {
  excellent: { label: "Идеально", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  good: { label: "Хорошее", color: "text-primary", bg: "bg-pistachio-bg border-pistachio/30" },
  needs_repair: { label: "Требует ремонта", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  dangerous: { label: "Опасно", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const TYPE_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
  kids: { label: "Детская", icon: <Baby className="w-4 h-4" /> },
  sports: { label: "Спортивная", icon: <Dumbbell className="w-4 h-4" /> },
  both: { label: "Комбинированная", icon: <TreePine className="w-4 h-4" /> },
};

// All cities and villages of Transnistria
const CITIES = [
  "Все города",
  // Города
  "Тирасполь", "Бендеры", "Рыбница", "Дубоссары", "Слободзея",
  "Григориополь", "Каменка", "Красные Окны",
  // Посёлки городского типа
  "Колбасна", "Маяк", "Солнечное",
  // Сёла и деревни — Тираспольский район
  "Ближний Хутор", "Воронково", "Глиное", "Градешты", "Делен", "Дойбаны-1",
  "Дойбаны-2", "Каменка", "Карагаш", "Кошница", "Красногорка", "Кременчуг",
  "Мереноши", "Молокиш", "Новая Андрияшевка", "Обрезка", "Парканы",
  "Писаревка", "Победа", "Погребя", "Прибужское", "Приднестровск",
  "Протягайловка", "Ревяка", "Суклея", "Терновка", "Тираспольский",
  "Токмазея", "Федосьевка", "Христовая", "Шипка",
  // Сёла — Бендерский район
  "Варница", "Гиска", "Липканы", "Новые Кицканы", "Протягайловка",
  "Садовое", "Советское", "Спея", "Чишмиксия",
  // Сёла — Слободзейский район
  "Бессарабка", "Великое", "Гавановка", "Зезуляновка", "Карагаш",
  "Коротное", "Красное", "Нейловка", "Новый Гымалептя", "Окница",
  "Парканы", "Первомайск", "Подгорное", "Раздельная", "Рашково",
  "Слободзея-Молдаваняска", "Старая Слободзея", "Фрунзе", "Хаджимус",
  "Чобручи", "Широкое",
  // Сёла — Григориопольский район
  "Бутор", "Виноградарная", "Войково", "Гояны", "Григориополь",
  "Деляки", "Дубовая", "Карманово", "Колосово", "Красная Горка",
  "Красноармейское", "Лозовое", "Малаешты", "Мерешены", "Михайловка",
  "Новоселовка", "Парканы", "Площадь", "Победа", "Прибужное",
  "Таирск", "Тейское", "Тираспольское", "Труд", "Шипка",
  // Сёла — Дубоссарский район
  "Александровка", "Балашешты", "Ведуштя", "Гояны", "Дойбаны",
  "Дубово", "Калиновка", "Коржево", "Кошница", "Лунга", "Михайловка",
  "Новая Кашня", "Новокомиссаровка", "Окница", "Писаревка", "Погребя",
  "Роги", "Рыбницкое", "Сахарна", "Ульма", "Цибулевка", "Ягорлык",
  // Сёла — Рыбницкий район
  "Белочи", "Борщаны", "Бутучаны", "Грушка", "Заборены", "Ивановка",
  "Кишчены", "Красноенинск", "Ленск", "Михайловка", "Молодово",
  "Новая Жизнь", "Попенки", "Проданешты", "Сабова", "Стурдзешты",
  "Сухая Рыбница", "Топалы", "Хлоподыя", "Шираковка",
  // Сёла — Каменский район
  "Александровка", "Боданы", "Верхнее", "Грушка", "Гыртоп",
  "Катовка", "Крупское", "Молодово", "Окница", "Подойма",
  "Подоймица", "Ротарий", "Севериновка", "Слобода-Рашково",
  "Сухая", "Тымково", "Хрустовая", "Черепаш", "Шереметьевка",
];

const EQUIPMENT_OPTIONS = {
  entertainment: { label: "Развлечения", items: ["Горки", "Качели", "Песочница", "Карусель", "Качалки", "Игровой домик", "Лабиринт", "Канатная сетка", "Батут", "Горка-туннель", "Сенсорные панели"] },
  sport: { label: "Спорт", items: ["Турники", "Брусья", "Баскетбольное кольцо", "Мини-футбол", "Волейбол", "Шведская стенка", "Кольца", "Скамья для пресса", "Беговая дорожка"] },
  comfort: { label: "Удобства", items: ["Лавочки", "Освещение", "Резиновое покрытие", "Ограждение", "Раздевалка", "Скамейки", "Урны", "Теневой навес", "Питьевая вода"] },
  safety: { label: "Безопасность", items: ["Резиновое покрытие", "Ограждение", "Инклюзивные качели", "Мягкие углы", "Возрастные зоны", "Знаки безопасности"] },
};

// Rating calculation weights
const CONDITION_SCORES: Record<string, number> = {
  excellent: 40,
  good: 28,
  needs_repair: 12,
  dangerous: 0,
};

const EQUIPMENT_SCORE_PER_ITEM = 4; // max ~15 items = 60 points max
const MAX_EQUIPMENT_SCORE = 60;

function calculateRating(condition: string, equipment: string[]): number {
  const conditionScore = CONDITION_SCORES[condition] || 0;
  const equipScore = Math.min(equipment.length * EQUIPMENT_SCORE_PER_ITEM, MAX_EQUIPMENT_SCORE);
  return Math.min(conditionScore + equipScore, 100);
}

function getRatingLabel(rating: number): { label: string; color: string } {
  if (rating >= 80) return { label: "Отлично", color: "text-emerald-600" };
  if (rating >= 60) return { label: "Хорошо", color: "text-primary" };
  if (rating >= 35) return { label: "Средне", color: "text-amber-600" };
  if (rating >= 15) return { label: "Ниже среднего", color: "text-orange-600" };
  return { label: "Плохо", color: "text-red-600" };
}

function RatingBar({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const info = getRatingLabel(rating);
  const barHeight = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  const barBg = rating >= 80 ? "bg-emerald-500" : rating >= 60 ? "bg-primary" : rating >= 35 ? "bg-amber-500" : rating >= 15 ? "bg-orange-500" : "bg-red-500";
  const trackBg = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${trackBg} rounded-full bg-muted overflow-hidden`}>
        <motion.div
          className={`${barHeight} ${barBg} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${rating}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {size !== "sm" && (
        <span className={`text-xs font-semibold ${info.color} shrink-0`}>
          {rating}/100
        </span>
      )}
    </div>
  );
}

// Transnistria center coordinates
const MAP_CENTER: [number, number] = [47.0, 29.5];
const MAP_ZOOM = 9;

const MAX_PHOTOS = 5;

// ==================== HELPER COMPONENTS ====================
function ConditionBadge({ condition }: { condition: string }) {
  const info = CONDITION_MAP[condition] || CONDITION_MAP.good;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${info.bg} ${info.color}`}>
      {condition === "excellent" && <CheckCircle2 className="w-3 h-3" />}
      {condition === "needs_repair" && <AlertTriangle className="w-3 h-3" />}
      {condition === "dangerous" && <XCircle className="w-3 h-3" />}
      {condition === "good" && <Star className="w-3 h-3" />}
      {info.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const info = TYPE_MAP[type] || TYPE_MAP.kids;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm border border-border/30 text-foreground">
      {info.icon}
      {info.label}
    </span>
  );
}

// ==================== MAP COMPONENT ====================
function MapComponent({
  playgrounds,
  selectedId,
  onSelect,
  interactive,
  center,
  zoom,
  height,
}: {
  playgrounds: Playground[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  interactive?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: center || MAP_CENTER,
        zoom: zoom || MAP_ZOOM,
        zoomControl: interactive !== false,
        scrollWheelZoom: interactive !== false,
        dragging: interactive !== false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const markers = L.layerGroup().addTo(map);
      markersRef.current = markers;
      mapInstanceRef.current = map;
      setLoaded(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || !markersRef.current) return;

    const updateMarkers = async () => {
      const L = await import("leaflet");
      if (!markersRef.current) return;
      markersRef.current.clearLayers();

      const pistachioIcon = L.divIcon({
        html: `<svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="#3d6922"/>
          <circle cx="16" cy="16" r="8" fill="#93c572"/>
          <circle cx="16" cy="16" r="4" fill="white"/>
        </svg>`,
        className: "custom-marker",
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      });

      const selectedIcon = L.divIcon({
        html: `<svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 32 20 32s20-17 20-32C40 8.954 31.046 0 20 0z" fill="#3d6922"/>
          <circle cx="20" cy="20" r="10" fill="#bdf199"/>
          <circle cx="20" cy="20" r="5" fill="white"/>
        </svg>`,
        className: "custom-marker",
        iconSize: [40, 52],
        iconAnchor: [20, 52],
        popupAnchor: [0, -52],
      });

      playgrounds.forEach((p) => {
        const isSelected = p.id === selectedId;
        const conditionInfo = CONDITION_MAP[p.condition] || CONDITION_MAP.good;
        const ratingInfo = getRatingLabel(p.rating);
        const marker = L.marker([p.lat, p.lng], {
          icon: isSelected ? selectedIcon : pistachioIcon,
        });

        marker.bindPopup(
          `<div style="padding:16px;min-width:240px;font-family:Inter,sans-serif;">
            <h3 style="font-size:15px;font-weight:600;margin:0 0 6px;color:#1a1b1f;">${p.name}</h3>
            <p style="font-size:13px;color:#73796b;margin:0 0 8px;display:flex;align-items:center;gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#73796b" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${p.address}, ${p.city}
            </p>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
              <span style="display:inline-block;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:${p.condition === 'excellent' ? '#ecfdf5' : p.condition === 'dangerous' ? '#fef2f2' : p.condition === 'needs_repair' ? '#fffbeb' : '#f0f7ea'};color:${p.condition === 'excellent' ? '#047857' : p.condition === 'dangerous' ? '#b91c1c' : p.condition === 'needs_repair' ? '#b45309' : '#3d6922'};border:1px solid ${p.condition === 'excellent' ? '#a7f3d0' : p.condition === 'dangerous' ? '#fecaca' : p.condition === 'needs_repair' ? '#fde68a' : '#c2c9b8'};">
                ${conditionInfo.label}
              </span>
              <span style="font-size:12px;font-weight:700;color:${ratingInfo.color === 'text-emerald-600' ? '#059669' : ratingInfo.color === 'text-primary' ? '#3d6922' : ratingInfo.color === 'text-amber-600' ? '#d97706' : '#dc2626'};">
                ${p.rating}/100 ${ratingInfo.label}
              </span>
            </div>
          </div>`,
          { closeButton: false, className: "" }
        );

        if (onSelect) {
          marker.on("click", () => onSelect(p.id));
        }

        markersRef.current!.addLayer(marker);
      });
    };

    updateMarkers();
  }, [playgrounds, selectedId, loaded, onSelect]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-3xl overflow-hidden"
      style={{ height: height || "500px" }}
    />
  );
}

// ==================== MAP PICKER COMPONENT (for Add form) ====================
function MapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const initMap = async () => {
      const L = await import("leaflet");
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const pistachioIcon = L.divIcon({
        html: `<svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.058 0 0 8.058 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.058 27.942 0 18 0z" fill="#3d6922"/>
          <circle cx="18" cy="18" r="9" fill="#93c572"/>
          <circle cx="18" cy="18" r="4" fill="white"/>
        </svg>`,
        className: "custom-marker",
        iconSize: [36, 48],
        iconAnchor: [18, 48],
      });

      const marker = L.marker([lat, lng], { icon: pistachioIcon, draggable: true }).addTo(map);
      markerRef.current = marker;
      mapInstanceRef.current = map;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });

      map.on("click", (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      // Force invalidate size after mount
      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-xl border-dashed border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Crosshair className="w-4 h-4 mr-2 text-primary" />
        {isOpen ? "Скрыть карту" : "Показать на карте"}
        {lat !== 0 && lng !== 0 && !isOpen && (
          <span className="ml-2 text-xs text-muted-foreground">
            ({lat.toFixed(4)}, {lng.toFixed(4)})
          </span>
        )}
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-2xl overflow-hidden border border-border/30 relative">
              <div ref={mapRef} className="w-full" style={{ height: "350px" }} />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg text-xs text-muted-foreground">
                Нажмите на карту или перетащите маркер
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isOpen && lat !== 0 && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary" />
          Координаты: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}

// ==================== PHOTO UPLOADER COMPONENT ====================
function PhotoUploader({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Неверный формат", description: "Пожалуйста, загрузите изображение (JPG, PNG)", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Файл слишком большой", description: "Максимальный размер — 10 МБ", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange([...photos, result].slice(0, MAX_PHOTOS));
      }
    };
    reader.readAsDataURL(file);
  }, [photos, onChange, toast]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      toast({ title: "Лимит фотографий", description: `Максимум ${MAX_PHOTOS} фотографий`, variant: "destructive" });
      return;
    }
    Array.from(files).slice(0, remaining).forEach(processFile);
  }, [photos.length, processFile, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  // Clipboard paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        handleFiles(imageFiles);
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handleFiles]);

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground/40"}`} />
        <p className="text-sm text-foreground font-medium mb-1">
          {dragOver ? "Отпустите файлы здесь" : "Перетащите фотографии сюда"}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          или нажмите, чтобы выбрать файлы • <span className="font-medium text-primary">Ctrl+V</span> для вставки
        </p>
        <Badge variant="secondary" className="text-xs">
          JPG, PNG до 10 МБ • Максимум {MAX_PHOTOS} фото
        </Badge>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-5 gap-3 mt-4">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-border/30">
              <img src={photo} alt={`Фото ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                  Главное
                </span>
              )}
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
            >
              <ImagePlus className="w-5 h-5 mb-1" />
              <span className="text-[10px]">Ещё</span>
            </button>
          )}
        </div>
      )}

      {/* Photo counter */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          {photos.length} из {MAX_PHOTOS} фотографий
        </p>
        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-destructive hover:underline"
          >
            Удалить все
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== RATING PREVIEW (for Add form) ====================
function RatingPreview({ condition, equipment }: { condition: string; equipment: string[] }) {
  const rating = calculateRating(condition, equipment);
  const info = getRatingLabel(rating);
  const condScore = CONDITION_SCORES[condition] || 0;
  const equipScore = Math.min(equipment.length * EQUIPMENT_SCORE_PER_ITEM, MAX_EQUIPMENT_SCORE);

  return (
    <div className="bg-white rounded-3xl p-6 border border-border/30 shadow-sm">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Star className="w-4 h-4 text-primary" />
        Оценка площадки
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Рейтинг рассчитывается автоматически на основе состояния и оборудования
      </p>

      {/* Rating bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-lg font-bold ${info.color}`}>{info.label}</span>
          <span className={`text-2xl font-bold ${info.color}`}>{rating}</span>
        </div>
        <RatingBar rating={rating} size="lg" />
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Состояние
          </span>
          <span className="text-sm font-semibold">{condScore}/40</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(condScore / 40) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Dumbbell className="w-3.5 h-3.5" />
            Оборудование ({equipment.length} п.)
          </span>
          <span className="text-sm font-semibold">{equipScore}/60</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(equipScore / 60) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Criteria legend */}
      <div className="mt-5 pt-4 border-t border-border/20">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Критерии оценки</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span>Идеально — 40 баллов</span>
          <span>Хорошее — 28 баллов</span>
          <span>Ремонт — 12 баллов</span>
          <span>Опасно — 0 баллов</span>
          <span className="col-span-2 mt-1">Каждое оборудование +4 балла (макс. 60)</span>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN APP COMPONENT ====================
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("home");
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [pendingPlaygrounds, setPendingPlaygrounds] = useState<Playground[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayground, setSelectedPlayground] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("Все города");
  const [filterType, setFilterType] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [detailPlayground, setDetailPlayground] = useState<Playground | null>(null);
  const { toast } = useToast();

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("Тирасполь");
  const [formLat, setFormLat] = useState(46.84);
  const [formLng, setFormLng] = useState(29.63);
  const [formType, setFormType] = useState("kids");
  const [formCondition, setFormCondition] = useState("good");
  const [formEquipment, setFormEquipment] = useState<string[]>([]);
  const [formSubmitterName, setFormSubmitterName] = useState("");
  const [formSubmitterEmail, setFormSubmitterEmail] = useState("");
  const [formPhotos, setFormPhotos] = useState<string[]>([]);

  // Computed rating
  const formRating = useMemo(() => calculateRating(formCondition, formEquipment), [formCondition, formEquipment]);

  // Fetch data
  const fetchApproved = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (filterCity !== "Все города") params.set("city", filterCity);
      if (filterType !== "all") params.set("type", filterType);
      if (filterCondition !== "all") params.set("condition", filterCondition);
      params.set("status", "approved");

      const res = await fetch(`/api/playgrounds?${params}`);
      const data = await res.json();
      setPlaygrounds(data);
    } catch (err) {
      console.error("Error fetching playgrounds:", err);
    }
  }, [searchQuery, filterCity, filterType, filterCondition]);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/playgrounds?status=pending");
      const data = await res.json();
      setPendingPlaygrounds(data);
    } catch (err) {
      console.error("Error fetching pending:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  const seedDatabase = useCallback(async () => {
    try {
      await fetch("/api/seed", { method: "POST" });
      fetchApproved();
      fetchPending();
      fetchStats();
    } catch (err) {
      console.error("Error seeding:", err);
    }
  }, [fetchApproved, fetchPending, fetchStats]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await seedDatabase();
      setLoading(false);
    };
    init();
  }, [seedDatabase]);

  useEffect(() => {
    fetchApproved();
  }, [fetchApproved]);

  useEffect(() => {
    if (isAdmin) {
      fetchPending();
      fetchStats();
    }
  }, [isAdmin, fetchPending, fetchStats]);

  // Admin login
  const handleAdminLogin = () => {
    if (adminPassword === "admin123") {
      setIsAdmin(true);
      toast({ title: "Доступ разрешён", description: "Вы вошли в панель администратора" });
    } else {
      toast({ title: "Ошибка", description: "Неверный пароль", variant: "destructive" });
    }
  };

  // Approve playground
  const handleApprove = async (id: string) => {
    try {
      await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast({ title: "Одобрено", description: "Площадка опубликована на сайте" });
      fetchPending();
      fetchApproved();
      fetchStats();
    } catch {
      toast({ title: "Ошибка", description: "Не удалось одобрить площадку", variant: "destructive" });
    }
  };

  // Reject playground
  const handleReject = async (id: string) => {
    try {
      await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast({ title: "Отклонено", description: "Заявка удалена" });
      fetchPending();
      fetchStats();
    } catch {
      toast({ title: "Ошибка", description: "Не удалось отклонить заявку", variant: "destructive" });
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/playgrounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          address: formAddress,
          city: formCity,
          lat: formLat,
          lng: formLng,
          type: formType,
          condition: formCondition,
          rating: formRating,
          photos: formPhotos,
          equipment: formEquipment,
          submitterName: formSubmitterName,
          submitterEmail: formSubmitterEmail,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast({ title: "Спасибо!", description: "Ваша заявка отправлена на модерацию" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось отправить заявку", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle equipment
  const toggleEquipment = (item: string) => {
    setFormEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Filtered playgrounds for registry
  const filteredPlaygrounds = useMemo(() => playgrounds, [playgrounds]);

  const getEquipment = (p: Playground): string[] => {
    try {
      return JSON.parse(p.equipment || "[]");
    } catch {
      return [];
    }
  };

  const getPhotos = (p: Playground): string[] => {
    try {
      return JSON.parse(p.photos || "[]");
    } catch {
      return [];
    }
  };

  // Nav items
  const navItems = [
    { id: "home" as ViewTab, label: "Карта", icon: <Map className="w-4 h-4" /> },
    { id: "registry" as ViewTab, label: "Реестр", icon: <List className="w-4 h-4" /> },
    { id: "add" as ViewTab, label: "Добавить", icon: <Plus className="w-4 h-4" /> },
    { id: "admin" as ViewTab, label: "Админ", icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ==================== NAVIGATION ==================== */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => setActiveTab("home")} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <TreePine className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                ПЛОЩАДКА
              </span>
            </button>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      activeTab === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          {/* ==================== HOME TAB ==================== */}
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {/* Hero Section */}
              <section className="relative overflow-hidden bg-gradient-to-b from-pistachio-bg via-background to-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                      <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 px-4 py-1.5 text-sm">
                        <TreePine className="w-3.5 h-3.5 mr-1.5" />
                        Природа в центре игры
                      </Badge>
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                        Гармония<span className="text-primary"> детства</span> в ритме<span className="text-primary"> природы</span>
                      </h1>
                      <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                        Находите лучшие детские и спортивные площадки Приднестровья. Интерактивная карта, рейтинги и актуальная информация.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/20" onClick={() => setActiveTab("registry")}>
                          <Navigation className="w-4 h-4 mr-2" />Начать поиск
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full px-8 text-base" onClick={() => setActiveTab("add")}>
                          <Plus className="w-4 h-4 mr-2" />Добавить площадку
                        </Button>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/30 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"><MapPin className="w-6 h-6 text-primary" /></div>
                        <p className="text-3xl font-bold text-foreground">{stats?.approved || 0}+</p>
                        <p className="text-sm text-muted-foreground mt-1">Площадок на карте</p>
                      </div>
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/30 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4"><Users className="w-6 h-6 text-amber-600" /></div>
                        <p className="text-3xl font-bold text-foreground">{stats?.kids || 0}</p>
                        <p className="text-sm text-muted-foreground mt-1">Детских зон</p>
                      </div>
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/30 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4"><Dumbbell className="w-6 h-6 text-blue-600" /></div>
                        <p className="text-3xl font-bold text-foreground">{stats?.sports || 0}</p>
                        <p className="text-sm text-muted-foreground mt-1">Спортивных зон</p>
                      </div>
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/30 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
                        <p className="text-3xl font-bold text-foreground">{CITIES.length - 1}</p>
                        <p className="text-sm text-muted-foreground mt-1">Населённых пунктов</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-pistachio/10 blur-3xl pointer-events-none" />
              </section>

              {/* Map Section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Интерактивная карта</h2>
                    <p className="text-muted-foreground mt-1">Нажмите на маркер, чтобы узнать подробности</p>
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="w-4 h-4 mr-2" />Фильтры
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </Button>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                      <div className="bg-white rounded-3xl p-6 border border-border/30 shadow-sm flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <Label className="text-xs text-muted-foreground mb-1.5">Поиск</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Город, улица, название..." className="pl-10 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                          </div>
                        </div>
                        <div className="min-w-[160px]">
                          <Label className="text-xs text-muted-foreground mb-1.5">Город</Label>
                          <select className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm" value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="min-w-[140px]">
                          <Label className="text-xs text-muted-foreground mb-1.5">Тип</Label>
                          <select className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="all">Все типы</option><option value="kids">Детские</option><option value="sports">Спортивные</option><option value="both">Комбинированные</option>
                          </select>
                        </div>
                        <div className="min-w-[160px]">
                          <Label className="text-xs text-muted-foreground mb-1.5">Состояние</Label>
                          <select className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm" value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)}>
                            <option value="all">Любое</option><option value="excellent">Идеально</option><option value="good">Хорошее</option><option value="needs_repair">Требует ремонта</option><option value="dangerous">Опасно</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="rounded-3xl overflow-hidden border border-border/30 shadow-lg">
                  <MapComponent playgrounds={filteredPlaygrounds} selectedId={selectedPlayground} onSelect={(id) => { setSelectedPlayground(id); const p = playgrounds.find((pg) => pg.id === id); if (p) setDetailPlayground(p); }} height="500px" />
                </div>

                {/* Quick cards */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Рядом с вами</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPlaygrounds.slice(0, 6).map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-3xl p-5 border border-border/30 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setDetailPlayground(p)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.type === "kids" ? "bg-pink-50 text-pink-600" : p.type === "sports" ? "bg-blue-50 text-blue-600" : "bg-primary/10 text-primary"}`}>
                              {p.type === "kids" ? <Baby className="w-5 h-5" /> : p.type === "sports" ? <Dumbbell className="w-5 h-5" /> : <TreePine className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{p.name}</h4>
                              <p className="text-xs text-muted-foreground">{p.city}</p>
                            </div>
                          </div>
                          <ConditionBadge condition={p.condition} />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2"><MapPin className="w-3 h-3 shrink-0" /><span className="line-clamp-1">{p.address}</span></p>
                        <RatingBar rating={p.rating} size="sm" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Mission */}
              <section className="bg-pistachio-bg/50 border-y border-border/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <Badge className="mb-4 bg-primary/10 text-primary border-primary/20"><Heart className="w-3 h-3 mr-1" />О проекте</Badge>
                      <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">Дизайн, вдохновленный жизнью</h2>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-8">Проект «ПЛОЩАДКА» — это не просто список адресов. Это сообщество, которое верит в важность качественных и безопасных пространств для детей и спортсменов Приднестровья.</p>
                      <div className="space-y-4">
                        {["Автоматический рейтинг на основе состояния и оборудования", "Открытые данные о каждой площадке с фотоотчётом", "Все города и сёла Приднестровья на карте"].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-primary" /></div>
                            <p className="text-sm text-foreground">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/30 text-center"><TreePine className="w-8 h-8 text-primary mx-auto mb-3" /><p className="text-2xl font-bold text-foreground">{stats?.approved || 0}</p><p className="text-xs text-muted-foreground mt-1">Площадок</p></div>
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/30 text-center mt-8"><MapPin className="w-8 h-8 text-primary mx-auto mb-3" /><p className="text-2xl font-bold text-foreground">{CITIES.length - 1}</p><p className="text-xs text-muted-foreground mt-1">Населённых пунктов</p></div>
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/30 text-center"><Users className="w-8 h-8 text-primary mx-auto mb-3" /><p className="text-2xl font-bold text-foreground">1.2k</p><p className="text-xs text-muted-foreground mt-1">Пользователей</p></div>
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/30 text-center mt-8"><Sun className="w-8 h-8 text-primary mx-auto mb-3" /><p className="text-2xl font-bold text-foreground">100%</p><p className="text-xs text-muted-foreground mt-1">Бесплатно</p></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-primary rounded-3xl p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Знаете отличную площадку?</h2>
                    <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">Помогите сообществу — добавьте площадку на карту. После проверки она появится в реестре.</p>
                    <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 shadow-xl px-8 text-base" onClick={() => setActiveTab("add")}><Plus className="w-4 h-4 mr-2" />Добавить площадку</Button>
                  </div>
                  <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                </div>
              </section>
            </motion.div>
          )}

          {/* ==================== REGISTRY TAB ==================== */}
          {activeTab === "registry" && (
            <motion.div key="registry" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Реестр площадок</h2>
                  <p className="text-muted-foreground mt-1">Все проверенные площадки Приднестровья — {filteredPlaygrounds.length} объектов</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-3.5 h-3.5 mr-1.5" />Фильтры
                </Button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                    <div className="bg-white rounded-3xl p-5 border border-border/30 shadow-sm flex flex-wrap gap-3">
                      <div className="flex-1 min-w-[180px]">
                        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Поиск..." className="pl-9 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                      </div>
                      <select className="h-10 px-3 rounded-xl border border-input bg-background text-sm" value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select className="h-10 px-3 rounded-xl border border-input bg-background text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">Все типы</option><option value="kids">Детские</option><option value="sports">Спортивные</option><option value="both">Комбинированные</option>
                      </select>
                      <select className="h-10 px-3 rounded-xl border border-input bg-background text-sm" value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)}>
                        <option value="all">Любое</option><option value="excellent">Идеально</option><option value="good">Хорошее</option><option value="needs_repair">Требует ремонта</option><option value="dangerous">Опасно</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-white rounded-3xl h-72 animate-pulse border border-border/20" />)}
                </div>
              ) : filteredPlaygrounds.length === 0 ? (
                <div className="text-center py-20"><MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-lg font-semibold text-foreground mb-2">Площадки не найдены</h3><p className="text-muted-foreground">Попробуйте изменить параметры фильтра</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {filteredPlaygrounds.map((p, i) => {
                    const isLarge = i === 0;
                    const isWide = i % 5 === 2;
                    const photos = getPhotos(p);
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className={`group bg-white rounded-3xl overflow-hidden border border-border/30 shadow-sm hover:shadow-lg transition-all cursor-pointer ${isLarge ? "md:col-span-8" : isWide ? "md:col-span-8" : "md:col-span-4"}`}
                        onClick={() => setDetailPlayground(p)}>
                        <div className={`relative ${isLarge ? "h-64" : isWide ? "h-48" : "h-44"} bg-gradient-to-br from-pistachio-bg to-muted overflow-hidden`}>
                          {photos.length > 0 ? (
                            <img src={photos[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                                {p.type === "kids" ? <Baby className="w-10 h-10 text-pink-500" /> : p.type === "sports" ? <Dumbbell className="w-10 h-10 text-blue-500" /> : <TreePine className="w-10 h-10 text-primary" />}
                              </div>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 flex gap-2"><ConditionBadge condition={p.condition} /><TypeBadge type={p.type} /></div>
                          {photos.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <Camera className="w-3 h-3" />{photos.length}
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">{p.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="line-clamp-1">{p.address}, {p.city}</span></p>
                          <RatingBar rating={p.rating} size="sm" />
                          {getEquipment(p).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {getEquipment(p).slice(0, 3).map((eq, j) => <span key={j} className="px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">{eq}</span>)}
                              {getEquipment(p).length > 3 && <span className="px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">+{getEquipment(p).length - 3}</span>}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ==================== ADD PLAYGROUND TAB ==================== */}
          {activeTab === "add" && (
            <motion.div key="add" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {!submitted ? (
                <>
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-foreground mb-2">Добавить новую площадку</h2>
                    <p className="text-muted-foreground">Помогите сообществу найти лучшие места для игр, заполнив форму ниже.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Photo Upload */}
                    <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-border/30 shadow-sm">
                      <div className="flex items-center gap-2 mb-5">
                        <Camera className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Загрузите фото</h3>
                        <Badge variant="secondary" className="ml-auto text-xs">{formPhotos.length}/{MAX_PHOTOS}</Badge>
                      </div>
                      <PhotoUploader photos={formPhotos} onChange={setFormPhotos} />
                    </div>

                    {/* Right column: Info + Map + Rating */}
                    <div className="md:col-span-5 flex flex-col gap-6">
                      {/* Basic Info */}
                      <div className="bg-white rounded-3xl p-6 border border-border/30 shadow-sm space-y-4">
                        <div>
                          <Label className="text-sm font-medium mb-1.5">Название площадки *</Label>
                          <Input placeholder="Напр. Парк Горького — Южная" className="rounded-xl" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1.5">Тип площадки</Label>
                          <div className="flex gap-2">
                            {[
                              { value: "kids", label: "Детская", icon: <Baby className="w-3.5 h-3.5" /> },
                              { value: "sports", label: "Спортивная", icon: <Dumbbell className="w-3.5 h-3.5" /> },
                              { value: "both", label: "Обе", icon: <TreePine className="w-3.5 h-3.5" /> },
                            ].map((opt) => (
                              <button key={opt.value} type="button" onClick={() => setFormType(opt.value)}
                                className={`flex-1 py-2.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${formType === opt.value ? "bg-primary text-primary-foreground shadow-sm" : "border border-border text-muted-foreground hover:border-primary/50"}`}>
                                {opt.icon}{opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1.5">Состояние</Label>
                          <div className="flex gap-2">
                            {[
                              { value: "excellent", label: "Идеально" },
                              { value: "good", label: "Хорошее" },
                              { value: "needs_repair", label: "Ремонт" },
                              { value: "dangerous", label: "Опасно" },
                            ].map((opt) => (
                              <button key={opt.value} type="button" onClick={() => setFormCondition(opt.value)}
                                className={`flex-1 py-2.5 rounded-full text-xs font-medium transition-all ${formCondition === opt.value ? "bg-primary text-primary-foreground shadow-sm" : "border border-border text-muted-foreground hover:border-primary/50"}`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="bg-white rounded-3xl p-6 border border-border/30 shadow-sm">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />Местоположение
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Адрес</Label>
                            <Input placeholder="ул. Парковая, д. 12" className="rounded-xl" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} required />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Город / Село</Label>
                            <select className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm" value={formCity} onChange={(e) => setFormCity(e.target.value)}>
                              {CITIES.filter((c) => c !== "Все города").map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <MapPicker lat={formLat} lng={formLng} onChange={(lat, lng) => { setFormLat(lat); setFormLng(lng); }} />
                        </div>
                      </div>

                      {/* Rating Preview */}
                      <RatingPreview condition={formCondition} equipment={formEquipment} />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-12 bg-white rounded-3xl p-6 border border-border/30 shadow-sm">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-primary" />Описание</h3>
                      <Textarea placeholder="Расскажите об этой площадке: что есть, для кого подходит, в каком состоянии..." className="rounded-xl min-h-[100px]" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                    </div>

                    {/* Equipment */}
                    <div className="md:col-span-12 bg-white rounded-3xl p-6 border border-border/30 shadow-sm">
                      <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-primary" />Оборудование и особенности
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(EQUIPMENT_OPTIONS).map(([key, category]) => (
                          <div key={key}>
                            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{category.label}</h4>
                            <div className="space-y-2">
                              {category.items.map((item) => (
                                <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
                                  <button type="button" onClick={() => toggleEquipment(item)}
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formEquipment.includes(item) ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
                                    {formEquipment.includes(item) && <Check className="w-3 h-3 text-primary-foreground" />}
                                  </button>
                                  <span className={`text-sm ${formEquipment.includes(item) ? "text-foreground" : "text-muted-foreground"} group-hover:text-foreground transition-colors`}>{item}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submitter info */}
                    <div className="md:col-span-12 bg-white rounded-3xl p-6 border border-border/30 shadow-sm">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />Контактная информация (необязательно)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><Label className="text-sm font-medium mb-1.5">Ваше имя</Label><Input placeholder="Иван Иванов" className="rounded-xl" value={formSubmitterName} onChange={(e) => setFormSubmitterName(e.target.value)} /></div>
                        <div><Label className="text-sm font-medium mb-1.5">Email</Label><Input type="email" placeholder="ivan@example.com" className="rounded-xl" value={formSubmitterEmail} onChange={(e) => setFormSubmitterEmail(e.target.value)} /></div>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-12 flex justify-end items-center gap-4 mt-2">
                      <Button type="button" variant="ghost" onClick={() => setActiveTab("home")}>Отмена</Button>
                      <Button type="submit" size="lg" className="rounded-full px-10 shadow-lg shadow-primary/20" disabled={submitting || !formName || !formAddress}>
                        {submitting ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Отправка...</span> : <><Plus className="w-4 h-4 mr-2" />Добавить площадку</>}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-primary" /></div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">Спасибо!</h2>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">Ваша заявка отправлена на модерацию. После проверки площадка появится на карте и в реестре.</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="rounded-full px-6" onClick={() => {
                      setSubmitted(false); setFormName(""); setFormDescription(""); setFormAddress(""); setFormCity("Тирасполь");
                      setFormLat(46.84); setFormLng(29.63); setFormType("kids"); setFormCondition("good"); setFormEquipment([]);
                      setFormSubmitterName(""); setFormSubmitterEmail(""); setFormPhotos([]);
                    }}>Добавить ещё</Button>
                    <Button className="rounded-full px-6" onClick={() => setActiveTab("home")}>На главную</Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ==================== ADMIN TAB ==================== */}
          {activeTab === "admin" && (
            <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {!isAdmin ? (
                <div className="max-w-md mx-auto text-center py-20">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6"><Shield className="w-10 h-10 text-primary" /></div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Панель администратора</h2>
                  <p className="text-muted-foreground mb-8">Введите пароль для доступа к модерации</p>
                  <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }} className="space-y-4">
                    <Input type="password" placeholder="Пароль администратора" className="rounded-xl text-center" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                    <Button type="submit" className="w-full rounded-full">Войти</Button>
                    <p className="text-xs text-muted-foreground">Подсказка: пароль — admin123</p>
                  </form>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <div><h2 className="text-3xl font-bold text-foreground">Панель администратора</h2><p className="text-muted-foreground mt-1">Модерация и статистика</p></div>
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setIsAdmin(false); setAdminPassword(""); }}><X className="w-3.5 h-3.5 mr-1.5" />Выйти</Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Всего площадок", value: stats?.total || 0, icon: <MapPin className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
                        { label: "Одобрено", value: stats?.approved || 0, icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-emerald-50 text-emerald-600" },
                        { label: "В очереди", value: stats?.pending || 0, icon: <Clock className="w-5 h-5" />, color: "bg-amber-50 text-amber-600" },
                        { label: "Отклонено", value: stats?.rejected || 0, icon: <XCircle className="w-5 h-5" />, color: "bg-red-50 text-red-600" },
                      ].map((stat, i) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-3xl p-5 border border-border/30 shadow-sm">
                          <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>{stat.icon}</div>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Type breakdown */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-5 h-5 text-primary" /><h3 className="font-semibold text-foreground">Распределение по типам</h3></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-3xl p-5 border border-border/30 text-center"><Baby className="w-6 h-6 text-pink-500 mx-auto mb-2" /><p className="text-xl font-bold">{stats?.kids || 0}</p><p className="text-xs text-muted-foreground">Детские</p></div>
                      <div className="bg-white rounded-3xl p-5 border border-border/30 text-center"><Dumbbell className="w-6 h-6 text-blue-500 mx-auto mb-2" /><p className="text-xl font-bold">{stats?.sports || 0}</p><p className="text-xs text-muted-foreground">Спортивные</p></div>
                      <div className="bg-white rounded-3xl p-5 border border-border/30 text-center"><TreePine className="w-6 h-6 text-primary mx-auto mb-2" /><p className="text-xl font-bold">{stats?.both || 0}</p><p className="text-xs text-muted-foreground">Комбинированные</p></div>
                    </div>
                  </div>

                  {/* Pending */}
                  <div>
                    <div className="flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-foreground">Новые заявки ({pendingPlaygrounds.length})</h3></div>
                    {pendingPlaygrounds.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-3xl border border-border/30"><CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" /><h4 className="text-lg font-semibold text-foreground mb-2">Всё чисто!</h4><p className="text-muted-foreground">Нет заявок, ожидающих модерации</p></div>
                    ) : (
                      <div className="space-y-4">
                        {pendingPlaygrounds.map((p, i) => (
                          <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-3xl p-6 border border-amber-200/50 shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-6">
                              <div className="w-full sm:w-40 h-32 bg-gradient-to-br from-amber-50 to-pistachio-bg rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                                {getPhotos(p).length > 0 ? <img src={getPhotos(p)[0]} alt={p.name} className="w-full h-full object-cover" /> :
                                  p.type === "kids" ? <Baby className="w-10 h-10 text-pink-400" /> : p.type === "sports" ? <Dumbbell className="w-10 h-10 text-blue-400" /> : <TreePine className="w-10 h-10 text-primary" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div><h4 className="font-semibold text-foreground">{p.name}</h4><p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5" />{p.address}, {p.city}</p></div>
                                  <ConditionBadge condition={p.condition} />
                                </div>
                                {p.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{p.description}</p>}
                                <div className="flex flex-wrap gap-1.5 mb-3"><TypeBadge type={p.type} /><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">{p.rating}/100 — {getRatingLabel(p.rating).label}</span></div>
                                {p.submitterName && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />От: {p.submitterName} {p.submitterEmail && `(${p.submitterEmail})`}</p>}
                              </div>
                              <div className="flex sm:flex-col gap-2 shrink-0">
                                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none" onClick={() => handleApprove(p.id)}><Check className="w-4 h-4 mr-1.5" />Одобрить</Button>
                                <Button variant="destructive" className="rounded-xl flex-1 sm:flex-none" onClick={() => handleReject(p.id)}><Trash2 className="w-4 h-4 mr-1.5" />Отклонить</Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* All approved table */}
                  <div className="mt-12">
                    <div className="flex items-center gap-2 mb-4"><List className="w-5 h-5 text-primary" /><h3 className="font-semibold text-foreground">Все одобренные площадки ({playgrounds.length})</h3></div>
                    <div className="bg-white rounded-3xl border border-border/30 overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Название</th>
                              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Город</th>
                              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Рейтинг</th>
                              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase">Состояние</th>
                              <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase">Действия</th>
                            </tr>
                          </thead>
                          <tbody>
                            {playgrounds.map((p) => (
                              <tr key={p.id} className="border-t border-border/20 hover:bg-muted/30 transition-colors">
                                <td className="p-4"><p className="font-medium text-sm text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.address}</p></td>
                                <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{p.city}</td>
                                <td className="p-4 hidden md:table-cell"><span className={`text-sm font-bold ${getRatingLabel(p.rating).color}`}>{p.rating}</span></td>
                                <td className="p-4"><ConditionBadge condition={p.condition} /></td>
                                <td className="p-4 text-right">
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={async () => {
                                    await fetch(`/api/playgrounds/${p.id}`, { method: "DELETE" }); fetchApproved(); fetchStats(); toast({ title: "Удалено", description: "Площадка удалена" });
                                  }}><Trash2 className="w-4 h-4" /></Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ==================== DETAIL MODAL ==================== */}
      <AnimatePresence>
        {detailPlayground && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetailPlayground(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-background rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Header image */}
              <div className="h-48 bg-gradient-to-br from-pistachio-bg to-muted relative overflow-hidden">
                {getPhotos(detailPlayground).length > 0 ? (
                  <img src={getPhotos(detailPlayground)[0]} alt={detailPlayground.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-3xl bg-white/80 backdrop-blur flex items-center justify-center">
                      {detailPlayground.type === "kids" ? <Baby className="w-12 h-12 text-pink-500" /> : detailPlayground.type === "sports" ? <Dumbbell className="w-12 h-12 text-blue-500" /> : <TreePine className="w-12 h-12 text-primary" />}
                    </div>
                  </div>
                )}
                <button onClick={() => setDetailPlayground(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"><X className="w-5 h-5" /></button>
                <div className="absolute top-4 left-4 flex gap-2"><ConditionBadge condition={detailPlayground.condition} /><TypeBadge type={detailPlayground.type} /></div>
              </div>
              {/* Photo gallery thumbnails */}
              {getPhotos(detailPlayground).length > 1 && (
                <div className="px-6 -mt-6 relative z-10">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {getPhotos(detailPlayground).map((photo, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                        <img src={photo} alt={`Фото ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">{detailPlayground.name}</h2>
                  <span className={`text-lg font-bold shrink-0 ${getRatingLabel(detailPlayground.rating).color}`}>{detailPlayground.rating}/100</span>
                </div>
                <RatingBar rating={detailPlayground.rating} size="md" />
                <p className="text-muted-foreground flex items-center gap-1.5 mt-3 mb-4"><MapPin className="w-4 h-4 shrink-0" />{detailPlayground.address}, {detailPlayground.city}</p>

                {detailPlayground.description && <p className="text-foreground/80 mb-6 leading-relaxed">{detailPlayground.description}</p>}

                {getEquipment(detailPlayground).length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3">Оборудование</h3>
                    <div className="flex flex-wrap gap-2">{getEquipment(detailPlayground).map((eq, i) => <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">{eq}</span>)}</div>
                  </div>
                )}

                <div className="rounded-2xl overflow-hidden border border-border/30">
                  <MapComponent playgrounds={[detailPlayground]} center={[detailPlayground.lat, detailPlayground.lng]} zoom={15} height="200px" />
                </div>
                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5"><Clock className="w-3 h-3" />Добавлено {new Date(detailPlayground.createdAt).toLocaleDateString("ru-RU")}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-muted/30 border-t border-border/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><TreePine className="w-4 h-4 text-primary-foreground" /></div>
              <span className="font-bold text-lg text-foreground">ПЛОЩАДКА</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">© 2024 ПЛОЩАДКА. Мониторинг детских и спортивных площадок Приднестровья.</p>
            <div className="flex gap-6">
              <button onClick={() => setActiveTab("home")} className="text-sm text-muted-foreground hover:text-primary transition-colors">Карта</button>
              <button onClick={() => setActiveTab("registry")} className="text-sm text-muted-foreground hover:text-primary transition-colors">Реестр</button>
              <button onClick={() => setActiveTab("add")} className="text-sm text-muted-foreground hover:text-primary transition-colors">Добавить</button>
            </div>
          </div>
        </div>
      </footer>

      {/* FAB */}
      {activeTab !== "add" && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform" onClick={() => setActiveTab("add")}>
          <Plus className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}
