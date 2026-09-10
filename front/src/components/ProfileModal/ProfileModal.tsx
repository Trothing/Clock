import {useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {z} from "zod";
import {AtSign, Camera, LogOut, Pencil, X} from "lucide-react";
import {type User, updateProfileSchema} from "../../types/user.type.ts";
import {getAvatarColor, PALETTE} from "../../utils/avatarColor.ts";
import {getErrorMessage} from "../../utils/error.ts";
import useLogout from "../../hooks/auth/useLogout.ts";
import useUpdateProfile from "../../queries/users/useUpdateProfile.ts";
import useUploadFile from "../../queries/uploads/useUploadFile.ts";
import Modal from "../Modal/Modal.tsx";
import Avatar from "../Avatar/Avatar.tsx";
import formStyles from '../../pages/auth/authForm.module.scss'
import styles from './ProfileModal.module.scss'

type ProfileModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User
}

const ProfileModal = ({open, onOpenChange, user}: ProfileModalProps) => {
    const {logout, loading, error: logoutError} = useLogout()
    const navigate = useNavigate()
    const {mutate: updateProfile, isPending: isSaving} = useUpdateProfile()
    const {mutate: uploadAvatar, isPending: isUploadingAvatar} = useUploadFile('avatar')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [description, setDescription] = useState('')
    const [phone, setPhone] = useState('')
    const [formError, setFormError] = useState<string | null>(null)

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setIsEditing(false)
            setFormError(null)
        }
        onOpenChange(nextOpen)
    }

    const startEditing = () => {
        setName(user.name ?? '')
        setUsername(user.username)
        setDescription(user.description ?? '')
        setPhone(user.phone ?? '')
        setFormError(null)
        setIsEditing(true)
    }

    const handlePickColor = (color: typeof PALETTE[number]) => {
        updateProfile({avatarColor: color}, {
            onError: (err) => setFormError(getErrorMessage(err, 'Failed to change color')),
        })
    }

    const handleAvatarClick = () => {
        if (isEditing) fileInputRef.current?.click()
    }

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return

        setFormError(null)
        uploadAvatar(file, {
            onSuccess: ({url}) => updateProfile({avatarUrl: url}, {
                onSuccess: () => setFormError(null),
                onError: (err) => setFormError(getErrorMessage(err, 'Failed to update avatar')),
            }),
            onError: (err) => setFormError(getErrorMessage(err, 'Failed to upload avatar')),
        })
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)

        const result = updateProfileSchema.safeParse({
            name: name.trim(),
            username: username.trim(),
            description: description.trim(),
            phone: phone.trim() || undefined,
        })

        if (!result.success) {
            setFormError(z.prettifyError(result.error))
            return
        }

        updateProfile(result.data, {
            onSuccess: () => setIsEditing(false),
            onError: (err) => setFormError(getErrorMessage(err, 'Failed to update profile')),
        })
    }

    const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
    })

    return (
        <Modal open={open} onOpenChange={handleOpenChange} title="Profile">
            <div className={styles.banner} style={{background: `linear-gradient(135deg, ${user.avatarColor || getAvatarColor(user.username)}, var(--color-accent))`}}/>
            <div className={styles.body}>
                <button type="button" className={styles.avatarButton} onClick={handleAvatarClick} disabled={!isEditing}>
                    <Avatar avatarUrl={user.avatarUrl} color={user.avatarColor} seed={user.name || user.username} className={styles.avatar}/>
                    {isEditing && (
                        <span className={styles.avatarOverlay}>
                            <Camera size={18}/>
                        </span>
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className={styles.hiddenFileInput}
                    onChange={handleAvatarFileChange}
                />
                {isUploadingAvatar && <span className={styles.uploadingHint}>Uploading avatar...</span>}

                {isEditing && (
                    <div className={styles.colorSwatches}>
                        {PALETTE.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className={`${styles.colorSwatch} ${user.avatarColor === color ? styles.colorSwatchActive : ''}`}
                                style={{background: color}}
                                onClick={() => handlePickColor(color)}
                                title="Background color"
                            />
                        ))}
                    </div>
                )}

                {!isEditing ? (
                    <>
                        <span className={styles.name}>{user.name || user.username}</span>
                        <span className={styles.username}>
                            <AtSign size={13}/>
                            {user.username}
                        </span>

                        {user.description && <p className={styles.description}>{user.description}</p>}

                        <span className={styles.memberSince}>Member since {memberSince}</span>

                        <button type="button" className={styles.secondaryButton} onClick={startEditing}>
                            <Pencil size={15}/>
                            Edit profile
                        </button>

                        <button type="button" className={styles.logoutButton} onClick={async () => {
                            const success = await logout()
                            if (!success) return
                            onOpenChange(false)
                            navigate('/login')
                        }} disabled={loading}>
                            <LogOut size={16}/>
                            {loading ? 'Signing out...' : 'Sign out'}
                        </button>
                        {logoutError && <p className={formStyles.error}>{logoutError}</p>}
                    </>
                ) : (
                    <form onSubmit={handleSave} className={`${formStyles.form} ${styles.editForm}`}>
                        <div className={formStyles.field}>
                            <label htmlFor="profile-name" className={formStyles.label}>Name</label>
                            <input
                                id="profile-name"
                                type="text"
                                className={formStyles.input}
                                style={{paddingLeft: 12}}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className={formStyles.field}>
                            <label htmlFor="profile-username" className={formStyles.label}>Username</label>
                            <div className={formStyles.inputWrapper}>
                                <AtSign size={15} className={formStyles.inputIcon}/>
                                <input
                                    id="profile-username"
                                    type="text"
                                    className={formStyles.input}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={formStyles.field}>
                            <label htmlFor="profile-phone" className={formStyles.label}>Phone</label>
                            <input
                                id="profile-phone"
                                type="text"
                                className={formStyles.input}
                                style={{paddingLeft: 12}}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+380..."
                            />
                        </div>

                        <div className={formStyles.field}>
                            <label htmlFor="profile-description" className={formStyles.label}>About me</label>
                            <textarea
                                id="profile-description"
                                className={styles.textarea}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {formError && <p className={formStyles.error}>{formError}</p>}

                        <div className={styles.editActions}>
                            <button type="button" className={styles.cancelButton} onClick={() => setIsEditing(false)}>
                                <X size={15}/>
                                Cancel
                            </button>
                            <button type="submit" className={formStyles.submitButton} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    )
}

export default ProfileModal
