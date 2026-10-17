// Active network IPv4 of the host machine
export const HOST_NETWORK_IP = '10.220.156.149';

/**
 * Returns the scannable landing URL for a patient's QR code.
 * Ensures that if the page is viewed on localhost or 127.0.0.1,
 * the QR code contains the machine's LAN IP so any mobile device scanning
 * the screen can connect across the Wi-Fi / hotspot network.
 */
export function getPatientScanUrl(publicUuid, rawTargetUrl = null) {
  if (!publicUuid && !rawTargetUrl) return '';

  if (rawTargetUrl) {
    return rawTargetUrl
      .replace('127.0.0.1', HOST_NETWORK_IP)
      .replace('localhost', HOST_NETWORK_IP);
  }

  const protocol = window.location.protocol || 'http:';
  const hostname = window.location.hostname;
  const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1' || !hostname;
  const effectiveHost = isLoopback ? HOST_NETWORK_IP : hostname;
  const port = window.location.port ? `:${window.location.port}` : ':5173';

  return `${protocol}//${effectiveHost}${port}/patient/qr/${publicUuid}`;
}
