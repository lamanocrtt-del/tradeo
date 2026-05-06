// Synthesized mouse-click sound via AudioContext
// Mimics a real mechanical click: sharp transient + body + release
let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    audioCtx = new AC()
  }
  if (audioCtx.state === "suspended") audioCtx.resume()
  return audioCtx
}

export const sounds = {
  click: () => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime

    // --- Layer 1: sharp transient "tick" (noise burst) ---
    const bufferSize = Math.floor(ctx.sampleRate * 0.012) // 12ms
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      // Shaped noise: loud start, fast decay
      const env = Math.exp(-i / (bufferSize * 0.15))
      data[i] = (Math.random() * 2 - 1) * env
    }
    const noiseSrc = ctx.createBufferSource()
    noiseSrc.buffer = noiseBuffer

    // Bandpass to make it sound like a click, not static
    const bp = ctx.createBiquadFilter()
    bp.type = "bandpass"
    bp.frequency.value = 4000
    bp.Q.value = 1.2

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.6, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015)

    noiseSrc.connect(bp)
    bp.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noiseSrc.start(now)
    noiseSrc.stop(now + 0.015)

    // --- Layer 2: low "thunk" body (gives weight to the click) ---
    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.setValueAtTime(1800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.015)

    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(0.25, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025)

    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.03)
  },
}

// Check if iOS/Safari for special handling
const isIOS = () => {
  if (typeof window === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
}

// Create audio-based haptic feedback for iOS (since vibration API is limited)
const createIOSHaptic = (type: "light" | "medium" | "heavy" | "success" | "error") => {
  if (typeof window === "undefined") return
  
  const ctx = getCtx()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  // Different haptic patterns
  switch (type) {
    case "light":
      osc.frequency.setValueAtTime(150, now)
      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)
      osc.start(now)
      osc.stop(now + 0.02)
      break
    case "medium":
      osc.frequency.setValueAtTime(100, now)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
      osc.start(now)
      osc.stop(now + 0.04)
      break
    case "heavy":
      osc.frequency.setValueAtTime(60, now)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
      osc.start(now)
      osc.stop(now + 0.06)
      break
    case "success":
      // Two quick taps
      osc.frequency.setValueAtTime(200, now)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)
      gain.gain.setValueAtTime(0.08, now + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
      osc.start(now)
      osc.stop(now + 0.06)
      break
    case "error":
      // Heavy buzz
      osc.type = "square"
      osc.frequency.setValueAtTime(50, now)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
      osc.start(now)
      osc.stop(now + 0.08)
      break
  }
}

// Haptics utility for vibration feedback (works on Android and iOS)
export const haptics = {
  // Light tap for interactions
  tap: () => {
    if (typeof window === "undefined") return
    
    if (isIOS()) {
      createIOSHaptic("light")
    } else if ("vibrate" in navigator) {
      navigator.vibrate(10)
    }
  },

  // Medium vibration for success
  success: () => {
    if (typeof window === "undefined") return
    
    if (isIOS()) {
      createIOSHaptic("success")
    } else if ("vibrate" in navigator) {
      navigator.vibrate([20, 10, 20])
    }
  },

  // Strong vibration for errors
  error: () => {
    if (typeof window === "undefined") return
    
    if (isIOS()) {
      createIOSHaptic("error")
    } else if ("vibrate" in navigator) {
      navigator.vibrate([50, 30, 50])
    }
  },

  // Pattern for completion (celebration)
  complete: () => {
    if (typeof window === "undefined") return
    
    if (isIOS()) {
      createIOSHaptic("heavy")
      setTimeout(() => createIOSHaptic("medium"), 50)
      setTimeout(() => createIOSHaptic("heavy"), 100)
    } else if ("vibrate" in navigator) {
      navigator.vibrate([30, 20, 30, 20, 50])
    }
  },

  // Double tap pattern
  doubleTap: () => {
    if (typeof window === "undefined") return
    
    if (isIOS()) {
      createIOSHaptic("light")
      setTimeout(() => createIOSHaptic("light"), 30)
    } else if ("vibrate" in navigator) {
      navigator.vibrate([15, 10, 15])
    }
  },

  // Celebration haptic (for lesson complete, achievements, etc.)
  celebrate: () => {
    if (typeof window === "undefined") return
    
    if (isIOS()) {
      createIOSHaptic("success")
      setTimeout(() => createIOSHaptic("medium"), 80)
      setTimeout(() => createIOSHaptic("success"), 160)
      setTimeout(() => createIOSHaptic("heavy"), 250)
    } else if ("vibrate" in navigator) {
      navigator.vibrate([20, 30, 20, 30, 40, 30, 60])
    }
  },
}

export const triggerHaptics = (type: "light" | "medium" | "success" | "error" | "complete" | "double" | "celebrate") => {
  switch (type) {
    case "light":
      haptics.tap()
      break
    case "medium":
      haptics.doubleTap()
      break
    case "success":
      haptics.success()
      break
    case "error":
      haptics.error()
      break
    case "complete":
      haptics.complete()
      break
    case "double":
      haptics.doubleTap()
      break
    case "celebrate":
      haptics.celebrate()
      break
    default:
      haptics.tap()
  }
}
