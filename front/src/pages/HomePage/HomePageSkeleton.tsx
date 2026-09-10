import Skeleton from "../../components/Skeleton/Skeleton.tsx";
import ChatListSkeleton from "../../components/ChatListSkeleton/ChatListSkeleton.tsx";
import homeStyles from './homePage.module.scss'
import styles from './HomePageSkeleton.module.scss'

const HomePageSkeleton = () => {
    return (
        <div className={homeStyles.shell}>
            <div className={homeStyles.railSlot}>
                <div className={styles.rail}>
                    <Skeleton width={40} height={40} radius="30%"/>
                    <div className={styles.railSpacer}/>
                    <Skeleton width={38} height={38} radius="50%"/>
                </div>
            </div>
            <div className={styles.chatSide}>
                <div className={styles.chatSideHeader}>
                    <Skeleton width={70} height={17}/>
                    <Skeleton width={30} height={30} radius="50%"/>
                </div>
                <div className={styles.searchBar}>
                    <Skeleton height={34} radius={18}/>
                </div>
                <ChatListSkeleton/>
            </div>
            <div className={homeStyles.chatPane}/>
        </div>
    )
}

export default HomePageSkeleton
