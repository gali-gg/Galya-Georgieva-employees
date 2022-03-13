import { parse } from "papaparse/papaparse.min";
import { useState } from "react";
import "./index.css";

const allowedFileTypes = [
  "application/vnd.ms-excel",
  "text/x-csv",
  "application/csv",
  "application/x-csv",
  "text/csv",
  "text/comma-separated-values",
  "text/x-comma-separated-values",
];

export default function UploadFile(props) {
  const [showFileTypeError, setShowFileTypeError] = useState(false);
  const [file, setFile] = useState(null);
  const [hasHeader, setHasHeader] = useState(true);

  const handleFileUpload = (event) => {
    let file = event.target.files[0];

    if(file){
      setShowFileTypeError(false);
      if(!allowedFileTypes.includes(file.type)){
          setShowFileTypeError(true);
          setFile(null);
          return;
      }

      setFile(file);
    }
  };

  const handleShowResult = (e) => {
    e.preventDefault();
    if(file){
      parse(file, {
        header: hasHeader,
        transformHeader: function (header, index) {
          let newHeader;
          switch(index){
            case 0:
              newHeader = "empID";
              break;
            case 1:
              newHeader = "projectID";
              break;
            case 2:
              newHeader = "dateFrom";
              break;
            case 3:
              newHeader = "dateTo";
              break;
            default:
              newHeader = header;
          }
          return newHeader;
        },
        complete: function(results) {
          let data = results.data;

          if(!hasHeader){
            data = data.map(dataArr => {
              return {
                empID: dataArr[0],
                projectID: dataArr[1],
                dateFrom: dataArr[2],
                dateTo: dataArr[3],
              }
            })
          }
          props.onFileLoad(data);
        }
    });
    }
    setHasHeader(true);
  }

  const handleHeaderCheck = (e) => {
    setHasHeader(!e.target.checked);
  }

  return (
    <div className="uploadFileWrapper">
    <h2>Display the pair of employees who have worked together on common projects for the longest period of time.</h2>
      <div className="info">Upload csv file with header. <br/><i className="headerInfo">Header format: EmpID, ProjectID, DateFrom, DateTo</i></div>
      <form  onSubmit={handleShowResult}>
        <div className="form">
        <input type="file" accept=".csv" onInput={handleFileUpload}/>
        <div>
          <input type="checkbox" id="check-header" checked={!hasHeader} onChange={handleHeaderCheck}/>
          <label htmlFor="check-header">File doesn't have header</label>
        </div>
        </div>
        <input type="submit" value="Show result" className="btn"/>
      </form>
      {showFileTypeError && <p className="error">Wrong file type.</p>}
    </div>
  );
}
