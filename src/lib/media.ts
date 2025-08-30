// lib/media.ts
type Media = {
    url?: string
    sizes?: { thumbnail?: { url: string }; card?: { url: string } }
} | string | undefined | null

export function getImageUrl(image: Media) {
    if (!image) return undefined

    const raw =
        typeof image === 'object'
            ? image.sizes?.card?.url ||
            image.sizes?.thumbnail?.url ||
            image.url
            : image

    if (!raw) return undefined
    if (/^https?:\/\//i.test(raw)) return raw

    const CMS = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, '')
    if (!CMS) {
        // last resort: keep it relative (works only if CMS and Next are same origin)
        return raw.startsWith('/') ? raw : `/${raw}`
    }
    return `${CMS}${raw.startsWith('/') ? '' : '/'}${raw}`
}
