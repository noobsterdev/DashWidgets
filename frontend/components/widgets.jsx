import React, { useEffect, useRef } from 'react'

export default function Widget({ widget, data = [], onRemove }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.clientWidth
    const h = canvas.height = canvas.clientHeight

    // draw background
    ctx.clearRect(0, 0, w, h)

    if (!data || data.length === 0) {
      // draw placeholder
      ctx.fillStyle = 'rgba(0,0,0,0.05)'
      ctx.fillRect(0, 0, w, h)
      return
    }

    const prices = data.map(d => d.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min || 1

    ctx.beginPath()
    for (let i = 0; i < prices.length; i++) {
      const x = (i / (prices.length - 1)) * w
      const y = h - ((prices[i] - min) / range) * h
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.lineWidth = 2
    ctx.strokeStyle = '#111'
    ctx.stroke()

    // draw latest price
    const latest = prices[prices.length - 1]
    ctx.font = '700 18px sans-serif'
    ctx.fillStyle = '#111'
    ctx.fillText('$' + latest.toFixed(2), 8, 20)
  }, [data])

  return (
    <div className="widget-card">
      <div className="widget-header">
        <strong>{widget.title}</strong>
        <div className="widget-actions">
          <button onClick={onRemove} title="Remove">✖</button>
        </div>
      </div>
      <div className="widget-body">
        <canvas ref={canvasRef} className="sparkline" />
      </div>
    </div>
  )
}