'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useT } from '@/lib/i18n/client'
import { getReceiptData, type ReceiptData } from '@/actions/receipt'

interface Props {
  transactionId: string
  onClose: () => void
}

export function Receipt({ transactionId, onClose }: Props) {
  const t = useT()
  const [data, setData] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(true)
  const receiptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getReceiptData(transactionId).then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [transactionId])

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-3 rounded-2xl bg-zinc-900 px-6 py-4 border border-zinc-700">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
          <span className="text-sm text-zinc-300">{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="rounded-2xl bg-zinc-900 px-6 py-4 border border-zinc-700 text-center space-y-3">
          <p className="text-sm text-zinc-400">{t('common.no_results')}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    )
  }

  const date = new Date(data.createdAt)
  const dateStr = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm max-h-[90vh] overflow-auto">
        {/* Action buttons — hidden on print */}
        <div className="flex justify-center gap-2 mb-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white transition-all active:scale-[0.97] shadow-lg"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            {t('pos.print_receipt')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-all border border-zinc-700"
          >
            {t('common.cancel')}
          </button>
        </div>

        {/* Receipt paper */}
        <div
          ref={receiptRef}
          data-receipt
          className="mx-auto rounded-2xl bg-white p-6 shadow-2xl print:rounded-none print:shadow-none print:p-4 print:max-w-none"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-zinc-300 pb-4 mb-4">
            <div className="flex justify-center mb-2">
              <Image
                src="/logo.png"
                alt={data.clubName}
                width={40}
                height={40}
                className="rounded-lg print:w-8 print:h-8"
              />
            </div>
            <h2 className="text-base font-bold text-zinc-900">{data.clubName}</h2>
            {data.clubAddress && (
              <p className="text-xs text-zinc-500 mt-0.5">{data.clubAddress}</p>
            )}
            {data.clubCity && (
              <p className="text-xs text-zinc-500">{data.clubCity}</p>
            )}
          </div>

          {/* Transaction info */}
          <div className="grid grid-cols-2 gap-y-1 text-xs text-zinc-600 border-b border-dashed border-zinc-300 pb-3 mb-3">
            <div>
              <span className="text-zinc-400">{t('receipt.date')}:</span>
              <span className="ml-1 font-medium tabular-nums">{dateStr}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-400">Hora:</span>
              <span className="ml-1 font-medium tabular-nums">{timeStr}</span>
            </div>
            <div>
              <span className="text-zinc-400">{t('receipt.member')}:</span>
              <span className="ml-1 font-medium">{data.memberName}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-400">Doc:</span>
              <span className="ml-1 font-medium">{data.memberDocument}</span>
            </div>
            <div>
              <span className="text-zinc-400">{t('receipt.payment')}:</span>
              <span className="ml-1 font-medium">
                {data.paymentMethod === 'cash' ? t('pos.checkout_cash') : t('pos.checkout_card')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-zinc-400">Staff:</span>
              <span className="ml-1 font-medium">{data.staffName}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-b border-dashed border-zinc-300 pb-3 mb-3">
            <div className="flex text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
              <span className="flex-1">{t('receipt.item')}</span>
              <span className="w-12 text-right">{t('receipt.qty')}</span>
              <span className="w-16 text-right">{t('receipt.price')}</span>
              <span className="w-16 text-right">{t('receipt.subtotal')}</span>
            </div>
            {data.items.map((item, i) => (
              <div key={i} className="flex text-xs text-zinc-700 py-0.5">
                <span className="flex-1 truncate pr-2">{item.productName}</span>
                <span className="w-12 text-right tabular-nums text-zinc-500">
                  {item.unitType === 'gram' ? `${item.quantity}g` : `${item.quantity}`}
                </span>
                <span className="w-16 text-right tabular-nums text-zinc-500">
                  {'\u20AC'}{item.unitPrice.toFixed(2)}
                </span>
                <span className="w-16 text-right tabular-nums font-medium">
                  {'\u20AC'}{item.lineTotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 mb-4">
            {data.cannabisGramsTotal > 0 && (
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Cannabis {t('receipt.total').toLowerCase()}</span>
                <span className="tabular-nums">{data.cannabisGramsTotal}g</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-zinc-900 pt-1">
              <span>{t('receipt.total')}</span>
              <span className="tabular-nums">{'\u20AC'}{data.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t border-dashed border-zinc-300 pt-3">
            <p className="text-xs text-zinc-500">{t('receipt.thank_you')}</p>
            <p className="text-[10px] text-zinc-400 mt-1 tabular-nums">
              #{data.transactionId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
