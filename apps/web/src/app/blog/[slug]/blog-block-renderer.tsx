import Image from 'next/image'
import type { BlogBlock } from '../../../features/blog/blog-types'

export function BlogBlockRenderer({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="blog-prose">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return block.level === 2 ? (
            <h2 key={`${block.id}-${index}`} id={block.id}>
              {block.text}
            </h2>
          ) : (
            <h3 key={`${block.id}-${index}`} id={block.id}>
              {block.text}
            </h3>
          )
        }

        if (block.type === 'paragraph') {
          return <p key={`p-${index}`}>{block.text}</p>
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={`q-${index}`} className="blog-quote">
              <p>{block.text}</p>
            </blockquote>
          )
        }

        if (block.type === 'image') {
          return (
            <figure key={`img-${block.image.src}-${index}`} className="blog-inline-figure">
              <Image
                src={block.image.src}
                width={block.image.width}
                height={block.image.height}
                alt={block.image.alt}
                sizes="(max-width: 768px) 100vw, 720px"
              />
              {block.image.caption ? <figcaption>{block.image.caption}</figcaption> : null}
            </figure>
          )
        }

        if (block.type === 'callout') {
          return (
            <aside key={`call-${index}`} className="blog-callout">
              <span className="blog-callout-label">{block.label}</span>
              <p>{block.text}</p>
            </aside>
          )
        }

        return (
          <section key={`chk-${index}`} className="blog-checklist">
            {block.title ? <h4>{block.title}</h4> : null}
            <ul>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
