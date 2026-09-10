import Skeleton from "../Skeleton/Skeleton.tsx";
import styles from './ChatPageSkeleton.module.scss'

const BUBBLE_WIDTHS = [140, 220, 170, 260, 130, 190]

const ChatPageSkeleton = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <Skeleton width={40} height={40} radius="50%"/>
                <div className={styles.headerLines}>
                    <Skeleton width={120} height={14}/>
                    <Skeleton width={80} height={11}/>
                </div>
            </div>

            <div className={styles.messages}>
                {BUBBLE_WIDTHS.map((width, i) => (
                    <div className={styles.row} key={i} style={{justifyContent: i % 3 === 1 ? 'flex-end' : 'flex-start'}}>
                        <Skeleton width={width} height={36} radius={14}/>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChatPageSkeleton
