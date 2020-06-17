export interface Data {
    input?:{
        search?: string,
        article?: string,
        lang?: string
    },
    content?:{
        fullContent?: string,
        cleanedContent?: string,
        images?: Array<string>
    }
}

const data:Data = {}

export default data
