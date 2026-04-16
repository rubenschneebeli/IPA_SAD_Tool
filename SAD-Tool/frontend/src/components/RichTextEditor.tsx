import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import './RichTextEditor.css'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  readOnly?: boolean
  compact?: boolean
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, readOnly = false, compact = false, placeholder = '' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder, includeChildren: true }),
    ],

    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })


  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="editor">
      {!readOnly && (
        <div className="richTexttoolbar">
          <button type="button" className={editor.isActive('bold') ? 'active' : ''} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
          <button type="button" className={editor.isActive('italic') ? 'active' : ''} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
          <button type="button" className={editor.isActive('underline') ? 'active' : ''} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
          <span className="separator" />
          <button type="button" className={editor.isActive('heading', { level: 1 }) ? 'active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>Title</button>
          <button type="button" className={editor.isActive('heading', { level: 2 }) ? 'active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Chapter</button>
          <button type="button" className={editor.isActive('heading', { level: 3 }) ? 'active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
          <span className="separator" />
          <button type="button" className={editor.isActive('bulletList') ? 'active' : ''} onClick={() => editor.chain().focus().toggleBulletList().run()}>●</button>
          <button type="button" className={editor.isActive('orderedList') ? 'active' : ''} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</button>
        </div>
      )}
      <EditorContent editor={editor} className={`editor ${compact ? 'editor--compact' : ''}`} />
    </div>
  )
}
