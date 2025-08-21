"use client"

import { useEffect, useRef } from "react"

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap at 2x for performance
      canvas.width = window.innerWidth * 0.5 // Reduce resolution by 50%
      canvas.height = window.innerHeight * 0.5
      canvas.style.width = window.innerWidth + "px"
      canvas.style.height = window.innerHeight + "px"
      ctx.scale(0.5, 0.5) // Scale context to match
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const chars = "01アイウエオ"
    const charArray = chars.split("")

    const fontSize = 16 // Slightly larger for better visibility at lower res
    const columns = Math.floor(canvas.width / fontSize / 2) // Fewer columns

    // Array to store drops
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100) // Start with random positions
    }

    let lastTime = 0
    const targetFPS = 20 // Reduced from ~28fps to 20fps

    const draw = (currentTime: number) => {
      if (currentTime - lastTime < 1000 / targetFPS) {
        requestAnimationFrame(draw)
        return
      }
      lastTime = currentTime

      ctx.fillStyle = "rgba(0, 0, 0, 0.08)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#61cf5a"
      ctx.font = `${fontSize}px monospace`

      const dropsPerFrame = Math.min(drops.length, 50)
      for (let i = 0; i < dropsPerFrame; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)]
        ctx.fillText(text, i * fontSize * 2, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0
        }
        drops[i]++
      }

      requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-15 z-0"
      style={{ background: "transparent" }}
    />
  )
}

export default MatrixBackground
