/** One CSV cell. Leading formula characters are quoted so spreadsheets show text, not formulas. */
export function csvCell(value: string | number) {
  const text = String(value)
  const guarded = /^[=+\-@\t\r]/.test(text) ? "'" + text : text
  if (/[",\n\r]/.test(guarded)) return '"' + guarded.replaceAll('"', '""') + '"'
  return guarded
}

/** Excel opens UTF-8 correctly only with a byte-order mark. */
export function csvDocument(rows: (string | number)[][]) {
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n'
}

/** RFC 4180 rows: quoted fields, doubled quotes, CRLF or LF. Blank lines are dropped. */
export function parseCsv(input: string) {
  const text = input.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"'
        index++
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"' && field === '') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index++
      row.push(field)
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else field += char
  }
  row.push(field)
  if (row.some((cell) => cell.trim() !== '')) rows.push(row)
  return rows
}
