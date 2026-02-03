import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { Monitor, LogOut, Copy, Check, Settings, ChevronLeft, Calendar, FileText, Sun, Image as ImageIcon, Type, Eye, Maximize } from 'lucide-react';

// --- KONFIGURASJON ---
const BACKGROUND_IMAGES = [
  "Wallpaper_Marsteinen_Fyr_2.png", "høstblader.jpg", "lyng.jpg", "lyng_rorbuer.jpg",
  "regnbue.jpg", "rose.jpg", "snømorama.jpg", "sunset_mot_vest.jpg",
  "sunset_orange.jpg", "sunset_rosa.jpg", "vær_natur.jpg", "vær_nær.jpg"
];

const FONTS = [
  { id: 'font-great-vibes', name: 'Great Vibes' },
  { id: 'font-playfair', name: 'Playfair Display' },
  { id: 'font-cormorant', name: 'Cormorant' },
  { id: 'font-dancing', name: 'Dancing Script' },
  { id: 'font-alex', name: 'Alex Brush' },
  { id: 'font-cinzel', name: 'Cinzel' },
  { id: 'font-lora', name: 'Lora' },
  { id: 'font-montserrat', name: 'Montserrat' },
  { id: 'font-oswald', name: 'Oswald' },
  { id: 'font-pinyon', name: 'Pinyon Script' },
];

const SIZES = [
  { id: 'lvl1', label: '1 - Stor', class: 'text-5xl md:text-6xl' },
  { id: 'lvl2', label: '2 - Større', class: 'text-6xl md:text-7xl' },
  { id: 'lvl3', label: '3 - Enorm', class: 'text-7xl md:text-8xl' }, 
  { id: 'lvl4', label: '4 - Gigantisk', class: 'text-8xl md:text-9xl' },
  { id: 'lvl5', label: '5 - Maksimal', class: 'text-9xl md:text-[11rem]' },
];

const OPACITY_LEVELS = [
  { value: 'bg-opacity-20', label: '20%', hexLight: 'rgba(255,255,255,0.2)', hexDark: 'rgba(0,0,0,0.2)' },
  { value: 'bg-opacity-40', label: '40%', hexLight: 'rgba(255,255,255,0.4)', hexDark: 'rgba(0,0,0,0.4)' },
  { value: 'bg-opacity-60', label: '60%', hexLight: 'rgba(255,255,255,0.6)', hexDark: 'rgba(0,0,0,0.6)' },
  { value: 'bg-opacity-80', label: '80%', hexLight: 'rgba(255,255,255,0.8)', hexDark: 'rgba(0,0,0,0.8)' },
  { value: 'bg-opacity-95', label: '95%', hexLight: 'rgba(255,255,255,0.95)', hexDark: 'rgba(0,0,0,0.95)' },
];

// --- HJELPEFUNKSJONER ---
const getTodayStr = () => new Date().toISOString().split('T')[0];

const getNext14Days = () => {
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      id: d.toISOString().split('T')[0],
      display: d.toLocaleDateString('no-NO', { weekday: 'short', day: 'numeric', month: 'short' }),
      fullDisplay: d.toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' })
    });
  }
  return dates;
};

const calculateFontSize = (text, baseSizeId) => {
  if (!text) return 'text-6xl';
  const len = text.length;
  let sizes = {
    lvl1: { short: 'text-6xl', medium: 'text-5xl', long: 'text-4xl', xtra: 'text-3xl' },
    lvl2: { short: 'text-7xl', medium: 'text-6xl', long: 'text-5xl', xtra: 'text-3xl' },
    lvl3: { short: 'text-8xl', medium: 'text-7xl', long: 'text-5xl', xtra: 'text-4xl' },
    lvl4: { short: 'text-9xl', medium: 'text-8xl', long: 'text-6xl', xtra: 'text-4xl' },
    lvl5: { short: 'text-[11rem]', medium: 'text-9xl', long: 'text-7xl', xtra: 'text-5xl' }
  };
  const selectedSet = sizes[baseSizeId] || sizes['lvl3'];
  if (len < 12) return selectedSet.short;
  if (len < 25) return selectedSet.medium;
  if (len < 45) return selectedSet.long;
  return selectedSet.xtra;
};

// --- DISPLAY (TV-SKJERMEN) ---
function Display() {
  const [menu, setMenu] = useState({});
  const [isMenuLoaded, setIsMenuLoaded] = useState(false); // NY: Holder igjen visningen
  const today = getTodayStr();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('menuSettings');
    return saved ? JSON.parse(saved) : { 
      theme: 'light', 
      backgroundImage: null, 
      fontFamily: 'font-great-vibes',
      fontSize: 'lvl3',
      opacityLevel: 2 
    };
  });

  useEffect(() => {
    // Hent meny
    const unsubMenu = onSnapshot(doc(db, "restaurants", "dailyMenu"), (d) => {
      if (d.exists()) setMenu(d.data());
      setIsMenuLoaded(true); // Først NÅ slipper vi teksten løs!
    });
    
    // Hent innstillinger
    const unsubSettings = onSnapshot(doc(db, "restaurants", "settings"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSettings(data);
        localStorage.setItem('menuSettings', JSON.stringify(data));
      }
    });
    return () => { unsubMenu(); unsubSettings(); };
  }, []);

  const dayData = menu[today] || {};
  const isDark = settings.theme === 'dark';
  const currentBg = settings.backgroundImage; 
  const currentFont = settings.fontFamily || 'font-great-vibes';
  const opacityObj = OPACITY_LEVELS[settings.opacityLevel] || OPACITY_LEVELS[2];
  const bgStyle = isDark ? opacityObj.hexDark : opacityObj.hexLight;

  return (
    <div 
      className={`fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat ${!currentBg ? 'admin-background' : ''}`}
      style={currentBg ? { backgroundImage: `url('/${currentBg}')`, zIndex: 50 } : { zIndex: 50 }}
    >
      {currentBg && (
        <div className={`absolute inset-0 z-0 transition-all duration-1000 ${isDark ? 'bg-black/50' : 'bg-black/20'}`}></div>
      )}

      {/* GLASSBOKSEN */}
      <div 
        className={`
          relative z-10 w-[90vw] aspect-video max-h-[85vh]
          rounded-[3rem] text-center animate-fade-in transition-all duration-500
          backdrop-blur-xl border shadow-2xl flex flex-col justify-between py-10 px-6
          ${isDark ? 'border-white/10 text-white' : 'border-white/50 text-stone-900'}
        `}
        style={{ backgroundColor: bgStyle }}
      >
        <div className="flex-none pt-2">
             <span className={`text-2xl md:text-3xl uppercase tracking-[0.4em] font-sans font-bold ${isDark ? 'text-stone-300' : 'text-stone-800'}`}>
               Dagens Meny
             </span>
        </div>

        {/* MIDTEN: Viser kun innhold når isMenuLoaded er true */}
        <div className="flex-1 flex flex-col justify-center gap-4 md:gap-8 my-2 overflow-hidden w-full">
          {isMenuLoaded && (
            <>
              <MenuSection title="Forrett" dish={dayData.starter} fallback={settings.starter} delay="0s" isDark={isDark} font={currentFont} baseSize={settings.fontSize} />
              <MenuSection title="Hovedrett" dish={dayData.main} fallback={settings.main} delay="0.1s" isDark={isDark} font={currentFont} baseSize={settings.fontSize} />
              <MenuSection title="Dessert" dish={dayData.dessert} fallback={settings.dessert} delay="0.2s" isDark={isDark} font={currentFont} baseSize={settings.fontSize} />
            </>
          )}
        </div>

        <div className="flex-none pb-2">
            <p className={`text-4xl md:text-5xl ${currentFont} ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
              Velbekomme
            </p>
        </div>
      </div>
    </div>
  );
}

const MenuSection = ({ title, dish, fallback, delay, isDark, font, baseSize }) => {
  const text = dish || fallback || '...';
  const dynamicSizeClass = calculateFontSize(text, baseSize);

  return (
    <div className="opacity-0 animate-fade-in flex flex-col items-center justify-center w-full" style={{ animationDelay: delay }}>
      <h2 className={`text-xl md:text-2xl uppercase tracking-[0.25em] font-sans font-semibold mb-1 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
        {title}
      </h2>
      <div className="w-full px-2">
        <p className={`${dynamicSizeClass} ${font} leading-tight py-1 break-words ${isDark ? 'text-white' : 'text-stone-900'}`}>
          {text}
        </p>
      </div>
    </div>
  );
};

// --- PREVIEW ---
const PreviewScreen = ({ data, settings }) => {
  const isDark = settings.theme === 'dark';
  const currentBg = settings.backgroundImage || BACKGROUND_IMAGES[0];
  const currentFont = settings.fontFamily || 'font-great-vibes';
  const opacityObj = OPACITY_LEVELS[settings.opacityLevel] || OPACITY_LEVELS[2];
  const bgStyle = isDark ? opacityObj.hexDark : opacityObj.hexLight;
  
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-inner border border-stone-300">
      <div className="absolute inset-0 bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url('/${currentBg}')` }}></div>
      <div className={`absolute inset-0 ${isDark ? 'bg-black/50' : 'bg-black/20'}`}></div>
      <div className="absolute inset-0 flex items-center justify-center p-2">
         <div 
            className={`w-[90%] aspect-video rounded-lg flex flex-col items-center justify-between p-2 text-center backdrop-blur-sm border transition-all duration-300 ${isDark ? 'border-white/10 text-white' : 'border-white/50 text-stone-900'}`}
            style={{ backgroundColor: bgStyle }}
         >
            <div className={`text-[0.4rem] uppercase tracking-widest font-bold ${isDark ? 'text-stone-300' : 'text-stone-800'}`}>Dagens Meny</div>
            <div className="flex-1 flex flex-col justify-center gap-1 w-full">
              {['Forrett', 'Hovedrett', 'Dessert'].map((t) => {
                const key = t === 'Forrett' ? 'starter' : t === 'Hovedrett' ? 'main' : 'dessert';
                return (
                  <div key={key}>
                    <p className={`text-[0.35rem] font-bold uppercase tracking-widest mb-0 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{t}</p>
                    <p className={`text-lg ${currentFont} leading-tight truncate px-1`}>
                      {data[key] || settings[key] || '...'}
                    </p>
                  </div>
                )
              })}
            </div>
             <div className={`text-[0.5rem] ${currentFont} ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>Velbekomme</div>
         </div>
      </div>
    </div>
  );
};

// --- DASHBOARD ---
function Dashboard() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const displayUrl = window.location.origin + '/display';
  const handleCopy = () => { navigator.clipboard.writeText(displayUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="min-h-screen flex items-center justify-center p-6 admin-background">
      <div className="glass-panel p-12 rounded-3xl max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-serif font-bold text-stone-800">Velkommen</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button onClick={() => window.open('/display', '_blank')} className="group relative bg-white/50 hover:bg-white/80 p-8 rounded-2xl border border-white/60 transition-all shadow-sm hover:shadow-md text-left">
            <Monitor className="w-8 h-8 text-stone-700 mb-4" /><h3 className="font-bold text-lg text-stone-800">Se Skjerm</h3><p className="text-sm text-stone-500 mt-1">Åpne visningsmodus</p>
            <div onClick={(e) => { e.stopPropagation(); handleCopy(); }} className={`absolute top-4 right-4 p-2 rounded-full border transition-all ${copied ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-stone-200 text-stone-400 hover:text-stone-800'}`}>{copied ? <Check size={16} /> : <Copy size={16} />}</div>
          </button>
          <button onClick={() => navigate('/admin')} className="bg-stone-900 hover:bg-stone-800 text-white p-8 rounded-2xl transition-all shadow-lg hover:shadow-xl text-left">
            <Settings className="w-8 h-8 text-stone-300 mb-4" /><h3 className="font-bold text-lg">Administrer Meny</h3><p className="text-sm text-stone-400 mt-1">Gå til admin-panel</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ADMIN PANEL ---
function Admin() {
  const dates = getNext14Days();
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [fullMenu, setFullMenu] = useState({});
  const [settings, setSettings] = useState({ 
    starter: '', main: '', dessert: '', 
    theme: 'light', backgroundImage: BACKGROUND_IMAGES[0],
    fontFamily: 'font-great-vibes', fontSize: 'lvl3',
    opacityLevel: 2
  });
  const [activeTab, setActiveTab] = useState('daily');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub1 = onSnapshot(doc(db, "restaurants", "dailyMenu"), (d) => d.exists() && setFullMenu(d.data()));
    const unsub2 = onSnapshot(doc(db, "restaurants", "settings"), (d) => d.exists() && setSettings(d.data()));
    return () => { unsub1(); unsub2(); };
  }, []);

  const saveData = async (path, data) => { try { await setDoc(doc(db, "restaurants", path), data, { merge: true }); } catch (e) { console.error(e); } };
  const handleMenuChange = (field, val) => {
    const updatedDay = { ...(fullMenu[selectedDate.id] || {}), [field]: val };
    const updatedFullMenu = { ...fullMenu, [selectedDate.id]: updatedDay };
    setFullMenu(updatedFullMenu); saveData("dailyMenu", { [selectedDate.id]: updatedDay });
  };
  const handleSettingsChange = (field, val) => {
    const newSettings = { ...settings, [field]: val };
    setSettings(newSettings); saveData("settings", newSettings);
  };
  const currentDayData = fullMenu[selectedDate.id] || {};

  return (
    <div className="min-h-screen p-6 md:p-12 admin-background">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 flex justify-between items-center glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-4"><Link to="/" className="text-stone-500 hover:text-black transition-colors"><ChevronLeft /></Link><h1 className="text-2xl font-serif font-bold text-stone-800">Meny Admin</h1></div>
          <button onClick={() => { signOut(auth); navigate('/'); }} className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-bold bg-white/50 px-4 py-2 rounded-lg border border-white hover:bg-white transition-all"><LogOut size={16} /> Logg ut</button>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-stone-200/50 p-1 rounded-xl flex gap-1 shadow-inner max-w-md">
            <button onClick={() => setActiveTab('daily')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'daily' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}><Calendar size={16} /> Daglig Meny</button>
            <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}><Settings size={16} /> Innstillinger</button>
          </div>

          {activeTab === 'settings' ? (
            <div className="glass-panel p-8 rounded-3xl animate-fade-in space-y-10">
              <div>
                <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2"><Maximize size={18} /> Tekststørrelse (5 Nivåer)</h2>
                <div className="flex gap-2 mb-4 bg-stone-100 p-2 rounded-lg overflow-x-auto">
                   {SIZES.map(s => (
                     <button key={s.id} onClick={() => handleSettingsChange('fontSize', s.id)} className={`flex-1 min-w-[80px] px-2 py-2 rounded text-xs font-bold transition-all ${settings.fontSize === s.id ? 'bg-stone-800 text-white shadow' : 'text-stone-500 hover:bg-white hover:text-stone-900'}`}>{s.label}</button>
                   ))}
                </div>
                <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2 mt-8"><Type size={18} /> Skrifttype</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FONTS.map((font) => (
                    <button key={font.id} onClick={() => handleSettingsChange('fontFamily', font.id)} className={`p-3 rounded-lg border-2 text-center transition-all ${settings.fontFamily === font.id ? 'border-stone-800 bg-white shadow-md' : 'border-transparent bg-white/50 hover:bg-white'}`}><span className={`text-xl block mb-1 ${font.id} text-stone-800`}>Aa</span><span className="text-[10px] uppercase font-bold text-stone-400">{font.name}</span></button>
                  ))}
                </div>
              </div>
              <div className="border-t border-stone-200"></div>
              <div>
                <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2"><Sun size={18} /> Utseende & Gjennomsiktighet</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button onClick={() => handleSettingsChange('theme', 'light')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${settings.theme !== 'dark' ? 'border-stone-800 bg-stone-100' : 'border-transparent bg-white/50 hover:bg-white'}`}><div className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-sm"></div><span className="font-bold text-stone-700">Lys Glass</span></button>
                  <button onClick={() => handleSettingsChange('theme', 'dark')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${settings.theme === 'dark' ? 'border-stone-800 bg-stone-800 text-white' : 'border-transparent bg-white/50 hover:bg-white'}`}><div className="w-8 h-8 rounded-full bg-stone-900 border border-stone-700 shadow-sm"></div><span className={`font-bold ${settings.theme === 'dark' ? 'text-white' : 'text-stone-700'}`}>Mørk Glass</span></button>
                </div>
                <div>
                   <label className="text-xs uppercase font-bold text-stone-500 block mb-2"><Eye size={12} className="inline mr-1"/> Glass Gjennomsiktighet</label>
                   <div className="flex gap-2">
                      {OPACITY_LEVELS.map((level, index) => (
                         <button key={index} onClick={() => handleSettingsChange('opacityLevel', index)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${settings.opacityLevel === index ? 'bg-stone-800 text-white border-stone-800' : 'bg-white/50 text-stone-600 border-stone-200 hover:bg-white'}`}>{level.label}</button>
                      ))}
                   </div>
                </div>
              </div>
              <div className="border-t border-stone-200"></div>
              <div>
                <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2"><ImageIcon size={18} /> Bakgrunnsbilde</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BACKGROUND_IMAGES.map((img) => (
                    <button key={img} onClick={() => handleSettingsChange('backgroundImage', img)} className={`relative group rounded-lg overflow-hidden aspect-video border-2 transition-all ${settings.backgroundImage === img ? 'border-stone-800 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}><img src={`/${img}`} alt={img} className="w-full h-full object-cover" />{settings.backgroundImage === img && (<div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Check className="text-white drop-shadow-md" size={24} /></div>)}<div className="absolute bottom-0 w-full bg-black/50 text-white text-[9px] py-1 truncate px-2">{img.replace('.jpg', '').replace('.png', '').replace(/_/g, ' ')}</div></button>
                  ))}
                </div>
              </div>
              <div className="border-t border-stone-200"></div>
              <div>
                <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2"><FileText size={18} /> Standardtekster (Fallback)</h2>
                <div className="space-y-4">
                  {['starter', 'main', 'dessert'].map((key) => (<div key={key}><label className="text-xs uppercase font-bold text-stone-500 block mb-2">{key === 'starter' ? 'Forrett' : key === 'main' ? 'Hovedrett' : 'Dessert'}</label><input value={settings[key] || ''} onChange={(e) => handleSettingsChange(key, e.target.value)} className="w-full glass-input p-4 rounded-xl text-stone-800" placeholder="Fyll inn standard..." /></div>))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl animate-fade-in">
              <div className="flex overflow-x-auto gap-3 pb-6 mb-4 border-b border-stone-200/50 scrollbar-hide">
                {dates.map((date) => (<button key={date.id} onClick={() => setSelectedDate(date)} className={`flex-shrink-0 px-5 py-3 rounded-xl transition-all border ${selectedDate.id === date.id ? 'bg-stone-800 text-white scale-105 shadow-md' : 'bg-white/40 text-stone-600 border-white hover:bg-white'}`}><div className="text-xs uppercase opacity-70">{date.display.split(' ')[0]}</div><div className="font-bold text-lg">{date.display.split(' ')[1]}</div></button>))}
              </div>
              <h2 className="text-xl font-serif text-stone-800 mb-6 capitalize">{selectedDate.fullDisplay}</h2>
              <div className="space-y-6">
                {['starter', 'main', 'dessert'].map((key) => (<div key={key}><div className="flex justify-between mb-2"><label className="text-xs uppercase font-bold text-stone-500">{key === 'starter' ? 'Forrett' : key === 'main' ? 'Hovedrett' : 'Dessert'}</label>{!currentDayData[key] && settings[key] && <span className="text-[10px] text-stone-400 italic bg-stone-100 px-2 rounded border border-stone-200">Bruker standard</span>}</div><input value={currentDayData[key] || ''} onChange={(e) => handleMenuChange(key, e.target.value)} className="w-full glass-input p-4 rounded-xl text-lg font-serif text-stone-900" placeholder={settings[key] ? `(Standard: ${settings[key]})` : "Skriv retten her..."} /></div>))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
           <div className="sticky top-6">
              <div className="flex items-center gap-2 mb-4 ml-2"><Monitor size={16} className="text-stone-500"/><span className="text-xs font-bold uppercase text-stone-500">Live Preview</span></div>
              <div className="relative group rounded-xl overflow-hidden shadow-xl border-4 border-stone-800 bg-stone-200"><PreviewScreen data={currentDayData} settings={settings} /></div>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- LOGIN ---
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  useEffect(() => { if (auth.currentUser) navigate('/admin'); }, [navigate]);
  const handleLogin = async (e) => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, email, password); navigate('/admin'); } catch (err) { alert('Feil passord'); }};
  return (<div className="min-h-screen flex items-center justify-center p-6 admin-background"><div className="glass-panel p-10 rounded-3xl w-full max-w-md text-center"><h1 className="text-2xl font-serif font-bold text-stone-800 mb-8">Kokkens Innlogging</h1><form onSubmit={handleLogin} className="space-y-4"><input type="email" placeholder="E-post" className="w-full glass-input p-4 rounded-xl" value={email} onChange={e => setEmail(e.target.value)} /><input type="password" placeholder="Passord" className="w-full glass-input p-4 rounded-xl" value={password} onChange={e => setPassword(e.target.value)} /><button type="submit" className="w-full bg-stone-900 text-white p-4 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg mt-4">Logg inn</button></form><Link to="/" className="block mt-6 text-sm text-stone-500 hover:text-stone-800">Tilbake til dashboard</Link></div></div>);
}

// --- APP & ROUTING ---
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }); }, []);
  if (loading) return null;
  if (!user) return <Login />;
  return children;
};

export default function App() {
  return (<BrowserRouter><Routes><Route path="/" element={<Dashboard />} /><Route path="/display" element={<Display />} /><Route path="/login" element={<Login />} /><Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} /></Routes></BrowserRouter>);
}