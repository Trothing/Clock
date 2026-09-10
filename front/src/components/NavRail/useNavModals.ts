import {useState} from "react";
import {useNavigate} from "react-router-dom";
import useOpenSavedChat from "../../queries/chats/useOpenSavedChat.ts";

function useNavModals() {
    const navigate = useNavigate()
    const [profileOpen, setProfileOpen] = useState(false)
    const [archiveOpen, setArchiveOpen] = useState(false)
    const [contactsOpen, setContactsOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const {mutate: openSavedChat} = useOpenSavedChat()

    const handleOpenSaved = () => {
        openSavedChat(undefined, {
            onSuccess: (chat) => navigate(`/chats/${chat.id}`),
        })
    }

    return {
        profileOpen, setProfileOpen,
        archiveOpen, setArchiveOpen,
        contactsOpen, setContactsOpen,
        settingsOpen, setSettingsOpen,
        handleOpenSaved,
    }
}

export default useNavModals
