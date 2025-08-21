"use client"

import type React from "react"
import { useEffect, useRef, useCallback, type ReactNode } from "react"

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: "blue" | "purple" | "green" | "red" | "orange"
  size?: "sm" | "md" | "lg"
  width?: string | number
  height?: string | number
  customSize?: boolean
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
}

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
}

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "green",
  size = "md",
  width,
  height,
  customSize = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()

  const syncPointer = useCallback((e: PointerEvent) => {
    if (rafRef.current) return // Skip if already scheduled

    rafRef.current = requestAnimationFrame(() => {
      const { clientX: x, clientY: y } = e

      if (cardRef.current) {
        cardRef.current.style.setProperty("--x", x.toFixed(0)) // Reduced precision
        cardRef.current.style.setProperty("--xp", (x / window.innerWidth).toFixed(2))
        cardRef.current.style.setProperty("--y", y.toFixed(0))
        cardRef.current.style.setProperty("--yp", (y / window.innerHeight).toFixed(2))
      }
      rafRef.current = undefined
    })
  }, [])

  useEffect(() => {
    let isHovered = false

    const handleMouseEnter = () => {
      isHovered = true
      document.addEventListener("pointermove", syncPointer, { passive: true })
    }

    const handleMouseLeave = () => {
      isHovered = false
      document.removeEventListener("pointermove", syncPointer)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = undefined
      }
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener("mouseenter", handleMouseEnter)
      card.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (card) {
        card.removeEventListener("mouseenter", handleMouseEnter)
        card.removeEventListener("mouseleave", handleMouseLeave)
      }
      document.removeEventListener("pointermove", syncPointer)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [syncPointer])

  const { base, spread } = glowColorMap[glowColor]

  const getSizeClasses = () => {
    if (customSize) {
      return ""
    }
    return sizeMap[size]
  }

  const getInlineStyles = () => {
    const baseStyles = {
      "--base": base,
      "--spread": spread,
      "--radius": "14",
      "--border": "2", // Reduced border size
      "--backdrop": "hsl(0 0% 60% / 0.08)", // Reduced opacity
      "--backup-border": "var(--backdrop)",
      "--size": "150", // Reduced spotlight size
      "--outer": "1",
      "--border-size": "calc(var(--border, 2) * 1px)",
      "--spotlight-size": "calc(var(--size, 150) * 1px)",
      "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
      position: "relative" as const,
      touchAction: "none" as const,
      willChange: "transform", // Performance hint
    }

    if (width !== undefined) {
      baseStyles.width = typeof width === "number" ? `${width}px` : width
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === "number" ? `${height}px` : height
    }

    return baseStyles
  }

  const beforeAfterStyles = `
    [data-glow]:hover::before {
      content: "";
      position: absolute;
      inset: -2px;
      border: 2px solid transparent;
      border-radius: 14px;
      background: radial-gradient(
        150px 150px at var(--x, 0px) var(--y, 0px),
        hsl(var(--hue, 210) 100% 50% / 0.3), 
        transparent 70%
      );
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
      pointer-events: none;
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          ${!customSize ? "aspect-[3/4]" : ""}
          rounded-2xl 
          relative 
          grid 
          grid-rows-[1fr_auto] 
          shadow-lg
          p-4 
          gap-4 
          backdrop-blur-sm
          transition-transform duration-200
          hover:scale-[1.02]
          ${className}
        `}
      >
        <div ref={innerRef}></div>
        {children}
      </div>
    </>
  )
}

export { GlowCard }
