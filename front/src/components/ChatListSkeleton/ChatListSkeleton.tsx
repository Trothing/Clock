import Skeleton from "../Skeleton/Skeleton.tsx";
import styles from './ChatListSkeleton.module.scss'

type ChatListSkeletonProps = {
    rows?: number
}

const ChatListSkeleton = ({rows = 7}: ChatListSkeletonProps) => {
    return (
        <div className={styles.list}>
            {Array.from({length: rows}).map((_, i) => (
                <div className={styles.row} key={i}>
                    <Skeleton width={44} height={44} radius="50%"/>
                    <div className={styles.lines}>
                        <div className={styles.topLine}>
                            <Skeleton width="55%" height={13}/>
                            <Skeleton width={28} height={11}/>
                        </div>
                        <Skeleton width="80%" height={12}/>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ChatListSkeleton
