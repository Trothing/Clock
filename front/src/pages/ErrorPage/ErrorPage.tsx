import {Link, useRouteError} from "react-router-dom";
import styles from './ErrorPage.module.scss'

const ErrorPage = () => {
    const error = useRouteError()
    const message = error instanceof Error ? error.message : 'An unknown error occurred'

    return (
        <div className={styles.wrapper}>
            <p className={styles.title}>Something went wrong</p>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
                <button type="button" className={styles.button} onClick={() => window.location.reload()}>
                    Reload page
                </button>
                <Link to="/" className={styles.link}>Go home</Link>
            </div>
        </div>
    )
}

export default ErrorPage
