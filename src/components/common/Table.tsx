// Genérico (<T>) de propósito: a mesma Table serve pra desenhar uma lista de Subscriber,
// de Payment, de qualquer entidade — ela só sabe o formato das colunas, não o dado em si.
interface Column<T> {
  header: string
  render: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
}

export function Table<T>({ columns, rows, rowKey, emptyMessage = 'Nenhum registro encontrado.' }: TableProps<T>) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{emptyMessage}</p>
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-800 text-slate-400">
          {columns.map((column) => (
            <th key={column.header} className="py-2 font-medium">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} className="border-b border-slate-800/60 text-slate-200">
            {columns.map((column) => (
              <td key={column.header} className="py-2">
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
