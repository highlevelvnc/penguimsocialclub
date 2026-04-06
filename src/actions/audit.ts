'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { SHOP_ID } from '@/lib/constants'
import { getPinSession } from '@/lib/session'

export interface AuditEntry {
  id: string
  staff_name: string
  action: string
  entity_type: string | null
  details: string | null
  created_at: string
}

/**
 * Log an action to the audit trail.
 * Called from other server actions after successful operations.
 */
export async function logAudit(params: {
  action: string
  entityType?: string
  entityId?: string
  details?: string
}) {
  const session = await getPinSession()
  const staffId = session.staffUserId
  if (!staffId) return // Silent fail — don't block operations for audit

  const supabase = createAdminClient()

  await supabase
    .from('audit_log')
    .insert({
      shop_id: SHOP_ID,
      staff_id: staffId,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      details: params.details ?? null,
    })
    .then(() => {}) // Fire and forget
}

/**
 * Get recent audit entries for admin view
 */
export async function getAuditLog(limit = 50): Promise<AuditEntry[]> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('audit_log')
    .select('id, staff_id, action, entity_type, details, created_at')
    .eq('shop_id', SHOP_ID)
    .order('created_at', { ascending: false })
    .limit(limit)

  const entries = (data as { id: string; staff_id: string; action: string; entity_type: string | null; details: string | null; created_at: string }[] | null) ?? []

  if (entries.length === 0) return []

  // Fetch staff names
  const staffIds = [...new Set(entries.map(e => e.staff_id))]
  const { data: staff } = await supabase
    .from('staff_users')
    .select('id, full_name')
    .in('id', staffIds)

  const staffMap = new Map(
    ((staff as { id: string; full_name: string }[] | null) ?? []).map(s => [s.id, s.full_name])
  )

  return entries.map(e => ({
    id: e.id,
    staff_name: staffMap.get(e.staff_id) ?? '—',
    action: e.action,
    entity_type: e.entity_type,
    details: e.details,
    created_at: e.created_at,
  }))
}
