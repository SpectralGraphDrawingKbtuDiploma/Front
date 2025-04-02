const { useState, useEffect, useRef } = React;

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
  
      const response = await fetch("http://localhost:3000/api/generate-graph", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate image");
      }
  
      const { taskId } = await response.json();
  
      // Poll for task status until done
      const pollTaskStatus = async () => {
        const statusResponse = await fetch(`http://localhost:3000/api/task-status/${taskId}`);
        const task = await statusResponse.json();
        console.log("Polling status:", task);
  
        if (task.status === "done") {
          // Fetch the generated image once processing is finished
          const imgResponse = await fetch(`http://localhost:3000${task.result}`);
          const blob = await imgResponse.blob();
          const url = URL.createObjectURL(blob);
          setImageURL(url);
          setStage("done");
        } else {
          // If not done, wait and poll again after 1 second
          setTimeout(pollTaskStatus, 1000);
        }
      };
  
      // Start polling
      pollTaskStatus();
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