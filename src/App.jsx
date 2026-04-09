import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyClW8-RvknN9aQ63eXm7ziH9PoC",
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

  useEffect(() => {
    if (joined && room) {
      const roomRef = ref(db, 'rooms/' + room + '/players');
      onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setPlayers(data);
      });
    }
  }, [joined, room]);

  const joinGame = () => {
    if (name && room) {
      update(ref(db, `rooms/${room}/players/${name}`), { name: name });
      setJoined(true);
    }
  };

  if (!joined) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', direction: 'rtl', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
        <h1 style={{ color: '#f5c518' }}>یاری ئۆنلاینی کوردی 🎮</h1>
        <input style={{ padding: '10px', margin: '10px', borderRadius: '5px' }} placeholder="ناوەکەت" onChange={(e) => setName(e.target.value)} /><br/>
        <input style={{ padding: '10px', margin: '10px', borderRadius: '5px' }} placeholder="کۆدی ژوور" onChange={(e) => setRoom(e.target.value)} /><br/>
        <button style={{ padding: '10px 30px', backgroundColor: '#f5c518', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '5px' }} onClick={joinGame}>چوونە ناو یاری</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px', direction: 'rtl', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h2 style={{ color: '#f5c518' }}>ژووری: {room}</h2>
      <h3>یاریزانە ئامادەبووەکان:</h3>
      {Object.values(players).map((p, i) => (
        <div key={i} style={{ padding: '15px', margin: '10px auto', backgroundColor: '#333', borderRadius: '10px', maxWidth: '300px', border: '1px solid #f5c518' }}>{p.name} ✅</div>
      ))}
    </div>
  );
}

export default App;