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
    return <p>{emptyMessage}</p>
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.header}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)}>
            {columns.map((column) => (
              <td key={column.header}>{column.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
