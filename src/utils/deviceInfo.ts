export const getDeviceInfo = async () => {
  // 1. Get or Create a persistent Device ID in localStorage
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }

  const ua = navigator.userAgent;
  
  const getDeviceName = () => {
    if (/android/i.test(ua)) return "Android Device";
    if (/iPad|iPhone|iPod/.test(ua)) return "iOS Device";
    if (/Windows/i.test(ua)) return "Windows PC";
    if (/Mac/i.test(ua)) return "MacBook";
    return "Web Browser";
  };

  let ip = "Unknown IP";
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    ip = data.ip;
  } catch (e) { console.error("IP Fetch failed", e); }

  return {
    deviceId,
    deviceName: getDeviceName(),
    browser: ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : "Safari",
    ip,
    lastLogin: new Date().toISOString()
  };
};
