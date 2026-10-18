"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TITIK } from "@/lib/data";

const WARNA = { gerbang: "#B8913A", patroli: "#12372A", bersih: "#2E86C1" };

export default function MapView() {
  const el = useRef(null);
  useEffect(() => {
    const map = L.map(el.current).setView([-7.3724, 112.779], 16);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    TITIK.forEach((t) =>
      L.circleMarker([t.lat, t.lng], { radius: 9, color: "#fff", weight: 2, fillColor: WARNA[t.tipe], fillOpacity: 1 })
        .addTo(map)
        .bindPopup(t.nama)
    );
    return () => map.remove();
  }, []);
  return <div ref={el} className="h-[60vh] w-full rounded-xl ring-1 ring-slate-200" />;
}
