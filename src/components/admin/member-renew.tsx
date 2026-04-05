'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { renewMembership } from '@/actions/members'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Props {
  memberId: string
  currentEnd: string
}

function addOneYear(dateStr: string): string {
  const d = new Date(dateStr)
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]
}

export function MemberRenew({ memberId, currentEnd }: Props) {
  const t = useT()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newEnd, setNewEnd] = useState(addOneYear(currentEnd))

  async function handleRenew() {
    setLoading(true)

    const result = await renewMembership(memberId, newEnd)

    setLoading(false)

    if (result.success) {
      toast.success('Membership renewed')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('member.renew')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Current: {currentEnd}
            </Label>
            <Input
              type="date"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              min={currentEnd}
            />
          </div>
          <Button onClick={handleRenew} disabled={loading} size="sm">
            {loading ? t('common.loading') : t('member.renew')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
