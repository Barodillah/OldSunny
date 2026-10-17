import { useEffect } from 'react'

export default function GoogleReviewsEmbed({ className = '' }) {
  useEffect(() => {
    const SCRIPT_URL = 'https://widgets.sociablekit.com/google-reviews/widget.js'

    // If SociableKIT mount handler already exists from previous load, trigger it
    if (window.sk_widget_mounts && typeof window.sk_widget_mounts['.sk-ww-google-reviews'] === 'function') {
      try {
        window.sk_widget_mounts['.sk-ww-google-reviews']()
      } catch (err) {
        console.warn('[SociableKIT] Error invoking mount handler:', err)
      }
    }

    // Remove any previously injected script to allow re-initialization
    const existingScript = document.querySelector(`script[src="${SCRIPT_URL}"]`)
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.defer = true
    document.body.appendChild(script)

    return () => {
      const scriptToRemove = document.querySelector(`script[src="${SCRIPT_URL}"]`)
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [])

  return (
    <section
      id="google-reviews"
      className={`google-reviews-embed-section ${className}`.trim()}
      aria-label="Google Reviews"
    >
      <div className="google-reviews-embed-container">
        <div className="sk-ww-google-reviews" data-embed-id="25722788"></div>
      </div>
    </section>
  )
}
