export interface Data {
    input?:{
        search?: string,
        articleName?: string,
        lang?: string
    },
    content?:{
        fullContent?: string,
        cleanedContent?: string,
        images?: Array<string>
    }
}

const data:Data = {
  input: {},
  content: {}
}

export default data
