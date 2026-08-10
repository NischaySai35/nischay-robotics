import { createContext, useContext } from 'react'

/**
 * Opens the shared lightbox player.
 *
 * Lives here rather than beside the provider so that `VideoPlayer.tsx` exports
 * only components — mixing hooks and components in one module breaks React
 * Fast Refresh during development.
 */
export type OpenVideo = (id: string, title: string) => void

export const VideoContext = createContext<OpenVideo>(() => {})

/**
 * Usage:
 *   const play = useVideoPlayer()
 *   play('5Z3qYwFF2VI', 'Shape-changing modular robots')
 */
export const useVideoPlayer = () => useContext(VideoContext)
