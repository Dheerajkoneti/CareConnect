// client/src/pages/VolunteerPage.js
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { FaSearch, FaUserCircle, FaPhone, FaComments } from "react-icons/fa";
import socket from "../utils/socket";
import axios from "axios";

export default function VolunteerPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // (Replace with real auth in your app)
  const currentUserId = "user_001";
  const currentUserName = "Dini Test";

  // --- Core state ---
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [waitingMessage, setWaitingMessage] = useState("");

  // Request / modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  // Register modal
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    experience: "",
  });

  // Internship modal
  const [internshipFormOpen, setInternshipFormOpen] = useState(false);
  const [internForm, setInternForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    degree: "",
    duration: "",
    startDate: "",
    interest: "",
    motivation: "",
    resume: null,
  });

  // Filters/pagination
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // Profile quick-view
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileVol, setProfileVol] = useState(null);

  // Ringing tone
  const [isRinging, setIsRinging] = useState(false);
  const ringRef = useRef(null);

  // ---------- Fetch ----------
  const fetchVolunteers = async () => {
    const res = await axios.get("/api/volunteers/list");
    setVolunteers(res.data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchVolunteers();
      } catch (e) {
        console.error("Failed to fetch volunteers", e);
      }
    })();

    // Socket events
    socket.on("status_updated", ({ volunteerId, status }) => {
      setVolunteers((prev) =>
        prev.map((v) => (String(v._id) === String(volunteerId) ? { ...v, status } : v))
      );
    });

    socket.on("invite_forwarded", () => {
      setWaitingMessage("📨 Volunteer notified — waiting for response...");
      setIsRinging(true);
      try { ringRef.current?.play(); } catch {}
    });

    socket.on("invite_failed", ({ reason }) => {
      setWaitingMessage(`❌ Invite failed: ${reason}`);
      setIsRinging(false);
      if (ringRef.current) { ringRef.current.pause(); ringRef.current.currentTime = 0; }
    });

    socket.on("invite_accepted", ({ room, volunteerId, userId, type }) => {
      if (String(userId) !== String(currentUserId)) return;
      setWaitingMessage("✅ Volunteer accepted — connecting...");
      setIsRinging(false);
      if (ringRef.current) { ringRef.current.pause(); ringRef.current.currentTime = 0; }
      // Navigate to your chat/call pages:
      if (type === "chat") navigate(`/chat/${volunteerId}`, { state: { room } });
      else navigate(`/video-call`, { state: { room, volunteerId } });
    });

    socket.on("invite_declined", () => {
      setWaitingMessage("❌ Volunteer declined your request.");
      setIsRinging(false);
      if (ringRef.current) { ringRef.current.pause(); ringRef.current.currentTime = 0; }
    });

    return () => {
      socket.off("status_updated");
      socket.off("invite_forwarded");
      socket.off("invite_failed");
      socket.off("invite_accepted");
      socket.off("invite_declined");
    };
  }, [navigate, currentUserId]);

  // Build distinct skills list when volunteers change
  useEffect(() => {
    const all = (volunteers || [])
      .flatMap((v) =>
        Array.isArray(v.skills)
          ? v.skills
          : String(v.skills || "")
              .split(",")
              .map((s) => s.trim())
      )
      .filter(Boolean);
    setSkills(Array.from(new Set(all)).sort());
  }, [volunteers]);

  // ---------- Derived lists ----------
  const filtered = volunteers.filter((v) => {
    const byName = (v.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const bySkill =
      !selectedSkill ||
      (Array.isArray(v.skills)
        ? v.skills.map((s) => String(s).toLowerCase()).includes(selectedSkill.toLowerCase())
        : String(v.skills || "").toLowerCase().includes(selectedSkill.toLowerCase()));
    return byName && bySkill;
  });

  const visible = filtered.slice(0, page * PAGE_SIZE);

  // ---------- Helpers ----------
  const openConfirmSend = (vol) => {
    setSelectedVolunteer(vol);
    setConfirmModalOpen(true);
  };

  const sendInvite = (type = "chat") => {
    if (!selectedVolunteer) return;
    socket.emit("invite_volunteer", {
      volunteerId: selectedVolunteer._id,
      userId: currentUserId,
      userName: currentUserName,
      type,
    });
    setConfirmModalOpen(false);
    setWaitingMessage(`🔔 ${type === "chat" ? "Chat" : "Call"} request sent — waiting for response...`);
  };

  // Register handlers
  const handleRegisterChange = (e) =>
    setRegisterForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submitRegister = async (e) => {
    e.preventDefault();
    await axios.post("/api/volunteers/register", registerForm);
    alert("✅ Volunteer registered successfully!");
    setRegisterModalOpen(false);
    setRegisterForm({ name: "", email: "", phone: "", skills: "", experience: "" });
    fetchVolunteers();
  };

  // Internship handlers
  const handleInternChange = (e) => {
    const { name, value, files } = e.target;
    setInternForm((p) => ({ ...p, [name]: files ? files[0] : value }));
  };

  const submitIntern = async (e) => {
    e.preventDefault();
    // If you later enable file upload, switch to FormData here
    await axios.post("/api/internships/apply", {
      ...internForm,
      program: "Psychology Internship",
    });
    alert("✅ Internship application submitted!");
    setInternshipFormOpen(false);
    setInternForm({
      name: "",
      email: "",
      phone: "",
      college: "",
      degree: "",
      duration: "",
      startDate: "",
      interest: "",
      motivation: "",
      resume: null,
    });
  };

  // ---------- UI Styles ----------
  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "15px",
    background: "#fff",
  };

  const theme = {
    content: { flex: 1, padding: 28, background: isDarkMode ? "#0f1720" : "#fff" },
    card: {
      background: "#fff",
      borderRadius: 12,
      padding: 18,
      boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
    },
    button: { padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer" },
  };

  // ---------- Render ----------
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      {/* Ring tone element */}
      <audio
        ref={ringRef}
        src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_b0ce9b7b85.mp3?filename=old-telephone-ringing-6071.mp3"
        loop
      />
      <div style={theme.content}>
        <h1 style={{ display: "inline-block", marginRight: 12 }}>🌍 Volunteer Hub</h1>

        {/* Top actions */}
        <div style={{ float: "right" }}>
          <button
            onClick={() => setInternshipFormOpen(true)}
            style={{ ...theme.button, background: "#4C1D95", color: "#fff", marginRight: 12 }}
          >
            🧠 Psychology Internship
          </button>
          <button
            onClick={() => setRegisterModalOpen(true)}
            style={{ ...theme.button, background: "#6A1B9A", color: "#fff" }}
          >
            🤝 Register as Volunteer
          </button>
        </div>

        {/* Filters row */}
        <div style={{ clear: "both", marginTop: 18 }} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <FaSearch size={18} />
          <input
            placeholder="Search volunteers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
          />

          <select
            value={selectedSkill}
            onChange={(e) => {
              setSelectedSkill(e.target.value);
              setPage(1);
            }}
            style={{ padding: 10, borderRadius: 6, border: "1px solid #ddd", minWidth: 200 }}
          >
            <option value="">All skills</option>
            {skills.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {(selectedSkill || searchTerm) && (
            <button
              onClick={() => {
                setSelectedSkill("");
                setSearchTerm("");
                setPage(1);
              }}
              style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #eee", background: "#f6f6f6" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Available Volunteers */}
        <h2 style={{ marginTop: 24 }}>🧑‍🤝‍🧑 Available Volunteers</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {visible.map((v) => {
            const available = v.status === "available";
            const skillsText = Array.isArray(v.skills) ? v.skills.join(", ") : v.skills || "Volunteer";
            return (
              <div key={v._id} className="cc-card" style={theme.card}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <FaUserCircle size={42} color="#6A1B9A" />
                    <span
                      title={v.status}
                      style={{
                        position: "absolute",
                        right: 2,
                        bottom: 2,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: available ? "#10b981" : "#ef4444",
                        border: "2px solid #fff",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{v.name}</div>
                    <div style={{ color: "#666", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {skillsText}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => available && openConfirmSend(v)}
                    disabled={!available}
                    title="Chat"
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: available ? "#6A1B9A" : "#ddd",
                      color: "#fff",
                      cursor: available ? "pointer" : "not-allowed",
                    }}
                  >
                    <FaComments style={{ marginRight: 6 }} />
                    Chat
                  </button>
                  <button
                    onClick={() => {
                      if (!available) return;
                      setSelectedVolunteer(v);
                      setConfirmModalOpen(true);
                      setTimeout(() => sendInvite("call"), 0);
                    }}
                    disabled={!available}
                    title="Call"
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: available ? "#059669" : "#ddd",
                      color: "#fff",
                      cursor: available ? "pointer" : "not-allowed",
                    }}
                  >
                    <FaPhone style={{ marginRight: 6 }} />
                    Call
                  </button>
                </div>

                <button
                  onClick={() => {
                    setProfileVol(v);
                    setProfileOpen(true);
                  }}
                  style={{
                    width: "100%",
                    marginTop: 8,
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid #eee",
                    background: "#fafafa",
                    cursor: "pointer",
                  }}
                >
                  View Profile
                </button>
              </div>
            );
          })}
        </div>

        {visible.length < filtered.length && (
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button
              onClick={() => setPage((p) => p + 1)}
              style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}
            >
              Load more
            </button>
          </div>
        )}

        {waitingMessage && (
          <p style={{ marginTop: 12, fontStyle: "italic" }}>
            {isRinging ? "🔔 " : ""}{waitingMessage}
          </p>
        )}

        {/* Collaborations & NGOs */}
        <h2 style={{ marginTop: 35 }}>🌐 Collaborations & NGO Partners</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {[
            { name: "UN Volunteers", url: "https://www.unv.org", blurb: "Global sustainable volunteer programs." },
            { name: "Red Cross", url: "https://www.redcross.org", blurb: "Humanitarian support worldwide." },
            { name: "Robin Hood Army", url: "https://robinhoodarmy.com", blurb: "Food distribution & hunger support." },
            { name: "Teach For India", url: "https://teachforindia.org", blurb: "Educational volunteering initiatives." },
          ].map((p) => (
            <div key={p.url} style={theme.card}>
              <h3>{p.name}</h3>
              <p>{p.blurb}</p>
              <button onClick={() => window.open(p.url, "_blank")} style={{ ...theme.button, background: "#6A1B9A", color: "#fff" }}>
                Visit Site
              </button>
            </div>
          ))}
        </div>

        {/* Colleges & Internships */}
        <h2 style={{ marginTop: 35 }}>🎓 Partner Colleges & Internships</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {[
            { name: "TISS", url: "https://tiss.edu", blurb: "Psychology & Social Work Programs." },
            { name: "Christ University", url: "https://christuniversity.in", blurb: "Mental wellness research partnerships." },
            { name: "Delhi University", url: "https://www.du.ac.in", blurb: "Psychology volunteer programs." },
            { name: "Amity Institute of Psychology", url: "https://amity.edu", blurb: "EI training & internships." },
          ].map((c) => (
            <div key={c.url} style={theme.card}>
              <h4>{c.name}</h4>
              <p>{c.blurb}</p>
              <button onClick={() => window.open(c.url, "_blank")} style={{ ...theme.button, background: "#6A1B9A", color: "#fff" }}>
                Visit Website
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Request Modal */}
      {confirmModalOpen && selectedVolunteer && (
        <div style={overlayStyle}>
          <div style={boxStyle(420)}>
            <h3>Connect with {selectedVolunteer.name}?</h3>
            <p>Select how you want to connect:</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => sendInvite("chat")} style={{ ...theme.button, background: "#6A1B9A", color: "#fff" }}>
                💬 Chat
              </button>
              <button onClick={() => sendInvite("call")} style={{ ...theme.button, background: "#059669", color: "#fff" }}>
                📞 Call
              </button>
              <button onClick={() => setConfirmModalOpen(false)} style={{ ...theme.button, background: "#ccc" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Quick-View Modal */}
      {profileOpen && profileVol && (
        <div style={overlayStyle}>
          <div style={boxStyle(560)}>
            <h3 style={{ marginBottom: 4 }}>{profileVol.name}</h3>
            <p style={{ color: "#666", marginTop: 0 }}>
              {Array.isArray(profileVol.skills) ? profileVol.skills.join(", ") : profileVol.skills || "Volunteer"}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div style={infoCard}><strong>Email</strong><div>{profileVol.email || "—"}</div></div>
              <div style={infoCard}><strong>Phone</strong><div>{profileVol.phone || "—"}</div></div>
              <div style={{ ...infoCard, gridColumn: "1 / -1" }}>
                <strong>Experience</strong>
                <div style={{ whiteSpace: "pre-wrap" }}>{profileVol.experience || "—"}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => {
                  setSelectedVolunteer(profileVol);
                  setConfirmModalOpen(true);
                }}
                style={{ ...theme.button, background: "#6A1B9A", color: "#fff" }}
              >
                💬 Chat
              </button>
              <button
                onClick={() => {
                  setSelectedVolunteer(profileVol);
                  setConfirmModalOpen(true);
                  setTimeout(() => sendInvite("call"), 0);
                }}
                style={{ ...theme.button, background: "#059669", color: "#fff" }}
              >
                📞 Call
              </button>
              <button onClick={() => setProfileOpen(false)} style={{ ...theme.button, border: "1px solid #eee", background: "#fafafa" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Registration Modal */}
      {registerModalOpen && (
        <div style={overlayStyle}>
          <div style={boxStyle(500)}>
            <h2 style={{ marginBottom: 12, color: "#6A1B9A" }}>🤝 Volunteer Registration</h2>
            <form onSubmit={submitRegister}>
              <input required name="name" placeholder="Full Name" value={registerForm.name} onChange={handleRegisterChange} style={inputStyle} />
              <input required name="email" placeholder="Email" value={registerForm.email} onChange={handleRegisterChange} style={inputStyle} />
              <input name="phone" placeholder="Phone Number" value={registerForm.phone} onChange={handleRegisterChange} style={inputStyle} />
              <input name="skills" placeholder="Skills (comma separated)" value={registerForm.skills} onChange={handleRegisterChange} style={inputStyle} />
              <textarea name="experience" placeholder="Previous Experience (optional)" value={registerForm.experience} onChange={handleRegisterChange} style={{ ...inputStyle, height: 80 }} />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="submit" style={{ ...theme.button, background: "#6A1B9A", color: "#fff" }}>✅ Register</button>
                <button type="button" onClick={() => setRegisterModalOpen(false)} style={{ ...theme.button, background: "#ccc" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internship Modal */}
      {internshipFormOpen && (
        <div style={overlayStyle}>
          <div style={boxStyle(560)}>
            <h3>Psychology Internship Application</h3>
            <form onSubmit={submitIntern}>
              <input required name="name" value={internForm.name} onChange={handleInternChange} placeholder="Full Name" style={inputStyle} />
              <input required type="email" name="email" value={internForm.email} onChange={handleInternChange} placeholder="Email Address" style={inputStyle} />
              <input required type="tel" name="phone" value={internForm.phone} onChange={handleInternChange} placeholder="Phone Number" style={inputStyle} />
              <input name="college" value={internForm.college} onChange={handleInternChange} placeholder="College / University" style={inputStyle} />
              <input name="degree" value={internForm.degree} onChange={handleInternChange} placeholder="Degree / Program" style={inputStyle} />
              <select name="duration" required value={internForm.duration} onChange={handleInternChange} style={inputStyle}>
                <option value="" disabled>Select Internship Duration</option>
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
              </select>
              <label style={{ fontSize: 13, color: "#555" }}>Preferred Start Date</label>
              <input type="date" name="startDate" required value={internForm.startDate} onChange={handleInternChange} style={{ ...inputStyle, marginTop: 4 }} />
              <input name="interest" value={internForm.interest} onChange={handleInternChange} placeholder="Area of Interest (Counseling, Research…)" style={inputStyle} />
              <textarea name="motivation" value={internForm.motivation} onChange={handleInternChange} placeholder="Why do you want this internship? (optional)" style={{ ...inputStyle, height: 90 }} />
              <label style={{ fontSize: 13, color: "#555" }}>Upload Resume (PDF, optional)</label>
              <input type="file" accept="application/pdf" name="resume" onChange={handleInternChange} style={{ ...inputStyle, marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="submit" style={{ ...theme.button, background: "#6A1B9A", color: "#fff" }}>Apply</button>
                <button type="button" onClick={() => setInternshipFormOpen(false)} style={{ ...theme.button, background: "#ccc" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------- tiny helper styles for modals/cards (inline so no CSS file needed) ------- */
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const boxStyle = (w) => ({
  width: w,
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 12px 30px rgba(0,0,0,.12)",
});

const infoCard = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #eee",
  background: "#fff",
};
