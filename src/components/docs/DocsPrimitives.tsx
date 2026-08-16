type CalloutProps = {
  title?: string
  children: React.ReactNode
  variant?: "info" | "warning"
}

export const Callout = ({ title, children, variant = "info" }: CalloutProps) => {
  const styles =
    variant === "warning"
      ? "border-amber-500/30 bg-amber-500/5 text-amber-100/90"
      : "border-[#2a2a2a] bg-[#161616] text-[#ccc]"

  return (
    <aside className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${styles}`}>
      {title ? <p className="mb-1 font-semibold text-white">{title}</p> : null}
      <div className="space-y-2">{children}</div>
    </aside>
  )
}

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="scroll-mt-24 pt-4 text-xl font-semibold text-white">{children}</h2>
)

export const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="scroll-mt-24 pt-2 text-lg font-semibold text-white">{children}</h3>
)

export const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[#ccc] leading-relaxed">{children}</p>
)

export const Ul = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc space-y-2 pl-5 text-[#ccc]">{children}</ul>
)

export const Ol = ({ children }: { children: React.ReactNode }) => (
  <ol className="list-decimal space-y-2 pl-5 text-[#ccc]">{children}</ol>
)

export const InlineCode = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-[#222] px-1.5 py-0.5 text-[0.85em] text-[#e8e8e8]">{children}</code>
)

export const DocsTable = ({
  headers,
  rows,
}: {
  headers: string[]
  rows: React.ReactNode[][]
}) => (
  <div className="overflow-x-auto rounded-lg border border-[#2a2a2a]">
    <table className="w-full min-w-[28rem] text-left text-sm">
      <thead className="border-b border-[#2a2a2a] bg-[#161616]">
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-2.5 font-medium text-[#aaa]">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-[#222] last:border-0">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-2.5 align-top text-[#ccc]">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
