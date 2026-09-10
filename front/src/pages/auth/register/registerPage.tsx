import {useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {AtSign, Eye, EyeOff, Lock, Mail, MessageSquare, Phone, User} from "lucide-react";
import {registerSchema} from "../../../types/auth.type.ts";
import {getFieldErrors} from "../../../utils/zodFieldErrors.ts";
import useRegister from "../../../hooks/auth/useRegister.ts";
import AuthLayout from "../AuthLayout.tsx";
import Spinner from "../../../components/Spinner/Spinner.tsx";
import formStyles from '../authForm.module.scss'

const FIELD_ORDER = ['username', 'name', 'email', 'phone', 'description', 'password', 'confirmPassword'] as const

const RegisterPage = () => {
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [description, setDescription] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const navigate = useNavigate()

    const fieldRefs = {
        username: useRef<HTMLInputElement>(null),
        name: useRef<HTMLInputElement>(null),
        email: useRef<HTMLInputElement>(null),
        phone: useRef<HTMLInputElement>(null),
        description: useRef<HTMLInputElement>(null),
        password: useRef<HTMLInputElement>(null),
        confirmPassword: useRef<HTMLInputElement>(null),
    }

    const {loading: loadingRegister, error: errorRegister, register} = useRegister()

    const focusFirstInvalid = (errors: Record<string, string>) => {
        const firstField = FIELD_ORDER.find((field) => errors[field])
        if (firstField) fieldRefs[firstField].current?.focus()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFieldErrors({})

        if (password !== confirmPassword) {
            const errors = {confirmPassword: 'Passwords do not match'}
            setFieldErrors(errors)
            focusFirstInvalid(errors)
            return
        }

        const result = registerSchema.safeParse({
            username,
            name: name || undefined,
            email,
            phone: phone || undefined,
            description: description || undefined,
            password
        })

        if (!result.success) {
            const errors = getFieldErrors(result.error)
            setFieldErrors(errors)
            focusFirstInvalid(errors)
            return
        }

        const user = await register(result.data)
        if (user) {
            navigate('/')
        }
    }

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit} className={formStyles.form} noValidate>
                <h1 className={formStyles.title}>Create account</h1>

                <div className={formStyles.field}>
                    <label htmlFor="username" className={formStyles.label}>Username</label>
                    <div className={formStyles.inputWrapper}>
                        <AtSign size={16} className={formStyles.inputIcon}/>
                        <input
                            ref={fieldRefs.username}
                            id="username"
                            type="text"
                            autoComplete="username"
                            className={`${formStyles.input} ${fieldErrors.username ? formStyles.inputInvalid : ''}`}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    {fieldErrors.username && <p className={formStyles.fieldError}>{fieldErrors.username}</p>}
                </div>

                <div className={formStyles.field}>
                    <label htmlFor="name" className={formStyles.label}>Name</label>
                    <div className={formStyles.inputWrapper}>
                        <User size={16} className={formStyles.inputIcon}/>
                        <input
                            ref={fieldRefs.name}
                            id="name"
                            type="text"
                            autoComplete="name"
                            className={formStyles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div className={formStyles.field}>
                    <label htmlFor="email" className={formStyles.label}>Email</label>
                    <div className={formStyles.inputWrapper}>
                        <Mail size={16} className={formStyles.inputIcon}/>
                        <input
                            ref={fieldRefs.email}
                            id="email"
                            type="email"
                            autoComplete="email"
                            className={`${formStyles.input} ${fieldErrors.email ? formStyles.inputInvalid : ''}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {fieldErrors.email && <p className={formStyles.fieldError}>{fieldErrors.email}</p>}
                </div>

                <div className={formStyles.field}>
                    <label htmlFor="phone" className={formStyles.label}>Phone</label>
                    <div className={formStyles.inputWrapper}>
                        <Phone size={16} className={formStyles.inputIcon}/>
                        <input
                            ref={fieldRefs.phone}
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            className={`${formStyles.input} ${fieldErrors.phone ? formStyles.inputInvalid : ''}`}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    {fieldErrors.phone && <p className={formStyles.fieldError}>{fieldErrors.phone}</p>}
                </div>

                <div className={formStyles.field}>
                    <label htmlFor="description" className={formStyles.label}>About me</label>
                    <div className={formStyles.inputWrapper}>
                        <MessageSquare size={16} className={formStyles.inputIcon}/>
                        <input
                            ref={fieldRefs.description}
                            id="description"
                            type="text"
                            className={formStyles.input}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className={formStyles.field}>
                    <label htmlFor="password" className={formStyles.label}>Password</label>
                    <div className={formStyles.inputWrapper}>
                        <Lock size={16} className={formStyles.inputIcon}/>
                        <input
                            ref={fieldRefs.password}
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            className={`${formStyles.input} ${formStyles.inputWithToggle} ${fieldErrors.password ? formStyles.inputInvalid : ''}`}
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

                <div className={formStyles.field}>
                    <label htmlFor="confirmPassword" className={formStyles.label}>Confirm password</label>
                    <div className={formStyles.inputWrapper}>
                        <Lock size={16} className={formStyles.inputIcon}/>
                        <input
                            ref={fieldRefs.confirmPassword}
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            className={`${formStyles.input} ${formStyles.inputWithToggle} ${fieldErrors.confirmPassword ? formStyles.inputInvalid : ''}`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className={formStyles.passwordToggle}
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className={formStyles.fieldError}>{fieldErrors.confirmPassword}</p>}
                </div>

                {errorRegister && <p className={formStyles.error}>{errorRegister}</p>}

                <button type="submit" className={formStyles.submitButton} disabled={loadingRegister}>
                    {loadingRegister && <Spinner/>}
                    {loadingRegister ? 'Creating...' : 'Create account'}
                </button>

                <p className={formStyles.switchLink}>Already have an account? <Link to="/login">Sign in</Link></p>
            </form>
        </AuthLayout>
    );
};
export default RegisterPage
