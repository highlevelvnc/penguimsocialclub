import type { MemberTransaction } from '@/actions/members'
import { Badge } from '@/components/ui/badge'
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
  transactions: MemberTransaction[]
  translations: Record<string, string>
}

export function MemberHistory({ transactions, translations: tr }: Props) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tr['member.history']}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{tr['common.no_results']}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{tr['member.history']}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr['receipt.date']}</TableHead>
              <TableHead className="text-right">{tr['receipt.total']}</TableHead>
              <TableHead className="text-right">Cannabis</TableHead>
              <TableHead>{tr['receipt.payment']}</TableHead>
              <TableHead className="text-right">Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="text-sm tabular-nums">
                  {new Date(txn.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {'\u20AC'}{txn.total_amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {txn.cannabis_grams_total > 0 ? `${txn.cannabis_grams_total}g` : '\u2014'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {txn.payment_method === 'cash' ? tr['pos.checkout_cash'] : tr['pos.checkout_card']}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {txn.item_count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
