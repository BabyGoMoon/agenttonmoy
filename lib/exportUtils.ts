export const exportResults = (results: any[], filename: string, format: "txt" | "json" | "csv") => {
  let content = ""
  let mimeType = ""
  let extension = ""

  switch (format) {
    case "txt":
      content = results.map((r) => (typeof r === "string" ? r : r.value || JSON.stringify(r))).join("\n")
      mimeType = "text/plain"
      extension = "txt"
      break

    case "json":
      content = JSON.stringify(results, null, 2)
      mimeType = "application/json"
      extension = "json"
      break

    case "csv":
      if (results.length > 0) {
        const headers = Object.keys(results[0])
        const csvRows = [
          headers.join(","),
          ...results.map((row) =>
            headers
              .map((header) => {
                const value = row[header]
                return typeof value === "string" && value.includes(",") ? `"${value}"` : value
              })
              .join(","),
          ),
        ]
        content = csvRows.join("\n")
      }
      mimeType = "text/csv"
      extension = "csv"
      break
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const generateResultId = () => {
  return Math.random().toString(36).substr(2, 9)
}
