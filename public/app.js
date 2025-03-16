const { useState } = React;

/**
 * DrawGraph component:
 * - Centered heading, subheading, big red button
 * - Upload .mtx, show "Loading...", then "Download Image"
 */
function DrawGraph() {
  const [stage, setStage] = useState("idle");
  const [imageURL, setImageURL] = useState(null);

  const handleSelectFile = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStage("loading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/generate-graph", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageURL(url);
      setStage("done");
    } catch (error) {
      alert("Error: " + error.message);
      setStage("idle");
    }
  };

  const handleDownload = () => {
    if (!imageURL) return;
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "graph.png";
    link.click();
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
          Download Image
        </button>
      )}
    </div>
  );
}

/**
 * Illustration component:
 * - Centered heading, subheading, placeholder images
 */
function Illustration() {
  return (
    <div className="illustration-section">
      <h1 className="illustration-title">Illustration</h1>
      <p className="illustration-subtitle">
        Below are some example graphs generated from sample <strong>.mtx</strong> files.
      </p>

      <div className="illustration-images">
        <div>
          <img src="../img/img1.png" alt="Graph 1" />
          <p>Graph 1</p>
        </div>
        <div>
          <img src="../img/img2.png" alt="Graph 2" />
          <p>Graph 2</p>
        </div>
        <div>
        <img src="../img/img3.png" alt="Graph 1" />
          <p>Graph 3</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Main App: switches between "Draw Spectral Graph" and "Illustration" pages
 */
function App() {
  const [page, setPage] = useState("draw"); // default page

  // Simple function to switch pages
  const navigate = (pageName) => {
    setPage(pageName);
  };

  React.useEffect(() => {
    // Attach click handlers to nav items
    const drawLink = document.getElementById("nav-draw");
    const illusLink = document.getElementById("nav-illustration");

    const handleDrawClick = () => navigate("draw");
    const handleIllustrationClick = () => navigate("illustration");

    drawLink.addEventListener("click", handleDrawClick);
    illusLink.addEventListener("click", handleIllustrationClick);

    // Cleanup
    return () => {
      drawLink.removeEventListener("click", handleDrawClick);
      illusLink.removeEventListener("click", handleIllustrationClick);
    };
  }, []);

  return (
    <>
      {page === "draw" && <DrawGraph />}
      {page === "illustration" && <Illustration />}
    </>
  );
}

// Render the App into #root
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
