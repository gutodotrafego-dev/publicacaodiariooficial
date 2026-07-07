// Fonte única das cores oficiais da marca. Nunca hardcode hex de marca em
// componentes ou estilos — sempre importar daqui ou usar os tokens Tailwind
// (brand.red / brand.green) derivados destes valores em tailwind.config.ts.
//
// Os tons "dark"/"light" são variações computadas dos hex oficiais (mistura
// com preto/branco) para uso em hover, fundos e estados — não são cores
// oficiais adicionais.
export const brandColors = {
  red: '#FF0302',
  redDark: '#CC0202',
  redLight: '#FFE6E6',
  green: '#058421',
  greenDark: '#045615',
  greenLight: '#EBF5ED',
} as const
