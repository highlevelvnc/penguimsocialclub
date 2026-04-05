import type { AdjustmentWithStaff } from '@/actions/stock'
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
  adjustments: AdjustmentWithStaff[]
  unitType: 'gram' | 'unit'
  translations: Record<string, string>
}

export function AdjustmentHistory({ adjustments, unitType, translations: tr }: Props) {
  const unitSuffix = unitType === 'gram' ? 'g' : ''

  if (adjustments.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{tr['stock.adjustment']} — History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">{tr['stock.quantity']}</TableHead>
              <TableHead>{tr['stock.reason']}</TableHead>
              <TableHead>By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map((adj) => {
              const isPositive = adj.quantity > 0
              const typeKey = `stock.${adj.adjustment_type}`

              return (
                <TableRow key={adj.id}>
                  <TableCell className="text-sm tabular-nums">
                    {new Date(adj.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {tr[typeKey] ?? adj.adjustment_type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right tabular-nums font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{adj.quantity}{unitSuffix}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                    {adj.reason || '\u2014'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {adj.staff_users?.full_name ?? '\u2014'}
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
