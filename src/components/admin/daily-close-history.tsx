import type { DailyClose } from '@/lib/supabase/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Props {
  closes: DailyClose[]
  translations: Record<string, string>
}

export function DailyCloseHistory({ closes, translations: tr }: Props) {
  if (closes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{tr['close.history']}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr['close.date']}</TableHead>
              <TableHead className="text-right">{tr['close.total_transactions']}</TableHead>
              <TableHead className="text-right">{tr['close.total_revenue']}</TableHead>
              <TableHead className="text-right">{tr['close.cash_total']}</TableHead>
              <TableHead className="text-right">{tr['close.card_total']}</TableHead>
              <TableHead className="text-right">{tr['close.cannabis_dispensed']}</TableHead>
              <TableHead className="text-right">{tr['close.difference']}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {closes.map((c) => {
              const diff = c.cash_difference ?? 0
              return (
                <TableRow key={c.id}>
                  <TableCell className="text-sm tabular-nums font-medium">
                    {c.close_date}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {c.total_transactions}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {'\u20AC'}{c.total_revenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {'\u20AC'}{c.cash_total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {'\u20AC'}{c.card_total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {c.cannabis_grams_dispensed}g
                  </TableCell>
                  <TableCell className={`text-right tabular-nums font-medium ${
                    diff === 0 ? 'text-green-600' : diff > 0 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {diff > 0 ? '+' : ''}{'\u20AC'}{diff.toFixed(2)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
