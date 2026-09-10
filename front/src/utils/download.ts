export async function downloadFile(url: string, filename: string) {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    a.click()

    URL.revokeObjectURL(objectUrl)
}
