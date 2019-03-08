import algorithmia from 'algorithmia';
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
import sentenceBoundaryDetection from 'sbd';
import { IContent } from './robots.api';

async function robot(content: IContent) {
  await fetchContentFromWikipedia(content)
  sanitizeContent(content)
  breakContentIntoSentences(content)

  async function fetchContentFromWikipedia(content: IContent) {
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
    const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
    
    const { wikipediaContent } = wikipediaResponde.get()
    content.sourceContentOriginal = wikipediaContent
  }

  function sanitizeContent(content: IContent) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

    content.sourceContentSanitized = withoutDatesInParentheses

    function removeBlankLinesAndMarkdown(text: string): string {
      const allLines = text.split('\n')

      const filterFunc = (line: string) => 
        !(line.trim().length === 0 || line.trim().startsWith('='))
      
      return allLines.filter(filterFunc).join(' ')
    }
  }

  function removeDatesInParentheses(text: string): string {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
  }

  function breakContentIntoSentences(content: IContent) {
    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
    content.sentences = sentences.map((text: string) => ({ 
      text,
      keywords: [],
      images: []
    }))
  }

}

module.exports = robot
