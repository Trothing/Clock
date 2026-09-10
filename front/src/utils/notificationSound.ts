let audioCtx: AudioContext | null = null

export function playNotificationSound() {
    try {
        if (!audioCtx) audioCtx = new AudioContext()
        const ctx = audioCtx
        if (ctx.state === 'suspended') void ctx.resume()

        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, now)
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.12)

        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.18, now + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.3)
    } catch {}
}
