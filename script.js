let isHistoryVisible = false;

document.getElementById('submitBtn').addEventListener('click', function() {
  const markdownText = document.getElementById('markdownInput').value;
  const renderedHTML = marked.parse(markdownText);
  document.getElementById('markdownContent').innerHTML = renderedHTML;
  Prism.highlightAll();
  document.getElementById('inputSection').style.display = 'none';
  document.getElementById('renderedSection').style.display = 'block';
  saveToHistory(markdownText);
  addCopyButtons();
});

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

function saveToHistory(markdown) {
  let history = JSON.parse(localStorage.getItem('markdownHistory')) || [];
  history.push(markdown);
  localStorage.setItem('markdownHistory', JSON.stringify(history));
  loadHistory();
}

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

function deleteMarkdown(index) {
  let history = JSON.parse(localStorage.getItem('markdownHistory'));
  history.splice(index, 1);
  localStorage.setItem('markdownHistory', JSON.stringify(history));
  loadHistory();
}

function editMarkdown(index) {
  let history = JSON.parse(localStorage.getItem('markdownHistory'));
  document.getElementById('markdownInput').value = history[index];
  document.getElementById('inputSection').style.display = 'block';
  document.getElementById('renderedSection').style.display = 'none';
  document.getElementById('historyList').style.display = 'none';
  isHistoryVisible = false;
}

function viewMarkdown(index) {
  let history = JSON.parse(localStorage.getItem('markdownHistory'));
  const renderedHTML = marked.parse(history[index]);
  document.getElementById('markdownContent').innerHTML = renderedHTML;
  Prism.highlightAll();
  document.getElementById('inputSection').style.display = 'none';
  document.getElementById('renderedSection').style.display = 'block';
  document.getElementById('historyList').style.display = 'none';
  isHistoryVisible = false;
}

function exportMarkdown(index) {
  let history = JSON.parse(localStorage.getItem('markdownHistory'));
  const markdownContent = marked.parse(history[index]);
  const element = document.createElement('div');
  element.innerHTML = markdownContent;

  element.style.padding = '20px';
  element.style.backgroundColor = 'white';
  element.style.borderRadius = '8px';
  element.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.1)';
  element.style.marginTop = '20px';

  Prism.highlightAllUnder(element);

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

  const isDarkMode = document.body.classList.contains('dark-mode');
  if (isDarkMode) {
    element.classList.add('dark-mode');
  }

  html2pdf().from(element).set(opt).save().catch(err => {
    alert('Failed to export PDF: ' + err);
  });
}

document.getElementById('clearHistoryBtn').addEventListener('click', function() {
  localStorage.removeItem('markdownHistory');
  loadHistory();
});

document.getElementById('toggleBtn').addEventListener('click', function() {
  document.body.classList.toggle('dark-mode');
});

document.getElementById('exportBtn').addEventListener('click', function() {
  const element = document.getElementById('markdownContent');

  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true);

  // Apply styles to the cloned element
  clonedElement.style.padding = '20px';
  clonedElement.style.backgroundColor = 'white';
  clonedElement.style.borderRadius = '8px';
  clonedElement.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.1)';
  clonedElement.style.marginTop = '20px';

  // Ensure Prism.js styles are applied
  Prism.highlightAllUnder(clonedElement);

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

  clonedElement.appendChild(style);

  // Check if dark mode is active and apply dark mode styles
  const isDarkMode = document.body.classList.contains('dark-mode');
  if (isDarkMode) {
    clonedElement.classList.add('dark-mode');
    clonedElement.style.backgroundColor = '#1e1e1e';
    clonedElement.style.color = '#e0e0e0';
  }

  const opt = {
    margin: 0.5,
    filename: 'markdown-content.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(clonedElement).set(opt).save().catch(err => {
    alert('Failed to export PDF: ' + err);
  });
});
window.onload = loadHistory;