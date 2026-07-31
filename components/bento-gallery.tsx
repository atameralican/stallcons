"use client"

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import {
    AnimatePresence,
    motion,
    type Variants,
    useReducedMotion,
} from "framer-motion"
import { cn } from "@/lib/utils"
import {
    ChevronLeft,
    ChevronRight,
    ImageOff,
    LoaderCircle,
    ZoomIn,
} from "lucide-react"

type ImageItem = {
    id: number | string
    title?: string | null
    alt?: string | null
    desc?: string | null
    url?: string | null
    span: string
}

interface ExpertiseImageBentoGalleryProps {
    imageItems: ImageItem[]
    title?: string | null
    description: string
}

type GalleryImageItem = ImageItem & { url: string }
type ImageDimensions = { width: number; height: number }
type ImageStatus = "loaded" | "error"
type SlideDirection = 1 | -1

const DEFAULT_MODAL_DIMENSIONS: ImageDimensions = {
    width: 1600,
    height: 1200,
}

// galeri ayarları
const MODAL_IMAGE_LONG_EDGE = 1600
const MODAL_IMAGE_QUALITY = 85
const SWIPE_DISTANCE_THRESHOLD = 60
const SWIPE_VELOCITY_THRESHOLD = 500
const DRAG_CLICK_RESET_DELAY = 150
const GALLERY_END_PADDING = 32

const loadedModalImageUrls = new Set<string>()
const FOCUSABLE_ELEMENT_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const BULLET_PREFIX_PATTERN = /^(?:•|[-–—])(?:\s+|$)/u
const BULLET_REMOVE_PATTERN = /^(?:•|[-–—])\s*/u

const modalImageVariants: Variants = {
    enter: (direction: SlideDirection) => ({
        opacity: 0,
        x: direction * 18,
        scale: 0.995,
    }),
    center: {
        opacity: 1,
        x: 0,
        scale: 1,
        zIndex: 1,
    },
    exit: (direction: SlideDirection) => ({
        opacity: 0,
        x: direction * -12,
        scale: 0.995,
        zIndex: 0,
    }),
}

const reducedModalImageVariants: Variants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
}
//scrolla göre yazı gelmesi
const descriptionItemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 24,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
        },
    },
}

function hasImageUrl(item: ImageItem): item is GalleryImageItem {
    return typeof item.url === "string" && item.url.trim().length > 0
}

function normalizeModalDimensions(
    width: number,
    height: number,
): ImageDimensions {
    const scale = MODAL_IMAGE_LONG_EDGE / Math.max(width, height)

    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    }
}

function getVisibleFocusableElements(container: HTMLElement) {
    return Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR),
    ).filter(
        (element) =>
            element.getClientRects().length > 0 &&
            element.getAttribute("aria-hidden") !== "true",
    )
}

// metni karşılaştırma için sadeleştiriyorum
function normalizeTextForComparison(value: string) {
    return value
        .normalize("NFKC")
        .replace(/[’‘`´]/gu, "'")
        .toLocaleLowerCase("tr-TR")
        .trim()
}

const ImageModal = ({
    items,
    selectedIndex,
    onNavigate,
    onClose,
}: {
    items: GalleryImageItem[]
    selectedIndex: number
    onNavigate: (index: number) => void
    onClose: () => void
}) => {
    const t = useTranslations("Gallery")
    const shouldReduceMotion = useReducedMotion()
    const modalRef = useRef<HTMLDivElement>(null)
    const item = items[selectedIndex]
    const hasMultipleImages = items.length > 1
    const [direction, setDirection] = useState<SlideDirection>(1)
    const [imageDimensions, setImageDimensions] = useState<
        Record<string, ImageDimensions>
    >({})
    const [imageStatuses, setImageStatuses] = useState<
        Partial<Record<string, ImageStatus>>
    >(() =>
        Object.fromEntries(
            items
                .filter((imageItem) =>
                    loadedModalImageUrls.has(imageItem.url),
                )
                .map((imageItem) => [imageItem.url, "loaded" as const]),
        ),
    )
    const adjacentItems = hasMultipleImages
        ? [
            items[(selectedIndex - 1 + items.length) % items.length],
            items[(selectedIndex + 1) % items.length],
        ].filter((adjacentItem, index, array) =>
            array.findIndex((candidate) => candidate.id === adjacentItem.id) === index,
        )
        : []
    const currentDimensions =
        imageDimensions[item.url] ?? DEFAULT_MODAL_DIMENSIONS
    const currentAspectRatio =
        currentDimensions.width / currentDimensions.height
    const currentStatus = imageStatuses[item.url] ?? "loading"

    const rememberImageDimensions = useCallback(
        (url: string, width: number, height: number) => {
            if (width <= 0 || height <= 0) return

            setImageDimensions((current) => {
                const normalizedDimensions = normalizeModalDimensions(
                    width,
                    height,
                )
                const savedDimensions = current[url]

                if (
                    savedDimensions?.width === normalizedDimensions.width &&
                    savedDimensions.height === normalizedDimensions.height
                ) {
                    return current
                }

                return {
                    ...current,
                    [url]: normalizedDimensions,
                }
            })
        },
        [],
    )

    const markImageLoaded = useCallback((url: string) => {
        loadedModalImageUrls.add(url)
        setImageStatuses((current) =>
            current[url] === "loaded"
                ? current
                : { ...current, [url]: "loaded" },
        )
    }, [])

    const markImageError = useCallback((url: string) => {
        loadedModalImageUrls.delete(url)
        setImageStatuses((current) =>
            current[url] === "error"
                ? current
                : { ...current, [url]: "error" },
        )
    }, [])

    useEffect(() => {
        const previouslyFocusedElement =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null
        const focusFrame = window.requestAnimationFrame(() => {
            const firstVisibleControl = modalRef.current
                ? getVisibleFocusableElements(modalRef.current)[0]
                : null

            if (firstVisibleControl) {
                firstVisibleControl.focus()
            } else {
                modalRef.current?.focus()
            }
        })

        return () => {
            window.cancelAnimationFrame(focusFrame)

            if (previouslyFocusedElement?.isConnected) {
                previouslyFocusedElement.focus()
            }
        }
    }, [])

    useEffect(() => {
        const body = document.body
        const root = document.documentElement
        const scrollY = window.scrollY
        const scrollbarWidth = window.innerWidth - root.clientWidth
        const bodyPaddingRight = Number.parseFloat(
            window.getComputedStyle(body).paddingRight,
        ) || 0
        const previousBodyStyles = {
            overflow: body.style.overflow,
            position: body.style.position,
            top: body.style.top,
            width: body.style.width,
            paddingRight: body.style.paddingRight,
        }
        const previousRootOverscrollBehavior = root.style.overscrollBehavior

        body.style.overflow = "hidden"
        body.style.position = "fixed"
        body.style.top = `-${scrollY}px`
        body.style.width = "100%"
        root.style.overscrollBehavior = "none"

        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`
        }

        return () => {
            body.style.overflow = previousBodyStyles.overflow
            body.style.position = previousBodyStyles.position
            body.style.top = previousBodyStyles.top
            body.style.width = previousBodyStyles.width
            body.style.paddingRight = previousBodyStyles.paddingRight
            root.style.overscrollBehavior = previousRootOverscrollBehavior
            window.scrollTo(0, scrollY)
        }
    }, [])

    const showPrevious = useCallback(() => {
        setDirection(-1)
        onNavigate((selectedIndex - 1 + items.length) % items.length)
    }, [items.length, onNavigate, selectedIndex])

    const showNext = useCallback(() => {
        setDirection(1)
        onNavigate((selectedIndex + 1) % items.length)
    }, [items.length, onNavigate, selectedIndex])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault()
                onClose()
                return
            }

            if (hasMultipleImages && event.key === "ArrowLeft") {
                event.preventDefault()
                showPrevious()
                return
            }

            if (hasMultipleImages && event.key === "ArrowRight") {
                event.preventDefault()
                showNext()
                return
            }

            if (event.key !== "Tab" || !modalRef.current) return

            const focusableElements = getVisibleFocusableElements(
                modalRef.current,
            )

            if (focusableElements.length === 0) {
                event.preventDefault()
                modalRef.current.focus()
                return
            }

            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]
            const activeElement = document.activeElement

            if (
                event.shiftKey &&
                (activeElement === firstElement ||
                    !modalRef.current.contains(activeElement))
            ) {
                event.preventDefault()
                lastElement.focus()
            } else if (
                !event.shiftKey &&
                (activeElement === lastElement ||
                    !modalRef.current.contains(activeElement))
            ) {
                event.preventDefault()
                firstElement.focus()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [hasMultipleImages, onClose, showNext, showPrevious])

    return (
        <motion.div
            ref={modalRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.2 }}
            className="fixed inset-x-0 top-0 z-50 flex h-dvh items-center justify-center bg-black/80 px-[max(1rem,env(safe-area-inset-left))] py-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
            onClick={(event) => {
                const target = event.target

                if (
                    target instanceof Element &&
                    target.closest("[data-gallery-interactive]")
                ) {
                    return
                }

                onClose()
            }}
            role="dialog"
            aria-modal="true"
            aria-label={t("ariaLabel")}
            tabIndex={-1}
        >
            <motion.div
                initial={
                    shouldReduceMotion
                        ? { opacity: 0 }
                        : { scale: 0.9, y: 20 }
                }
                animate={
                    shouldReduceMotion
                        ? { opacity: 1 }
                        : { scale: 1, y: 0 }
                }
                exit={
                    shouldReduceMotion
                        ? { opacity: 0 }
                        : { scale: 0.9, y: 20 }
                }
                transition={{ duration: shouldReduceMotion ? 0.1 : 0.2 }}
                className="relative flex h-full w-full max-w-6xl items-center justify-center px-0 sm:px-14"
            >
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={item.id}
                        custom={direction}
                        variants={
                            shouldReduceMotion
                                ? reducedModalImageVariants
                                : modalImageVariants
                        }
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            duration: shouldReduceMotion ? 0.1 : 0.22,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className={cn(
                            "absolute inset-0 flex items-center justify-center",
                            hasMultipleImages && "pb-20 sm:pb-0",
                        )}
                    >
                        <div className="flex h-[min(60dvh,30rem)] w-full items-center justify-center sm:contents">
                            <motion.div
                                drag={hasMultipleImages ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(_, info) => {
                                    if (
                                        info.offset.x <
                                        -SWIPE_DISTANCE_THRESHOLD ||
                                        info.velocity.x <
                                        -SWIPE_VELOCITY_THRESHOLD
                                    ) {
                                        showNext()
                                    }
                                    if (
                                        info.offset.x >
                                        SWIPE_DISTANCE_THRESHOLD ||
                                        info.velocity.x >
                                        SWIPE_VELOCITY_THRESHOLD
                                    ) {
                                        showPrevious()
                                    }
                                }}
                                data-gallery-interactive
                                style={
                                    {
                                        "--modal-image-ratio":
                                            currentAspectRatio,
                                    } as React.CSSProperties
                                }
                                className={cn(
                                    "relative aspect-[var(--modal-image-ratio)] max-h-full max-w-full",
                                    "w-[min(100%,calc(min(60dvh,30rem)*var(--modal-image-ratio)))]",
                                    "sm:max-h-[80dvh] sm:w-[min(100%,calc(80dvh*var(--modal-image-ratio)))]",
                                    hasMultipleImages &&
                                    "touch-pan-y cursor-grab active:cursor-grabbing",
                                )}
                            >
                                {currentStatus === "loading" && (
                                    <div
                                        className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-xl bg-white/5"
                                        role="status"
                                        aria-label={t("imageLoading")}
                                    >
                                        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 via-white/10 to-white/5 motion-reduce:animate-none" />
                                        <LoaderCircle
                                            className="relative h-8 w-8 animate-spin text-white/80 motion-reduce:animate-none"
                                            aria-hidden="true"
                                        />
                                        <span className="sr-only">
                                            {t("imageLoading")}
                                        </span>
                                    </div>
                                )}
                                {currentStatus === "error" && (
                                    <div
                                        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/45 px-6 text-center text-white"
                                        role="alert"
                                    >
                                        <ImageOff
                                            className="h-9 w-9 text-white/70"
                                            aria-hidden="true"
                                        />
                                        <p className="text-sm font-medium">
                                            {t("imageLoadError")}
                                        </p>
                                    </div>
                                )}
                                <Image
                                    src={item.url}
                                    alt={item.alt ?? ""}
                                    fill
                                    sizes="(min-width: 1280px) 1152px, (min-width: 640px) calc(100vw - 9rem), calc(100vw - 2rem)"
                                    quality={MODAL_IMAGE_QUALITY}
                                    preload
                                    draggable={false}
                                    onLoad={(event) => {
                                        rememberImageDimensions(
                                            item.url,
                                            event.currentTarget.naturalWidth,
                                            event.currentTarget.naturalHeight,
                                        )
                                        markImageLoaded(item.url)
                                    }}
                                    onError={() => markImageError(item.url)}
                                    className={cn(
                                        "select-none rounded-xl object-contain transition-opacity duration-300",
                                        "motion-reduce:transition-none",
                                        currentStatus === "loaded"
                                            ? "opacity-100"
                                            : "opacity-0",
                                    )}
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="pointer-events-none fixed -left-[9999px] h-px w-px overflow-hidden opacity-0">
                    {adjacentItems.map((adjacentItem) => {
                        const dimensions =
                            imageDimensions[adjacentItem.url] ??
                            DEFAULT_MODAL_DIMENSIONS

                        return (
                            <Image
                                key={adjacentItem.id}
                                src={adjacentItem.url}
                                alt=""
                                width={dimensions.width}
                                height={dimensions.height}
                                sizes="(min-width: 1280px) 1152px, (min-width: 640px) calc(100vw - 9rem), calc(100vw - 2rem)"
                                quality={MODAL_IMAGE_QUALITY}
                                loading="eager"
                                onLoad={(event) => {
                                    rememberImageDimensions(
                                        adjacentItem.url,
                                        event.currentTarget.naturalWidth,
                                        event.currentTarget.naturalHeight,
                                    )
                                    markImageLoaded(adjacentItem.url)
                                }}
                                onError={() =>
                                    markImageError(adjacentItem.url)
                                }
                            />
                        )
                    })}
                </div>

                {hasMultipleImages && (
                    <>
                        <button
                            type="button"
                            onClick={showPrevious}
                            data-gallery-interactive
                            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
                            aria-label={t("previousImage")}
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <button
                            type="button"
                            onClick={showNext}
                            data-gallery-interactive
                            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
                            aria-label={t("nextImage")}
                        >
                            <ChevronRight size={28} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-sm text-white sm:block">
                            {selectedIndex + 1} / {items.length}
                        </div>
                        <div
                            data-gallery-interactive
                            className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/65 p-1.5 text-white shadow-lg backdrop-blur-md sm:hidden"
                        >
                            <button
                                type="button"
                                onClick={showPrevious}
                                className="flex h-11 w-11 items-center justify-center rounded-full transition-colors active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                aria-label={t("previousImage")}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <span
                                className="min-w-12 select-none text-center text-sm tabular-nums"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {selectedIndex + 1} / {items.length}
                            </span>
                            <button
                                type="button"
                                onClick={showNext}
                                className="flex h-11 w-11 items-center justify-center rounded-full transition-colors active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                aria-label={t("nextImage")}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    )
}

const ExpertiseImageBentoGallery: React.FC<
    ExpertiseImageBentoGalleryProps
> = ({ imageItems, title, description }) => {
    const t = useTranslations("Gallery")
    const shouldReduceMotion = useReducedMotion()
    const galleryItems = useMemo(
        () => imageItems.filter(hasImageUrl),
        [imageItems],
    )
    const galleryIndexById = useMemo(
        () =>
            new Map(
                galleryItems.map((item, index) => [item.id, index] as const),
            ),
        [galleryItems],
    )
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [dragConstraint, setDragConstraint] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const suppressCardClickRef = useRef(false)
    const dragClickResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    )

    useEffect(() => {
        return () => {
            if (dragClickResetTimerRef.current) {
                clearTimeout(dragClickResetTimerRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const calculateConstraints = () => {
            if (gridRef.current && containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth
                const gridWidth = gridRef.current.scrollWidth
                const newConstraint = Math.min(
                    0,
                    containerWidth - gridWidth - GALLERY_END_PADDING,
                )
                setDragConstraint(newConstraint)
            }
        }

        calculateConstraints()

        const resizeObserver = new ResizeObserver(calculateConstraints)

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }
        if (gridRef.current) {
            resizeObserver.observe(gridRef.current)
        }

        return () => resizeObserver.disconnect()
    }, [imageItems])

    return (
        <section className="relative w-full overflow-hidden bg-background pt-10 sm:pt-12">
            <div className="container mx-auto px-4 text-center">
                {title && <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {title}
                </h2>}

                <GalleryDescription description={description} />
            </div>

            <div
                ref={containerRef}
                className="relative mt-12 w-full cursor-grab active:cursor-grabbing"
            >
                <motion.div
                    className="w-max"
                    drag="x"
                    dragConstraints={{ left: dragConstraint, right: 0 }}
                    dragElastic={0.05}
                    onDragStart={() => {
                        if (dragClickResetTimerRef.current) {
                            clearTimeout(dragClickResetTimerRef.current)
                        }
                        suppressCardClickRef.current = true
                    }}
                    onDragEnd={() => {
                        dragClickResetTimerRef.current = setTimeout(() => {
                            suppressCardClickRef.current = false
                            dragClickResetTimerRef.current = null
                        }, DRAG_CLICK_RESET_DELAY)
                    }}
                >
                    <motion.div
                        ref={gridRef}
                        className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-4 px-4 md:grid-flow-col-dense md:grid-rows-[repeat(2,minmax(15rem,1fr))] md:px-8"
                    >
                        {imageItems.map((item) => {
                            const galleryIndex = galleryIndexById.get(item.id)
                            const isInteractive = galleryIndex !== undefined
                            const accessibleTitle =
                                item.title?.trim() || t("untitledImage")

                            return (
                                <motion.button
                                    key={item.id}
                                    type="button"
                                    className={cn(
                                        "group relative flex h-full min-h-[15rem] w-full min-w-[15rem] items-end overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow duration-300 ease-in-out",
                                        isInteractive
                                            ? "cursor-pointer hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                            : "cursor-default",
                                        item.span,
                                    )}
                                    whileHover={
                                        isInteractive && !shouldReduceMotion
                                            ? { scale: 1.02 }
                                            : undefined
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                    }}
                                    onClick={() => {
                                        if (
                                            suppressCardClickRef.current ||
                                            galleryIndex === undefined
                                        ) {
                                            return
                                        }

                                        setSelectedIndex(galleryIndex)
                                    }}
                                    disabled={!isInteractive}
                                    aria-label={
                                        isInteractive
                                            ? t("viewImage", {
                                                title: accessibleTitle,
                                            })
                                            : undefined
                                    }
                                >
                                    {hasImageUrl(item) && (
                                        <Image
                                            src={item.url}
                                            alt={item.alt ?? ""}
                                            fill
                                            sizes="(min-width: 768px) 20rem, 15rem"
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                                        />
                                    )}
                                    <div className="pointer-events-none absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none" />
                                    <div className="pointer-events-none absolute inset-0 z-20 flex scale-90 items-center justify-center opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none">
                                        <div className="rounded-full border border-white/30 bg-white/20 p-3 shadow-lg backdrop-blur-md">
                                            <ZoomIn className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </motion.button>
                            )
                        })}
                    </motion.div>
                </motion.div>
            </div>

            <AnimatePresence>
                {selectedIndex !== null && galleryItems[selectedIndex] && (
                    <ImageModal
                        items={galleryItems}
                        selectedIndex={selectedIndex}
                        onNavigate={setSelectedIndex}
                        onClose={() => setSelectedIndex(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    )
}

// açıklamayı okunabilir parçalara ayırıyorum
function GalleryDescription({ description }: { description: string }) {
    const reducedMotion = useReducedMotion()
    const lines = description
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    const heading = lines[0]
    const contentLines = lines.slice(1)
    const introLines = contentLines.filter(
        (line) => !isBulletLine(line) && !isSubheadingLine(line),
    )
    const subHeading = contentLines.find(isSubheadingLine)
    const bulletLines = contentLines
        .filter(isBulletLine)
        .map((line) => line.replace(BULLET_REMOVE_PATTERN, ""))

    return (
        <motion.div
            className="mx-auto mt-6 max-w-4xl text-left"
        >
            {heading && (
                <motion.h2
                    className="text-center text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
                    initial={reducedMotion ? false : "hidden"}
                    whileInView={reducedMotion ? undefined : "visible"}
                    viewport={{ once: true, amount: 0.35 }}
                    variants={reducedMotion ? undefined : descriptionItemVariants}
                >
                    {heading}
                </motion.h2>
            )}

            {introLines.length > 0 && (
                <motion.div
                    className="mx-auto mt-5 max-w-3xl space-y-4 text-center text-base leading-8 text-muted-foreground sm:text-lg"
                >
                    {introLines.map((line, index) => (
                        <motion.p
                            key={line}
                            initial={reducedMotion ? false : "hidden"}
                            whileInView={reducedMotion ? undefined : "visible"}
                            viewport={{ once: true, amount: 0.35 }}
                            variants={reducedMotion ? undefined : descriptionItemVariants}
                            transition={reducedMotion ? undefined : {
                                delay: Math.min(index * 0.1, 0.3),
                                duration: 0.6,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            {line}
                        </motion.p>
                    ))}
                </motion.div>
            )}

            {(subHeading || bulletLines.length > 0) && (
                <motion.div
                    className="mx-auto mt-8 max-w-3xl text-left"
                >
                    {subHeading && (
                        <motion.h3
                            className="text-base font-semibold text-foreground sm:text-lg"
                            initial={reducedMotion ? false : "hidden"}
                            whileInView={reducedMotion ? undefined : "visible"}
                            viewport={{ once: true, amount: 0.35 }}
                            variants={reducedMotion ? undefined : descriptionItemVariants}
                        >
                            {subHeading}
                        </motion.h3>
                    )}

                    {bulletLines.length > 0 && (
                        <motion.ul
                            className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base"
                        >
                            {bulletLines.map((line, index) => (
                                <motion.li
                                    key={line}
                                    className="flex gap-3"
                                    initial={reducedMotion ? false : "hidden"}
                                    whileInView={reducedMotion ? undefined : "visible"}
                                    viewport={{ once: true, amount: 0.35 }}
                                    variants={reducedMotion ? undefined : descriptionItemVariants}
                                    transition={reducedMotion ? undefined : {
                                        delay: Math.min(index * 0.08, 0.24),
                                        duration: 0.6,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                >
                                    <span className="mt-2 h-2 w-2 flex-none rounded-full bg-foreground/70" />
                                    <span>{line}</span>
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </motion.div>
            )}
        </motion.div>
    )
}

function isBulletLine(line: string) {
    return BULLET_PREFIX_PATTERN.test(normalizeTextForComparison(line))
}

function isSubheadingLine(line: string) {
    const normalizedLine = normalizeTextForComparison(line)
    const wordCount = normalizedLine.split(/\s+/).length

    return normalizedLine.endsWith(":")
        && normalizedLine.length <= 90
        && wordCount <= 12
}

export default ExpertiseImageBentoGallery
