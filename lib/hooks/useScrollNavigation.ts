import { useEffect, useState } from 'react'

export function useScrollNavigation(sections: string[]) {
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    // Passive scroll listener for better performance
    const handleScroll = () => {
      // Debounce using RAF for 60fps
      requestAnimationFrame(() => {
        // Section detection logic
        const scrollPosition = window.scrollY + window.innerHeight / 2

        for (const section of sections) {
          const element = document.getElementById(section)
          if (!element) continue

          const { top, bottom } = element.getBoundingClientRect()
          const absoluteTop = top + window.scrollY
          const absoluteBottom = bottom + window.scrollY

          if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
            setActiveSection(section)
            break
          }
        }
      })
    }

    // Add passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [sections])

  return activeSection
}
