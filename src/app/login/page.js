"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const deptSlug = searchParams.get("dept")
  const role = searchParams.get("role")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const [popupMessage, setPopupMessage] = useState("")
  const [showPopup, setShowPopup] = useState(false)

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

      if (data.user.department && deptName && data.user.department !== deptName) {
        showFriendlyPopup(
          `You’re not allowed to login via "${deptName}". Redirecting...`
        )

        setTimeout(() => {
          const correctSlug = Object.keys(departmentMap).find(
            key => departmentMap[key] === data.user.department
          )
          router.push(`/login?dept=${correctSlug}`)
        }, 3000)

        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("userId", data.user._id)
      localStorage.setItem("staffName", data.user.name)
      localStorage.setItem("department", data.user.department)
      localStorage.setItem("role", data.user.role)

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

      {showPopup && (
        <div className="fixed top-6 right-6 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ⚠️ {popupMessage}
        </div>
      )}

      <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-lg">

        <div className="mb-6 text-center">
          <img src="/logo.jpg" className="mx-auto w-24 h-24 rounded-full" />
          <h2 className="text-2xl font-semibold">JOOGAD TECH Institute</h2>

          {deptName && (
            <p className="text-gray-500 text-sm whitespace-pre-line">
              {`Welcome,\n${deptName}\nLogin`}
            </p>
          )}
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border mb-5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}