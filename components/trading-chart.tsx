"use client"

import { useEffect, useRef } from "react"

interface TradingChartProps {
  data: number[]
  currentPrice: number
}

export function TradingChart({ data, currentPrice }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    const width = canvas.width
    const height = canvas.height
    const padding = 20

    // Calculate min and max for scaling
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * (height - 2 * padding)) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw price line
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((price, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
      const y = height - padding - ((price - min) / range) * (height - 2 * padding)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw current price indicator
    const lastX = width - padding
    const lastY = height - padding - ((currentPrice - min) / range) * (height - 2 * padding)

    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(lastX, lastY, 4, 0, 2 * Math.PI)
    ctx.fill()

    // Draw price label
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(lastX + 10, lastY - 12, 60, 24)
    ctx.strokeStyle = "#3b82f6"
    ctx.strokeRect(lastX + 10, lastY - 12, 60, 24)
    ctx.fillStyle = "#3b82f6"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`$${currentPrice.toFixed(2)}`, lastX + 40, lastY + 4)
  }, [data, currentPrice])

  return (
    <div className="bg-card border rounded-xl p-4">
      <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto" />
    </div>
  )
}
