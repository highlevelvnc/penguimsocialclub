'use client'

import { useT } from '@/lib/i18n/client'

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
      <div className="w-full max-w-sm text-center space-y-6 px-6">
        {/* Success icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-100">{t('pos.transaction_complete')}</h2>
          <p className="text-3xl font-bold text-white tabular-nums">
            {'\u20AC'}{totalAmount.toFixed(2)}
          </p>
        </div>

        {/* Details */}
        <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('receipt.member')}</span>
            <span className="font-medium text-zinc-200">{memberName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('receipt.payment')}</span>
            <span className="font-medium text-zinc-200">
              {paymentMethod === 'cash' ? t('pos.checkout_cash') : t('pos.checkout_card')}
            </span>
          </div>
          {cannabisGrams > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Cannabis</span>
              <span className="font-medium text-zinc-200 tabular-nums">{cannabisGrams}g</span>
            </div>
          )}
        </div>

        {/* Next button */}
        <button
          type="button"
          className="w-full h-14 rounded-xl bg-zinc-100 text-zinc-900 text-lg font-bold shadow-lg transition-all hover:bg-white active:scale-[0.98]"
          onClick={onNext}
        >
          {t('pos.next')} &rarr;
        </button>
      </div>
    </div>
  )
}
