export interface IContent {
    searchTerm: string
    prefix: string
    sourceContentOriginal: string
    sourceContentSanitized: string
    sentences: IContentSentence[]
}

export interface IContentSentence {
    text: string
    keywords: string[]
    images: string[]
}