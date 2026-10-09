export function parseArgs(argv) {
  const options = {}
  const positionals = []
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === '--') continue
    if (token.startsWith('--')) {
      const [key, inlineValue] = token.slice(2).split('=', 2)
      if (inlineValue !== undefined) options[key] = inlineValue
      else if (argv[index + 1] && !argv[index + 1].startsWith('--')) options[key] = argv[++index]
      else options[key] = true
    } else positionals.push(token)
  }
  return { options, positionals }
}
