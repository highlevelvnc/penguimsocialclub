'use client'

import { useT } from '@/lib/i18n/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  totalAmount: number
  cannabisGrams: number
  paymentMethod: 'cash' | 'card'
  memberName: string
  onNext: () => void
}

export function CheckoutConfirmation({
  totalAmount,
  cannabisGrams,
  paymentMethod,
  memberName,
  onNext,
}: Props) {
  const t = useT()

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-sm text-center">
        <CardContent className="pt-8 pb-6 space-y-4">
          <div className="text-5xl">{'\u2713'}</div>
          <h2 className="text-xl font-bold">{t('pos.transaction_complete')}</h2>

          <div className="space-y-1 text-sm">
            <p className="text-2xl font-bold tabular-nums">
              {'\u20AC'}{totalAmount.toFixed(2)}
            </p>
            <p className="text-muted-foreground">
              {paymentMethod === 'cash' ? t('pos.checkout_cash') : t('pos.checkout_card')}
            </p>
            {cannabisGrams > 0 && (
              <p className="text-muted-foreground">
                {cannabisGrams}g cannabis
              </p>
            )}
            <p className="text-muted-foreground">{memberName}</p>
          </div>

          <Button className="h-12 w-full text-lg" onClick={onNext}>
            {t('pos.next')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
