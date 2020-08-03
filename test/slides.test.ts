/* eslint-disable no-undef */
import getSubtitle from '../src/utils/getSubtitle'

describe('Subtitle', () => {
  it('should return something different of article name', () => {
    const keywords = ['Sundar Pichai', 'Pichai Sundararajan', 'google CEO', 'until 2015']
    const articleName = 'Sundar Pichai'
    expect(getSubtitle(keywords, articleName)).toContain('Google CEO')
  })
})
