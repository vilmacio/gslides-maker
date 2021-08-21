export interface WikipediaParams {
    articleName: string
    lang: string
}

export interface WikipediaObject {
    summary?: () => Promise<string>
    search?: (query: string) => Promise<string[]>
}
