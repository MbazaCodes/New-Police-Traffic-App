'use client';

import React, { useState, useMemo } from 'react';
import {
  StatCard,
  DataTable,
  PageHeader,
  SearchBar,
  ChartPlaceholder,
  ActivityFeed,
} from '@/components/shared/layout-components';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/stores/app-store';
import {
  Bell,
  BellOff,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  CheckCheck,
  Filter,
  FileText,
  Clock,
  BarChart3,
  Shield,
  Sun,
  Moon,
  Globe,
  Mail,
  Smartphone,
  MessageSquare,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Type,
  Minimize2,
  Monitor,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Bug,
  Phone,
  ChevronRight,
  Search,
  FileUp,
  FolderOpen,
  HardDrive,
  Plus,
  Download,
  MoreVertical,
  Settings,
  User,
  CalendarDays,
  MapPin,
  Briefcase,
  Building2,
  Hash,
  ArrowUpRight,
  TrendingUp,
  Archive,
  FileCheck,
  Clock4,
  Inbox,
  ClipboardList,
  Upload,
  Folder,
  File,
  Trash2,
} from 'lucide-react';

// ─── Notification Types & Mock Data ─────────────────────────────────────────

interface Notification {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'warning' | 'info' | 'danger' | 'success';
}

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    title: 'System Maintenance Scheduled',
    message:
      'The platform will undergo scheduled maintenance on 15 Feb 2025 from 02:00–04:00 EAT. Please save your work before this time.',
    time: '10 minutes ago',
    read: false,
    type: 'warning',
  },
  {
    id: 'n2',
    icon: <Info className="h-4 w-4 text-blue-500" />,
    title: 'New Case Assigned',
    message:
      'Case #CR-2025-0387 "Robbery at Kijitonyama" has been assigned to your station for follow-up.',
    time: '1 hour ago',
    read: false,
    type: 'info',
  },
  {
    id: 'n3',
    icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    title: 'Warrant Alert — High Priority',
    message:
      'An active arrest warrant (W-2025-0192) for suspect "Omary Said" has been issued. Immediate action required.',
    time: '2 hours ago',
    read: false,
    type: 'danger',
  },
  {
    id: 'n4',
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    title: 'Report Approved',
    message:
      'Your Monthly Crime Report for January 2025 has been reviewed and approved by Regional Commander.',
    time: '5 hours ago',
    read: true,
    type: 'success',
  },
  {
    id: 'n5',
    icon: <Info className="h-4 w-4 text-blue-500" />,
    title: 'Policy Update',
    message:
      'New digital evidence handling procedures (Directive 12/2025) have been published. Please review before 28 Feb.',
    time: '1 day ago',
    read: true,
    type: 'info',
  },
  {
    id: 'n6',
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    title: 'Password Expiry Warning',
    message:
      'Your account password will expire in 7 days. Please update it in Settings to avoid being locked out.',
    time: '2 days ago',
    read: true,
    type: 'warning',
  },
  {
    id: 'n7',
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    title: 'Filing Complete',
    message:
      'Case file #CF-2025-0105 has been successfully archived to the national records repository.',
    time: '3 days ago',
    read: true,
    type: 'success',
  },
];

// ─── 1. NotificationsPage ───────────────────────────────────────────────────

export function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'warnings':
        return notifications.filter((n) => n.type === 'warning' || n.type === 'danger');
      case 'info':
        return notifications.filter((n) => n.type === 'info' || n.type === 'success');
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="warnings">Warnings</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BellOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You&apos;re all caught up!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read ? 'border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => toggleRead(notification.id)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{notification.icon}</div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-medium truncate ${
                            !notification.read ? '' : 'text-muted-foreground'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── 2. SettingsPage ────────────────────────────────────────────────────────

export function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences" />

      <div className="grid gap-6 max-w-2xl">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Theme</Label>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  variant={darkMode ? 'ghost' : 'default'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setDarkMode(false)}
                >
                  <Sun className="h-3.5 w-3.5 mr-1" />
                  Light
                </Button>
                <Button
                  variant={darkMode ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setDarkMode(true)}
                >
                  <Moon className="h-3.5 w-3.5 mr-1" />
                  Dark
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Language</Label>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred language
                </p>
              </div>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  variant={language === 'en' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setLanguage('en')}
                >
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  English
                </Button>
                <Button
                  variant={language === 'sw' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setLanguage('sw')}
                >
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  Kiswahili
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
            <CardDescription>
              Control how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Browser and device push alerts
                  </p>
                </div>
              </div>
              <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Critical alerts via SMS
                  </p>
                </div>
              </div>
              <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </CardTitle>
            <CardDescription>
              Protect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Change Password</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Current password"
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Input type="password" placeholder="New password" />
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button size="sm">Update Password</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security with 2FA
                  </p>
                </div>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
            {twoFactor && (
              <div className="ml-11 p-3 bg-muted/50 rounded-lg border">
                <p className="text-xs text-muted-foreground">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Two-factor authentication is <strong>enabled</strong>. Use your
                  authenticator app to generate codes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Display
            </CardTitle>
            <CardDescription>
              Adjust display preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Type className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Font Size</Label>
                  <p className="text-xs text-muted-foreground">
                    Adjust the text size
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                {['small', 'medium', 'large'].map((size) => (
                  <Button
                    key={size}
                    variant={fontSize === size ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs capitalize"
                    onClick={() => setFontSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Minimize2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce spacing for more content on screen
                  </p>
                </div>
              </div>
              <Switch checked={compactMode} onCheckedChange={setCompactMode} />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              About
            </CardTitle>
            <CardDescription>Application information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Application</span>
                <span className="font-medium">Tanzania Police Digital Platform</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">2.4.1</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">#20250210-rel</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment</span>
                <Badge variant="outline" className="text-[11px]">
                  Production
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">10 Feb 2025</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── 3. ProfilePage ─────────────────────────────────────────────────────────

export function ProfilePage() {
  const user = useAppStore((s) => s.user);

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile" description="Your account information" />
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No user data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your account information"
        actions={
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.rank}</p>
              <Badge variant="outline" className="mt-2 text-xs">
                <Hash className="h-3 w-3 mr-1" />
                {user.badgeNumber}
              </Badge>
            </div>
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.station}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {user.district}, {user.region}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Cards */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="text-sm font-medium">
                    +255 {Math.floor(600000000 + Math.random() * 99999999)}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium">
                    {user.name.toLowerCase().replace(' ', '.')}@police.go.tz
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Station Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Station Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Station</Label>
                  <p className="text-sm font-medium">{user.station}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Region</Label>
                  <p className="text-sm font-medium">{user.region}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">District</Label>
                  <p className="text-sm font-medium">{user.district}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <p className="text-sm font-medium">
                    {user.role.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Member Since</Label>
                  <p className="text-sm font-medium">15 Mar 2021</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Last Login</Label>
                  <p className="text-sm font-medium">Today, 08:32 EAT</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── 4. HelpPage ────────────────────────────────────────────────────────────

const faqItems = [
  {
    question: 'How do I reset my password?',
    answer:
      'Navigate to Settings → Security → Change Password. Enter your current password, then set a new one. If you have forgotten your current password, contact your station administrator or the IT helpdesk at 0800-780-111.',
  },
  {
    question: 'How do I file a new case report?',
    answer:
      'Go to your dashboard and click "New Report" or navigate to the Reports section. Fill in the required fields including incident details, parties involved, and any evidence descriptions. Submit for review by your station commander.',
  },
  {
    question: 'Can I access the system from my mobile device?',
    answer:
      'Yes. Traffic and General Officers can use the mobile-optimized PWA interface. Other roles can access the full desktop version through any modern web browser on tablets or phones. Bookmarks are supported for quick access.',
  },
  {
    question: 'How do I search for a citizen or vehicle record?',
    answer:
      'Use the Search panel in your sidebar. Select the appropriate search type (Citizen, Vehicle, etc.), enter the known details (name, ID number, registration plate), and click Search. Results will display matching records with full details.',
  },
  {
    question: 'What do the different report statuses mean?',
    answer:
      'Draft: Report is being prepared. Pending Review: Awaiting commander approval. Approved: Report has been accepted. Archived: Report is stored for long-term reference. Rejected: Report was returned for corrections.',
  },
  {
    question: 'Who can view classified CID intelligence?',
    answer:
      'CID intelligence panels and investigation details are restricted to CID personnel and commanders with appropriate clearance levels. Access is enforced through role-based permissions managed by the System Administrator.',
  },
];

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaq = useMemo(() => {
    if (!searchQuery.trim()) return faqItems;
    const q = searchQuery.toLowerCase();
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Support"
        description="Find answers and get assistance"
      />

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FAQ */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaq.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No matching help articles found.
                </p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaq.map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-sm text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-between text-sm h-auto py-2.5"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  User Manual
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm h-auto py-2.5"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm h-auto py-2.5"
              >
                <span className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Report a Bug
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-500" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Emergency Hotline</p>
                  <p className="text-xs text-muted-foreground">24/7</p>
                </div>
                <Badge variant="destructive" className="text-[11px]">
                  112 / 999
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">IT Helpdesk</p>
                  <p className="text-xs text-muted-foreground">Mon–Fri 08:00–17:00</p>
                </div>
                <Badge variant="outline" className="text-[11px]">
                  0800-780-111
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">System Admin</p>
                  <p className="text-xs text-muted-foreground">Technical issues</p>
                </div>
                <Badge variant="outline" className="text-[11px]">
                  Ext. 2045
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── 5. ReportsPage ─────────────────────────────────────────────────────────

interface ReportItem {
  id: string;
  title: string;
  date: string;
  type: string;
  status: 'Approved' | 'Pending' | 'Draft' | 'Rejected' | 'Archived';
}

const mockReports: ReportItem[] = [
  {
    id: 'r1',
    title: 'Monthly Crime Report — January 2025',
    date: '01 Feb 2025',
    type: 'Crime',
    status: 'Approved',
  },
  {
    id: 'r2',
    title: 'Traffic Statistics — Q4 2024',
    date: '15 Jan 2025',
    type: 'Traffic',
    status: 'Approved',
  },
  {
    id: 'r3',
    title: 'Officer Performance Review — Dec 2024',
    date: '10 Jan 2025',
    type: 'Personnel',
    status: 'Pending',
  },
  {
    id: 'r4',
    title: 'Case Summary — Armed Robbery Wave',
    date: '28 Dec 2024',
    type: 'Crime',
    status: 'Approved',
  },
  {
    id: 'r5',
    title: 'Station Resource Allocation Report',
    date: '20 Dec 2024',
    type: 'Administrative',
    status: 'Draft',
  },
  {
    id: 'r6',
    title: 'Community Policing Feedback — Nov 2024',
    date: '05 Dec 2024',
    type: 'Community',
    status: 'Rejected',
  },
  {
    id: 'r7',
    title: 'Annual Crime Trends Analysis 2024',
    date: '30 Nov 2024',
    type: 'Crime',
    status: 'Archived',
  },
  {
    id: 'r8',
    title: 'Equipment Inventory Audit',
    date: '15 Nov 2024',
    type: 'Administrative',
    status: 'Approved',
  },
];

const statusColorMap: Record<string, string> = {
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Archived: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
};

interface ReportsPageProps {
  readOnly?: boolean;
}

export function ReportsPage({ readOnly = false }: ReportsPageProps) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const types = useMemo(
    () => ['all', ...Array.from(new Set(mockReports.map((r) => r.type)))],
    [],
  );

  const filtered = useMemo(() => {
    let result = mockReports;
    if (typeFilter !== 'all') {
      result = result.filter((r) => r.type === typeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q),
      );
    }
    return result;
  }, [typeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View and manage reports"
        actions={
          !readOnly ? (
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Generate New Report
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {types.map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs whitespace-nowrap"
              onClick={() => setTypeFilter(type)}
            >
              {type === 'all' ? 'All Types' : type}
            </Button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No reports found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((report) => (
            <Card
              key={report.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="mt-0.5 p-2 rounded-lg bg-muted shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium truncate">
                      {report.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {report.date}
                      </span>
                      <span>•</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {report.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant="secondary"
                    className={`text-[11px] ${statusColorMap[report.status] || ''}`}
                  >
                    {report.status}
                  </Badge>
                  {!readOnly && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ─── 6. ClerkDashboard ──────────────────────────────────────────────────────

export function ClerkDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clerk Dashboard"
        description="Records and filing overview"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Records"
          value={23}
          subtitle="Awaiting processing"
          icon={<Inbox className="h-5 w-5" />}
          color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          trend={{ value: 8, label: 'from yesterday' }}
        />
        <StatCard
          title="Files Processed Today"
          value={47}
          subtitle="Daily throughput"
          icon={<FileCheck className="h-5 w-5" />}
          color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          trend={{ value: 12, label: 'vs last week' }}
        />
        <StatCard
          title="Overdue Items"
          value={5}
          subtitle="Past deadline"
          icon={<Clock4 className="h-5 w-5" />}
          color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          trend={{ value: -25, label: 'vs last week' }}
        />
        <StatCard
          title="Filing Queue"
          value={112}
          subtitle="Total in system"
          icon={<ClipboardList className="h-5 w-5" />}
          color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPlaceholder title="Weekly Filing Activity" type="bar" height="h-56" />
        <ActivityFeed
          items={[
            {
              id: 'a1',
              title: 'Case file CF-2025-0112 filed',
              description: 'Robbery case — Kijitonyama',
              time: '15 min ago',
              type: 'success',
            },
            {
              id: 'a2',
              title: 'New record awaiting review',
              description: 'Traffic violation TV-2025-0456',
              time: '1 hour ago',
              type: 'info',
            },
            {
              id: 'a3',
              title: 'Overdue: Case CF-2025-0089',
              description: 'Filing deadline was 3 days ago',
              time: '2 hours ago',
              type: 'danger',
            },
            {
              id: 'a4',
              title: 'Batch export completed',
              description: '42 records exported to CSV',
              time: '4 hours ago',
              type: 'success',
            },
            {
              id: 'a5',
              title: 'Storage warning: 85% used',
              description: 'Consider archiving older files',
              time: 'Yesterday',
              type: 'warning',
            },
          ]}
        />
      </div>

      <DataTable
        title="Recent Records"
        columns={['Record ID', 'Type', 'Status', 'Date', 'Action']}
        rows={[
          ['REC-2025-0301', 'Case File', 'Filed', '10 Feb 2025', 'View'],
          ['REC-2025-0300', 'Traffic', 'Pending', '10 Feb 2025', 'Process'],
          ['REC-2025-0299', 'Personnel', 'Archived', '09 Feb 2025', 'View'],
          ['REC-2025-0298', 'Case File', 'Pending', '09 Feb 2025', 'Process'],
          ['REC-2025-0297', 'Administrative', 'Filed', '08 Feb 2025', 'View'],
        ]}
      />
    </div>
  );
}

// ─── 7. ClerkRecords ────────────────────────────────────────────────────────

export function ClerkRecords() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const allRecords = [
    { id: 'REC-2025-0301', title: 'Armed Robbery — Kijitonyama', type: 'Case File', status: 'Filed', date: '10 Feb 2025' },
    { id: 'REC-2025-0300', title: 'Traffic Violation TV-0456', type: 'Traffic', status: 'Pending', date: '10 Feb 2025' },
    { id: 'REC-2025-0299', title: 'Officer Transfer Request', type: 'Personnel', status: 'Archived', date: '09 Feb 2025' },
    { id: 'REC-2025-0298', title: 'Assault Case — Sakina', type: 'Case File', status: 'Pending', date: '09 Feb 2025' },
    { id: 'REC-2025-0297', title: 'Monthly Station Report', type: 'Administrative', status: 'Filed', date: '08 Feb 2025' },
    { id: 'REC-2025-0296', title: 'Vehicle Theft — Njiro', type: 'Case File', status: 'Pending', date: '08 Feb 2025' },
    { id: 'REC-2025-0295', title: 'Drug Possession — Sekei', type: 'Case File', status: 'Filed', date: '07 Feb 2025' },
    { id: 'REC-2025-0294', title: 'Domestic Dispute — Moshono', type: 'Case File', status: 'Archived', date: '07 Feb 2025' },
    { id: 'REC-2025-0293', title: 'PF3 Form #3012', type: 'Traffic', status: 'Filed', date: '06 Feb 2025' },
    { id: 'REC-2025-0292', title: 'Equipment Procurement', type: 'Administrative', status: 'Pending', date: '06 Feb 2025' },
  ];

  const filtered = useMemo(() => {
    let result = allRecords;
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q),
      );
    }
    return result;
  }, [statusFilter, searchQuery]);

  const recordStatusColor: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Filed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Archived: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Records Management"
        description="Search, view, and manage all records"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Record
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records by ID, title, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {['all', 'Pending', 'Filed', 'Archived'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Archive className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No records found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((record) => (
            <Card
              key={record.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="mt-0.5 p-2 rounded-lg bg-muted shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium truncate">
                      {record.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {record.id}
                      </Badge>
                      <span>•</span>
                      <span>{record.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {record.date}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[11px] shrink-0 ${recordStatusColor[record.status] || ''}`}
                >
                  {record.status}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ─── 8. ClerkFileManagement ─────────────────────────────────────────────────

export function ClerkFileManagement() {
  const categories = [
    { name: 'Case Files', count: 234, icon: <FileText className="h-4 w-4" />, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
    { name: 'Traffic Records', count: 189, icon: <ClipboardList className="h-4 w-4" />, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { name: 'Personnel Files', count: 67, icon: <User className="h-4 w-4" />, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { name: 'Administrative', count: 145, icon: <FolderOpen className="h-4 w-4" />, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { name: 'Evidence Documents', count: 98, icon: <Archive className="h-4 w-4" />, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
    { name: 'Correspondence', count: 312, icon: <Mail className="h-4 w-4" />, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30' },
  ];

  const recentFiles = [
    { name: 'Case_CF-2025-0112.pdf', size: '2.4 MB', date: 'Today, 10:23', status: 'uploaded' },
    { name: 'Traffic_TV-0456_form.pdf', size: '890 KB', date: 'Today, 09:15', status: 'uploaded' },
    { name: 'Station_Report_Jan2025.xlsx', size: '1.1 MB', date: 'Yesterday', status: 'archived' },
    { name: 'Officer_Photos_batch3.zip', size: '15.2 MB', date: '2 days ago', status: 'uploaded' },
    { name: 'Evidence_Photos_C089.zip', size: '8.7 MB', date: '3 days ago', status: 'archived' },
    { name: 'Policy_Directive_12_2025.pdf', size: '340 KB', date: '4 days ago', status: 'uploaded' },
  ];

  const storageUsed = 68.5;
  const storageTotal = 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="File Management"
        description="Upload, organize, and manage files"
        actions={
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        }
      />

      {/* Storage Usage */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              Storage Usage
            </div>
            <span className="text-xs text-muted-foreground">
              {storageUsed} GB / {storageTotal} GB
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {storageTotal - storageUsed} GB remaining — 1,045 files total
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          File Categories
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card
              key={cat.name}
              className="hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${cat.color}`}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cat.count} files
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed">
        <CardContent className="py-10 flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-muted mb-3">
            <FileUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Drag and drop files here</p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse — PDF, DOCX, XLSX, JPG, PNG up to 25 MB
          </p>
          <Button variant="outline" size="sm" className="mt-3">
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
        </CardContent>
      </Card>

      {/* Recent Files */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Files
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded bg-muted shrink-0">
                    <File className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {file.size} • {file.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 9. ClerkReports ────────────────────────────────────────────────────────

export function ClerkReports() {
  return <ReportsPage />;
}

// ─── 10. ViewerDashboard ────────────────────────────────────────────────────

export function ViewerDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Read-only overview of station activity"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Cases"
          value={1,247}
          subtitle="This quarter"
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: 5.2, label: 'vs last quarter' }}
        />
        <StatCard
          title="Active Officers"
          value={38}
          subtitle="On duty today"
          icon={<User className="h-5 w-5" />}
          color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          title="Pending Reports"
          value={12}
          subtitle="Awaiting review"
          icon={<Clock className="h-5 w-5" />}
          color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        />
        <StatCard
          title="Crime Rate"
          value="-3.8%"
          subtitle="vs last month"
          icon={<TrendingUp className="h-5 w-5" />}
          color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          trend={{ value: -3.8, label: 'decrease in crime' }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPlaceholder title="Monthly Crime Trends" type="line" height="h-56" />
        <ChartPlaceholder title="Cases by Category" type="pie" height="h-56" />
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[
              {
                title: 'Directive 12/2025 — Digital Evidence Handling',
                desc: 'All officers must follow updated digital evidence procedures effective immediately.',
                date: '08 Feb 2025',
                type: 'info' as const,
              },
              {
                title: 'Regional Training — Community Policing',
                desc: 'Mandatory training for all station officers on 20 Feb 2025 at Regional HQ.',
                date: '05 Feb 2025',
                type: 'warning' as const,
              },
              {
                title: 'System Maintenance — 15 Feb 2025',
                desc: 'Platform will be unavailable from 02:00–04:00 EAT for scheduled upgrades.',
                date: '03 Feb 2025',
                type: 'warning' as const,
              },
              {
                title: 'Q4 2024 Performance Reports Published',
                desc: 'Station performance rankings and individual reports are now available.',
                date: '01 Feb 2025',
                type: 'success' as const,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div
                  className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                    item.type === 'info'
                      ? 'bg-blue-500'
                      : item.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DataTable
        title="Recent Reports"
        columns={['Report', 'Date', 'Type', 'Status']}
        rows={[
          ['Monthly Crime Report — Jan 2025', '01 Feb 2025', 'Crime', 'Approved'],
          ['Traffic Statistics — Q4 2024', '15 Jan 2025', 'Traffic', 'Approved'],
          ['Officer Performance — Dec 2024', '10 Jan 2025', 'Personnel', 'Pending'],
          ['Case Summary — Robbery Wave', '28 Dec 2024', 'Crime', 'Approved'],
          ['Community Policing Feedback', '20 Dec 2024', 'Community', 'Approved'],
        ]}
      />
    </div>
  );
}

// ─── 11. ViewerReports ──────────────────────────────────────────────────────

export function ViewerReports() {
  return <ReportsPage readOnly />;
}