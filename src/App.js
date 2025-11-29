import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import AuthForm from "./AuthForm";
const API_URL = process.env.REACT_APP_API_URL || "https://penora-write-backend-production.up.railway.app";

// Loader
function Loader() {
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center", minHeight: "28px"
    }}>
      <div style={{
        width: 28, height: 28, border: "5px solid #cbd7ff",
        borderTop: "5px solid #638cff", borderRadius: "50%",
        animation: "spin 1.05s linear infinite"
      }} />
      <style>
        {`@keyframes spin { 100% { transform: rotate(360deg); }} `}
      </style>
    </div>
  );
}

// Dashboard Modal
function DashboardModal({
  visible,
  stories,
  setStories,
  onClose
}) {
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState("");

  const filteredStories = stories
    .filter((s) => {
      if (filterType !== "all" && s.story_type !== filterType) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (s.title || "").toLowerCase().includes(q) ||
        (s.story || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const at = new Date(a.saved_at).getTime();
      const bt = new Date(b.saved_at).getTime();
      return sortOrder === "newest" ? bt - at : at - bt;
    });

  if (!visible) return null;

  const startEdit = (story) => {
    setEditId(story.id);
    setEditTitle(story.title);
    setEditContent(story.story);
    setEditType(story.story_type);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditContent("");
    setEditType("");
  };

  const submitEdit = () => {
    setStories(prev => [
      { id: Date.now() + Math.random(), title: editTitle, story: editContent, story_type: editType, saved_at: Date.now() },
      ...prev
    ]);
    cancelEdit();
    alert("Saved as a new story!");
  };

  const deleteStory = (id) => {
    if (window.confirm("Delete this story?")) {
      setStories(stories.filter(s => s.id !== id));
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 90, right: 0, bottom: 0, zIndex: 10010,
      background: 'rgba(12,13,20,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        minWidth: 390, maxWidth: 690, width: '90vw', background: "#fff", borderRadius: 22,
        padding: "26px 36px 22px 36px", boxShadow: "0 8px 36px rgba(64,87,183,0.14)"
      }}>
        <div style={{ fontWeight: 800, fontSize: "1.4em", marginBottom: 10 }}>My Saved Stories</div>

        {/* FILTER + SORT + SEARCH */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 12,
          flexWrap: "wrap", alignItems: "center"
        }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ccd2ee" }}
          >
            <option value="all">All types</option>
            <option value="short">Short stories</option>
            <option value="novel">Novels</option>
            <option value="chapter">Chapters</option>
            <option value="poem">Poems</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ccd2ee" }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or text..."
            style={{
              flex: 1, minWidth: 140,
              padding: "6px 10px", borderRadius: 8,
              border: "1px solid #ccd2ee"
            }}
          />
        </div>

        {(!stories.length) && (
          <div style={{ color: "#888", fontSize: "1.1em", marginBottom: 24 }}>
            No stories saved yet.
          </div>
        )}

        <div style={{ maxHeight: 360, overflowY: "auto", marginBottom: 18 }}>
          {filteredStories.map(story => (
            <div key={story.id} style={{
              background: "#f9fafd", marginBottom: 13, borderRadius: 11, padding: "13px 16px",
              border: "1.2px solid #e4e6f7"
            }}>
              {editId === story.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Title"
                    style={{
                      width: "100%", marginBottom: 8, padding: "6px",
                      borderRadius: 7, border: "1.1px solid #638cff",
                      fontWeight: 700, fontSize: "1.07em"
                    }}
                  />
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value)}
                    style={{ marginBottom: 8 }}
                  >
                    <option value="short">Short Story</option>
                    <option value="novel">Novel</option>
                    <option value="chapter">Chapter</option>
                    <option value="poem">Poem</option>
                  </select>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={7}
                    style={{
                      width: "100%", marginBottom: 8, padding: "10px",
                      borderRadius: 7, border: "1.1px solid #638cff"
                    }}
                  />
                  <button
                    onClick={submitEdit}
                    style={{
                      marginRight: 8, padding: "8px 20px", borderRadius: 7,
                      background: "#638cff", color: "#fff", border: "none",
                      fontWeight: 600, cursor: "pointer"
                    }}
                  >
                    Save As New
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{
                      padding: "8px 20px", borderRadius: 7,
                      background: "#c6c8ce", color: "#333", border: "none",
                      fontWeight: 500, cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: "1.13em", marginBottom: 1 }}>
                    {story.title}
                  </div>
                  <div style={{ color: "#9ab", fontSize: "0.96em", marginBottom: 4 }}>
                    {story.story_type} | {new Date(story.saved_at).toLocaleString()}
                  </div>
                  <div style={{
                    color: "#374460", fontSize: "1em", whiteSpace: 'pre-wrap',
                    maxHeight: 110, overflowY: "auto", marginBottom: 7
                  }}>
                    {story.story}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                    <button
                      onClick={() => startEdit(story)}
                      style={{
                        padding: "5px 15px", borderRadius: 7, background: "#ffeaaa",
                        color: "#837200", border: "none", fontWeight: 500,
                        fontSize: "0.97em", cursor: "pointer"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteStory(story.id)}
                      style={{
                        padding: "5px 15px", borderRadius: 7, background: "#ffeaea",
                        color: "#d13d3d", border: "none", fontWeight: 500,
                        fontSize: "0.97em", cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob([story.story], { type: "text/plain" });
                        element.href = URL.createObjectURL(file);
                        element.download = `${story.title || "story"}.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      style={{
                        padding: "6px 12px", borderRadius: 7, background: "#f0f4ff",
                        color: "#638cff", border: "1px solid #c6d2f2",
                        fontWeight: 600, marginRight: 8
                      }}
                    >
                      Text
                    </button>
                    <button
                      onClick={() => {
                        const pdf = new jsPDF();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const margin = 15;
                        const maxWidth = pageWidth - 2 * margin;
                        let yPos = 20;
                        pdf.setFont("helvetica");
                        pdf.setFontSize(18);
                        pdf.text(story.title || "Penora Write - Your Story", margin, yPos);
                        yPos += 15;
                        pdf.setFontSize(12);
                        const lines = pdf.splitTextToSize(story.story, maxWidth);
                        lines.forEach((line) => {
                          if (yPos > pageHeight - 20) {
                            pdf.addPage();
                            yPos = 20;
                          }
                          pdf.text(line, margin, yPos);
                          yPos += 7;
                        });
                        pdf.save(`${story.title || "story"}.pdf`);
                      }}
                      style={{
                        padding: "6px 12px", borderRadius: 7, background: "#fff0f0",
                        color: "#ff6b6b", border: "1px solid #f7c4cc",
                        fontWeight: 600, marginRight: 8
                      }}
                    >
                      PDF
                    </button>
                    <button
                      onClick={async () => {
                        const doc = new Document({
                          sections: [{
                            children: [
                              new Paragraph({ text: story.title || "Penora Write - Your Story", bold: true, size: 28 }),
                              new Paragraph(""),
                              new Paragraph({ text: story.story, size: 22 })
                            ]
                          }]
                        });
                        const blob = await Packer.toBlob(doc);
                        saveAs(blob, `${story.title || "story"}.docx`);
                      }}
                      style={{
                        padding: "6px 12px", borderRadius: 7, background: "#f0fff4",
                        color: "#51cf66", border: "1px solid #c1f1d0", fontWeight: 600
                      }}
                    >
                      Word
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: "10px 0", borderRadius: 10, background: "#f4f7fa",
            color: "#6375d6", fontWeight: 700, fontSize: "1.08em",
            width: "100%", border: "none", marginTop: 4
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Settings Modal, AccountSidebar and Loader remain AS before
function SettingsModal({
  visible, onClose, isDarkMode, toggleTheme,
  userName, newUserName, setNewUserName, saveDisplayName,
  onResetLayout, onClearDashboard
}) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 90, right: 0, bottom: 0, zIndex: 10001,
      background: 'rgba(12,13,16,0.14)', display: 'flex', justifyContent: 'center', alignItems: 'center',
    }}>
      <div style={{
        minWidth: 340, background: isDarkMode ? "#232332" : "#fff", borderRadius: 19, padding: "28px 30px",
        boxShadow: "0 8px 32px rgba(44,77,190,0.11)", color: isDarkMode ? "#f5f7fe" : "#263354"
      }}>
        <div style={{fontWeight:800, fontSize:"1.23em", marginBottom:6, textAlign:"center"}}>Settings</div>
        <div style={{marginBottom:18}}>
          <label style={{fontWeight:650, fontSize:'1.07em', marginRight:7}}>Display name:</label>
          <input
            type="text"
            value={newUserName}
            onChange={e => setNewUserName(e.target.value)}
            style={{
              padding: "6px 10px", fontSize: "1.08em", borderRadius: 7,
              border: isDarkMode ? "1px solid #4a465d" : "1px solid #c8d6ff",
              background: isDarkMode ? "#202234" : "#f0f8ff",
              color: isDarkMode ? "#d0dafc" : "#263354", marginRight: 7, width: 120
            }}
          />
          <button
            onClick={saveDisplayName}
            style={{
              padding: "6px 12px", borderRadius: 7, fontWeight: 600,
              background: "#638cff", color: "#fff", border: "none", cursor: "pointer"
            }}
          >Save</button>
        </div>
        <div style={{marginBottom:23,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span>Theme:</span>
          <button
            onClick={toggleTheme}
            style={{
              padding: "8px 20px", borderRadius: 10,
              background: isDarkMode ? "#2b3267" : "#e8f0ff",
              color: isDarkMode ? "#f7d870" : "#638cff",
              border: "none", fontWeight: 650, cursor: "pointer", fontSize: "1.09em"
            }}
          >
            {isDarkMode ? "🌑 Dark" : "🌞 Light"}
          </button>
        </div>
        <button
          onClick={onResetLayout}
          style={{
            width:"100%",padding:"9px 0",borderRadius:9,border:"none",fontWeight:600,marginBottom:9,
            background:isDarkMode?"#292d40":"#e8f0ff",color:isDarkMode?"#ffd584":"#6b809f",cursor:"pointer"
          }}>
          🔄 Reset Layout
        </button>
        <button
          onClick={onClearDashboard}
          style={{
            width:"100%",padding:"9px 0",borderRadius:9,border:"none",fontWeight:600,marginBottom:9,
            background:isDarkMode?"#ffc6d6":"#fed7ee",color:isDarkMode?"#8b1925":"#cf175e",cursor:"pointer"
          }}>
          🧹 Clear Dashboard
        </button>
        <div style={{margin:'16px 0',fontSize:"1.01em",color:isDarkMode?"#b6bedb":"#7985ba"}}>
          <strong>Shortcuts:</strong>
          <ul style={{margin:0,paddingLeft:18}}>
            <li><kbd>Ctrl+Enter</kbd> Generate story</li>
            <li><kbd>Ctrl+Shift+T</kbd> Toggle theme</li>
          </ul>
        </div>
        <button style={{
          width:"100%",padding:"9px 0",marginTop:14,borderRadius:8,fontWeight:600,
          background: isDarkMode ? "#202234" : "#e8eafe", border:"none", color: isDarkMode ? "#dbe6ff" : "#638cff", cursor:"pointer"
        }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function AccountSidebar({
  userName, userEmail, onSettingsOpen, isDarkMode, onLogout, onDashboardOpen
}) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: 88,
      background: isDarkMode ? '#151618' : '#181924',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      zIndex: 200, boxShadow: '0 8px 16px rgba(43,71,155,0.08)', paddingBottom: 20
    }}>
      <div style={{width:'100%',display:'flex',flexDirection:'column',alignItems:'center',marginTop:32}}>
        {/* Sidebar icons row - add your icons as needed */}
        <button style={{background:'none',border:'none',marginBottom:27,cursor:'pointer'}}>
          <span style={{fontSize:'2rem',color:'#f7c663'}}>🔔</span>
        </button>
        <button onClick={onDashboardOpen} style={{background:'none',border:'none',marginBottom:26,cursor:'pointer'}}>
          <span style={{fontSize:'2.11rem',color:'#ffc663'}}>🗂️</span>
        </button>
        <button onClick={onSettingsOpen} style={{background:'none',border:'none',marginBottom:32,cursor:'pointer'}}>
          <span style={{fontSize:'2.1rem',color:'#d4d8e5'}}>⚙️</span>
        </button>
      </div>
      {/* Profile + logout at bottom */}
      <div style={{marginBottom:18,width:'100%',display:'flex',flexDirection:'column',alignItems:'center'}}>
        {/* Avatar */}
        <div style={{
          width: 45, height: 45, borderRadius: "50%",
          background: "#7faaff", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "1.7rem", boxShadow: "0 1px 9px rgba(44,77,190,0.13)", marginBottom: 10
        }}>
          <span>{userName ? userName[0].toUpperCase() : "U"}</span>
        </div>
        {/* NO 'pro' badge here */}
        {/* Name / Email / Info */}
        <div style={{
          color:'#e8ebf6',marginTop:2,fontWeight:600,fontSize:"1.11em",textAlign:"center",letterSpacing:'-0.02em'
        }}>{userName}</div>
        <div style={{
          color:'#b7c0dd',fontSize:"0.96em",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:75,textAlign:"center"
        }}>{userEmail}</div>
        <div style={{color:'#8798bd',fontSize:'0.89em',marginTop:2,marginBottom:7,textAlign:'center',fontWeight:500}}>
          Penora Write user since 2025
        </div>
        {/* LOGOUT BUTTON - CLEAR, VISIBLE, AND EASY TO CLICK */}
       <button
  onClick={onLogout}
  style={{
    marginTop: 8,
    background: "none",
    border: "none",
    color: "#ffc663",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "1.13em",
    padding: "8px 16px",
    borderRadius: 8,
  }}
>
  <span style={{ fontSize: "1.15em" }}>🚪</span> Logout
</button>


      </div>
    </div>
  );
}

function App() {
  const [storyType, setStoryType] = useState("short");
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem("token") || "");
  const [userName, setUserName] = useState(localStorage.getItem("user") || "");
  const [newUserName, setNewUserName] = useState(userName);
  const [userEmail, setUserEmail] = useState(localStorage.getItem("email") || "");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [myStories, setMyStories] = useState([]);
  const storyRef = useRef(null);
  const [tone, setTone] = useState("neutral");
  const [length, setLength] = useState("medium");

  const handleAuth = (token, username, email) => {
  setAuthToken(token);
  setUserName(username || "");
  setNewUserName(username || "");
  setUserEmail(email || "");

  // clear previous user’s idea and story
  setIdea("");
  setStory("");

  localStorage.setItem("token", token);
  localStorage.setItem("user", username || "");
  localStorage.setItem("email", email || "");
};


  const handleLogout = () => {
  setAuthToken("");
  setUserName("");
  setNewUserName("");
  setUserEmail("");
  setMyStories([]);   // already there

  // ADD THESE TWO LINES:
  setIdea("");
  setStory("");

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("email");
};


  useEffect(() => {
    if (authToken) {
      fetch(`${API_URL}/stories/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.stories)) {
            setMyStories(
              data.stories.map((story) => ({
                id: story._id,
                title: story.title,
                story: story.story,
                story_type: story.story_type,
                saved_at: story.saved_at,
              }))
            );
          }
        });
    } else {
      setMyStories([]); // Clear on logout or no token
    }
  }, [authToken]);
useEffect(() => {
  if (storyRef.current && story) {
    storyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}, [story]);

const refetchMyStories = () => {
  fetch(`${API_URL}/stories/my`, {
    headers: { "Authorization": `Bearer ${authToken}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data && Array.isArray(data.stories)) {
        setMyStories(data.stories.map(story => ({
          id: story._id || story.id || (story.title + Math.random()),
          title: story.title,
          story: story.story,
          story_type: story.story_type,
          saved_at: new Date(story.saved_at).getTime()
        })));
      }
    });
};


   // ✅ Add this here
const saveDisplayName = () => {
  if (!newUserName.trim()) return;

  setUserName(newUserName);
  localStorage.setItem("user", newUserName);

  alert("Display name updated!");
  setSettingsOpen(false);
};

  const toggleTheme = () => setIsDarkMode(dm => !dm);

  const onResetLayout = () => {
    alert("Layout reset!");
    window.location.reload();
  };

  const onClearDashboard = () => {
    if (window.confirm("Clear all saved stories?")) setMyStories([]);
  };

  // Save story for logged-in users (local + fallback if backend fails)
const handleSaveStory = async () => {
  const finalTitle =
    title || window.prompt("Enter a title for your story:") || "Untitled";

  const storyObj = {
    id: Date.now() + Math.random(),
    title: finalTitle,
    story,
    story_type: storyType,
    saved_at: Date.now()
  };

  let savedToBackend = false;
  try {
    const res = await fetch(`${API_URL}/stories/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: finalTitle,
        story,
        story_type: storyType,
      })
    });
    if (res.ok) savedToBackend = true;
  } catch { /* ignore */ }

  setMyStories(prev => [storyObj, ...prev]);
  alert(savedToBackend ? "Saved to backend!" : "Saved to dashboard!");
  refetchMyStories();
};


  const handleDashboardOpen = () => setDashboardOpen(true);
  const handleDashboardClose = () => setDashboardOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStory("");
    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, storyType, tone, length })
      });
      const data = await response.json();
      setStory(data.story);
    } catch {
      setStory("Failed to generate story, try again.");
    }
    setLoading(false);
  };

const handleRegenerate = async () => {
  if (!idea) return; // no idea, nothing to regenerate

  setLoading(true);
  setStory("");
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, storyType, tone, length })
    });
    const data = await response.json();
    setStory(data.story);
  } catch {
    setStory("Failed to generate story, try again.");
  }
  setLoading(false);
};


  const downloadAsText = () => {
    const element = document.createElement("a");
    const file = new Blob([story], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "story.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAsPDF = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 20;
    pdf.setFont("helvetica");
    pdf.setFontSize(18);
    pdf.text("Penora Write - Your Story", margin, yPosition);
    yPosition += 15;
    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(story, maxWidth);
    lines.forEach((line) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 7;
    });
    pdf.save("story.pdf");
  };

  const downloadAsWord = async () => {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: "Penora Write - Your Story",
            bold: true,
            size: 28
          }),
          new Paragraph(""),
          new Paragraph({
            text: story,
            size: 22
          })
        ]
      }]
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "story.docx");
  };

  if (!authToken) {
  return <AuthForm onAuth={handleAuth} />;
}


  return (
    <div>
      <AccountSidebar
        userName={userName}
        userEmail={userEmail}
        onSettingsOpen={() => setSettingsOpen(true)}
        onDashboardOpen={handleDashboardOpen}
        isDarkMode={isDarkMode}
        onLogout={handleLogout}
      />
      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        userName={userName}
        newUserName={newUserName}
        setNewUserName={setNewUserName}
        saveDisplayName={saveDisplayName}
        onResetLayout={onResetLayout}
        onClearDashboard={onClearDashboard}
      />
      <DashboardModal
        visible={dashboardOpen}
        stories={myStories}
        setStories={setMyStories}
        onClose={handleDashboardClose}
      />
      <div style={{
        minHeight: "100vh",
        background: isDarkMode
          ? "radial-gradient(circle, #181b1f 0%, #191a22 100%)"
          : "radial-gradient(circle, #eafffd 0%, #f5f5fa 100%)",
        fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
        marginLeft: 100,
        padding: "30px"
      }}>
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "center", width:"100%"
        }}>
          <div style={{ width: "100%", maxWidth: 540 }}>
            <div style={{
              backdropFilter: "blur(18px)", background: isDarkMode ? "rgba(35,35,49,0.92)" : "rgba(255,255,255,0.86)",
              borderRadius: 32, padding: "56px 40px 44px 40px",
              boxShadow: "0 2px 36px 0 rgba(43,71,155,0.09)",
              minWidth: 340, width: "100%", textAlign: "center"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{
                  fontWeight: 800, fontSize: "2.5rem", letterSpacing: "-0.035em",
                  margin: "0 0 12px 0", color: isDarkMode ? "#eee" : "#1a1a1a"
                }}>Penora Write</h1>
              </div>
              <div style={{ color: "#7e89a3", fontSize: "1.08rem", marginBottom: 27 }}>
                Welcome, <strong>{userName}</strong>
              </div>
 {/* Story Type */}
<div style={{ marginBottom: 12 }}>
  <label style={{
    display: "block", marginBottom: 10, color: "#465175",
    fontWeight: 600, fontSize: "0.95rem"
  }}>Select Story Type</label>
  <div style={{
    display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center"
  }}>
    {[
      { value: "short", label: "Short Story" },
      { value: "novel", label: "Novel" },
      { value: "chapter", label: "Chapter" },
      { value: "poem", label: "Poem" }
    ].map(option => (
      <button
        key={option.value}
        onClick={() => setStoryType(option.value)}
        style={{
          padding: "8px 18px", borderRadius: 10,
          border: storyType === option.value ? "2px solid #638cff" : "1.5px solid #d4dde5",
          background: storyType === option.value ? "#e8f0ff" : "#f8fafd",
          color: storyType === option.value ? "#638cff" : "#7e89a3",
          fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", transition: "all 0.2s"
        }}
      >{option.label}</button>
    ))}
  </div>
</div>

{/* Tone + Length dropdown row */}
<div style={{
  display: "flex",
  gap: 10,
  marginBottom: 16,
  flexWrap: "wrap",
  justifyContent: "center"
}}>
  <div>
    <label style={{
      display: "block", marginBottom: 4, color: "#465175",
      fontWeight: 600, fontSize: "0.9rem"
    }}>Tone</label>
    <select
      value={tone}
      onChange={(e) => setTone(e.target.value)}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "1.2px solid #d4dde5",
        background: isDarkMode ? "#232352" : "#f8fafd",
        color: isDarkMode ? "#ddeafb" : "#18202c",
        minWidth: 140
      }}
    >
      <option value="neutral">Neutral</option>
      <option value="serious">Serious</option>
      <option value="humorous">Humorous</option>
      <option value="romantic">Romantic</option>
    </select>
  </div>

  <div>
    <label style={{
      display: "block", marginBottom: 4, color: "#465175",
      fontWeight: 600, fontSize: "0.9rem"
    }}>Length</label>
    <select
      value={length}
      onChange={(e) => setLength(e.target.value)}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "1.2px solid #d4dde5",
        background: isDarkMode ? "#232352" : "#f8fafd",
        color: isDarkMode ? "#ddeafb" : "#18202c",
        minWidth: 170
      }}
    >
      <option value="short">Short (~300 words)</option>
      <option value="medium">Medium (~800 words)</option>
      <option value="long">Long (~1500+ words)</option>
    </select>
  </div>
</div>

              <form onSubmit={handleSubmit}>

  {/* NEW: Title input */}
  <div style={{ marginBottom: 12 }}>
    <label style={{
      display: "block", marginBottom: 6, color: "#465175",
      fontWeight: 600, fontSize: "0.95rem"
    }}>
      Story title
    </label>
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Optional: Give your story a title..."
      style={{
        width: "100%", padding: "10px 14px", borderRadius: 10,
        border: "1.2px solid #d4dde5",
        background: isDarkMode ? "#232352" : "#f8fafd",
        color: isDarkMode ? "#ddeafb" : "#18202c",
        fontSize: "1rem", marginBottom: 4, outline: "none"
      }}
    />
  </div>

  {/* Updated idea textarea */}
  <textarea
    value={idea}
    onChange={(e) => setIdea(e.target.value)}
    placeholder="Enter your story idea..."
    rows={6}   // was 4
    style={{
      width: "100%", fontSize: "1.09rem", padding: "17px 16px",
      borderRadius: 17, border: "1.2px solid #d4dde5",
      boxShadow: "0px 1.5px 12px 0px rgba(43,71,155,0.03)",
      marginBottom: 22, outline: "none", color: isDarkMode ? "#ddeafb" : "#18202c",
      background: isDarkMode ? "#232352" : "#f8fafd", resize: "vertical", transition: "border-color 0.2s"
    }}
    disabled={loading}
  />
                <button
                  type="submit"
                  disabled={loading || !idea}
                  style={{
                    width: "100%", padding: "15px 0",
                    background: loading
                      ? "#e2e7f0"
                      : "linear-gradient(90deg, #a6c1ff 30%, #638cff 80%)",
                    color: loading ? "#898989" : "#fff",
                    fontWeight: 700, fontSize: "1.17rem", border: "none",
                    borderRadius: 13, boxShadow: loading ? "none" : "0 2px 11px 0 rgba(43,71,155,0.08)",
                    cursor: loading ? "not-allowed" : "pointer", marginBottom: 6,
                    marginTop: 2, letterSpacing: "0.02em", transition: "background 0.15s",
                    display: "flex", justifyContent: "center", alignItems: "center"
                  }}
                >{loading ? <Loader /> : "Generate Story"}
                </button>
              </form>
              {story && (
                <div ref={storyRef} style={{
                  marginTop: 31, background: isDarkMode ? "#26273c" : "#f5f6fa",
                  borderRadius: 14, padding: 20,
                  boxShadow: "0px 1px 12px 0px rgba(77,98,183,0.045)",
                  border: isDarkMode ? "1.1px solid #232358" : "1.1px solid #e9ecf3", textAlign: "left"
                }}>
                  <div style={{
                    color: "#465175", fontWeight: 600, fontSize: "1.11rem",
                    marginBottom: 13, letterSpacing: "0.01em"
                  }}>Your Story</div>
                  <div style={{
                    color: isDarkMode ? "#bcd4ff" : "#283553", fontSize: "1.06rem", lineHeight: 1.67,
                    whiteSpace: "pre-line", marginBottom: 18,
                    maxHeight: "300px", overflowY: "auto"
                  }}>{story}</div>
                  {/* Download & Save Button Row */}
                  <div style={{
                    display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10
                  }}>
                    <button onClick={downloadAsText}
                      style={{
                        flex: 1, minWidth: 100, padding: "10px 16px", background: "#f0f4ff",
                        border: "1.2px solid #d4dde5", borderRadius: 10, color: "#638cff",
                        fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", transition: "all 0.2s"
                      }}>📄 Text</button>
                    <button onClick={downloadAsPDF}
                      style={{
                        flex: 1, minWidth: 100, padding: "10px 16px", background: "#fff0f0",
                        border: "1.2px solid #d4dde5", borderRadius: 10, color: "#ff6b6b",
                        fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", transition: "all 0.2s"
                      }}>📕 PDF</button>
                    <button onClick={downloadAsWord}
                      style={{
                        flex: 1, minWidth: 100, padding: "10px 16px", background: "#f0fff4",
                        border: "1.2px solid #d4dde5", borderRadius: 10, color: "#51cf66",
                        fontWeight: 600, cursor: "pointer", fontSize: "0.95rem", transition: "all 0.2s"
                      }}>📗 Word</button>
                  </div>
                     {/* NEW: Save + Regenerate in one wrapper */}
    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
      {authToken && (
        <button
          onClick={handleSaveStory}
          style={{
            flex: 1,
            padding: "12px 0",
            background: "linear-gradient(90deg, #638cff 80%,#6baeff 100%)",
            color: "#fff",
            fontWeight: 700,
            borderRadius: 9,
            fontSize: "1.07rem",
            border: "none",
            boxShadow: "0 2px 8px rgba(56,105,250,.07)",
            cursor: "pointer"
          }}
        >
          Save Story
        </button>
      )}
      <button
        onClick={handleRegenerate}
        disabled={loading || !idea}
        style={{
          flex: 1,
          padding: "12px 0",
          background: "#e8f0ff",
          color: "#638cff",
          fontWeight: 700,
          borderRadius: 9,
          fontSize: "1.02rem",
          border: "1px solid #c9d5ff",
          cursor: loading || !idea ? "not-allowed" : "pointer"
        }}
      >
        Regenerate
      </button>
    </div>
  </div>
)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
