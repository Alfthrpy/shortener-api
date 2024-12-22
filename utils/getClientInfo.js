import axios from "axios";
import { UAParser } from "ua-parser-js";


export async function getLocationByIp(clientIp) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${clientIp}`);
    return {
      country: response.data.country || "Unknown",
      region: response.data.regionName || "Unknown",
      city: response.data.city || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching location:", error);
    return { country: "Unknown", region: "Unknown", city: "Unknown" };
  }
}



export function getDeviceDetails(userAgent) {
  const parser = new UAParser();
  const uaResult = parser.setUA(userAgent).getResult();

  return {
    browser: uaResult.browser.name || "Unknown",
    os: uaResult.os.name || "Unknown",
    device: uaResult.device.type || "Unknown",
  };
}

