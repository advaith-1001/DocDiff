import React from 'react';
import { useLocation} from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../resultpage.css'
import { pdfjs , Document, Page} from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ResultPage = () => {
  const location = useLocation();
  const { file1, file2, diffData , pdf1, pdf2, formatting_diffs, ai_summary} = location.state || {};

  
  const [highlightedFile1URL, setHighlightedFile1URL] = useState(null);
  const [highlightedFile2URL, setHighlightedFile2URL] = useState(null);

  const [numPages1, setNumPages1] = useState(null);
const [numPages2, setNumPages2] = useState(null);

const onDocumentLoadSuccess1 = ({ numPages }) => setNumPages1(numPages);
const onDocumentLoadSuccess2 = ({ numPages }) => setNumPages2(numPages);



    useEffect(() => {
    if (pdf1 && pdf2) {
      // Helper to convert base64 to Blob URL
      const base64ToBlobURL = (base64Str) => {
        const byteCharacters = atob(base64Str);
        const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      };

      setHighlightedFile1URL(base64ToBlobURL(pdf1));
      setHighlightedFile2URL(base64ToBlobURL(pdf2));
    }
  }, [pdf1, pdf2]);



  if (!file1 || !file2 || !diffData) return <div className='error-ctr'>Invalid comparison result</div>;

  return (
    <div className='result-page'>
      <h1 className='page-name'>DocDiff</h1>
      <div className='result-container'>
        {/* Left preview */}
        <div className='preview-column'>
          <h3 className='file-name'>{file1.name}</h3>
          {highlightedFile1URL ? (
             <Document file={highlightedFile1URL} onLoadSuccess={onDocumentLoadSuccess1}>
      {Array.from(new Array(numPages1), (el, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          scale={0.75}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      ))}
    </Document>
          ) : (
            <p>Loading preview...</p>
          )}


        </div>

        {/* Right preview */}
        <div className='preview-column'>
           <h3 className='file-name'>{file2.name}</h3>
          {highlightedFile2URL ? (

             <Document file={highlightedFile2URL} onLoadSuccess={onDocumentLoadSuccess1}>
      {Array.from(new Array(numPages1), (el, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          scale={0.75}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      ))}
    </Document>
            
          ) : (
            <p>Loading preview...</p>
          )}

        </div>

        {/* Difference list */}
        <div className='diff-column'>
          <h3 className='changes-header'>Changes</h3>
          <div className='diff-list'>
            <div className='ai-summary-ctr'>
              <h4 className='ai-summary-heading'>AI summary</h4>
              <p className='ai-summary'>
                {ai_summary}
              </p>
            </div>
            {diffData.diff.map((item, index) => {
              if (item.type === 'equal') return null;

              return (
                <div className='diff-item' key={index}>
                  <div className='diff-old'>
                    <strong>{file1.name} :</strong>
                    {item.type === 'line_diff'
                      ? item.parts
                          .filter(p => p.type === 'remove')
                          .map((p, i) => <div className='diff-point' key={i}>{p.text}</div>)
                      : <div>{item.text}</div>}
                  </div>
                  <div className='diff-new'>
                    <strong>{file2.name} :</strong>
                    {item.type === 'line_diff'
                      ? item.parts
                          .filter(p => p.type === 'add')
                          .map((p, i) => <div className='diff-point' key={i}>{p.text}</div>)
                      : null}
                  </div>
                </div>
              );
            })}
            <h3 className='diff-subtitle'>Formatting Differences</h3>
          <div className='diff-item'>
            {formatting_diffs && formatting_diffs.length > 0 ? (
              formatting_diffs.map((item, index) => (
                <div className='diff-item' key={`format-${index}`}>
                  <strong>{item.location}:</strong>
                  <span>{item.value1} vs {item.value2}</span>
                </div>
              ))
            ) : (
              <p className='diff-point'>No formatting differences found.</p>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
