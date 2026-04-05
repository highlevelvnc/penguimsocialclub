'use client'

import { useT } from '@/lib/i18n/client'
import type { CartState } from '@/lib/pos/cart'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface Props {
  cart: CartState
  remainingDaily: number
  remainingMonthly: number
  memberName: string
  checkingOut: boolean
  onRemoveItem: (cartItemId: string) => void
  onClear: () => void
  onCheckout: (method: 'cash' | 'card') => void
}

export function CartPanel({
  cart,
  remainingDaily,
  remainingMonthly,
  memberName,
  checkingOut,
  onRemoveItem,
  onClear,
  onCheckout,
}: Props) {
  const t = useT()

  const isEmpty = cart.items.length === 0

  return (
    <div className="flex h-full flex-col border-l bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-bold">{t('pos.cart')}</h2>
        {!isEmpty && (
          <Button variant="ghost" size="sm" className="text-xs" onClick={onClear}>
            {t('pos.clear_cart')}
          </Button>
        )}
      </div>

      {/* Member info bar */}
      <div className="border-b bg-zinc-50 px-4 py-2 text-xs text-muted-foreground">
        {memberName}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">{t('pos.cart_empty')}</p>
          </div>
        ) : (
          <div className="divide-y">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.productName}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {item.unitType === 'gram'
                      ? `${item.quantity}g \u00D7 \u20AC${item.unitPrice.toFixed(2)}/g`
                      : `${item.quantity} \u00D7 \u20AC${item.unitPrice.toFixed(2)}`}
                    {item.cannabisGrams > 0 && item.unitType === 'unit' && (
                      <span className="ml-1">({item.cannabisGrams}g)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm font-semibold tabular-nums">
                    {'\u20AC'}{item.lineTotal.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-zinc-400 hover:text-red-500 text-lg leading-none"
                    aria-label="Remove"
                  >
                    {'\u00D7'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: totals + limits + checkout */}
      <div className="border-t">
        {/* Cannabis tracking */}
        {cart.cannabisGramsTotal > 0 && (
          <div className="px-4 py-2 bg-zinc-50 text-xs space-y-0.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('pos.cannabis_total')}</span>
              <span className="font-medium tabular-nums">{cart.cannabisGramsTotal}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('pos.remaining_today')}</span>
              <span className={`font-medium tabular-nums ${remainingDaily <= 0 ? 'text-red-600' : ''}`}>
                {remainingDaily}g
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('pos.remaining_month')}</span>
              <span className={`font-medium tabular-nums ${remainingMonthly <= 0 ? 'text-red-600' : ''}`}>
                {remainingMonthly}g
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold">{t('pos.total')}</span>
          <span className="text-2xl font-bold tabular-nums">
            {'\u20AC'}{cart.totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Checkout buttons */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          <Button
            className="h-14 text-lg"
            onClick={() => onCheckout('cash')}
            disabled={isEmpty || checkingOut}
          >
            {checkingOut ? t('common.loading') : t('pos.checkout_cash')}
          </Button>
          <Button
            variant="outline"
            className="h-14 text-lg"
            onClick={() => onCheckout('card')}
            disabled={isEmpty || checkingOut}
          >
            {checkingOut ? t('common.loading') : t('pos.checkout_card')}
          </Button>
        </div>
      </div>
    </div>
  )
}
