export const API_BASE_URL = 'http://localhost:8000';

export const forceDownload = async (downloadUrl) => {
  const fullUrl = downloadUrl.startsWith('http')
    ? downloadUrl
    : `${API_BASE_URL}${downloadUrl}`;

  const response = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Download failed');
  }

  const blob = await response.blob();

  let filename = 'download';

  const contentDisposition = response.headers.get('content-disposition');

  if (contentDisposition) {
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);
    const normalMatch = contentDisposition.match(/filename="?([^"]+)"?/);

    if (utf8Match && utf8Match[1]) {
      filename = decodeURIComponent(utf8Match[1]);
    } else if (normalMatch && normalMatch[1]) {
      filename = normalMatch[1];
    }
  }

  const objectUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(objectUrl);
};