const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const forceDownload = async (downloadUrl) => {
  if (!downloadUrl) {
    throw new Error('Download URL is missing');
  }

  const fullUrl = downloadUrl.startsWith('http')
    ? downloadUrl
    : `${API_BASE_URL}${downloadUrl}`;

  const token = localStorage.getItem('token');

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Download failed');
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
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  }, 100);
};