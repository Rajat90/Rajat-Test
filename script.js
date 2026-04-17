(function () {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const chooseFileBtn = document.getElementById('chooseFileBtn');
  const fileInput = document.getElementById('fileInput');
  const uploadStatus = document.getElementById('uploadStatus');
  const googleDriveBtn = document.getElementById('googleDriveBtn');
  const dropboxBtn = document.getElementById('dropboxBtn');
  const toolButtons = Array.from(document.querySelectorAll('.tool-btn'));

  function notify(message) {
    window.alert(message);
  }

  loginBtn?.addEventListener('click', function () {
    notify('Login flow is a demo in this mock page.');
  });

  signupBtn?.addEventListener('click', function () {
    notify('Signup flow is a demo in this mock page.');
  });

  chooseFileBtn?.addEventListener('click', function () {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', function (event) {
    const target = event.target;
    if (!target || !target.files || target.files.length === 0) {
      uploadStatus.textContent = 'No file selected yet.';
      return;
    }

    const selectedFile = target.files[0];
    uploadStatus.textContent = `Selected: ${selectedFile.name}`;
    notify(`File selected successfully: ${selectedFile.name}`);
  });

  googleDriveBtn?.addEventListener('click', function () {
    notify('Google Drive picker is a demo action in this mock page.');
  });

  dropboxBtn?.addEventListener('click', function () {
    notify('Dropbox picker is a demo action in this mock page.');
  });

  toolButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const toolName = button.getAttribute('data-tool') || 'Selected tool';
      notify(`${toolName} workflow opened (demo).`);
    });
  });
})();
