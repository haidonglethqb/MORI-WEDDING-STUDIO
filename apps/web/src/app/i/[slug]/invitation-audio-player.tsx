'use client'

import { useState } from 'react'

export function InvitationAudioPlayer() {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="online-audio-player-wrap">
      <button
        type="button"
        onClick={() => setPlaying(!playing)}
        className="audio-player-pill-btn"
        aria-label={playing ? 'Tạm dừng nhạc lễ cưới' : 'Phát nhạc lễ cưới'}
      >
        <span className="audio-state-icon">{playing ? '⏸' : '▶'}</span>
        <div className="audio-track-details">
          <span className="audio-track-name">Canon in D · Acoustic Guitar</span>
          <span className="audio-artist-sub">{playing ? 'Đang phát âm hưởng ngày chung đôi' : 'Chạm để bật nhạc nền'}</span>
        </div>
        <div className={`audio-waveform-bars ${playing ? 'playing' : ''}`}>
          <span className="wave-line w1" />
          <span className="wave-line w2" />
          <span className="wave-line w3" />
          <span className="wave-line w4" />
        </div>
      </button>
    </div>
  )
}
