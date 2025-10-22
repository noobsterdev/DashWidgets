import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { Responsive, WidthProvider } from 'react-grid-layout'
import Widget from '../components/widgets'
import { nanoid } from 'nanoid'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

const SOCKET_URL = 'http://localhost:3000' // change if needed

const DEFAULT_LAYOUT = {
  lg: [
    { i: 'widget-1', x: 0, y: 0, w: 3, h: 2 },
  ],
}

export default function App() {
  const [socket, setSocket] = useState(null)
  const [widgets, setWidgets] = useState(() => {
    try {
      const raw = localStorage.getItem('widgets')
      return raw ? JSON.parse(raw) : [{ id: 'widget-1', type: 'price', title: 'BTC Price' }]
    } catch (e) {
      return [{ id: 'widget-1', type: 'price', title: 'BTC Price' }]
    }
  })

  const [layout, setLayout] = useState(() => {
    try {
      const raw = localStorage.getItem('layout')
      return raw ? JSON.parse(raw) : DEFAULT_LAYOUT
    } catch (e) {
      return DEFAULT_LAYOUT
    }
  })

  // hold historical data per symbol
  const dataRef = useRef({})

  useEffect(() => {
    const s = io(SOCKET_URL)
    setSocket(s)

    s.on('connect', () => console.log('connected to socket', s.id))

    s.on('price_update', (payload) => {
      // payload: { symbol, price, time }
      const { symbol, price, time } = payload
      if (!dataRef.current[symbol]) dataRef.current[symbol] = []
      const arr = dataRef.current[symbol]
      arr.push({ price: parseFloat(price), time })
      if (arr.length > 50) arr.shift()
      // Save latest to local storage for debugging/demo
      localStorage.setItem('latest', JSON.stringify({ symbol, price, time }))
      // Trigger re-render by updating a small state or using a custom event
      // For simplicity, we'll update a dummy state
      setWidgets((w) => [...w])
    })

    return () => {
      s.disconnect()
    }
  }, [])

  // helper to get data for widget
  function getDataForWidget(widget) {
    if (widget.type === 'price') {
      const symbol = widget.symbol || 'BTC'
      return dataRef.current[symbol] || []
    }
    return []
  }

  function addWidget() {
    const id = 'widget-' + nanoid(6)
    const newWidget = { id, type: 'price', title: 'BTC Price', symbol: 'BTC' }
    setWidgets((w) => {
      const next = [...w, newWidget]
      localStorage.setItem('widgets', JSON.stringify(next))
      return next
    })
    // add default layout cell
    setLayout((L) => {
      const next = { ...L }
      next.lg = next.lg ? [...next.lg, { i: id, x: 0, y: Infinity, w: 3, h: 2 }] : [{ i: id, x: 0, y: Infinity, w: 3, h: 2 }]
      localStorage.setItem('layout', JSON.stringify(next))
      return next
    })
  }

  function removeWidget(id) {
    setWidgets((w) => {
      const next = w.filter((x) => x.id !== id)
      localStorage.setItem('widgets', JSON.stringify(next))
      return next
    })
    setLayout((L) => {
      const next = { ...L }
      if (next.lg) next.lg = next.lg.filter((it) => it.i !== id)
      localStorage.setItem('layout', JSON.stringify(next))
      return next
    })
  }

  function onLayoutChange(newLayout, allLayouts) {
    // store responsive layouts
    const next = { ...layout, ...allLayouts }
    setLayout(next)
    localStorage.setItem('layout', JSON.stringify(next))
  }

  return (
    <div className="app-root">
      <header className="topbar">
        <h1>Realtime Dashboard</h1>
        <div className="controls">
          <button onClick={addWidget}>+ Add Widget</button>
        </div>
      </header>

      <main>
        <ResponsiveGridLayout
          className="layout"
          layouts={layout}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 2 }}
          rowHeight={80}
          onLayoutChange={(l, layouts) => onLayoutChange(l, layouts)}
        >
          {widgets.map((w) => (
            <div key={w.id} data-grid={(layout.lg || []).find((it) => it.i === w.id) || { w: 3, h: 2 }}>
              <Widget
                widget={w}
                onRemove={() => removeWidget(w.id)}
                data={getDataForWidget(w)}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </main>
    </div>
  )
}