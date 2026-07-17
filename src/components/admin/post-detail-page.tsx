"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Building2, Users } from "lucide-react";
import { POSTS } from "@/lib/admin-mgmt-data";

export function PostDetailPage({ postId, basePath }: { postId: string; basePath: "/admin" | "/command" }) {
  const post = POSTS.find((p) => p.id === postId);
  if (!post) {
    return (
      <div className="min-h-screen bg-police p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-police-card p-6 shadow-sm">
          <h1 className="text-xl font-bold text-police-navy">Posti Haipatikani</h1>
          <p className="mt-1 text-[13px] text-police-muted">ID: {postId}</p>
          <Link href={basePath} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-police-input px-3 py-2 text-[12px] font-semibold text-police-navy hover:bg-police-muted">
            <ArrowLeft size={14} /> Rudi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-police p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href={basePath} className="inline-flex items-center gap-2 rounded-lg bg-police-card px-3 py-2 text-[12px] font-semibold text-police-navy shadow-sm hover:bg-police-muted"><ArrowLeft size={14} /> Rudi</Link>
        <div className="rounded-xl bg-police-card p-5 shadow-sm">
          <p className="font-mono text-[11px] text-police-faint">{post.id}</p>
          <h1 className="text-xl font-bold text-police-navy">{post.name}</h1>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <p className="text-[13px] text-police-muted"><MapPin size={13} className="mr-1 inline" />{post.location}</p>
            <p className="text-[13px] text-police-muted"><Building2 size={13} className="mr-1 inline" />{post.stationName}</p>
            <p className="text-[13px] text-police-muted">Aina: <span className="font-semibold text-police">{post.type}</span></p>
            <p className="text-[13px] text-police-muted"><Users size={13} className="mr-1 inline" />Maofisa: <span className="font-semibold text-police">{post.officersCount}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
