/* ===============================
   DATA TIKET
================================ */
const tickets = [
  { id: 1, nama: "Festival", harga: 50000 },
  { id: 2, nama: "VIP", harga: 100000 },
  { id: 3, nama: "VVIP", harga: 150000 },
  { id: 4, nama: "Gold", harga: 200000 },
  { id: 5, nama: "Platinum", harga: 250000 }
];

let selectedTicket = null;
let cart = [];

/* ===============================
   ELEMENT
================================ */
const ticketOptions = document.getElementById("ticketOptions");
const cartList = document.getElementById("cartList");
const totalEl = document.getElementById("total");
const cartCount = document.getElementById("cartCount");

/* ===============================
   RENDER PILIHAN TIKET
================================ */
tickets.forEach(t => {
  const div = document.createElement("div");
  div.className = "option-box";
  div.innerHTML = `
    <strong>${t.nama}</strong>
    <span>Rp ${t.harga.toLocaleString("id-ID")}</span>
  `;
  div.onclick = () => selectTicket(t, div);
  ticketOptions.appendChild(div);
});

function selectTicket(ticket, el) {
  document
    .querySelectorAll(".option-box")
    .forEach(b => b.classList.remove("active"));

  el.classList.add("active");
  selectedTicket = ticket;
}

/* ===============================
   TAMBAH KE KERANJANG
================================ */
function addToCart() {
  if (!selectedTicket) {
    swal("Oops", "Pilih tiket terlebih dahulu", "warning");
    return;
  }

  const item = cart.find(i => i.id === selectedTicket.id);
  if (item) {
    item.qty++;
  } else {
    cart.push({ ...selectedTicket, qty: 1 });
  }

  renderCart();
}

/* ===============================
   RENDER KERANJANG
================================ */
function renderCart() {
  cartList.innerHTML = "";

  let total = 0;
  let count = 0;

  cart.forEach(item => {
    total += item.harga * item.qty;
    count += item.qty;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.nama}</span>
      <div class="cart-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-number">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        <button class="remove-btn" onclick="removeItem(${item.id})">✕</button>
      </div>
    `;
    cartList.appendChild(li);
  });

  totalEl.textContent = total.toLocaleString("id-ID");
  cartCount.textContent = count;
}

/* ===============================
   UBAH JUMLAH
================================ */
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  renderCart();
}

/* ===============================
   HAPUS ITEM
================================ */
function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

/* ===============================
   CHECKOUT
================================ */
async function checkout() {
  const nama = document.getElementById("nama").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!nama || !email || cart.length === 0) {
    swal("Lengkapi Data", "Nama, email, dan tiket wajib diisi", "warning");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

  swal({
    title: "Konfirmasi Pembayaran",
    text: `Total pembayaran Rp ${total.toLocaleString("id-ID")}`,
    icon: "info",
    buttons: {
      cancel: "Batal",
      confirm: {
        text: "Ya, Lanjutkan",
        value: true
      }
    }
  }).then(async confirm => {
    if (!confirm) return;

    try {
      swal({
        title: "Memproses...",
        text: "Sedang mengirim email & membuat struk",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false
      });

      const res = await fetch(
  "https://tiket-konser.vercel.app/api/checkout",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, email, cart, total })
  }
);

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Checkout gagal");
      }

      localStorage.setItem(
        "dataStruk",
        JSON.stringify({ nama, email, cart, total })
      );

      window.location.href = "struk/struk.html";

    } catch (err) {
      swal("Gagal", err.message, "error");
    }
  });
}
