import React, { useState } from "react";
import axios from "axios";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/search`, {
        params: {
          searchTerm,
        },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error searching files:", error);
    }
  };

  return (
    <div style={{ height: "100vh", alignContent: "center" }}>
        <div>Search Section</div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by file name"
      />

      <button onClick={handleSearch}>Search</button>
     <div style={{marginTop: "20px"}}>
     {results.length > 0 && (
        <table style={{marginRight: "auto", marginLeft: "auto"}}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size (bytes)</th>
              <th>MIME Type</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((file) => (
              <tr key={file.id}>
                <td>{file.file_name}</td>
                <td>{file.file_size}</td>
                <td>{file.file_type}</td>
                <td>{new Date(file.file_created_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!results.length && <div>No file found</div>}
     </div>
    </div>
  );
};

export default Search;
