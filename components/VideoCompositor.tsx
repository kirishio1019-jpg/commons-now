// AI Video Compositor — Real-time cinematic composition engine
// Plays AI-generated storyboards: videos + animated images
// Ken Burns, cross-fade, color grading, film effects

import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { generateStoryboard, Storyboard, StoryboardSegment } from "../lib/storyboardGenerator";

interface Props {
  waveId: string;
  theme: string;
  title: string;
  description: string;
  isActive: boolean;
  width: number;
  height: number;
}

export function VideoCompositor({ waveId, theme, title, description, isActive, width, height }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storyboard = useMemo(
    () => generateStoryboard(waveId, theme, title, description),
    [waveId, theme, title, description]
  );

  const segments = storyboard.segments;

  // Auto-advance segments
  useEffect(() => {
    if (!isActive || segments.length < 2) return;

    const advance = () => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % segments.length);
        setNextIdx((prev) => (prev + 1) % segments.length);
        setTransitioning(false);
      }, 1500); // transition duration
    };

    timerRef.current = setTimeout(advance, segments[currentIdx]?.duration * 1000 || 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isActive, currentIdx, segments]);

  const grade = storyboard.colorGrade;
  const gradeFilter = `saturate(${grade.saturation}) brightness(${grade.brightness})`;

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, width, height,
      overflow: "hidden", backgroundColor: "#000",
    }}>
      {/* Current segment */}
      <SegmentRenderer
        segment={segments[currentIdx]}
        isActive={isActive}
        opacity={transitioning ? 0 : 1}
        width={width}
        height={height}
        index={currentIdx}
      />

      {/* Next segment (fades in during transition) */}
      {transitioning && (
        <SegmentRenderer
          segment={segments[nextIdx]}
          isActive={isActive}
          opacity={1}
          width={width}
          height={height}
          index={nextIdx}
        />
      )}

      {/* Color grading */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        filter: gradeFilter,
        mixBlendMode: "color" as any,
        backgroundColor: `hsla(${grade.hue}, 30%, 30%, 0.15)`,
        zIndex: 5,
        pointerEvents: "none",
      }} />

      {/* Film warmth */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(255,200,150,0.04)",
        mixBlendMode: "overlay" as any,
        zIndex: 6,
        pointerEvents: "none",
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.55) 100%)",
        zIndex: 7,
        pointerEvents: "none",
      }} />

      {/* Inject keyframes */}
      <style dangerouslySetInnerHTML={{ __html: generateKeyframes(segments) }} />
    </div>
  );
}

function SegmentRenderer({ segment, isActive, opacity, width, height, index }: {
  segment: StoryboardSegment;
  isActive: boolean;
  opacity: number;
  width: number;
  height: number;
  index: number;
}) {
  if (!segment) return null;

  const kb = segment.kenBurns;
  const animName = `kb-${index}-${Math.abs(kb.fromX)}`;
  const dur = `${segment.duration + 2}s`;

  const mediaStyle: React.CSSProperties = {
    position: "absolute",
    top: "-15%", left: "-15%",
    width: "130%", height: "130%",
    objectFit: "cover" as any,
    animation: isActive ? `${animName} ${dur} ease-in-out infinite alternate` : "none",
    filter: `hue-rotate(${segment.colorShift}deg)`,
  };

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0, left: 0, width, height,
    overflow: "hidden",
    opacity,
    transition: "opacity 1.5s ease-in-out",
    zIndex: opacity === 1 ? 2 : 1,
  };

  return (
    <div style={containerStyle}>
      {segment.media.type === "video" ? (
        <video
          src={segment.media.url}
          autoPlay={isActive}
          loop
          muted
          playsInline
          style={mediaStyle}
        />
      ) : (
        <img
          src={segment.media.url}
          alt=""
          style={mediaStyle}
          loading="eager"
        />
      )}
    </div>
  );
}

function generateKeyframes(segments: StoryboardSegment[]): string {
  return segments.map((seg, i) => {
    const kb = seg.kenBurns;
    const name = `kb-${i}-${Math.abs(kb.fromX)}`;
    return `
      @keyframes ${name} {
        from {
          transform: scale(${kb.fromScale}) translate(${kb.fromX}%, ${kb.fromY}%);
        }
        to {
          transform: scale(${kb.toScale}) translate(${kb.toX}%, ${kb.toY}%);
        }
      }
    `;
  }).join("\n");
}
