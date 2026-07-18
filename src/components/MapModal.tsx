import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Compass, Navigation, CloudSun, Calendar, Globe, Sparkles, Locate, Shield } from 'lucide-react';
import { Destination } from '../types';

interface MapModalProps {
  destination: Destination;
  onClose: () => void;
}

export default function MapModal({ destination, onClose }: MapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const linkId = 'leaflet-css';
    const scriptId = 'leaflet-js';

    // 1. Inject Leaflet CSS if not present
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Map initialization handler
    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      try {
        const lat = destination.latitude || 20.5937;
        const lng = destination.longitude || 78.9629;

        // Clean up previous map instance if any exists
        if (mapRef.current) {
          mapRef.current.remove();
        }

        // Initialize map instance
        const map = L.map(mapContainerRef.current, {
          zoomControl: false, // Disabling default zoom control to place it in the bottom-right
          attributionControl: true
        }).setView([lat, lng], 11);

        mapRef.current = map;

        // Add CartoDB Dark Matter tile layer to match Trippy's dark control board aesthetic
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 18,
          minZoom: 2
        }).addTo(map);

        // Add customized sleek zoom controls in the bottom-right corner
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);

        // Slick Glowing Amber Marker Styles
        const markerHtmlStyles = `
          background-color: #f59e0b;
          width: 20px;
          height: 20px;
          display: block;
          left: -10px;
          top: -10px;
          position: relative;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.9);
        `;

        const pulseHtmlStyles = `
          position: absolute;
          width: 40px;
          height: 40px;
          left: -20px;
          top: -20px;
          border-radius: 50%;
          background: rgba(245, 158, 11, 0.4);
          animation: map-pulse 2s infinite ease-out;
        `;

        // Inject custom map animations to document head if not present
        const styleId = 'leaflet-custom-marker-animations';
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.innerHTML = `
            @keyframes map-pulse {
              0% { transform: scale(0.3); opacity: 0.9; }
              100% { transform: scale(1.6); opacity: 0; }
            }
            .custom-leaflet-popup .leaflet-popup-content-wrapper {
              background: #090d1a !important;
              color: #f8fafc !important;
              border: 1px solid rgba(245, 158, 11, 0.3) !important;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
              border-radius: 12px !important;
              padding: 0px !important;
            }
            .custom-leaflet-popup .leaflet-popup-content {
              margin: 0 !important;
              padding: 10px 12px !important;
            }
            .custom-leaflet-popup .leaflet-popup-tip {
              background: #090d1a !important;
              border-left: 1px solid rgba(245, 158, 11, 0.3) !important;
              border-bottom: 1px solid rgba(245, 158, 11, 0.3) !important;
            }
          `;
          document.head.appendChild(style);
        }

        const customIcon = L.divIcon({
          className: "custom-glowing-marker",
          iconAnchor: [0, 0],
          html: `<div style="position: relative;">
                  <div style="${pulseHtmlStyles}"></div>
                  <div style="${markerHtmlStyles}"></div>
                </div>`
        });

        // Add Marker with Glowing pin and custom Popup
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; line-height: 1.4;">
            <strong style="color: #f59e0b; font-size: 13px; display: block; margin-bottom: 2px;">${destination.name}</strong>
            <span style="color: #94a3b8; font-size: 10px; display: block; margin-bottom: 6px;">${destination.city}, ${destination.country}</span>
            <div style="font-family: monospace; font-size: 9px; color: #64748b; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 4px;">
              LAT: ${lat.toFixed(4)}<br/>
              LON: ${lng.toFixed(4)}
            </div>
          </div>
        `, {
          className: 'custom-leaflet-popup',
          closeButton: false
        }).openPopup();

        setLeafletLoaded(true);
      } catch (err: any) {
        console.error("Leaflet initiation error:", err);
        setError("Failed to initialize the map canvas.");
      }
    };

    // 2. Load Leaflet script dynamically
    if (!(window as any).L) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        // Small delay to ensure CSS styling matches
        setTimeout(initMap, 80);
      };
      script.onerror = () => {
        setError("Failed to stream map telemetry.");
      };
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [destination]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6" id="interactive-map-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#070b19] border border-slate-800/80 rounded-[28px] overflow-hidden w-full max-w-5xl h-[85vh] flex flex-col md:flex-row relative shadow-2xl"
      >
        {/* Close Button top-right (absolute) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-40 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition shadow-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Coordinates & Telemetry Information Panel */}
        <div className="w-full md:w-[340px] flex flex-col justify-between bg-[#040813] border-b md:border-b-0 md:border-r border-slate-800/60 p-6 sm:p-8 shrink-0 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-semibold uppercase tracking-wider mb-3">
                <Navigation className="w-3.5 h-3.5 animate-pulse" />
                <span>Active Map Node</span>
              </div>
              <h2 className="text-2xl font-display font-medium text-white tracking-tight">{destination.name}</h2>
              <p className="text-xs font-mono text-slate-400 mt-1">{destination.city}, {destination.country}</p>
            </div>

            {/* Geographical Telemetry Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/50 space-y-3">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Spatio-Temporal Coordinates</span>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-[#070b19] border border-slate-800/30">
                  <span className="block text-[9px] text-slate-500">LATITUDE</span>
                  <span className="font-bold text-amber-400">{(destination.latitude || 20.5937).toFixed(5)}°</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070b19] border border-slate-800/30">
                  <span className="block text-[9px] text-slate-500">LONGITUDE</span>
                  <span className="font-bold text-amber-400">{(destination.longitude || 78.9629).toFixed(5)}°</span>
                </div>
              </div>
            </div>

            {/* Micro Details */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300 block">Climate Profile</span>
                  <span className="text-slate-400 capitalize">{destination.climate || 'Moderate'} zone</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300 block">Travel Architecture</span>
                  <span className="text-slate-400 capitalize">{destination.travel_style || 'Curated'} style</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CloudSun className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300 block">Recommended Period</span>
                  <span className="text-slate-400">{destination.best_season}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-5">
              <p className="text-[11px] leading-relaxed text-slate-400 font-light">
                {destination.description}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/40 mt-6 md:mt-0 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500/80 animate-pulse" />
            <span>Interactive Node Vector Grid</span>
          </div>
        </div>

        {/* Right Column: Interactive Leaflet Map Canvas */}
        <div className="flex-1 h-full relative bg-[#040813]">
          {/* Custom Loading State overlay */}
          {!leafletLoaded && !error && (
            <div className="absolute inset-0 z-10 bg-slate-950/80 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-mono text-slate-400 tracking-wider">Streaming Map Telemetry Canvas...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-10 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl mb-3">
                <Locate className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-sm font-semibold text-white">Grid Signal Lost</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">{error}</p>
            </div>
          )}

          {/* Map Mount Point */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>
      </motion.div>
    </div>
  );
}
