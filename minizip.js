// minizip.js — minimal ZIP builder (STORE only, no compression)
// Replaces JSZip for the single use case: pack XML strings into a .vsdx file.
// API matches the subset used by visio-export2.js:
//   const zip = new MiniZip();
//   zip.file('path/file.xml', 'string content');
//   const blob = await zip.generateAsync({ type: 'blob', mimeType: '...' });

class MiniZip {
  constructor() {
    this._files = []; // { name, data: Uint8Array }
  }

  file(name, content) {
    const enc = new TextEncoder();
    this._files.push({ name, data: enc.encode(content) });
  }

  async generateAsync({ type, mimeType }) {
    const parts = [];
    const centralDir = [];
    let offset = 0;

    const u16 = (n) => [n & 0xff, (n >> 8) & 0xff];
    const u32 = (n) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];

    const crc32 = (data) => {
      let crc = 0xffffffff;
      const table = MiniZip._crcTable();
      for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
      }
      return (crc ^ 0xffffffff) >>> 0;
    };

    const enc = new TextEncoder();

    for (const f of this._files) {
      const nameBytes = enc.encode(f.name);
      const crc = crc32(f.data);
      const size = f.data.length;

      // Local file header
      const localHeader = new Uint8Array([
        0x50, 0x4b, 0x03, 0x04, // signature
        0x14, 0x00,             // version needed: 2.0
        0x00, 0x00,             // general purpose flags
        0x00, 0x00,             // compression: STORE
        0x00, 0x00,             // mod time
        0x00, 0x00,             // mod date
        ...u32(crc),            // CRC-32
        ...u32(size),           // compressed size
        ...u32(size),           // uncompressed size
        ...u16(nameBytes.length), // filename length
        0x00, 0x00,             // extra field length
        ...nameBytes
      ]);

      // Central directory entry
      const cdEntry = new Uint8Array([
        0x50, 0x4b, 0x01, 0x02, // signature
        0x14, 0x00,             // version made by
        0x14, 0x00,             // version needed
        0x00, 0x00,             // flags
        0x00, 0x00,             // compression: STORE
        0x00, 0x00,             // mod time
        0x00, 0x00,             // mod date
        ...u32(crc),
        ...u32(size),
        ...u32(size),
        ...u16(nameBytes.length),
        0x00, 0x00,             // extra field length
        0x00, 0x00,             // comment length
        0x00, 0x00,             // disk number start
        0x00, 0x00,             // internal attributes
        0x00, 0x00, 0x00, 0x00, // external attributes
        ...u32(offset),         // relative offset of local header
        ...nameBytes
      ]);

      parts.push(localHeader, f.data);
      centralDir.push(cdEntry);
      offset += localHeader.length + size;
    }

    const cdOffset = offset;
    const cdSize = centralDir.reduce((s, e) => s + e.length, 0);
    const numEntries = this._files.length;

    // End of central directory record
    const eocd = new Uint8Array([
      0x50, 0x4b, 0x05, 0x06, // signature
      0x00, 0x00,             // disk number
      0x00, 0x00,             // disk with central dir
      ...u16(numEntries),     // entries on this disk
      ...u16(numEntries),     // total entries
      ...u32(cdSize),         // central dir size
      ...u32(cdOffset),       // central dir offset
      0x00, 0x00              // comment length
    ]);

    const allParts = [...parts, ...centralDir, eocd];
    const totalSize = allParts.reduce((s, p) => s + p.length, 0);
    const result = new Uint8Array(totalSize);
    let pos = 0;
    for (const p of allParts) {
      result.set(p, pos);
      pos += p.length;
    }

    return new Blob([result], { type: mimeType || 'application/zip' });
  }

  static _crcTable() {
    if (MiniZip.__crcTable) return MiniZip.__crcTable;
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return (MiniZip.__crcTable = t);
  }
}

// Drop-in replacement: expose as JSZip so visio-export2.js needs no changes
window.JSZip = MiniZip;
