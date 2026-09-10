import {getPrivacySettings, isInContacts, upsertPrivacySettings} from "./privacy.repository.js";
import {isBlockedEitherWay} from "../blockedUsers/blockedUsers.repository.js";
import type {PrivacySettingsPublic, UpdatePrivacySettingsInput} from "../../types/privacySettings.type.js";

const DEFAULT_SETTINGS: PrivacySettingsPublic = {
    whoCanAddToGroups: 'everyone',
    whoCanMessage: 'everyone',
    whoCanSeeLastSeen: 'everyone',
    whoCanSeePhone: 'contacts',
    readReceiptsEnabled: true,
}

export async function getSettings(userId: number): Promise<PrivacySettingsPublic> {
    const row = await getPrivacySettings(userId)
    if (!row) return DEFAULT_SETTINGS
    const {userId: _userId, updatedAt: _updatedAt, ...rest} = row
    return rest
}

export async function updateSettings(userId: number, data: UpdatePrivacySettingsInput): Promise<PrivacySettingsPublic> {
    const row = await upsertPrivacySettings(userId, data)
    const {userId: _userId, updatedAt: _updatedAt, ...rest} = row
    return rest
}

export async function canSeeLastSeen(viewerId: number, targetId: number): Promise<boolean> {
    if (viewerId === targetId) return true
    if (await isBlockedEitherWay(viewerId, targetId)) return false

    const settings = await getPrivacySettings(targetId);
    const level = settings?.whoCanSeeLastSeen ?? 'everyone';

    if (level === 'everyone') return true;
    if (level === 'nobody') return false;
    return isInContacts(targetId, viewerId);
}

export async function canSeeReadReceipts(targetId: number): Promise<boolean> {
    const settings = await getPrivacySettings(targetId);
    return settings?.readReceiptsEnabled ?? true;
}

export async function canAddToGroup(actorId: number, targetId: number): Promise<boolean> {
    if (await isBlockedEitherWay(actorId, targetId)) return false;

    const settings = await getPrivacySettings(targetId);
    const level = settings?.whoCanAddToGroups ?? 'everyone';

    if (level === 'everyone') return true;
    if (level === 'nobody') return false;
    return isInContacts(targetId, actorId);
}

export async function canMessage(actorId: number, targetId: number): Promise<boolean> {
    if (await isBlockedEitherWay(actorId, targetId)) return false;

    const settings = await getPrivacySettings(targetId);
    const level = settings?.whoCanMessage ?? 'everyone';

    if (level === 'everyone') return true;
    if (level === 'nobody') return false;
    return isInContacts(targetId, actorId);
}