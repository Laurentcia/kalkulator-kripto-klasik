import { useState } from 'react'
import './App.css'

function App() {
  const [algorithm, setAlgorithm] = useState('caesar');
  const [key, setKey] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

 

  // 1. Caesar Cipher
  const caesarCipher = (text, shiftStr, isDecrypt = false) => {
    let shift = parseInt(shiftStr, 10);
    if (isNaN(shift)) return '(Error: Kunci Caesar harus angka!)';
    if (isDecrypt) shift = (26 - shift) % 26; 
    
    return text.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
    });
  };

  // 2. Vigenère Cipher
  const vigenereCipher = (text, keyStr, isDecrypt = false) => {
    if (!keyStr) return '(Error: Kunci Vigenere tidak boleh kosong!)';
    let result = '';
    let keyIndex = 0;
    const cleanKey = keyStr.toUpperCase().replace(/[^A-Z]/g, ''); 
    if (cleanKey.length === 0) return '(Error: Kunci Vigenere harus berisi huruf!)';

    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-zA-Z]/)) {
        const base = char <= 'Z' ? 65 : 97;
        const keyShift = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;
        const shift = isDecrypt ? (26 - keyShift) % 26 : keyShift;

        result += String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
        keyIndex++;
      } else {
        result += char; 
      }
    }
    return result;
  };

  // 3. Playfair Cipher
  const playfairCipher = (text, keyStr, isDecrypt = false) => {
    if (!keyStr) return '(Error: Kunci Playfair tidak boleh kosong!)';
    const matrix = [];
    const used = new Set();
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // Alfabet tanpa J
    const cleanKey = keyStr.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, '');

    for (let char of cleanKey + alphabet) {
      if (!used.has(char)) {
        matrix.push(char);
        used.add(char);
      }
    }

    
    let cleanText = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, '');
    if (!isDecrypt) {
      let temp = "";
      for (let i = 0; i < cleanText.length; i++) {
        temp += cleanText[i];
      
        if (i + 1 < cleanText.length && cleanText[i] === cleanText[i + 1] && temp.length % 2 !== 0) {
          temp += 'Q'; 
        }
      }
      if (temp.length % 2 !== 0) temp += 'Q';
      cleanText = temp;
    }

    let result = "";
    for (let i = 0; i < cleanText.length; i += 2) {
      let a = cleanText[i];
      let b = cleanText[i + 1];
      let posA = matrix.indexOf(a);
      let posB = matrix.indexOf(b);
      let rowA = Math.floor(posA / 5), colA = posA % 5;
      let rowB = Math.floor(posB / 5), colB = posB % 5;

      if (rowA === rowB) {
        result += matrix[rowA * 5 + (colA + (isDecrypt ? 4 : 1)) % 5];
        result += matrix[rowB * 5 + (colB + (isDecrypt ? 4 : 1)) % 5];
      } else if (colA === colB) {
        result += matrix[((rowA + (isDecrypt ? 4 : 1)) % 5) * 5 + colA];
        result += matrix[((rowB + (isDecrypt ? 4 : 1)) % 5) * 5 + colB];
      } else {
        result += matrix[rowA * 5 + colB];
        result += matrix[rowB * 5 + colA];
      }
    }
    return result;
  };

  // 4. Affine Cipher
  const affineCipher = (text, keyStr, isDecrypt = false) => {
    const keys = keyStr.split(',').map(k => parseInt(k.trim(), 10));
    if (keys.length !== 2 || isNaN(keys[0]) || isNaN(keys[1])) {
      return '(Error: Kunci Affine harus format "a, b". Contoh: 7, 10)';
    }
    let [a, b] = keys;
    
    
    const modInverse = (a, m) => {
      for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
      return -1;
    };
    
    let aInv = modInverse(a, 26);
    if (aInv === -1) return '(Error: Nilai "a" pada kunci harus relatif prima dengan 26!)';

    return text.replace(/[a-zA-Z]/g, (char) => {
      const isUpper = char <= 'Z';
      const base = isUpper ? 65 : 97;
      let p = char.charCodeAt(0) - base;
      let c;
      if (!isDecrypt) {
        c = (a * p + b) % 26; 
      } else {
        c = (aInv * (p - b)) % 26; 
        if (c < 0) c += 26;
      }
      return String.fromCharCode(c + base);
    });
  };

  // 5.OTP 
  const otpCipher = (text, keyStr, isDecrypt = false) => {
    const keys = keyStr.split(',').map(k => parseInt(k.trim(), 10)).filter(k => !isNaN(k));
    if (keys.length === 0) return '(Error: Kunci OTP harus berupa angka dipisah koma. Contoh: 8,15,17)';
    
    let result = '';
    let keyIndex = 0;
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-zA-Z]/)) {
        if (keyIndex >= keys.length) return '(Error: Kunci OTP kurang panjang dari teks!)'; 
        const base = char <= 'Z' ? 65 : 97;
        let p = char.charCodeAt(0) - base;
        let k = keys[keyIndex];
        let c;
        if (!isDecrypt) c = (p + k) % 26;
        else {
          c = (p - k) % 26;
          while(c < 0) c += 26;
        }
        result += String.fromCharCode(c + base);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  };

  

  const handleEncrypt = () => {
    if (!inputText) return setOutputText('(Masukkan teks asli terlebih dahulu)');

    if (algorithm === 'caesar') setOutputText(caesarCipher(inputText, key, false));
    else if (algorithm === 'vigenere') setOutputText(vigenereCipher(inputText, key, false));
    else if (algorithm === 'playfair') setOutputText(playfairCipher(inputText, key, false));
    else if (algorithm === 'affine') setOutputText(affineCipher(inputText, key, false));
    else if (algorithm === 'otp') setOutputText(otpCipher(inputText, key, false));
  }

  const handleDecrypt = () => {
    if (!inputText) return setOutputText('(Masukkan teks asli terlebih dahulu)');

    if (algorithm === 'caesar') setOutputText(caesarCipher(inputText, key, true));
    else if (algorithm === 'vigenere') setOutputText(vigenereCipher(inputText, key, true));
    else if (algorithm === 'playfair') setOutputText(playfairCipher(inputText, key, true));
    else if (algorithm === 'affine') setOutputText(affineCipher(inputText, key, true));
    else if (algorithm === 'otp') setOutputText(otpCipher(inputText, key, true));
  }

 
  const getKeyPlaceholder = () => {
    if (algorithm === 'caesar') return 'Contoh: 3';
    if (algorithm === 'vigenere') return 'Contoh: SONY';
    if (algorithm === 'playfair') return 'Contoh: GADJAH';
    if (algorithm === 'affine') return 'Masukkan a, b (Contoh: 7, 10)';
    if (algorithm === 'otp') return 'Contoh: 8, 15, 17, 3, 11';
    return '';
  };

  return (
    <div className="app-container">
      <h1>Kalkulator Kriptografi Klasik</h1>
      <hr />

      <div className="form-group">
        <label>Pilih Algoritma:</label>
        <select value={algorithm} onChange={(e) => {
          setAlgorithm(e.target.value);
          setKey('');         
          setInputText('');   
          setOutputText('');  
        }}>
          <option value="caesar">Caesar Cipher</option>
          <option value="vigenere">Vigenère Cipher</option>
          <option value="playfair">Playfair Cipher</option>
          <option value="affine">Affine Cipher</option>
          <option value="otp">One-Time Pad Cipher</option>
        </select>
      </div>

      <div className="form-group">
        <label>Kunci (Key / Shift):</label>
        <input
          type="text"
          placeholder={getKeyPlaceholder()}
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Teks Asli (Plaintext):</label>
        <textarea
          placeholder="Ketik pesan di sini..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        ></textarea>
      </div>

      <div className="action-area">
        <button className="btn-encrypt" onClick={handleEncrypt}>🔒 Enkripsi</button>
        <button className="btn-decrypt" onClick={handleDecrypt}>🔓 Dekripsi</button>
      </div>

      <div className="form-group">
        <label>Hasil (Ciphertext):</label>
        <textarea
          className="output-box"
          readOnly
          placeholder="Hasil akan muncul di sini..."
          value={outputText}
        ></textarea>
      </div>
    </div>
  )
}

export default App