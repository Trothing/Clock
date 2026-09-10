import {MessagesSquare} from "lucide-react";
import styles from './noChatSelected.module.scss'

const NoChatSelected = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.iconCircle}>
                <MessagesSquare size={32}/>
            </div>
            <p className={styles.title}>Choose a chat from the list</p>
            <p className={styles.subtitle}>or start a new conversation via search or contacts</p>
        </div>
    )
}

export default NoChatSelected
