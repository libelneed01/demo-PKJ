"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { Card, SearchBox, PageHeader, Icon, Tabs } from "../ui";

export default function Kontak() {
  const { data } = useApp();
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("all");
  const cats = ["Pengurus", "Keamanan", "Kebersihan", "Darurat", "Layanan Publik"];
  const rows = data.kontak.filter((k) => (kat === "all" || k.kategori === kat) && (!q || (k.nama + k.hp).toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      <PageHeader title="Kontak Penting" desc="Nomor pengurus, security, dan layanan darurat. Nomor selain layanan darurat nasional adalah data contoh." />
      <Tabs value={kat} onChange={setKat} tabs={[{ id: "all", label: "Semua" }, ...cats.map((c) => ({ id: c, label: c }))]} />
      <div className="mb-4"><SearchBox value={q} onChange={setQ} placeholder="Cari nama atau nomor" /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((k) => (
          <Card key={k.id} pad="p-4" className="flex items-center justify-between gap-3">
            <div className="min-w-0"><p className="truncate font-semibold text-navy">{k.nama}</p><p className="text-xs text-slate-500">{k.kategori}</p></div>
            <a href={"tel:" + k.hp.replace(/[^\d+]/g, "")} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-mint-50 px-3.5 py-2 text-sm font-semibold text-mint-700 hover:bg-mint-100"><Icon n="phone" className="h-4 w-4" />{k.hp}</a>
          </Card>
        ))}
      </div>
    </div>
  );
}
