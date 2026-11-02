/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'web-must-not-import-database',
      severity: 'error',
      comment: 'Next.js never touches Prisma. NestJS owns persistence.',
      from: { path: '^apps/web/' },
      to: { path: '^packages/database/' },
    },
    {
      name: 'contracts-stay-pure',
      severity: 'error',
      comment: 'Request schemas must not import the database or secrets.',
      from: { path: '^packages/contracts/' },
      to: { path: '^packages/(database|config)/' },
    },
    {
      name: 'domain-stays-pure',
      severity: 'error',
      comment: 'Domain calculations have no IO dependencies.',
      from: { path: '^packages/domain/' },
      to: { path: '^packages/(database|config)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
}
