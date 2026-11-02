import { NotFoundException } from '@nestjs/common'

export async function loadShippingSnapshot(
  tx: {
    address: {
      findFirst(args: {
        where: { id: string; ownerUserId: string; archivedAt: null }
      }): Promise<{
        recipientName: string
        phone: string
        addressLines: string
        locality: string
        province: string
        countryCode: string
      } | null>
    }
  },
  ownerUserId: string,
  kind: string,
  addressId: string | undefined,
) {
  if (kind === 'DIGITAL' || !addressId) return {}
  const address = await tx.address.findFirst({
    where: { id: addressId, ownerUserId, archivedAt: null },
  })
  if (!address) throw new NotFoundException()
  return {
    shipRecipientName: address.recipientName,
    shipPhone: address.phone,
    shipAddressLines: address.addressLines,
    shipLocality: address.locality,
    shipProvince: address.province,
    shipCountryCode: address.countryCode,
  }
}
