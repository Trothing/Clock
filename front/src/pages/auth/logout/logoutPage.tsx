import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import useLogout from "../../../hooks/auth/useLogout.ts";
import AuthLayout from "../AuthLayout.tsx";
import Spinner from "../../../components/Spinner/Spinner.tsx";
import formStyles from '../authForm.module.scss'

const LogoutPage = () => {
    const navigate = useNavigate()
    const {loading, error, logout} = useLogout()

    useEffect(() => {
        logout().then((success) => {
            if (success) navigate('/login')
        })
    }, [])

    const handleRetry = () => {
        logout().then((success) => {
            if (success) navigate('/login')
        })
    }

    return (
        <AuthLayout>
            <div className={formStyles.form}>
                <h1 className={formStyles.title}>Signing out</h1>

                {loading && (
                    <div className={formStyles.field}>
                        <Spinner/>
                    </div>
                )}

                {error && (
                    <>
                        <p className={formStyles.error}>{error}</p>
                        <button type="button" className={formStyles.submitButton} onClick={handleRetry}>
                            Try again
                        </button>
                    </>
                )}
            </div>
        </AuthLayout>
    )
}

export default LogoutPage
