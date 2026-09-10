import {Link} from "react-router-dom";
import styles from './NotFoundPage.module.scss'

const NotFoundPage = () => {
    return (
        <div className={styles.wrapper}>
            <span className={styles.code}>404</span>
            <p className={styles.text}>This page doesn't exist</p>
            <Link to="/" className={styles.link}>Go home</Link>
        </div>
    )
}

export default NotFoundPage
