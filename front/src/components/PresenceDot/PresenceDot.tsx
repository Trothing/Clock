import styles from './PresenceDot.module.scss'

type PresenceDotProps = {
    online: boolean
    size?: number
    className?: string
}

const PresenceDot = ({online, size = 10, className}: PresenceDotProps) => (
    <span
        className={`${styles.dot} ${online ? styles.online : styles.offline} ${className ?? ''}`}
        style={{width: size, height: size}}
    />
)

export default PresenceDot
