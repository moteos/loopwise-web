export function downloadCsv(filename: string, content: string): void {
  try {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()

    // Revoke on the next tick so the browser has begun the transfer.
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 0)
  } catch (error) {
    throw new Error(`Could not prepare "${filename}" for download.`, {
      cause: error,
    })
  }
}
