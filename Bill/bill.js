

(function () {
  // Elements
  const itemBody = document.getElementById('itemBody');
  const addRowBtn = document.getElementById('addRow');
  const subEl = document.getElementById('subTotal');
  const gstEl = document.getElementById('gstAmt');
  const grandEl = document.getElementById('grandTotal');

  // Buttons
  const previewBtn = document.getElementById('previewBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  // Meta inputs
  const invNo = document.getElementById('invNo');
  const invDate = document.getElementById('invDate');
  const dueDate = document.getElementById('dueDate');

  // Meta print mirrors
  const invNoPrint = document.getElementById('invNoPrint');
  const invDatePrint = document.getElementById('invDatePrint');
  const dueDatePrint = document.getElementById('dueDatePrint');

  // Buyer fields + print mirrors
  const buyerName = document.getElementById('buyerName');
  const buyerAddr = document.getElementById('buyerAddr');
  const buyerGstin = document.getElementById('buyerGstin');
  const buyerPhone = document.getElementById('buyerPhone');
  const buyerEmail = document.getElementById('buyerEmail');

  const buyerNamePrint = document.getElementById('buyerNamePrint');
  const buyerAddrPrint = document.getElementById('buyerAddrPrint');
  const buyerGstinPrint = document.getElementById('buyerGstinPrint');
  const buyerContactPrint = document.getElementById('buyerContactPrint');

  const GST_RATE = 0.18;

  const toINR = (n) =>
    '₹' +
    Number(n || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtDMY = (d) => {
    const day = String(d.getDate()).padStart(2, '0');
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const yr = d.getFullYear();
    return `${day}-${mon}-${yr}`;
  };

  function genInvoiceNumber() {
    const now = new Date();
    const y = String(now.getFullYear()).slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const r = Math.floor(Math.random() * 900) + 100;
    return `INV-${y}${m}${d}-${r}`;
  }

  function decodeCartFromUrl() {
    const h = location.hash || '';
    const m = h.match(/cart=([A-Za-z0-9\-\_]+)/);
    if (!m) return [];
    try {
      const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(escape(atob(b64)));
      const arr = JSON.parse(json);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  // Mirrors
  function syncBuyerPrint() {
    if (buyerNamePrint) buyerNamePrint.textContent = buyerName?.value || '';
    if (buyerAddrPrint) buyerAddrPrint.textContent = buyerAddr?.value || '';
    if (buyerGstinPrint)
      buyerGstinPrint.textContent = buyerGstin?.value ? `GSTIN: ${buyerGstin.value}` : '';
    const parts = [];
    if (buyerPhone?.value) parts.push(`Phone: ${buyerPhone.value}`);
    if (buyerEmail?.value) parts.push(`Email: ${buyerEmail.value}`);
    if (buyerContactPrint) buyerContactPrint.textContent = parts.join('  |  ');
  }

  function syncMetaPrint() {
    if (invNoPrint) invNoPrint.textContent = invNo?.value ? invNo.value : '';
    if (invDatePrint) {
      if (invDate?.value) invDatePrint.textContent = fmtDMY(new Date(invDate.value));
      else invDatePrint.textContent = '';
    }
    if (dueDatePrint) {
      if (dueDate?.value) dueDatePrint.textContent = fmtDMY(new Date(dueDate.value));
      else dueDatePrint.textContent = '';
    }
  }

  [buyerName, buyerAddr, buyerGstin, buyerPhone, buyerEmail]
    .filter(Boolean)
    .forEach((el) => el.addEventListener('input', syncBuyerPrint));
  [invNo, invDate, dueDate]
    .filter(Boolean)
    .forEach((el) => el.addEventListener('input', syncMetaPrint));

  // Table rows
  function addRow(name = '', price = '', qty = 1) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="idx"></td>
      <td>
        <input class="pname" placeholder="Product name" value="${name}">
        <span class="pname-print" style="display:none;"></span>
      </td>
      <td>
        <input class="price" type="number" step="0.01" min="0" value="${price}">
        <span class="price-print" style="display:none;"></span>
      </td>
      <td>
        <input class="qty" type="number" step="1" min="1" value="${qty}">
        <span class="qty-print" style="display:none;"></span>
      </td>
      <td class="amount" style="text-align:right;">${toINR(0)}</td>
      <td><button class="rm">×</button></td>
    `;
    itemBody.appendChild(tr);
    wireRow(tr);
    renumber();
    recompute();
  }

  function wireRow(tr) {
    const pname = tr.querySelector('.pname');
    const price = tr.querySelector('.price');
    const qty = tr.querySelector('.qty');
    const rm = tr.querySelector('.rm');

    const syncRowMirrors = () => {
      tr.querySelector('.pname-print').textContent = pname.value;
      tr.querySelector('.price-print').textContent = toINR(parseFloat(price.value) || 0);
      tr.querySelector('.qty-print').textContent = qty.value;
    };

    const recalc = () => {
      const p = parseFloat(price.value) || 0;
      const q = parseFloat(qty.value) || 0;
      tr.querySelector('.amount').textContent = toINR(p * q);
      syncRowMirrors();
      recompute();
    };

    pname.addEventListener('input', syncRowMirrors);
    price.addEventListener('input', recalc);
    qty.addEventListener('input', recalc);
    rm.addEventListener('click', () => {
      tr.remove();
      renumber();
      recompute();
    });

    recalc(); // initial
  }

  function renumber() {
    Array.from(itemBody.children).forEach((tr, i) => {
      tr.querySelector('.idx').textContent = i + 1;
    });
  }

  function recompute() {
    let sub = 0;
    Array.from(itemBody.children).forEach((tr) => {
      const p = parseFloat(tr.querySelector('.price').value) || 0;
      const q = parseFloat(tr.querySelector('.qty').value) || 0;
      sub += p * q;
    });
    const gst = sub * GST_RATE;
    const total = sub + gst;
    subEl.textContent = toINR(sub);
    gstEl.textContent = toINR(gst);
    grandEl.textContent = toINR(total);
  }

  function prefillDefaults() {
    // Invoice meta defaults
    if (invNo) invNo.value = genInvoiceNumber();
    const today = new Date();
    if (invDate) invDate.valueAsDate = today;
    const due = new Date(today);
    due.setDate(due.getDate() + 7);
    if (dueDate) dueDate.valueAsDate = due;

    syncMetaPrint();

    // Items from cart (if any)
    const incoming = decodeCartFromUrl();
    if (incoming.length) {
      incoming.forEach((it) =>
        addRow(it.name || '', Number(it.price) || 0, Number(it.qty) || 1)
      );
    } else {
      addRow();
    }

    syncBuyerPrint(); // initial mirrors
  }

  // Preview & Print (system dialog)
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      syncMetaPrint();
      syncBuyerPrint();
      window.print();
    });
  }

  // Direct, silent download using html2pdf.js (no preview, no new window)
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      // Ensure mirrors are current before capture
      syncMetaPrint();
      syncBuyerPrint();

      const target = document.querySelector('.invoice-wrap');

      // Build filename
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const num = (invNo?.value || 'Invoice').trim().replace(/\s+/g, '-');
      const filename = `${num}-${y}${m}${d}.pdf`;

      // Improve color fidelity for rasterization
      target.style.webkitPrintColorAdjust = 'exact';
      target.style.printColorAdjust = 'exact';

      if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin: [10, 10, 10, 10],
          // filename is not used for Blob path, but kept for compatibility
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        };

        try {
          // Create worker but DO NOT call .save() (it may show a dialog)
          const worker = html2pdf().set(opt).from(target);

          // Generate Blob silently
          const pdfBlob = await worker.output('blob');

          // Trigger a download via a hidden anchor
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error('PDF generation failed:', e);
        }
      } else {
        console.error('html2pdf.js not found. Include the CDN script in your HTML head.');
      }
    });
  }

  // Add row handler
  addRowBtn.addEventListener('click', () => addRow());

  // Initialize
  prefillDefaults();
})();