"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowUpRight } from "lucide-react"

interface Project {
    title: string
    description: string
    metric: string
    link: string
    image: string
}

export function ProjectShowcase({
    projects,
    fallbackImage,
}: {
    projects: Project[]
    fallbackImage: string
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const lerp = (start: number, end: number, factor: number) => {
            return start + (end - start) * factor
        }

        let animationId: number;

        const animate = () => {
            let needsMore = false;
            setSmoothPosition((prev) => {
                const dx = mousePosition.x - prev.x;
                const dy = mousePosition.y - prev.y;

                if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
                    return mousePosition;
                }

                needsMore = true;
                return {
                    x: lerp(prev.x, mousePosition.x, 0.15),
                    y: lerp(prev.y, mousePosition.y, 0.15),
                };
            });

            if (needsMore) {
                animationId = requestAnimationFrame(animate);
            }
        }

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
        }
    }, [mousePosition])

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            })
        }
    }

    const handleMouseEnter = (index: number) => {
        setHoveredIndex(index)
        setIsVisible(true)
    }

    const handleMouseLeave = () => {
        setHoveredIndex(null)
        setIsVisible(false)
    }

    return (
        <section ref={containerRef} onMouseMove={handleMouseMove} className="relative w-full max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-muted-foreground text-sm- font-medium- tracking-wide uppercase mb-8">Tüm Projeler</h2>

            <div
                className="pointer-events-none absolute z-50 overflow-hidden rounded-xl shadow-2xl"
                style={{
                    left: 0,
                    top: 0,
                    transform: `translate3d(${smoothPosition.x + 20}px, ${smoothPosition.y - 100}px, 0)`,
                    opacity: isVisible ? 1 : 0,
                    scale: isVisible ? 1 : 0.8,
                    transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <div className="relative w-[280px] h-[180px] bg-secondary rounded-xl overflow-hidden">
                    {projects.map((project, index) => (
                        <img
                            key={`${project.title}-${index}`}
                            src={project.image || fallbackImage}
                            alt={project.title}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out"
                            style={{
                                opacity: hoveredIndex === index ? 1 : 0,
                                scale: hoveredIndex === index ? 1 : 1.1,
                                filter: hoveredIndex === index ? "none" : "blur(10px)",
                            }}
                        />
                    ))}
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                </div>
            </div>

            <div className="space-y-0">
                {projects.length === 0 && (
                    <div className="border-t border-border py-8 text-sm text-muted-foreground">
                        Henüz yayınlanmış proje bulunmuyor.
                    </div>
                )}
                {projects.map((project, index) => (
                    <a
                        key={`${project.title}-${index}`}
                        href={project.link}
                        className="group block"
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="relative py-5 border-t border-border transition-all duration-300 ease-out">
                            {/* Background highlight on hover */}
                            <div
                                className={`
                  absolute inset-0 -mx-4 px-4 bg-secondary/50 rounded-lg
                  transition-all duration-300 ease-out
                  ${hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                `}
                            />

                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {/* Title with animated underline */}
                                    <div className="inline-flex items-center gap-2">
                                        <h3 className="text-foreground font-medium text-lg tracking-tight">
                                            <span className="relative">
                                                {project.title}
                                                {/* Animated underline */}
                                                <span
                                                    className={`
                            absolute left-0 -bottom-0.5 h-px bg-foreground
                            transition-all duration-300 ease-out
                            ${hoveredIndex === index ? "w-full" : "w-0"}
                          `}
                                                />
                                            </span>
                                        </h3>

                                        {/* Arrow that slides in */}
                                        <ArrowUpRight
                                            className={`
                        w-4 h-4 text-muted-foreground
                        transition-all duration-300 ease-out
                        ${hoveredIndex === index
                                                    ? "opacity-100 translate-x-0 translate-y-0"
                                                    : "opacity-0 -translate-x-2 translate-y-2"
                                                }
                      `}
                                        />
                                    </div>

                                    {/* Description with fade effect */}
                                    <p
                                        className={`
                      text-muted-foreground text-sm mt-1 leading-relaxed
                      transition-all duration-300 ease-out
                      ${hoveredIndex === index ? "text-foreground/70" : "text-muted-foreground"}
                    `}
                                    >
                                        {project.description}
                                    </p>
                                </div>

                                {/* Weight badge */}
                                <span
                                    className={`
                    text-xs font-mono text-muted-foreground tabular-nums
                    transition-all duration-300 ease-out
                    ${hoveredIndex === index ? "text-foreground/60" : ""}
                  `}
                                >
                                    {project.metric}
                                </span>
                            </div>
                        </div>
                    </a>
                ))}

                {/* Bottom border for last item */}
                <div className="border-t border-border" />
            </div>
        </section>
    )
}
