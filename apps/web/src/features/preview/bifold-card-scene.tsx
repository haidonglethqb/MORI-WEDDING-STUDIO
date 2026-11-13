'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { bifoldPanelTransforms } from '@mori/domain'
import { webglAvailable } from './webgl-available'
import { createBespokePaperTexture, loadCardImageTexture } from './paper-texture'
import { getProductImageUrl } from './product-image'
import { getBespokeProfile } from '../../app/collections/collection-catalog-data'

export function BiFoldCardScene({
  openAmount,
  slug = 'editorial-bifold-01',
  name,
  imageUrl,
  style: _style,
  onUnavailable,
}: {
  openAmount: number
  slug?: string | undefined
  name?: string | undefined
  imageUrl?: string | null | undefined
  style?: string | undefined
  onUnavailable: () => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const fail = useRef(onUnavailable)
  const openRef = useRef(openAmount)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  fail.current = onUnavailable
  openRef.current = openAmount
  const resolvedImageUrl = imageUrl ?? getProductImageUrl(slug)

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
    let viewRotX = 0.05
    let viewRotY = -0.2
    let loadedCoverTex: THREE.Texture | null = null

    const canvas = document.createElement('canvas')
    canvas.style.maxWidth = '100%'
    canvas.style.height = 'auto'
    canvas.style.display = 'block'
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 380 / 440, 0.1, 10)
    camera.position.set(0, 0, 4.4)

    const ambient = new THREE.AmbientLight(0xfffaed, 1.4)
    const keyLight = new THREE.DirectionalLight(0xfff6dd, 1.8)
    keyLight.position.set(4, 5, 4)
    const fillLight = new THREE.DirectionalLight(0xb0b8a6, 0.6)
    fillLight.position.set(-4, -1, 3)
    scene.add(ambient, keyLight, fillLight)

    const sCanvas = document.createElement('canvas')
    sCanvas.width = 128
    sCanvas.height = 128
    const sctx = sCanvas.getContext('2d')
    if (sctx) {
      const g = sctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      g.addColorStop(0, 'rgba(44, 40, 32, 0.25)')
      g.addColorStop(1, 'rgba(44, 40, 32, 0)')
      sctx.fillStyle = g
      sctx.fillRect(0, 0, 128, 128)
    }
    const sTex = new THREE.CanvasTexture(sCanvas)
    const shadowGeom = new THREE.PlaneGeometry(3.2, 2.4)
    const shadowMat = new THREE.MeshBasicMaterial({ map: sTex, transparent: true, depthWrite: false })
    const sPlane = new THREE.Mesh(shadowGeom, shadowMat)
    sPlane.rotation.x = -Math.PI / 2
    sPlane.position.y = -1.25
    scene.add(sPlane)

    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    const profile = getBespokeProfile(slug)
    const isDark = profile?.cardBg.startsWith('#6') || profile?.cardBg.startsWith('#7') || profile?.cardBg.startsWith('#8')
    const coverTex = createBespokePaperTexture(slug, true, name)
    const insideTex = createBespokePaperTexture(slug, false, name)

    const sideMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xd4af37 : 0xe8e4d3,
      roughness: 0.8,
      metalness: isDark ? 0.2 : 0.05,
    })
    const coverMat = new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.55, metalness: 0.12 })
    const insideMat = new THREE.MeshStandardMaterial({ map: insideTex, roughness: 0.65, metalness: 0.1 })

    const panelGeom = new THREE.BoxGeometry(1.2, 2.3, 0.015)
    const rightPanel = new THREE.Mesh(panelGeom, [sideMat, sideMat, sideMat, sideMat, insideMat, coverMat])
    rightPanel.position.set(0.6, 0, 0)
    rootGroup.add(rightPanel)

    const hingeGroup = new THREE.Group()
    hingeGroup.position.set(0, 0, 0)
    rootGroup.add(hingeGroup)

    const leftPanel = new THREE.Mesh(panelGeom, [sideMat, sideMat, sideMat, sideMat, coverMat, insideMat])
    leftPanel.position.set(0.6, 0, 0.016)
    hingeGroup.add(leftPanel)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    if (cancelled) {
      renderer.dispose()
      return
    }
    rendererRef.current = renderer
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(380, 440)

    loadCardImageTexture(
      resolvedImageUrl,
      1.2 / 2.3,
      renderer.capabilities.getMaxAnisotropy(),
      () => cancelled,
      (texture) => {
        loadedCoverTex = texture
        coverMat.map = texture
        coverMat.needsUpdate = true
      },
    )

    const onMouseDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      viewRotY += (e.clientX - prevX) * 0.012
      viewRotX = Math.max(-0.4, Math.min(0.4, viewRotX + (e.clientY - prevY) * 0.008))
      prevX = e.clientX; prevY = e.clientY
    }
    const onMouseUp = () => { isDragging = false }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    let currentOpen = openRef.current
    const animate = () => {
      if (cancelled) return
      currentOpen += (openRef.current - currentOpen) * 0.1
      const pose = bifoldPanelTransforms(currentOpen)

      hingeGroup.rotation.y = pose.left.rotationY
      rootGroup.position.x = -0.6 * (1 - currentOpen)
      rootGroup.rotation.y = viewRotY
      rootGroup.rotation.x = viewRotX

      renderer.render(scene, camera)
      if (host.current) host.current.dataset['yaw'] = String(pose.left.rotationY)
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
      coverTex.dispose(); loadedCoverTex?.dispose(); insideTex.dispose(); sTex.dispose()
      panelGeom.dispose(); shadowGeom.dispose(); shadowMat.dispose()
      sideMat.dispose(); coverMat.dispose(); insideMat.dispose()
      rendererRef.current?.dispose(); rendererRef.current = null
    }
  }, [slug, name, resolvedImageUrl])

  return (
    <div
      ref={host}
      style={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '100%',
        cursor: 'grab',
        touchAction: 'none',
      }}
      aria-label="Khung mô hình 3D xoay 360 độ"
    />
  )
}
