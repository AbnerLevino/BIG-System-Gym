// LGPD (art. 5º, II): biometria facial é dado sensível e exige consentimento
// explícito e específico — separado do cadastro, marcado antes de ligar a câmera.
interface ConsentimentoBiometriaProps {
  nomeAluno: string
  consentiu: boolean
  onAlterar: (consentiu: boolean) => void
}

export function ConsentimentoBiometria({ nomeAluno, consentiu, onAlterar }: ConsentimentoBiometriaProps) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={consentiu}
        onChange={(e) => onAlterar(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-700"
      />
      <span>
        <strong>{nomeAluno || 'O aluno'}</strong> autoriza, de forma específica, a coleta e o uso da sua biometria facial
        apenas para identificação no check-in da academia. A biometria é dado sensível (LGPD, art. 5º, II) e o
        consentimento pode ser revogado na recepção.
      </span>
    </label>
  )
}
