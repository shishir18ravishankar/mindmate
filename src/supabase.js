import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function normalizeProfile(row) {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    studying: row.study,
    freeTime: row.free_time,
    building: row.building || '',
    lookingFor: row.looking_for,
    funFact: row.fun_fact,
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────

export async function signUp({ username, password, name, studying, freeTime, building, lookingFor, funFact }) {
  const { data, error } = await supabase
    .from('mindmate_profiles')
    .insert([{
      username,
      password,
      name,
      study: studying,
      free_time: freeTime,
      building: building || null,
      looking_for: lookingFor,
      fun_fact: funFact,
    }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('That username is already taken — try another.')
    throw new Error(error.message)
  }
  return data
}

export async function login(username, password) {
  const { data, error } = await supabase
    .from('mindmate_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !data) throw new Error('Username not found.')
  if (data.password !== password) throw new Error('Incorrect password.')
  return data
}

// ── Profiles ──────────────────────────────────────────────────────────────

// Returns IDs of all users with any connection row involving userId (pending or accepted)
export async function getConnectedUserIds(userId) {
  console.log('[getConnectedUserIds] ── START ── for user:', userId)
  const response = await supabase
    .from('mindmate_connections')
    .select('from_user_id, to_user_id')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
  console.log('[getConnectedUserIds] RAW Supabase response:', response)
  console.log('[getConnectedUserIds] response.data:', response.data)
  console.log('[getConnectedUserIds] response.error:', response.error)
  if (response.error) {
    console.error('[getConnectedUserIds] QUERY FAILED:', response.error.message)
    return []
  }
  const ids = (response.data || []).map(c =>
    c.from_user_id === userId ? c.to_user_id : c.from_user_id
  )
  console.log('[getConnectedUserIds] ── RESULT ── excluding', ids.length, 'user(s):', ids)
  return ids
}

// Fetch all profiles except current user, optionally excluding already-connected users
export async function getOtherProfiles(currentUserId, excludeIds = []) {
  let query = supabase.from('mindmate_profiles').select('*').neq('id', currentUserId)
  if (excludeIds.length > 0) {
    // Use .filter with not.in — more reliable than .not(..., 'in', ...) in PostgREST
    query = query.filter('id', 'not.in', `(${excludeIds.join(',')})`)
  }
  const { data, error } = await query
  if (error) throw new Error(error.message)
  console.log('[getOtherProfiles] candidate pool size:', (data || []).length, '| excluded:', excludeIds.length)
  return (data || []).map(normalizeProfile)
}

// ── Connections ───────────────────────────────────────────────────────────

export async function sendConnectionRequest(fromUserId, toUserId) {
  console.log('[sendConnectionRequest] ── START ──')
  console.log('[sendConnectionRequest] from_user_id:', fromUserId)
  console.log('[sendConnectionRequest] to_user_id:', toUserId)
  const response = await supabase
    .from('mindmate_connections')
    .insert([{ from_user_id: fromUserId, to_user_id: toUserId }])
    .select()
    .single()
  console.log('[sendConnectionRequest] RAW Supabase response:', response)
  console.log('[sendConnectionRequest] response.data:', response.data)
  console.log('[sendConnectionRequest] response.error:', response.error)
  if (response.error) {
    console.error('[sendConnectionRequest] INSERT FAILED. Code:', response.error.code, '| Message:', response.error.message, '| Details:', response.error.details, '| Hint:', response.error.hint)
    throw new Error(response.error.message)
  }
  console.log('[sendConnectionRequest] ── SUCCESS ── inserted row:', response.data)
  return response.data
}

export async function getIncomingRequests(userId) {
  const { data, error } = await supabase
    .from('mindmate_connections')
    .select(`
      id,
      created_at,
      requester:mindmate_profiles!from_user_id(id, name, study, free_time, building, looking_for, fun_fact)
    `)
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}

export async function getAcceptedConnections(userId) {
  const { data, error } = await supabase
    .from('mindmate_connections')
    .select(`
      id,
      from_user_id,
      to_user_id,
      from_user:mindmate_profiles!from_user_id(id, name, study, free_time, building, looking_for, fun_fact),
      to_user:mindmate_profiles!to_user_id(id, name, study, free_time, building, looking_for, fun_fact)
    `)
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .eq('status', 'accepted')
  if (error) throw new Error(error.message)
  return (data || []).map(conn => ({
    connectionId: conn.id,
    user: conn.from_user_id === userId ? conn.to_user : conn.from_user,
  }))
}

export async function updateConnectionStatus(connectionId, status) {
  const { error } = await supabase
    .from('mindmate_connections')
    .update({ status })
    .eq('id', connectionId)
  if (error) throw new Error(error.message)
}

export async function getSentRequests(userId) {
  console.log('[getSentRequests] ── START ── fetching for user:', userId)
  const response = await supabase
    .from('mindmate_connections')
    .select(`
      id,
      status,
      created_at,
      recipient:mindmate_profiles!to_user_id(id, name, study, free_time, building, looking_for, fun_fact)
    `)
    .eq('from_user_id', userId)
    .order('created_at', { ascending: false })
  console.log('[getSentRequests] RAW Supabase response:', response)
  console.log('[getSentRequests] response.data:', response.data)
  console.log('[getSentRequests] response.error:', response.error)
  if (response.error) {
    console.error('[getSentRequests] QUERY FAILED. Code:', response.error.code, '| Message:', response.error.message)
    throw new Error(response.error.message)
  }
  console.log('[getSentRequests] row count:', response.data?.length)
  if (response.data?.length > 0) {
    console.log('[getSentRequests] first row recipient field:', response.data[0].recipient)
  }
  return response.data || []
}

export async function updateProfile(userId, { name, studying, freeTime, building, lookingFor, funFact }) {
  const { data, error } = await supabase
    .from('mindmate_profiles')
    .update({
      name,
      study: studying,
      free_time: freeTime,
      building: building || null,
      looking_for: lookingFor,
      fun_fact: funFact,
    })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}
