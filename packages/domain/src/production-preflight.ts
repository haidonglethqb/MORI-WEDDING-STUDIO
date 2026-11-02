export interface ProductionPreflightInput {
  approvedHash: string | null
  fileHash: string | null
  trimWidthMm: number | null
  trimHeightMm: number | null
  profileWidthMm: number | null
  profileHeightMm: number | null
  fontsReady: boolean
}

export function productionBlockReason(input: ProductionPreflightInput): string | null {
  if (!input.approvedHash || !input.fileHash || input.approvedHash !== input.fileHash) {
    return 'Approved file does not match'
  }
  if (
    input.trimWidthMm === null ||
    input.trimHeightMm === null ||
    input.profileWidthMm === null ||
    input.profileHeightMm === null
  ) {
    return 'Trim size is missing'
  }
  if (input.trimWidthMm !== input.profileWidthMm || input.trimHeightMm !== input.profileHeightMm) {
    return 'Trim size does not match the profile'
  }
  if (!input.fontsReady) return 'Font requirements are missing'
  return null
}
