'use client';

import React, { useState, useMemo } from 'react';
import { StatCard, DataTable, PageHeader, SearchBar, ChartPlaceholder, ActivityFeed } from '@/components/shared/layout-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Shield, UserSearch, Car, FileText, AlertTriangle, Users, Fingerprint,
  ClipboardList, Activity, BarChart3, Target, Radio, Eye, MapPin, Phone,
  Calendar, Banknote, Gavel, TrendingUp, Zap, Lock, Bell, User, Settings,
  ChevronRight, XCircle, CheckCircle2, Clock, ArrowRight, Filter,
  Radar, ScanLine, Database, Crosshair, Siren, CircleDot,
  FileSearch, Truck, UserCheck, Scale, Receipt, CarFront, TriangleAlert
} from 'lucide-react';

// ============================================================
// MOCK DATA
// ============================================================

const MOCK_WANTED_PERSONS = [
  {
    id: 'WRT-CIT-0001',
    name: 'Juma Mwenda',
    nida: '1990123456789001',
    crime: 'Armed Robbery',
    lastSeen: 'Kariakoo, Dar es Salaam',
    reward: 'TZS 500,000',
    rewardNum: 500000,
    dateAdded: '2024-02-10',
    status: 'Active',
    dangerLevel: 'High'
  },
  {
    id: 'WRT-CIT-0011',
    name: 'Aisha Mohammed',
    nida: '1985098765432001',
    crime: 'Fraud',
    lastSeen: 'Arusha Town',
    reward: 'TZS 300,000',
    rewardNum: 300000,
    dateAdded: '2024-03-22',
    status: 'Active',
    dangerLevel: 'Medium'
  },
  {
    id: 'WRT-CIT-0021',
    name: 'Rashid Kimaro',
    nida: '1992050432167800',
    crime: 'Theft',
    lastSeen: 'Mbeya Station area',
    reward: 'TZS 200,000',
    rewardNum: 200000,
    dateAdded: '2024-04-05',
    status: 'Active',
    dangerLevel: 'Low'
  },
  {
    id: 'WRT-CIT-0031',
    name: 'Peter Ngowi',
    nida: '1988012345678901',
    crime: 'Drug Trafficking',
    lastSeen: 'Mwenge, Dar es Salaam',
    reward: 'TZS 1,000,000',
    rewardNum: 1000000,
    dateAdded: '2024-01-15',
    status: 'Active',
    dangerLevel: 'High'
  },
  {
    id: 'WRT-CIT-0041',
    name: 'Grace Kalomo',
    nida: '1995056712345600',
    crime: 'Assault',
    lastSeen: 'Mwanza City Centre',
    reward: 'TZS 150,000',
    rewardNum: 150000,
    dateAdded: '2024-05-01',
    status: 'Active',
    dangerLevel: 'Medium'
  }
];

const MOCK_CITIZENS = [
  { name: 'Joseph Mcharo', nida: '1992031567890001', dob: '1992-03-15', gender: 'Male', phone: '0712345678', address: 'Kijitonyama, Dar es Salaam', region: 'Dar es Salaam', warrantStatus: 'None' },
  { name: 'Anna Temu', nida: '1995072154321001', dob: '1995-07-21', gender: 'Female', phone: '0754321098', address: 'Moshi Town, Kilimanjaro', region: 'Kilimanjaro', warrantStatus: 'None' },
  { name: 'Frank Mushi', nida: '1988113056781234', dob: '1988-11-30', gender: 'Male', phone: '0765432109', address: 'Dodoma Central', region: 'Dodoma', warrantStatus: 'Active Warrant' },
  { name: 'Juma Mwenda', nida: '1990123456789001', dob: '1990-12-01', gender: 'Male', phone: '0711002233', address: 'Kariakoo, Dar es Salaam', region: 'Dar es Salaam', warrantStatus: 'Wanted - Armed Robbery' },
  { name: 'Aisha Mohammed', nida: '1985098765432001', dob: '1985-09-15', gender: 'Female', phone: '0788990011', address: 'Arusha Town', region: 'Arusha', warrantStatus: 'Wanted - Fraud' },
  { name: 'Rashid Kimaro', nida: '1992050432167800', dob: '1992-05-04', gender: 'Male', phone: '0722334455', address: 'Mbeya Town', region: 'Mbeya', warrantStatus: 'Wanted - Theft' },
  { name: 'Mariam Abdallah', nida: '1993081212345678', dob: '1993-08-12', gender: 'Female', phone: '0744556677', address: 'Mwanza City', region: 'Mwanza', warrantStatus: 'None' },
  { name: 'Daniel Kyaruzi', nida: '1987012398765432', dob: '1987-01-23', gender: 'Male', phone: '0733445566', address: 'Tanga Town', region: 'Tanga', warrantStatus: 'None' },
];

const MOCK_VEHICLES = [
  { plate: 'T 123 ABC', make: 'Toyota Corolla', year: 2019, color: 'White', owner: 'Joseph Mcharo', insurance: 'Valid until 2025-01', inspection: 'Valid until 2024-12', status: 'Clean', stolen: false, wanted: false },
  { plate: 'T 456 DEF', make: 'Nissan X-Trail', year: 2021, color: 'Black', owner: 'Anna Temu', insurance: 'Valid until 2025-06', inspection: 'Valid until 2025-03', status: 'Clean', stolen: false, wanted: false },
  { plate: 'T 789 GHI', make: 'Toyota Hiace', year: 2017, color: 'Blue', owner: 'Unknown (Stolen)', insurance: 'Expired', inspection: 'Overdue', status: 'STOLEN', stolen: true, wanted: true },
  { plate: 'T 321 JKL', make: 'Mitsubishi Canter', year: 2020, color: 'Red', owner: 'Rashid Kimaro', insurance: 'Valid until 2024-11', inspection: 'Valid until 2024-10', status: 'Wanted - Suspect Vehicle', stolen: false, wanted: true },
  { plate: 'T 654 MNO', make: 'Toyota Land Cruiser', year: 2022, color: 'Silver', owner: 'Tanzania Breweries Ltd', insurance: 'Valid until 2025-09', inspection: 'Valid until 2025-06', status: 'Clean', stolen: false, wanted: false },
  { plate: 'T 987 PQR', make: 'Isuzu D-Max', year: 2018, color: 'White', owner: 'Daniel Kyaruzi', insurance: 'Valid until 2025-02', inspection: 'Overdue', status: 'Clean', stolen: false, wanted: false },
];

const MOCK_OFFICERS = [
  { badge: 'TPF-0451', name: 'Sgt. Daniel Tarimo', rank: 'Sergeant', station: 'Kinondoni Traffic', status: 'Active', phone: '0712000100' },
  { badge: 'TPF-0723', name: 'Cpl. Rehema Juma', rank: 'Corporal', station: 'Central Police Station', status: 'Active', phone: '0712000200' },
  { badge: 'TPF-0912', name: 'Sgt. Gideon Mrema', rank: 'Sergeant', station: 'Ilala Traffic', status: 'On Leave', phone: '0712000300' },
  { badge: 'TPF-0188', name: 'Insp. Fatma Hassan', rank: 'Inspector', station: 'CID Headquarters', status: 'Active', phone: '0712000400' },
  { badge: 'TPF-0544', name: 'PC. Ramadhani Ali', rank: 'Police Constable', station: 'Mbezi Beach Post', status: 'Active', phone: '0712000500' },
  { badge: 'TPF-0310', name: 'Sgt. Anna Mbunda', rank: 'Sergeant', station: 'Kariakoo Police', status: 'Active', phone: '0712000600' },
  { badge: 'TPF-0667', name: 'Cpl. James Mwamlima', rank: 'Corporal', station: 'Ubungo Traffic', status: 'Suspended', phone: '0712000700' },
];

const MOCK_CASES = [
  { number: 'CID-2024-001', title: 'Kariakoo Armed Robbery Gang', type: 'Robbery', status: 'Open', officer: 'Insp. Fatma Hassan', date: '2024-01-15', priority: 'Critical' },
  { number: 'CID-2024-002', title: 'Insurance Fraud Ring', type: 'Fraud', status: 'Under Investigation', officer: 'Sgt. Anna Mbunda', date: '2024-02-20', priority: 'High' },
  { number: 'CID-2024-003', title: 'Vehicle Theft Syndicate', type: 'Theft', status: 'Open', officer: 'Insp. Fatma Hassan', date: '2024-03-01', priority: 'High' },
  { number: 'CID-2024-004', title: 'Drug Smuggling at Port', type: 'Narcotics', status: 'Closed', officer: 'Sgt. Daniel Tarimo', date: '2024-01-05', priority: 'Critical' },
  { number: 'CID-2024-005', title: 'Cyber Crime - Mobile Money Fraud', type: 'Cybercrime', status: 'Under Investigation', officer: 'Cpl. Rehema Juma', date: '2024-04-10', priority: 'Medium' },
  { number: 'CID-2024-006', title: 'Illegal Land Allocation', type: 'Corruption', status: 'Open', officer: 'Sgt. Gideon Mrema', date: '2024-05-02', priority: 'Low' },
  { number: 'CID-2024-007', title: 'Assault on Foreign National', type: 'Assault', status: 'Pending Review', officer: 'PC. Ramadhani Ali', date: '2024-03-28', priority: 'Medium' },
];

const MOCK_PF3 = [
  { number: 'PF3/24/0001', citizen: 'Joseph Mcharo', offense: 'Overspeeding', officer: 'Sgt. Daniel Tarimo', date: '2024-06-01', fine: 'TZS 30,000', status: 'Pending' },
  { number: 'PF3/24/0002', citizen: 'Anna Temu', offense: 'No Seatbelt', officer: 'Cpl. Rehema Juma', date: '2024-06-03', fine: 'TZS 10,000', status: 'Paid' },
  { number: 'PF3/24/0003', citizen: 'Frank Mushi', offense: 'Drunk Driving', officer: 'Sgt. Gideon Mrema', date: '2024-06-05', fine: 'TZS 100,000', status: 'Pending' },
  { number: 'PF3/24/0004', citizen: 'Mariam Abdallah', offense: 'Expired Insurance', officer: 'Sgt. Daniel Tarimo', date: '2024-06-08', fine: 'TZS 50,000', status: 'Overdue' },
  { number: 'PF3/24/0005', citizen: 'Daniel Kyaruzi', offense: 'Running Red Light', officer: 'Cpl. Rehema Juma', date: '2024-06-10', fine: 'TZS 30,000', status: 'Paid' },
  { number: 'PF3/24/0006', citizen: 'Peter Ngowi', offense: 'Reckless Driving', officer: 'Sgt. Gideon Mrema', date: '2024-06-12', fine: 'TZS 50,000', status: 'Pending' },
];

const MOCK_ACCIDENTS = [
  { number: 'ACC/24/0001', location: 'Arusha-Moshi Road', date: '2024-03-15', type: 'Head-on Collision', severity: 'Fatal', vehicles: 2, fatalities: 1, injured: 3, officer: 'Sgt. Daniel Tarimo', status: 'Closed' },
  { number: 'ACC/24/0002', location: 'Dodoma Central', date: '2024-05-20', type: 'Pedestrian', severity: 'Serious', vehicles: 1, fatalities: 0, injured: 1, officer: 'Cpl. Rehema Juma', status: 'Under Investigation' },
  { number: 'ACC/24/0003', location: 'Morogoro Road, Dar es Salaam', date: '2024-06-01', type: 'Multi-vehicle', severity: 'Serious', vehicles: 4, fatalities: 0, injured: 5, officer: 'Sgt. Gideon Mrema', status: 'Open' },
  { number: 'ACC/24/0004', location: 'Kilwa Road Junction', date: '2024-06-10', type: 'Rollover', severity: 'Moderate', vehicles: 1, fatalities: 0, injured: 2, officer: 'PC. Ramadhani Ali', status: 'Open' },
];

const INTEL_ALERTS = [
  { id: '1', title: 'Wanted suspect spotted', description: 'Juma Mwenda reported near Kariakoo market', time: '12 min ago', type: 'danger' as const },
  { id: '2', title: 'Stolen vehicle alert', description: 'T 789 GHI detected on CCTV at Ubungo', time: '45 min ago', type: 'warning' as const },
  { id: '3', title: 'PF3 fraud pattern detected', description: 'Multiple PF3 forms with duplicate NIDA numbers', time: '2 hrs ago', type: 'warning' as const },
  { id: '4', title: 'Case CID-2024-004 closed', description: 'Drug smuggling case successfully prosecuted', time: '4 hrs ago', type: 'success' as const },
  { id: '5', title: 'New intelligence report', description: 'Vehicle theft syndicate operating in Mbeya region', time: '6 hrs ago', type: 'info' as const },
  { id: '6', title: 'Officer suspension', description: 'Cpl. James Mwamlima suspended pending investigation', time: '1 day ago', type: 'danger' as const },
  { id: '7', title: 'System update completed', description: 'NIDA integration database synchronized', time: '1 day ago', type: 'info' as const },
];

// ============================================================
// HELPER: Detect search type from input
// ============================================================
function detectSearchType(query: string): string {
  const q = query.trim();
  // NIDA format: 16 digits
  if (/^\d{16}$/.test(q)) return 'citizen';
  // Plate format: T XXX XXX or K XXX XXX etc.
  if (/^[A-Z]\s*\d{1,4}\s*[A-Z]{2,3}$/i.test(q)) return 'vehicle';
  // Case number: CID-YYYY-NNN
  if (/^CID-/i.test(q)) return 'case';
  // PF3 form number
  if (/^PF3/i.test(q)) return 'pf3';
  // Accident report number
  if (/^ACC/i.test(q)) return 'accident';
  // Badge number: TPF-NNNN
  if (/^TPF-/i.test(q)) return 'officer';
  // Wanted person ID: WRT-
  if (/^WRT-/i.test(q)) return 'wanted';
  return 'citizen'; // default
}

// ============================================================
// 1. CidDashboard
// ============================================================
export function CidDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Intelligence Overview"
        description="CID Investigation Dashboard — Real-time intelligence summary"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Investigations"
          value={24}
          subtitle="3 critical priority"
          icon={<Search className="h-5 w-5" />}
          color="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
          trend={{ value: 12, label: 'vs last month' }}
        />
        <StatCard
          title="Wanted Persons"
          value={5}
          subtitle="1 high danger"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
        />
        <StatCard
          title="Cases Pending"
          value={12}
          subtitle="4 under review"
          icon={<ClipboardList className="h-5 w-5" />}
          color="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
        />
        <StatCard
          title="PF3 Forms"
          value={156}
          subtitle="32 pending payment"
          icon={<Receipt className="h-5 w-5" />}
          color="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
          trend={{ value: 8, label: 'vs last month' }}
        />
        <StatCard
          title="Arrests This Month"
          value={18}
          subtitle="+6 from last month"
          icon={<Shield className="h-5 w-5" />}
          color="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
          trend={{ value: 50, label: 'vs last month' }}
        />
      </div>

      {/* Intelligence Alerts + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed items={INTEL_ALERTS} />
        </div>
        <ChartPlaceholder title="Case Priority Breakdown" type="pie" height="h-72" />
      </div>

      {/* Quick Action Buttons */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Quick Search Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Citizen', icon: <UserSearch className="h-4 w-4" />, color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' },
              { label: 'Vehicle', icon: <Car className="h-4 w-4" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
              { label: 'Officer', icon: <UserCheck className="h-4 w-4" />, color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800' },
              { label: 'Case', icon: <FileSearch className="h-4 w-4" />, color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
              { label: 'Wanted', icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
              { label: 'PF3', icon: <Receipt className="h-4 w-4" />, color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800' },
              { label: 'Accident', icon: <CarFront className="h-4 w-4" />, color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800' },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className={`flex items-center gap-2 h-auto py-3 border ${action.color} transition-all`}
              >
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Cases Table */}
      <DataTable
        title="Recent Cases"
        columns={['Case #', 'Title', 'Type', 'Priority', 'Status', 'Officer', 'Date']}
        rows={MOCK_CASES.slice(0, 5).map(c => [c.number, c.title, c.type, c.priority, c.status, c.officer, c.date])}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartPlaceholder title="Monthly Investigations" type="bar" height="h-56" />
        <ChartPlaceholder title="Case Resolution Rate" type="line" height="h-56" />
      </div>
    </div>
  );
}

// ============================================================
// 2. CidIntelConsole — THE KEY PAGE
// ============================================================
export function CidIntelConsole() {
  const [universalQuery, setUniversalQuery] = useState('');
  const [activeTab, setActiveTab] = useState('citizen');
  const [searchResults, setSearchResults] = useState<{ type: string; detected: string } | null>(null);

  const handleUniversalSearch = () => {
    if (!universalQuery.trim()) return;
    const detected = detectSearchType(universalQuery);
    setSearchResults({ type: detected, detected });
    setActiveTab(detected);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUniversalSearch();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Intelligence & Investigations Console"
        description="Unified search platform — auto-detects query type for rapid intelligence retrieval"
        actions={
          <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-400">
            <Radar className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        }
      />

      {/* Universal Search Bar */}
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 dark:border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <ScanLine className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm font-semibold">Universal Intelligence Search</span>
            {searchResults && (
              <Badge variant="secondary" className="text-[10px]">
                Auto-detected: {searchResults.detected.toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={universalQuery}
                onChange={(e) => setUniversalQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter NIDA number, plate number, case #, badge #, name, or any identifier..."
                className="pl-10 h-11 text-sm bg-white dark:bg-slate-900 border-primary/20 focus:border-primary"
              />
            </div>
            <Button onClick={handleUniversalSearch} className="h-11 px-6">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Quick-Access Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: 'Citizen', type: 'citizen', icon: <UserSearch className="h-3.5 w-3.5" /> },
              { label: 'Vehicle', type: 'vehicle', icon: <Car className="h-3.5 w-3.5" /> },
              { label: 'Officer', type: 'officer', icon: <UserCheck className="h-3.5 w-3.5" /> },
              { label: 'Case', type: 'case', icon: <FileSearch className="h-3.5 w-3.5" /> },
              { label: 'Wanted', type: 'wanted', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
              { label: 'PF3', type: 'pf3', icon: <Receipt className="h-3.5 w-3.5" /> },
              { label: 'Accident', type: 'accident', icon: <CarFront className="h-3.5 w-3.5" /> },
            ].map((btn) => (
              <Button
                key={btn.type}
                variant="outline"
                size="sm"
                className={`text-xs h-8 gap-1.5 ${activeTab === btn.type ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary' : ''}`}
                onClick={() => { setActiveTab(btn.type); setSearchResults({ type: btn.type, detected: btn.type }); }}
              >
                {btn.icon}
                {btn.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 7 Search Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted/80">
          <TabsTrigger value="citizen" className="text-xs gap-1.5"><UserSearch className="h-3.5 w-3.5" />Citizen</TabsTrigger>
          <TabsTrigger value="vehicle" className="text-xs gap-1.5"><Car className="h-3.5 w-3.5" />Vehicle</TabsTrigger>
          <TabsTrigger value="officer" className="text-xs gap-1.5"><UserCheck className="h-3.5 w-3.5" />Officer</TabsTrigger>
          <TabsTrigger value="case" className="text-xs gap-1.5"><FileSearch className="h-3.5 w-3.5" />Case</TabsTrigger>
          <TabsTrigger value="wanted" className="text-xs gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Wanted</TabsTrigger>
          <TabsTrigger value="pf3" className="text-xs gap-1.5"><Receipt className="h-3.5 w-3.5" />PF3</TabsTrigger>
          <TabsTrigger value="accident" className="text-xs gap-1.5"><CarFront className="h-3.5 w-3.5" />Accident</TabsTrigger>
        </TabsList>

        {/* TAB 1: Citizen Search */}
        <TabsContent value="citizen">
          <Card className="dark:bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-sky-500" />
                Citizen Intelligence Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name, NIDA number, or phone..." className="pl-9" />
                </div>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="dar">Dar es Salaam</SelectItem>
                    <SelectItem value="arusha">Arusha</SelectItem>
                    <SelectItem value="dodoma">Dodoma</SelectItem>
                    <SelectItem value="mbeya">Mbeya</SelectItem>
                    <SelectItem value="mwanza">Mwanza</SelectItem>
                    <SelectItem value="tanga">Tanga</SelectItem>
                    <SelectItem value="kilimanjaro">Kilimanjaro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/80 sticky top-0">
                      <tr>
                        <th className="text-left py-2.5 px-3 font-semibold">Full Name</th>
                        <th className="text-left py-2.5 px-3 font-semibold">NIDA</th>
                        <th className="text-left py-2.5 px-3 font-semibold">DOB</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Gender</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Phone</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Region</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Address</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Warrant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_CITIZENS.map((c, i) => (
                        <tr key={i} className={`border-b last:border-0 hover:bg-muted/50 transition-colors ${c.warrantStatus !== 'None' ? 'bg-red-50/50 dark:bg-red-950/20' : ''}`}>
                          <td className="py-2.5 px-3 font-medium">{c.name}</td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">{c.nida}</td>
                          <td className="py-2.5 px-3">{c.dob}</td>
                          <td className="py-2.5 px-3">{c.gender}</td>
                          <td className="py-2.5 px-3">{c.phone}</td>
                          <td className="py-2.5 px-3">{c.region}</td>
                          <td className="py-2.5 px-3 max-w-[150px] truncate">{c.address}</td>
                          <td className="py-2.5 px-3">
                            {c.warrantStatus === 'None' ? (
                              <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Clear</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">{c.warrantStatus}</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">Showing {MOCK_CITIZENS.length} records. Red-highlighted rows indicate active warrants or wanted status.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Vehicle Search */}
        <TabsContent value="vehicle">
          <Card className="dark:bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Car className="h-4 w-4 text-emerald-500" />
                Vehicle Intelligence Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by plate number (e.g., T 123 ABC)..." className="pl-9" />
                </div>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Make" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Makes</SelectItem>
                    <SelectItem value="toyota">Toyota</SelectItem>
                    <SelectItem value="nissan">Nissan</SelectItem>
                    <SelectItem value="mitsubishi">Mitsubishi</SelectItem>
                    <SelectItem value="isuzu">Isuzu</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="stolen">Stolen</SelectItem>
                    <SelectItem value="wanted">Wanted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_VEHICLES.map((v, i) => (
                  <Card key={i} className={`border ${v.stolen ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20' : v.wanted ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Car className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{v.plate}</p>
                            <p className="text-xs text-muted-foreground">{v.make} • {v.year}</p>
                          </div>
                        </div>
                        {v.stolen && <Badge variant="destructive" className="text-[10px]"><Siren className="h-3 w-3 mr-1" />STOLEN</Badge>}
                        {v.wanted && !v.stolen && <Badge className="text-[10px] bg-amber-600 text-white"><TriangleAlert className="h-3 w-3 mr-1" />WANTED</Badge>}
                        {!v.stolen && !v.wanted && <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">CLEAN</Badge>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>Owner: <span className="text-foreground font-medium">{v.owner}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: v.color.toLowerCase() }} />
                          <span>Color: {v.color}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span>Insurance: <span className={v.insurance.includes('Expired') || v.insurance.includes('Overdue') ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>{v.insurance}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <ClipboardList className="h-3 w-3" />
                          <span>Inspection: <span className={v.inspection === 'Overdue' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>{v.inspection}</span></span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Officer Search */}
        <TabsContent value="officer">
          <Card className="dark:bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-violet-500" />
                Officer Intelligence Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name or badge number (e.g., TPF-0451)..." className="pl-9" />
                </div>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Rank" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranks</SelectItem>
                    <SelectItem value="inspector">Inspector</SelectItem>
                    <SelectItem value="sergeant">Sergeant</SelectItem>
                    <SelectItem value="corporal">Corporal</SelectItem>
                    <SelectItem value="constable">Constable</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="leave">On Leave</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_OFFICERS.map((o, i) => (
                  <Card key={i} className={`transition-all ${o.status === 'Suspended' ? 'border-red-300 dark:border-red-800' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{o.name.split(' ').slice(-1)[0].substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{o.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{o.badge}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] shrink-0 ${
                            o.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            o.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {o.status}
                        </Badge>
                      </div>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2"><Shield className="h-3 w-3" />{o.rank}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{o.station}</div>
                        <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{o.phone}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Case Search */}
        <TabsContent value="case">
          <Card className="dark:bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-amber-500" />
                Case Intelligence Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by case number or title..." className="pl-9" />
                </div>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="robbery">Robbery</SelectItem>
                    <SelectItem value="fraud">Fraud</SelectItem>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="narcotics">Narcotics</SelectItem>
                    <SelectItem value="cybercrime">Cybercrime</SelectItem>
                    <SelectItem value="assault">Assault</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/80 sticky top-0">
                      <tr>
                        <th className="text-left py-2.5 px-3 font-semibold">Case #</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Title</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Type</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Status</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Assigned Officer</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Date</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_CASES.map((c, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-medium text-primary">{c.number}</td>
                          <td className="py-2.5 px-3 font-medium max-w-[200px] truncate">{c.title}</td>
                          <td className="py-2.5 px-3">{c.type}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="secondary" className={`text-[10px] ${
                              c.status === 'Closed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                              c.status === 'Open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                              c.status === 'Under Investigation' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                            }`}>{c.status}</Badge>
                          </td>
                          <td className="py-2.5 px-3">{c.officer}</td>
                          <td className="py-2.5 px-3">{c.date}</td>
                          <td className="py-2.5 px-3">
                            <Badge className={`text-[10px] text-white ${
                              c.priority === 'Critical' ? 'bg-red-600' :
                              c.priority === 'High' ? 'bg-amber-600' :
                              c.priority === 'Medium' ? 'bg-blue-600' : 'bg-gray-500'
                            }`}>{c.priority}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: Wanted Persons */}
        <TabsContent value="wanted">
          <Card className="dark:bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Wanted Persons Registry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search wanted persons by name or ID..." className="pl-9" />
                </div>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Danger Level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_WANTED_PERSONS.map((w, i) => (
                  <Card key={i} className="border-red-200 dark:border-red-900 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-red-700 p-3 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Wanted</span>
                        </div>
                        <Badge className="text-[10px] bg-white/20 text-white border-white/30">{w.dangerLevel} Danger</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-red-300 dark:border-red-800">
                          <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 font-bold text-sm">
                            {w.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm">{w.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">{w.id}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Crime</span>
                          <Badge variant="destructive" className="text-[10px]">{w.crime}</Badge>
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <Fingerprint className="h-3 w-3 mt-0.5 shrink-0" />
                          <span className="font-mono">{w.nida}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>Last seen: <span className="text-foreground font-medium">{w.lastSeen}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>Date added: {w.dateAdded}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Banknote className="h-3 w-3 text-green-600 shrink-0" />
                          <span className="text-green-700 dark:text-green-400 font-semibold">Reward: {w.reward}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: PF3 Search */}
        <TabsContent value="pf3">
          <Card className="dark:bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-teal-500" />
                PF3 Form Intelligence Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by PF3 form number or citizen name..." className="pl-9" />
                </div>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Payment Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Officer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Officers</SelectItem>
                    <SelectItem value="tarimo">Sgt. Daniel Tarimo</SelectItem>
                    <SelectItem value="rehema">Cpl. Rehema Juma</SelectItem>
                    <SelectItem value="mrema">Sgt. Gideon Mrema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/80 sticky top-0">
                      <tr>
                        <th className="text-left py-2.5 px-3 font-semibold">Form #</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Citizen</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Offense</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Issuing Officer</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Date</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Fine Amount</th>
                        <th className="text-left py-2.5 px-3 font-semibold">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_PF3.map((p, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-medium text-primary">{p.number}</td>
                          <td className="py-2.5 px-3 font-medium">{p.citizen}</td>
                          <td className="py-2.5 px-3">{p.offense}</td>
                          <td className="py-2.5 px-3">{p.officer}</td>
                          <td className="py-2.5 px-3">{p.date}</td>
                          <td className="py-2.5 px-3 font-semibold">{p.fine}</td>
                          <td className="py-2.5 px-3">
                            <Badge className={`text-[10px] text-white ${
                              p.status === 'Paid' ? 'bg-green-600' :
                              p.status === 'Pending' ? 'bg-amber-600' : 'bg-red-600'
                            }`}>{p.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Total: {MOCK_PF3.length} forms</span>
                <span>•</span>
                <span>Paid: {MOCK_PF3.filter(p => p.status === 'Paid').length}</span>
                <span>•</span>
                <span>Pending: {MOCK_PF3.filter(p => p.status === 'Pending').length}</span>
                <span>•</span>
                <span className="text-red-600">Overdue: {MOCK_PF3.filter(p => p.status === 'Overdue').length}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 7: Accident Search */}
        <TabsContent value="accident">
          <Card className="dark:bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CarFront className="h-4 w-4 text-orange-500" />
                Accident Report Intelligence Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by report number (e.g., ACC/24/0001)..." className="pl-9" />
                </div>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="fatal">Fatal</SelectItem>
                    <SelectItem value="serious">Serious</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigation">Under Investigation</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {MOCK_ACCIDENTS.map((a, i) => (
                  <Card key={i} className={`transition-all ${a.severity === 'Fatal' ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${a.severity === 'Fatal' ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : a.severity === 'Serious' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'}`}>
                            <TriangleAlert className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{a.number}</p>
                            <p className="text-xs text-muted-foreground">{a.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] text-white ${
                            a.severity === 'Fatal' ? 'bg-red-600' :
                            a.severity === 'Serious' ? 'bg-amber-600' : 'bg-blue-600'
                          }`}>{a.severity}</Badge>
                          <Badge variant="secondary" className={`text-[10px] ${
                            a.status === 'Closed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            a.status === 'Under Investigation' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          }`}>{a.status}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{a.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{a.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Car className="h-3 w-3 shrink-0" />
                          <span>{a.vehicles} vehicle{a.vehicles > 1 ? 's' : ''} involved</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="h-3 w-3 shrink-0" />
                          <span>{a.fatalities > 0 ? <span className="text-red-600 font-semibold">{a.fatalities} fatalit{a.fatalities > 1 ? 'ies' : 'y'}</span> : 'No fatalities'}{a.injured > 0 ? `, ${a.injured} injured` : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 pt-2 border-t">
                        <Shield className="h-3 w-3" />
                        <span>Reporting Officer: <span className="text-foreground font-medium">{a.officer}</span></span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// 3. CidCitizenSearch — Standalone Citizen Search
// ============================================================
export function CidCitizenSearch() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_CITIZENS;
    const q = query.toLowerCase();
    return MOCK_CITIZENS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.nida.includes(q) ||
      c.phone.includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Citizen Search" description="Search citizen records by name, NIDA number, or phone" />

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, NIDA number, or phone..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="dar">Dar es Salaam</SelectItem>
                <SelectItem value="arusha">Arusha</SelectItem>
                <SelectItem value="dodoma">Dodoma</SelectItem>
                <SelectItem value="mbeya">Mbeya</SelectItem>
                <SelectItem value="mwanza">Mwanza</SelectItem>
              </SelectContent>
            </Select>
            <Button><Search className="h-4 w-4 mr-2" />Search</Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        title={`Citizen Records (${filtered.length} found)`}
        columns={['Full Name', 'NIDA', 'DOB', 'Gender', 'Phone', 'Region', 'Address', 'Warrant Status']}
        rows={filtered.map(c => [
          c.name,
          c.nida,
          c.dob,
          c.gender,
          c.phone,
          c.region,
          c.address,
          c.warrantStatus === 'None' ? '✅ Clear' : `⚠️ ${c.warrantStatus}`
        ])}
      />
    </div>
  );
}

// ============================================================
// 4. CidVehicleSearch — Standalone Vehicle Search
// ============================================================
export function CidVehicleSearch() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_VEHICLES;
    const q = query.toLowerCase();
    return MOCK_VEHICLES.filter(v =>
      v.plate.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.owner.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicle Search" description="Search vehicle records by plate number, make, or owner" />

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Plate number, make, or owner..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="stolen">Stolen</SelectItem>
                <SelectItem value="wanted">Wanted</SelectItem>
              </SelectContent>
            </Select>
            <Button><Search className="h-4 w-4 mr-2" />Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((v, i) => (
          <Card key={i} className={v.stolen ? 'border-red-300 dark:border-red-800' : v.wanted ? 'border-amber-300 dark:border-amber-800' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted"><Car className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold text-sm">{v.plate}</p>
                    <p className="text-xs text-muted-foreground">{v.make} • {v.year} • {v.color}</p>
                  </div>
                </div>
                {v.stolen ? <Badge variant="destructive" className="text-[10px]">STOLEN</Badge> :
                 v.wanted ? <Badge className="text-[10px] bg-amber-600 text-white">WANTED</Badge> :
                 <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">CLEAN</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><User className="h-3 w-3" />Owner: <span className="text-foreground font-medium">{v.owner}</span></div>
                <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" />{v.insurance}</div>
                <div className="flex items-center gap-1.5"><ClipboardList className="h-3 w-3" />{v.inspection}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 5. CidOfficerSearch — Standalone Officer Search
// ============================================================
export function CidOfficerSearch() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_OFFICERS;
    const q = query.toLowerCase();
    return MOCK_OFFICERS.filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.badge.toLowerCase().includes(q) ||
      o.station.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Officer Search" description="Search police officer records by name or badge number" />

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or badge number..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger><SelectValue placeholder="Rank" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                <SelectItem value="inspector">Inspector</SelectItem>
                <SelectItem value="sergeant">Sergeant</SelectItem>
                <SelectItem value="corporal">Corporal</SelectItem>
                <SelectItem value="constable">Constable</SelectItem>
              </SelectContent>
            </Select>
            <Button><Search className="h-4 w-4 mr-2" />Search</Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        title={`Officer Records (${filtered.length} found)`}
        columns={['Badge #', 'Name', 'Rank', 'Station', 'Status', 'Phone']}
        rows={filtered.map(o => [
          o.badge,
          o.name,
          o.rank,
          o.station,
          o.status === 'Active' ? '✅ Active' : o.status === 'On Leave' ? '🟡 On Leave' : '🔴 Suspended',
          o.phone
        ])}
      />
    </div>
  );
}

// ============================================================
// 6. CidCaseSearch — Standalone Case Search
// ============================================================
export function CidCaseSearch() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_CASES;
    const q = query.toLowerCase();
    return MOCK_CASES.filter(c =>
      c.number.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Case Search" description="Search investigation cases by number, title, or type" />

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Case number or title..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="robbery">Robbery</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="theft">Theft</SelectItem>
                <SelectItem value="narcotics">Narcotics</SelectItem>
                <SelectItem value="cybercrime">Cybercrime</SelectItem>
              </SelectContent>
            </Select>
            <Button><Search className="h-4 w-4 mr-2" />Search</Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        title={`Cases (${filtered.length} found)`}
        columns={['Case #', 'Title', 'Type', 'Status', 'Officer', 'Date', 'Priority']}
        rows={filtered.map(c => [c.number, c.title, c.type, c.status, c.officer, c.date, c.priority])}
      />
    </div>
  );
}

// ============================================================
// 7. CidWanted — Wanted Persons Listing
// ============================================================
export function CidWanted() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let result = MOCK_WANTED_PERSONS;
    if (filter !== 'all') result = result.filter(w => w.dangerLevel.toLowerCase() === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(w => w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q) || w.crime.toLowerCase().includes(q));
    }
    return result;
  }, [filter, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wanted Persons"
        description="Registry of persons wanted for questioning or arrest"
        actions={
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {MOCK_WANTED_PERSONS.length} Active Warrants
          </Badge>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, ID, or crime..." className="pl-9" />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger><SelectValue placeholder="Danger Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High Danger</SelectItem>
                <SelectItem value="medium">Medium Danger</SelectItem>
                <SelectItem value="low">Low Danger</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filters</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((w, i) => (
          <Card key={i} className="border-red-200 dark:border-red-900 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-700 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Wanted</span>
                </div>
                <Badge className="text-[10px] bg-white/20 text-white border-white/30">{w.dangerLevel}</Badge>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-red-300 dark:border-red-800">
                  <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 font-bold text-sm">
                    {w.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm">{w.name}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{w.id}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Crime</span>
                  <Badge variant="destructive" className="text-[10px]">{w.crime}</Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Last seen: <span className="text-foreground font-medium">{w.lastSeen}</span></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Added: {w.dateAdded}</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Banknote className="h-3 w-3 text-green-600" />
                  <span className="text-green-700 dark:text-green-400 font-semibold">Reward: {w.reward}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No wanted persons match your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// 8. CidPf3Search — PF3 Form Search
// ============================================================
export function CidPf3Search() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_PF3;
    const q = query.toLowerCase();
    return MOCK_PF3.filter(p =>
      p.number.toLowerCase().includes(q) ||
      p.citizen.toLowerCase().includes(q) ||
      p.offense.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader title="PF3 Search" description="Search PF3 penalty notice forms" />

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="PF3 form number or citizen name..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger><SelectValue placeholder="Payment Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button><Search className="h-4 w-4 mr-2" />Search</Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        title={`PF3 Records (${filtered.length} found)`}
        columns={['Form #', 'Citizen', 'Offense', 'Officer', 'Date', 'Fine', 'Status']}
        rows={filtered.map(p => [p.number, p.citizen, p.offense, p.officer, p.date, p.fine, p.status])}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Forms" value={MOCK_PF3.length} icon={<Receipt className="h-5 w-5" />} color="bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400" />
        <StatCard title="Pending Payment" value={MOCK_PF3.filter(p => p.status === 'Pending').length} icon={<Clock className="h-5 w-5" />} color="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" />
        <StatCard title="Total Collected" value="TZS 40,000" icon={<Banknote className="h-5 w-5" />} color="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" />
      </div>
    </div>
  );
}

// ============================================================
// 9. CidAccidentSearch — Accident Search
// ============================================================
export function CidAccidentSearch() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return MOCK_ACCIDENTS;
    const q = query.toLowerCase();
    return MOCK_ACCIDENTS.filter(a =>
      a.number.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader title="Accident Search" description="Search accident reports by number, location, or type" />

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Report number or location..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="fatal">Fatal</SelectItem>
                <SelectItem value="serious">Serious</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
              </SelectContent>
            </Select>
            <Button><Search className="h-4 w-4 mr-2" />Search</Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        title={`Accident Reports (${filtered.length} found)`}
        columns={['Report #', 'Location', 'Date', 'Type', 'Severity', 'Vehicles', 'Casualties', 'Officer', 'Status']}
        rows={filtered.map(a => [
          a.number,
          a.location,
          a.date,
          a.type,
          a.severity,
          `${a.vehicles} vehicle(s)`,
          `${a.fatalities}F / ${a.injured}I`,
          a.officer,
          a.status
        ])}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Reports" value={MOCK_ACCIDENTS.length} icon={<FileText className="h-5 w-5" />} color="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" />
        <StatCard title="Fatal" value={MOCK_ACCIDENTS.filter(a => a.severity === 'Fatal').length} icon={<AlertTriangle className="h-5 w-5" />} color="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" />
        <StatCard title="Total Fatalities" value={MOCK_ACCIDENTS.reduce((s, a) => s + a.fatalities, 0)} icon={<XCircle className="h-5 w-5" />} color="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" />
        <StatCard title="Total Injured" value={MOCK_ACCIDENTS.reduce((s, a) => s + a.injured, 0)} icon={<Activity className="h-5 w-5" />} color="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" />
      </div>
    </div>
  );
}

// ============================================================
// 10. CidSettings — Settings Page
// ============================================================
export function CidSettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure CID investigation console preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Wanted person alerts', desc: 'Get notified when wanted suspects are spotted', default: true },
              { label: 'New case assignments', desc: 'Alert when a case is assigned to you', default: true },
              { label: 'PF3 pattern alerts', desc: 'Fraud pattern detection notifications', default: true },
              { label: 'System updates', desc: 'Platform maintenance and feature updates', default: false },
              { label: 'Intelligence reports', desc: 'Daily intelligence summary digest', default: true },
            ].map((setting, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.desc}</p>
                </div>
                <div className={`w-10 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${setting.default ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${setting.default ? 'translate-x-4' : ''}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Search Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Default Search Type</Label>
              <Select defaultValue="auto">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="citizen">Citizen</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="case">Case</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Results Per Page</Label>
              <Select defaultValue="25">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 records</SelectItem>
                  <SelectItem value="25">25 records</SelectItem>
                  <SelectItem value="50">50 records</SelectItem>
                  <SelectItem value="100">100 records</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Wanted Person Alert Radius (km)</Label>
              <Input type="number" defaultValue="10" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Include archived records</p>
                <p className="text-xs text-muted-foreground">Show closed cases and resolved incidents</p>
              </div>
              <div className="w-10 h-6 rounded-full p-0.5 cursor-pointer bg-muted">
                <div className="w-5 h-5 rounded-full bg-white shadow" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Session Timeout (minutes)</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">Require OTP for login</p>
              </div>
              <div className="w-10 h-6 rounded-full p-0.5 cursor-pointer bg-primary">
                <div className="w-5 h-5 rounded-full bg-white shadow translate-x-4" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Mask NIDA numbers in results</p>
                <p className="text-xs text-muted-foreground">Show only last 4 digits of NIDA</p>
              </div>
              <div className="w-10 h-6 rounded-full p-0.5 cursor-pointer bg-muted">
                <div className="w-5 h-5 rounded-full bg-white shadow" />
              </div>
            </div>
            <Button variant="outline" className="w-full mt-2">Change Password</Button>
          </CardContent>
        </Card>

        {/* Data & Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data & Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Export Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                  <SelectItem value="excel">Excel Workbook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Auto-sync with NIDA</p>
                <p className="text-xs text-muted-foreground">Daily sync of citizen records</p>
              </div>
              <div className="w-10 h-6 rounded-full p-0.5 cursor-pointer bg-primary">
                <div className="w-5 h-5 rounded-full bg-white shadow translate-x-4" />
              </div>
            </div>
            <Button className="w-full">Export All Investigation Data</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// 11. CidProfile — Profile Page
// ============================================================
export function CidProfile() {
  const officer = {
    name: 'Insp. Fatma Hassan',
    badge: 'TPF-0188',
    rank: 'Inspector',
    unit: 'Criminal Investigation Department',
    station: 'CID Headquarters, Dar es Salaam',
    phone: '0712000400',
    email: 'f.hassan@police.go.tz',
    nida: '1985041219876543',
    joined: '2010-06-15',
    specializations: ['Armed Robbery', 'Fraud Investigation', 'Cybercrime'],
    casesAssigned: 12,
    casesClosed: 8,
    arrestsMade: 23,
    clearanceRate: '67%'
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="CID Officer Profile & Performance" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center space-y-4">
            <Avatar className="h-20 w-20 mx-auto border-4 border-primary/20">
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">FH</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold">{officer.name}</h3>
              <p className="text-sm text-muted-foreground">{officer.rank}</p>
              <Badge variant="outline" className="mt-1 text-xs">{officer.badge}</Badge>
            </div>
            <div className="space-y-2 text-sm text-left">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>{officer.unit}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{officer.station}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{officer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Fingerprint className="h-4 w-4" />
                <span className="font-mono text-xs">{officer.nida}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined: {officer.joined}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>

        {/* Performance & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Cases Assigned" value={officer.casesAssigned} icon={<ClipboardList className="h-5 w-5" />} color="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" />
            <StatCard title="Cases Closed" value={officer.casesClosed} icon={<CheckCircle2 className="h-5 w-5" />} color="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" />
            <StatCard title="Arrests Made" value={officer.arrestsMade} icon={<Gavel className="h-5 w-5" />} color="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" />
            <StatCard title="Clearance Rate" value={officer.clearanceRate} icon={<Target className="h-5 w-5" />} color="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" />
          </div>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {officer.specializations.map((spec, i) => (
                  <Badge key={i} variant="secondary" className="text-xs py-1 px-3">
                    <Crosshair className="h-3 w-3 mr-1" />
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Active Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={['Case #', 'Title', 'Priority', 'Status']}
                rows={MOCK_CASES.filter(c => c.officer.includes('Fatma')).map(c => [c.number, c.title, c.priority, c.status])}
              />
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <ChartPlaceholder title="Monthly Performance" type="bar" height="h-56" />
        </div>
      </div>
    </div>
  );
}