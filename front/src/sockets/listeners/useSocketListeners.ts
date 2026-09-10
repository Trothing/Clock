import useChatListeners from "./useChatListeners.ts";
import {useMessageListeners} from "./useMessageListeners.ts";

const useSocketListeners = () => {
    useChatListeners()
    useMessageListeners()
}
export default useSocketListeners