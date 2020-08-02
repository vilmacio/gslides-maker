/* eslint-disable no-undef */
import getSubtitle from '../src/utils/getSubtitle'

describe('Subtitle', () => {
  it('should return something different of article name', () => {
    const keywords = ['Sundar Pichai', 'Pichai Sundararajan', 'Google CEO']
    const articleName = 'Sundar Pichai'
    expect(getSubtitle(keywords, articleName)).toContain('Google CEO')
  })
})
