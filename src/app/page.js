"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaChevronDown } from "react-icons/fa"

export default function Home() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState("")
  const dropdownRef = useRef(null)

  // Departments with proper name and slug for URL
  const departments = [
    { name: "Full-Stack Web Developer", slug: "full-stack-web-developer" },
    { name: "UI/UX Designer", slug: "ui-ux-designer" },
    { name: "Hardware Engineer", slug: "hardware-engineer" },
    { name: "Cybersecurity Expert", slug: "cybersecurity-expert" },
  ]

  const handleSelect = (dept) => {
    setSelected(dept.name)
    setOpen(false)
  }

  const handleContinue = () => {
    if (!selected) {
      alert("Please select your department")
      return
    }
    const deptObj = departments.find(d => d.name === selected)
    if (!deptObj) return
    router.push(`/login?dept=${deptObj.slug}`)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* LEFT IMAGE SIDE */}
      <div
        className="hidden md:flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1497215728101-856f4ea42174)",
        }}
      >
        <div className="bg-black/50 w-full h-full flex flex-col justify-center items-center text-white p-10">
          <h1 className="text-4xl font-bold mb-4">JOOGAD TECH Institute</h1>
          <p className="text-lg text-center max-w-md">
            Secure internal portal for department staff submissions, evaluations, and verification processes.
          </p>
        </div>
      </div>

      {/* RIGHT FORM SIDE */}
      <div className="flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-lg">

          {/* Top logo */}
          <div className="mb-6 text-center">
            <img
              src="/remove.png"
              alt="JOOGAD TECH Logo"
              className="mx-auto mb-4 w-20 h-20 rounded-full"
            />
            <h2 className="text-2xl font-semibold mb-1 text-gray-900">JOOGAD TECH Institute</h2>
            <p className="text-sm text-gray-700">Select your department to continue</p>
          </div>

          {/* Dropdown */}
          <div className="mb-4 relative" ref={dropdownRef}>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Department
            </label>
            <div
                onClick={() => setOpen(!open)}
                className="w-full bg-white border border-gray-400 rounded-md p-3 flex justify-between items-center cursor-pointer hover:border-blue-500 focus:ring-2 focus:ring-blue-400 transition shadow-sm hover:shadow-md"
              >
                <span className={`${selected ? "text-gray-900" : "text-gray-500"}`}>
                  {selected || "Choose Department"}
                </span>
              <FaChevronDown
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </div>

            {open && (
              <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-40 overflow-auto">
                {departments.map((dept, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelect(dept)}
                    className="p-3 cursor-pointer hover:bg-blue-100 transition"
                  >
                    {dept.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition cursor-pointer mb-4"
          >
            Continue to Login
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-3 text-gray-700 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Assessor button */}
          <button
            onClick={() => router.push("/login?role=assessor")}
            className="w-full border text-gray-600 border-gray-500 py-3 rounded-md hover:bg-gray-50 transition cursor-pointer"
          >
            Assessor Access
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            &copy; {new Date().getFullYear()} • Internal use only • Authorized staff access
          </p>

        </div>
      </div>
    </div>
  )
}