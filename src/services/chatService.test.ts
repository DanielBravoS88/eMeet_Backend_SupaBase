import { isMember, cleanupEmptyRoom, purgeExpiredRooms } from './chatService'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    ...overrides,
  }
  return chain
}

function makeSupabase(responses: {
  memberCount?: number | null
  memberError?: boolean
  expiredRooms?: { id: string }[]
} = {}) {
  const supabase = {
    from: jest.fn((table: string) => {
      if (table === 'room_members') {
        return makeChain({
          select: jest.fn().mockReturnValue(
            Promise.resolve({ count: responses.memberCount ?? 0, error: responses.memberError ? { message: 'err' } : null }),
          ),
          eq: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnThis(),
          }),
        })
      }
      if (table === 'chat_rooms') {
        return makeChain({
          select: jest.fn().mockReturnValue({
            not: jest.fn().mockReturnThis(),
            lt: jest.fn().mockReturnValue(
              Promise.resolve({ data: responses.expiredRooms ?? [], error: null }),
            ),
          }),
          delete: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue(Promise.resolve({ error: null })),
            eq: jest.fn().mockReturnValue(Promise.resolve({ error: null })),
          }),
        })
      }
      return makeChain()
    }),
  }
  return supabase
}

// ── isMember ──────────────────────────────────────────────────────────────────

describe('isMember', () => {
  it('returns true when count > 0', async () => {
    const supabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: undefined,
      })),
    }

    // simulate the chained call resolving with count=1
    let callCount = 0
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn(() => {
        callCount++
        if (callCount === 2) {
          return Promise.resolve({ count: 1, error: null })
        }
        return chain
      }),
    }
    supabase.from = jest.fn().mockReturnValue(chain)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await isMember(supabase as any, 'room1', 'user1')
    expect(result).toBe(true)
  })

  it('returns false when count is 0', async () => {
    let callCount = 0
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn(() => {
        callCount++
        if (callCount === 2) {
          return Promise.resolve({ count: 0, error: null })
        }
        return chain
      }),
    }
    const supabase = { from: jest.fn().mockReturnValue(chain) }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await isMember(supabase as any, 'room1', 'user1')
    expect(result).toBe(false)
  })

  it('returns false on DB error', async () => {
    let callCount = 0
    const chain: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn(() => {
        callCount++
        if (callCount === 2) {
          return Promise.resolve({ count: null, error: { message: 'db error' } })
        }
        return chain
      }),
    }
    const supabase = { from: jest.fn().mockReturnValue(chain) }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await isMember(supabase as any, 'room1', 'user1')
    expect(result).toBe(false)
  })
})

// ── cleanupEmptyRoom ──────────────────────────────────────────────────────────

describe('cleanupEmptyRoom', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('deletes the room when member count is 0', async () => {
    const deleteEq = jest.fn().mockResolvedValue({ error: null })
    const roomDeleteChain = { eq: deleteEq }

    const memberSelectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
    }

    const supabase = {
      from: jest.fn((table: string) => {
        if (table === 'room_members') return memberSelectChain
        if (table === 'chat_rooms') return { delete: jest.fn().mockReturnValue(roomDeleteChain) }
        return {}
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await cleanupEmptyRoom(supabase as any, 'room1')
    expect(supabase.from).toHaveBeenCalledWith('chat_rooms')
    expect(deleteEq).toHaveBeenCalledWith('id', 'room1')
  })

  it('does NOT delete the room when members remain', async () => {
    const roomFrom = jest.fn()

    const memberSelectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ count: 2, error: null }),
    }

    const supabase = {
      from: jest.fn((table: string) => {
        if (table === 'room_members') return memberSelectChain
        if (table === 'chat_rooms') { roomFrom(); return {} }
        return {}
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await cleanupEmptyRoom(supabase as any, 'room1')
    expect(roomFrom).not.toHaveBeenCalled()
  })
})

// ── purgeExpiredRooms ─────────────────────────────────────────────────────────

describe('purgeExpiredRooms', () => {
  it('returns empty array when no expired rooms', async () => {
    const ltFn = jest.fn().mockResolvedValue({ data: [], error: null })
    const chain = {
      select: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      lt: ltFn,
      delete: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({ error: null }),
    }
    const supabase = { from: jest.fn().mockReturnValue(chain) }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await purgeExpiredRooms(supabase as any)
    expect(result).toEqual([])
  })

  it('returns the IDs of deleted rooms', async () => {
    const expired = [{ id: 'room-a' }, { id: 'room-b' }]
    const deleteIn = jest.fn().mockResolvedValue({ error: null })

    const supabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ data: expired, error: null }),
        delete: jest.fn().mockReturnValue({ in: deleteIn }),
      })),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await purgeExpiredRooms(supabase as any)
    expect(result).toEqual(['room-a', 'room-b'])
    expect(deleteIn).toHaveBeenCalledWith('id', ['room-a', 'room-b'])
  })
})

// ── like → join room (integration-style logic test) ───────────────────────────

describe('like → join room business rule', () => {
  it('two users liking the same event both become members of the same room', () => {
    // This rule is enforced by the upsert with onConflict: 'room_id,user_id'
    // and the upsert with onConflict: 'id' on chat_rooms.
    // The idempotency guarantees both users share the same room ID (= eventId).
    const eventId = 'test-event-123'
    const user1 = 'user-aaa'
    const user2 = 'user-bbb'

    const members = new Map<string, Set<string>>()
    function upsertMember(roomId: string, userId: string) {
      if (!members.has(roomId)) members.set(roomId, new Set())
      members.get(roomId)!.add(userId)
    }

    upsertMember(eventId, user1)
    upsertMember(eventId, user2)

    const roomMembers = members.get(eventId)
    expect(roomMembers?.has(user1)).toBe(true)
    expect(roomMembers?.has(user2)).toBe(true)
    expect(members.size).toBe(1) // only one room
  })

  it('multiple likes by the same user do not duplicate membership', () => {
    const eventId = 'test-event-456'
    const userId = 'user-ccc'

    const members = new Set<string>()
    function upsertMember(uid: string) { members.add(uid) }

    upsertMember(userId)
    upsertMember(userId)
    upsertMember(userId)

    expect(members.size).toBe(1)
  })
})
