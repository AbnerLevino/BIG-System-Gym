import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PAISES_DDI } from '../../utils/mascaras'

interface SeletorDdiProps {
  value: string
  onChange: (ddi: string) => void
}

// Dropdown customizado: <option> nativo nao aceita icones, por isso montamos
// a lista manualmente para exibir a bandeira (via lib flag-icons) de cada pais.
export function SeletorDdi({ value, onChange }: SeletorDdiProps) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const paisSelecionado = PAISES_DDI.find((pais) => pais.ddi === value) ?? PAISES_DDI[0]

  useEffect(() => {
    function aoClicarFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((estaAberto) => !estaAberto)}
        className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-slate-900 shadow-sm focus:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-800/30"
      >
        <span className={`fi fi-${paisSelecionado.iso}`} />
        <span className="text-sm">{paisSelecionado.ddi}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {aberto ? (
        <ul className="absolute z-10 mt-1 max-h-60 w-56 overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {PAISES_DDI.map((pais) => (
            <li key={pais.ddi}>
              <button
                type="button"
                onClick={() => {
                  onChange(pais.ddi)
                  setAberto(false)
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  pais.ddi === value ? 'bg-rose-50 text-rose-800' : 'text-slate-700'
                }`}
              >
                <span className={`fi fi-${pais.iso}`} />
                <span className="flex-1">{pais.nome}</span>
                <span className="text-slate-400">{pais.ddi}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
