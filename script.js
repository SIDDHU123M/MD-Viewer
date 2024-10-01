let isHistoryVisible = false;

// Function to handle submit button click
document.getElementById('submitBtn').addEventListener('click', function() {
  const markdownText = document.getElementById('markdownInput').value;

  // Convert markdown to HTML
  const renderedHTML = marked.parse(markdownText);

  // Inject rendered HTML into content section
  document.getElementById('markdownContent').innerHTML = renderedHTML;

  // Highlight code blocks
  Prism.highlightAll();

  // Hide the input section and show the rendered markdown
  document.getElementById('inputSection').style.display = 'none';
  document.getElementById('renderedSection').style.display = 'block';

  // Save to local storage
  saveToHistory(markdownText);

  // Add copy buttons to code blocks
  addCopyButtons();
});

// Function to add copy buttons to code blocks
function addCopyButtons() {
  const codeBlocks = document.querySelectorAll('pre');
  codeBlocks.forEach(block => {
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';
    copyButton.innerText = 'Copy';
    
    copyButton.addEventListener('click', function() {
      const codeText = block.querySelector('code').innerText;
      navigator.clipboard.writeText(codeText).then(() => {
        copyButton.innerText = 'Copied';
        setTimeout(() => {
          copyButton.innerText = 'Copy';
        }, 2000);
      }).catch(err => {
        alert('Failed to copy code: ' + err);
      });
    });
    
    block.appendChild(copyButton);
  });
}

// Save markdown to local storage
function saveToHistory(markdown) {
  let history = JSON.parse(localStorage.getItem('markdownHistory')) || [];
  history.push(markdown);
  localStorage.setItem('markdownHistory', JSON.stringify(history));
  loadHistory();
}

// Load history from local storage
function loadHistory() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  let history = JSON.parse(localStorage.getItem('markdownHistory')) || [];
  
  history.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <span>${item.substring(0, 30)}...</span>
      <div>
        <button onclick="viewMarkdown(${index})" aria-label="View">
          <img src="svg/view.svg" alt="View" width="20" height="20">
        </button>
        <button onclick="editMarkdown(${index})" aria-label="Edit">
          <img src="svg/edit.svg" alt="Edit" width="20" height="20">
        </button>
        <button onclick="deleteMarkdown(${index})" aria-label="Delete">
          <img src="svg/delete.svg" alt="Delete" width="20" height="20">
        </button>
        <button onclick="exportMarkdown(${index})" aria-label="Export to PDF">
          <img src="svg/software-download.svg" alt="Export to PDF" width="20" height="20">
        </button>
      </div>
    `;
    historyList.appendChild(div);
  });
}

// Toggle History Display
document.getElementById('historyBtn').addEventListener('click', function() {
  const historyList = document.getElementById('historyList');
  const inputSection = document.getElementById('inputSection');
  const renderedSection = document.getElementById('renderedSection');

  if (isHistoryVisible) {
    inputSection.style.display = 'block';
    renderedSection.style.display = 'none';
    historyList.style.display = 'none';
  } else {
    inputSection.style.display = 'none';
    renderedSection.style.display = 'none';
    historyList.style.display = 'block';
    loadHistory();
  }

  isHistoryVisible = !isHistoryVisible;
});

// Delete markdown from history
function deleteMarkdown(index) {
  let history = JSON.parse(localStorage.getItem('markdownHistory'));
  history.splice(index, 1);
  localStorage.setItem('markdownHistory', JSON.stringify(history));
  loadHistory();
}

// Edit markdown from history
function editMarkdown(index) {
  let history = JSON.parse(localStorage.getItem('markdownHistory'));
  document.getElementById('markdownInput').value = history[index];
  document.getElementById('inputSection').style.display = 'block';
  document.getElementById('renderedSection').style.display = 'none';
  document.getElementById('historyList').style.display = 'none'; // Hide history on edit
  isHistoryVisible = false;
}

// View markdown from history
function viewMarkdown(index) {
  let history = JSON.parse(localStorage.getItem('markdownHistory'));
  const renderedHTML = marked.parse(history[index]);
  document.getElementById('markdownContent').innerHTML = renderedHTML;
  Prism.highlightAll(); // Ensure Prism.js styles are applied
  document.getElementById('inputSection').style.display = 'none';
  document.getElementById('renderedSection').style.display = 'block';
  document.getElementById('historyList').style.display = 'none'; // Hide history on view
  isHistoryVisible = false;
}

// Export markdown from history to PDF
function exportMarkdown(index) {
  let history = JSON.parse(localStorage.getItem('markdownHistory'));
  const markdownContent = marked.parse(history[index]);
  const element = document.createElement('div');
  element.innerHTML = markdownContent;

  // Apply styles to the element
  element.style.padding = '20px';
  element.style.backgroundColor = 'white';
  element.style.borderRadius = '8px';
  element.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.1)';
  element.style.marginTop = '20px';

  // Ensure Prism.js styles are applied
  Prism.highlightAllUnder(element);

  // Clone the styles from the document
  const style = document.createElement('style');
  style.innerHTML = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('');
      } catch (e) {
        console.error(e);
        return '';
      }
    })
    .join('');

  element.appendChild(style);

  const opt = {
    margin: 0.5,
    filename: `markdown-content-${index}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().from(element).set(opt).save().catch(err => {
    alert('Failed to export PDF: ' + err);
  });
}

// Clear all history
document.getElementById('clearHistoryBtn').addEventListener('click', function() {
  localStorage.removeItem('markdownHistory');
  loadHistory();
});

// Toggle Dark/Light Mode
document.getElementById('toggleBtn').addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
});

// Export content to PDF
document.getElementById('exportBtn').addEventListener('click', function() {
  const element = document.getElementById('markdownContent');

  // Apply styles to the element
  element.style.padding = '20px';
  element.style.backgroundColor = 'white';
  element.style.borderRadius = '8px';
  element.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.1)';
  element.style.marginTop = '20px';

  // Ensure Prism.js styles are applied
  Prism.highlightAllUnder(element);

  // Clone the styles from the document
  const style = document.createElement('style');
  style.innerHTML = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('');
      } catch (e) {
        console.error(e);
        return '';
      }
    })
    .join('');

  element.appendChild(style);

  const opt = {
    margin: 0.5,
    filename: 'markdown-content.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().from(element).set(opt).save().catch(err => {
    alert('Failed to export PDF: ' + err);
  });
});

// Load history on page load
window.onload = loadHistory;