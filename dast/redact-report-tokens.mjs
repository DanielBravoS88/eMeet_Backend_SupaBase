import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const tokenFile = process.env.DAST_TOKEN_FILE
const reportsDir = process.env.DAST_REPORT_DIR
if (!tokenFile || !reportsDir) {
  throw new Error('Faltan DAST_TOKEN_FILE o DAST_REPORT_DIR')
}

const tokenData = JSON.parse(await readFile(tokenFile, 'utf8'))
const secrets = Object.values(tokenData)
  .map((entry) => entry?.accessToken)
  .filter((value) => typeof value === 'string' && value.length > 0)

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      await walk(path)
      continue
    }

    if (!/\.(html|json|md|xml)$/i.test(entry.name)) continue
    const original = await readFile(path, 'utf8')
    const redacted = secrets.reduce(
      (content, secret) => content.replaceAll(secret, '[REDACTED_DAST_TOKEN]'),
      original,
    )
    if (redacted !== original) await writeFile(path, redacted, 'utf8')
  }
}

await walk(reportsDir)
console.log(`Reportes sanitizados: ${reportsDir}`)
