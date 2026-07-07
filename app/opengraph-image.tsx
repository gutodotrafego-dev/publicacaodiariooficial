import { ImageResponse } from 'next/og'
import { siteConfig } from '@/config/site'
import { brandColors } from '@/lib/brand-colors'

// Imagem de compartilhamento (Open Graph) gerada como placeholder funcional.
// [CONFIRMAR COM A EMPRESA] — substituir por uma arte oficial de compartilhamento
// (ex.: app/opengraph-image.png) assim que houver material de marca definitivo.
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 40px',
            borderRadius: 12,
            background: brandColors.red,
            color: '#FFFFFF',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          {siteConfig.name}
        </div>
        <div style={{ display: 'flex', marginTop: 32, fontSize: 28, color: '#3F3F46' }}>
          Publicação legal e oficial no Diário Oficial e em jornais privados
        </div>
      </div>
    ),
    { ...size }
  )
}
