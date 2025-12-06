"use client"

import { useEffect, useRef } from "react"

export function ScrollAnimate() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Reveal animations
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal, .reveal-left, .reveal-right, .reveal-scale")
    )

    // Legacy data-animate support
    const dataAnimateElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-animate]")
    )

    // Staggered children
    const staggerContainers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-stagger]")
    )

    // Counter animations
    const counterElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-counter]")
    )

    // Parallax elements
    const parallaxElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    )

    // Setup reveal observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement

            // Add visible class for CSS-based animations
            el.classList.add("visible")

            // Legacy support
            if (el.hasAttribute("data-animate")) {
              el.classList.add("animate-in", "fade-in-50", "slide-in-from-bottom-4", "duration-700", "ease-out")
              el.classList.remove("opacity-0", "translate-y-4")
            }

            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: "0px 0px -15% 0px",
        threshold: 0.1
      }
    )

    // Initialize reveal elements
    revealElements.forEach((el) => {
      observerRef.current?.observe(el)
    })

    // Initialize legacy data-animate elements
    dataAnimateElements.forEach((el) => {
      el.classList.add("opacity-0", "translate-y-4")
      observerRef.current?.observe(el)
    })

    // Setup stagger animations
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const container = entry.target as HTMLElement
            const children = container.querySelectorAll<HTMLElement>("[data-stagger-item]")

            children.forEach((child, index) => {
              child.style.transitionDelay = `${index * 100}ms`
              child.classList.add("visible")
            })

            staggerObserver.unobserve(container)
          }
        })
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1
      }
    )

    staggerContainers.forEach((container) => {
      const children = container.querySelectorAll<HTMLElement>("[data-stagger-item]")
      children.forEach((child) => {
        child.classList.add("reveal")
      })
      staggerObserver.observe(container)
    })

    // Setup counter animations
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const target = parseInt(el.dataset.counter || "0", 10)
            const duration = parseInt(el.dataset.counterDuration || "2000", 10)
            const suffix = el.dataset.counterSuffix || ""
            const prefix = el.dataset.counterPrefix || ""

            animateCounter(el, target, duration, prefix, suffix)
            counterObserver.unobserve(el)
          }
        })
      },
      { threshold: 0.5 }
    )

    counterElements.forEach((el) => {
      counterObserver.observe(el)
    })

    // Parallax scroll effect
    const handleScroll = () => {
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.5")
        const rect = el.getBoundingClientRect()
        const scrolled = window.scrollY
        const yPos = -(scrolled * speed)

        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.style.transform = `translateY(${yPos}px)`
        }
      })
    }

    if (parallaxElements.length > 0) {
      window.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      observerRef.current?.disconnect()
      staggerObserver.disconnect()
      counterObserver.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return null
}

function animateCounter(
  element: HTMLElement,
  target: number,
  duration: number,
  prefix: string,
  suffix: string
) {
  const start = 0
  const startTime = performance.now()

  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4)
  }

  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeOutQuart(progress)
    const current = Math.round(start + (target - start) * eased)

    element.textContent = `${prefix}${current.toLocaleString("pt-BR")}${suffix}`

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

// Mouse follow effect hook
export function useMouseFollow(ref: React.RefObject<HTMLElement>, intensity: number = 0.1) {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (e.clientX - centerX) * intensity
      const deltaY = (e.clientY - centerY) * intensity

      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`
    }

    const handleMouseLeave = () => {
      element.style.transform = "translate(0, 0)"
      element.style.transition = "transform 0.3s ease-out"
    }

    const handleMouseEnter = () => {
      element.style.transition = "none"
    }

    window.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("mouseleave", handleMouseLeave)
    element.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("mouseleave", handleMouseLeave)
      element.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [ref, intensity])
}

// Typed text effect component
export function TypedText({
  text,
  speed = 50,
  delay = 0,
  className = ""
}: {
  text: string
  speed?: number
  delay?: number
  className?: string
}) {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const span = spanRef.current
    if (!span) return

    span.textContent = ""
    let index = 0

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          span.textContent += text[index]
          index++
        } else {
          clearInterval(interval)
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, speed, delay])

  return (
    <span ref={spanRef} className={className}>
      {text}
    </span>
  )
}

// Magnetic button effect
export function useMagneticEffect(ref: React.RefObject<HTMLElement>, strength: number = 0.3) {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      element.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    }

    const handleMouseLeave = () => {
      element.style.transform = "translate(0, 0)"
    }

    element.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [ref, strength])
}
