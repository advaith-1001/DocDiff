import React from 'react';
import '../uploadstyles.css';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
  const fileInput1 = useRef(null);
  const fileInput2 = useRef(null);
  const navigate = useNavigate();

  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleDrop = (event, setFile) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleFileChange = (event, setFile) => {
    setFile(event.target.files[0]);
  };

  const handleCompare = async () => {
    if (isLoading) return; // Prevent multiple requests

    setIsLoading(true); // Set loading to true

    const formData = new FormData();
    formData.append("file1", file1);
    formData.append("file2", file2);

    try {
      const response = await fetch("https://docdiff-backend.onrender.com/api/compare", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(result);
      
      // Correctly pass all data inside the 'state' object
      navigate('/result', {
        state: {
          file1,
          file2,
          diffData: result.diff,
          pdf1: result.highlighted_pdf1,
          pdf2: result.highlighted_pdf2,
          formatting_diffs: result.formatting_diffs,
          ai_summary: result.ai_summary
        }
      });
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsLoading(false); // Set loading to false after request finishes
    }
  };

  return (
    <div className='upload-ctr'>
      <h1 className='page-name'>DocDiff</h1>
      <div className='upload-inner-ctr'>
        <div
          className='doc-upload'
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, setFile1)}
        >
          <p className='drag-prompt'>Drag and drop files</p>
          <p className='drag-prompt'>or</p>
          <button className='doc-upload-btn' onClick={() => fileInput1.current.click()}>Select file</button>
          <input
            type='file'
            accept='.pdf,.docx,.jpeg,.jpg,.png'
            style={{ display: 'none' }}
            ref={fileInput1}
            onChange={(e) => handleFileChange(e, setFile1)}
          />
          {file1 && <p className='file-preview'>Uploaded: {file1.name}</p>}
        </div>
        <div
          className='doc-upload'
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, setFile2)}
        >
          <p className='drag-prompt'>Drag and drop files</p>
          <p className='drag-prompt'>or</p>
          <button className='doc-upload-btn' onClick={() => fileInput2.current.click()}>Select file</button>
          <input
            type='file'
            accept='.pdf,.docx,.jpeg,.jpg,.png'
            style={{ display: 'none' }}
            ref={fileInput2}
            onChange={(e) => handleFileChange(e, setFile2)}
          />
          {file2 && <p className='file-preview'>Uploaded: {file2.name}</p>}
        </div>
      </div>
      <button
        className='compare-btn'
        disabled={!file1 || !file2 || isLoading} // Disable button when loading
        onClick={handleCompare}
      >
        {isLoading ? (
  <>
    <span className="spinner"></span>
    Comparing
  </>
) : (
  'Compare'
)}
      </button>
    </div>
  );
}

export default UploadPage;