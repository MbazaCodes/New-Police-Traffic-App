'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <p className={cn('text-xs font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn('p-2.5 rounded-lg', color || 'bg-primary/10 text-primary')}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DataTableProps {
  title: string;
  columns: string[];
  rows: string[][];
  maxRows?: number;
}

export function DataTable({ title, columns, rows, maxRows = 10 }: DataTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                {columns.map((col, i) => (
                  <th key={i} className="text-left py-2 px-2 font-medium text-muted-foreground whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, maxRows).map((row, ri) => (
                <tr key={ri} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-2 whitespace-nowrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface SearchBarProps {
  placeholder: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder }: SearchBarProps) {
  const [query, setQuery] = React.useState('');
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      />
    </div>
  );
}

export function ChartPlaceholder({ title, type, height = 'h-48' }: { title: string; type: 'bar' | 'line' | 'pie'; height?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('flex items-end gap-1.5 px-2', height)}>
          {Array.from({ length: 12 }, (_, i) => {
            const h = 20 + Math.random() * 80;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full rounded-sm transition-all',
                    type === 'bar' ? 'bg-primary/70' : type === 'line' ? 'bg-primary/40' : 'bg-primary/60 rounded-full',
                  )}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-muted-foreground">
                  {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const colorMap = { info: 'bg-blue-500', warning: 'bg-yellow-500', danger: 'bg-red-500', success: 'bg-green-500' };
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', colorMap[item.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.description}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}