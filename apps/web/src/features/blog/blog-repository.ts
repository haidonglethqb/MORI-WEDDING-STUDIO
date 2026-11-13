import { articleFiveStyles } from './article-five-styles'
import { articleMoriStory } from './article-mori-story'
import { articlePersonalization } from './article-personalization'
import { articleSugarcanePaper } from './article-sugarcane-paper'
import type { BlogArticle, BlogCategoryId, BlogCategoryMeta } from './blog-types'

export const BLOG_CATEGORIES: BlogCategoryMeta[] = [
  {
    id: 'material',
    label: 'Chất liệu',
    kicker: '01 / CHẤT LIỆU XƠ BÃ MÍA',
    description:
      'Khám phá hành trình đưa giấy thành phẩm có thành phần xơ bã mía vào những bộ thiệp cưới mộc mạc, trang nhã.',
  },
  {
    id: 'style',
    label: 'Phong cách',
    kicker: '02 / NGÔN NGỮ THIẾT KẾ',
    description:
      'Năm nhóm phong cách chủ đạo tại MORI giúp cô dâu chú rể nhanh chóng tìm ra thẩm mỹ hài hòa với lễ cưới.',
  },
  {
    id: 'personalize',
    label: 'Cá nhân hóa',
    kicker: '03 / DẤU ẤN RIÊNG',
    description:
      'Cách tùy chỉnh màu sắc, kiểu chữ, nội dung và phụ kiện từ mẫu có sẵn mà vẫn giữ trọn câu chuyện hai người.',
  },
  {
    id: 'story',
    label: 'Câu chuyện MORI',
    kicker: '04 / XƯỞNG & TRIẾT LÝ',
    description:
      'Những trăn trở đầu tiên, sự kết hợp giữa công nghệ mô phỏng 3D và tâm huyết thủ công đứng sau từng tấm thiệp.',
  },
]

export const BLOG_ARTICLES: BlogArticle[] = [
  articleSugarcanePaper,
  articleFiveStyles,
  articlePersonalization,
  articleMoriStory,
]

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug)
}

export function getRelatedArticles(slug: string, count = 3): BlogArticle[] {
  return BLOG_ARTICLES.filter((article) => article.slug !== slug).slice(0, count)
}

export function filterArticlesByCategory(category: BlogCategoryId | 'all'): BlogArticle[] {
  if (category === 'all') {
    return BLOG_ARTICLES
  }
  return BLOG_ARTICLES.filter((article) => article.category === category)
}
