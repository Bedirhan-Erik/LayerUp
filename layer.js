import React, { useState } from 'react';
import { Shuffle, RotateCcw, HelpCircle, Trophy, Users, ShieldCheck, Zap, Server, ChevronsRight, Wind, AlertTriangle, GitSwap } from 'lucide-react';

const LayerUpGame = () => {
    const LAYERS = {
        7: { name: 'Uygulama', color: '#10b981', cards: ['HTTP', 'FTP', 'DNS', 'SMTP'] },
        6: { name: 'Sunum', color: '#8b5cf6', cards: ['SSL/TLS', 'JPEG', 'MPEG', 'ASCII'] },
        5: { name: 'Oturum', color: '#f97316', cards: ['NetBIOS', 'SAP', 'PPTP', 'RPC'] },
        4: { name: 'Taşıma', color: '#3b82f6', cards: ['TCP', 'UDP', 'Segment', 'Port'] },
        3: { name: 'Ağ', color: '#ef4444', cards: ['IP', 'ICMP', 'Router', 'Paket'] },
        2: { name: 'Veri Bağlantı', color: '#eab308', cards: ['Ethernet', 'MAC Adresi', 'Switch', 'Frame'] },
        1: { name: 'Fiziksel', color: '#6b7280', cards: ['Fiber Kablo', 'Bakır Kablo', 'Hub', 'Bit'] }
    };

    const SPECIAL_CARDS = [
        { id: 'router', name: 'Router', layer: 3, type: 'direction', desc: 'Yön Değiştir', Icon: Wind },
        { id: 'switch', name: 'Switch', layer: 2, type: 'skip', desc: 'Pas Geç', Icon: ChevronsRight },
        { id: 'hub', name: 'Hub', layer: 1, type: 'draw1all', desc: 'Herkes 1 Çeker', Icon: Users },
        { id: 'firewall', name: 'Firewall', layer: 0, type: 'wild', desc: 'Joker & Engelle', Icon: ShieldCheck },
        { id: 'ddos', name: 'DDoS Attack', layer: 0, type: 'draw4', desc: '+4 Kart Çek', Icon: Zap },
        { id: 'packetloss', name: 'Packet Loss', layer: 0, type: 'draw2', desc: '+2 Kart Çek', Icon: AlertTriangle },
        { id: 'upgrade', name: 'Network Upgrade', layer: 0, type: 'swap', desc: 'El Değiştir', Icon: GitSwap }
    ];

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
            for (let i = 0; i < 4; i++) {
                cards.push({ ...special, id: id++, color: special.layer > 0 ? LAYERS[special.layer].color : '#1f2937' });
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
        do {
            firstCard = newDeck.shift();
            if (!firstCard) break;
        } while (firstCard && firstCard.type !== 'normal');

        setPlayers(newPlayers);
        setDeck(newDeck);
        setDiscardPile(firstCard ? [firstCard] : []);
        setCurrentPlayer(0);
        setDirection(1);
        setGameStarted(true);
        setWinner(null);
        setMessage('Oyun başladı! Sıra sizde.');
        setDrawStack(0);
    };

    // DESTEDEN KART ÇEKME (count kadar) - dönen değer: [kart, kart, ...]
    const drawFromDeck = (count) => {
        let currentDeck = [...deck];
        let currentDiscard = [...discardPile];
        const drawn = [];
        for (let i = 0; i < count; i++) {
            if (currentDeck.length === 0) {
                // Eğer destede kart yoksa, yerdeki kartların üstündeki son kart dışındakileri karıştırıp yeni deste yap
                const top = currentDiscard.pop();
                currentDeck = shuffleDeck(currentDiscard);
                currentDiscard = top ? [top] : [];
            }
            if (currentDeck.length > 0) {
                drawn.push(currentDeck.shift());
            } else {
                break;
            }
        }
        setDeck(currentDeck);
        setDiscardPile(currentDiscard);
        return drawn;
    };

    const canPlayCard = (card) => {
        const topCard = discardPile[discardPile.length - 1];
        if (!topCard) return true;
        if (drawStack > 0) {
            return card.type === 'draw2' || card.type === 'draw4' || (card.type === 'wild' && card.name === 'Firewall');
        }
        return card.type === 'wild' || card.type === 'draw4' || card.type === 'swap' || card.layer === topCard.layer || card.name === topCard.name;
    };

    const endTurnTo = (nextP) => {
        setCurrentPlayer(nextP);
        if (nextP !== 0) {
            setTimeout(() => aiTurn(nextP), 1200);
        }
    };

    const handleCardEffect = (card, currentPlayers, playerIndex) => {
        let nextPlayer = (playerIndex + direction + playerCount) % playerCount;

        const executeNextTurn = (nextP) => {
            // kazanan kontrolü (oynayanın eli bittiyse)
            if (currentPlayers[playerIndex].hand.length === 0) {
                setWinner(currentPlayers[playerIndex]);
                setMessage(`${currentPlayers[playerIndex].name} kazandı! 🎉`);
                return;
            }

            setCurrentPlayer(nextP);
            if (nextP !== 0) {
                setTimeout(() => aiTurn(nextP), 1200);
            }
        };

        switch (card.type) {
            case 'direction': {
                const newDirection = direction * -1;
                setDirection(newDirection);
                setMessage(`${currentPlayers[playerIndex].name} yönü değiştirdi!`);
                nextPlayer = (playerIndex + newDirection + playerCount) % playerCount;
                break;
            }
            case 'skip': {
                setMessage(`${currentPlayers[nextPlayer].name} pas geçti!`);
                nextPlayer = (nextPlayer + direction + playerCount) % playerCount;
                break;
            }
            case 'draw1all': {
                setPlayers(prev => prev.map((p, i) => i !== playerIndex ? { ...p, hand: [...p.hand, ...drawFromDeck(1)], saidLayerUp: false } : p));
                setMessage(`${currentPlayers[playerIndex].name} herkese 1 kart çektirdi!`);
                break;
            }
            case 'wild': {
                if (drawStack > 0) {
                    setMessage(`${currentPlayers[playerIndex].name} Firewall ile saldırıyı engelledi!`);
                    setDrawStack(0);
                } else {
                    if (playerIndex === 0) {
                        setSelectingColor(true);
                        setMessage('Bir katman (renk) seçin!');
                        return;
                    } else {
                        const randomLayer = Math.floor(Math.random() * 7) + 1;
                        const topCard = { ...card, layer: randomLayer, color: LAYERS[randomLayer].color };
                        setDiscardPile(prev => [...prev.slice(0, -1), topCard]);
                        setMessage(`${currentPlayers[playerIndex].name} Firewall oynadı ve Katman ${randomLayer} seçti.`);
                    }
                }
                break;
            }
            case 'draw2': {
                setDrawStack(prev => {
                    const newVal = prev + 2;
                    setMessage(`Packet Loss! Toplam +${newVal} kart saldırısı!`);
                    return newVal;
                });
                break;
            }
            case 'draw4': {
                setDrawStack(prev => {
                    const newVal = prev + 4;
                    setMessage(`DDoS Attack! Toplam +${newVal} kart saldırısı!`);
                    return newVal;
                });
                if (playerIndex === 0) {
                    setSelectingColor(true);
                    return;
                } else {
                    const randomLayer = Math.floor(Math.random() * 7) + 1;
                    const topCard = { ...card, layer: randomLayer, color: LAYERS[randomLayer].color };
                    setDiscardPile(prev => [...prev.slice(0, -1), topCard]);
                    setMessage(`${currentPlayers[playerIndex].name} DDoS oynadı ve Katman ${randomLayer} seçti.`);
                }
                break;
            }
            case 'swap': {
                if (playerCount > 2) {
                    if (playerIndex === 0) {
                        setSelectingPlayer(true);
                        setMessage('El değiştirecek oyuncuyu seçin!');
                        return;
                    } else {
                        let targetIndex;
                        do {
                            targetIndex = Math.floor(Math.random() * playerCount);
                        } while (targetIndex === playerIndex);
                        setPlayers(prev => {
                            const copy = [...prev];
                            [copy[playerIndex].hand, copy[targetIndex].hand] = [copy[targetIndex].hand, copy[playerIndex].hand];
                            return copy;
                        });
                        setMessage(`${currentPlayers[playerIndex].name} ve Oyuncu ${targetIndex + 1} el değiştirdi!`);
                    }
                }
                break;
            }
            default:
                break;
        }
        executeNextTurn(nextPlayer);
    };

    const playCard = (cardIndex) => {
        if (currentPlayer !== 0 || selectingColor || selectingPlayer) return;
        const card = players[0].hand[cardIndex];
        if (!canPlayCard(card)) {
            setMessage('Bu kartı oynayamazsınız!');
            setTimeout(() => setMessage(''), 2000);
            return;
        }

        setPlayers(prev => {
            const copy = JSON.parse(JSON.stringify(prev)); // derin kopya (basitçe)
            const playedCard = copy[0].hand.splice(cardIndex, 1)[0];
            copy[0].saidLayerUp = false;
            // discard ekle
            setDiscardPile(dp => [...dp, playedCard]);
            // handle effect (kopyayı ve index'i gönder)
            handleCardEffect(playedCard, copy, 0);
            return copy;
        });
    };

    const selectColor = (layer) => {
        const wildCard = discardPile[discardPile.length - 1];
        const coloredCard = { ...wildCard, layer: layer, color: LAYERS[layer].color };
        setDiscardPile(prev => [...prev.slice(0, -1), coloredCard]);
        setSelectingColor(false);

        setMessage(`Katman ${layer} seçildi!`);
        const nextPlayer = (currentPlayer + direction + playerCount) % playerCount;
        endTurnTo(nextPlayer);
    };

    const selectPlayerForSwap = (targetIndex) => {
        setPlayers(prev => {
            const copy = [...prev];
            [copy[currentPlayer].hand, copy[targetIndex].hand] = [copy[targetIndex].hand, copy[currentPlayer].hand];
            return copy;
        });
        setSelectingPlayer(false);
        setMessage(`El ${players[targetIndex].name} ile değiştirildi!`);
        const nextPlayer = (currentPlayer + direction + playerCount) % playerCount;
        endTurnTo(nextPlayer);
    };

    const drawCard = () => {
        if (currentPlayer !== 0 || selectingColor || selectingPlayer) return;
        setPlayers(prev => {
            const copy = [...prev];
            if (drawStack > 0) {
                const drawn = drawFromDeck(drawStack);
                copy[0].hand.push(...drawn);
                setMessage(`${drawStack} kart çektiniz!`);
                setDrawStack(0);
                // sonraki oyuncuya geç
                const nextP = (0 + direction + playerCount) % playerCount;
                endTurnTo(nextP);
            } else {
                const drawn = drawFromDeck(1);
                if (drawn.length === 0) {
                    setMessage('Destede kart kalmadığı için çekilemiyor.');
                    return copy;
                }
                const card = drawn[0];
                copy[0].hand.push(card);
                if (canPlayCard(card)) {
                    setMessage('Çektiğiniz kartı oynayabilirsiniz.');
                    // İsteğe bağlı: otomatik oynamak isterseniz burada oynatabilirsiniz.
                } else {
                    setMessage('Pas geçtiniz.');
                    const nextP = (0 + direction + playerCount) % playerCount;
                    endTurnTo(nextP);
                }
            }
            copy[0].saidLayerUp = false;
            return copy;
        });
    };

    const sayLayerUp = () => {
        setPlayers(prev => {
            const copy = [...prev];
            if (copy[0] && copy[0].hand.length === 1 && !copy[0].saidLayerUp) {
                copy[0].saidLayerUp = true;
                setMessage('Layer Up! 📡');
            }
            return copy;
        });
    };

    const aiTurn = (playerIndex) => {
        setPlayers(prevPlayers => {
            const copy = [...prevPlayers];
            const player = copy[playerIndex];

            // Eğer drawStack varsa, savunma kartı arar
            if (drawStack > 0) {
                const defenseCardIndex = player.hand.findIndex(c => c.type === 'draw2' || c.type === 'draw4' || c.type === 'wild');
                if (defenseCardIndex !== -1) {
                    const card = player.hand.splice(defenseCardIndex, 1)[0];
                    setDiscardPile(dp => [...dp, card]);
                    setMessage(`${player.name} savunma kartı oynadı: ${card.name}`);
                    handleCardEffect(card, copy, playerIndex);
                    return copy;
                } else {
                    const drawn = drawFromDeck(drawStack);
                    player.hand.push(...drawn);
                    setMessage(`${player.name} ${drawStack} kart çekti!`);
                    setDrawStack(0);
                    const nextP = (playerIndex + direction + playerCount) % playerCount;
                    endTurnTo(nextP);
                    return copy;
                }
            }

            // Normal oynama akışı
            const playableIndex = player.hand.findIndex(c => canPlayCard(c));
            if (playableIndex !== -1) {
                const card = player.hand.splice(playableIndex, 1)[0];
                setDiscardPile(dp => [...dp, card]);
                setMessage(`${player.name} "${card.name}" oynadı.`);
                handleCardEffect(card, copy, playerIndex);
                return copy;
            } else {
                // çek ve eğer oynanabiliyorsa oyna
                const drawn = drawFromDeck(1);
                if (drawn.length === 0) {
                    // destede kart yoksa
                    const nextP = (playerIndex + direction + playerCount) % playerCount;
                    endTurnTo(nextP);
                    return copy;
                }
                const card = drawn[0];
                player.hand.push(card);
                setMessage(`${player.name} kart çekti.`);
                if (canPlayCard(card)) {
                    // oynama sürecini biraz geciktir
                    setTimeout(() => {
                        setPlayers(latest => {
                            const cpy = [...latest];
                            // son çekilen kartı bulup çıkar (güvenli yol: find from end by id)
                            const idx = cpy[playerIndex].hand.findIndex(k => k.id === card.id);
                            if (idx !== -1) {
                                const played = cpy[playerIndex].hand.splice(idx, 1)[0];
                                setDiscardPile(dp => [...dp, played]);
                                setMessage(`${cpy[playerIndex].name} çektiği "${played.name}" kartını oynadı.`);
                                handleCardEffect(played, cpy, playerIndex);
                            }
                            return cpy;
                        });
                    }, 800);
                } else {
                    const nextP = (playerIndex + direction + playerCount) % playerCount;
                    endTurnTo(nextP);
                }
                return copy;
            }
        });
    };

    const Card = ({ card, onClick, small = false, highlight = false, faceDown = false }) => {
        if (faceDown) {
            return (
                <div className={`${small ? 'w-16 h-24' : 'w-20 h-32'} rounded-lg shadow-lg bg-gradient-to-br from-indigo-700 to-pink-700 border-2 border-indigo-400 flex items-center justify-center`}>
                    <Server className="w-8 h-8 text-white/50" />
                </div>
            );
        }

        const Icon = card?.Icon;

        return (
            <div
                onClick={onClick}
                className={`${small ? 'w-16 h-24' : 'w-20 h-32'} rounded-lg shadow-lg cursor-pointer transition-all transform hover:scale-110 hover:-translate-y-2 border-2 ${highlight ? 'border-yellow-400 ring-4 ring-yellow-300' : 'border-white/20'}`}
                style={{ backgroundColor: card.color }}
            >
                <div className="h-full flex flex-col items-center justify-between p-2 text-white text-shadow-sm">
                    <div className="font-bold self-start">{card.layer > 0 ? `L${card.layer}` : '★'}</div>
                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                        {Icon && <Icon className="w-6 h-6 mb-1" />}
                        <div className="font-bold text-sm leading-tight">{card.name}</div>
                        {card.desc && !Icon && <div className="text-xs mt-1 opacity-90">{card.desc}</div>}
                    </div>
                    <div className="font-bold self-end transform rotate-180">{card.layer > 0 ? `L${card.layer}` : '★'}</div>
                </div>
            </div>
        );
    };

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-white">
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 mb-2">Layer Up!</h1>
                        <p className="text-xl text-gray-300">"Yığını Tırman, Veriyi Ulaştır!"</p>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <Users className="text-indigo-400" />
                            <label className="text-lg font-semibold">Oyuncu Sayısı:</label>
                            <select value={playerCount} onChange={(e) => setPlayerCount(parseInt(e.target.value))} className="px-4 py-2 bg-white/20 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500">
                                {[2, 3, 4, 5, 6].map(n => (<option key={n} value={n} className="text-black">{n} Oyuncu</option>))}
                            </select>
                        </div>
                    </div>

                    <button onClick={startGame} className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 py-4 rounded-xl font-bold text-xl hover:from-indigo-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg mb-4">Oyunu Başlat</button>
                    <button onClick={() => setShowRules(!showRules)} className="w-full bg-white/20 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-2"><HelpCircle size={20} />Oyun Kuralları</button>

                    {showRules && (
                        <div className="mt-6 bg-black/30 p-6 rounded-xl text-sm space-y-3">
                            <h3 className="font-bold text-lg mb-2">Nasıl Oynanır?</h3>
                            <ul className="space-y-2 list-disc list-inside">
                                <li><strong>Amaç:</strong> Elindeki tüm kartları ilk bitiren kazanır!</li>
                                <li><strong>Eşleştirme:</strong> Yerdeki kartla aynı katman (renk) veya aynı isme sahip kartı oyna.</li>
                                {SPECIAL_CARDS.map(c => <li key={c.id}><strong>{c.name}:</strong> {c.desc}</li>)}
                                <li><strong>Layer Up!</strong> Tek kartın kaldığında butona bas, yoksa ceza yersin!</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (winner) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center text-white">
                    <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 mb-4">{winner.name} Kazandı! 🎉</h1>
                    <p className="text-xl text-gray-300 mb-8">Tebrikler! Tüm katmanları başarıyla geçtiniz!</p>
                    <button onClick={() => setGameStarted(false)} className="bg-gradient-to-r from-indigo-600 to-pink-600 py-4 px-8 rounded-xl font-bold text-xl hover:from-indigo-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg">Yeni Oyun</button>
                </div>
            </div>
        );
    }

    const topCard = discardPile[discardPile.length - 1];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4 font-sans text-white overflow-hidden">
            {selectingColor && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Bir Katman Seç</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.keys(LAYERS).map(l => (
                                <button key={l} onClick={() => selectColor(parseInt(l))} className="p-4 rounded-lg text-white font-bold" style={{ backgroundColor: LAYERS[l].color }}>L{l}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {selectingPlayer && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4">El Değiştirmek İçin Bir Oyuncu Seç</h3>
                        <div className="flex flex-col gap-2">
                            {players.map((p, i) => i !== 0 && (
                                <button key={p.id} onClick={() => selectPlayerForSwap(i)} className="p-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold">{p.name}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="relative w-full h-[calc(100vh-2rem)] max-w-7xl mx-auto">
                {players.map((player, index) => {
                    if (index === 0) return null;
                    const pos = {
                        1: 'top-4 left-1/2 -translate-x-1/2',
                        2: index === 1 ? 'left-4 top-1/2 -translate-y-1/2 -rotate-90' : 'top-4 left-1/2 -translate-x-1/2',
                        3: index === 1 ? 'left-4 top-1/2 -translate-y-1/2 -rotate-90' : index === 2 ? 'top-4 left-1/2 -translate-x-1/2' : 'right-4 top-1/2 -translate-y-1/2 rotate-90',
                    }[playerCount - 1] || 'top-4 left-1/2 -translate-x-1/2';

                    return (
                        <div key={player.id} className={`absolute ${pos} transition-all duration-500`}>
                            <div className={`p-2 rounded-lg bg-black/30 text-center ${currentPlayer === index ? 'ring-2 ring-yellow-400' : ''}`}>
                                <div className="font-bold text-sm">{player.name}</div>
                                <div className="text-xs">{player.hand.length} Kart</div>
                                <div className="flex justify-center mt-2 space-x-[-40px]">
                                    {player.hand.slice(0, 5).map((_, i) => <Card key={i} small faceDown />)}
                                </div>
                            </div>
                        </div>
                    )
                })}

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-8">
                    <div className="text-center">
                        <Card faceDown onClick={drawCard} />
                        <div className="mt-2 font-semibold">{deck.length} Kart</div>
                    </div>
                    <div className="text-center">
                        {topCard && <Card card={topCard} />}
                        <div className="mt-2 font-semibold">Oyun Yığını</div>
                    </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200px] bg-black/40 p-3 rounded-lg text-center font-semibold text-lg min-w-[300px]">
                    {message || `Sıradaki: ${players[currentPlayer].name}`}
                    {drawStack > 0 && <div className="text-red-400 font-bold text-2xl animate-pulse">+{drawStack} SALDIRISI!</div>}
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => setGameStarted(false)} className="bg-red-600/50 p-3 rounded-full hover:bg-red-500"><RotateCcw /></button>
                    <button onClick={() => setShowRules(true)} className="bg-blue-600/50 p-3 rounded-full hover:bg-blue-500"><HelpCircle /></button>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full flex flex-col items-center">
                    <div className={`p-2 rounded-lg bg-black/30 mb-4 ${currentPlayer === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                        <div className="font-bold text-lg">{players[0].name}</div>
                    </div>
                    <div className="flex justify-center items-end gap-2 -mb-10">
                        {players[0].hand.map((card, i) => (
                            <div key={card.id} style={{ transform: `rotate(${(i - players[0].hand.length / 2) * 5}deg) translateY(${Math.abs(i - players[0].hand.length / 2) * 5}px)` }}>
                                <Card card={card} onClick={() => playCard(i)} highlight={canPlayCard(card)} />
                            </div>
                        ))}
                    </div>
                    {players[0].hand.length === 1 && !players[0].saidLayerUp && (
                        <button onClick={sayLayerUp} className="mt-16 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full font-bold text-xl animate-pulse shadow-lg">
                            LAYER UP!
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LayerUpGame;
