import { useEffect, useRef, useState } from 'react';
import type { Mesh } from 'three';
import { motion } from 'motion/react';
import CountryPanel, { LocateMeButton } from './globe/CountryPanel';
import GlobeCanvas from './globe/GlobeCanvas';
import WebGLFallback from './globe/WebGLFallback';
import { useCountries } from './globe/useCountries';
import { useGlobeScene } from './globe/useGlobeScene';

export default function GlobeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [webglError, setWebglError] = useState(false);

  // Stable refs shared between the data layer and the three.js scene module
  const targetRotationRef = useRef<[number, number] | null>(null);
  const earthMeshRef = useRef<Mesh | null>(null);
  const isRotatingRef = useRef(true);
  const isHoveredRef = useRef(false);

  // Sync state variables to stable refs
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  const {
    highlightedCountries,
    selectedCountry,
    selectedCountryRef,
    isLocating,
    locationError,
    handleSelectCountry,
    handleLocateUser,
  } = useCountries({ earthMeshRef, targetRotationRef });

  useGlobeScene({
    canvasRef,
    earthMeshRef,
    targetRotationRef,
    selectedCountryRef,
    isRotatingRef,
    isHoveredRef,
    highlightedCountries,
    onWebglError: () => setWebglError(true),
  });

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden text-white" id="globe-centerpiece">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Ambient Blue Gradients */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/10 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-medium mb-4"
          >
            <span>Interactive 3D World Explorer</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-medium tracking-tight mb-4 text-white"
          >
            Explore Global Destinations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto text-base"
          >
            Rotate the interactive globe to discover top travel spots, active packages, and climate characteristics. Click on a highlighted country pin to view curated tour guides, flight details, and real-time weather forecasts.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Globe Canvas Container */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none">
            {webglError ? (
              <WebGLFallback
                highlightedCountries={highlightedCountries}
                selectedCountry={selectedCountry}
                onSelectCountry={handleSelectCountry}
              />
            ) : (
              <GlobeCanvas
                canvasRef={canvasRef}
                highlightedCountries={highlightedCountries}
                selectedCountry={selectedCountry}
                onSelectCountry={handleSelectCountry}
                onHoverChange={setIsHovered}
              />
            )}

            {/* Global Geolocation Trigger Button */}
            <LocateMeButton
              onClick={handleLocateUser}
              isLocating={isLocating}
              locationError={locationError}
            />
          </div>

          {/* Interactive Lookup Details */}
          <div className="lg:col-span-5">
            <CountryPanel
              selectedCountry={selectedCountry}
              isLocating={isLocating}
              locationError={locationError}
              onLocateUser={handleLocateUser}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
