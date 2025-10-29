import { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, HelpCircle, Trophy, Users, ShieldCheck, Zap, Server, ChevronsRight, Wind, AlertTriangle, Repeat, BookOpen, ArrowLeft } from 'lucide-react';
import './LayerUpGame.css';
import LayerUpLogo from './assets/LayerUpLogo.png';


const LayerUpGame = () => {
    // Sabitler: Katmanlar ve Özel Kartlar (Değişiklik yok)
    const LAYERS = useMemo(() => ({
        7: { name: 'Uygulama', color: '#10b981', cards: ['HTTP', 'FTP', 'DNS', 'SMTP'] },
        6: { name: 'Sunum', color: '#8b5cf6', cards: ['SSL/TLS', 'JPEG', 'MPEG', 'ASCII'] },
        5: { name: 'Oturum', color: '#f97316', cards: ['NetBIOS', 'SAP', 'PPTP', 'RPC'] },
        4: { name: 'Taşıma', color: '#3b82f6', cards: ['TCP', 'UDP', 'Segment', 'Port'] },
        3: { name: 'Ağ', color: '#ef4444', cards: ['IP', 'ICMP', 'Router', 'Paket'] },
        2: { name: 'Veri Bağlantı', color: '#eab308', cards: ['Ethernet', 'MAC Adresi', 'Switch', 'Frame'] },
        1: { name: 'Fiziksel', color: '#6b7280', cards: ['Fiber Kablo', 'Bakır Kablo', 'Hub', 'Bit'] }
    }), []);

    const SPECIAL_CARDS = [
        { id: 'router', name: 'Router', layer: 3, type: 'direction', desc: 'Yön Değiştir', Icon: Wind },
        { id: 'switch', name: 'Switch', layer: 2, type: 'skip', desc: 'Pas Geç', Icon: ChevronsRight },
        { id: 'hub', name: 'Hub', layer: 1, type: 'draw1all', desc: 'Herkes 1 Çeker', Icon: Users },
        { id: 'firewall', name: 'Firewall', layer: 0, type: 'wild', desc: 'Joker & Engelle', Icon: ShieldCheck },
        { id: 'ddos', name: 'DDoS Attack', layer: 0, type: 'draw4', desc: '+4 Kart Çek & Renk Seç', Icon: Zap },
        { id: 'packetloss', name: 'Packet Loss', layer: 0, type: 'draw2', desc: '+2 Kart Çek & Renk Seç', Icon: AlertTriangle },
        { id: 'upgrade', name: 'Network Upgrade', layer: 0, type: 'swap', desc: 'El Değiştir & Renk Seç', Icon: Repeat }
    ];

    // Eğitici Kütüphane İçeriği (Değişiklik yok)
    const LIBRARY_CONTENT = useMemo(() => ({
        7: {
            name: 'Uygulama Katmanı (Application Layer)',
            description: 'Kullanıcıların doğrudan etkileşimde bulunduğu katman. Web tarayıcıları, e-posta istemcileri ve diğer uygulamalar bu katmanda çalışır.',
            protocols: {
                'HTTP': 'Web sayfalarını görüntülemek için kullanılır. Tarayıcınız web sunucusundan sayfaları bu protokol ile alır.',
                'FTP': 'Dosya transferi için kullanılır. Büyük dosyaları internet üzerinden güvenli şekilde gönderir.',
                'DNS': 'Web adreslerini (google.com) IP adreslerine (142.250.191.14) çevirir. İnternetin telefon rehberi gibi.',
                'SMTP': 'E-posta göndermek için kullanılır. E-postalarınız bu protokol ile ulaşır.'
            }
        },
        6: {
            name: 'Sunum Katmanı (Presentation Layer)',
            description: 'Verinin formatını ve şifrelemesini yönetir. Verilerin anlaşılabilir formatta iletilmesini sağlar.',
            protocols: {
                'SSL/TLS': 'Güvenli bağlantı sağlar. Kredi kartı bilgileriniz bu protokol ile korunur.',
                'JPEG': 'Fotoğrafları sıkıştırır. Web sayfalarında görüntülerin hızlı yüklenmesini sağlar.',
                'MPEG': 'Video dosyalarını sıkıştırır. YouTube videoları bu format ile çalışır.',
                'ASCII': 'Metin karakterlerini sayısal değerlere çevirir. Klavyenizdeki her tuş bir ASCII kodu üretir.'
            }
        },
        5: {
            name: 'Oturum Katmanı (Session Layer)',
            description: 'İki cihaz arasındaki bağlantıyı yönetir. Oturum açma, kapatma ve yeniden bağlanma işlemlerini kontrol eder.',
            protocols: {
                'NetBIOS': 'Yerel ağdaki bilgisayarların birbirini bulmasını sağlar. Ev ağınızda dosya paylaşımı için kullanılır.',
                'SAP': 'İş uygulamaları arasında veri alışverişi sağlar. Büyük şirketlerde kullanılır.',
                'PPTP': 'Güvenli tünel oluşturur. VPN bağlantıları bu protokol ile çalışır.',
                'RPC': 'Uzaktan işlem çağrıları yapar. Bir bilgisayardan diğerine komut göndermeyi sağlar.'
            }
        },
        4: {
            name: 'Taşıma Katmanı (Transport Layer)',
            description: 'Verilerin güvenilir şekilde ulaşmasını sağlar. Hata kontrolü ve akış kontrolü yapar.',
            protocols: {
                'TCP': 'Güvenilir veri iletimi sağlar. E-postalar ve web sayfaları bu protokol ile ulaşır.',
                'UDP': 'Hızlı veri iletimi sağlar. Canlı video yayınları ve oyunlar için kullanılır.',
                'Segment': 'Büyük veri paketlerini küçük parçalara böler. Posta kutusuna sığmayan büyük paket gibi.',
                'Port': 'Farklı uygulamaları ayırt eder. Her uygulama farklı kapı numarası kullanır.'
            }
        },
        3: {
            name: 'Ağ Katmanı (Network Layer)',
            description: 'Verilerin en iyi yolu bulup ulaştırılmasını sağlar. Adresleme ve yönlendirme yapar.',
            protocols: {
                'IP': 'İnternetin adres sistemi. Her cihazın benzersiz IP adresi vardır.',
                'ICMP': 'Ağ durumunu kontrol eder. Ping komutu bu protokol ile çalışır.',
                'Router': 'Veri paketlerini doğru yöne yönlendirir. İnternetin trafik polisi gibi.',
                'Paket': 'Verilerin küçük parçalar halinde gönderilmesi. Büyük mektubu küçük zarflara bölmek gibi.'
            }
        },
        2: {
            name: 'Veri Bağlantı Katmanı (Data Link Layer)',
            description: 'Fiziksel bağlantı üzerinden veri iletimini sağlar. Hata tespiti ve düzeltmesi yapar.',
            protocols: {
                'Ethernet': 'Yerel ağ bağlantısı sağlar. Ev ve ofis ağlarında kullanılır.',
                'MAC Adresi': 'Her ağ kartının benzersiz kimliği. Parmak izi gibi eşsizdir.',
                'Switch': 'Ağ trafiğini yönetir. Akıllı dağıtım kutusu gibi çalışır.',
                'Frame': 'Veri paketlerinin çerçevelenmesi. Mektubun zarfa konulması gibi.'
            }
        },
        1: {
            name: 'Fiziksel Katman (Physical Layer)',
            description: 'Gerçek veri iletimini sağlar. Elektrik sinyalleri, ışık veya radyo dalgaları kullanır.',
            protocols: {
                'Fiber Kablo': 'Işık sinyalleri ile veri iletir. Çok hızlı ve uzun mesafe iletimi sağlar.',
                'Hub': 'Basit veri dağıtıcısı. Gelen veriyi tüm portlara gönderir.',
                'Bit': 'Verinin en küçük birimi. 0 ve 1\'lerden oluşan dijital sinyaller.'
            }
        }
    }), []);

    // Oyunun durumunu yöneten state'ler
    const [deck, setDeck] = useState([]);
    const [discardPile, setDiscardPile] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [direction, setDirection] = useState(1);
    const [gameStarted, setGameStarted] = useState(false);
    const [playerCount, setPlayerCount] = useState(4);
    const [showRules, setShowRules] = useState(false);
    const [message, setMessage] = useState('');
    const [selectingColor, setSelectingColor] = useState(false);
    const [selectingPlayer, setSelectingPlayer] = useState(false);
    const [winner, setWinner] = useState(null);
    const [drawStack, setDrawStack] = useState(0);
    const [drawGame, setDrawGame] = useState(false);
    const [turnCount, setTurnCount] = useState(0);
    const [showLibrary, setShowLibrary] = useState(false);
    const [messageTimeout, setMessageTimeout] = useState(null);

    // Mesaj sistemini yöneten fonksiyon
    const setMessageWithTimeout = useCallback((newMessage, duration = 2000) => {
        if (messageTimeout) clearTimeout(messageTimeout);
        setMessage(newMessage);
        const timeout = setTimeout(() => setMessage(''), duration);
        setMessageTimeout(timeout);
    }, [messageTimeout]);

    // OYUN MANTIĞI FONKSİYONLARI
    const shuffleDeck = (cards) => {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const createDeck = () => {
        const cards = [];
        let id = 0;
        Object.keys(LAYERS).forEach(layer => {
            LAYERS[layer].cards.forEach(cardName => {
                for (let i = 0; i < 2; i++) {
                    cards.push({ id: id++, name: cardName, layer: parseInt(layer), type: 'normal', color: LAYERS[layer].color });
                }
            });
        });
        SPECIAL_CARDS.forEach(special => {
            const updatedSpecial = { ...special };
            if (['draw4', 'draw2', 'swap'].includes(updatedSpecial.type)) {
                updatedSpecial.desc = `${updatedSpecial.desc.split('&')[0].trim()} & Renk Seç`;
            }
            for (let i = 0; i < 4; i++) {
                cards.push({ ...updatedSpecial, id: id++, color: special.layer > 0 ? LAYERS[special.layer].color : '#1f2937' });
            }
        });
        return shuffleDeck(cards);
    };

    const startGame = () => {
        const newDeck = createDeck();
        const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
            id: i,
            name: i === 0 ? 'Siz' : `Oyuncu ${i + 1}`,
            hand: newDeck.splice(0, 7),
            saidLayerUp: false
        }));
        let firstCard;
        const cardIndex = newDeck.findIndex(card => card.type === 'normal');
        if (cardIndex !== -1) {
            firstCard = newDeck.splice(cardIndex, 1)[0];
        } else {
            firstCard = newDeck.shift();
        }
        setPlayers(newPlayers);
        setDeck(newDeck);
        setDiscardPile(firstCard ? [firstCard] : []);
        setCurrentPlayer(0);
        setDirection(1);
        setGameStarted(true);
        setWinner(null);
        setMessageWithTimeout('Oyun başladı! Sıra sizde.', 3000);
        setDrawStack(0);
        setDrawGame(false);
        setTurnCount(0);
        setShowLibrary(false);
    };

    const drawFromDeck = useCallback((count, currentDeck, currentDiscard) => {
        let newDeck = [...currentDeck];
        let newDiscard = [...currentDiscard];
        const drawn = [];
        let isDraw = false;

        if (count === 0) return { drawn, finalDeck: newDeck, finalDiscard: newDiscard , isDraw };

        for (let i = 0; i < count; i++) {
            if (newDeck.length === 0) {
                    isDraw = true;
                    break;
                }
            drawn.push(newDeck.shift());
        }
        return { drawn, finalDeck: newDeck, finalDiscard: newDiscard, isDraw };
    }, []);

    const quitGame = () => {
        if (messageTimeout) {
            clearTimeout(messageTimeout)
        }
        setGameStarted(false)
        setWinner(null)
        setDrawGame(false)
        setDeck([])
        setDiscardPile([])
        setPlayers([])
        setCurrentPlayer(0)
        setDirection(1)
        setMessage('')
        setSelectingColor(false)
        setSelectingPlayer(false);
        setDrawStack(0);
        setTurnCount(0);
        setShowRules(false);
    }

    const canPlayCard = useCallback((card) => {
        if (!card) return false;
        const topCard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
        if (!topCard) return true;
        if (drawStack > 0) {
            return card.type === 'draw2' || card.type === 'draw4' || (card.type === 'wild' && card.name === 'Firewall');
        }
        return card.type === 'wild' || card.type === 'draw4' || card.type === 'swap' || card.type === 'draw2' || card.layer === topCard.layer || card.name === topCard.name;
    }, [discardPile, drawStack]);

    const handleCardEffect = useCallback((card, playerIndex) => {
        // Kazananı anında kontrol et
        const playerHand = players[playerIndex]?.hand;
        if (playerHand && playerHand.length === 0) {
            setWinner(players[playerIndex]);
            return;
        }

        let nextPlayer = (playerIndex + direction + playerCount) % playerCount;

        const handleColorSelection = () => {
            if (playerIndex === 0) {
                setSelectingColor(true);
                return true;
            }
            const randomLayer = Math.floor(Math.random() * 7) + 1;
            const topCard = { ...card, layer: randomLayer, color: LAYERS[randomLayer].color };
            setDiscardPile(prev => [...prev.slice(0, -1), topCard]);
            return false;
        };

        switch (card.type) {
            case 'direction':
                const newDirection = direction * -1;
                setDirection(newDirection);
                nextPlayer = (playerIndex + newDirection + playerCount) % playerCount;
                break;
            case 'skip':
                nextPlayer = (nextPlayer + direction + playerCount) % playerCount;
                break;
            case 'draw1all':
                const { drawn, finalDeck, finalDiscard } = drawFromDeck(playerCount - 1, deck, discardPile);
                setDeck(finalDeck);
                setDiscardPile(finalDiscard);
                if (drawn.length > 0) {
                    const drawnCopy = [...drawn];
                    setPlayers(currentPlayers =>
                        currentPlayers.map((p, i) =>
                            i !== playerIndex ? { ...p, hand: [...p.hand, drawnCopy.shift()].filter(Boolean) } : p
                        )
                    );
                }
                break;
            case 'wild':
                setDrawStack(0);
                if (handleColorSelection()) return;
                break;
            case 'draw2':
                setDrawStack(prev => prev + 2);
                if (handleColorSelection()) return;
                break;
            case 'draw4':
                setDrawStack(prev => prev + 4);
                if (handleColorSelection()) return;
                break;
            case 'swap':
                if (playerCount > 2) {
                    if (playerIndex === 0) {
                        setSelectingPlayer(true);
                        return;
                    }
                    let targetIndex;
                    do { targetIndex = Math.floor(Math.random() * playerCount); } while (targetIndex === playerIndex);
                    setPlayers(currentPlayers => {
                        const newPlayers = [...currentPlayers];
                        [newPlayers[playerIndex].hand, newPlayers[targetIndex].hand] = [newPlayers[targetIndex].hand, newPlayers[playerIndex].hand];
                        return newPlayers;
                    });
                    const randomLayer = Math.floor(Math.random() * 7) + 1;
                    const topCardWithColor = { ...card, layer: randomLayer, color: LAYERS[randomLayer].color };
                    setDiscardPile(prev => [...prev.slice(0, -1), topCardWithColor]);
                }
                break;
            default: break;
        }

        setTimeout(() => setCurrentPlayer(nextPlayer), playerIndex !== 0 ? 800 : 0);
        setTurnCount(prev => prev + 1);

        if (turnCount > 100) {
            setDrawGame(true);
            setMessageWithTimeout('Oyun berabere! Çok fazla tur geçti.', 5000);
        }
    }, [direction, playerCount, turnCount, LAYERS, players, deck, discardPile, drawFromDeck, setMessageWithTimeout]);

    const playCard = (cardIndex) => {
        if (currentPlayer !== 0 || selectingColor || selectingPlayer) return;
        const card = players[0].hand[cardIndex];
        if (!canPlayCard(card)) {
            setMessageWithTimeout('Bu kartı oynayamazsınız!', 1500);
            return;
        }
        const newHand = players[0].hand.filter((_, idx) => idx !== cardIndex);
        setPlayers(prev => prev.map((p, i) => i === 0 ? { ...p, hand: newHand, saidLayerUp: false } : p));
        setDiscardPile(dp => [...dp, card]);
        handleCardEffect(card, 0);
    };

    const drawCard = () => {
        if (currentPlayer !== 0) return;
        const toDraw = drawStack > 0 ? drawStack : 1;

        // 1. Hesaplamayı bir kez yap
        const { drawn, finalDeck, finalDiscard, isDraw } = drawFromDeck(toDraw, deck, discardPile);

        if (isDraw) {
            setDrawGame(true);
            setMessageWithTimeout('Oyun berabere! Kartlar bitti.', 5000);
            return;
        }

        // 2. Tüm state'leri sıralı olarak güncelle (React 18 bunları birleştirir)
        setDeck(finalDeck);
        setDiscardPile(finalDiscard);

        if (drawn.length > 0) {
            setPlayers(prev => prev.map((p, i) => i === 0 ? { ...p, hand: [...p.hand, ...drawn], saidLayerUp: false } : p));
        }

        if (drawStack > 0) {
            setDrawStack(0);
        }

        // 3. Sırayı geçir
        // Çekilen kart oynanamıyorsa, ceza çekildiyse veya hiç kart çekilemediyse sıra geçer.
        if (drawStack > 0 || drawn.length === 0 || !canPlayCard(drawn[0])) {
            setCurrentPlayer(p => (p + direction + playerCount) % playerCount);
        }
    };

    const aiTurn = useCallback(() => {
        if (!players[currentPlayer]) return;
        const player = players[currentPlayer];

        const executeDraw = (drawCount) => {
            // 1. Hesaplamayı bir kez yap
            const { drawn, finalDeck, finalDiscard, isDraw } = drawFromDeck(drawCount, deck, discardPile);

            if (isDraw) {
                setDrawGame(true);
                setMessageWithTimeout('Oyun berabere! Kartlar bitti.', 5000);
                return;
            }
            // 2. State'leri güncelle
            setDeck(finalDeck);
            setDiscardPile(finalDiscard);

            if (drawn.length > 0) {
                setPlayers(prev => prev.map((p, i) =>
                    i === currentPlayer ? { ...p, hand: [...p.hand, ...drawn] } : p
                ));
            }
            if (drawStack > 0) {
                setDrawStack(0);
            }

            // 3. Sırayı geçir
            setTimeout(() => setCurrentPlayer(p => (p + direction + playerCount) % playerCount), 1000);
        };

        if (drawStack > 0) {
            const defenseCardIndex = player.hand.findIndex(c => canPlayCard(c));
            if (defenseCardIndex !== -1) {
                const card = player.hand[defenseCardIndex];
                setPlayers(prev => prev.map((p, i) => i === currentPlayer ? { ...p, hand: p.hand.filter((_, idx) => idx !== defenseCardIndex) } : p));
                setDiscardPile(prev => [...prev, card]);
                handleCardEffect(card, currentPlayer);
            } else {
                executeDraw(drawStack);
            }
        } else {
            const playableIndex = player.hand.findIndex(c => canPlayCard(c));
            if (playableIndex !== -1) {
                const card = player.hand[playableIndex];
                setPlayers(prev => prev.map((p, i) => i === currentPlayer ? { ...p, hand: p.hand.filter((_, idx) => idx !== playableIndex) } : p));
                setDiscardPile(prev => [...prev, card]);
                handleCardEffect(card, currentPlayer);
            } else {
                executeDraw(1);
            }
        }
    }, [players, currentPlayer, drawStack, direction, playerCount, canPlayCard, handleCardEffect, deck, discardPile, drawFromDeck, setMessageWithTimeout]);

    useEffect(() => {
        if (gameStarted && currentPlayer !== 0 && !winner && !selectingColor && !selectingPlayer && !drawGame) {
            const timeoutId = setTimeout(() => {
                aiTurn();
            }, 1500);
            return () => clearTimeout(timeoutId);
        }
    }, [currentPlayer, gameStarted, winner, selectingColor, selectingPlayer, drawGame, aiTurn]);

    const selectColor = (layer) => {
        const wildCard = discardPile[discardPile.length - 1];
        const coloredCard = { ...wildCard, layer, color: LAYERS[layer].color };
        setDiscardPile(prev => [...prev.slice(0, -1), coloredCard]);
        setSelectingColor(false);
        setCurrentPlayer(p => (p + direction + playerCount) % playerCount);
    };

    const selectPlayerForSwap = (targetIndex) => {
        setPlayers(prevPlayers => {
            const newPlayers = [...prevPlayers];
            [newPlayers[0].hand, newPlayers[targetIndex].hand] = [newPlayers[targetIndex].hand, newPlayers[0].hand];
            return newPlayers;
        });
        setSelectingPlayer(false);
        setSelectingColor(true);
    };

    const sayLayerUp = () => { setMessageWithTimeout("Layer Up! 📡", 2000) };

    // RENDER BÖLÜMÜ
    const Card = ({ card, onClick, small = false, highlight = false, faceDown = false }) => {
        if (faceDown) return <div onClick={onClick} className="card card-facedown"><Server className="card-server-icon" /></div>;
        if (!card) return <div className="card-placeholder"></div>;

        const { Icon } = card;
        const cardClasses = `card ${highlight ? 'card-highlight' : ''} ${small ? 'card-small' : ''}`;
        return (
            <div onClick={onClick} className={cardClasses} style={{ backgroundColor: card.color }}>
                <div className="card-inner">
                    <div className="card-header">{card.layer > 0 ? `L${card.layer}` : '★'}</div>
                    <div className="card-content">
                        {Icon && <Icon className="card-icon" />}
                        <div className="card-name">{card.name}</div>
                        {card.desc && !Icon && <div className="card-desc">{card.desc}</div>}
                    </div>
                    <div className="card-footer">{card.layer > 0 ? `L${card.layer}` : '★'}</div>
                </div>
            </div>
        );
    };

    if (showLibrary) {
        return (
            <div className="game-container">
                <div className="library-screen">
                    <div className="library-header">
                        <button onClick={() => setShowLibrary(false)} className="back-button"><ArrowLeft size={20} /> Geri Dön</button>
                        <h1 className="title">OSI Katmanları Kütüphanesi 📚</h1>
                        <p className="subtitle">Ağ teknolojilerini öğrenin ve kartlarınızı bilinçli oynayın!</p>
                    </div>
                    <div className="library-content">
                        {Object.keys(LIBRARY_CONTENT).reverse().map(layerNum => {
                            const layer = LIBRARY_CONTENT[layerNum];
                            return (
                                <div key={layerNum} className="layer-section" style={{ borderLeft: `5px solid ${LAYERS[layerNum].color}` }}>
                                    <div className="layer-header">
                                        <h2 style={{ color: LAYERS[layerNum].color }}>Katman {layerNum}: {layer.name}</h2>
                                        <p className="layer-description">{layer.description}</p>
                                    </div>
                                    <div className="protocols-grid">
                                        {Object.entries(layer.protocols).map(([protocol, description]) => (
                                            <div key={protocol} className="protocol-card">
                                                <h4 className="protocol-name">{protocol}</h4>
                                                <p className="protocol-description">{description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="library-footer"><button onClick={() => setShowLibrary(false)} className="start-button">Oyuna Dön</button></div>
                </div>
            </div>
        );
    }

    if (!gameStarted) {
        return (
            <div className="game-container">
                <div className="start-menu">
                    <div className="start-menu-header">
                        <img src={LayerUpLogo} alt='LayerUP Logo' className="game-logo" />
                        <h1 className="title">Layer Up!</h1>
                        <p className="subtitle">"Yığını Tırman, Veriyi Ulaştır!"</p>
                    </div>
                    <div className="player-select-container">
                        <div className="player-select">
                            <Users className="player-select-icon" />
                            <label>Oyuncu Sayısı:</label>
                            <select value={playerCount} onChange={(e) => setPlayerCount(parseInt(e.target.value))}>
                                {[2, 3, 4, 5, 6].map(n => (<option key={n} value={n}>{n} Oyuncu</option>))}
                            </select>
                        </div>
                    </div>
                    <button onClick={startGame} className="start-button">Oyunu Başlat</button>
                    <button onClick={() => setShowRules(!showRules)} className="rules-button"><HelpCircle size={20} />Oyun Kuralları</button>
                    <button onClick={() => setShowLibrary(true)} className="library-button"><BookOpen size={20} />Kütüphane</button>
                    {showRules && (
                        <div className="rules-display">
                            <h3>Nasıl Oynanır?</h3>
                            <ul>{SPECIAL_CARDS.map(c => <li key={c.id}><strong>{c.name}:</strong> {c.desc}</li>)}</ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (winner) {
        return (
            <div className="game-container">
                <div className="winner-screen">
                    <Trophy className="winner-icon" />
                    <h1 className="title">{winner.name} Kazandııı! 🎉</h1>
                    <p>Tebrikler! Tüm katmanları başarıyla geçtiniz! Tebrikler!</p>
                    <button onClick={startGame} className="start-button">Yeni Oyun</button>
                    <button onClick={quitGame} className="quit-button">Ana Menü</button>
                </div>
            </div>
        );
    }

    if (drawGame) {
        return (
            <div className="game-container">
                <div className="winner-screen">
                    <AlertTriangle className="winner-icon" />
                    <h1 className="title">Oyun Berabere! 🤝</h1>
                    <p>Kartlar bitti veya oyun çok uzun sürdü. Yeni bir oyun başlatın!</p>
                    <button onClick={startGame} className="start-button">Yeni Oyun</button>
                    <button onClick={quitGame} className="quit-button">Ana Menü</button>
                </div>
            </div>
        );
    }

    const topCard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
    const playerHand = players.length > 0 ? players[0].hand : [];
    const cardCount = playerHand.length;
    const handThreshold = 13;

    let cardSpacing = 40;
    let cardRotation = 5;
    if (cardCount > handThreshold) {
        const compressionFactor = handThreshold / cardCount;
        cardSpacing = Math.max(18, 40 * compressionFactor);
        cardRotation = Math.max(1.5, 5 * compressionFactor);
    }

    return (
        <div className="game-board">
            {selectingColor && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>Bir Katman Seç</h3>
                        <div className="color-picker">
                            {Object.keys(LAYERS).map(l => (
                                <button key={l} onClick={() => selectColor(parseInt(l))} style={{ backgroundColor: LAYERS[l].color }}>L{l}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {selectingPlayer && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>El Değiştirmek İçin Bir Oyuncu Seç</h3>
                        <div className="player-swap-picker">
                            {players.map((p, i) => i !== 0 && (<button key={p.id} onClick={() => selectPlayerForSwap(i)}>{p.name}</button>))}
                        </div>
                    </div>
                </div>
            )}

            <div className="game-area">
                {players.map((player, index) => {
                    if (index === 0) return null;
                    const posStyles = {
                        2: { 1: 'pos-top-center' },
                        3: { 1: 'pos-left-center', 2: 'pos-top-center' },
                        4: { 1: 'pos-left-center', 2: 'pos-top-center', 3: 'pos-right-center' },
                        5: { 1: 'pos-left-center', 2: 'pos-top-left', 3: 'pos-top-right', 4: 'pos-right-center' },
                        6: { 1: 'pos-left-top', 2: 'pos-left-bottom', 3: 'pos-top-center', 4: 'pos-right-top', 5: 'pos-right-bottom' },
                    };
                    const posClass = posStyles[playerCount]?.[index] || 'pos-top-center';
                    return (
                        <div key={player.id} className={`opponent-info ${posClass}`}>
                            <div className={`opponent-box ${currentPlayer === index ? 'opponent-box-active' : ''}`}>
                                <div className="opponent-name">{player.name}</div>
                                <div className="opponent-card-count">{player.hand.length} Kart</div>
                            </div>
                        </div>
                    );
                })}

                <div className="center-area">
                    <div className="deck-area">
                        <Card faceDown onClick={drawCard} />
                        <div className="deck-count">{deck.length} Kart</div>
                    </div>
                    <div className="pile-area">
                        <Card card={topCard} />
                        <div className="deck-count">Oyun Yığını</div>
                    </div>
                </div>

                <div className="message-area">
                    {message || (players.length > 0 && (currentPlayer === 0 ? 'Sıra sizde' : (players[currentPlayer] ? `Sıradaki: ${players[currentPlayer].name}` : '')))}
                    {drawStack > 0 && <div className="attack-message">+{drawStack} SALDIRISI!</div>}
                </div>

                <div className="controls-area">
                    <button onClick={quitGame} className="quit-button">Ana Menü</button>
                    <button onClick={startGame} className="restart-button"><RotateCcw /></button>
                    <button onClick={() => setShowLibrary(true)} className="library-button"><BookOpen size={20} />Kütüphane</button>
                </div>

                <div className="player-area">
                    <div className="player-hand">
                        {playerHand.map((card, i) => (
                            <div key={`card-${card.id}`} className="card-wrapper" style={{
                                transform: `translateX(${(i - (cardCount - 1) / 2) * cardSpacing}px) rotate(${(i - (cardCount - 1) / 2) * cardRotation}deg)`
                            }}>
                                <Card card={card} onClick={() => playCard(i)} highlight={canPlayCard(card)} />
                            </div>
                        ))}
                    </div>
                    {players.length > 0 && players[0].hand.length === 1 && (
                        <button onClick={sayLayerUp} className="layerup-button">LAYER UP!</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LayerUpGame;