import type {CSSProperties} from "react";
import styles from './Skeleton.module.scss'

type SkeletonProps = {
    width?: number | string
    height?: number | string
    radius?: number | string
    className?: string
}

const Skeleton = ({width = '100%', height = 14, radius = 6, className}: SkeletonProps) => {
    const style: CSSProperties = {width, height, borderRadius: radius}
    return <span className={`${styles.skeleton} ${className ?? ''}`} style={style}/>
}

export default Skeleton
