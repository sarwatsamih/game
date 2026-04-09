import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update, set } from "firebase/database";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyClw8-RvknN9aQ63eXm7ziH9PoC",
  authDomain: "kurdish-game-5206a.firebaseapp.com",
  projectId: "kurdish-game-5206a",
  storageBucket: "kurdish-game-5206a.appspot.com",
  messagingSenderId: "706151709173",
  appId: "1:706151709173:web:879ee5b406d6aa",
  databaseURL: "https://kurdish-game-5206a-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function App() {
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState({});
  const [timer, setTimer] = useState(15);
  const [currentLetter, setCurrentLetter] = useState('ئ');
  const [isAdmin, setIsAdmin] = useState(false);
  const [roundStatus, setRoundStatus] = useState('letter'); // 'letter' یان 'writing'
  const [selectedCats, setSelectedCats] = useState([]); // ئەدواتە هەڵبژێردراوەکان

  const allLetters = ['ئ', 'ب', 'پ', 'ت', 'ج', 'چ', 'ح', 'خ', 'د', 'ر', 'ڕ', 'ز', 'ژ', 'س', 'ش', 'ع', 'غ', 'ف', 'ڤ', 'ق', 'ک', 'گ', 'ل', 'ڵ', 'م', 'ن', 'ه', 'و', 'ی'];

  // چوونە ناو ژوور و دیاریکردنی ئەدمین
  const joinRoom = () => {
    if (room && name) {
      const playerRef = ref(db, `rooms/${room}/players/${name}`);
      set(playerRef, { name, points: 0, answers: {} });
      setJoined(true);
      
      onValue(ref(db, `rooms/${room}/admin`), (snapshot) => {
        if (!snapshot.exists()) {
          set(ref(db, `rooms/${room}/admin`), name);
        }
        if (snapshot.val() === name) setIsAdmin(true);
      });
    }
  };

  // لۆژیکی کاتژمێر تەنها بۆ ئەدمین
  useEffect(() => {
    let interval;
    if (isAdmin && joined) {
      interval = setInterval(() => {
        if (timer > 0) {
          update(ref(db, `rooms/${room}`), { timer: timer - 1 });
        } else {
          if (roundStatus === 'letter') {
            // کاتی نووسین = ژمارەی ئەدواتەکان لێکدانی 10 چرکە
            const writingTime = (selectedCats.length > 0 ? selectedCats.length : 6) * 10;
            update(ref(db, `rooms/${room}`), { 
              timer: writingTime, 
              roundStatus: 'writing' 
            });
          } else {
            // گۆڕینی پیت و گەڕانەوە بۆ 15 چرکە
            const nextLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
            update(ref(db, `rooms/${room}`), { 
              currentLetter: nextLetter, 
              timer: 15, 
              roundStatus: 'letter' 
            });
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAdmin, joined, timer, roundStatus, selectedCats]);

  // وەرگرتنی داتا بۆ هەمووان
  useEffect(() => {
    if (joined && room) {
      onValue(ref(db, `rooms/${room}`), (snapshot) => {
        const data = snapshot.val();
        if (data) {
          if (data.players) setPlayers(data.players);
          if (data.timer !== undefined) setTimer(data.timer);
          if (data.currentLetter) setCurrentLetter(data.currentLetter);
          if (data.roundStatus) setRoundStatus(data.roundStatus);
          if (data.categories) setSelectedCats(data.categories);
        }
      });
    }
  }, [joined, room]);

  // خاڵبەندی ئەدمین (10 بۆ جیاواز، 5 بۆ وەک یەک، 0 بۆ هەڵە)
  const addPoints = (pName, pts) => {
    const current = players[pName].points || 0;
    update(ref(db, `rooms/${room}/players/${pName}`), { points: current + pts });
  };

  if (!joined) {
    return (
      <div className="login-container" style={{ textAlign: 'center', padding: '50px', direction: 'rtl', color: 'white' }}>
        <div className="card">
          <h2>بەخێربێیت 🎮</h2>
          <input placeholder="ناوت" onChange={(e) => setName(e.target.value)} />
          <input placeholder="کۆدی ژوور" onChange={(e) => setRoom(e.target.value)} /><button className="btn-gold" onClick={joinRoom}>دەستپێکردن</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', color: 'white', padding: '20px' }}>
      {/* بەشی پیت و کاتژمێر */}
      <div className="status-card" style={{ textAlign: 'center', border: '2px solid #f5c518', borderRadius: '15px', padding: '20px' }}>
        <h1 style={{ fontSize: '5rem', margin: '0', color: '#f5c518' }}>{currentLetter}</h1>
        <div style={{ fontSize: '1.5rem' }}>
          {roundStatus === 'letter' ? 'کاتی گۆڕینی پیت: ' : 'کاتی وەڵامدانەوە: '}
          <span style={{ color: timer <= 5 ? 'red' : 'white', fontWeight: 'bold' }}>{timer}</span>
        </div>
      </div>

      {/* لیستی یاریزانەکان و وەڵامەکان */}
      <div style={{ marginTop: '20px' }}>
        {Object.values(players).map((p, i) => (
          <div key={i} className="player-row" style={{ background: '#333', margin: '10px 0', padding: '15px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{p.name} (خاڵ: {p.points})</span>
              {isAdmin && (
                <div>
                  <button onClick={() => addPoints(p.name, 10)} style={{ background: 'green' }}>١٠</button>
                  <button onClick={() => addPoints(p.name, 5)} style={{ background: 'orange' }}>٥</button>
                  <button onClick={() => addPoints(p.name, 0)} style={{ background: 'red' }}>٠</button>
                </div>
              )}
            </div>
            {/* لێرە وەڵامەکان پیشان دەدرێن */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;