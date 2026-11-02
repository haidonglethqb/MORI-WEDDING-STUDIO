'use client'

import { useEffect, useRef } from 'react'
import { bifoldPanelTransforms } from '@mori/domain'
import { webglAvailable } from './webgl-available'

export function BiFoldCardScene({
  openAmount,
  onUnavailable,
}: {
  openAmount: number
  onUnavailable: () => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const fail = useRef(onUnavailable)
  const rendererRef = useRef<{ dispose: () => void } | null>(null)
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
      const pose = bifoldPanelTransforms(openAmount)
      const scene = new three.Scene()
      const camera = new three.PerspectiveCamera(35, 1, 0.1, 10)
      camera.position.z = 4
      const material = new three.MeshBasicMaterial({ color: 0xf5f4ec })
      const left = new three.Mesh(new three.BoxGeometry(1.1, 2.2, 0.02), material)
      const right = new three.Mesh(new three.BoxGeometry(1.1, 2.2, 0.02), material)
      left.position.x = -0.55
      right.position.x = 0.55
      left.rotation.y = pose.left.rotationY
      right.rotation.y = pose.right.rotationY
      scene.add(left, right)
      const renderer = new three.WebGLRenderer({ canvas, antialias: true })
      if (cancelled) {
        renderer.dispose()
        return
      }
      rendererRef.current = renderer
      renderer.setSize(320, 420)
      renderer.render(scene, camera)
      host.current.dataset['yaw'] = String(pose.left.rotationY)
      host.current.replaceChildren(canvas)
    }).catch(() => fail.current())
    return () => {
      cancelled = true
      rendererRef.current?.dispose()
      rendererRef.current = null
    }
  }, [openAmount])

  return <div ref={host} />
}
