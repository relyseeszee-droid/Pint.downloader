const btn = document.getElementById('downloadBtn');
const urlInput = document.getElementById('urlInput');
const quality = document.getElementById('quality');
const fps = document.getElementById('fps');
const status = document.getElementById('status');
const result = document.getElementById('result');

async function expandUrl(shortUrl) {
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(shortUrl)}`);
    return res.url; // allorigins ngasih final url setelah redirect
  } catch {
    return shortUrl;
  }
}

btn.addEventListener('click', async () => {
  let url = urlInput.value.trim();
  if(!url) {
    alert('Masukin link Pinterest dulu');
    return;
  }

  btn.disabled = true;
  status.innerText = 'Lagi proses...';
  result.innerHTML = '';

  try {
    // 1. Expand link pin.it dulu
    if(url.includes('pin.it')) {
      status.innerText = 'Mengexpand link...';
      url = await expandUrl(url);
    }

    // 2. Kirim ke Cobalt lewat proxy biar gak CORS
    status.innerText = 'Mengambil video...';
    const cobaltBody = {
      url: url,
      vQuality: quality.value,
      vCodec: 'h264',
      vFps: fps.value,
      aFormat: 'mp3'
    };

    const response = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.cobalt.tools/api/json'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cobaltBody)
    });

    const data = await response.json();

    if(data.status === 'success' && data.url) {
      status.innerText = 'Selesai!';
      result.innerHTML = `<a class="download-link" href="${data.url}" target="_blank" download>⬇️ Download Sekarang</a>`;
    } else if(data.status === 'error') {
      status.innerText = 'Error: ' + data.error.message;
    } else {
      status.innerText = 'Gagal. Pastikan link valid dan public.';
    }

  } catch (e) {
    status.innerText = 'Gagal konek ke server. Coba lagi.';
    console.error(e);
  }

  btn.disabled = false;
});