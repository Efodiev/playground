"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import type L from "leaflet";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  Share2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Baby,
  Dumbbell,
  TreePine,
  Shield,
  Sun,
  Layers,
  Circle,
  Square,
  Sofa,
  Clock,
  User,
  Mail,
  ExternalLink,
  Edit3,
  Zap,
  Wrench,
  Flame,
  Waves,
  Wind,
  Palette,
  Music,
  Gamepad2,
  Accessibility,
  Lock,
  Eye,
  Siren,
  Flag,
  Tent,
  ShowerHead,
  Trash2,
  Coffee,
  Armchair,
  Lamp,
  Fence,
  Grass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface PlaygroundDetailProps {
  playground: Playground;
  onBack: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
}

// ==================== CONSTANTS ====================
const CONDITION_MAP: Record<string, { label: string; color: string; bg: string }> = {
  excellent: { label: "Идеально", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  good: { label: "Хорошее", color: "text-primary", bg: "bg-pistachio-bg border-pistachio/30" },
  needs_repair: { label: "Требует ремонта", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  dangerous: { label: "Опасно", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const TYPE_MAP: Record<string, { label: string }> = {
  kids: { label: "Детская" },
  sports: { label: "Спортивная" },
  both: { label: "Комбинированная" },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  kids: <Baby className="w-4 h-4" />,
  sports: <Dumbbell className="w-4 h-4" />,
  both: <TreePine className="w-4 h-4" />,
};

// Equipment icon mapping
const EQUIPMENT_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  "Горки": { icon: <Zap className="w-4 h-4" />, color: "bg-orange-100 text-orange-600" },
  "Качели": { icon: <Wind className="w-4 h-4" />, color: "bg-sky-100 text-sky-600" },
  "Песочница": { icon: <Square className="w-4 h-4" />, color: "bg-amber-100 text-amber-700" },
  "Карусель": { icon: <Waves className="w-4 h-4" />, color: "bg-violet-100 text-violet-600" },
  "Качалки": { icon: <Waves className="w-4 h-4" />, color: "bg-teal-100 text-teal-600" },
  "Игровой домик": { icon: <TreePine className="w-4 h-4" />, color: "bg-emerald-100 text-emerald-600" },
  "Лабиринт": { icon: <Gamepad2 className="w-4 h-4" />, color: "bg-purple-100 text-purple-600" },
  "Канатная сетка": { icon: <Layers className="w-4 h-4" />, color: "bg-slate-100 text-slate-600" },
  "Батут": { icon: <Flame className="w-4 h-4" />, color: "bg-rose-100 text-rose-600" },
  "Горка-туннель": { icon: <Zap className="w-4 h-4" />, color: "bg-orange-100 text-orange-600" },
  "Сенсорные панели": { icon: <Palette className="w-4 h-4" />, color: "bg-fuchsia-100 text-fuchsia-600" },
  "Турники": { icon: <Dumbbell className="w-4 h-4" />, color: "bg-blue-100 text-blue-600" },
  "Брусья": { icon: <Dumbbell className="w-4 h-4" />, color: "bg-indigo-100 text-indigo-600" },
  "Баскетбольное кольцо": { icon: <Circle className="w-4 h-4" />, color: "bg-orange-100 text-orange-700" },
  "Мини-футбол": { icon: <Circle className="w-4 h-4" />, color: "bg-green-100 text-green-600" },
  "Волейбол": { icon: <Circle className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-600" },
  "Шведская стенка": { icon: <Layers className="w-4 h-4" />, color: "bg-cyan-100 text-cyan-600" },
  "Кольца": { icon: <Circle className="w-4 h-4" />, color: "bg-gray-100 text-gray-600" },
  "Скамья для пресса": { icon: <Sofa className="w-4 h-4" />, color: "bg-lime-100 text-lime-600" },
  "Беговая дорожка": { icon: <Flame className="w-4 h-4" />, color: "bg-red-100 text-red-600" },
  "Лавочки": { icon: <Sofa className="w-4 h-4" />, color: "bg-amber-100 text-amber-600" },
  "Скамейки": { icon: <Armchair className="w-4 h-4" />, color: "bg-amber-100 text-amber-600" },
  "Освещение": { icon: <Sun className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-600" },
  "Резиновое покрытие": { icon: <Layers className="w-4 h-4" />, color: "bg-emerald-100 text-emerald-600" },
  "Ограждение": { icon: <Shield className="w-4 h-4" />, color: "bg-slate-100 text-slate-600" },
  "Раздевалка": { icon: <Lock className="w-4 h-4" />, color: "bg-blue-100 text-blue-600" },
  "Урны": { icon: <Trash2 className="w-4 h-4" />, color: "bg-gray-100 text-gray-600" },
  "Теневой навес": { icon: <Tent className="w-4 h-4" />, color: "bg-teal-100 text-teal-600" },
  "Питьевая вода": { icon: <Coffee className="w-4 h-4" />, color: "bg-cyan-100 text-cyan-600" },
  "Инклюзивные качели": { icon: <Accessibility className="w-4 h-4" />, color: "bg-violet-100 text-violet-600" },
  "Мягкие углы": { icon: <Shield className="w-4 h-4" />, color: "bg-pink-100 text-pink-600" },
  "Возрастные зоны": { icon: <Baby className="w-4 h-4" />, color: "bg-pink-100 text-pink-600" },
  "Знаки безопасности": { icon: <Siren className="w-4 h-4" />, color: "bg-red-100 text-red-600" },
};

const DEFAULT_EQUIPMENT_ICON = { icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-primary/10 text-primary" };

// Feature icons for the "Описание площадки" section
const FEATURE_ICONS = [
  { key: "kids", label: "Детская", icon: <Baby className="w-5 h-5" />, color: "bg-pink-100 text-pink-600" },
  { key: "sports", label: "Спортивная", icon: <Dumbbell className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
  { key: "both", label: "Комбинированная", icon: <TreePine className="w-5 h-5" />, color: "bg-emerald-100 text-emerald-600" },
  { key: "security", label: "Безопасность", icon: <Shield className="w-5 h-5" />, color: "bg-slate-100 text-slate-600" },
];

// ==================== HELPERS ====================
function getPhotos(p: Playground): string[] {
  try {
    return JSON.parse(p.photos || "[]");
  } catch {
    return [];
  }
}

function getEquipment(p: Playground): string[] {
  try {
    return JSON.parse(p.equipment || "[]");
  } catch {
    return [];
  }
}

function ratingToStars(rating: number): number {
  if (rating >= 80) return 5;
  if (rating >= 60) return 4;
  if (rating >= 35) return 3;
  if (rating >= 15) return 2;
  return 1;
}

function getRatingLabel(rating: number): { label: string; color: string } {
  if (rating >= 80) return { label: "Отлично", color: "text-emerald-600" };
  if (rating >= 60) return { label: "Хорошо", color: "text-primary" };
  if (rating >= 35) return { label: "Средне", color: "text-amber-600" };
  if (rating >= 15) return { label: "Ниже среднего", color: "text-orange-600" };
  return { label: "Плохо", color: "text-red-600" };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ==================== MINI MAP COMPONENT ====================
function MiniMap({ lat, lng, address }: { lat: number; lng: number; address: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        touchZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const pistachioIcon = L.divIcon({
        html: `<svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="#3d6922"/>
          <circle cx="16" cy="16" r="8" fill="#93c572"/>
          <circle cx="16" cy="16" r="4" fill="white"/>
        </svg>`,
        className: "custom-marker",
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      });

      L.marker([lat, lng], { icon: pistachioIcon }).addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng]);

  const openMaps = () => {
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`, "_blank");
  };

  return (
    <div>
      <div
        ref={mapRef}
        className="w-full rounded-lg overflow-hidden"
        style={{ height: "280px" }}
      />
      <p className="text-sm text-muted-foreground mt-3 flex items-start gap-1.5">
        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
        {address}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full rounded-lg border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
        onClick={openMaps}
      >
        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
        Открыть карту
      </Button>
    </div>
  );
}

// ==================== STAR RATING COMPONENT ====================
function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const stars = ratingToStars(rating);
  const iconSize = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < stars
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

// ==================== REVIEW MOCK DATA ====================
const MOCK_REVIEWS = [
  {
    id: "1",
    name: "Анна К.",
    initials: "АК",
    date: "15 февраля 2025",
    stars: 5,
    text: "Отличная площадка! Дети в восторге от горок и качелей. Безопасное покрытие и ограждение — можно не волноваться.",
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: "2",
    name: "Дмитрий В.",
    initials: "ДВ",
    date: "3 января 2025",
    stars: 4,
    text: "Хорошая площадка с разнообразным оборудованием. Хотелось бы больше лавочек для родителей и улучшенное освещение вечером.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "3",
    name: "Елена М.",
    initials: "ЕМ",
    date: "28 декабря 2024",
    stars: 4,
    text: "Удобное расположение, чисто и ухоженно. Спортивная зона отлично подходит для подростков. Рекомендую!",
    color: "bg-emerald-100 text-emerald-700",
  },
];

// ==================== MAIN COMPONENT ====================
export default function PlaygroundDetail({ playground, onBack, isAdmin, onEdit }: PlaygroundDetailProps) {
  const [liked, setLiked] = useState(false);
  const photos = useMemo(() => getPhotos(playground), [playground]);
  const equipment = useMemo(() => getEquipment(playground), [playground]);
  const ratingInfo = useMemo(() => getRatingLabel(playground.rating), [playground.rating]);
  const conditionInfo = CONDITION_MAP[playground.condition] || CONDITION_MAP.good;
  const typeInfo = TYPE_MAP[playground.type] || TYPE_MAP.kids;
  const extraPhotosCount = Math.max(0, photos.length - 3);

  // Placeholder photos if none exist
  const displayPhotos = useMemo(() => {
    if (photos.length > 0) return photos;
    // Generate placeholder
    return [
      `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" fill="none">
          <rect width="800" height="500" fill="#f0f7ea"/>
          <circle cx="400" cy="220" r="80" fill="#93C572" opacity="0.3"/>
          <path d="M360 220 L400 160 L440 220Z" fill="#3d6922" opacity="0.2"/>
          <text x="400" y="340" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#73796b">Фото площадки</text>
        </svg>`
      )}`,
    ];
  }, [photos]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: playground.name,
          text: `Площадка: ${playground.name} — ${playground.address}, ${playground.city}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  // Get feature categories based on playground type and equipment
  const features = useMemo(() => {
    const result: { icon: React.ReactNode; label: string; color: string }[] = [];
    
    // Add type feature
    const typeFeature = FEATURE_ICONS.find((f) => f.key === playground.type);
    if (typeFeature) {
      result.push({ icon: typeFeature.icon, label: typeFeature.label, color: typeFeature.color });
    }
    
    // Add age group based on type
    if (playground.type === "kids" || playground.type === "both") {
      result.push({
        icon: <Baby className="w-5 h-5" />,
        label: "Для детей 3-12 лет",
        color: "bg-pink-100 text-pink-600",
      });
    }
    if (playground.type === "sports" || playground.type === "both") {
      result.push({
        icon: <Dumbbell className="w-5 h-5" />,
        label: "Спортивная зона",
        color: "bg-blue-100 text-blue-600",
      });
    }
    
    // Add safety features
    if (equipment.some((e) => ["Резиновое покрытие", "Ограждение", "Мягкие углы", "Знаки безопасности"].includes(e))) {
      result.push({
        icon: <Shield className="w-5 h-5" />,
        label: "Безопасная среда",
        color: "bg-emerald-100 text-emerald-600",
      });
    }
    
    // Add inclusivity
    if (equipment.some((e) => ["Инклюзивные качели", "Возрастные зоны"].includes(e))) {
      result.push({
        icon: <Accessibility className="w-5 h-5" />,
        label: "Инклюзивная",
        color: "bg-violet-100 text-violet-600",
      });
    }
    
    // Add comfort
    if (equipment.some((e) => ["Лавочки", "Скамейки", "Теневой навес", "Питьевая вода"].includes(e))) {
      result.push({
        icon: <Sofa className="w-5 h-5" />,
        label: "Комфорт для родителей",
        color: "bg-amber-100 text-amber-600",
      });
    }

    // Ensure at least 3 features
    if (result.length < 3) {
      result.push({
        icon: <Sun className="w-5 h-5" />,
        label: "Открытая площадка",
        color: "bg-yellow-100 text-yellow-600",
      });
    }
    
    return result;
  }, [playground.type, equipment]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* ==================== BACK BUTTON ==================== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-border/20"
        >
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="rounded-full hover:bg-primary/5 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            {isAdmin && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="rounded-full border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Редактировать
              </Button>
            )}
          </div>
        </motion.div>

        {/* ==================== 1. HERO GALLERY BENTO ==================== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 h-auto sm:h-[500px]">
            {/* Main large photo - 8 cols */}
            <div className="sm:col-span-8 relative rounded-lg overflow-hidden group h-64 sm:h-full">
              <img
                src={displayPhotos[0]}
                alt={playground.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Badges overlay */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 backdrop-blur border border-white/20 ${conditionInfo.color}`}
                >
                  {playground.condition === "excellent" && <CheckCircle2 className="w-3 h-3" />}
                  {playground.condition === "needs_repair" && <AlertTriangle className="w-3 h-3" />}
                  {playground.condition === "dangerous" && <XCircle className="w-3 h-3" />}
                  {playground.condition === "good" && <Star className="w-3 h-3" />}
                  {conditionInfo.label}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 backdrop-blur border border-white/20 text-foreground">
                  {TYPE_ICONS[playground.type] || TYPE_ICONS.kids}
                  {typeInfo.label}
                </span>
              </div>
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Right column - 4 cols, 2 smaller photos stacked */}
            <div className="sm:col-span-4 grid grid-cols-2 sm:grid-cols-1 gap-3 h-64 sm:h-full">
              {/* Photo 2 */}
              <div className="relative rounded-lg overflow-hidden group">
                <img
                  src={displayPhotos[1] || displayPhotos[0]}
                  alt={`${playground.name} — фото 2`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* Photo 3 with "+N" overlay */}
              <div className="relative rounded-lg overflow-hidden group">
                <img
                  src={displayPhotos[2] || displayPhotos[0]}
                  alt={`${playground.name} — фото 3`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {extraPhotosCount > 0 && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-xl font-bold">+{extraPhotosCount} фото</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ==================== 2. PRIMARY INFO SECTION ==================== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            {/* District/city label */}
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              {playground.district} район • {playground.city}
            </p>
            {isAdmin && playground.status === "pending" && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs mb-2">
                <Clock className="w-3 h-3 mr-1" />
                Ожидает модерации
              </Badge>
            )}
            {/* Rating stars */}
            <div className="flex items-center gap-3 mb-3">
              <StarRating rating={playground.rating} size="md" />
              <span className={`text-sm font-semibold ${ratingInfo.color}`}>
                {ratingInfo.label} • {playground.rating}/100
              </span>
            </div>
            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3">
              {playground.name}
            </h1>
            {/* Description */}
            {playground.description && (
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {playground.description}
              </p>
            )}
          </div>

          {/* Like & Share buttons */}
          <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-6">
            <Button
              variant="outline"
              size="lg"
              className={`rounded-full border-border/50 ${
                liked
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  : "hover:bg-primary/5 hover:border-primary/30"
              }`}
              onClick={() => setLiked(!liked)}
            >
              <Heart
                className={`w-5 h-5 mr-2 transition-all ${
                  liked ? "fill-red-500 text-red-500 scale-110" : ""
                }`}
              />
              {liked ? "Нравится" : "Нравится"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-border/50 hover:bg-primary/5 hover:border-primary/30"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Support CTA */}
          <div className="flex items-center shrink-0 mt-2 sm:mt-6">
            <Button
              size="lg"
              className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 px-6"
            >
              <Heart className="w-5 h-5 mr-2" />
              Поддержать
            </Button>
          </div>
        </motion.section>

        {/* ==================== 3. BENTO DETAILS GRID ==================== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* ===== Left column (7 cols) ===== */}
          <div className="lg:col-span-7 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-lg p-6 shadow-[0_30px_50px_rgba(29,29,31,0.04)] border border-border/20">
              <h2 className="text-lg font-semibold text-foreground mb-4">Описание площадки</h2>

              {/* Features row */}
              <div className="flex flex-wrap gap-3 mb-6">
                {features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-muted/50 border border-border/20"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* Description text */}
              {playground.description ? (
                <p className="text-muted-foreground leading-relaxed">
                  {playground.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  Описание площадки пока не добавлено.
                </p>
              )}
            </div>

            {/* Equipment Card */}
            {equipment.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-[0_30px_50px_rgba(29,29,31,0.04)] border border-border/20">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  Оборудование
                  <Badge variant="secondary" className="ml-1 rounded-full text-xs">
                    {equipment.length}
                  </Badge>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {equipment.map((item, i) => {
                    const iconInfo = EQUIPMENT_ICONS[item] || DEFAULT_EQUIPMENT_ICON;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-muted/30 border border-border/10 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconInfo.color}`}
                        >
                          {iconInfo.icon}
                        </div>
                        <span className="text-sm font-medium text-foreground">{item}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ===== Right column (5 cols) ===== */}
          <div className="lg:col-span-5 space-y-6">
            {/* Mini Map Card */}
            <div className="bg-white rounded-lg p-6 shadow-[0_30px_50px_rgba(29,29,31,0.04)] border border-border/20">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Расположение
              </h2>
              <MiniMap lat={playground.lat} lng={playground.lng} address={`${playground.address}, ${playground.city}`} />
            </div>

            {/* Status/Condition Card */}
            <div className="bg-white rounded-lg p-6 shadow-[0_30px_50px_rgba(29,29,31,0.04)] border border-border/20">
              <h2 className="text-lg font-semibold text-foreground mb-4">Состояние</h2>
              <div className="flex items-center gap-3 mb-4">
                {/* Pulse indicator */}
                <div className="relative">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      playground.condition === "excellent"
                        ? "bg-emerald-500"
                        : playground.condition === "good"
                        ? "bg-primary"
                        : playground.condition === "needs_repair"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div
                    className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${
                      playground.condition === "excellent"
                        ? "bg-emerald-500"
                        : playground.condition === "good"
                        ? "bg-primary"
                        : playground.condition === "needs_repair"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    } opacity-40`}
                  />
                </div>
                <span className={`text-base font-semibold ${conditionInfo.color}`}>
                  {conditionInfo.label}
                </span>
              </div>

              {/* Rating bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Общий рейтинг</span>
                  <span className={`text-sm font-bold ${ratingInfo.color}`}>{playground.rating}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      playground.rating >= 80
                        ? "bg-emerald-500"
                        : playground.rating >= 60
                        ? "bg-primary"
                        : playground.rating >= 35
                        ? "bg-amber-500"
                        : playground.rating >= 15
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${playground.rating}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Type tag */}
              <div className="mt-4 pt-4 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Тип площадки</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/50 border border-border/20 text-foreground">
                    {TYPE_ICONS[playground.type] || TYPE_ICONS.kids}
                    {typeInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-lg p-6 shadow-[0_30px_50px_rgba(29,29,31,0.04)] border border-border/20">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Информация
              </h2>
              <div className="space-y-4">
                {/* Date added */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Дата добавления</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(playground.createdAt)}</p>
                  </div>
                </div>

                {/* Last updated */}
                {playground.updatedAt !== playground.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Последнее обновление</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(playground.updatedAt)}</p>
                    </div>
                  </div>
                )}

                {/* Submitter */}
                {playground.submitterName && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Добавил(а)</p>
                      <p className="text-sm font-medium text-foreground">{playground.submitterName}</p>
                      {playground.submitterEmail && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {playground.submitterEmail}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ID */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Flag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID площадки</p>
                    <p className="text-xs font-mono text-foreground/70">{playground.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ==================== 4. REVIEWS SECTION (Placeholder) ==================== */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Отзывы</h2>
            <Badge variant="secondary" className="rounded-full">
              {MOCK_REVIEWS.length} отзывов
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_REVIEWS.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-[0_30px_50px_rgba(29,29,31,0.04)] border border-border/20"
              >
                {/* Header: avatar + name + date */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${review.color}`}
                  >
                    {review.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-3.5 h-3.5 ${
                        si < review.stars
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>

          {/* Coming soon note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground italic">
              Функция отзывов скоро будет доступна
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
