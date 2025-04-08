const { useState, useEffect, useRef } = React;

function DrawGraph() {
  const [stage, setStage] = useState("idle");
  const [jobId, setJobId] = useState(null);

  // Trigger the file selection dialog
  const handleSelectFile = () => {
    document.getElementById("fileInput").click();
  };

  // Handle the file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStage("loading");

    try {
      const formData = new FormData();
      // Use "mtxfile" to match backend expectation
      formData.append("mtxfile", file);

      // Change URL to match backend route for job upload
      const response = await fetch("http://localhost:8080/api/jobs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      // Expecting a JSON response with { message, id }
      const data = await response.json();
      // Save the job ID returned from backend
      setJobId(data.id);
      setStage("done");
    } catch (error) {
      alert("Error: " + error.message);
      setStage("idle");
    }
  };

  // Download the job/file using the returned job ID
  const handleDownload = async () => {
    if (!jobId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/jobs/${jobId}/download`);
      if (!response.ok) {
        throw new Error("Error downloading file");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Create and trigger a download link
      const link = document.createElement("a");
      link.href = url;
      link.download = "downloaded_file"; // Optionally, set a default filename or parse from Content-Disposition header
      link.click();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="hero-section">
      <h1 className="hero-title">Draw Spectral Graph</h1>
      <p className="hero-subtitle">
        Upload your <strong>.mtx</strong> file and generate a spectral graph.
      </p>

      {/* Hidden file input */}
      <input
        id="fileInput"
        type="file"
        accept=".mtx"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {stage === "idle" && (
        <button className="big-button" onClick={handleSelectFile}>
          Select .mtx File
        </button>
      )}

      {stage === "loading" && (
        <div className="loading-text">Loading... Please wait.</div>
      )}

      {stage === "done" && (
        <button className="download-button" onClick={handleDownload}>
          Download File
        </button>
      )}
    </div>
  );
}


function Illustration() {
  return (
    <div className="illustration-section">
      <h1 className="illustration-title">Illustration</h1>
      <p className="illustration-subtitle">
        Below are some example graphs generated from sample <strong>.mtx</strong> files.
      </p>

      <div className="illustration-images">
        <div>
          <img src="../img/barth5.png" alt="Graph 1" />
          <p>barth5</p>
        </div>
        <div>
          <img src="../img/pkustk01.png" alt="Graph 2" />
          <p>pkustk01</p>
        </div>
        <div>
        <img src="../img/fe_4elt2.png" alt="Graph 1" />
          <p>fe_4elt2</p>
        </div>
      </div>
    </div>
  );
}

function ThreeDGallery() {
  const items = [
    { id: "g1", title: "barth5", thumbnail: "../img/barth5.png" },
    { id: "g2", title: "grid_dual1", thumbnail: "../img/grid_dual1.png" },
    { id: "g3", title: "aug3d", thumbnail: "../img/aug3d.png" },
    { id: "g4", title: "fe_4elt2", thumbnail: "../img/fe_4elt2.png" },
    { id: "g5", title: "pkustk01", thumbnail: "../img/pkustk01.png" },
  ];

  const handleClick = (exampleId) => {
    window.open(`viewer.html?example=${exampleId}`, "_blank");
    console.log(window.location.search);
  };

  return (
    <div className="threeD-gallery">
      <h1>3D Visuals</h1>
      <div className="gallery-grid">
        {items.map((item) => (
          <div key={item.id} className="gallery-card">
            <img
              src={item.thumbnail}
              alt={item.title}
              onClick={() => handleClick(item.id)}
            />
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


function App() {
  const [page, setPage] = useState("draw"); 

  const navigate = (pageName) => {
    setPage(pageName);
  };

  React.useEffect(() => {
    const drawLink = document.getElementById("nav-draw");
    const illusLink = document.getElementById("nav-illustration");
    const galleryLink = document.getElementById("nav-illustration3D");

    const handleDrawClick = () => navigate("draw");
    const handleIllustrationClick = () => navigate("illustration");
    const handleGalleryClick = () => setPage("gallery"); // Named function

    drawLink.addEventListener("click", handleDrawClick);
    illusLink.addEventListener("click", handleIllustrationClick);
    galleryLink.addEventListener("click", handleGalleryClick);

    return () => {
      drawLink.removeEventListener("click", handleDrawClick);
      illusLink.removeEventListener("click", handleIllustrationClick);
      galleryLink.removeEventListener("click", handleGalleryClick);
    };
  }, []);

  return (
    <>
      {page === "draw" && <DrawGraph />}
      {page === "illustration" && <Illustration />}
      {page === "gallery" && <ThreeDGallery />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);