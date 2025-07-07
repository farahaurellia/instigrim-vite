const NotFoundView = {
  async render() {
    return `
      <main class="not-found-section" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;">
        <h1 style="font-size:4rem;color:#CA7842;margin-bottom:1rem;">404</h1>
        <p style="font-size:1.5rem;color:#4B352A;margin-bottom:2rem;">Halaman tidak ditemukan</p>
        <a href="#/" style="padding:0.75rem 1.5rem;background:#CA7842;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Kembali ke Beranda</a>
      </main>
    `;
  },
  async afterRender() {
    // Optional: tambahkan interaksi jika perlu
  }
};

export default NotFoundView;