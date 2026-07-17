'use client';

import React, { useState } from 'react';
import { StatCard, DataTable, PageHeader, SearchBar, ChartPlaceholder, ActivityFeed } from '@/components/shared/layout-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search, Car, User, Shield, FileText, AlertTriangle, DollarSign, Activity,
  MapPin, Calendar, Clock, Eye, Plus, Download, Settings, Bell, ChevronRight,
  Phone, Home, UserCheck, UserX, TrendingUp, BarChart3, FileCheck, FileWarning,
  Gavel, Radio, ClipboardList, Truck, Wrench, CheckCircle2, XCircle, ArrowRight,
  Navigation, Flag, Heart, ExternalLink, RefreshCw, Filter, MoreVertical,
  IdCard, CreditCard, Printer, Send, Camera, MessageSquare, Star, Zap, Target
} from 'lucide-react';

// ============================================================
// MOCK DATA — Tanzania Police
// ============================================================

const mockCitizens = [
  { id: '1', fullName: 'Josephat Mwangi Kamau', nidaNumber: '1990123456789001', dob: '1990-05-14', gender: 'Male', phone: '+255 712 345 678', address: '456 Uhuru Street, Kinondoni', region: 'Dar es Salaam', hasWarrant: false, warrantType: null },
  { id: '2', fullName: 'Amina Hassan Mohamed', nidaNumber: '1985123456789002', dob: '1985-11-22', gender: 'Female', phone: '+255 789 012 345', address: '12 Kijitonyama Road, Kijitonyama', region: 'Dar es Salaam', hasWarrant: false, warrantType: null },
  { id: '3', fullName: 'Peter Ochieng Odhiambo', nidaNumber: '1992123456789003', dob: '1992-03-08', gender: 'Male', phone: '+255 756 789 012', address: '789 Mandela Road, Sinza', region: 'Dar es Salaam', hasWarrant: true, warrantType: 'Arrest Warrant - Theft' },
  { id: '4', fullName: 'Fatma Ali Bakari', nidaNumber: '1988123456789004', dob: '1988-07-30', gender: 'Female', phone: '+255 713 456 789', address: '234 Market Street, Mwanza', region: 'Mwanza', hasWarrant: false, warrantType: null },
  { id: '5', fullName: 'Daniel Richard Lema', nidaNumber: '1995123456789005', dob: '1995-01-19', gender: 'Male', phone: '+255 687 234 567', address: '567 Sokoine Avenue, Arusha', region: 'Arusha', hasWarrant: true, warrantType: 'Search Warrant - Fraud' },
  { id: '6', fullName: 'Grace Ntuli Mushi', nidaNumber: '1991123456789006', dob: '1991-09-12', gender: 'Female', phone: '+255 654 321 098', address: '890 Independence Ave, Dodoma', region: 'Dodoma', hasWarrant: false, warrantType: null },
  { id: '7', fullName: 'Ahmed Juma Moyo', nidaNumber: '1987123456789007', dob: '1987-04-25', gender: 'Male', phone: '+255 765 890 123', address: '321 Pugu Road, Ilala', region: 'Dar es Salaam', hasWarrant: false, warrantType: null },
  { id: '8', fullName: 'Sarah Kimaro Ngowi', nidaNumber: '1993123456789008', dob: '1993-12-03', gender: 'Female', phone: '+255 621 567 890', address: '654 Nyerere Road, Temeke', region: 'Dar es Salaam', hasWarrant: true, warrantType: 'Arrest Warrant - Assault' },
];

const mockVehicles = [
  { id: '1', plateNumber: 'T 234 ABC', make: 'Toyota', model: 'Corolla', year: 2019, color: 'White', ownerName: 'Josephat Mwangi Kamau', ownerNida: '1990123456789001', insuranceExpiry: '2025-08-15', lastInspection: '2024-11-20', status: 'active', isStolen: false, isWanted: false },
  { id: '2', plateNumber: 'T 567 DEF', make: 'Honda', model: 'CR-V', year: 2021, color: 'Silver', ownerName: 'Amina Hassan Mohamed', ownerNida: '1985123456789002', insuranceExpiry: '2025-03-01', lastInspection: '2024-09-10', status: 'active', isStolen: false, isWanted: false },
  { id: '3', plateNumber: 'T 890 GHI', make: 'Toyota', model: 'Hilux', year: 2017, color: 'Black', ownerName: 'Peter Ochieng Odhiambo', ownerNida: '1992123456789003', insuranceExpiry: '2024-06-30', lastInspection: '2023-05-15', status: 'expired-insurance', isStolen: true, isWanted: true },
  { id: '4', plateNumber: 'T 123 JKL', make: 'Nissan', model: 'X-Trail', year: 2020, color: 'Blue', ownerName: 'Fatma Ali Bakari', ownerNida: '1988123456789004', insuranceExpiry: '2025-12-20', lastInspection: '2024-10-05', status: 'active', isStolen: false, isWanted: false },
  { id: '5', plateNumber: 'T 456 MNO', make: 'Mitsubishi', model: 'Canter', year: 2016, color: 'Red', ownerName: 'Daniel Richard Lema', ownerNida: '1995123456789005', insuranceExpiry: '2025-05-10', lastInspection: '2024-07-22', status: 'active', isStolen: false, isWanted: false },
  { id: '6', plateNumber: 'T 789 PQR', make: 'Toyota', model: 'Land Cruiser', year: 2022, color: 'Dark Green', ownerName: 'Ahmed Juma Moyo', ownerNida: '1987123456789007', insuranceExpiry: '2026-01-15', lastInspection: '2025-01-08', status: 'active', isStolen: false, isWanted: false },
  { id: '7', plateNumber: 'K 321 STU', make: 'Isuzu', model: 'NPR', year: 2015, color: 'White', ownerName: 'TransCity Logistics Ltd', ownerNida: 'N/A', insuranceExpiry: '2024-12-31', lastInspection: '2024-06-18', status: 'expired-inspection', isStolen: false, isWanted: false },
];

const mockOfficers = [
  { id: '1', badgeNumber: 'TP-4521', fullName: 'Sgt. James Mlay', rank: 'Sergeant', station: 'Kinondoni Police Station', status: 'On Duty', phone: '+255 712 990 112', region: 'Dar es Salaam' },
  { id: '2', badgeNumber: 'TP-3890', fullName: 'Cpl. Rehema Said', rank: 'Corporal', station: 'Central Police Station', status: 'On Duty', phone: '+255 789 234 567', region: 'Dar es Salaam' },
  { id: '3', badgeNumber: 'TP-5612', fullName: 'Pte. David Mwenda', rank: 'Private', station: 'Mwanza Central', status: 'Off Duty', phone: '+255 756 890 123', region: 'Mwanza' },
  { id: '4', badgeNumber: 'TP-2201', fullName: 'Insp. Halima Juma', rank: 'Inspector', station: 'Arusha Regional HQ', status: 'On Leave', phone: '+255 687 345 678', region: 'Arusha' },
  { id: '5', badgeNumber: 'TP-7788', fullName: 'Sgt. Thomas Kagwa', rank: 'Sergeant', station: 'Kariakoo Police Post', status: 'On Duty', phone: '+255 654 456 789', region: 'Dar es Salaam' },
  { id: '6', badgeNumber: 'TP-1190', fullName: 'Cpl. Grace Temu', rank: 'Corporal', station: 'Dodoma Central', status: 'Suspended', phone: '+255 765 567 890', region: 'Dodoma' },
];

const violationTypes = [
  { id: 'v1', name: 'Speeding', code: 'TRF-001', fine: 30000 },
  { id: 'v2', name: 'No Driving License', code: 'TRF-002', fine: 50000 },
  { id: 'v3', name: 'No Seatbelt', code: 'TRF-003', fine: 10000 },
  { id: 'v4', name: 'Drunk Driving', code: 'TRF-004', fine: 200000 },
  { id: 'v5', name: 'Running Red Light', code: 'TRF-005', fine: 30000 },
  { id: 'v6', name: 'Wrong Way Driving', code: 'TRF-006', fine: 40000 },
  { id: 'v7', name: 'No Insurance', code: 'TRF-007', fine: 100000 },
  { id: 'v8', name: 'Expired Inspection', code: 'TRF-008', fine: 50000 },
  { id: 'v9', name: 'Using Phone While Driving', code: 'TRF-009', fine: 20000 },
  { id: 'v10', name: 'Overloading', code: 'TRF-010', fine: 50000 },
  { id: 'v11', name: 'No Reflectors', code: 'TRF-011', fine: 15000 },
  { id: 'v12', name: 'Tinted Windows (Non-Approved)', code: 'TRF-012', fine: 30000 },
];

const mockFines = [
  { id: 'F-2025-001', plateNumber: 'T 234 ABC', driverName: 'Josephat Mwangi Kamau', violation: 'Speeding', amount: 30000, status: 'Paid', date: '2025-01-15', paidAt: '2025-01-16' },
  { id: 'F-2025-002', plateNumber: 'T 567 DEF', driverName: 'Amina Hassan Mohamed', violation: 'No Seatbelt', amount: 10000, status: 'Pending', date: '2025-01-18', paidAt: null },
  { id: 'F-2025-003', plateNumber: 'T 890 GHI', driverName: 'Peter Ochieng Odhiambo', violation: 'No Insurance', amount: 100000, status: 'Overdue', date: '2024-12-20', paidAt: null },
  { id: 'F-2025-004', plateNumber: 'T 456 MNO', driverName: 'Daniel Richard Lema', violation: 'Overloading', amount: 50000, status: 'Paid', date: '2025-01-10', paidAt: '2025-01-12' },
  { id: 'F-2025-005', plateNumber: 'K 321 STU', driverName: 'TransCity Logistics Ltd', violation: 'Expired Inspection', amount: 50000, status: 'Pending', date: '2025-01-20', paidAt: null },
  { id: 'F-2025-006', plateNumber: 'T 789 PQR', driverName: 'Ahmed Juma Moyo', violation: 'Using Phone While Driving', amount: 20000, status: 'Paid', date: '2025-01-22', paidAt: '2025-01-22' },
  { id: 'F-2025-007', plateNumber: 'T 123 JKL', driverName: 'Fatma Ali Bakari', violation: 'Running Red Light', amount: 30000, status: 'Pending', date: '2025-01-23', paidAt: null },
];

const mockCheckpoints = [
  { id: '1', name: 'Ubungo Intersection', location: 'Morogoro Rd / Sam Nujoma Rd', status: 'Active', officers: 4, vehiclesChecked: 142, violationsFound: 18, startTime: '06:00' },
  { id: '2', name: 'Kivukoni Crossing', location: 'Sokoine Dr / Kivukoni Front', status: 'Active', officers: 3, vehiclesChecked: 98, violationsFound: 11, startTime: '07:00' },
  { id: '3', name: 'Mbagala Rangi Tatu', location: 'Nyerere Rd / Mbagala Rd', status: 'Active', officers: 2, vehiclesChecked: 67, violationsFound: 8, startTime: '08:00' },
  { id: '4', name: 'Tegeta Roundabout', location: 'Bagamoyo Rd / New Bagamoyo Rd', status: 'Completed', officers: 3, vehiclesChecked: 189, violationsFound: 24, startTime: '05:30' },
  { id: '5', name: 'Mwenge Junction', location: 'Ali Hassan Mwinyi Rd / Mwenge Rd', status: 'Completed', officers: 2, vehiclesChecked: 76, violationsFound: 9, startTime: '06:30' },
];

const mockCases = [
  { id: 'CASE-2025-0042', title: 'Theft at Kariakoo Market', type: 'Theft', status: 'Open', officer: 'Sgt. James Mlay', date: '2025-01-18', priority: 'High' },
  { id: 'CASE-2025-0039', title: 'Assault - Sinza Residential', type: 'Assault', status: 'Under Investigation', officer: 'Cpl. Rehema Said', date: '2025-01-15', priority: 'Medium' },
  { id: 'CASE-2025-0035', title: 'Burglary - Mikocheni B', type: 'Burglary', status: 'Open', officer: 'Sgt. Thomas Kagwa', date: '2025-01-12', priority: 'High' },
  { id: 'CASE-2025-0031', title: 'Fraud - Business Dispute', type: 'Fraud', status: 'Closed', officer: 'Insp. Halima Juma', date: '2025-01-08', priority: 'Low' },
  { id: 'CASE-2025-0028', title: 'Vandalism - Public Property', type: 'Vandalism', status: 'Under Investigation', officer: 'Cpl. Grace Temu', date: '2025-01-05', priority: 'Medium' },
  { id: 'CASE-2025-0022', title: 'Robbery - CBD Night Incident', type: 'Robbery', status: 'Open', officer: 'Sgt. James Mlay', date: '2024-12-28', priority: 'Critical' },
  { id: 'CASE-2025-0018', title: 'Domestic Violence Report', type: 'DV', status: 'Closed', officer: 'Cpl. Rehema Said', date: '2024-12-22', priority: 'High' },
];

// ============================================================
// SHARED SEARCH COMPONENTS
// ============================================================

export function CitizenSearchPage() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<typeof mockCitizens>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setHasSearched(true);
    // Simulate search delay
    setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = mockCitizens.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.nidaNumber.includes(q) ||
          c.phone.includes(q)
      );
      setResults(filtered);
      setSearching(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Citizen Search" description="Search citizens by name, NIDA number, or phone number" />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter name, NIDA number, or phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching || !query.trim()}>
              {searching ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Quick filters:</span>
            {['Wanted Only', 'With Warrants'].map((f) => (
              <Badge key={f} variant="outline" className="text-xs cursor-pointer hover:bg-muted/50">
                {f}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {searching && (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Searching citizen database...</p>
        </div>
      )}

      {!searching && hasSearched && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <UserX className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">No citizens found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search terms</p>
          </CardContent>
        </Card>
      )}

      {!searching && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          {results.map((citizen) => (
            <Card key={citizen.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex items-center gap-4 p-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={citizen.gender === 'Female' ? 'bg-pink-100 text-pink-700' : 'bg-sky-100 text-sky-700'}>
                        {citizen.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{citizen.fullName}</h3>
                        {citizen.hasWarrant && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            WANTED — {citizen.warrantType}
                          </Badge>
                        )}
                        {!citizen.hasWarrant && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Clear
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <IdCard className="h-3 w-3" />
                          <span>NIDA: <span className="font-mono text-foreground">{citizen.nidaNumber}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>DOB: {citizen.dob}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span>{citizen.gender} · {citizen.region}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          <span>{citizen.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Home className="h-3 w-3" />
                        <span>{citizen.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center justify-center gap-2 p-3 bg-muted/30 border-t sm:border-t-0 sm:border-l sm:w-24">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!hasSearched && !searching && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">Search for a citizen</p>
            <p className="text-sm text-muted-foreground mt-1">Enter a name, NIDA number, or phone number to begin</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function VehicleSearchPage() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<typeof mockVehicles>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setHasSearched(true);
    setTimeout(() => {
      const q = query.toUpperCase().replace(/\s+/g, '');
      const filtered = mockVehicles.filter(
        (v) =>
          v.plateNumber.toUpperCase().replace(/\s+/g, '').includes(q) ||
          v.make.toUpperCase().includes(query.toUpperCase()) ||
          v.model.toUpperCase().includes(query.toUpperCase()) ||
          v.ownerName.toUpperCase().includes(query.toUpperCase())
      );
      setResults(filtered);
      setSearching(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicle Search" description="Search vehicles by plate number, make, model, or owner name" />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter plate number (e.g. T 234 ABC)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 uppercase"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching || !query.trim()}>
              {searching ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Quick filters:</span>
            {['Stolen Only', 'No Insurance', 'Expired Inspection'].map((f) => (
              <Badge key={f} variant="outline" className="text-xs cursor-pointer hover:bg-muted/50">
                {f}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {searching && (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Searching vehicle database...</p>
        </div>
      )}

      {!searching && hasSearched && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">No vehicles found</p>
            <p className="text-sm text-muted-foreground mt-1">Check the plate number and try again</p>
          </CardContent>
        </Card>
      )}

      {!searching && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
          {results.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex items-center gap-4 p-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Car className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm font-mono">{vehicle.plateNumber}</h3>
                        {vehicle.isStolen && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            STOLEN
                          </Badge>
                        )}
                        {vehicle.isWanted && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <Gavel className="h-3 w-3" />
                            WANTED
                          </Badge>
                        )}
                        {!vehicle.isStolen && !vehicle.isWanted && vehicle.status === 'active' && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Clear
                          </Badge>
                        )}
                        {vehicle.status === 'expired-insurance' && (
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                            <XCircle className="h-3 w-3 mr-1" />
                            Insurance Expired
                          </Badge>
                        )}
                        {vehicle.status === 'expired-inspection' && (
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                            <Wrench className="h-3 w-3 mr-1" />
                            Inspection Expired
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Car className="h-3 w-3" />
                          <span>{vehicle.color} {vehicle.make} {vehicle.model} ({vehicle.year})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span>Owner: <span className="text-foreground">{vehicle.ownerName}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-3 w-3" />
                          <span>Insurance: <span className={isExpired(vehicle.insuranceExpiry) ? 'text-red-600 font-medium' : 'text-foreground'}>{vehicle.insuranceExpiry}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wrench className="h-3 w-3" />
                          <span>Last Inspection: <span className="text-foreground">{vehicle.lastInspection}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center justify-center gap-2 p-3 bg-muted/30 border-t sm:border-t-0 sm:border-l sm:w-24">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!hasSearched && !searching && (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">Search for a vehicle</p>
            <p className="text-sm text-muted-foreground mt-1">Enter a plate number, make, model, or owner name to begin</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// TRAFFIC OFFICER PAGES (11)
// ============================================================

export function TrafficDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Traffic Dashboard" description="Overview of today's traffic operations" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="Stops Today"
          value={47}
          subtitle="+12% from yesterday"
          icon={<Navigation className="h-5 w-5" />}
          trend={{ value: 12, label: 'vs yesterday' }}
          color="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          title="Violations Issued"
          value={23}
          subtitle="7 serious"
          icon={<FileWarning className="h-5 w-5" />}
          trend={{ value: 8, label: 'vs yesterday' }}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          title="Fines Collected"
          value="TZS 620K"
          subtitle="Of TZS 1.2M issued"
          icon={<DollarSign className="h-5 w-5" />}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          title="Accidents"
          value={2}
          subtitle="1 serious, 1 minor"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="bg-red-100 text-red-700"
        />
        <StatCard
          title="Active Checkpoints"
          value={3}
          subtitle="12 officers deployed"
          icon={<Flag className="h-5 w-5" />}
          color="bg-sky-100 text-sky-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Violations This Week" type="bar" />
        <ChartPlaceholder title="Fine Collection Trend" type="line" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DataTable
          title="Recent Violations"
          columns={['Time', 'Plate', 'Violation', 'Fine']}
          rows={[
            ['14:32', 'T 234 ABC', 'Speeding', 'TZS 30,000'],
            ['13:45', 'T 567 DEF', 'No Seatbelt', 'TZS 10,000'],
            ['12:18', 'T 890 GHI', 'No Insurance', 'TZS 100,000'],
            ['11:50', 'T 456 MNO', 'Overloading', 'TZS 50,000'],
            ['10:22', 'K 321 STU', 'Expired Inspection', 'TZS 50,000'],
            ['09:15', 'T 789 PQR', 'Phone While Driving', 'TZS 20,000'],
          ]}
        />
        <ActivityFeed
          items={[
            { id: '1', title: 'Checkpoint activated', description: 'Ubungo Intersection - 4 officers deployed', time: '06:00', type: 'success' },
            { id: '2', title: 'Citation issued', description: 'Speeding - T 234 ABC at Morogoro Rd', time: '14:32', type: 'warning' },
            { id: '3', title: 'Accident reported', description: 'Minor collision at Kivukoni Crossing', time: '13:15', type: 'danger' },
            { id: '4', title: 'Fine collected', description: 'TZS 30,000 - Josephat Mwangi', time: '12:45', type: 'success' },
            { id: '5', title: 'Stolen vehicle alert', description: 'T 890 GHI spotted near Mbagala', time: '11:30', type: 'danger' },
            { id: '6', title: 'Checkpoint completed', description: 'Tegeta Roundabout - 189 vehicles checked', time: '10:00', type: 'info' },
          ]}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Top Violation Types Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { type: 'Speeding', count: 8, pct: 35, color: 'bg-red-500' },
              { type: 'No Seatbelt', count: 5, pct: 22, color: 'bg-amber-500' },
              { type: 'Expired Insurance', count: 4, pct: 17, color: 'bg-orange-500' },
              { type: 'Phone While Driving', count: 3, pct: 13, color: 'bg-purple-500' },
              { type: 'Overloading', count: 3, pct: 13, color: 'bg-blue-500' },
            ].map((v) => (
              <div key={v.type} className="flex items-center gap-3">
                <span className="text-xs w-36 shrink-0">{v.type}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${v.color} rounded-full`} style={{ width: `${v.pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">{v.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TrafficStopPage() {
  const [plateInput, setPlateInput] = useState('');
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [lookupDone, setLookupDone] = useState(false);

  const toggleViolation = (id: string) => {
    setSelectedViolations((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const totalFine = violationTypes
    .filter((v) => selectedViolations.includes(v.id))
    .reduce((sum, v) => sum + v.fine, 0);

  const handleLookup = () => {
    if (plateInput.trim()) setLookupDone(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="New Traffic Stop" description="Record a traffic stop and issue citation" />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicle Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="plate-input">Plate Number</Label>
              <Input
                id="plate-input"
                placeholder="e.g. T 234 ABC"
                value={plateInput}
                onChange={(e) => { setPlateInput(e.target.value.toUpperCase()); setLookupDone(false); }}
                className="mt-1 uppercase font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleLookup} disabled={!plateInput.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Lookup
              </Button>
            </div>
          </div>

          {lookupDone && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3 border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm font-mono">T 234 ABC</p>
                  <p className="text-xs text-muted-foreground">White Toyota Corolla 2019</p>
                </div>
                <Badge className="ml-auto bg-green-100 text-green-700 hover:bg-green-100">Registered</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Owner:</span> <span className="font-medium">Josephat Mwangi Kamau</span></div>
                <div><span className="text-muted-foreground">NIDA:</span> <span className="font-mono">1990123456789001</span></div>
                <div><span className="text-muted-foreground">Insurance:</span> <span className="text-green-600">Valid until 2025-08-15</span></div>
                <div><span className="text-muted-foreground">Inspection:</span> <span className="text-green-600">Last: 2024-11-20</span></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileWarning className="h-4 w-4" />
            Violations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {violationTypes.map((v) => (
              <div
                key={v.id}
                onClick={() => toggleViolation(v.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedViolations.includes(v.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={selectedViolations.includes(v.id)}
                  onCheckedChange={() => toggleViolation(v.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{v.name}</p>
                  <p className="text-[10px] text-muted-foreground">{v.code}</p>
                </div>
                <span className="text-xs font-mono font-medium whitespace-nowrap">TZS {v.fine.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {selectedViolations.length > 0 && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">{selectedViolations.length} violation(s) selected</span>
              <span className="text-sm font-bold">Total: TZS {totalFine.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Officer Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add notes about this traffic stop..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1" disabled={selectedViolations.length === 0}>
          <FileText className="h-4 w-4 mr-2" />
          Issue Citation (TZS {totalFine.toLocaleString()})
        </Button>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>
    </div>
  );
}

export function TrafficCitizenSearch() {
  return (
    <div className="space-y-4">
      <PageHeader title="Search Citizen" description="Look up citizen information for traffic enforcement" />
      <CitizenSearchPage />
    </div>
  );
}

export function TrafficVehicleSearch() {
  return (
    <div className="space-y-4">
      <PageHeader title="Search Vehicle" description="Look up vehicle information for traffic enforcement" />
      <VehicleSearchPage />
    </div>
  );
}

export function TrafficViolation() {
  const [selectedType, setSelectedType] = useState('');
  const [fineAmount, setFineAmount] = useState('');

  const handleTypeChange = (val: string) => {
    setSelectedType(val);
    const violation = violationTypes.find((v) => v.id === val);
    if (violation) setFineAmount(violation.fine.toString());
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Issue Violation" description="Create a new traffic violation record" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Driver & Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="violation-nida">Driver NIDA Number</Label>
              <Input id="violation-nida" placeholder="Enter NIDA number" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="violation-name">Driver Full Name</Label>
              <Input id="violation-name" placeholder="Enter full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="violation-plate">Vehicle Plate Number</Label>
              <Input id="violation-plate" placeholder="e.g. T 234 ABC" className="uppercase font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="violation-make">Vehicle Make</Label>
                <Input id="violation-make" placeholder="Toyota" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="violation-model">Vehicle Model</Label>
                <Input id="violation-model" placeholder="Corolla" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Violation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Violation Type</Label>
              <Select onValueChange={handleTypeChange} value={selectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select violation type" />
                </SelectTrigger>
                <SelectContent>
                  {violationTypes.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.code}) — TZS {v.fine.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="violation-fine">Fine Amount (TZS)</Label>
              <Input
                id="violation-fine"
                type="number"
                value={fineAmount}
                onChange={(e) => setFineAmount(e.target.value)}
                placeholder="Auto-filled or enter manually"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="violation-location">Location</Label>
              <Input id="violation-location" placeholder="e.g. Morogoro Rd, Ubungo" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="violation-notes">Officer Notes</Label>
              <Textarea id="violation-notes" placeholder="Describe the violation circumstances..." rows={3} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Issue Violation Notice
        </Button>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print Notice
        </Button>
      </div>
    </div>
  );
}

export function TrafficFine() {
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Paid' | 'Overdue'>('all');

  const filteredFines = filter === 'all' ? mockFines : mockFines.filter((f) => f.status === filter);
  const totalCollected = mockFines.filter((f) => f.status === 'Paid').reduce((s, f) => s + f.amount, 0);
  const totalOutstanding = mockFines.filter((f) => f.status !== 'Paid').reduce((s, f) => s + f.amount, 0);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'Pending': return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'Overdue': return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Fine Management" description="Track and manage traffic fines" />

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          title="Total Collected"
          value={`TZS ${(totalCollected / 1000).toFixed(0)}K`}
          icon={<DollarSign className="h-5 w-5" />}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          title="Outstanding"
          value={`TZS ${(totalOutstanding / 1000).toFixed(0)}K`}
          icon={<Clock className="h-5 w-5" />}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          title="Overdue"
          value={mockFines.filter((f) => f.status === 'Overdue').length.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="bg-red-100 text-red-700"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Issued Fines</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredFines.map((fine) => (
              <div key={fine.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{fine.id}</span>
                    {statusBadge(fine.status)}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Plate: </span>
                      <span className="font-mono font-medium">{fine.plateNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Driver: </span>
                      <span className="truncate">{fine.driverName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Violation: </span>
                      <span>{fine.violation}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount: </span>
                      <span className="font-medium">TZS {fine.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {fine.status !== 'Paid' && (
                  <Button size="sm" className="shrink-0">
                    <DollarSign className="h-3.5 w-3.5 mr-1" />
                    Collect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TrafficAccidentReport() {
  const [vehicles, setVehicles] = useState(['']);

  const addVehicle = () => setVehicles([...vehicles, '']);
  const removeVehicle = (idx: number) => setVehicles(vehicles.filter((_, i) => i !== idx));
  const updateVehicle = (idx: number, val: string) => {
    const updated = [...vehicles];
    updated[idx] = val;
    setVehicles(updated);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Accident Report" description="File a new traffic accident report" />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="acc-loc">Location</Label>
              <Input id="acc-loc" placeholder="e.g. Morogoro Rd, near Ubungo" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-region">Region</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                <SelectContent>
                  {['Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Mbeya', 'Morogoro', 'Tanga', 'Zanzibar', 'Kilimanjaro', 'Iringa'].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-date">Date</Label>
              <Input id="acc-date" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-time">Time</Label>
              <Input id="acc-time" type="time" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicles Involved
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vehicles.map((v, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder={`Vehicle ${idx + 1} plate number (e.g. T 234 ABC)`}
                value={v}
                onChange={(e) => updateVehicle(idx, e.target.value)}
                className="uppercase font-mono flex-1"
              />
              {vehicles.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeVehicle(idx)}>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addVehicle}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Another Vehicle
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Casualties & Injuries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cas-fatal">Fatalities</Label>
              <Input id="cas-fatal" type="number" placeholder="0" min="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cas-serious">Serious Injuries</Label>
              <Input id="cas-serious" type="number" placeholder="0" min="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cas-minor">Minor Injuries</Label>
              <Input id="cas-minor" type="number" placeholder="0" min="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cas-none">Uninjured</Label>
              <Input id="cas-none" type="number" placeholder="0" min="0" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="acc-severity">Severity</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select severity level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="serious">Serious</SelectItem>
                <SelectItem value="fatal">Fatal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acc-desc">Accident Description</Label>
            <Textarea id="acc-desc" placeholder="Provide a detailed description of the accident, including road conditions, weather, and sequence of events..." rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acc-evidence">Evidence Notes</Label>
            <Textarea id="acc-evidence" placeholder="List any evidence collected - photos, witness statements, CCTV footage, etc." rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Diagram & Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Camera className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Tap to upload photos or sketch an accident diagram</p>
            <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG up to 10MB</p>
            <Button variant="outline" size="sm" className="mt-3">
              <Camera className="h-3.5 w-3.5 mr-1" />
              Take Photo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1">
          <Send className="h-4 w-4 mr-2" />
          Submit Accident Report
        </Button>
        <Button variant="outline">
          Save as Draft
        </Button>
      </div>
    </div>
  );
}

export function TrafficCheckpoint() {
  const [showLog, setShowLog] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Checkpoint Log"
        description="Manage active traffic checkpoints"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Checkpoint
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          title="Active Checkpoints"
          value={mockCheckpoints.filter((c) => c.status === 'Active').length}
          icon={<Flag className="h-5 w-5" />}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          title="Vehicles Checked"
          value={mockCheckpoints.reduce((s, c) => s + c.vehiclesChecked, 0)}
          icon={<Car className="h-5 w-5" />}
          color="bg-sky-100 text-sky-700"
        />
        <StatCard
          title="Violations Found"
          value={mockCheckpoints.reduce((s, c) => s + c.violationsFound, 0)}
          icon={<FileWarning className="h-5 w-5" />}
          color="bg-amber-100 text-amber-700"
        />
      </div>

      <div className="space-y-3">
        {mockCheckpoints.map((cp) => (
          <Card key={cp.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="flex items-start gap-4 p-4 flex-1">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${cp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    <Flag className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{cp.name}</h3>
                      <Badge className={cp.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-muted text-muted-foreground'}>
                        {cp.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {cp.location}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Shield className="h-3 w-3" />{cp.officers} officers</span>
                      <span className="flex items-center gap-1"><Car className="h-3 w-3" />{cp.vehiclesChecked} vehicles</span>
                      <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{cp.violationsFound} violations</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Started {cp.startTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center justify-center gap-2 p-3 bg-muted/30 border-t sm:border-t-0 sm:border-l sm:w-24">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowLog(!showLog)}>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Log
                  </Button>
                  {cp.status === 'Active' && (
                    <Button variant="ghost" size="sm" className="text-xs text-red-600">
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showLog && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Checkpoint Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              title=""
              columns={['Time', 'Checkpoint', 'Plate', 'Action', 'Result']}
              rows={[
                ['14:22', 'Ubungo Intersection', 'T 234 ABC', 'Stopped & Checked', 'Warning Issued'],
                ['14:15', 'Kivukoni Crossing', 'T 567 DEF', 'Stopped & Checked', 'Citation: No Seatbelt'],
                ['13:58', 'Mbagala Rangi Tatu', 'T 890 GHI', 'Stopped & Checked', 'Vehicle Impounded'],
                ['13:42', 'Ubungo Intersection', 'K 321 STU', 'Stopped & Checked', 'Citation: Overloading'],
                ['13:30', 'Kivukoni Crossing', 'T 789 PQR', 'Stopped & Checked', 'Clear - Released'],
              ]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function TrafficReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic Reports"
        description="View and generate traffic enforcement reports"
        actions={
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { title: 'Daily Violation Summary', date: 'Jan 24, 2025', type: 'Auto-generated', count: 23 },
          { title: 'Weekly Enforcement Report', date: 'Jan 20, 2025', type: 'Weekly', count: 156 },
          { title: 'Checkpoint Performance', date: 'Jan 18, 2025', type: 'Manual', count: 5 },
          { title: 'Fine Collection Report', date: 'Jan 15, 2025', type: 'Auto-generated', count: 89 },
          { title: 'Accident Summary - Jan', date: 'Jan 14, 2025', type: 'Monthly', count: 12 },
          { title: 'Hotspot Analysis - Q4', date: 'Jan 01, 2025', type: 'Quarterly', count: 45 },
        ].map((report, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className="text-[10px]">{report.type}</Badge>
              </div>
              <h3 className="text-sm font-semibold mb-1">{report.title}</h3>
              <p className="text-xs text-muted-foreground">{report.date}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-muted-foreground">{report.count} records</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TrafficSettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your traffic enforcement preferences" />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="citation">Citation</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Station Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Station Name</Label>
                <Input defaultValue="Kinondoni Traffic Unit" />
              </div>
              <div className="space-y-1.5">
                <Label>Station Code</Label>
                <Input defaultValue="KDU-TRF-001" disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Duty Shift</Label>
                <Select defaultValue="morning">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (06:00 - 14:00)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (14:00 - 22:00)</SelectItem>
                    <SelectItem value="night">Night (22:00 - 06:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Stolen vehicle alerts', desc: 'Get notified when stolen vehicles are spotted', defaultChecked: true },
                { label: 'Wanted person alerts', desc: 'Get notified when wanted persons are identified', defaultChecked: true },
                { label: 'Fine payment updates', desc: 'Notifications when fines are paid', defaultChecked: false },
                { label: 'Checkpoint reminders', desc: 'Reminders for scheduled checkpoints', defaultChecked: true },
                { label: 'Accident reports', desc: 'New accident reports in your area', defaultChecked: true },
              ].map((pref, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Checkbox defaultChecked={pref.defaultChecked} id={`notif-${idx}`} className="mt-0.5" />
                  <div>
                    <Label htmlFor={`notif-${idx}`} className="text-sm font-medium cursor-pointer">{pref.label}</Label>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="citation" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Citation Defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Default Fine Currency</Label>
                <Select defaultValue="tzs">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tzs">Tanzanian Shilling (TZS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Auto-print citations</Label>
                <Select defaultValue="no">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes - Always print</SelectItem>
                    <SelectItem value="no">No - Ask each time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox defaultChecked id="cite-photo" className="mt-0.5" />
                <div>
                  <Label htmlFor="cite-photo" className="text-sm font-medium cursor-pointer">Require photo evidence</Label>
                  <p className="text-xs text-muted-foreground">Require a photo before issuing citation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function TrafficProfile() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Your traffic officer profile and performance" />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">JM</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-lg font-bold">Sgt. James Mlay</h2>
              <p className="text-sm text-muted-foreground">Badge: TP-4521 · Traffic Enforcement Unit</p>
              <p className="text-sm text-muted-foreground">Kinondoni Police Station, Dar es Salaam</p>
              <div className="flex items-center gap-2 justify-center sm:justify-start mt-2">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">On Duty</Badge>
                <Badge variant="outline">Morning Shift</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="This Month Stops" value={312} icon={<Navigation className="h-5 w-5" />} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Violations Issued" value={156} icon={<FileWarning className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="Fines Collected" value="TZS 2.4M" icon={<DollarSign className="h-5 w-5" />} color="bg-green-100 text-green-700" />
        <StatCard title="Rating" value="4.7" subtitle="Excellent" icon={<Star className="h-5 w-5" />} color="bg-yellow-100 text-yellow-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input defaultValue="Sgt. James Mlay" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input defaultValue="+255 712 990 112" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input defaultValue="j.mlay@police.go.tz" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Performance This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPlaceholder title="" type="bar" height="h-40" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// GENERAL OFFICER PAGES (8)
// ============================================================

export function GeneralDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="General Duty Dashboard" description="Overview of your duty activities" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Incidents Today"
          value={8}
          subtitle="3 pending response"
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={{ value: 15, label: 'vs yesterday' }}
          color="bg-red-100 text-red-700"
        />
        <StatCard
          title="Open Cases"
          value={14}
          subtitle="4 under investigation"
          icon={<FileText className="h-5 w-5" />}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          title="Arrests This Week"
          value={5}
          subtitle="2 pending court"
          icon={<UserCheck className="h-5 w-5" />}
          color="bg-purple-100 text-purple-700"
        />
        <StatCard
          title="Reports Filed"
          value={22}
          subtitle="This month"
          icon={<ClipboardList className="h-5 w-5" />}
          trend={{ value: 8, label: 'vs last month' }}
          color="bg-sky-100 text-sky-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPlaceholder title="Incidents This Month" type="bar" />
        <ChartPlaceholder title="Case Resolution Rate" type="line" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DataTable
          title="Recent Incidents"
          columns={['Time', 'Type', 'Location', 'Status']}
          rows={[
            ['15:30', 'Theft', 'Kariakoo Market', 'In Progress'],
            ['14:15', 'Assault', 'Sinza B', 'Pending'],
            ['12:45', 'Burglary', 'Mikocheni', 'Under Investigation'],
            ['11:20', 'Fraud', 'CBD Office', 'Reported'],
            ['09:50', 'Disturbance', 'Mwenge Area', 'Resolved'],
            ['08:30', 'Vandalism', 'Public Park', 'Under Investigation'],
          ]}
        />
        <ActivityFeed
          items={[
            { id: '1', title: 'New incident reported', description: 'Theft at Kariakoo Market - shop owner', time: '15:30', type: 'danger' },
            { id: '2', title: 'Arrest made', description: 'Suspect apprehended for burglary in Mikocheni', time: '13:20', type: 'success' },
            { id: '3', title: 'Case assigned', description: 'CASE-2025-0042 assigned to you', time: '11:00', type: 'info' },
            { id: '4', title: 'Report submitted', description: 'Incident report #IR-2025-0188 filed', time: '10:45', type: 'success' },
            { id: '5', title: 'Warrant alert', description: 'Wanted person spotted near Temeke', time: '09:30', type: 'warning' },
            { id: '6', title: 'Shift started', description: 'Morning shift commenced at 08:00', time: '08:00', type: 'info' },
          ]}
        />
      </div>
    </div>
  );
}

export function GeneralCitizenSearch() {
  return (
    <div className="space-y-4">
      <PageHeader title="Search Citizen" description="Look up citizen information" />
      <CitizenSearchPage />
    </div>
  );
}

export function GeneralOfficerSearch() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<typeof mockOfficers>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setHasSearched(true);
    setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = mockOfficers.filter(
        (o) =>
          o.fullName.toLowerCase().includes(q) ||
          o.badgeNumber.toLowerCase().includes(q)
      );
      setResults(filtered);
      setSearching(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'On Duty': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'Off Duty': return 'bg-gray-100 text-gray-600 hover:bg-gray-100';
      case 'On Leave': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'Suspended': return 'bg-red-100 text-red-700 hover:bg-red-100';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Officer Search" description="Search officers by name or badge number" />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter officer name or badge number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching || !query.trim()}>
              {searching ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Quick filters:</span>
            {['On Duty Only', 'My Station', 'Same Region'].map((f) => (
              <Badge key={f} variant="outline" className="text-xs cursor-pointer hover:bg-muted/50">
                {f}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {searching && (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Searching officer records...</p>
        </div>
      )}

      {!searching && hasSearched && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">No officers found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search terms</p>
          </CardContent>
        </Card>
      )}

      {!searching && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{results.length} officer{results.length !== 1 ? 's' : ''} found</p>
          {results.map((officer) => (
            <Card key={officer.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex items-center gap-4 p-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {officer.fullName.split(' ').filter((_, i) => i > 0).map((n) => n[0]).slice(0, 2).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{officer.fullName}</h3>
                        <Badge className={statusColor(officer.status)}>{officer.status}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3 w-3" />
                          <span>Badge: <span className="font-mono text-foreground">{officer.badgeNumber}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3 w-3" />
                          <span>Rank: <span className="text-foreground">{officer.rank}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          <span>{officer.station}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          <span>{officer.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span>Region: {officer.region}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center justify-center gap-2 p-3 bg-muted/30 border-t sm:border-t-0 sm:border-l sm:w-24">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!hasSearched && !searching && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium">Search for an officer</p>
            <p className="text-sm text-muted-foreground mt-1">Enter a name or badge number to begin</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function GeneralIncidentReport() {
  const [parties, setParties] = useState(['']);

  const addParty = () => setParties([...parties, '']);
  const removeParty = (idx: number) => setParties(parties.filter((_, i) => i !== idx));
  const updateParty = (idx: number, val: string) => {
    const updated = [...parties];
    updated[idx] = val;
    setParties(updated);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="New Incident Report" description="File a new incident report" />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Incident Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Incident Type</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select incident type" /></SelectTrigger>
                <SelectContent>
                  {['Theft', 'Assault', 'Burglary', 'Robbery', 'Fraud', 'Vandalism', 'Domestic Violence', 'Disturbance', 'Drug Offense', 'Missing Person', 'Other'].map((t) => (
                    <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input placeholder="e.g. Kariakoo Market, Shop No. 45" />
            </div>
            <div className="space-y-1.5">
              <Label>Region</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                <SelectContent>
                  {['Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Mbeya', 'Morogoro', 'Tanga', 'Zanzibar', 'Kilimanjaro', 'Iringa', 'Kagera', 'Kigoma'].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Incident Description</Label>
            <Textarea placeholder="Provide a detailed description of what happened. Include timeline of events, circumstances, and any relevant details..." rows={5} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Involved Parties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {parties.map((p, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder={`Party ${idx + 1} — name, NIDA, or description`}
                value={p}
                onChange={(e) => updateParty(idx, e.target.value)}
                className="flex-1"
              />
              {parties.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeParty(idx)}>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addParty}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Another Party
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Evidence Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea placeholder="Document any evidence collected — witness statements, CCTV footage, physical evidence, photos taken, etc." rows={3} />
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Camera className="h-6 w-6 mx-auto text-muted-foreground/40 mb-1" />
            <p className="text-xs text-muted-foreground">Tap to upload evidence photos</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Camera className="h-3.5 w-3.5 mr-1" />
              Take Photo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1">
          <Send className="h-4 w-4 mr-2" />
          Submit Report
        </Button>
        <Button variant="outline">
          Save as Draft
        </Button>
      </div>
    </div>
  );
}

// Need Users icon for involved parties section
const Users = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export function GeneralCaseFile() {
  const [filter, setFilter] = useState<'all' | 'Open' | 'Under Investigation' | 'Closed'>('all');

  const filteredCases = filter === 'all' ? mockCases : mockCases.filter((c) => c.status === filter);

  const statusVariant = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'Under Investigation': return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
      case 'Closed': return 'bg-green-100 text-green-700 hover:bg-green-100';
      default: return '';
    }
  };

  const priorityVariant = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive' as const;
      case 'High': return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'Medium': return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
      case 'Low': return 'secondary' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Case Files"
        description="Manage your assigned cases"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Total Cases" value={mockCases.length} icon={<FileText className="h-5 w-5" />} color="bg-sky-100 text-sky-700" />
        <StatCard title="Open" value={mockCases.filter((c) => c.status === 'Open').length} icon={<AlertTriangle className="h-5 w-5" />} color="bg-red-100 text-red-700" />
        <StatCard title="Investigating" value={mockCases.filter((c) => c.status === 'Under Investigation').length} icon={<Search className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="Closed" value={mockCases.filter((c) => c.status === 'Closed').length} icon={<CheckCircle2 className="h-5 w-5" />} color="bg-green-100 text-green-700" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">All Cases</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCases.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                    <Badge className={statusVariant(c.status)}>{c.status}</Badge>
                    <Badge variant={priorityVariant(c.priority)}>{c.priority}</Badge>
                  </div>
                  <h3 className="text-sm font-medium truncate">{c.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><FileWarning className="h-3 w-3" />{c.type}</span>
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" />{c.officer}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{c.date}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function GeneralReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View and generate duty reports"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { title: 'Daily Incident Summary', date: 'Jan 24, 2025', type: 'Auto-generated', count: 8, icon: <AlertTriangle className="h-4 w-4 text-red-600" /> },
          { title: 'Weekly Case Progress', date: 'Jan 20, 2025', type: 'Weekly', count: 14, icon: <FileText className="h-4 w-4 text-amber-600" /> },
          { title: 'Arrest Report - January', date: 'Jan 18, 2025', type: 'Monthly', count: 5, icon: <UserCheck className="h-4 w-4 text-purple-600" /> },
          { title: 'Crime Statistics - Q4 2024', date: 'Jan 05, 2025', type: 'Quarterly', count: 142, icon: <BarChart3 className="h-4 w-4 text-sky-600" /> },
          { title: 'Sector Patrol Log', date: 'Jan 15, 2025', type: 'Manual', count: 31, icon: <Navigation className="h-4 w-4 text-green-600" /> },
          { title: 'Evidence Chain of Custody', date: 'Jan 12, 2025', type: 'Manual', count: 23, icon: <FileCheck className="h-4 w-4 text-orange-600" /> },
        ].map((report, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                  {report.icon}
                </div>
                <Badge variant="outline" className="text-[10px]">{report.type}</Badge>
              </div>
              <h3 className="text-sm font-semibold mb-1">{report.title}</h3>
              <p className="text-xs text-muted-foreground">{report.date}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-muted-foreground">{report.count} records</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your preferences" />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Station Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Station Name</Label>
                <Input defaultValue="Kinondoni Police Station" />
              </div>
              <div className="space-y-1.5">
                <Label>Station Code</Label>
                <Input defaultValue="KDS-001" disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Duty Shift</Label>
                <Select defaultValue="morning">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (06:00 - 14:00)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (14:00 - 22:00)</SelectItem>
                    <SelectItem value="night">Night (22:00 - 06:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Assigned Sector</Label>
                <Select defaultValue="sector-a">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sector-a">Sector A - Kinondoni</SelectItem>
                    <SelectItem value="sector-b">Sector B - Kijitonyama</SelectItem>
                    <SelectItem value="sector-c">Sector C - Mwenge</SelectItem>
                    <SelectItem value="sector-d">Sector D - Makumbusho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'New incident alerts', desc: 'Receive alerts for new incidents in your sector', defaultChecked: true },
                { label: 'Case assignment notifications', desc: 'Get notified when cases are assigned to you', defaultChecked: true },
                { label: 'Warrant alerts', desc: 'Get notified about warrant executions in your area', defaultChecked: true },
                { label: 'Report deadline reminders', desc: 'Reminders for upcoming report deadlines', defaultChecked: false },
                { label: 'Officer dispatch updates', desc: 'Updates on officer dispatch and availability', defaultChecked: true },
              ].map((pref, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Checkbox defaultChecked={pref.defaultChecked} id={`g-notif-${idx}`} className="mt-0.5" />
                  <div>
                    <Label htmlFor={`g-notif-${idx}`} className="text-sm font-medium cursor-pointer">{pref.label}</Label>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <Input type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox id="g-2fa" className="mt-0.5" />
                <div>
                  <Label htmlFor="g-2fa" className="text-sm font-medium cursor-pointer">Enable 2FA</Label>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function GeneralProfile() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Your officer profile and performance" />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">JM</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-lg font-bold">Sgt. James Mlay</h2>
              <p className="text-sm text-muted-foreground">Badge: TP-4521 · General Duty</p>
              <p className="text-sm text-muted-foreground">Kinondoni Police Station, Dar es Salaam</p>
              <div className="flex items-center gap-2 justify-center sm:justify-start mt-2">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">On Duty</Badge>
                <Badge variant="outline">Sector A</Badge>
                <Badge variant="outline">Morning Shift</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Cases This Month" value={12} icon={<FileText className="h-5 w-5" />} color="bg-sky-100 text-sky-700" />
        <StatCard title="Arrests" value={5} icon={<UserCheck className="h-5 w-5" />} color="bg-purple-100 text-purple-700" />
        <StatCard title="Reports Filed" value={22} icon={<ClipboardList className="h-5 w-5" />} color="bg-amber-100 text-amber-700" />
        <StatCard title="Rating" value="4.5" subtitle="Very Good" icon={<Star className="h-5 w-5" />} color="bg-yellow-100 text-yellow-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input defaultValue="Sgt. James Mlay" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input defaultValue="+255 712 990 112" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input defaultValue="j.mlay@police.go.tz" />
            </div>
            <div className="space-y-1.5">
              <Label>Emergency Contact</Label>
              <Input defaultValue="+255 754 112 233 — Mary Mlay (Spouse)" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPlaceholder title="" type="bar" height="h-40" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Service Record</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            title=""
            columns={['Date', 'Event', 'Details']}
            rows={[
              ['2025-01-20', 'Promotion', 'Promoted to Sergeant'],
              ['2024-06-15', 'Transfer', 'Transferred to Kinondoni Station'],
              ['2024-01-10', 'Commendation', 'Outstanding service award'],
              ['2023-08-01', 'Training', 'Advanced Investigation Course'],
              ['2022-03-15', 'Assignment', 'Assigned to General Duty Unit'],
              ['2020-07-01', 'Joined', 'Graduated from Police Academy'],
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}