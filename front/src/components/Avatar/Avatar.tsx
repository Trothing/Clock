import {useEffect, useState} from "react";
import {getAvatarColor, getInitials} from "../../utils/avatarColor.ts";

type AvatarProps = {
    avatarUrl?: string | null
    color?: string | null
    seed: string
    className?: string
}

const Avatar = ({avatarUrl, color, seed, className}: AvatarProps) => {
    const [imgFailed, setImgFailed] = useState(false)

    useEffect(() => {
        setImgFailed(false)
    }, [avatarUrl])

    if (avatarUrl && !imgFailed) {
        return <img src={avatarUrl} alt={seed} className={className} style={{objectFit: 'cover'}} onError={() => setImgFailed(true)}/>
    }

    return (
        <div className={className} style={{background: color || getAvatarColor(seed)}}>
            {getInitials(seed)}
        </div>
    )
}

export default Avatar
