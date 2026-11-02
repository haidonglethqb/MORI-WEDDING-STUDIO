'use client'

import { useEffect, useRef } from 'react'
import { biFoldHingeRadians, flatCardYaw } from '@mori/domain'
import { webglAvailable } from './webgl-available'

export function FlatCardScene({
  face,
  onUnavailable,
}: {
  face: 'front' | 'back'
  onUnavailable: () => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const fail = useRef(onUnavailable)
  const faceRef = useRef(face)
  const drawRef = useRef<(next: 'front' | 'back') => void>(() => {})
  const rendererRef = useRef<{ dispose: () => void } | null>(null)
  faceRef.current = face
  fail.current = onUnavailable

  useEffect(() => {
    if (!webglAvailable()) {
      fail.current()
      return
    }
    let cancelled = false
    void import('three').then((three) => {
      if (cancelled || !host.current) return
      const canvas = document.createElement('canvas')
      const scene = new three.Scene()
      const camera = new three.PerspectiveCamera(35, 1, 0.1, 10)
      camera.position.z = 3
      const material = new three.MeshBasicMaterial({ color: 0xf5f4ec })
      const card = new three.Mesh(new three.BoxGeometry(1.6, 2.2, 0.02), material)
      card.userData['hinge'] = biFoldHingeRadians(0)
      scene.add(card)
      const renderer = new three.WebGLRenderer({ canvas, antialias: true })
      if (cancelled) {
        renderer.dispose()
        return
      }
      rendererRef.current = renderer
      renderer.setSize(320, 420)
      const draw = (next: 'front' | 'back') => {
        card.rotation.y = flatCardYaw(next)
        material.color.setHex(next === 'front' ? 0xf5f4ec : 0xd5dbc9)
        renderer.render(scene, camera)
        if (host.current) host.current.dataset['yaw'] = String(card.rotation.y)
      }
      drawRef.current = draw
      draw(faceRef.current)
      host.current.replaceChildren(canvas)
    }).catch(() => fail.current())
    return () => {
      cancelled = true
      rendererRef.current?.dispose()
      rendererRef.current = null
    }
  }, [])

  useEffect(() => {
    drawRef.current(face)
  }, [face])

  return <div ref={host} />
}
