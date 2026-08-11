export type ProofPhotoKind = 'before' | 'roof' | 'during' | 'after'

export function ProofPhoto({
  kind,
  className = '',
  label,
}: {
  kind: ProofPhotoKind
  className?: string
  label?: string
}) {
  return (
    <div
      className={`proof-photo proof-photo--${kind} ${className}`}
      role="img"
      aria-label={label ?? `${kind} property maintenance photo`}
    />
  )
}
