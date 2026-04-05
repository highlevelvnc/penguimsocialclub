'use client'

import { useT } from '@/lib/i18n/client'
import type { CartState } from '@/lib/pos/cart'

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
    <div className="flex h-full flex-col border-l border-zinc-800 bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-100">{t('pos.cart')}</span>
          {!isEmpty && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white px-1.5">
              {cart.itemCount}
            </span>
          )}
        </div>
        {!isEmpty && (
          <button
            type="button"
            className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
            onClick={onClear}
          >
            {t('pos.clear_cart')}
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-600">
            <svg className="h-8 w-8 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-xs">{t('pos.cart_empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between px-4 py-2.5 hover:bg-zinc-800/30 group transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-200 truncate">{item.productName}</div>
                  <div className="text-[11px] text-zinc-400 tabular-nums mt-0.5">
                    {item.unitType === 'gram'
                      ? `${item.quantity}g \u00D7 \u20AC${item.unitPrice.toFixed(2)}/g`
                      : `${item.quantity} \u00D7 \u20AC${item.unitPrice.toFixed(2)}`}
                    {item.cannabisGrams > 0 && item.unitType === 'unit' && (
                      <span className="text-zinc-600 ml-1">({item.cannabisGrams}g)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-sm font-semibold text-zinc-100 tabular-nums">
                    {'\u20AC'}{item.lineTotal.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 hover:bg-red-500/20 hover:text-red-400 text-xs transition-all"
                    aria-label={`${t('common.delete')} ${item.productName}`}
                  >
                    {'\u00D7'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800">
        {/* Cannabis tracking */}
        {cart.cannabisGramsTotal > 0 && (
          <div className="px-4 py-2 bg-zinc-800/30 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">{t('pos.cannabis_total')}</span>
              <span className="font-semibold text-zinc-300 tabular-nums">{cart.cannabisGramsTotal}g</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">{t('pos.remaining_today')}</span>
              <span className={`font-semibold tabular-nums ${remainingDaily <= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {remainingDaily}g
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">{t('pos.remaining_month')}</span>
              <span className={`font-semibold tabular-nums ${remainingMonthly <= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {remainingMonthly}g
              </span>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/50">
          <span className="text-sm font-bold text-zinc-300">{t('pos.total')}</span>
          <span className="text-2xl font-bold text-white tabular-nums">
            {'\u20AC'}{cart.totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Checkout buttons */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          <button
            type="button"
            className={`h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.97] ${
              isEmpty || checkingOut
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
            }`}
            onClick={() => onCheckout('cash')}
            disabled={isEmpty || checkingOut}
          >
            {checkingOut ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              `${t('pos.checkout_cash')}`
            )}
          </button>
          <button
            type="button"
            className={`h-12 rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.97] ${
              isEmpty || checkingOut
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-lg shadow-white/5'
            }`}
            onClick={() => onCheckout('card')}
            disabled={isEmpty || checkingOut}
          >
            {checkingOut ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-400/30 border-t-zinc-600" />
            ) : (
              `${t('pos.checkout_card')}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
