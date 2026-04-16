import { useState } from 'react'
import type { Chapter } from './ChapterParser'
import RichTextEditor from './RichTextEditor'
import './ExpandableChapters.css'
interface Props {
  chapters: Chapter[]
  onChange: (chapters: Chapter[]) => void
}

export default function ChapterAccordion({ chapters, onChange }: Props) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set())

  const items = chapters.map((ch, i) => ({ ...ch, index: i })).filter(ch => ch.title !== '')

  function toggle(index: number) {
    setOpenIndexes(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  function update(index: number, content: string) {
    onChange(chapters.map((ch, i) => i === index ? { ...ch, content } : ch))
  }

  return (
    <div className="accordion">
      {items.map((chapter, displayIndex) => {
        const isOpen = openIndexes.has(chapter.index)
        return (
          <div key={chapter.index} className={`chapter ${isOpen ? 'chapter--open' : ''}`}>
            <button type="button" className="chapter-head" onClick={() => toggle(chapter.index)}>
              <span className="ch-num">{displayIndex + 1}.</span>
              <span className="ch-title" dangerouslySetInnerHTML={{ __html: chapter.title }} />
              <span className="ch-icon">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
              <div className="ch-body">
                <RichTextEditor
                  content={chapter.content}
                  onChange={content => update(chapter.index, content)}
                  placeholder={chapter.placeholder}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
