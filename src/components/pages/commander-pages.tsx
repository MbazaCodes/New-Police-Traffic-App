'use client';

import React from 'react';
import { StatCard, DataTable, PageHeader, ChartPlaceholder, ActivityFeed } from '@/components/shared/layout-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building, FileText, BarChart3, Shield, MapPin, TrendingUp, AlertTriangle, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

// ============ NATIONAL COMMANDER ============
export function NationalDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="National Command Dashboard" description="Tanzania Police Force — National Overview" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value="2,847" icon={<FileText className="h-5 w-5" />} color="bg-red-100 text-red-600" trend={{ value: 5.2, label: 'vs last month' }} />
        <StatCard title="Active Officers" value="12,456" icon={<Users className="h-5 w-5" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Regions Active" value="31" icon={<MapPin className="h-5 w-5" />} color="bg-green-100 text-green-600" />
        <StatCard title="Arrests This Month" value="1,234" icon={<Shield className="h-5 w-5" />} color="bg-orange-100 text-orange-600" trend={{ value: -2.1, label: 'vs last month' }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Monthly Crime Trends" type="bar" />
        <ChartPlaceholder title="Cases by Region" type="bar" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Top Regions by Cases</CardTitle></CardHeader>
          <CardContent>
            {['Dar es Salaam', 'Mwanza', 'Arusha', 'Mbeya', 'Dodoma'].map((r, i) => (
              <div key={r} className="flex items-center gap-3 mb-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <span className="text-sm flex-1">{r}</span>
                <Progress value={90 - i * 15} className="flex-1 h-2" />
                <span className="text-xs font-medium w-12 text-right">{90 - i * 15}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <ActivityFeed items={[
          { id: '1', title: 'New Regional Report', description: 'Arusha region submitted monthly report', time: '10 min ago', type: 'info' },
          { id: '2', title: 'High Priority Case', description: 'Armed robbery case escalated', time: '1 hour ago', type: 'danger' },
          { id: '3', title: 'Officer Deployment', description: '50 officers deployed to Dar es Salaam', time: '3 hours ago', type: 'success' },
          { id: '4', title: 'Warrant Executed', description: 'Wanted suspect apprehended in Mbeya', time: '5 hours ago', type: 'success' },
        ]} />
      </div>
    </div>
  );
}

export function NationalRegions() {
  const regions = [
    { name: 'Dar es Salaam', districts: 5, stations: 24, officers: 1850, cases: 487, status: 'Active' },
    { name: 'Arusha', districts: 5, stations: 18, officers: 980, cases: 312, status: 'Active' },
    { name: 'Dodoma', districts: 5, stations: 15, officers: 750, cases: 245, status: 'Active' },
    { name: 'Mwanza', districts: 4, stations: 16, officers: 890, cases: 398, status: 'Active' },
    { name: 'Mbeya', districts: 5, stations: 14, officers: 680, cases: 287, status: 'Active' },
    { name: 'Morogoro', districts: 5, stations: 12, officers: 620, cases: 198, status: 'Active' },
    { name: 'Tanga', districts: 4, stations: 10, officers: 540, cases: 176, status: 'Active' },
    { name: 'Zanzibar', districts: 4, stations: 8, officers: 420, cases: 134, status: 'Active' },
    { name: 'Kilimanjaro', districts: 4, stations: 11, officers: 560, cases: 210, status: 'Active' },
    { name: 'Iringa', districts: 3, stations: 9, officers: 380, cases: 145, status: 'Active' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Regions Management" description="31 regions of Tanzania" actions={<Button size="sm">Add Region</Button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((r) => (
          <Card key={r.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{r.name}</h3>
                <Badge variant="outline" className="text-green-600 border-green-200">{r.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div><p className="text-lg font-bold">{r.districts}</p><p className="text-[10px] text-muted-foreground">Districts</p></div>
                <div><p className="text-lg font-bold">{r.stations}</p><p className="text-[10px] text-muted-foreground">Stations</p></div>
                <div><p className="text-lg font-bold">{r.officers.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Officers</p></div>
                <div><p className="text-lg font-bold">{r.cases}</p><p className="text-[10px] text-muted-foreground">Cases</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function NationalOfficers() {
  const officers = [
    ['OFC-0001', 'RPC James Mwangi', 'RPC', 'Dar es Salaam HQ', 'Active'],
    ['OFC-0002', 'RPC Peter Kimaro', 'RPC', 'Arusha HQ', 'Active'],
    ['OFC-0003', 'RPC Grace Mollel', 'RPC', 'Mwanza HQ', 'Active'],
    ['OFC-0004', 'ACP Hassan Omar', 'ACP', 'Mbeya HQ', 'On Leave'],
    ['OFC-0005', 'ASP Frank Mushi', 'ASP', 'Dodoma HQ', 'Active'],
    ['OFC-0006', 'SP Anna Temu', 'SP', 'Morogoro HQ', 'Active'],
    ['OFC-0007', 'Insp. Joseph Mcharo', 'Inspector', 'Tanga HQ', 'Suspended'],
    ['OFC-0008', 'Sgt. Rehema Juma', 'Sergeant', 'Kilimanjaro HQ', 'Active'],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="National Officers" description="Officers deployed across all regions" />
      <DataTable title="All Officers" columns={['Badge', 'Name', 'Rank', 'Station', 'Status']} rows={officers} />
    </div>
  );
}

export function NationalCases() {
  const cases = [
    ['CR/24/0001', 'Armed Robbery - Bank', 'Dar es Salaam', 'High', 'Open', 'RPC Mwangi'],
    ['CR/24/0002', 'Drug Trafficking', 'Mwanza', 'High', 'Under Investigation', 'RPC Kimaro'],
    ['CR/24/0003', 'Vehicle Theft Ring', 'Arusha', 'Medium', 'Open', 'OCPD Mollel'],
    ['CR/24/0004', 'Cyber Fraud', 'Dar es Salaam', 'Medium', 'Pending Court', 'Insp. Mushi'],
    ['CR/24/0005', 'Human Trafficking', 'Mbeya', 'High', 'Under Investigation', 'ACP Omar'],
    ['CR/24/0006', 'Corruption Case', 'Dodoma', 'High', 'Open', 'ASP Mushi'],
    ['CR/24/0007', 'Domestic Violence', 'Morogoro', 'Low', 'Closed', 'SP Temu'],
    ['CR/24/0008', 'Illegal Mining', 'Geita', 'Medium', 'Under Investigation', 'OCS Lekule'],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="National Cases" description="Cases across all regions" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value="2,847" icon={<FileText className="h-4 w-4" />} color="bg-red-100 text-red-600" />
        <StatCard title="Open" value="847" icon={<AlertTriangle className="h-4 w-4" />} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Under Investigation" value="1,200" icon={<Users className="h-4 w-4" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Closed" value="800" icon={<CheckCircle className="h-4 w-4" />} color="bg-green-100 text-green-600" />
      </div>
      <DataTable title="Recent Cases" columns={['Case #', 'Title', 'Region', 'Priority', 'Status', 'Assigned']} rows={cases} />
    </div>
  );
}

export function NationalReports() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="National reports and analytics" actions={<Button size="sm">Generate Report</Button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {['Monthly Crime Report', 'Annual Performance', 'Regional Comparison', 'Officer Deployment', 'Budget Summary', 'Crime Trend Analysis'].map((r, i) => (
          <Card key={r}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><BarChart3 className="h-4 w-4 text-primary" /></div>
                <div className="flex-1"><h3 className="text-sm font-medium">{r}</h3><p className="text-[11px] text-muted-foreground">Generated: {`2024-${String(i + 1).padStart(2, '0')}-15`}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function NationalAnalytics() {
  return (
    <div className="space-y-6">
      <PageHeader title="National Analytics" description="Crime analysis and trends across Tanzania" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Crime Rate" value="-3.8%" icon={<TrendingUp className="h-4 w-4" />} color="bg-green-100 text-green-600" trend={{ value: -3.8, label: 'decrease' }} />
        <StatCard title="Clearance Rate" value="67%" icon={<CheckCircle className="h-4 w-4" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Response Time" value="8.2 min" icon={<Clock className="h-4 w-4" />} color="bg-orange-100 text-orange-600" />
        <StatCard title="Public Trust" value="72%" icon={<Users className="h-4 w-4" />} color="bg-violet-100 text-violet-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Crime Trends (12 months)" type="line" height="h-56" />
        <ChartPlaceholder title="Cases by Type" type="pie" height="h-56" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Regional Crime Comparison" type="bar" height="h-56" />
        <ChartPlaceholder title="Arrests vs Convictions" type="bar" height="h-56" />
      </div>
    </div>
  );
}

export function NationalNotifications() { return <SharedNotifications />; }
export function NationalSettings() { return <SharedSettings />; }
export function NationalProfile() { return <SharedProfile />; }

// ============ REGIONAL COMMANDER ============
export function RegionalDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Arusha Regional Command" description="Regional overview and operations" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value="312" icon={<FileText className="h-5 w-5" />} color="bg-red-100 text-red-600" trend={{ value: 3.1, label: 'vs last month' }} />
        <StatCard title="Active Officers" value="980" icon={<Users className="h-5 w-5" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Districts" value="5" icon={<MapPin className="h-5 w-5" />} color="bg-green-100 text-green-600" />
        <StatCard title="Arrests" value="156" icon={<Shield className="h-5 w-5" />} color="bg-orange-100 text-orange-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Monthly Cases" type="bar" />
        <ChartPlaceholder title="Crime by District" type="bar" />
      </div>
      <ActivityFeed items={[
        { id: '1', title: 'New Case Filed', description: 'Theft case CR/24/0042 in Arusha DC', time: '15 min ago', type: 'info' },
        { id: '2', title: 'Officer Transferred', description: 'Sgt. Mcharo moved to Sokoni Post', time: '2 hours ago', type: 'success' },
        { id: '3', title: 'Warrant Issued', description: 'Arrest warrant for Juma Mwenda', time: '4 hours ago', type: 'danger' },
        { id: '4', title: 'Report Approved', description: 'Monthly report approved by HQ', time: '1 day ago', type: 'success' },
      ]} />
    </div>
  );
}

export function RegionalDistricts() {
  const districts = [
    { name: 'Arusha DC', officers: 245, stations: 6, cases: 98, resolution: '72%' },
    { name: 'Arusha CC', officers: 198, stations: 4, cases: 87, resolution: '68%' },
    { name: 'Meru', officers: 178, stations: 4, cases: 62, resolution: '75%' },
    { name: 'Karatu', officers: 156, stations: 2, cases: 38, resolution: '81%' },
    { name: 'Longido', officers: 103, stations: 2, cases: 27, resolution: '70%' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Districts — Arusha Region" description="5 districts under regional command" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {districts.map((d) => (
          <Card key={d.name}>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">{d.name}</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Officers</span><span className="font-medium">{d.officers}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Stations</span><span className="font-medium">{d.stations}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cases</span><span className="font-medium">{d.cases}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Resolution Rate</span><span className="font-medium text-green-600">{d.resolution}</span></div>
                <Progress value={parseInt(d.resolution)} className="h-1.5 mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function RegionalOfficers() {
  const officers = [
    ['OFC-0042', 'OCPD Grace Mollel', 'OCPD', 'Arusha DC Station', 'Active'],
    ['OFC-0043', 'OCS John Lekule', 'OCS', 'Sokoni Police Post', 'Active'],
    ['OFC-0044', 'Insp. Frank Mushi', 'Inspector', 'CID Arusha', 'Active'],
    ['OFC-0045', 'Sgt. Joseph Mcharo', 'Sergeant', 'Sokoni Police Post', 'Active'],
    ['OFC-0046', 'Cpl. Rehema Juma', 'Corporal', 'Central Station', 'On Leave'],
    ['OFC-0047', 'Const. Anna Temu', 'Constable', 'Meru Station', 'Active'],
    ['OFC-0048', 'Sgt. Daniel Tarimo', 'Sergeant', 'Karatu Station', 'Active'],
    ['OFC-0049', 'Const. Agnes Moshi', 'Constable', 'Longido Post', 'Active'],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Regional Officers" description="Officers deployed in Arusha Region" />
      <DataTable title="Officers — Arusha Region" columns={['Badge', 'Name', 'Rank', 'Station', 'Status']} rows={officers} />
    </div>
  );
}

export function RegionalCases() {
  const cases = [
    ['CR/24/0042', 'Theft — Market Stall', 'Arusha DC', 'Medium', 'Open', 'Sgt. Mcharo'],
    ['CR/24/0043', 'Assault — Bar Fight', 'Arusha CC', 'High', 'Under Investigation', 'Insp. Mushi'],
    ['CR/24/0044', 'Burglary — Residence', 'Meru', 'Medium', 'Pending Court', 'Cpl. Juma'],
    ['CR/24/0045', 'Fraud — Business', 'Arusha DC', 'High', 'Open', 'OCPD Mollel'],
    ['CR/24/0046', 'Traffic Accident', 'Karatu', 'Medium', 'Closed', 'Sgt. Tarimo'],
    ['CR/24/0047', 'Drug Possession', 'Longido', 'High', 'Under Investigation', 'Const. Moshi'],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Regional Cases" description="Cases within Arusha Region" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total" value="312" icon={<FileText className="h-4 w-4" />} color="bg-slate-100 text-slate-600" />
        <StatCard title="Open" value="98" icon={<AlertTriangle className="h-4 w-4" />} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Investigation" value="124" icon={<Users className="h-4 w-4" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Closed" value="90" icon={<CheckCircle className="h-4 w-4" />} color="bg-green-100 text-green-600" />
      </div>
      <DataTable title="Recent Cases" columns={['Case #', 'Title', 'District', 'Priority', 'Status', 'Assigned']} rows={cases} />
    </div>
  );
}

export function RegionalReports() {
  return (
    <div className="space-y-6">
      <PageHeader title="Regional Reports" description="Arusha Region reports" actions={<Button size="sm">Generate Report</Button>} />
      <DataTable title="Report Library" columns={['Report', 'Type', 'Period', 'Status', 'Date']} rows={[
        ['Arusha Monthly Crime Report', 'Crime', 'June 2024', 'Approved', '2024-07-01'],
        ['Officer Performance Q2', 'Personnel', 'Q2 2024', 'Pending', '2024-07-05'],
        ['District Comparison', 'Analysis', 'June 2024', 'Approved', '2024-07-01'],
        ['Arrest Statistics', 'Crime', 'June 2024', 'Approved', '2024-06-30'],
      ]} />
    </div>
  );
}

export function RegionalNotifications() { return <SharedNotifications />; }
export function RegionalSettings() { return <SharedSettings />; }
export function RegionalProfile() { return <SharedProfile />; }

// ============ DISTRICT COMMANDER ============
export function DistrictDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Arusha DC Command" description="District overview and station management" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value="98" icon={<FileText className="h-5 w-5" />} color="bg-red-100 text-red-600" />
        <StatCard title="Officers" value="245" icon={<Users className="h-5 w-5" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Stations" value="6" icon={<Building className="h-5 w-5" />} color="bg-green-100 text-green-600" />
        <StatCard title="Arrests" value="47" icon={<Shield className="h-5 w-5" />} color="bg-orange-100 text-orange-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Weekly Case Volume" type="bar" />
        <ActivityFeed items={[
          { id: '1', title: 'New Incident', description: 'Theft reported at Sokoni Market', time: '30 min ago', type: 'warning' },
          { id: '2', title: 'Case Closed', description: 'CR/24/0035 resolved', time: '2 hours ago', type: 'success' },
          { id: '3', title: 'Officer Check-in', description: 'Night shift officers checked in', time: '6 hours ago', type: 'info' },
        ]} />
      </div>
    </div>
  );
}

export function DistrictStations() {
  const stations = [
    ['STN-001', 'Arusha DC Central', 'OCS John Lekule', 65, 'Active'],
    ['STN-002', 'Sokoni Police Post', 'Sgt. Mcharo', 42, 'Active'],
    ['STN-003', 'Sinyanga Post', 'Sgt. Tarimo', 28, 'Active'],
    ['STN-004', 'Tengeru Post', 'Cpl. Juma', 35, 'Active'],
    ['STN-005', 'Usa River Post', 'Cpl. Kayombo', 38, 'Active'],
    ['STN-006', 'Kijitonyama Post', 'Const. Moshi', 37, 'Active'],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Stations — Arusha DC" description="6 stations under district command" />
      <DataTable title="All Stations" columns={['Station ID', 'Name', 'OC', 'Officers', 'Status']} rows={stations} />
    </div>
  );
}

export function DistrictOfficers() {
  const officers = [
    ['OFC-0043', 'OCS John Lekule', 'OCS', 'Arusha DC Central', 'Active'],
    ['OFC-0044', 'Sgt. Joseph Mcharo', 'Sergeant', 'Sokoni Post', 'Active'],
    ['OFC-0045', 'Sgt. Daniel Tarimo', 'Sergeant', 'Sinyanga Post', 'Active'],
    ['OFC-0046', 'Cpl. Rehema Juma', 'Corporal', 'Tengeru Post', 'On Leave'],
    ['OFC-0047', 'Cpl. Clement Kayombo', 'Corporal', 'Usa River Post', 'Active'],
    ['OFC-0048', 'Const. Agnes Moshi', 'Constable', 'Kijitonyama Post', 'Active'],
    ['OFC-0049', 'Const. Happy Mbise', 'Constable', 'Sokoni Post', 'Active'],
    ['OFC-0050', 'Const. Lightness Shayo', 'Constable', 'Arusha DC Central', 'Active'],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="District Officers" description="Officers in Arusha DC" />
      <DataTable title="Officers — Arusha DC" columns={['Badge', 'Name', 'Rank', 'Station', 'Status']} rows={officers} />
    </div>
  );
}

export function DistrictCases() {
  const cases = [
    ['CR/24/0050', 'Theft — Market', 'Sokoni Post', 'Medium', 'Open', 'Sgt. Mcharo'],
    ['CR/24/0051', 'Assault', 'Central Station', 'High', 'Under Investigation', 'OCS Lekule'],
    ['CR/24/0052', 'Burglary', 'Tengeru Post', 'Medium', 'Closed', 'Cpl. Juma'],
    ['CR/24/0053', 'Fraud', 'Usa River Post', 'Medium', 'Open', 'Cpl. Kayombo'],
    ['CR/24/0054', 'Domestic Violence', 'Kijitonyama Post', 'Low', 'Pending Court', 'Const. Moshi'],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="District Cases" description="Cases within Arusha DC" />
      <DataTable title="Cases — Arusha DC" columns={['Case #', 'Title', 'Station', 'Priority', 'Status', 'Assigned']} rows={cases} />
    </div>
  );
}

export function DistrictReports() {
  return (
    <div className="space-y-6">
      <PageHeader title="District Reports" description="Arusha DC reports" actions={<Button size="sm">Generate Report</Button>} />
      <DataTable title="Reports" columns={['Report', 'Type', 'Period', 'Status']} rows={[
        ['Weekly Crime Summary', 'Crime', 'Week 27', 'Draft'],
        ['Monthly Station Report', 'Operations', 'June 2024', 'Approved'],
        ['Officer Attendance', 'Personnel', 'June 2024', 'Approved'],
      ]} />
    </div>
  );
}

export function DistrictSettings() { return <SharedSettings />; }
export function DistrictProfile() { return <SharedProfile />; }

// ============ STATION COMMANDER ============
export function StationDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Sokoni One Police Post" description="Station daily operations" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today&apos;s Incidents" value="7" icon={<AlertTriangle className="h-4 w-4" />} color="bg-red-100 text-red-600" />
        <StatCard title="Officers on Duty" value="12" icon={<Users className="h-4 w-4" />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Open Cases" value="23" icon={<FileText className="h-4 w-4" />} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Arrests Today" value="3" icon={<Shield className="h-4 w-4" />} color="bg-green-100 text-green-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Current Shift</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Shift</span><span className="font-medium">Morning (06:00 - 14:00)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">OC on Duty</span><span className="font-medium">Sgt. Joseph Mcharo</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Officers Deployed</span><span className="font-medium">12 / 18</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Vehicles Available</span><span className="font-medium">3 / 5</span></div>
            </div>
          </CardContent>
        </Card>
        <ActivityFeed items={[
          { id: '1', title: 'Incident #0042', description: 'Theft reported at Sokoni Market', time: '15 min ago', type: 'warning' },
          { id: '2', title: 'Arrest Made', description: 'Suspect apprehended for pickpocketing', time: '1 hour ago', type: 'success' },
          { id: '3', title: 'Shift Change', description: 'Morning shift took over from night shift', time: '6 hours ago', type: 'info' },
          { id: '4', title: 'Vehicle Dispatched', description: 'Patrol vehicle sent to Tengeru area', time: '7 hours ago', type: 'info' },
        ]} />
      </div>
    </div>
  );
}

export function StationOfficers() {
  const officers = [
    ['OFC-0044', 'Sgt. Joseph Mcharo', 'Sergeant', 'On Duty', 'Patrol'],
    ['OFC-0049', 'Const. Happy Mbise', 'Constable', 'On Duty', 'Desk'],
    ['OFC-0050', 'Const. Lightness Shayo', 'Constable', 'On Duty', 'Patrol'],
    ['OFC-0051', 'Const. Violet Massawe', 'Constable', 'On Duty', 'Traffic'],
    ['OFC-0052', 'Const. Elizabeth Kahabi', 'Constable', 'Off Duty', '—'],
    ['OFC-0053', 'Const. Thomas Laizer', 'Constable', 'On Duty', 'Patrol'],
    ['OFC-0054', 'Const. Pendo Mlay', 'Constable', 'On Leave', '—'],
    ['OFC-0055', 'Cpl. Richard Magesa', 'Corporal', 'On Duty', 'Investigation'],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Station Officers" description="Officers at Sokoni One Police Post" />
      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatCard title="On Duty" value="6" icon={<CheckCircle className="h-4 w-4" />} color="bg-green-100 text-green-600" />
        <StatCard title="Off Duty" value="1" icon={<Clock className="h-4 w-4" />} color="bg-slate-100 text-slate-600" />
        <StatCard title="On Leave" value="1" icon={<XCircle className="h-4 w-4" />} color="bg-red-100 text-red-600" />
      </div>
      <DataTable title="All Officers" columns={['Badge', 'Name', 'Rank', 'Status', 'Assignment']} rows={officers} />
    </div>
  );
}

export function StationDutyRoster() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const shifts = ['Morning (06:00-14:00)', 'Afternoon (14:00-22:00)', 'Night (22:00-06:00)'];
  const shiftColors = ['bg-green-50 border-green-200', 'bg-yellow-50 border-yellow-200', 'bg-slate-100 border-slate-300'];
  const officers = ['Sgt. Mcharo', 'Cpl. Magesa', 'Const. Mbise', 'Const. Shayo', 'Const. Massawe', 'Const. Kahabi'];

  return (
    <div className="space-y-6">
      <PageHeader title="Duty Roster" description="Weekly duty schedule for Sokoni Police Post" actions={
        <div className="flex gap-2">
          <Select defaultValue="current"><SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="current">This Week</SelectItem><SelectItem value="next">Next Week</SelectItem></SelectContent>
          </Select>
          <Button size="sm">Export</Button>
        </div>
      } />
      <div className="flex gap-4 mb-4 text-xs">
        {shifts.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded border ${shiftColors[i]}`} />
            <span>{s}</span>
          </div>
        ))}
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-2.5 px-3 font-medium">Officer</th>
                {days.map(d => <th key={d} className="text-center py-2.5 px-2 font-medium">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {officers.map((officer, oi) => (
                <tr key={officer} className="border-b last:border-0">
                  <td className="py-2 px-3 font-medium whitespace-nowrap">{officer}</td>
                  {days.map((day, di) => {
                    const shiftIdx = (oi + di) % 3;
                    return (
                      <td key={day} className="py-2 px-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium border ${shiftColors[shiftIdx]}`}>
                          {shifts[shiftIdx].split(' ')[0]}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export function StationIncidents() {
  const incidents = [
    ['INC-0042', 'Theft', 'Sokoni Market', 'Open', 'Const. Mbise', '10:30 AM'],
    ['INC-0041', 'Assault', 'Bar area', 'Under Investigation', 'Sgt. Mcharo', '09:15 AM'],
    ['INC-0040', 'Domestic Disturbance', 'Residential area', 'Closed', 'Cpl. Magesa', '08:00 AM'],
    ['INC-0039', 'Suspicious Activity', 'Bus terminal', 'Closed', 'Const. Shayo', 'Yesterday'],
    ['INC-0038', 'Noise Complaint', 'Night club', 'Closed', 'Const. Massawe', 'Yesterday'],
    ['INC-0037', 'Lost Property', 'Market area', 'Closed', 'Const. Kahabi', '2 days ago'],
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Incident Log" description="Daily incident records" actions={<Button size="sm">New Incident</Button>} />
      <DataTable title="Recent Incidents" columns={['ID', 'Type', 'Location', 'Status', 'Officer', 'Time']} rows={incidents} />
    </div>
  );
}

export function StationReports() {
  return (
    <div className="space-y-6">
      <PageHeader title="Station Reports" description="Sokoni Police Post reports" actions={<Button size="sm">Generate Report</Button>} />
      <DataTable title="Reports" columns={['Report', 'Type', 'Period', 'Status']} rows={[
        ['Daily Incident Log', 'Operations', 'Today', 'In Progress'],
        ['Weekly Summary', 'Operations', 'Week 27', 'Draft'],
        ['Monthly Report', 'Operations', 'June 2024', 'Submitted'],
      ]} />
    </div>
  );
}

export function StationSettings() { return <SharedSettings />; }
export function StationProfile() { return <SharedProfile />; }

// ============ SHARED UNIVERSAL PAGES ============
function SharedNotifications() {
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Stay updated with the latest alerts and messages" />
      <div className="space-y-3">
        {[
          { title: 'System Maintenance', msg: 'Scheduled maintenance tonight at 23:00-01:00', time: '5 min ago', type: 'warning' as const },
          { title: 'New Case Assigned', msg: 'Case CR/24/0015 has been assigned to you', time: '1 hour ago', type: 'info' as const },
          { title: 'Warrant Alert', msg: 'New arrest warrant issued in your jurisdiction', time: '2 hours ago', type: 'danger' as const },
          { title: 'Report Approved', msg: 'Your monthly report has been approved by HQ', time: '1 day ago', type: 'success' as const },
          { title: 'Duty Roster Updated', msg: 'Next week roster has been published', time: '2 days ago', type: 'info' as const },
        ].map((n, i) => (
          <Card key={i} className={i === 0 ? 'border-l-4 border-l-yellow-500' : ''}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.type === 'warning' ? 'bg-yellow-500' : n.type === 'danger' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{n.title}</h4>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.msg}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SharedSettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your application preferences" />
      <Tabs defaultValue="general">
        <TabsList><TabsTrigger value="general">General</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger></TabsList>
        <TabsContent value="general" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold">Display</h3>
            <div className="flex items-center justify-between"><div><p className="text-sm">Language</p><p className="text-xs text-muted-foreground">Choose your preferred language</p></div>
              <Select defaultValue="en"><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="sw">Kiswahili</SelectItem></SelectContent></Select>
            </div>
            <div className="flex items-center justify-between"><div><p className="text-sm">Compact Mode</p><p className="text-xs text-muted-foreground">Reduce spacing for more content</p></div><input type="checkbox" className="h-4 w-4 rounded" /></div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold">Notification Preferences</h3>
            {['Push Notifications', 'Email Alerts', 'Case Assignment Alerts', 'System Alerts'].map(n => (
              <div key={n} className="flex items-center justify-between"><span className="text-sm">{n}</span><input type="checkbox" defaultChecked className="h-4 w-4 rounded" /></div>
            ))}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card><CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold">Security</h3>
            <div><Label className="text-sm">Current Password</Label><Input type="password" className="mt-1" /></div>
            <div><Label className="text-sm">New Password</Label><Input type="password" className="mt-1" /></div>
            <div><Label className="text-sm">Confirm New Password</Label><Input type="password" className="mt-1" /></div>
            <Button size="sm">Update Password</Button>
            <div className="flex items-center justify-between pt-2"><div><p className="text-sm">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Add extra security to your account</p></div><input type="checkbox" className="h-4 w-4 rounded" /></div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SharedProfile() {
  // Simple inline profile approach
  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="View and manage your account information" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Avatar className="h-20 w-20 mx-auto mb-3"><AvatarFallback className="text-2xl bg-primary text-primary-foreground">FL</AvatarFallback></Avatar>
            <h3 className="font-semibold">Frank Mushi</h3>
            <p className="text-sm text-muted-foreground">Inspector</p>
            <Badge className="mt-2" variant="outline">CID / Investigator</Badge>
            <div className="mt-4 pt-4 border-t space-y-2 text-xs text-left">
              <div className="flex justify-between"><span className="text-muted-foreground">Badge</span><span className="font-mono font-medium">CID-001</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Station</span><span className="font-medium">CID Regional Office</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span className="font-medium">Arusha</span></div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold">Account Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Full Name</p><p className="font-medium">Frank Mushi</p></div>
              <div><p className="text-xs text-muted-foreground">Rank</p><p className="font-medium">Inspector</p></div>
              <div><p className="text-xs text-muted-foreground">Badge Number</p><p className="font-mono font-medium">CID-001</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">+255712000009</p></div>
              <div><p className="text-xs text-muted-foreground">Station</p><p className="font-medium">CID Regional Office Arusha</p></div>
              <div><p className="text-xs text-muted-foreground">District</p><p className="font-medium">Arusha DC</p></div>
            </div>
            <div className="pt-4 border-t"><Button size="sm">Edit Profile</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}