import type { Metadata } from 'next'
import { HomeNav } from '../home-nav'
import { HomeFooter } from '../home-footer'
import { BLOG_ARTICLES, BLOG_CATEGORIES } from '../../features/blog/blog-repository'
import { BlogIndexClient } from './blog-index-client'
import './blog-editorial.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tạp chí MORI · Chất liệu, Phong cách & Câu chuyện Thiệp cưới',
  description:
    'Khám phá câu chuyện giấy bã mía, năm phong cách thiệp cưới và nghệ thuật cá nhân hóa cùng xưởng MORI Wedding Studio.',
}

export default function BlogIndexPage() {
  return (
    <>
      <HomeNav />
      <main className="blog-archive-wrap">
        <header className="blog-archive-header">
          <span className="blog-kicker">TẠP CHÍ &amp; GÓC NHÌN MORI</span>
          <h1>
            Những câu chuyện <em className="blog-accent">sau từng tấm thiệp.</em>
          </h1>
          <p className="blog-archive-lead">
            Từ thớ giấy bã mía thân thiện môi trường đến cách hai bạn chọn bảng màu, chất liệu
            và lời mời riêng cho ngày chung đôi.
          </p>
        </header>

        <BlogIndexClient articles={BLOG_ARTICLES} categories={BLOG_CATEGORIES} />
      </main>
      <HomeFooter />
    </>
  )
}
