
export interface Chapter {
    title: string 
    content: string
    placeholder?: string
  }
  

  export function parseChapters(html: string): Chapter[] {
    const parser = new DOMParser()
    const document = parser.parseFromString(`<div>${html}</div>`, 'text/html')
    const container = document.querySelector('div')!
  
    const chapters: Chapter[] = []
    let current: Chapter | null = null
    let preamble = ''
  
    for (const child of Array.from(container.children)) {
      if (child.tagName === 'H2') {
        if (current) chapters.push(current)
        current = { title: child.innerHTML, content: '' }
      } else {
        if (current) {
          current.content += child.outerHTML
        } else {
          preamble += child.outerHTML
        }
      }
    }
  
    if (current) chapters.push(current)
    if (preamble) chapters.unshift({ title: '', content: preamble })
    if (chapters.length === 0) return [{ title: '', content: html }]
  
    return chapters
  }
  
  export function mergeChapters(chapters: Chapter[]): string {
    return chapters
      .map(ch => ch.title ? `<h2>${ch.title}</h2>${ch.content}` : ch.content)
      .join('')
  }
  