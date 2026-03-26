"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const deptSlug = searchParams.get("dept") // slug from welcome page
  const role = searchParams.get("role")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // For friendly popup message
  const [popupMessage, setPopupMessage] = useState("")
  const [showPopup, setShowPopup] = useState(false)

  // Map slug to proper department name
  const departmentMap = {
    "full-stack-web-developer": "Full-Stack Web Developer",
    "ui-ux-designer": "UI/UX Designer",
    "hardware-engineer": "Hardware Engineer",
    "cybersecurity-expert": "Cybersecurity Expert"
  }

  const deptName = deptSlug ? departmentMap[deptSlug] : null

  const showFriendlyPopup = (message) => {
    setPopupMessage(message)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000)
  }

  const handleLogin = async () => {
  if (!email || !password) {
    alert("Please fill all fields")
    return
  }

  try {
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Invalid login details")
      return
    }

    // ✅ Department restriction (KEEP THIS)
    if (data.user.department && deptName && data.user.department !== deptName) {
      showFriendlyPopup(
        `You’re not allowed to login via "${deptName}". Redirecting to your correct department...`
      )

      setTimeout(() => {
        const correctSlug = Object.keys(departmentMap).find(
          key => departmentMap[key] === data.user.department
        )
        router.push(`/login?dept=${correctSlug}`)
      }, 3000)

      return
    }

    // ✅ Save token + user info
    localStorage.setItem("token", data.token)
    localStorage.setItem("userId", data.user._id)
    localStorage.setItem("staffName", data.user.name)
    localStorage.setItem("department", data.user.department)
    localStorage.setItem("role", data.user.role)

    // ✅ Role-based redirect (FIXED ISSUE)
    if (data.user.role === "assessor") {
      router.push("/assessor-dashboard")
    } else {
      router.push("/staff-dashboard")
    }

  } catch (error) {
    console.error(error)
    alert("Login failed. Please try again.")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      {/* Friendly Popup */}
      {showPopup && (
        <div className="fixed top-6 right-6 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <span>⚠️</span>
          <span>{popupMessage}</span>
        </div>
      )}

      <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-lg">

        {/* Logo */}
        <div className="mb-6 text-center">
          <img
            src="/logo.jpg"
            alt="JOOGAD TECH Institute Logo"
            className="mx-auto mb-4 w-24 h-24 rounded-full"
          />
          <h2 className="text-2xl font-semibold mb-1 text-gray-900">JOOGAD TECH Institute</h2>
          {deptName && (
            <p className="text-gray-500 text-sm whitespace-pre-line">
              {`Welcome,\n${deptName}\nLogin`}
            </p>
          )}
        </div>

        {/* Login Form */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-500 p-3 text-gray-900 placeholder-gray-500 bg-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-500 p-3 text-gray-900 placeholder-gray-500 bg-white rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3  rounded-md text-white transition cursor-pointer ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-xs text-gray-700 mt-6">
          &copy; {new Date().getFullYear()} • Internal use only • Authorized staff access
        </p>

      </div>
    </div>
  )
}
function LoginWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}

export default LoginWrapper