type UserId = number

const numberOfConnectionsState = new Map<UserId, number>()

export function updateNumberOfConnectionsState(how: 'decrease' | 'increase', userId: UserId){
    const current = numberOfConnectionsState.get(userId) ?? 0
    const next = how === 'increase' ? current + 1 : Math.max(0, current - 1)
    numberOfConnectionsState.set(userId, next)
    return next
}

export function getNumberOfConnectionsState(userId: UserId){
    return numberOfConnectionsState.get(userId) ?? 0
}
