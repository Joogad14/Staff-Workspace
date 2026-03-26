"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaHome, FaTasks, FaFileAlt, FaCheckCircle, FaBars } from "react-icons/fa"

export default function StaffDashboard() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("dashboard")
  const [userId, setUserId] = useState(null)
  const [staffName, setStaffName] = useState("")
  const [department, setDepartment] = useState("")
  const [showSidebar, setShowSidebar] = useState(true)

  const [attendanceCount, setAttendanceCount] = useState(0)
  const [todaySigned, setTodaySigned] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState("")

  const [verificationFile, setVerificationFile] = useState(null)
  const [verificationStatus, setVerificationStatus] = useState("Not Verified")

  const [fileWarning, setFileWarning] = useState("")

  const [submissions, setSubmissions] = useState([])
  const [successMessage, setSuccessMessage] = useState("")
  const [popupType, setPopupType] = useState("success")

  const showPopup = (message, type = "success") => {
    setSuccessMessage(message)
    setPopupType(type)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  // ---------------- GET USER ----------------
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    if (!storedUserId) router.push("/login")
    else setUserId(storedUserId)
  }, [])

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    if (!userId) return

    const loadData = async () => {
      const profile = await fetch("/api/staff/profile?userId=" + userId).then(r => r.json())
      setStaffName(profile.name)
      setDepartment(profile.department)

      const att = await fetch("/api/attendance?userId=" + userId).then(r => r.json())
      setAttendanceCount(att.total || 0)

      const signedToday = att.attendance?.some(
        a => new Date(a.date).toDateString() === new Date().toDateString()
      )
      setTodaySigned(signedToday || false)

      const subs = await fetch("/api/submissions?userId=" + userId).then(r => r.json())
      setSubmissions(subs.submissions || [])

      const ver = await fetch("/api/verification?userId=" + userId).then(r => r.json())
      if (ver.status === "approved") setVerificationStatus("Verified")
      else if (ver.status === "declined") setVerificationStatus("Declined")
      else if (ver.status === "pending") setVerificationStatus("Pending")
      else setVerificationStatus("Not Verified")
    }

    loadData()
  }, [userId])

  const attendanceProgress =
    attendanceCount > 0 ? Math.min(attendanceCount * 5, 100) : 0

  // ---------------- ATTENDANCE ----------------
  const handleSignIn = async () => {
    if (todaySigned) {
      showPopup("You already signed in today!", "error")
      return
    }

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, date: new Date().toISOString() })
    })

    if (res.ok) {
      setAttendanceCount(prev => prev + 1)
      setTodaySigned(true)
      showPopup("Attendance submitted ✓", "success")
    } else {
      showPopup("Failed to submit attendance!", "error")
    }
  }

  // ---------------- SUBMIT TASK (WORD BLOCK ONLY HERE) ----------------
  const handleSubmitTask = async () => {
    if (!title || !description) {
      showPopup("Title and description are required!", "error")
      return
    }

    if (file) {
      if (!(file instanceof File)) {
        showPopup("Invalid file!", "error")
        return
      }

      if (file.size >= 3 * 1024 * 1024) {
        showPopup("File must be less than 3MB!", "error")
        return
      }

      // ❌ WORD BLOCK ONLY HERE
      const isWord =
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx")

      if (isWord) {
        showPopup("Word files are not allowed for task submission!", "error")
        return
      }
    }

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("link", link)
    formData.append("userId", userId)
    if (file) formData.append("file", file)

    const res = await fetch("/api/submissions", {
      method: "POST",
      body: formData
    })

    if (res.ok) {
      const subs = await fetch("/api/submissions?userId=" + userId).then(r => r.json())
      setSubmissions(subs.submissions || [])

      setTitle("")
      setDescription("")
      setLink("")
      setFile(null)
      setFileName("")
      setFileWarning("")

      showPopup("Task submitted successfully ✓", "success")
    } else {
      showPopup("Failed to submit task!", "error")
    }
  }

  // ---------------- VERIFICATION (UNCHANGED) ----------------
  const handleSubmitVerification = async () => {
    if (!verificationFile) {
      showPopup("Please select a file for verification!", "error")
      return
    }

    if (!(verificationFile instanceof File)) {
      showPopup("Invalid file!", "error")
      return
    }

    if (verificationFile.size >= 3 * 1024 * 1024) {
      showPopup("File must be less than 3MB!", "error")
      return
    }

    const formData = new FormData()
    formData.append("file", verificationFile)
    formData.append("userId", userId)

    const res = await fetch("/api/verification", {
      method: "POST",
      body: formData
    })

    if (res.ok) {
      setVerificationStatus("Pending")
      showPopup("Verification submitted successfully ✓", "success")
    } else {
      showPopup("Failed to submit verification!", "error")
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const getGradeColor = (grade) => {
    if (grade === null || grade === undefined) return "bg-orange-100 text-orange-700"
    if (grade < 50) return "bg-red-100 text-red-700"
    if (grade <= 70) return "bg-yellow-100 text-yellow-700"
    return "bg-green-100 text-green-700"
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">

      {/* POPUP */}
      {successMessage && (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg z-50 ${
          popupType === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {successMessage}
        </div>
      )}

      {/* SIDEBAR */}
      {showSidebar && (
        <div className="w-64 bg-white dark:bg-gray-800 p-6 shadow-md">
          <h2 className="font-bold mb-6 text-lg">
            {staffName ? `${staffName}'s Workspace` : "Workspace"}
          </h2>

          {[
            { name: "Dashboard", key: "dashboard", icon: <FaHome /> },
            { name: "Submit Task", key: "tasks", icon: <FaTasks /> },
            { name: "My Submissions", key: "submissions", icon: <FaFileAlt /> },
            { name: "Verification", key: "verification", icon: <FaCheckCircle /> },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg mb-2 hover:bg-blue-100 text-blue-500 cursor-pointer"
            >
              {item.icon} {item.name}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="mt-6 text-red-600 font-semibold cursor-pointer"
          >
            Logout ({staffName})
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">

        <button
          className="md:hidden mb-4 p-2 bg-blue-500 text-white rounded-lg"
          onClick={() => setShowSidebar(prev => !prev)}
        >
          <FaBars />
        </button>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-50 p-6 rounded-xl shadow-sm text-center border border-gray-200 hover:shadow-md transition">
              <div className="flex justify-center items-center gap-2 mb-2">
                <img src="/images/wave.png" alt="wave" className="w-6 h-6" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-900">
                  {staffName ? `Hello, ${staffName}` : "Hello!"}
                </h2>
              </div>

              {department && (
                <div className="flex justify-center mt-1">
                  <p className="inline-flex items-center gap-2 text-sm bg-white text-gray-800 px-3 py-1 rounded-full shadow-sm font-medium border border-gray-200">
                    <img
                      src={
                        department === "Cybersecurity Expert"
                          ? "/images/cyber.png"
                          : department === "Full-Stack Web Developer"
                          ? "/images/web.png"
                          : department === "UI/UX Designer"
                          ? "/images/uiux.png"
                          : department === "Hardware Engineer"
                          ? "/images/hardware.png"
                          : "/images/default.png"
                      }
                      alt="department icon"
                      className="w-5 h-5"
                    />
                    {department}
                  </p>
                </div>
              )}

              <p className="text-gray-500 dark:text-gray-600 text-sm mt-2">
                Welcome back to your workspace
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attendance Card */}
              <div className="bg-white dark:bg-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md flex flex-col items-center transition">
                <p className="text-gray-700 font-medium">Total Attendance</p>
                <h2 className="text-2xl font-bold text-gray-900">{attendanceCount}</h2>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${attendanceProgress}%` }}
                  ></div>
                </div>
                <button
                  onClick={handleSignIn}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                >
                  {todaySigned ? "Signed Today" : "Sign Attendance"}
                </button>
              </div>

              {/* Verification Card */}
              <div className="bg-white dark:bg-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md flex flex-col items-center transition">
                <p className="text-gray-700 font-medium">Verification Status</p>
                <h2 className="text-xl font-semibold text-gray-900">{verificationStatus}</h2>
                <div className="w-full mt-3 bg-gray-200 h-2 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      verificationStatus === "Verified"
                        ? "bg-green-500"
                        : verificationStatus === "Pending"
                        ? "bg-yellow-400"
                        : "bg-red-500"
                    }`}
                    style={{
                      width:
                        verificationStatus === "Verified"
                          ? "100%"
                          : verificationStatus === "Pending"
                          ? "60%"
                          : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TASK SUBMISSION */}
        {activeTab === "tasks" && (
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 border border-gray-200 hover:shadow-md transition cursor-pointer">
            <h2 className="font-bold text-lg mb-2 text-gray-900">Submit Task</h2>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-500 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-500 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <input
              type="text"
              placeholder="Link (optional)"
              value={link}
              onChange={e => setLink(e.target.value)}
              className="w-full p-3 border border-gray-500 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <label className="block w-full p-3 border border-gray-500 rounded-xl cursor-pointer text-gray-700 hover:bg-gray-50 transition">
              {fileName || "Upload File (Max 3MB)"}
              <input
                type="file"
                className="hidden"
                onChange={e => {
                  const selectedFile = e.target.files[0]
                  if (selectedFile) {
                    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
                    const isDocx = selectedFile.name.endsWith(".doc") || selectedFile.name.endsWith(".docx")
                    
                    if (isDocx || !allowedTypes.includes(selectedFile.type)) {
                      setFile(null)
                      setFileName("")
                      setFileWarning(" Only images (JPG/PNG) and PDFs are allowed. Word files are not accepted.")
                    } else {
                      setFile(selectedFile)
                      setFileName(selectedFile.name)
                      setFileWarning("") // clear warning
                    }
                  }
                }}
              />
            </label>
            <p className="text-red-500 text-sm mt-1">
              Allowed: Images (JPG/PNG), PDFs documents only
            </p>
            {fileWarning && (
              <p className="text-red-500 text-sm mt-1">{fileWarning}</p>
            )}

            <button
              onClick={handleSubmitTask}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition cursor-pointer"
            >
              Submit Task
            </button>
          </div>
        )}

        {/* MY SUBMISSIONS */}
        {activeTab === "submissions" && (
          <div>
            <h2 className="font-bold text-xl mb-4 text-gray-900">My Submissions ({submissions.length})</h2>
            {submissions.map(sub => (
              <div key={sub._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between mb-3 hover:shadow-md transition">
                <div>
                  <b className="text-gray-800">{sub.title}</b>
                  <p className="text-sm text-gray-500">{sub.description}</p>
                </div>
                <div>
                  {sub.grade !== undefined && sub.grade !== null ? (
                    <span className={`${getGradeColor(sub.grade)} px-3 py-1 rounded-full text-sm font-semibold`}>
                      {sub.grade}%
                    </span>
                  ) : (
                    <span className="text-orange-500 text-sm font-semibold">
                      Not yet graded, check back later
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

       {/* VERIFICATION */}
{activeTab === "verification" && (
  <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 border border-gray-200 hover:shadow-md transition">
    <h2 className="font-bold text-lg text-gray-900">Account Verification</h2>
    <p className="text-sm">{verificationStatus}</p>

    <label className="block w-full p-3 border border-gray-300 rounded-xl cursor-pointer text-gray-700 hover:bg-gray-50 transition">
      {verificationFile?.name || "Upload Verification File (Max 3MB)"}
      <input
        type="file"
        className="hidden"
        onChange={e => {
          const selectedFile = e.target.files[0]
          if (selectedFile) {
            setVerificationFile(selectedFile)
          }
        }}
      />
    </label>
    <p className="text-blue-500 text-sm mt-1">
              Allowed: Images (JPG/PNG), PDFs, and Word documents (.doc, .docx, pptx)
          </p>

    <button
      onClick={handleSubmitVerification}
      className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition cursor-pointer"
    >
      Submit Verification
    </button>
  </div>
)}
      </div>
    </div>
  )
}

        