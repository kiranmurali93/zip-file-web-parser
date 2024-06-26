import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Search from './components/Search';

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("")

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/zip' || selectedFile.name.endsWith('.zip')) {
        setFile(selectedFile);
        setMessage('');
      } else {
        setFile(null);
        setMessage('Please upload a valid ZIP file.');
      }
    }
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setMessage("File Uploaded successfully")
  
    } catch (error) {
      console.log(error)
      setMessage("Unable to upload files")
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
      <div>
      <h1>File Bundle Uploader</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
      <h2>{message}</h2>
    </div>
      </header>
      <Search/>
    </div>
  );
}

export default App;
