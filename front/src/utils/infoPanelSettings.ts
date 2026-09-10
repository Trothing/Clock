const INFO_PANEL_OPEN_KEY = 'clock:infoPanelOpen'

export function getInfoPanelOpen(): boolean {
    try {
        return localStorage.getItem(INFO_PANEL_OPEN_KEY) === 'true'
    } catch {
        return false
    }
}

export function setInfoPanelOpenSetting(open: boolean) {
    try {
        localStorage.setItem(INFO_PANEL_OPEN_KEY, String(open))
    } catch {}
}
