import { useState } from 'react'
import './App.css'

function App() {
  const [algorithm, setAlgorithm] = useState('caesar');
  const [key, setKey] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const mod26 = (n) => ((n % 26) + 26) % 26;
  const modInverse = (a, m) => {
    for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
    return -1;
  };

  const renderMatrixPreview = () => {
    if (algorithm !== 'hill' || !key) return null;
    const nums = key.split(',').map(k => k.trim()).filter(k => k !== "");
    const n = Math.sqrt(nums.length);
    
    if (!Number.isInteger(n) || n < 2) return <p style={{fontSize: '0.8rem', color: '#DD7A83'}}>*Masukkan jumlah angka yang pas untuk matriks persegi (4, 9, atau 16 angka)</p>;

    return (
      <div className="matrix-preview">
        <p style={{fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px'}}>Preview Matriks {n}x{n}:</p>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: '5px', background: '#F8EDEF', padding: '10px', borderRadius: '8px', border: '1px dashed #DD7A83' }}>
          {nums.map((num, idx) => (
            <div key={idx} style={{ textAlign: 'center', fontSize: '0.75rem' }}>
              <div style={{ color: '#DD7A83', fontWeight: 'bold' }}>[{Math.floor(idx/n)+1},{idx%n+1}]</div>
              <div>{num}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const caesarCipher = (text, shiftStr, isDecrypt = false) => {
    let shift = parseInt(shiftStr, 10);
    if (isNaN(shift)) return '(Error: Kunci harus angka!)';
    if (isDecrypt) shift = (26 - shift) % 26;
    return text.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
    });
  };

  const vigenereCipher = (text, keyStr, isDecrypt = false) => {
    if (!keyStr) return '(Error: Kunci kosong!)';
    let result = '', keyIndex = 0;
    const cleanKey = keyStr.toUpperCase().replace(/[^A-Z]/g, '');
    if (cleanKey.length === 0) return '(Error: Kunci tidak valid!)';
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-zA-Z]/)) {
        const base = char <= 'Z' ? 65 : 97;
        const keyShift = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;
        const shift = isDecrypt ? (26 - keyShift) % 26 : keyShift;
        result += String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
        keyIndex++;
      } else result += char;
    }
    return result;
  };

  const playfairCipher = (text, keyStr, isDecrypt = false) => {
    if (!keyStr) return '(Error: Kunci kosong!)';
    const matrix = [];
    const used = new Set();
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
    const cleanKey = keyStr.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, '');
    for (let char of cleanKey + alphabet) { if (!used.has(char)) { matrix.push(char); used.add(char); } }
    let cleanText = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, '');
    if (!isDecrypt) {
      let temp = "";
      for (let i = 0; i < cleanText.length; i++) {
        temp += cleanText[i];
        if (i + 1 < cleanText.length && cleanText[i] === cleanText[i + 1] && temp.length % 2 !== 0) temp += 'Q';
      }
      if (temp.length % 2 !== 0) temp += 'Q';
      cleanText = temp;
    }
    let result = "";
    for (let i = 0; i < cleanText.length; i += 2) {
      let a = cleanText[i], b = cleanText[i + 1];
      let posA = matrix.indexOf(a), posB = matrix.indexOf(b);
      let rowA = Math.floor(posA / 5), colA = posA % 5;
      let rowB = Math.floor(posB / 5), colB = posB % 5;
      if (rowA === rowB) {
        result += matrix[rowA * 5 + (colA + (isDecrypt ? 4 : 1)) % 5];
        result += matrix[rowB * 5 + (colB + (isDecrypt ? 4 : 1)) % 5];
      } else if (colA === colB) {
        result += matrix[((rowA + (isDecrypt ? 4 : 1)) % 5) * 5 + colA];
        result += matrix[((rowB + (isDecrypt ? 4 : 1)) % 5) * 5 + colB];
      } else {
        result += matrix[rowA * 5 + colB]; result += matrix[rowB * 5 + colA];
      }
    }
    return result;
  };

  const affineCipher = (text, keyStr, isDecrypt = false) => {
    const keys = keyStr.split(',').map(k => parseInt(k.trim()));
    if (keys.length !== 2 || isNaN(keys[0]) || isNaN(keys[1])) return '(Error: Gunakan format "a, b")';
    let [a, b] = keys, aInv = modInverse(a, 26);
    if (aInv === -1) return '(Error: "a" tidak relatif prima dengan 26!)';
    return text.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= 'Z' ? 65 : 97;
      let p = char.charCodeAt(0) - base;
      let c = !isDecrypt ? mod26(a * p + b) : mod26(aInv * (p - b));
      return String.fromCharCode(c + base);
    });
  };

  const otpCipher = (text, keyStr, isDecrypt = false) => {
    const keys = keyStr.split(',').map(k => parseInt(k.trim())).filter(k => !isNaN(k));
    if (keys.length === 0) return '(Error: Kunci tidak valid!)';
    let result = '', keyIndex = 0;
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-zA-Z]/)) {
        if (keyIndex >= keys.length) return '(Error: Kunci kurang panjang!)';
        let p = char.toUpperCase().charCodeAt(0) - 65;
        let c = !isDecrypt ? mod26(p + keys[keyIndex]) : mod26(p - keys[keyIndex]);
        result += String.fromCharCode(c + 65); keyIndex++;
      } else result += char;
    }
    return result;
  };

  // --- HILL CIPHER (MENUNJANG 2x2, 3x3, 4x4) ---
  const hillCipher = (text, keyStr, isDecrypt = false) => {
    let keys = keyStr.split(',').map(k => parseInt(k.trim())).filter(k => !isNaN(k));
    let n = Math.sqrt(keys.length);
    if (!Number.isInteger(n) || n < 2) return "(Error: Kunci harus berjumlah angka kuadrat, misal 4, 9, atau 16!)";

    let matrix = [];
    for (let i = 0; i < n; i++) matrix.push(keys.slice(i * n, i * n + n));

    if (isDecrypt) {
      if (n > 3) return "(Dekripsi Hill > 3x3 membutuhkan komputasi tingkat tinggi)";
      let det, invDet;
      if (n === 2) {
        det = mod26(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]);
        invDet = modInverse(det, 26);
        if (invDet === -1) return "(Error: Matriks tidak memiliki invers!)";
        matrix = [[mod26(matrix[1][1] * invDet), mod26(-matrix[0][1] * invDet)], [mod26(-matrix[1][0] * invDet), mod26(matrix[0][0] * invDet)]];
      } else if (n === 3) {
        det = mod26(matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) - matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) + matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]));
        invDet = modInverse(det, 26);
        if (invDet === -1) return "(Error: Matriks tidak memiliki invers!)";
        let m = matrix;
        let adj3 = [
          [mod26(m[1][1]*m[2][2]-m[1][2]*m[2][1]), mod26(-(m[0][1]*m[2][2]-m[0][2]*m[2][1])), mod26(m[0][1]*m[1][2]-m[0][2]*m[1][1])],
          [mod26(-(m[1][0]*m[2][2]-m[1][2]*m[2][0])), mod26(m[0][0]*m[2][2]-m[0][2]*m[2][0]), mod26(-(m[0][0]*m[1][2]-m[0][2]*m[1][0]))],
          [mod26(m[1][0]*m[2][1]-m[1][1]*m[2][0]), mod26(-(m[0][0]*m[2][1]-m[0][1]*m[2][0])), mod26(m[0][0]*m[1][1]-m[0][1]*m[1][0])]
        ];
        matrix = adj3.map(row => row.map(val => mod26(val * invDet)));
      }
    }

    let cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
    while (cleanText.length % n !== 0) cleanText += 'X';
    let result = "";
    for (let i = 0; i < cleanText.length; i += n) {
      for (let r = 0; r < n; r++) {
        let sum = 0;
        for (let c = 0; c < n; c++) sum += matrix[r][c] * (cleanText.charCodeAt(i + c) - 65);
        result += String.fromCharCode(mod26(sum) + 65);
      }
    }
    return result;
  };

  const handleAction = (isDecrypt) => {
    if (!inputText) return setOutputText('(Masukkan teks!)');
    if (algorithm === 'caesar') setOutputText(caesarCipher(inputText, key, isDecrypt));
    else if (algorithm === 'vigenere') setOutputText(vigenereCipher(inputText, key, isDecrypt));
    else if (algorithm === 'playfair') setOutputText(playfairCipher(inputText, key, isDecrypt));
    else if (algorithm === 'affine') setOutputText(affineCipher(inputText, key, isDecrypt));
    else if (algorithm === 'otp') setOutputText(otpCipher(inputText, key, isDecrypt));
    else if (algorithm === 'hill') setOutputText(hillCipher(inputText, key, isDecrypt));
  };

  return (
    <div className="app-container">
      <h1>Kalkulator Kriptografi Klasik</h1>
      <hr />
      <div className="form-group">
        <label>Pilih Algoritma:</label>
        <select value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); setKey(''); setInputText(''); setOutputText(''); }}>
          <option value="caesar">Caesar Cipher</option>
          <option value="vigenere">Vigenère Cipher</option>
          <option value="playfair">Playfair Cipher</option>
          <option value="affine">Affine Cipher</option>
          <option value="otp">One-Time Pad Cipher</option>
          <option value="hill">Hill Cipher</option>
        </select>
      </div>
      <div className="form-group">
        <label>Kunci (Gunakan Koma):</label>
        <input type="text" placeholder={algorithm === 'hill' ? 'Masukan angka kunci PER BARIS (kiri ke kanan.Cth: 1, 2, 5, ...)' : 'Masukan kunci...'} value={key} onChange={(e) => setKey(e.target.value)} />
        {renderMatrixPreview()}
      </div>
      <div className="form-group">
        <label>Teks Asli (Plaintext):</label>
        <textarea placeholder="Ketik pesan..." value={inputText} onChange={(e) => setInputText(e.target.value)}></textarea>
      </div>
      <div className="action-area">
        <button className="btn-encrypt" onClick={() => handleAction(false)}> Enkripsi</button>
        <button className="btn-decrypt" onClick={() => handleAction(true)}> Dekripsi</button>
      </div>
      <div className="form-group">
        <label>Hasil (Ciphertext):</label>
        <textarea className="output-box" readOnly placeholder="..." value={outputText}></textarea>
      </div>
    </div>
  );
}

export default App;