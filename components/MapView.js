"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TITIK, TIPE } from "@/lib/data";

export default function MapView({ filter = "semua", active = null }) {
  const el = useRef(null), map = useRef(null), layer = useRef(null), marks = useRef({});
  useEffect(() => {
    const m = L.map(el.current).setView([-7.3724, 112.779], 16);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap" }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => m.remove();
  }, []);
  useEffect(() => {
    layer.current.clearLayers();
    marks.current = {};
    TITIK.filter((t) => filter === "semua" || t.tipe === filter).forEach((t) => {
      const c = L.circleMarker([t.lat, t.lng], { radius: 10, color: "#fff", weight: 2, fillColor: TIPE[t.tipe].color, fillOpacity: 1 })
        .bindPopup(`<b>${t.nama}</b><br>${TIPE[t.tipe].desc}`);
      c.addTo(layer.current);
      marks.current[t.nama] = c;
    });
  }, [filter]);
  useEffect(() => {
    const c = marks.current[active];
    if (c) { map.current.flyTo(c.getLatLng(), 17); c.openPopup(); }
  }, [active, filter]);
  return <div ref={el} className="h-[50vh] w-full rounded-xl ring-1 ring-slate-200" />;
}
