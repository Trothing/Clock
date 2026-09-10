import {useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {AtSign, Eye, EyeOff, Lock} from "lucide-react";
import {loginSchema} from "../../../types/auth.type.ts";
import {getFieldErrors} from "../../../utils/zodFieldErrors.ts";
import useLogin from "../../../hooks/auth/useLogin.ts";
import AuthLayout from "../AuthLayout.tsx";
import Spinner from "../../../components/Spinner/Spinner.tsx";
import formStyles from '../authForm.module.scss'

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const navigate = useNavigate()
    const identifierRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)

    const {loading: loadingLogin, error: errorLogin, login} = useLogin()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFieldErrors({})

        const result = loginSchema.safeParse({identifier, password})

        if (!result.success) {
            const errors = getFieldErrors(result.error)
            setFieldErrors(errors)
            const firstInvalidField = errors.identifier ? identifierRef.current : passwordRef.current
            firstInvalidField?.focus()
            return
        }

        const user = await login(result.data)
        if (user) {
            navigate('/')
        }
    }

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit} className={formStyles.form} noValidate>
                <h1 className={formStyles.title}>Sign in to your account</h1>

                <div className={formStyles.field}>
                    <label htmlFor="identifier" className={formStyles.label}>Username or email</label>
                    <div className={formStyles.inputWrapper}>
                        <AtSign size={16} className={formStyles.inputIcon}/>
                        <input
                            ref={identifierRef}
                            id="identifier"
                            type="text"
                            autoComplete="username"
                            className={`${formStyles.input} ${fieldErrors.identifier ? formStyles.inputInvalid : ''}`}
                            placeholder="username@example.com"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>
                    {fieldErrors.identifier && <p className={formStyles.fieldError}>{fieldErrors.identifier}</p>}
                </div>

                <div className={formStyles.field}>
                    <label htmlFor="password" className={formStyles.label}>Password</label>
                    <div className={formStyles.inputWrapper}>
                        <Lock size={16} className={formStyles.inputIcon}/>
                        <input
                            ref={passwordRef}
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            className={`${formStyles.input} ${formStyles.inputWithToggle} ${fieldErrors.password ? formStyles.inputInvalid : ''}`}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className={formStyles.passwordToggle}
                            onClick={() => setShowPassword((prev) => !prev)}
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                    </div>
                    {fieldErrors.password && <p className={formStyles.fieldError}>{fieldErrors.password}</p>}
                </div>

                {errorLogin && <p className={formStyles.error}>{errorLogin}</p>}

                <button type="submit" className={formStyles.submitButton} disabled={loadingLogin}>
                    {loadingLogin && <Spinner/>}
                    {loadingLogin ? 'Signing in...' : 'Sign in'}
                </button>

                <p className={formStyles.switchLink}>Don't have an account? <Link to="/register">Create one</Link></p>
            </form>
        </AuthLayout>
    );
};
export default LoginPage;
