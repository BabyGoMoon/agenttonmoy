"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Search, CircleDot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  "Subdomain Finder",
  "XSS Scanner",
  "Open Redirect",
  "LFI Checker",
  "Custom SQLi",
  "WHOIS Lookup",
  "DNS Scanner",
  "HTTP Headers",
  "Recon Hub",
]

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
}

const SearchBar = ({ placeholder = "Search security tools...", onSearch }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.trim()) {
      const filtered = SUGGESTIONS.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600) // Reduced animation time
    }
  }

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])

  const searchIconVariants = {
    initial: { scale: 1 },
    animate: {
      rotate: isAnimating ? [0, -10, 10, 0] : 0, // Reduced rotation
      scale: isAnimating ? [1, 1.1, 1] : 1, // Reduced scale
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  }

  const suggestionVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, delay: i * 0.03 }, // Reduced delays
    }),
    exit: { opacity: 0, y: -5, transition: { duration: 0.1 } },
  }

  const particles = Array.from({ length: isFocused ? 6 : 0 }, (_, i) => (
    <motion.div
      key={i}
      initial={{ scale: 0 }}
      animate={{
        x: [0, (Math.random() - 0.5) * 20], // Reduced movement
        y: [0, (Math.random() - 0.5) * 20],
        scale: [0, Math.random() * 0.5 + 0.3], // Smaller particles
        opacity: [0, 0.6, 0], // Reduced opacity
      }}
      transition={{
        duration: Math.random() * 1 + 1, // Shorter duration
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
      className="absolute w-2 h-2 rounded-full bg-green-400" // Smaller size
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        filter: "blur(1px)", // Reduced blur
      }}
    />
  ))

  return (
    <div className="relative w-full">
      <motion.form
        onSubmit={handleSubmit}
        className="relative flex items-center justify-center w-full mx-auto"
        initial={{ width: "240px" }}
        animate={{ width: isFocused ? "320px" : "240px" }} // Reduced expansion
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div
          className={cn(
            "flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-sm",
            isFocused ? "border-green-500/50 bg-gray-800/70" : "border-green-600/30 bg-gray-800/50",
          )}
          animate={{
            boxShadow: isFocused
              ? "0 8px 25px rgba(0, 0, 0, 0.15)" // Reduced shadow
              : "0 0 0 rgba(0, 0, 0, 0)",
          }}
        >
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              style={{
                background: "linear-gradient(90deg, #61cf5a 0%, #50864c 100%)",
              }}
            />
          )}

          <div className="absolute inset-0 overflow-hidden rounded-full -z-5">{particles}</div>

          <motion.div className="pl-4 py-3" variants={searchIconVariants} initial="initial" animate="animate">
            <Search
              size={18} // Slightly smaller
              strokeWidth={isFocused ? 2.5 : 2}
              className={cn(
                "transition-colors duration-200", // Faster transition
                isAnimating ? "text-green-400" : isFocused ? "text-green-400" : "text-green-500",
              )}
            />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Faster blur
            className={cn(
              "w-full py-3 bg-transparent outline-none placeholder:text-green-500/60 font-medium text-sm relative z-10", // Smaller text
              isFocused ? "text-green-300" : "text-green-400",
            )}
          />

          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }} // Reduced hover effect
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 mr-2 text-xs font-medium rounded-full bg-green-600 hover:bg-green-700 text-black transition-colors"
              >
                Search
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.form>

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }} // Faster animation
            className="absolute z-10 w-full mt-2 overflow-hidden bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-green-600/30"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  custom={index}
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => {
                    setSearchQuery(suggestion)
                    if (onSearch) onSearch(suggestion)
                    setIsFocused(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md hover:bg-green-600/20 group transition-colors"
                >
                  <CircleDot size={14} className="text-green-400 group-hover:text-green-300" />
                  <span className="text-green-300 group-hover:text-green-200 text-sm">{suggestion}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { SearchBar }
