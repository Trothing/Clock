const SOUND_ENABLED_KEY = 'clock:messageSoundEnabled'

export function getSoundEnabled(): boolean {
    try {
        const stored = localStorage.getItem(SOUND_ENABLED_KEY)
        return stored === null ? true : stored === 'true'
    } catch {
        return true
    }
}

export function setSoundEnabled(enabled: boolean) {
    try {
        localStorage.setItem(SOUND_ENABLED_KEY, String(enabled))
    } catch {}
}
