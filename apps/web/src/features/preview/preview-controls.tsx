'use client'

interface BiFoldControlsProps {
  openAmount: number
  onChangeOpenAmount: (value: number) => void
}

export function BiFoldControls({ openAmount, onChangeOpenAmount }: BiFoldControlsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          type="button"
          onClick={() => onChangeOpenAmount(0)}
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #c7cfc3',
            background: openAmount === 0 ? '#55634f' : '#fff',
            color: openAmount === 0 ? '#fff' : '#333',
            cursor: 'pointer',
          }}
        >
          Đóng kín (0°)
        </button>
        <button
          type="button"
          onClick={() => onChangeOpenAmount(0.4)}
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #c7cfc3',
            background: openAmount > 0.2 && openAmount < 0.7 ? '#55634f' : '#fff',
            color: openAmount > 0.2 && openAmount < 0.7 ? '#fff' : '#333',
            cursor: 'pointer',
          }}
        >
          Mở góc 70°
        </button>
        <button
          type="button"
          onClick={() => onChangeOpenAmount(1)}
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #c7cfc3',
            background: openAmount === 1 ? '#55634f' : '#fff',
            color: openAmount === 1 ? '#fff' : '#333',
            cursor: 'pointer',
          }}
        >
          Mở phẳng (180°)
        </button>
      </div>

      <label style={{ fontSize: '12px', color: '#55634f', display: 'flex', alignItems: 'center', gap: '10px' }}>
        Độ mở thiệp:
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={openAmount}
          onChange={(e) => onChangeOpenAmount(Number(e.target.value))}
          style={{ accentColor: '#55634f', cursor: 'pointer', width: '140px' }}
        />
        <span>{Math.round(openAmount * 180)}°</span>
      </label>
    </div>
  )
}

interface FlatControlsProps {
  face: 'front' | 'back'
  onChangeFace: (face: 'front' | 'back') => void
}

export function FlatControls({ face, onChangeFace }: FlatControlsProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      <button
        type="button"
        onClick={() => onChangeFace('front')}
        style={{
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid #55634f',
          background: face === 'front' ? '#55634f' : '#fff',
          color: face === 'front' ? '#fff' : '#55634f',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Mặt trước (Bìa thiệp)
      </button>
      <button
        type="button"
        onClick={() => onChangeFace('back')}
        style={{
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid #55634f',
          background: face === 'back' ? '#55634f' : '#fff',
          color: face === 'back' ? '#fff' : '#55634f',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Mặt sau (Nội dung cưới)
      </button>
    </div>
  )
}
