const { useState, useEffect, useRef } = React;


function DrawGraph() {
  // State variables to track the workflow.
  // stage: idle, uploading, processing, completed
  const [stage, setStage] = useState("idle");
  const [jobId, setJobId] = useState(null);
  // Store resolved download URLs as an object, e.g., { obj: "url1", png: "url2" }
  const [downloadUrls, setDownloadUrls] = useState({});

  // Function to trigger the file selection dialog.
  const handleSelectFile = () => {
    document.getElementById("fileInput").click();
  };

  // Called when a file is selected for upload.
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStage("uploading");

    try {
      const formData = new FormData();
      // Use "mtxfile" as required by the backend.
      formData.append("mtxfile", file);

      // Post the file to the jobs endpoint.
      const response = await fetch("http://localhost:8080/api/jobs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      // Expecting a JSON response that contains the job ID.
      const data = await response.json();
      setJobId(data.id);
      setStage("processing");
      pollJobStatus(data.id);
    } catch (error) {
      alert("Error: " + error.message);
      setStage("idle");
    }
  };

  // Polls the backend for job status until it's completed.
  const pollJobStatus = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/jobs/${id}`);
      if (!res.ok) {
        throw new Error("Error fetching job status");
      }
      const job = await res.json();
      
      // Check the job status.
      if (job.status === "completed") {
        // Parse the res_url string containing both file paths.
        // For example: "s3://artifacts/1/out.obj\ns3://artifacts/1/out.png\n"
        const urls = job.res_url
          .split("\n")
          .map(u => u.trim())
          .filter(u => u !== "");

        // Process each URL: replace "s3://" with "http://127.0.0.1:9000/"
        const resolvedUrls = {};
        urls.forEach(url => {
          const resolvedUrl = url.replace("s3://", "http://127.0.0.1:9000/");
          if (resolvedUrl.endsWith(".png")) {
            resolvedUrls.png = resolvedUrl;
          } else if (resolvedUrl.endsWith(".obj")) {
            resolvedUrls.obj = resolvedUrl;
          }
        });
        
        setDownloadUrls(resolvedUrls);
        setStage("completed");
      } else if (job.status === "failed") {
        throw new Error(job.error || "Job processing failed");
      } else {
        // If job is still processing, poll again after 1 second.
        setTimeout(() => pollJobStatus(id), 1000);
      }
    } catch (error) {
      alert("Error checking job status: " + error.message);
      setStage("idle");
    }
  };

  // Open the given URL in a new tab to initiate the download.
  const handleDownload = (url) => {
    if (!url) return;
    window.open(url, "_blank");
  };

  return (
    <div className="hero-section">
      <h1 className="hero-title">Draw Spectral Graph</h1>
      <p className="hero-subtitle">
        Upload your <strong>.mtx</strong> file and generate a spectral graph.
      </p>

      {/* Hidden file input to trigger file selection */}
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

      {stage === "uploading" && (
        <div className="loading-text">Uploading file...</div>
      )}

      {stage === "processing" && (
        <div className="loading-text">Processing file, please wait...</div>
      )}

      {stage === "completed" && (
        <div>
          {downloadUrls.obj && (
            <button
              className="download-button"
              onClick={() => handleDownload(downloadUrls.obj)}
            >
              Download OBJ File
            </button>
          )}
          {downloadUrls.png && (
            <button
              className="download-button"
              onClick={() => handleDownload(downloadUrls.png)}
            >
              Download PNG File
            </button>
          )}
        </div>
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