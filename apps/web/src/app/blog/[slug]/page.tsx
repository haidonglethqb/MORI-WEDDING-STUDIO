import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HomeNav } from '../../home-nav'
import { HomeFooter } from '../../home-footer'
import {
  BLOG_ARTICLES,
  getArticleBySlug,
  getRelatedArticles,
} from '../../../features/blog/blog-repository'
import { BlogBlockRenderer } from './blog-block-renderer'
import './blog-article.css'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) {
    return { title: 'Bài viết không tồn tại · Tạp chí MORI' }
  }
  return {
    title: `${article.title} · Tạp chí MORI`,
    description: article.excerpt,
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const headings = article.blocks.filter(
    (block): block is Extract<typeof block, { type: 'heading' }> =>
      block.type === 'heading' && block.level === 2,
  )
  const related = getRelatedArticles(article.slug, 3)

  return (
    <>
      <HomeNav />
      <main className="blog-article-wrap">
        <nav aria-label="Đường dẫn" className="blog-breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog">Tạp chí</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/blog?category=${article.category}`}>{article.categoryLabel}</Link>
        </nav>

        <header className="blog-article-header">
          <div className="blog-article-meta">
            <strong>{article.order}</strong>
            <span>{article.categoryLabel}</span>
            <span>·</span>
            <span>{article.readMinutes} phút đọc</span>
            <span>·</span>
            <span>{article.publishedLabel}</span>
          </div>
          <h1>{article.title}</h1>
          {article.italicAccent ? (
            <p className="blog-article-accent blog-accent">{article.italicAccent}</p>
          ) : null}
          <p className="blog-article-subtitle">{article.subtitle}</p>
        </header>

        <figure className="blog-hero-figure">
          <Image
            src={article.cover.src}
            width={article.cover.width}
            height={article.cover.height}
            alt={article.cover.alt}
            sizes="(max-width: 1120px) 100vw, 1024px"
            priority
          />
          {article.cover.caption ? <figcaption>{article.cover.caption}</figcaption> : null}
        </figure>

        {headings.length >= 3 ? (
          <nav aria-label="Mục lục bài viết" className="blog-toc">
            <span className="blog-toc-label">Trong bài viết này</span>
            <ul className="blog-toc-list">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <BlogBlockRenderer blocks={article.blocks} />

        <aside className="blog-cta-banner" aria-label="Bước tiếp theo cùng MORI">
          <span className="blog-kicker">BẮT ĐẦU CÙNG XƯỞNG MORI</span>
          <h2>Sẵn sàng chọn chất liệu và phong cách cho tấm thiệp của riêng bạn?</h2>
          <p>
            Khám phá các mẫu thiệp có sẵn, trao đổi ý tưởng với trợ lý AI hoặc mở không gian làm
            việc để hoàn thiện bản duyệt.
          </p>
          <div className="blog-cta-actions">
            <Link href={article.cta.href} className="blog-btn-primary">
              {article.cta.label} ↗
            </Link>
            {article.cta.secondaryHref && article.cta.secondaryLabel ? (
              <Link href={article.cta.secondaryHref} className="blog-btn-ghost">
                {article.cta.secondaryLabel} →
              </Link>
            ) : null}
          </div>
          <div className="blog-cta-shortcuts">
            <span>Khám phá nhanh:</span>
            <Link href="/collections">Bộ sưu tập</Link>
            <Link href="/assistant">Trợ lý AI Stylist</Link>
            <Link href="/workspace">Không gian làm việc</Link>
          </div>
        </aside>

        {related.length > 0 ? (
          <section className="blog-related" aria-labelledby="related-heading">
            <div className="blog-related-head">
              <div>
                <span className="blog-kicker">ĐỌC TIẾP CÙNG MORI</span>
                <h2 id="related-heading">Bài viết liên quan</h2>
              </div>
              <Link href="/blog" className="blog-related-all">
                Xem tất cả bài viết ↗
              </Link>
            </div>
            <div className="blog-related-grid">
              {related.map((item) => (
                <Link key={item.slug} href={`/blog/${item.slug}`} className="blog-related-card">
                  <div className="blog-related-thumb">
                    <Image
                      src={item.cover.src}
                      width={item.cover.width}
                      height={item.cover.height}
                      alt={item.cover.alt}
                      sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                    />
                  </div>
                  <span className="blog-kicker">
                    {item.order} · {item.categoryLabel}
                  </span>
                  <h3>{item.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <HomeFooter />
    </>
  )
}
