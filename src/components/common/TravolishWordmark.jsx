import logoSrc from '../../assets/travolish-logo.png'

export default function TravolishWordmark({ className = '', ...props }) {
  return (
    <img
      src={logoSrc}
      alt="Travolish"
      className={`w-auto object-contain ${className}`.trim()}
      {...props}
    />
  )
}
