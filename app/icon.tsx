import { ImageResponse } from 'next/og'
import { brandColors } from '@/lib/brand-colors'

// Favicon gerado dinamicamente como placeholder funcional, na mesma linha do
// logo em public/logo-placeholder.svg. [CONFIRMAR COM A EMPRESA] — substituir
// por um favicon real (ex.: app/icon.png) assim que a logo oficial existir.
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: brandColors.red,
          borderRadius: 6,
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: 700,
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        CP
      </div>
    ),
    { ...size }
  )
}
