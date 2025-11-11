import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

/**
 * Custom hook for WebSocket real-time updates in live quizzes
 * 
 * Features:
 * - Automatic connection/reconnection
 * - Room-based events (joins specific quiz session)
 * - Fallback support (if WebSocket fails, polling continues)
 * - Clean disconnection on unmount
 * 
 * @param {string|number} sessionId - The live quiz session ID
 * @param {object} callbacks - Event handlers for different WebSocket events
 * @param {boolean} enabled - Whether to enable WebSocket connection (default: true)
 * @returns {object} Socket instance and connection status
 */
export const useQuizSocket = (sessionId, callbacks = {}, enabled = true) => {
  const socketRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const {
    onQuizCompleted,
    onQuestionChanged,
    onParticipantJoined,
    onLeaderboardUpdated,
    onConnectionError,
    onConnected,
    onDisconnected
  } = callbacks

  // Get WebSocket URL from environment or use same host as API
  const getSocketUrl = useCallback(() => {
    // Try environment variable first
    const wsUrl = import.meta.env.VITE_WS_URL
    if (wsUrl) return wsUrl

    // Fallback: use same host as API
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return apiUrl.replace('/api', '').replace('http', 'ws')
  }, [])

  useEffect(() => {
    // Don't connect if disabled or no session ID
    if (!enabled || !sessionId) {
      console.log('WebSocket disabled or no sessionId')
      return
    }

    // Check if WebSocket is supported
    if (typeof window === 'undefined' || !('WebSocket' in window)) {
      console.warn('WebSocket not supported in this browser')
      if (onConnectionError) {
        onConnectionError(new Error('WebSocket not supported'))
      }
      return
    }

    console.log(`[WebSocket] Connecting to session ${sessionId}...`)

    try {
      // Create Socket.IO client
      const socket = io(getSocketUrl(), {
        transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
      })

      socketRef.current = socket

      // Connection event handlers
      socket.on('connect', () => {
        console.log(`[WebSocket] Connected! Socket ID: ${socket.id}`)
        reconnectAttemptsRef.current = 0

        // Join the quiz room
        socket.emit('join_quiz', { sessionId: String(sessionId) }, (response) => {
          if (response?.success) {
            console.log(`[WebSocket] Successfully joined quiz ${sessionId}`)
          } else {
            console.error('[WebSocket] Failed to join quiz:', response?.error)
          }
        })

        if (onConnected) {
          onConnected()
        }
      })

      socket.on('disconnect', (reason) => {
        console.log(`[WebSocket] Disconnected: ${reason}`)
        if (onDisconnected) {
          onDisconnected(reason)
        }
      })

      socket.on('connect_error', (error) => {
        console.error('[WebSocket] Connection error:', error.message)
        reconnectAttemptsRef.current++

        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.warn('[WebSocket] Max reconnection attempts reached, falling back to polling')
          if (onConnectionError) {
            onConnectionError(error)
          }
        }
      })

      // Quiz event handlers
      socket.on('quizCompleted', (data) => {
        console.log('[WebSocket] Quiz completed:', data)
        if (onQuizCompleted) {
          onQuizCompleted(data)
        }
      })

      socket.on('questionChanged', (data) => {
        console.log('[WebSocket] Question changed:', data)
        if (onQuestionChanged) {
          onQuestionChanged(data)
        }
      })

      socket.on('participantJoined', (data) => {
        console.log('[WebSocket] Participant joined:', data)
        if (onParticipantJoined) {
          onParticipantJoined(data)
        }
      })

      socket.on('leaderboardUpdated', (data) => {
        console.log('[WebSocket] Leaderboard updated:', data)
        if (onLeaderboardUpdated) {
          onLeaderboardUpdated(data)
        }
      })

      // Cleanup function
      return () => {
        console.log(`[WebSocket] Cleaning up connection for session ${sessionId}`)
        if (socket.connected) {
          socket.emit('leave_quiz', { sessionId: String(sessionId) })
          socket.disconnect()
        }
      }
    } catch (error) {
      console.error('[WebSocket] Setup error:', error)
      if (onConnectionError) {
        onConnectionError(error)
      }
    }
  }, [sessionId, enabled, getSocketUrl, onQuizCompleted, onQuestionChanged, onParticipantJoined, onLeaderboardUpdated, onConnectionError, onConnected, onDisconnected])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  }
}

export default useQuizSocket
