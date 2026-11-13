#!/usr/bin/env bash
set -euo pipefail

echo "=== Seeding default accounts and catalogue into production database ==="
API_CONTAINER=$(docker ps -qf "name=mori-api-1")

if [ -z "$API_CONTAINER" ]; then
  echo "Error: mori-api-1 container not running"
  exit 1
fi

docker exec "$API_CONTAINER" node -e "
import('./apps/api/dist/modules/identity/password.js').then(async ({ hashPassword }) => {
  const { getPrismaClient } = await import('./packages/database/dist/index.js')
  const prisma = getPrismaClient()

  const accounts = [
    { email: 'admin@mori.local', displayName: 'Quản trị viên Mori', role: 'ADMIN', password: 'MoriWedding2026!' },
    { email: 'studio@mori.local', displayName: 'Nhân viên xưởng Mori', role: 'STUDIO', password: 'MoriWedding2026!' },
    { email: 'customer@mori.local', displayName: 'Khách hàng thử nghiệm', role: 'CUSTOMER', password: 'MoriWedding2026!' },
  ]

  for (const acc of accounts) {
    const normalizedEmail = acc.email.toLowerCase().trim()
    const passwordHash = await hashPassword(acc.password)
    const user = await prisma.user.upsert({
      where: { normalizedEmail },
      update: { displayName: acc.displayName, role: acc.role, status: 'ACTIVE', verifiedAt: new Date() },
      create: { normalizedEmail, displayName: acc.displayName, role: acc.role, status: 'ACTIVE', verifiedAt: new Date(), invitationQuota: 10 }
    })
    await prisma.credential.upsert({
      where: { userId: user.id },
      update: { passwordHash, passwordChangedAt: new Date() },
      create: { userId: user.id, passwordHash }
    })
    console.log('Seeded account:', acc.email, 'Role:', acc.role)
  }
  process.exit(0)
}).catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})
"
docker exec "$API_CONTAINER" node apps/api/dist/modules/catalogue/sync-catalogue-cli.js
echo "=== Seeding complete ==="
