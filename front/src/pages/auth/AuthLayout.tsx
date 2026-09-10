import type {ReactNode} from "react";
import styles from './authLayout.module.scss'

type AuthLayoutProps = {
    children: ReactNode
}

const AuthLayout = ({children}: AuthLayoutProps) => {
    return (
        <div className={styles.layout}>
            <div className={styles.card}>
                <div className={styles.brand}>Clock</div>
                <div className={styles.ruler}/>
                {children}
            </div>
        </div>
    )
}

export default AuthLayout
