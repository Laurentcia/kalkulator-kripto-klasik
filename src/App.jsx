import { useState } from 'react'
import './App.css'

function App() {
  const [algorithm, setAlgorithm] = useState('caesar');
  const [key, setKey] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const mod26 = (n) => ((n % 26) + 26) % 26;
  const modInverse = (a, m) => {
    a = mod26(a);
    for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
    return -1;
  };

  const renderExtraInfo = () => {
    if (algorithm === 'hill') {
      const nums = key.split(',').map(k => k.trim()).filter(k => k !== "");
      const n = Math.sqrt(nums.length);
      return (
        <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#6D565A' }}>
          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>⚠️ Aturan: Masukkan angka kunci PER BARIS.</p>
          {Number.isInteger(n) && n >= 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: '8px', background: '#F8EDEF', padding: '12px', borderRadius: '10px', border: '1px solid #E3BFC3' }}>
              {nums.map((num, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#DD7A83' }}>B{Math.floor(idx/n)+1}, K{idx%n+1}</span>
                  <strong>{num}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (algorithm === 'enigma') {
      return (
        <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#6D565A', fontStyle: 'italic' }}>
          *Kunci: Masukkan angka posisi awal rotor (0, 1, atau 2).
        </p>
      );
    }
    return null;
  };


  const caesarCipher = (text, shiftStr, isDecrypt = false) => {
    let shift = parseInt(shiftStr, 10);
    if (isNaN(shift)) return '(Kunci harus angka)';
    if (isDecrypt) shift = (26 - shift) % 26;
    return text.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
    });
  };

  const vigenereCipher = (text, keyStr, isDecrypt = false) => {
    if (!keyStr) return '(Kunci kosong)';
    let result = '', keyIndex = 0;
    const cleanKey = keyStr.toUpperCase().replace(/[^A-Z]/g, '');
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
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
    const cleanKey = keyStr.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, '');
    const used = new Set();
    const matrix = [];
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
      let rA = Math.floor(posA/5), cA = posA%5, rB = Math.floor(posB/5), cB = posB%5;
      if (rA === rB) { result += matrix[rA*5 + (cA+(isDecrypt?4:1))%5] + matrix[rB*5 + (cB+(isDecrypt?4:1))%5]; }
      else if (cA === cB) { result += matrix[((rA+(isDecrypt?4:1))%5)*5 + cA] + matrix[((rB+(isDecrypt?4:1))%5)*5 + cB]; }
      else { result += matrix[rA*5 + cB] + matrix[rB*5 + cA]; }
    }
    return result;
  };

  const affineCipher = (text, keyStr, isDecrypt = false) => {
    const k = keyStr.split(',').map(n => parseInt(n.trim()));
    if (k.length !== 2) return '(Format: a, b)';
    let aInv = modInverse(k[0], 26);
    if (aInv === -1) return '(Nilai "a" tidak valid)';
    return text.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= 'Z' ? 65 : 97;
      let p = char.charCodeAt(0) - base;
      let res = !isDecrypt ? mod26(k[0]*p + k[1]) : mod26(aInv*(p - k[1]));
      return String.fromCharCode(res + base);
    });
  };

  const otpCipher = (text, keyStr, isDecrypt = false) => {
    const k = keyStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    let res = '', kIdx = 0;
    for (let char of text) {
      if (char.match(/[a-zA-Z]/)) {
        if (kIdx >= k.length) return '(Kunci OTP kurang panjang)';
        let p = char.toUpperCase().charCodeAt(0) - 65;
        res += String.fromCharCode(mod26(isDecrypt ? p - k[kIdx] : p + k[kIdx]) + 65);
        kIdx++;
      } else res += char;
    }
    return res;
  };

  const hillCipher = (text, keyStr, isDecrypt = false) => {
    let k = keyStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    let n = Math.sqrt(k.length);
    if (!Number.isInteger(n) || n < 2) return "(Gunakan 4, 9, atau 16 angka)";
    let m = [];
    for (let i = 0; i < n; i++) m.push(k.slice(i * n, i * n + n));
    if (isDecrypt) {
      if (n > 3) return "(Dekripsi Hill > 3x3 terlalu kompleks)";
      let det = n === 2 ? mod26(m[0][0]*m[1][1] - m[0][1]*m[1][0]) : mod26(m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]));
      let iD = modInverse(det, 26);
      if (iD === -1) return "(Matriks tidak punya invers)";
      if (n === 2) m = [[mod26(m[1][1]*iD), mod26(-m[0][1]*iD)], [mod26(-m[1][0]*iD), mod26(m[0][0]*iD)]];
      else {
        let a = m;
        let adj = [
          [mod26(a[1][1]*a[2][2]-a[1][2]*a[2][1]), mod26(-(a[0][1]*a[2][2]-a[0][2]*a[2][1])), mod26(a[0][1]*a[1][2]-a[0][2]*a[1][1])],
          [mod26(-(a[1][0]*a[2][2]-a[1][2]*a[2][0])), mod26(a[0][0]*a[2][2]-a[0][2]*a[2][0]), mod26(-(a[0][0]*a[1][2]-a[0][2]*a[1][0]))],
          [mod26(a[1][0]*a[2][1]-a[1][1]*a[2][0]), mod26(-(a[0][0]*a[2][1]-a[0][1]*a[2][0])), mod26(a[0][0]*a[1][1]-a[0][1]*a[1][0])]
        ];
        m = adj.map(r => r.map(v => mod26(v * iD)));
      }
    }
    let txt = text.toUpperCase().replace(/[^A-Z]/g, '');
    while (txt.length % n !== 0) txt += 'X';
    let res = "";
    for (let i = 0; i < txt.length; i += n) {
      for (let r = 0; r < n; r++) {
        let sum = 0;
        for (let c = 0; c < n; c++) sum += m[r][c] * (txt.charCodeAt(i + c) - 65);
        res += String.fromCharCode(mod26(sum) + 65);
      }
    }
    return res;
  };

  const enigmaCipher = (text, posStr, isDecrypt = false) => {
    let pos = parseInt(posStr) || 0;
    const rotors = [
      "EKMFLGDQVZNTOWYHXUSPAIBRCJ", // Rotor 0
      "AJDKSIRUXBLHWTMCQGZNPYFVOE", // Rotor 1
      "BDFHJLCPRTXVZNYEIWGAKMUSQO"  // Rotor 2
    ];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let res = '', cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
    for (let i = 0; i < cleanText.length; i++) {
      let r = rotors[(i + pos) % 3];
      if (!isDecrypt) res += r[alphabet.indexOf(cleanText[i])];
      else res += alphabet[r.indexOf(cleanText[i])];
    }
    return res;
  };

  const handleAction = (isDec) => {
    if (!inputText) return setOutputText('(Input kosong)');
    const funcs = { 
      caesar: caesarCipher, vigenere: vigenereCipher, playfair: playfairCipher, 
      affine: affineCipher, otp: otpCipher, hill: hillCipher, enigma: enigmaCipher 
    };
    setOutputText(funcs[algorithm](inputText, key, isDec));
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
          <option value="otp">One-Time Pad</option>
          <option value="hill">Hill Cipher</option>
          <option value="enigma">Enigma / Rotor Cipher</option>
        </select>
      </div>
      <div className="form-group">
        <label>Kunci:</label>
        <input type="text" placeholder="Masukkan kunci..." value={key} onChange={(e) => setKey(e.target.value)} />
        {renderExtraInfo()}
      </div>
      <div className="form-group">
        <label>Teks Asli (Plaintext):</label>
        <textarea placeholder="Ketik pesan..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
      </div>
      <div className="action-area">
        <button className="btn-encrypt" onClick={() => handleAction(false)}> Enkripsi</button>
        <button className="btn-decrypt" onClick={() => handleAction(true)}> Dekripsi</button>
      </div>
      <div className="form-group">
        <label>Hasil:</label>
        <textarea className="output-box" readOnly value={outputText} />
      </div>
    </div>
  );
}

export default App;