export function isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url)
}

export function isVideoUrl(url: string): boolean {
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
}

export function isMediaUrl(url: string): boolean {
    return isImageUrl(url) || isVideoUrl(url)
}
