import { composeContent, setComposeContent } from '../compose-state.ts'

export const ComposeTextarea = () => {
  const content = composeContent.value

  return (
    <textarea
      autofocus
      value={content}
      onInput={(e) =>
        setComposeContent((e.target as HTMLTextAreaElement).value)}
      placeholder='Partagez votre analyse ou vos perspectives BRVM...'
      rows={8}
      class='w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-base-content text-base sm:text-lg placeholder:text-base-content/40 leading-relaxed resize-none p-0 mt-2 min-h-[160px]'
    />
  )
}
