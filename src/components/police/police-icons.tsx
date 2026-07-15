"use client";

import {
  AlertTriangle,
  Bell,
  Car,
  Check,
  CheckCircle2,
  Clipboard,
  Clock,
  Cloud,
  CloudRain,
  Download,
  FileText,
  Gauge,
  GitMerge,
  GraduationCap,
  HelpCircle,
  Home,
  MapPin,
  Route,
  ScanLine,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  TrafficCone,
  User,
  Users,
  Wallet,
  Camera,
  ChevronRight,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  alert: AlertTriangle,
  bell: Bell,
  car: Car,
  check: Check,
  "check-circle": CheckCircle2,
  clipboard: Clipboard,
  clock: Clock,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  download: Download,
  "file-text": FileText,
  gauge: Gauge,
  "git-merge": GitMerge,
  "graduation-cap": GraduationCap,
  "help-circle": HelpCircle,
  home: Home,
  "map-pin": MapPin,
  route: Route,
  "scan-line": ScanLine,
  search: Search,
  settings: Settings,
  shield: Shield,
  "shield-alert": ShieldAlert,
  "shield-check": ShieldCheck,
  smartphone: Smartphone,
  "traffic-cone": TrafficCone,
  user: User,
  users: Users,
  wallet: Wallet,
  camera: Camera,
  "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft,
};

export function PoliceIcon({
  name,
  className,
  size = 24,
  strokeWidth = 2,
}: {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = ICON_MAP[name] ?? AlertTriangle;
  return <Icon className={className} size={size} strokeWidth={strokeWidth} />;
}
