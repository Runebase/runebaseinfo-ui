import { createContext, useContext, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { io } from 'socket.io-client'
import { setHeight } from '../store/blockchainSlice'

const WebSocketContext = createContext(null)

export function WebSocketProvider({ children }) {
  const dispatch = useDispatch()
  const wsRef = useRef(null)
  const subscriptionsRef = useRef({})
  const listenersRef = useRef({})

  useEffect(() => {
    // Connect directly to the backend for WebSocket
    // In dev, the API is on localhost:7001; in production, same origin
    const wsUrl = import.meta.env.DEV ? 'http://localhost:7001' : undefined
    const ws = io(wsUrl, { transports: ['websocket'] })
    wsRef.current = ws

    ws.on('tip', (tip) => dispatch(setHeight(tip.height)))
    ws.on('reorg', (tip) => dispatch(setHeight(tip.height)))

    // On connect/reconnect, re-subscribe all active rooms
    const resubscribeAll = () => {
      for (let room of Object.keys(subscriptionsRef.current)) {
        ws.emit('subscribe', room)
      }
    }

    ws.on('connect', resubscribeAll)
    ws.on('reconnect', resubscribeAll)

    return () => {
      ws.disconnect()
    }
  }, [dispatch])

  const subscribe = (room, event, callback) => {
    const ws = wsRef.current
    if (!ws) return

    const subscriptions = subscriptionsRef.current
    const listeners = listenersRef.current

    let eventMapping = subscriptions[room]
    if (eventMapping) {
      let mapping = eventMapping[event]
      if (mapping) {
        mapping.set(callback, (mapping.get(callback) || 0) + 1)
      } else {
        eventMapping[event] = new Map([[callback, 1]])
      }
    } else {
      subscriptions[room] = { [event]: new Map([[callback, 1]]) }
      ws.emit('subscribe', room)
    }

    let listener = listeners[event]
    if (listener) {
      let count = listener.get(callback)
      if (count) {
        listener.set(callback, count + 1)
      } else {
        listener.set(callback, 1)
        ws.on(event, callback)
      }
    } else {
      listeners[event] = new Map([[callback, 1]])
      ws.on(event, callback)
    }
  }

  const unsubscribe = (room, event, callback) => {
    const ws = wsRef.current
    if (!ws) return

    const subscriptions = subscriptionsRef.current
    const listeners = listenersRef.current

    let eventMapping = subscriptions[room]
    if (eventMapping) {
      let mapping = eventMapping[event]
      if (mapping) {
        let count = mapping.get(callback)
        if (!count) {
          return
        } else if (count === 1) {
          mapping.delete(callback)
          if (mapping.size === 0) {
            delete eventMapping[event]
          }
        } else {
          mapping.set(callback, count - 1)
        }
      }
      if (Object.keys(eventMapping).length === 0) {
        delete subscriptions[room]
        ws.emit('unsubscribe', room)
      }
    }

    let listener = listeners[event]
    if (listener) {
      let count = listener.get(callback)
      if (count === 1) {
        listener.delete(callback)
        ws.off(event, callback)
      } else {
        listener.set(callback, count - 1)
      }
    }
  }

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext)
  if (!ctx) {
    return { subscribe: () => {}, unsubscribe: () => {} }
  }
  return ctx
}
