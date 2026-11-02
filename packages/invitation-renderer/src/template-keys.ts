/** Versioned template families. Published pages keep their template version. */

export const TEMPLATE_SCHEMA_VERSION = 1

export const templateFamilies = ['editorial-ivory', 'modern-type', 'botanical-letter'] as const

export type TemplateFamily = (typeof templateFamilies)[number]
