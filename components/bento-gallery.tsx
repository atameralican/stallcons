"use client"

import React, { useRef, useState, useEffect } from "react"
import {
    motion,
    useScroll,
    useTransform,
    AnimatePresence,
    Variants,
} from "framer-motion"
import { cn } from "@/lib/utils" // Assumes a 'lib/utils.ts' file for 'cn'
import { X, ZoomIn } from "lucide-react"

// Defines the structure for each image item in the gallery
type ImageItem = {
    id: number | string
    title?: string | null
    desc?: string | null
    url?: string | null
    span: string // Tailwind CSS grid span classes (e.g., "md:col-span-2")
}

// Defines the props for the main gallery component
interface ExpertiseImageBentoGalleryProps {
    imageItems: ImageItem[]
    title?: string | null
    description: string
}

// Animation variants for the container to stagger children
const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
}

// Animation variants for each gallery item
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 },
    },
}

// Modal component for displaying the selected image
const ImageModal = ({
    item,
    onClose,
}: {
    item: ImageItem
    onClose: () => void
}) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
            >
                {item.url && (
                    <img
                        src={item.url}
                        alt={item.title || ""}
                        className="w-full max-h-[80vh] object-contain rounded-xl"
                    />
                )}
                {(item.title || item.desc) && (
                    <div className="mt-3 text-center">
                        {item.title && (
                            <p className="text-white font-semibold text-lg">{item.title}</p>
                        )}
                        {item.desc && (
                            <p className="text-white/70 text-sm mt-1">{item.desc}</p>
                        )}
                    </div>
                )}
            </motion.div>
            <button
                onClick={onClose}
                className="absolute right-4 top-4 text-white/80 transition-colors hover:text-white"
                aria-label="Close image view"
            >
                <X size={24} />
            </button>
        </motion.div>
    )
}

// Main gallery component
const ExpertiseImageBentoGallery: React.FC<
    ExpertiseImageBentoGalleryProps
> = ({ imageItems, title, description }) => {
    const [selectedItem, setSelectedItem] = useState<ImageItem | null>(null)
    const [dragConstraint, setDragConstraint] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    // Calculate the draggable area constraint
    useEffect(() => {
        const calculateConstraints = () => {
            if (gridRef.current && containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth
                const gridWidth = gridRef.current.scrollWidth
                // The '- 32' provides some padding at the end
                const newConstraint = Math.min(0, containerWidth - gridWidth - 32)
                setDragConstraint(newConstraint)
            }
        }

        calculateConstraints()
        window.addEventListener("resize", calculateConstraints)
        return () => window.removeEventListener("resize", calculateConstraints)
    }, [imageItems])

    // Framer Motion scroll animations
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"],
    })
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
    const y = useTransform(scrollYProgress, [0, 0.2], [30, 0])

    return (
        <section
            ref={targetRef}
            className="relative w-full overflow-hidden bg-background- pt-10 sm:pt-12"
        >
            <motion.div
                style={{ opacity, y }}
                className="container mx-auto px-4 text-center"
            >
                {title && <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {title}
                </h2>}

                <GalleryDescription description={description} />
            </motion.div>

            <div
                ref={containerRef}
                className="relative mt-12 w-full cursor-grab active:cursor-grabbing"
            >
                <motion.div
                    className="w-max"
                    drag="x"
                    dragConstraints={{ left: dragConstraint, right: 0 }}
                    dragElastic={0.05}
                >
                    <motion.div
                        ref={gridRef}
                        className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-4 px-4 md:px-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {imageItems.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                className={cn(
                                    "group relative flex h-full min-h-[15rem] w-full min-w-[15rem] cursor-pointer items-end overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    item.span,
                                )}
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                onClick={() => setSelectedItem(item)}
                                onKeyDown={(e) => e.key === "Enter" && setSelectedItem(item)}
                                tabIndex={0}
                                aria-label={`View ${item.title}`}
                            >
                                {item.url && (
                                    <img
                                        src={item.url}
                                        alt={item.title || ""}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                )}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100 z-20 scale-90 group-hover:scale-100">
                                    <div className="rounded-full bg-white/20 p-3 backdrop-blur-md border border-white/30 shadow-lg">
                                        <ZoomIn className="text-white w-6 h-6" />
                                    </div>
                                </div>
                                <div className="relative z-10 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                    <p className="mt-1 text-sm text-white/80">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />
                )}
            </AnimatePresence>
        </section>
    )
}

function GalleryDescription({ description }: { description: string }) {
    const lines = description
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    const heading = lines[0];
    const contentLines = lines.slice(1);
    const introLines = contentLines.filter((line) => !line.startsWith("•") && !line.endsWith(":"));
    const subHeading = contentLines.find((line) => line.endsWith(":"));
    const bulletLines = contentLines
        .filter((line) => line.startsWith("•"))
        .map((line) => line.replace(/^•\s*/, ""));

    return (
        <div className="mx-auto mt-6 max-w-4xl text-left">
            {heading && (
                <h2 className="text-center text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                    {heading}
                </h2>
            )}

            {introLines.length > 0 && (
                <div className="mx-auto mt-5 max-w-3xl space-y-4 text-center text-base leading-8 text-muted-foreground sm:text-lg">
                    {introLines.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>
            )}

            {(subHeading || bulletLines.length > 0) && (
                <div className="mx-auto mt-8 max-w-3xl text-left">
                    {subHeading && (
                        <h3 className="text-base font-semibold text-foreground sm:text-lg">
                            {subHeading}
                        </h3>
                    )}

                    {bulletLines.length > 0 && (
                        <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                            {bulletLines.map((line) => (
                                <li key={line} className="flex gap-3">
                                    <span className="mt-2 h-2 w-2 flex-none rounded-full bg-foreground/70" />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}

export default ExpertiseImageBentoGallery
