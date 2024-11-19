import React, { useState, useEffect } from 'react';
import './Popup.css';
import 'font-awesome/css/font-awesome.min.css';


const PRJ_ID_MAP = {
  'MASTERI WATERFRONT': 7,
  'MASTERI WEST HEIGHTS': 10,
  'LUMIÈRE EVERGREEN': 20,
  'THE CENTRIC': 21,
  'LUMIÈRE SPRINGBAY': 24,
  'MASTERI GRAND AVENUE': 26,
  'MASTERI LAKESIDE': 27,
}

const Popup = () => {
  const [result, setResult] = useState('');
  const [project_name, setProjectName] = useState('');

  var logValue = null;

  chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (key === 'latestLog') {
        if (newValue !== logValue) {
          console.debug(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
          );
          logValue = newValue;
          if (logValue) {
            setResult(logValue);
          }
        } else {
          console.debug("Duplicate change detected, ignoring.");
        }
      }
    }
  });

  const handleProjectNameChange = (event) => {
    setProjectName(event.target.value);
  };

  const handleGetCookies = () => {
    chrome.storage.local.set({ ['latestLog']: null });
    chrome.runtime.sendMessage({ command: 'get-cookies' }, (response) => {
      console.debug('Response from background script:', response);
      if (response == true) {
        setResult('Đang lấy cookies ...');
      }
    });
  };

  const handleGetHiddenData = async () => {
    let project_name = document.getElementById('project_name').value;
    let project_id = PRJ_ID_MAP[project_name];
    if (project_id === undefined) {
      setResult('Tên dự án không hợp lệ !!!');
      return;
    }
    console.log(project_id)
    chrome.runtime.sendMessage({
      command: 'get-hidden-fund',
      data: {
        project_id
      }
    }, (response) => {
      console.debug('Response from background script:', response);
      if (response) {
        setResult('Đang lấy quỹ ẩn ...');
      }
    });
  };

  const handleCopy = () => {
    document.getElementById("copy-icon").textContent = "Copied!";
    setTimeout(() => {
      document.getElementById("copy-icon").textContent = "";
    }, 1000);
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h2 className="popup-title">Quỹ Ẩn Hiền Kudo</h2>
      </div>
      <div className="popup-content">
        <div className="project-selection">
          <label htmlFor="project_name" className="popup-label">
            Tên dự án
          </label>
          <select
            id="project_name"
            name="project_name"
            value={project_name}
            className='custom-select'
            onChange={handleProjectNameChange}
          >
            <option value="">----- Chọn dự án -----</option>
            {Object.keys(PRJ_ID_MAP).map((project_name) => (
              <option key={project_name} value={project_name}>
                {project_name}
              </option>
            ))}
          </select>
        </div>
        <div className="popup-button-container">
          <button className="popup-button green-button" onClick={handleGetCookies}>
            Lấy Cookies
          </button>
          <button className="popup-button blue-button" onClick={handleGetHiddenData}>
            Lấy Quỹ ẩn
          </button>
        </div>
        <div className="text-wrap">
          <textarea
            className="popup-result-textarea"
            value={result}
            readOnly
          />
          <i id="copy-icon" className="fa fa-copy" onClick={handleCopy}></i>
        </div>
      </div>
    </div>
  );
};

export default Popup;