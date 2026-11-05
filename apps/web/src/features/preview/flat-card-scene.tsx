'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { biFoldHingeRadians, flatCardYaw } from '@mori/domain'
import { webglAvailable } from './webgl-available'
import { createBespokePaperTexture } from './paper-texture'
import { getBespokeProfile } from '../../app/collections/collection-catalog-data'

export function FlatCardScene({
  face,
  slug = 'editorial-flat-01',
  name,
  style: _style,
  onUnavailable,
}: {
  face: 'front' | 'back'
  slug?: string | undefined
  name?: string | undefined
  style?: string | undefined
  onUnavailable: () => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const fail = useRef(onUnavailable)
  const targetYaw = useRef(flatCardYaw(face))
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  fail.current = onUnavailable
  targetYaw.current = flatCardYaw(face)

  useEffect(() => {
    if (!webglAvailable()) {
      fail.current()
      return
    }
    let cancelled = false
    let animId = 0
    let isDragging = false
    let prevX = 0
    let prevY = 0
    let rotX = 0
    let rotY = targetYaw.current

    const canvas = document.createElement('canvas')
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 340 / 440, 0.1, 10)
    camera.position.set(0, 0, 3.8)

    // Warm Atelier Studio Lighting
    const ambient = new THREE.AmbientLight(0xfffaed, 1.4)
    const dirLight = new THREE.DirectionalLight(0xfff5db, 1.8)
    dirLight.position.set(3, 4, 4)
    const fillLight = new THREE.DirectionalLight(0xb0b8a6, 0.6)
    fillLight.position.set(-3, -2, 2)
    scene.add(ambient, dirLight, fillLight)

    // Contact shadow underneath
    const sCanvas = document.createElement('canvas')
    sCanvas.width = 128
    sCanvas.height = 128
    const sctx = sCanvas.getContext('2d')
    if (sctx) {
      const g = sctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      g.addColorStop(0, 'rgba(44, 40, 32, 0.22)')
      g.addColorStop(1, 'rgba(44, 40, 32, 0)')
      sctx.fillStyle = g
      sctx.fillRect(0, 0, 128, 128)
    }
    const sTex = new THREE.CanvasTexture(sCanvas)
    const sPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 2.4),
      new THREE.MeshBasicMaterial({ map: sTex, transparent: true, depthWrite: false }),
    )
    sPlane.rotation.x = -Math.PI / 2
    sPlane.position.y = -1.25
    scene.add(sPlane)

    const profile = getBespokeProfile(slug)
    const isDark = profile?.cardBg.startsWith('#6') || profile?.cardBg.startsWith('#7') || profile?.cardBg.startsWith('#8')
    const frontTex = createBespokePaperTexture(slug, true, name)
    const backTex = createBespokePaperTexture(slug, false, name)

    const sideMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xd4af37 : 0xe8e4d3,
      roughness: 0.8,
      metalness: isDark ? 0.2 : 0.05,
    })
    const frontMat = new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.55, metalness: 0.15 })
    const backMat = new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.65, metalness: 0.1 })

    // Box Geometry: [right, left, top, bottom, front, back]
    const cardGeom = new THREE.BoxGeometry(1.65, 2.3, 0.015)
    const card = new THREE.Mesh(cardGeom, [sideMat, sideMat, sideMat, sideMat, frontMat, backMat])
    card.userData['hinge'] = biFoldHingeRadians(0)
    scene.add(card)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    if (cancelled) {
      renderer.dispose()
      return
    }
    rendererRef.current = renderer
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(340, 440)

    const onMouseDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      rotY += (e.clientX - prevX) * 0.012
      rotX = Math.max(-0.4, Math.min(0.4, rotX + (e.clientY - prevY) * 0.008))
      prevX = e.clientX; prevY = e.clientY
    }
    const onMouseUp = () => { isDragging = false }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    const animate = () => {
      if (cancelled) return
      if (!isDragging) {
        rotY += (targetYaw.current - rotY) * 0.08
        rotX += (0 - rotX) * 0.08
      }
      card.rotation.y = rotY
      card.rotation.x = rotX
      renderer.render(scene, camera)
      if (host.current) host.current.dataset['yaw'] = String(card.rotation.y)
      animId = requestAnimationFrame(animate)
    }
    animate()

    if (host.current) host.current.replaceChildren(canvas)

    return () => {
      cancelled = true
      cancelAnimationFrame(animId)
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      frontTex.dispose(); backTex.dispose(); sTex.dispose()
      cardGeom.dispose(); sideMat.dispose(); frontMat.dispose(); backMat.dispose()
      rendererRef.current?.dispose(); rendererRef.current = null
    }
  }, [slug, name])

  useEffect(() => {
    targetYaw.current = flatCardYaw(face)
  }, [face])

  return (
    <div
      ref={host}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', cursor: 'grab', touchAction: 'none' }}
      aria-label="Khung mô hình 3D xoay 360 độ"
    />
  )
}
