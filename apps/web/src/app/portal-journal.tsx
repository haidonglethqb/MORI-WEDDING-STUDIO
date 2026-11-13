import Image from 'next/image'
import Link from 'next/link'
import { BLOG_ARTICLES } from '../features/blog/blog-repository'

const FEATURED_SLUG = 'cau-chuyen-mori-wedding-studio'

export function PortalJournal() {
  const featured =
    BLOG_ARTICLES.find((article) => article.slug === FEATURED_SLUG) ??
    BLOG_ARTICLES[0]
  if (!featured) return null
  const others = BLOG_ARTICLES.filter((article) => article.slug !== featured.slug)

  return (
    <section className="portal-journal" id="tap-chi" aria-labelledby="journal-title">
      <div className="journal-top" data-reveal>
        <div>
          <span className="portal-kicker">06 / TẠP CHÍ &amp; GÓC NHÌN</span>
          <h2 id="journal-title">
            Những câu chuyện<br />
            <em>sau từng tấm thiệp.</em>
          </h2>
        </div>
        <div className="journal-top-aside">
          <p>
            Ghi chép từ xưởng giấy bã mía, năm sắc thái thiết kế và cách để mỗi
            lời mời mang dấu ấn riêng của hai bạn.
          </p>
          <Link className="portal-link" href="/blog">
            Khám phá toàn bộ Tạp chí ↗
          </Link>
        </div>
      </div>

      <div className="journal-grid">
        <Link className="journal-feature-card" href={`/blog/${featured.slug}`} data-reveal>
          <figure className="journal-feature-media">
            <Image
              src={featured.cover.src}
              alt={featured.cover.alt}
              width={featured.cover.width}
              height={featured.cover.height}
              sizes="(max-width: 900px) 92vw, 48vw"
            />
          </figure>
          <div className="journal-feature-body">
            <div className="journal-meta">
              <span>{featured.order} / {featured.categoryLabel}</span>
              <span>{featured.readMinutes} phút đọc</span>
            </div>
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            <span className="journal-read-more">Đọc bài viết ↗</span>
          </div>
        </Link>

        <div className="journal-list">
          {others.map((article) => (
            <Link className="journal-item" key={article.slug} href={`/blog/${article.slug}`} data-reveal>
              <span className="journal-item-order">{article.order}</span>
              <span className="journal-item-thumb">
                <Image
                  src={article.cover.src}
                  alt={article.cover.alt}
                  width={article.cover.width}
                  height={article.cover.height}
                  sizes="(max-width: 600px) 28vw, 150px"
                />
              </span>
              <span className="journal-item-body">
                <span className="journal-item-cat">
                  {article.categoryLabel} · {article.readMinutes} phút đọc
                </span>
                <strong>{article.title}</strong>
                <span className="journal-item-excerpt">{article.excerpt}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
