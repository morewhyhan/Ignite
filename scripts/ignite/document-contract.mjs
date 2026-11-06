import { CONTENT_HEADINGS } from './content-contract.mjs'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

export function markdownHeadings(content) {
  const headings = []
  let fence = null
  for (const line of content.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)
    if (marker) {
      if (!fence) fence = marker[1]
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null
      continue
    }
    if (fence) continue
    const match = line.match(/^##\s+(.+?)\s*#*\s*$/)
    if (match) headings.push(`## ${match[1].trim()}`)
  }
  return headings
}

export function standardRegistryFailures(files, readmeText, isGoverned) {
  const failures = []
  for (const file of files) {
    if (!readmeText.includes(file))
      failures.push(`standard is not indexed in docs/standards/README.md: ${file}`)
    if (!isGoverned(`docs/standards/${file}`))
      failures.push(`standard is not covered by the governance path whitelist: ${file}`)
  }
  return failures
}

export function validatePlanDocument(content, template, { contentContract = false } = {}) {
  if (template === null) return []
  const actual = new Set(markdownHeadings(content))
  return markdownHeadings(template)
    .filter((heading) => contentContract || !CONTENT_HEADINGS.includes(heading))
    .filter((heading) => !actual.has(heading))
    .map((heading) => `missing heading "${heading}"`)
}

export function validateLocalLinks(root, path, content) {
  const failures = []
  for (const match of content.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g)) {
    let target = match[1].trim()
    if (target.startsWith('#') || target.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(target))
      continue
    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1)
    target = target.split('#', 1)[0].split('?', 1)[0]
    if (!target || (path.includes('_template.md') && target.includes('<'))) continue
    try {
      if (!existsSync(resolve(root, dirname(path), decodeURIComponent(target))))
        failures.push(`broken local link ${target}`)
    } catch {
      failures.push(`invalid encoded link ${target}`)
    }
  }
  return failures
}
