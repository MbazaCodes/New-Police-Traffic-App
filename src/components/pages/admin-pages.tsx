'use client';

import React, { useState } from 'react';
import {
  StatCard,
  DataTable,
  PageHeader,
  SearchBar,
  ChartPlaceholder,
  ActivityFeed,
} from '@/components/shared/layout-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Shield,
  FileText,
  MapPin,
  Building,
  BarChart3,
  Bell,
  Mail,
  Database,
  Activity,
  Wrench,
  Settings,
  User,
  TrendingUp,
  Search,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Globe,
  Lock,
  Eye,
  Calendar,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  Zap,
  ShieldCheck,
  Monitor,
  Save,
  RotateCcw,
} from 'lucide-react';

/* ============================================================
   MOCK DATA
   ============================================================ */

const tanzaniaRegions = [
  'Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Mbeya', 'Morogoro',
  'Tanga', 'Zanzibar', 'Kilimanjaro', 'Iringa', 'Kagera', 'Kigoma',
  'Lindi', 'Mara', 'Mtwara', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Singida', 'Tabora',
];

const userRows = [
  ['ADM-001', 'Amani Mwangi', 'SUPER_ADMIN', 'Dar es Salaam HQ', 'Active', '2024-01-15'],
  ['ADM-002', 'Fatma Hassan', 'SYSTEM_ADMIN', 'Dodoma HQ', 'Active', '2024-02-20'],
  ['CMD-003', 'Joseph Mwenda', 'COMMANDER_NATIONAL', 'Dar es Salaam HQ', 'Active', '2023-11-10'],
  ['CMD-004', 'Grace Ulimboka', 'COMMANDER_REGIONAL', 'Arusha Region', 'Active', '2024-03-05'],
  ['CMD-005', 'Hassan Omar', 'COMMANDER_DISTRICT', 'Kinondoni District', 'Active', '2024-04-12'],
  ['CMD-006', 'Anna Mbunda', 'COMMANDER_STATION', 'Central Police Station', 'Active', '2024-05-01'],
  ['OFC-007', 'Peter Kimaro', 'OFFICER_TRAFFIC', 'Dar es Salaam Traffic', 'Active', '2024-06-18'],
  ['OFC-008', 'Sarah Lugendo', 'OFFICER_GENERAL', 'Kariakoo Station', 'Active', '2024-07-22'],
  ['CID-009', 'David Mushi', 'CID', 'CID Headquarters', 'Active', '2024-01-30'],
  ['CLK-010', 'Rehema Juma', 'CLERK', 'Records Office', 'Inactive', '2023-09-14'],
  ['OFC-011', 'Thomas Makene', 'OFFICER_TRAFFIC', 'Mwanza Traffic', 'Active', '2024-08-05'],
  ['VWR-012', 'Public Portal', 'VIEWER', 'Web Portal', 'Active', '2024-03-01'],
];

const auditLogRows = [
  ['2025-01-15 09:23:41', 'Amani Mwangi', 'User Login', 'SUPER_ADMIN', 'Success'],
  ['2025-01-15 09:25:12', 'Amani Mwangi', 'Config Updated', 'SUPER_ADMIN', 'Success'],
  ['2025-01-15 10:01:33', 'Fatma Hassan', 'System Backup', 'SYSTEM_ADMIN', 'Success'],
  ['2025-01-15 10:15:07', 'Joseph Mwenda', 'Report Generated', 'COMMANDER_NATIONAL', 'Success'],
  ['2025-01-15 10:45:22', 'Grace Ulimboka', 'User Created', 'COMMANDER_REGIONAL', 'Success'],
  ['2025-01-15 11:02:55', 'Peter Kimaro', 'PF3 Issued', 'OFFICER_TRAFFIC', 'Success'],
  ['2025-01-15 11:30:18', 'Unknown IP', 'Login Attempt', 'Unknown', 'Failed'],
  ['2025-01-15 12:00:00', 'System', 'Auto Backup', 'System', 'Success'],
  ['2025-01-15 12:15:44', 'David Mushi', 'Case Updated', 'CID', 'Success'],
  ['2025-01-15 13:05:30', 'Sarah Lugendo', 'Incident Report', 'OFFICER_GENERAL', 'Success'],
  ['2025-01-15 13:45:12', 'System', 'Health Check', 'System', 'Success'],
  ['2025-01-15 14:20:08', 'Amani Mwangi', 'Role Modified', 'SUPER_ADMIN', 'Success'],
];

const regionRows = tanzaniaRegions.map((r, i) => [
  `REG-${String(i + 1).padStart(3, '0')}`,
  r,
  `${Math.floor(Math.random() * 5) + 1} Districts`,
  `${Math.floor(Math.random() * 20) + 3} Stations`,
  `${Math.floor(Math.random() * 200) + 50} Officers`,
  'Active',
]);

const districtRows = [
  ['DS-001', 'Kinondoni', 'Dar es Salaam', '8 Stations', '156 Officers', 'Active'],
  ['DS-002', 'Ilala', 'Dar es Salaam', '6 Stations', '120 Officers', 'Active'],
  ['DS-003', 'Temeke', 'Dar es Salaam', '7 Stations', '134 Officers', 'Active'],
  ['DS-004', 'Ubungo', 'Dar es Salaam', '4 Stations', '87 Officers', 'Active'],
  ['DS-005', 'Kigamboni', 'Dar es Salaam', '3 Stations', '45 Officers', 'Active'],
  ['DS-006', 'Monduli', 'Arusha', '3 Stations', '52 Officers', 'Active'],
  ['DS-007', 'Karatu', 'Arusha', '2 Stations', '38 Officers', 'Active'],
  ['DS-008', 'Ilemela', 'Mwanza', '5 Stations', '98 Officers', 'Active'],
  ['DS-009', 'Nyamagana', 'Mwanza', '4 Stations', '76 Officers', 'Active'],
  ['DS-010', 'Mbeya Urban', 'Mbeya', '4 Stations', '82 Officers', 'Active'],
];

const stationRows = [
  ['ST-001', 'Central Police Station', 'Kinondoni', 'Dar es Salaam', '24 Officers', 'Active'],
  ['ST-002', 'Kariakoo Police Station', 'Ilala', 'Dar es Salaam', '18 Officers', 'Active'],
  ['ST-003', 'Temeke Police Station', 'Temeke', 'Dar es Salaam', '22 Officers', 'Active'],
  ['ST-004', 'Mbagala Police Station', 'Temeke', 'Dar es Salaam', '15 Officers', 'Active'],
  ['ST-005', 'Oysterbay Police Post', 'Kinondoni', 'Dar es Salaam', '10 Officers', 'Active'],
  ['ST-006', 'Sinza Police Post', 'Kinondoni', 'Dar es Salaam', '8 Officers', 'Active'],
  ['ST-007', 'Arusha Central Station', 'Arusha Urban', 'Arusha', '28 Officers', 'Active'],
  ['ST-008', 'Mwanza Central Station', 'Ilemela', 'Mwanza', '25 Officers', 'Active'],
  ['ST-009', 'Mbeya Town Station', 'Mbeya Urban', 'Mbeya', '20 Officers', 'Inactive'],
  ['ST-010', 'Morogoro Main Station', 'Morogoro Urban', 'Morogoro', '19 Officers', 'Active'],
];

const departmentRows = [
  ['DEP-001', 'Traffic Department', 'Active', '340 Officers', 'Enforcement & road safety'],
  ['DEP-002', 'Criminal Investigation', 'Active', '220 Officers', 'Crime investigation & intelligence'],
  ['DEP-003', 'Operations', 'Active', '450 Officers', 'General police operations'],
  ['DEP-004', 'Administration', 'Active', '85 Officers', 'HR, finance & logistics'],
  ['DEP-005', 'Legal Affairs', 'Active', '40 Officers', 'Legal counsel & prosecution'],
  ['DEP-006', 'Community Policing', 'Active', '120 Officers', 'Public engagement & prevention'],
  ['DEP-007', 'Information Technology', 'Active', '25 Officers', 'Systems & digital infrastructure'],
  ['DEP-008', 'Training & Development', 'Active', '60 Officers', 'Academy & field training'],
  ['DEP-009', 'Forensics', 'Active', '35 Officers', 'Crime scene & lab analysis'],
  ['DEP-010', 'Anti-Drugs', 'Active', '75 Officers', 'Narcotics enforcement'],
];

const roleRows = [
  ['SUPER_ADMIN', 'Full system access', '1', 'All', 'Active'],
  ['SYSTEM_ADMIN', 'System configuration & health', '2', 'System, Users, Logs', 'Active'],
  ['COMMANDER_NATIONAL', 'National command & oversight', '1', 'All regions, analytics', 'Active'],
  ['COMMANDER_REGIONAL', 'Regional command', '5', 'Assigned region', 'Active'],
  ['COMMANDER_DISTRICT', 'District command', '12', 'Assigned district', 'Active'],
  ['COMMANDER_STATION', 'Station command', '45', 'Assigned station', 'Active'],
  ['OFFICER_TRAFFIC', 'Traffic enforcement', '340', 'Traffic module', 'Active'],
  ['OFFICER_GENERAL', 'General duty officer', '450', 'General module', 'Active'],
  ['CID', 'Criminal investigation', '220', 'CID module', 'Active'],
  ['CLERK', 'Records & documents', '85', 'Records, exports', 'Active'],
  ['VIEWER', 'Read-only public access', '1', 'Reports, dashboard', 'Active'],
];

const reportRows = [
  ['RPT-2025-001', 'Monthly Crime Statistics', 'National', 'Generated', '2025-01-14'],
  ['RPT-2025-002', 'Traffic Enforcement Summary', 'Dar es Salaam', 'Generated', '2025-01-13'],
  ['RPT-2025-003', 'Officer Performance Review', 'All Regions', 'Pending', '2025-01-15'],
  ['RPT-2025-004', 'PF3 Collection Report', 'National', 'Generated', '2025-01-12'],
  ['RPT-2025-005', 'Incident Response Time', 'Arusha Region', 'Generated', '2025-01-11'],
  ['RPT-2025-006', 'Quarterly Budget Summary', 'National', 'Pending', '2025-01-10'],
  ['RPT-2025-007', 'Vehicle Inspection Stats', 'Mwanza Region', 'Generated', '2025-01-09'],
  ['RPT-2025-008', 'Case Clearance Rate', 'All Regions', 'Generated', '2025-01-08'],
];

const notificationRows = [
  ['2025-01-15 14:30', 'System Update Available', 'System', 'All', 'Unread'],
  ['2025-01-15 13:00', 'Monthly Report Due', 'Reports', 'Admins', 'Unread'],
  ['2025-01-15 11:45', 'New Officer Registered', 'Users', 'Super Admin', 'Read'],
  ['2025-01-15 10:20', 'Backup Completed', 'System', 'System Admin', 'Read'],
  ['2025-01-15 09:00', 'Security Alert: Failed Login', 'Security', 'Admins', 'Read'],
  ['2025-01-14 17:30', 'Maintenance Scheduled', 'System', 'All', 'Read'],
  ['2025-01-14 15:00', 'Database Optimization Done', 'System', 'System Admin', 'Read'],
  ['2025-01-14 12:00', 'New Region Added', 'Config', 'Super Admin', 'Read'],
];

const messageRows = [
  ['MSG-001', 'Cmdr. Joseph Mwenda', 'Request for additional patrol units in Southern zone', '2025-01-15 10:30', 'Unread'],
  ['MSG-002', 'Fatma Hassan', 'Server migration scheduled for this weekend', '2025-01-15 09:15', 'Unread'],
  ['MSG-003', 'IT Department', 'New security patch deployed to production', '2025-01-14 16:45', 'Read'],
  ['MSG-004', 'Cmdr. Grace Ulimboka', 'Arusha region quarterly review attached', '2025-01-14 14:20', 'Read'],
  ['MSG-005', 'Training Academy', 'New batch of 45 officers graduated', '2025-01-14 11:00', 'Read'],
  ['MSG-006', 'Anti-Drugs Dept', 'Monthly narcotics seizure report', '2025-01-13 15:30', 'Read'],
  ['MSG-007', 'Finance Dept', 'Budget allocation for Q2 2025 approved', '2025-01-13 09:00', 'Read'],
  ['MSG-008', 'Community Policing', 'Community outreach event scheduled for Jan 20', '2025-01-12 16:00', 'Read'],
];

const backupRows = [
  ['BK-2025-0115-01', 'Full System Backup', '2.4 GB', '2025-01-15 02:00', 'Completed', 'Auto'],
  ['BK-2025-0114-01', 'Full System Backup', '2.4 GB', '2025-01-14 02:00', 'Completed', 'Auto'],
  ['BK-2025-0113-01', 'Full System Backup', '2.3 GB', '2025-01-13 02:00', 'Completed', 'Auto'],
  ['BK-2025-0112-01', 'Full System Backup', '2.3 GB', '2025-01-12 02:00', 'Completed', 'Auto'],
  ['BK-2025-0111-SP', 'Schema Migration Backup', '1.8 GB', '2025-01-11 14:30', 'Completed', 'Manual'],
  ['BK-2025-0110-01', 'Full System Backup', '2.3 GB', '2025-01-10 02:00', 'Completed', 'Auto'],
  ['BK-2025-0109-01', 'Full System Backup', '2.2 GB', '2025-01-09 02:00', 'Failed', 'Auto'],
  ['BK-2025-0108-01', 'Full System Backup', '2.2 GB', '2025-01-08 02:00', 'Completed', 'Auto'],
];

const systemLogRows = [
  ['2025-01-15 14:32:01', 'INFO', 'api-gateway', 'Request processed: GET /api/dashboard', '45ms'],
  ['2025-01-15 14:31:58', 'INFO', 'auth-service', 'Token refreshed for user ADM-001', '12ms'],
  ['2025-01-15 14:31:45', 'WARN', 'api-gateway', 'Rate limit approaching for IP 192.168.1.105', '3ms'],
  ['2025-01-15 14:31:30', 'ERROR', 'backup-service', 'Backup failed: disk space low on /backup', '120ms'],
  ['2025-01-15 14:31:15', 'INFO', 'database', 'Connection pool: 15/50 active connections', '2ms'],
  ['2025-01-15 14:31:00', 'INFO', 'scheduler', 'Cron job "health_check" executed successfully', '850ms'],
  ['2025-01-15 14:30:45', 'INFO', 'api-gateway', 'WebSocket connection established: 23 active', '5ms'],
  ['2025-01-15 14:30:30', 'WARN', 'memory', 'Memory usage at 78% — approaching threshold', '1ms'],
  ['2025-01-15 14:30:15', 'INFO', 'auth-service', 'Failed login attempt from 10.0.0.55', '8ms'],
  ['2025-01-15 14:30:00', 'INFO', 'database', 'Auto-vacuum completed on cases table', '2300ms'],
  ['2025-01-15 14:29:45', 'ERROR', 'email-service', 'SMTP connection timeout — retrying in 60s', '30000ms'],
  ['2025-01-15 14:29:30', 'INFO', 'api-gateway', 'Request processed: POST /api/reports', '320ms'],
];

const activityItems = [
  { id: '1', title: 'System backup completed', description: 'Full backup saved — 2.4 GB', time: '2 min ago', type: 'success' as const },
  { id: '2', title: 'New officer registered', description: 'OFC-013 John Mwinyi added to Mwanza Traffic', time: '15 min ago', type: 'info' as const },
  { id: '3', title: 'Failed login detected', description: '3 failed attempts from IP 10.0.0.55', time: '28 min ago', type: 'danger' as const },
  { id: '4', title: 'Report generated', description: 'Monthly Crime Statistics — National', time: '1 hr ago', type: 'success' as const },
  { id: '5', title: 'Memory usage warning', description: 'Server memory at 78% capacity', time: '1.5 hr ago', type: 'warning' as const },
  { id: '6', title: 'Config updated', description: 'Max login attempts changed from 5 to 3', time: '2 hr ago', type: 'info' as const },
  { id: '7', title: 'Region data synced', description: 'Arusha region station data updated', time: '3 hr ago', type: 'success' as const },
  { id: '8', title: 'Maintenance scheduled', description: 'Planned maintenance on Jan 20, 02:00 AM', time: '4 hr ago', type: 'warning' as const },
];

/* ============================================================
   HELPER: Badge by status
   ============================================================ */
function StatusBadge({ status }: { status: string }) {
  const variant = status === 'Active' || status === 'Success' || status === 'Completed' || status === 'Generated'
    ? 'default'
    : status === 'Inactive' || status === 'Failed'
      ? 'destructive'
      : 'secondary';
  return <Badge variant={variant} className="text-[10px] px-1.5 py-0">{status}</Badge>;
}

/* ============================================================
   1. SUPER_ADMIN PAGES
   ============================================================ */

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="System overview and key metrics"
        actions={<Button size="sm"><Download className="h-4 w-4 mr-1.5" /> Export Report</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value="1,353" subtitle="Across all roles" icon={<Users className="h-5 w-5" />} trend={{ value: 12, label: 'vs last month' }} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Active Officers" value="1,089" subtitle="On duty today" icon={<Shield className="h-5 w-5" />} trend={{ value: 5, label: 'vs last month' }} color="bg-amber-100 text-amber-700" />
        <StatCard title="Open Cases" value="3,472" subtitle="Pending resolution" icon={<FileText className="h-5 w-5" />} trend={{ value: -3, label: 'vs last month' }} color="bg-rose-100 text-rose-700" />
        <StatCard title="Active Regions" value="21" subtitle="Of 31 total" icon={<MapPin className="h-5 w-5" />} trend={{ value: 8, label: 'vs last month' }} color="bg-violet-100 text-violet-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartPlaceholder title="Crime Trends (12 Months)" type="bar" />
        <ChartPlaceholder title="Case Resolution Rate" type="line" />
        <ChartPlaceholder title="Officers by Region" type="pie" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DataTable title="Recent User Registrations" columns={['ID', 'Name', 'Role', 'Location', 'Status', 'Date']} rows={userRows.slice(0, 5)} maxRows={5} />
        <ActivityFeed items={activityItems} />
      </div>
    </div>
  );
}

export function AdminUsers() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all system users across roles"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1.5" /> Import</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add User</Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar placeholder="Search users by name, ID, or role..." /></div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48 h-10 text-sm">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Super Admin</SelectItem>
            <SelectItem value="system">System Admin</SelectItem>
            <SelectItem value="commander">Commanders</SelectItem>
            <SelectItem value="officer">Officers</SelectItem>
            <SelectItem value="cid">CID</SelectItem>
            <SelectItem value="clerk">Clerk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        title={`All Users (${userRows.length})`}
        columns={['ID', 'Name', 'Role', 'Location', 'Status', 'Registered']}
        rows={userRows}
        maxRows={10}
      />
    </div>
  );
}

export function AdminRoles() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Configure role-based access control"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Create Role</Button>}
      />

      <DataTable
        title="System Roles"
        columns={['Role', 'Description', 'Users', 'Permissions Scope', 'Status']}
        rows={roleRows}
        maxRows={11}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Permission Matrix — Quick View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Permission</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Super Admin</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">System Admin</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Commander</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Officer</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">CID</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Clerk</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Viewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Dashboard Access', true, true, true, true, true, true, true],
                  ['User Management', true, true, false, false, false, false, false],
                  ['System Config', true, true, false, false, false, false, false],
                  ['Case Management', true, false, true, true, true, true, true],
                  ['PF3 / Citations', true, false, true, true, false, false, false],
                  ['Investigations', true, false, false, false, true, false, false],
                  ['Reports & Analytics', true, true, true, true, true, true, true],
                  ['Audit Logs', true, true, false, false, false, false, false],
                ].map(([perm, ...vals], i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-2 px-2 font-medium">{perm as string}</td>
                    {(vals as boolean[]).map((v, j) => (
                      <td key={j} className="text-center py-2 px-2">
                        {v ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminAuditLog() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Complete system activity trail"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1.5" /> Filter</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" /> Export</Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar placeholder="Search audit logs by user, action, or detail..." /></div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-40 h-10 text-sm">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        title={`Audit Trail — ${auditLogRows.length} entries`}
        columns={['Timestamp', 'User', 'Action', 'Role', 'Result']}
        rows={auditLogRows}
        maxRows={12}
      />
    </div>
  );
}

export function AdminSystemConfig() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Configuration" description="Core platform settings and preferences" />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Platform Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Platform Name</Label>
                  <Input defaultValue="Tanzania Police Digital Platform" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Default Language</Label>
                  <Select defaultValue="sw">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sw">Swahili</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Timezone</Label>
                  <Select defaultValue="eat">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Date Format</Label>
                  <Select defaultValue="ddmmyyyy">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ddmmyyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyymmdd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Disable public access during maintenance</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Debug Mode</p>
                  <p className="text-xs text-muted-foreground">Enable verbose logging for troubleshooting</p>
                </div>
                <Switch />
              </div>
              <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Security Policies</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Max Login Attempts</Label>
                  <Input type="number" defaultValue="3" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="30" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Password Min Length</Label>
                  <Input type="number" defaultValue="8" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Password Expiry (days)</Label>
                  <Input type="number" defaultValue="90" className="h-9 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Require 2FA for all admin accounts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">IP Whitelisting</p>
                  <p className="text-xs text-muted-foreground">Restrict admin access to whitelisted IPs</p>
                </div>
                <Switch />
              </div>
              <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Update Security</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Notification Channels</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Email Notifications', desc: 'Send alerts via email', checked: true },
                { label: 'SMS Alerts', desc: 'Critical alerts via SMS', checked: true },
                { label: 'Push Notifications', desc: 'Browser push notifications', checked: false },
                { label: 'In-App Notifications', desc: 'Show notifications within the platform', checked: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.checked} />
                </div>
              ))}
              <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">External Integrations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'NIDA Verification', status: 'Connected', desc: 'National ID verification service' },
                { name: 'TRA Systems', status: 'Connected', desc: 'Tax Revenue Authority integration' },
                { name: 'TANROADS', status: 'Pending', desc: 'Road authority data sync' },
                { name: 'Judiciary Portal', status: 'Connected', desc: 'Court case file sharing' },
                { name: 'Emergency 112', status: 'Disconnected', desc: 'Emergency response system' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Badge variant={item.status === 'Connected' ? 'default' : item.status === 'Pending' ? 'secondary' : 'destructive'} className="text-[10px]">{item.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AdminRegions() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Regions Management"
        description="Manage police regions across Tanzania"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Region</Button>}
      />
      <div className="flex-1 max-w-sm"><SearchBar placeholder="Search regions..." /></div>
      <DataTable
        title={`Regions — ${regionRows.length} total`}
        columns={['Code', 'Region', 'Districts', 'Stations', 'Officers', 'Status']}
        rows={regionRows}
        maxRows={10}
      />
    </div>
  );
}

export function AdminDistricts() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Districts Management"
        description="Manage districts within each region"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add District</Button>}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar placeholder="Search districts..." /></div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48 h-10 text-sm">
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="dar">Dar es Salaam</SelectItem>
            <SelectItem value="arusha">Arusha</SelectItem>
            <SelectItem value="mwanza">Mwanza</SelectItem>
            <SelectItem value="mbeya">Mbeya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        title={`Districts — ${districtRows.length} total`}
        columns={['Code', 'District', 'Region', 'Stations', 'Officers', 'Status']}
        rows={districtRows}
        maxRows={10}
      />
    </div>
  );
}

export function AdminStations() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stations Management"
        description="Manage police stations and posts"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Station</Button>}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar placeholder="Search stations..." /></div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48 h-10 text-sm">
            <SelectValue placeholder="Filter by region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="dar">Dar es Salaam</SelectItem>
            <SelectItem value="arusha">Arusha</SelectItem>
            <SelectItem value="mwanza">Mwanza</SelectItem>
            <SelectItem value="mbeya">Mbeya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        title={`Police Stations — ${stationRows.length} total`}
        columns={['Code', 'Station Name', 'District', 'Region', 'Officers', 'Status']}
        rows={stationRows}
        maxRows={10}
      />
    </div>
  );
}

export function AdminDepartments() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments Management"
        description="Manage police departments and their structure"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Department</Button>}
      />
      <DataTable
        title={`Departments — ${departmentRows.length} total`}
        columns={['Code', 'Department', 'Status', 'Strength', 'Function']}
        rows={departmentRows}
        maxRows={10}
      />
    </div>
  );
}

export function AdminReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports Center"
        description="View and generate system-wide reports"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" /> Export All</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Generate Report</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Reports" value="247" subtitle="All time" icon={<FileText className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Generated" value="189" subtitle="Ready to view" icon={<CheckCircle2 className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="Pending" value="58" subtitle="In queue" icon={<Clock className="h-5 w-5" />} color="bg-rose-100 text-rose-700" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar placeholder="Search reports..." /></div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-40 h-10 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="generated">Generated</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        title="Report Library"
        columns={['ID', 'Report Name', 'Scope', 'Status', 'Date']}
        rows={reportRows}
        maxRows={10}
      />
    </div>
  );
}

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description="Advanced analytics and data insights"
        actions={
          <div className="flex items-center gap-2">
            <Select defaultValue="30d">
              <SelectTrigger className="h-9 w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" /> Export</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Crimes Reported" value="1,247" subtitle="This month" icon={<AlertTriangle className="h-5 w-5" />} trend={{ value: -8, label: 'vs last month' }} color="bg-rose-100 text-rose-700" />
        <StatCard title="Cases Resolved" value="893" subtitle="71.6% clearance" icon={<CheckCircle2 className="h-5 w-5" />} trend={{ value: 12, label: 'vs last month' }} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="PF3 Issued" value="4,521" subtitle="Traffic citations" icon={<FileText className="h-5 w-5" />} trend={{ value: 15, label: 'vs last month' }} color="bg-amber-100 text-amber-700" />
        <StatCard title="Fines Collected" value="TZS 89.4M" subtitle="This month" icon={<TrendingUp className="h-5 w-5" />} trend={{ value: 22, label: 'vs last month' }} color="bg-violet-100 text-violet-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Crime by Category" type="bar" />
        <ChartPlaceholder title="Case Resolution Trend" type="line" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartPlaceholder title="Incidents by Region" type="bar" />
        <ChartPlaceholder title="Response Time Distribution" type="line" />
        <ChartPlaceholder title="Officer Performance" type="pie" />
      </div>

      <DataTable
        title="Top Performing Regions"
        columns={['Region', 'Cases', 'Resolved', 'Clearance Rate', 'Avg Response']}
        rows={[
          ['Arusha', '187', '148', '79.1%', '12 min'],
          ['Dar es Salaam', '423', '312', '73.8%', '18 min'],
          ['Mwanza', '156', '119', '76.3%', '15 min'],
          ['Mbeya', '134', '102', '76.1%', '16 min'],
          ['Dodoma', '98', '78', '79.6%', '11 min'],
          ['Kilimanjaro', '112', '87', '77.7%', '13 min'],
          ['Morogoro', '89', '65', '73.0%', '19 min'],
          ['Tanga', '76', '57', '75.0%', '17 min'],
        ]}
        maxRows={8}
      />
    </div>
  );
}

export function AdminNotifications() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        description="Manage system notifications and alerts"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">Mark All Read</Button>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Send Notification</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Notifications" value="1,024" subtitle="All time" icon={<Bell className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Unread" value="12" subtitle="Requires attention" icon={<CircleDot className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="Critical" value="2" subtitle="Immediate action needed" icon={<AlertTriangle className="h-5 w-5" />} color="bg-rose-100 text-rose-700" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable
            title="All Notifications"
            columns={['Time', 'Subject', 'Category', 'Audience', 'Status']}
            rows={notificationRows}
            maxRows={10}
          />
        </TabsContent>
        <TabsContent value="unread">
          <DataTable
            title="Unread Notifications"
            columns={['Time', 'Subject', 'Category', 'Audience', 'Status']}
            rows={notificationRows.filter(r => r[4] === 'Unread')}
            maxRows={5}
          />
        </TabsContent>
        <TabsContent value="system">
          <DataTable
            title="System Notifications"
            columns={['Time', 'Subject', 'Category', 'Audience', 'Status']}
            rows={notificationRows.filter(r => r[2] === 'System')}
            maxRows={5}
          />
        </TabsContent>
        <TabsContent value="security">
          <DataTable
            title="Security Notifications"
            columns={['Time', 'Subject', 'Category', 'Audience', 'Status']}
            rows={notificationRows.filter(r => r[2] === 'Security')}
            maxRows={5}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AdminMessages() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Internal communication and memos"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Compose</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Inbox" value="24" subtitle="8 unread" icon={<Mail className="h-5 w-5" />} color="bg-blue-100 text-blue-700" />
        <StatCard title="Sent" value="156" subtitle="This month" icon={<Send className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Drafts" value="3" subtitle="Pending" icon={<FileText className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox">
          <DataTable
            title={`Inbox — ${messageRows.length} messages`}
            columns={['ID', 'From', 'Subject', 'Date', 'Status']}
            rows={messageRows}
            maxRows={8}
          />
        </TabsContent>
        <TabsContent value="sent">
          <DataTable
            title="Sent Messages"
            columns={['ID', 'To', 'Subject', 'Date', 'Status']}
            rows={messageRows.slice(0, 5).map(r => [r[0], r[1], r[2], r[3], 'Delivered'])}
            maxRows={5}
          />
        </TabsContent>
        <TabsContent value="drafts">
          <Card>
            <CardContent className="py-8 text-center">
              <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">3 draft messages in progress</p>
              <Button variant="outline" size="sm" className="mt-3">View Drafts</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Need to import Send icon that was used above
import { Send } from 'lucide-react';

export function AdminBackup() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup & Restore"
        description="Manage system backups and data restoration"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1.5" /> Restore from File</Button>
            <Button size="sm"><Database className="h-4 w-4 mr-1.5" /> Create Backup Now</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Backups" value="47" subtitle="All time" icon={<Database className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Auto Backups" value="42" subtitle="Scheduled" icon={<Clock className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="Last Backup" value="02:00 AM" subtitle="Today, Jan 15" icon={<CheckCircle2 className="h-5 w-5" />} color="bg-violet-100 text-violet-700" />
        <StatCard title="Storage Used" value="98.6 GB" subtitle="Of 500 GB" icon={<HardDrive className="h-5 w-5" />} color="bg-rose-100 text-rose-700" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Backup Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Daily Full Backup</p>
              <p className="text-xs text-muted-foreground">Runs every day at 02:00 AM EAT</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Weekly Archive</p>
              <p className="text-xs text-muted-foreground">Runs every Sunday at 03:00 AM EAT</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Pre-Update Backup</p>
              <p className="text-xs text-muted-foreground">Automatic backup before system updates</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <DataTable
        title="Backup History"
        columns={['Backup ID', 'Type', 'Size', 'Timestamp', 'Status', 'Trigger']}
        rows={backupRows}
        maxRows={8}
      />
    </div>
  );
}

export function AdminActivity() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Monitor"
        description="Real-time system activity and performance"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1.5" /> Refresh</Button>
            <Select defaultValue="live">
              <SelectTrigger className="h-9 w-28 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Sessions" value="234" subtitle="Currently online" icon={<Users className="h-5 w-5" />} trend={{ value: 15, label: 'vs 1hr ago' }} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="API Requests/min" value="1,247" subtitle="Avg response: 45ms" icon={<Zap className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="Active Cases" value="3,472" subtitle="47 updated in last hour" icon={<FileText className="h-5 w-5" />} color="bg-violet-100 text-violet-700" />
        <StatCard title="Error Rate" value="0.3%" subtitle="3 errors in last hour" icon={<AlertTriangle className="h-5 w-5" />} color="bg-rose-100 text-rose-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="API Request Volume (24h)" type="line" height="h-56" />
        <ChartPlaceholder title="Active Users (24h)" type="bar" height="h-56" />
      </div>

      <ActivityFeed items={activityItems} />
    </div>
  );
}

export function AdminMaintenance() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Mode"
        description="Schedule and manage system maintenance windows"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" /> System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Status</span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Uptime</span>
              <span className="text-sm font-medium">99.97% (30 days)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Maintenance</span>
              <span className="text-sm text-muted-foreground">Jan 10, 2025</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Next Scheduled</span>
              <span className="text-sm text-muted-foreground">Jan 20, 2025</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Toggle Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Enable Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">All users will see a maintenance page</p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Maintenance Message</Label>
              <Input defaultValue="System undergoing scheduled maintenance. We will be back shortly." className="text-sm" />
            </div>
            <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Save & Apply</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Scheduled Maintenance Windows</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            title=""
            columns={['Date', 'Time (EAT)', 'Duration', 'Type', 'Status']}
            rows={[
              ['2025-01-20', '02:00 — 04:00', '2 hours', 'Scheduled', 'Upcoming'],
              ['2025-01-10', '02:00 — 03:30', '1.5 hours', 'Completed', 'Done'],
              ['2024-12-28', '01:00 — 03:00', '2 hours', 'Emergency', 'Done'],
              ['2024-12-15', '02:00 — 02:45', '45 min', 'Scheduled', 'Done'],
            ]}
            maxRows={5}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="General platform configuration" />

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Theme & Display</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Enable dark theme across the platform</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Compact Mode</p>
                  <p className="text-xs text-muted-foreground">Reduce spacing for data-dense views</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Primary Color</Label>
                <div className="flex gap-2">
                  {['bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-cyan-600'].map(c => (
                    <div key={c} className={`w-8 h-8 rounded-full ${c} cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-primary/50 transition-all`} />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Logo Upload</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Drop Tanzania Police Force logo here or click to browse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Regional Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Country</Label>
                  <Input defaultValue="Tanzania" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Currency</Label>
                  <Select defaultValue="tzs">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tzs">TZS — Tanzanian Shilling</SelectItem>
                      <SelectItem value="usd">USD — US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Default Region</Label>
                  <Select defaultValue="dar">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dar">Dar es Salaam</SelectItem>
                      <SelectItem value="dodoma">Dodoma</SelectItem>
                      <SelectItem value="arusha">Arusha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Force Headquarters</Label>
                  <Input defaultValue="Dodoma" className="h-9 text-sm" />
                </div>
              </div>
              <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Email Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">SMTP Host</Label>
                  <Input defaultValue="smtp.police.go.tz" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">SMTP Port</Label>
                  <Input defaultValue="587" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">From Email</Label>
                  <Input defaultValue="noreply@police.go.tz" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">From Name</Label>
                  <Input defaultValue="Tanzania Police Force" className="h-9 text-sm" />
                </div>
              </div>
              <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Save Email Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">API Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Rate Limit (req/min)</Label>
                  <Input type="number" defaultValue="1000" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Request Timeout (ms)</Label>
                  <Input type="number" defaultValue="30000" className="h-9 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Enable API Docs</p>
                  <p className="text-xs text-muted-foreground">Expose Swagger/OpenAPI documentation</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">CORS Enabled</p>
                  <p className="text-xs text-muted-foreground">Allow cross-origin requests</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Save API Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AdminProfile() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Manage your account settings" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center py-8">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">AM</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">Amani Mwangi</h3>
            <p className="text-sm text-muted-foreground">Super Administrator</p>
            <Badge className="mt-2" variant="default">SUPER_ADMIN</Badge>
            <div className="w-full mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Badge Number</span>
                <span className="font-medium">ADM-001</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Station</span>
                <span className="font-medium">HQ Dar es Salaam</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">Jan 15, 2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Login</span>
                <span className="font-medium">Today, 09:23 AM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm font-semibold">Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">First Name</Label>
                <Input defaultValue="Amani" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Last Name</Label>
                <Input defaultValue="Mwangi" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Email</Label>
                <Input defaultValue="a.mwangi@police.go.tz" className="h-9 text-sm" type="email" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Phone</Label>
                <Input defaultValue="+255 22 211 0001" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Rank</Label>
                <Input defaultValue="Assistant Inspector General" className="h-9 text-sm" disabled />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Department</Label>
                <Input defaultValue="Information Technology" className="h-9 text-sm" disabled />
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Update Profile</Button>
              <Button variant="outline" size="sm"><Lock className="h-4 w-4 mr-1.5" /> Change Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Security Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Login Notifications</p>
              <p className="text-xs text-muted-foreground">Get notified of new logins</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Session Management</p>
              <p className="text-xs text-muted-foreground">Currently 2 active sessions</p>
            </div>
            <Button variant="outline" size="sm">Manage Sessions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
   SYSTEM_ADMIN PAGES
   ============================================================ */

export function SystemDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Dashboard"
        description="Real-time system health and performance metrics"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1.5" /> Refresh</Button>
            <Select defaultValue="1h">
              <SelectTrigger className="h-9 w-28 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="6h">Last 6 Hours</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="CPU Usage" value="34%" subtitle="4 cores active" icon={<Cpu className="h-5 w-5" />} trend={{ value: -5, label: 'vs 1hr ago' }} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Memory Usage" value="78%" subtitle="6.2 GB of 8 GB" icon={<Server className="h-5 w-5" />} trend={{ value: 8, label: 'vs 1hr ago' }} color="bg-amber-100 text-amber-700" />
        <StatCard title="Disk Usage" value="62%" subtitle="312 GB of 500 GB" icon={<HardDrive className="h-5 w-5" />} trend={{ value: 2, label: 'vs 1hr ago' }} color="bg-violet-100 text-violet-700" />
        <StatCard title="Uptime" value="99.97%" subtitle="42 days, 7 hrs" icon={<Zap className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="API Response" value="45ms" subtitle="Avg response time" icon={<Globe className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Active Connections" value="1,247" subtitle="WebSocket + HTTP" icon={<Wifi className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="Error Rate" value="0.3%" subtitle="3 errors in last hour" icon={<AlertTriangle className="h-5 w-5" />} color="bg-rose-100 text-rose-700" />
        <StatCard title="Queue Depth" value="12" subtitle="Background jobs" icon={<Activity className="h-5 w-5" />} color="bg-violet-100 text-violet-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="CPU & Memory Usage (24h)" type="line" height="h-56" />
        <ChartPlaceholder title="API Response Time (24h)" type="bar" height="h-56" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Service Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'API Gateway', status: 'Running', port: 3000 },
              { name: 'WebSocket Server', status: 'Running', port: 3003 },
              { name: 'Database (SQLite)', status: 'Running', port: 5432 },
              { name: 'Background Jobs', status: 'Running', port: null },
              { name: 'Email Service', status: 'Degraded', port: 587 },
              { name: 'File Storage', status: 'Running', port: null },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.status === 'Running' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {s.port && <span className="text-xs text-muted-foreground">:{s.port}</span>}
                  <Badge variant={s.status === 'Running' ? 'default' : 'secondary'} className="text-[10px]">{s.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <ActivityFeed items={activityItems} />
      </div>
    </div>
  );
}

export const SystemUsers = AdminUsers;

export function SystemHealth() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Server Health Checks"
        description="Monitor server infrastructure and service health"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1.5" /> Run All Checks</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" /> Export Report</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Services Online" value="5/6" subtitle="1 degraded" icon={<CheckCircle2 className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="Avg Response" value="45ms" subtitle="p95: 120ms" icon={<Zap className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="DB Connections" value="15/50" subtitle="Pool utilization" icon={<Database className="h-5 w-5" />} color="bg-violet-100 text-violet-700" />
        <StatCard title="Disk I/O" value="12 MB/s" subtitle="Read: 8 / Write: 4" icon={<HardDrive className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Service Health Matrix</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Service</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Latency</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Uptime</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Last Check</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['API Gateway', 'Healthy', '12ms', '99.99%', '30s ago', 'All endpoints responding'],
                  ['WebSocket Server', 'Healthy', '5ms', '99.98%', '30s ago', '23 active connections'],
                  ['Database', 'Healthy', '2ms', '99.99%', '30s ago', '15/50 connections used'],
                  ['Background Jobs', 'Healthy', '—', '99.95%', '60s ago', '12 jobs in queue'],
                  ['Email Service (SMTP)', 'Degraded', '30000ms', '98.50%', '60s ago', 'Intermittent timeouts'],
                  ['File Storage', 'Healthy', '8ms', '99.99%', '30s ago', '312 GB used of 500 GB'],
                  ['NIDA API', 'Healthy', '150ms', '99.90%', '5m ago', 'External service'],
                  ['Cache (Memory)', 'Healthy', '1ms', '100.00%', '30s ago', 'Hit rate: 94.2%'],
                ].map(([name, status, latency, uptime, lastCheck, notes], i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-2 px-2 font-medium">{name}</td>
                    <td className="text-center py-2 px-2">
                      <Badge variant={status === 'Healthy' ? 'default' : 'secondary'} className="text-[10px]">{status}</Badge>
                    </td>
                    <td className="text-center py-2 px-2">{latency}</td>
                    <td className="text-center py-2 px-2">{uptime}</td>
                    <td className="text-center py-2 px-2 text-muted-foreground">{lastCheck}</td>
                    <td className="py-2 px-2 text-muted-foreground">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Response Latency Trend (24h)" type="line" height="h-48" />
        <ChartPlaceholder title="Error Rate Trend (24h)" type="bar" height="h-48" />
      </div>
    </div>
  );
}

export function SystemMaintenance() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Scheduling"
        description="Plan and execute system maintenance tasks"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Schedule Maintenance</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Scheduled" value="3" subtitle="Upcoming tasks" icon={<Calendar className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="Completed (30d)" value="8" subtitle="All successful" icon={<CheckCircle2 className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Overdue" value="0" subtitle="No pending tasks" icon={<AlertTriangle className="h-5 w-5" />} color="bg-violet-100 text-violet-700" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Upcoming Maintenance</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'MNT-001', title: 'Database Index Optimization', date: 'Jan 18, 2025 — 02:00 AM', duration: '1 hour', type: 'Performance', priority: 'Medium' },
              { id: 'MNT-002', title: 'Security Patch Deployment', date: 'Jan 20, 2025 — 02:00 AM', duration: '2 hours', type: 'Security', priority: 'High' },
              { id: 'MNT-003', title: 'Log Rotation & Cleanup', date: 'Jan 25, 2025 — 03:00 AM', duration: '30 min', type: 'Housekeeping', priority: 'Low' },
            ].map((task) => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                    <Wrench className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.id} · {task.date} · {task.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-8 sm:ml-0">
                  <Badge variant="secondary" className="text-[10px]">{task.type}</Badge>
                  <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'} className="text-[10px]">{task.priority}</Badge>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DataTable
        title="Maintenance History"
        columns={['Date', 'Task', 'Duration', 'Type', 'Status']}
        rows={[
          ['2025-01-10', 'System Update v2.4.1', '2 hours', 'Update', 'Completed'],
          ['2025-01-05', 'Database Vacuum', '45 min', 'Performance', 'Completed'],
          ['2024-12-28', 'Emergency Hotfix', '1 hour', 'Security', 'Completed'],
          ['2024-12-15', 'SSL Certificate Renewal', '15 min', 'Security', 'Completed'],
          ['2024-12-10', 'Storage Cleanup', '30 min', 'Housekeeping', 'Completed'],
          ['2024-12-01', 'API Gateway Upgrade', '1.5 hours', 'Update', 'Completed'],
        ]}
        maxRows={6}
      />
    </div>
  );
}

export function SystemLogs() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Logs"
        description="View and search application and system logs"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" /> Download Logs</Button>
            <Button variant="outline" size="sm"><RotateCcw className="h-4 w-4 mr-1.5" /> Clear Logs</Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar placeholder="Search logs by message, service, or level..." /></div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-32 h-10 text-sm">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">INFO</SelectItem>
            <SelectItem value="warn">WARN</SelectItem>
            <SelectItem value="error">ERROR</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-40 h-10 text-sm">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="api">API Gateway</SelectItem>
            <SelectItem value="auth">Auth Service</SelectItem>
            <SelectItem value="db">Database</SelectItem>
            <SelectItem value="scheduler">Scheduler</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> INFO</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> WARN</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> ERROR</span>
        <span className="ml-auto">Showing 12 of 1,247 entries</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Level</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Service</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Message</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Duration</th>
                </tr>
              </thead>
              <tbody>
                {systemLogRows.map(([timestamp, level, service, message, duration], i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-2 px-3 font-mono text-muted-foreground whitespace-nowrap">{timestamp}</td>
                    <td className="py-2 px-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-1.5 ${
                          level === 'ERROR' ? 'text-red-600 border-red-300 bg-red-50' :
                          level === 'WARN' ? 'text-yellow-600 border-yellow-300 bg-yellow-50' :
                          'text-blue-600 border-blue-300 bg-blue-50'
                        }`}
                      >
                        {level}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 font-mono whitespace-nowrap">{service}</td>
                    <td className="py-2 px-3 max-w-xs truncate">{message}</td>
                    <td className="py-2 px-3 text-right text-muted-foreground whitespace-nowrap">{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SystemNotifications() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Management"
        description="Configure and monitor system-wide notifications"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Send Notification</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Sent" value="3,847" subtitle="Last 30 days" icon={<Bell className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Email Delivered" value="2,156" subtitle="98.2% delivery rate" icon={<Mail className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="SMS Sent" value="847" subtitle="Critical alerts" icon={<Globe className="h-5 w-5" />} color="bg-violet-100 text-violet-700" />
        <StatCard title="Push Delivered" value="844" subtitle="Browser notifications" icon={<Zap className="h-5 w-5" />} color="bg-rose-100 text-rose-700" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Notification Channels Status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Email (SMTP)', status: 'Degraded', desc: 'smtp.police.go.tz:587 — Intermittent timeouts' },
            { name: 'SMS Gateway', status: 'Connected', desc: 'Vodacom Tanzania API — Active' },
            { name: 'Push Notifications', status: 'Connected', desc: 'Web Push API — Active' },
            { name: 'In-App', status: 'Connected', desc: 'Real-time via WebSocket' },
          ].map((ch) => (
            <div key={ch.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">{ch.name}</p>
                <p className="text-xs text-muted-foreground">{ch.desc}</p>
              </div>
              <Badge variant={ch.status === 'Connected' ? 'default' : 'secondary'} className="text-[10px] shrink-0">{ch.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <DataTable
        title="Recent Notifications"
        columns={['Time', 'Subject', 'Category', 'Audience', 'Status']}
        rows={notificationRows}
        maxRows={8}
      />
    </div>
  );
}

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="Configure system-level parameters" />

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="caching">Caching</TabsTrigger>
          <TabsTrigger value="logging">Logging</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Performance Tuning</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Max Concurrent Requests</Label>
                  <Input type="number" defaultValue="1000" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Request Timeout (ms)</Label>
                  <Input type="number" defaultValue="30000" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Worker Threads</Label>
                  <Input type="number" defaultValue="4" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Max Payload Size (MB)</Label>
                  <Input type="number" defaultValue="10" className="h-9 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Response Compression</p>
                  <p className="text-xs text-muted-foreground">Enable gzip compression for API responses</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Save & Restart</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Database Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Connection Pool Size</Label>
                  <Input type="number" defaultValue="50" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Connection Timeout (ms)</Label>
                  <Input type="number" defaultValue="5000" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Query Timeout (ms)</Label>
                  <Input type="number" defaultValue="30000" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Auto Vacuum Interval (hrs)</Label>
                  <Input type="number" defaultValue="24" className="h-9 text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Query Logging</p>
                  <p className="text-xs text-muted-foreground">Log all database queries for debugging</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Slow Query Alert</p>
                  <p className="text-xs text-muted-foreground">Alert on queries exceeding 1000ms</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caching" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Cache Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Cache Type</Label>
                  <Select defaultValue="memory">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="memory">In-Memory</SelectItem>
                      <SelectItem value="redis">Redis (Not Available)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Default TTL (minutes)</Label>
                  <Input type="number" defaultValue="60" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Max Cache Size (MB)</Label>
                  <Input type="number" defaultValue="256" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Cache Hit Rate</Label>
                  <Input defaultValue="94.2%" className="h-9 text-sm" disabled />
                </div>
              </div>
              <Button size="sm" variant="outline"><RotateCcw className="h-4 w-4 mr-1.5" /> Clear Cache</Button>
              <Button size="sm" className="ml-2"><Save className="h-4 w-4 mr-1.5" /> Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logging" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Logging Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Log Level</Label>
                  <Select defaultValue="info">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Log Retention (days)</Label>
                  <Input type="number" defaultValue="30" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Max Log File Size (MB)</Label>
                  <Input type="number" defaultValue="100" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Log Format</Label>
                  <Select defaultValue="json">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="text">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Structured Logging</p>
                  <p className="text-xs text-muted-foreground">Include request ID, user, and timestamp</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button size="sm"><Save className="h-4 w-4 mr-1.5" /> Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const SystemProfile = AdminProfile;