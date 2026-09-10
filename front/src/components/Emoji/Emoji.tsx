import type {CSSProperties} from "react";
import twemoji from "twemoji";
import {escapeHtml} from "../../utils/escapeHtml.ts";
import styles from './Emoji.module.scss'

type EmojiProps = {
    emoji: string
    size?: number
    className?: string
}

const Emoji = ({emoji, size = 16, className}: EmojiProps) => {
    const html = twemoji.parse(escapeHtml(emoji), {folder: 'svg', ext: '.svg'})

    return (
        <span
            className={`${styles.emoji} ${className ?? ''}`}
            style={{'--emoji-size': `${size}px`} as CSSProperties}
            dangerouslySetInnerHTML={{__html: html}}
        />
    )
}

export default Emoji
