/**
 * 解码 HTML 实体，分号可选，支持双重编码（循环直到无变化）
 */
const entityPatterns: [RegExp, string][] = [
  [/&lt;?/gi, '<'],
  [/&gt;?/gi, '>'],
  [/&quot;?/gi, '"'],
  [/&#39;?/gi, "'"],
  [/&#x27;?/gi, "'"],
  [/&#x2F;?/gi, '/'],
  [/&nbsp;?/gi, ' '],
  [/&#160;?/gi, ' '],
  [/&amp;?/gi, '&'],
]

export function decodeHtml(text: string): string {
  if (!text) return text
  let result = text
  let prev: string
  do {
    prev = result
    for (const [pattern, replacement] of entityPatterns) {
      result = result.replace(pattern, replacement)
    }
  } while (result !== prev && result.length < prev.length * 3)
  return result
}
