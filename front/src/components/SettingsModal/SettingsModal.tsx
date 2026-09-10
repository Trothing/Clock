import {useState} from "react";
import {Volume2} from "lucide-react";
import Modal from "../Modal/Modal.tsx";
import Select from "../Select/Select.tsx";
import usePrivacySettings from "../../queries/privacy/usePrivacySettings.ts";
import useUpdatePrivacySettings from "../../queries/privacy/useUpdatePrivacySettings.ts";
import {getSoundEnabled, setSoundEnabled} from "../../utils/soundSettings.ts";
import {getErrorMessage} from "../../utils/error.ts";
import type {PrivacyLevel, PrivacySettings} from "../../types/privacySettings.type.ts";
import styles from './SettingsModal.module.scss'

type SettingsModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const LEVEL_LABELS: Record<PrivacyLevel, string> = {
    everyone: 'Everyone',
    contacts: 'Contacts only',
    nobody: 'Nobody',
}

const LEVEL_OPTIONS = (Object.keys(LEVEL_LABELS) as PrivacyLevel[]).map((level) => ({
    value: level,
    label: LEVEL_LABELS[level],
}))

const LEVEL_ROWS: {key: keyof Pick<PrivacySettings, 'whoCanMessage' | 'whoCanAddToGroups' | 'whoCanSeeLastSeen' | 'whoCanSeePhone'>, label: string}[] = [
    {key: 'whoCanMessage', label: 'Who can message me'},
    {key: 'whoCanAddToGroups', label: 'Who can add me to groups'},
    {key: 'whoCanSeeLastSeen', label: 'Who can see my last seen time'},
    {key: 'whoCanSeePhone', label: 'Who can see my phone number'},
]

const SettingsModal = ({open, onOpenChange}: SettingsModalProps) => {
    const {data: settings, isLoading} = usePrivacySettings()
    const {mutate: updateSettings, isPending} = useUpdatePrivacySettings()
    const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled)
    const [error, setError] = useState<string | null>(null)

    const handleToggleSound = () => {
        const next = !soundEnabled
        setSoundEnabledState(next)
        setSoundEnabled(next)
    }

    const handleUpdateSettings = (data: Parameters<typeof updateSettings>[0]) => {
        setError(null)
        updateSettings(data, {onError: (err) => setError(getErrorMessage(err, 'Failed to save settings'))})
    }

    return (
        <Modal open={open} onOpenChange={onOpenChange} title="Options">
            <div className={styles.body}>
                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Privacy</span>

                    {isLoading && <div className={styles.state}>Loading...</div>}

                    {settings && LEVEL_ROWS.map(({key, label}) => (
                        <div key={key} className={styles.selectRow}>
                            <span>{label}</span>
                            <Select
                                value={settings[key]}
                                options={LEVEL_OPTIONS}
                                disabled={isPending}
                                onChange={(level) => handleUpdateSettings({[key]: level})}
                            />
                        </div>
                    ))}

                    {settings && (
                        <button
                            type="button"
                            className={styles.toggleRow}
                            disabled={isPending}
                            onClick={() => handleUpdateSettings({readReceiptsEnabled: !settings.readReceiptsEnabled})}
                        >
                            <span>Read receipts</span>
                            <span className={`${styles.switch} ${settings.readReceiptsEnabled ? styles.switchOn : ''}`}>
                                <span className={styles.switchKnob}/>
                            </span>
                        </button>
                    )}

                    {error && <span className={styles.error}>{error}</span>}
                </div>

                <div className={styles.section}>
                    <span className={styles.sectionTitle}>Notifications</span>
                    <button type="button" className={styles.toggleRow} onClick={handleToggleSound}>
                        <Volume2 size={15}/>
                        <span>Message sound</span>
                        <span className={`${styles.switch} ${soundEnabled ? styles.switchOn : ''}`}>
                            <span className={styles.switchKnob}/>
                        </span>
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default SettingsModal
