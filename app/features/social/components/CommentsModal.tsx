import { MessageCircle, Send, X } from 'lucide-preact'
import {
  activeCommentsPost,
  closeCommentsModal,
  commentInputText,
  isCommentsLoading,
  postCommentsList,
  setCommentInputText,
  submitComment,
} from '../social-state.ts'
import { relativeTime } from '../../../lib/format.ts'

export const CommentsModal = () => {
  const post = activeCommentsPost.value
  if (!post) return null

  const comments = postCommentsList.value
  const loading = isCommentsLoading.value
  const text = commentInputText.value

  return (
    <div
      class='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none'
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCommentsModal()
      }}
    >
      <div class='w-full sm:max-w-md bg-base-100 rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] flex flex-col gap-3.5 max-h-[85vh] animate-in slide-in-from-bottom duration-200'>
        {/* Sheet Handle */}
        <div class='w-10 h-1 bg-base-content/20 rounded-full mx-auto -mt-1 mb-1 sm:hidden' />

        {/* Header */}
        <div class='flex items-center justify-between'>
          <div class='flex items-center gap-2'>
            <div class='w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center'>
              <MessageCircle size={14} />
            </div>
            <div>
              <h3 class='text-sm font-bold text-base-content'>Commentaires</h3>
              <p class='text-[11px] text-base-content/50'>
                Discussion sur le post de @{post.authorHandle}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={closeCommentsModal}
            class='w-7 h-7 rounded-full bg-base-200 flex items-center justify-center text-base-content/60 hover:text-base-content active:scale-90 transition-transform cursor-pointer'
          >
            <X size={14} />
          </button>
        </div>

        {/* Comments List */}
        <div class='flex-1 overflow-y-auto min-h-[160px] max-h-[320px] flex flex-col gap-2.5 py-1 pr-1'>
          {loading && (
            <div class='flex items-center justify-center py-8 text-xs text-base-content/40'>
              Chargement des commentaires...
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div class='text-center py-8 text-xs text-base-content/40'>
              Soyez le premier à commenter cette publication !
            </div>
          )}

          {!loading &&
            comments.map((c) => (
              <div
                key={c.id}
                class='bg-base-200/60 rounded-2xl p-3 flex flex-col gap-1'
              >
                <div class='flex items-center justify-between'>
                  <span class='text-xs font-bold text-base-content'>
                    {c.authorName}
                  </span>
                  <span class='text-[10px] text-base-content/40'>
                    {relativeTime(c.createdAt)}
                  </span>
                </div>
                <p class='text-xs text-base-content/80 leading-relaxed'>
                  {c.content}
                </p>
              </div>
            ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitComment()
          }}
          class='flex items-center gap-2 pt-1'
        >
          <input
            type='text'
            value={text}
            onInput={(e) =>
              setCommentInputText((e.target as HTMLInputElement).value)}
            placeholder='Ajouter un commentaire...'
            maxlength={300}
            class='flex-1 bg-base-200 rounded-full px-4 py-2 text-xs text-base-content placeholder:text-base-content/40 outline-none focus:bg-base-300 transition-colors'
          />
          <button
            type='submit'
            disabled={!text.trim()}
            class='w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all cursor-pointer'
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
