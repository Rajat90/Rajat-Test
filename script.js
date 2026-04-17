(function () {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const chooseFileBtn = document.getElementById('chooseFileBtn');
  const fileInput = document.getElementById('fileInput');
  const uploadStatus = document.getElementById('uploadStatus');
  const actionStatus = document.getElementById('actionStatus');
  const googleDriveBtn = document.getElementById('googleDriveBtn');
  const dropboxBtn = document.getElementById('dropboxBtn');
  const toolButtons = Array.from(document.querySelectorAll('.tool-btn'));

  let selectedFiles = [];

  function setStatus(message) {
    if (actionStatus) actionStatus.textContent = message;
    console.log(message);
  }

  function updateUploadStatus() {
    if (!uploadStatus) return;

    if (selectedFiles.length === 0) {
      uploadStatus.textContent = 'Max file size: 100 MB (mock value)';
      return;
    }

    if (selectedFiles.length === 1) {
      uploadStatus.textContent = `Selected: ${selectedFiles[0].name}`;
      return;
    }

    uploadStatus.textContent = `${selectedFiles.length} files selected`;
  }

  function getExt(filename) {
    const i = filename.lastIndexOf('.');
    return i >= 0 ? filename.slice(i + 1).toLowerCase() : '';
  }

  function withExtension(filename, extension) {
    const dotIndex = filename.lastIndexOf('.');
    const base = dotIndex >= 0 ? filename.slice(0, dotIndex) : filename;
    return `${base}.${extension}`;
  }

  function triggerDownload(blob, fileName) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function readBytes(file) {
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  }

  async function handleSingleFileTransform(file, outputExt, label) {
    const bytes = await readBytes(file);
    const outBlob = new Blob([bytes], { type: 'application/octet-stream' });
    const outName = withExtension(file.name, outputExt);
    triggerDownload(outBlob, outName);
    setStatus(`${label} complete: ${outName}`);
  }

  async function handleCompress(file) {
    const bytes = await readBytes(file);
    const shrinkTo = Math.max(1, Math.floor(bytes.length * 0.7));
    const outBlob = new Blob([bytes.slice(0, shrinkTo)], {
      type: 'application/octet-stream',
    });
    const outName = withExtension(file.name, 'compressed.pdf');
    triggerDownload(outBlob, outName);
    setStatus(`Compress complete: ${outName}`);
  }

  async function handleMerge(files) {
    const chunks = [];
    for (const file of files) {
      chunks.push(await readBytes(file));
    }
    const mergedBlob = new Blob(chunks, { type: 'application/octet-stream' });
    const outName = 'merged-output.pdf';
    triggerDownload(mergedBlob, outName);
    setStatus(`Merge complete: ${outName}`);
  }

  async function handleSplit(file) {
    const bytes = await readBytes(file);
    const mid = Math.max(1, Math.floor(bytes.length / 2));
    const partOne = new Blob([bytes.slice(0, mid)], { type: 'application/octet-stream' });
    const partTwo = new Blob([bytes.slice(mid)], { type: 'application/octet-stream' });

    triggerDownload(partOne, withExtension(file.name, 'part1.pdf'));
    triggerDownload(partTwo, withExtension(file.name, 'part2.pdf'));
    setStatus('Split complete: downloaded part1 and part2 files.');
  }

  function requireFiles(min = 1) {
    if (selectedFiles.length < min) {
      setStatus(`Please select at least ${min} file${min > 1 ? 's' : ''} first.`);
      return false;
    }
    return true;
  }

  function authPrompt(mode) {
    const current = localStorage.getItem('mockUserName') || '';
    const name = window.prompt(
      mode === 'login' ? 'Enter your name to login:' : 'Create account name:',
      current,
    );

    if (!name || !name.trim()) {
      setStatus(`${mode === 'login' ? 'Login' : 'Signup'} cancelled.`);
      return;
    }

    localStorage.setItem('mockUserName', name.trim());
    loginBtn.textContent = `Hi, ${name.trim()}`;
    setStatus(`${mode === 'login' ? 'Logged in' : 'Signed up'} as ${name.trim()}.`);
  }

  loginBtn?.addEventListener('click', function () {
    authPrompt('login');
  });

  signupBtn?.addEventListener('click', function () {
    authPrompt('signup');
  });

  chooseFileBtn?.addEventListener('click', function () {
    fileInput?.click();
  });

  googleDriveBtn?.addEventListener('click', function () {
    fileInput?.click();
    setStatus('Google Drive picker simulated. Choose local files to continue.');
  });

  dropboxBtn?.addEventListener('click', function () {
    fileInput?.click();
    setStatus('Dropbox picker simulated. Choose local files to continue.');
  });

  fileInput?.addEventListener('change', function (event) {
    const files = event.target?.files ? Array.from(event.target.files) : [];
    selectedFiles = files;
    updateUploadStatus();

    if (selectedFiles.length === 0) {
      setStatus('No file selected.');
      return;
    }

    setStatus(`Loaded ${selectedFiles.length} file(s). Choose a tool to process.`);
  });

  toolButtons.forEach(function (button) {
    button.addEventListener('click', async function () {
      const toolName = button.getAttribute('data-tool') || '';
      const first = selectedFiles[0];

      try {
        switch (toolName) {
          case 'PDF to Word':
            if (!requireFiles()) return;
            await handleSingleFileTransform(first, 'docx', 'PDF to Word');
            break;
          case 'Word to PDF':
            if (!requireFiles()) return;
            await handleSingleFileTransform(first, 'pdf', 'Word to PDF');
            break;
          case 'PDF to JPG':
            if (!requireFiles()) return;
            await handleSingleFileTransform(first, 'jpg', 'PDF to JPG');
            break;
          case 'JPG to PDF':
            if (!requireFiles()) return;
            await handleSingleFileTransform(first, 'pdf', 'JPG to PDF');
            break;
          case 'Compress PDF':
            if (!requireFiles()) return;
            await handleCompress(first);
            break;
          case 'Merge PDF':
            if (!requireFiles(2)) return;
            await handleMerge(selectedFiles);
            break;
          case 'Split PDF':
            if (!requireFiles()) return;
            await handleSplit(first);
            break;
          case 'Rotate PDF':
            if (!requireFiles()) return;
            await handleSingleFileTransform(first, 'rotated.pdf', 'Rotate PDF');
            break;
          default:
            setStatus('Unknown tool selected.');
        }
      } catch (error) {
        console.error(error);
        setStatus('Processing failed. Please try again.');
      }
    });
  });

  const storedUser = localStorage.getItem('mockUserName');
  if (storedUser && loginBtn) {
    loginBtn.textContent = `Hi, ${storedUser}`;
  }
})();
