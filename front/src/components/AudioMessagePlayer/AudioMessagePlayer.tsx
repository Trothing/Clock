import {useEffect, useRef, useState, type MouseEvent} from "react";
import {Pause, Play} from "lucide-react";
import styles from './AudioMessagePlayer.module.scss'

type AudioMessagePlayerProps = {
    src: string
    duration?: number | null
    className?: string
    label?: string
}

function formatDuration(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
}

let currentlyPlayingAudio: HTMLAudioElement | null = null

const AudioMessagePlayer = ({src, duration, className, label}: AudioMessagePlayerProps) => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [totalDuration, setTotalDuration] = useState(duration ?? 0)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const onTimeUpdate = () => setCurrentTime(audio.currentTime)
        const onLoadedMetadata = () => {
            if (isFinite(audio.duration)) setTotalDuration(audio.duration)
        }
        const onEnded = () => {
            setCurrentTime(0)
        }
        const onPlay = () => {
            if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
                currentlyPlayingAudio.pause()
            }
            currentlyPlayingAudio = audio
            setIsPlaying(true)
        }
        const onPause = () => {
            setIsPlaying(false)
            if (currentlyPlayingAudio === audio) currentlyPlayingAudio = null
        }

        audio.addEventListener('timeupdate', onTimeUpdate)
        audio.addEventListener('loadedmetadata', onLoadedMetadata)
        audio.addEventListener('ended', onEnded)
        audio.addEventListener('play', onPlay)
        audio.addEventListener('pause', onPause)
        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate)
            audio.removeEventListener('loadedmetadata', onLoadedMetadata)
            audio.removeEventListener('ended', onEnded)
            audio.removeEventListener('play', onPlay)
            audio.removeEventListener('pause', onPause)
            if (currentlyPlayingAudio === audio) currentlyPlayingAudio = null
        }
    }, [])

    const togglePlay = () => {
        const audio = audioRef.current
        if (!audio) return
        if (isPlaying) {
            audio.pause()
        } else {
            void audio.play()
        }
    }

    const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current
        if (!audio || !totalDuration) return
        const rect = e.currentTarget.getBoundingClientRect()
        const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
        audio.currentTime = ratio * totalDuration
        setCurrentTime(audio.currentTime)
    }

    const progress = totalDuration ? (currentTime / totalDuration) * 100 : 0

    return (
        <div className={`${styles.wrapper} ${className ?? ''}`}>
            {label && <span className={styles.label}>{label}</span>}
            <div className={styles.player}>
                <audio ref={audioRef} src={src} preload="metadata"/>
                <button type="button" className={styles.playButton} onClick={togglePlay}>
                    {isPlaying ? <Pause size={15} fill="currentColor"/> : <Play size={15} fill="currentColor"/>}
                </button>
                <div className={styles.progressTrack} onClick={handleSeek}>
                    <div className={styles.progressFill} style={{width: `${progress}%`}}/>
                    <div className={styles.progressThumb} style={{left: `${progress}%`}}/>
                </div>
                <span className={styles.time}>{formatDuration(currentTime > 0 ? currentTime : totalDuration)}</span>
            </div>
        </div>
    )
}

export default AudioMessagePlayer
