"use client";

import { useState, useEffect } from "react";

export default function AssessorDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [assessor, setAssessor] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  const showPopup = (msg, type = "success") => {
    setSuccessMessage(msg);
    setPopupType(type);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // FETCH ASSESSOR
  useEffect(() => {
    const fetchAssessor = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        setAssessor(data.user);
      } catch {
        window.location.href = "/login";
      }
    };
    fetchAssessor();
  }, []);

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // VERIFY
  const handleVerification = async (verificationId, status) => {
    const res = await fetch("/api/verification", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationId, status }),
    });

    if (res.ok) {
      showPopup(`Verification ${status}!`);
      setUsers(prev =>
        prev.map(u =>
          u.verification && u.verification._id === verificationId
            ? { ...u, verification: { ...u.verification, status } }
            : u
        )
      );
    }
  };

  // GRADE (FIXED)
  const handleGrade = async (userId, taskId, grade) => {
    if (!assessor) return;

    if (grade === "" || isNaN(grade) || grade < 0 || grade > 100) {
      showPopup("Enter valid grade (0-100)", "error");
      return;
    }

    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        taskId,
        score: Number(grade),
        gradedBy: assessor._id
      }),
    });

    if (res.ok) {
      showPopup("Grade submitted ✓");

      // 🔥 INSTANT UI UPDATE
      setUsers(prev =>
        prev.map(u => {
          if (u._id !== userId) return u;

          return {
            ...u,
            submissions: u.submissions.map(t =>
              t._id === taskId
                ? { ...t, grade: Number(grade) }
                : t
            )
          };
        })
      );
    }
  };

  const getGradeColor = (grade) => {
    if (grade === null) return "bg-gray-100 text-gray-600";
    if (grade < 50) return "bg-red-100 text-red-700";
    if (grade <= 70) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">

      {/* POPUP */}
      {successMessage && (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg z-50 ${
          popupType === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}>
          {successMessage}
        </div>
      )}

      {/* NAVBAR */}
      <div className="bg-white p-5 rounded-xl shadow flex justify-between mb-6">
        <div>
          <h2 className="font-bold text-xl">
            Welcome, {assessor?.name || "Assessor"}
          </h2>
          <p className="text-sm text-gray-700">Manage staff activities</p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by name or department..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full max-w-lg p-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
      </div>

      {/* CONTENT */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-6">

          {users
            .filter(u =>
              u.name.toLowerCase().includes(filter.toLowerCase()) ||
              u.department.toLowerCase().includes(filter.toLowerCase())
            )
            .map(user => (
              <div key={user._id} className="bg-white p-5 rounded-xl shadow">

                {/* USER HEADER */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">{user.department}</p>
                  </div>

                  <div className="text-right text-sm text-gray-600">
                    <p>Attendance ({user.attendance?.length || 0})</p>
                    <p>Tasks ({user.submissions?.length || 0})</p>
                  </div>
                </div>

                {/* ATTENDANCE */}
                <div className="mb-4">
                  <p className="font-semibold mb-2 text-gray-700">Attendance</p>
                  {user.attendance?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {user.attendance.map((d, i) => (
                        <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {new Date(d).toLocaleDateString()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No attendance</p>
                  )}
                </div>

                {/* TASKS */}
                <div className="mb-4">
                  <p className="font-semibold mb-2 text-gray-700">Tasks</p>

                  {user.submissions?.length ? (
                    user.submissions.map(task => (
                      <div key={task._id} className="bg-gray-50 p-4 rounded-xl mb-3">

                        <b>{task.title}</b>
                        <p className="text-sm text-gray-500">{task.description}</p>

                        {/* LINKS */}
                        <div className="flex gap-2 mt-3">
                          {task.link && (
                            <a href={task.link} target="_blank">
                              <button className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer">
                                View Link
                              </button>
                            </a>
                          )}

                          {task.fileUrl && (
                            <a href={task.fileUrl} target="_blank">
                              <button className="bg-green-500 text-white px-3 py-1 rounded cursor-pointer">
                                View File
                              </button>
                            </a>
                          )}
                        </div>

                        {/* GRADE */}
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={task.grade ?? ""}
                            id={`grade-${user._id}-${task._id}`}
                            className="p-2 rounded-xl w-20 border border-gray-300 text-gray-900 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                          />

                          <button
                            className="bg-blue-600 text-white px-3 py-2 rounded cursor-pointer"
                            onClick={() => {
                              const input = document.getElementById(`grade-${user._id}-${task._id}`);
                              handleGrade(user._id, task._id, input.value);
                            }}
                          >
                            Submit
                          </button>

                          {task.grade !== null && task.grade !== undefined && (
                            <span className={`${getGradeColor(task.grade)} px-2 py-1 rounded-full text-sm`}>
                              {task.grade}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No submissions</p>
                  )}
                </div>

                {/* VERIFICATION (YOUR ORIGINAL LOGIC KEPT) */}
                <div>
                  <p className="font-semibold mb-2 text-gray-700">Verification</p>

                  {user.verification ? (
                    <div className="flex flex-col gap-2">

                      {user.verification.fileLink && (
                        <a href={`/api/verification/file/${user.verification._id}`} target="_blank">
                          <button className="bg-indigo-500 text-white px-3 py-1 rounded cursor-pointer">
                            View Verification File
                          </button>
                        </a>
                      )}

                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleVerification(user.verification._id, "approved")}
                          className="bg-green-500 text-white px-3 py-1 rounded cursor-pointer"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleVerification(user.verification._id, "declined")}
                          className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>

                      {user.verification.status === "approved" && (
                        <span className="text-green-600 font-semibold">Approved ✓</span>
                      )}
                      {user.verification.status === "declined" && (
                        <span className="text-red-600 font-semibold">Declined ✗</span>
                      )}
                      {user.verification.status === "pending" && (
                        <span className="text-yellow-600 font-semibold">Pending</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Not submitted</p>
                  )}
                </div>

              </div>
            ))}
        </div>
      )}
    </div>
  );
}