export async function checkForUpdates() {
    try {
      const response = await fetch('/version.json?t=' + Date.now());
      const data = await response.json();
      const currentVersion = localStorage.getItem('app-version');
      
      if (currentVersion && currentVersion !== data.timestamp.toString()) {
        // New version detected
        if (window.confirm('🎉 A new version is available! Reload to update?')) {
          localStorage.setItem('app-version', data.timestamp.toString());
          window.location.reload();
        }
      } else {
        localStorage.setItem('app-version', data.timestamp.toString());
      }
    } catch (error) {
      console.error('Version check failed:', error);
    }
  }