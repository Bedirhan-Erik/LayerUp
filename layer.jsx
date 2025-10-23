import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw, HelpCircle, Trophy, Users } from 'lucide-react';

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
        { id: 'router', name: 'Router', layer: 3, type: 'direction', desc: 'Yön Değiştir' },
        { id: 'switch', name: 'Switch', layer: 2, type: 'skip', desc: 'Pas Geç' },
        { id: 'hub', name: 'Hub', layer: 1, type: 'draw1all', desc: 'Herkes 1 Çeker' },
        { id: 'firewall', name: 'Firewall', layer: 0, type: 'wild', desc: 'Joker' },
        { id: 'ddos', name: 'DDoS Attack', layer: 0, type: 'draw4', desc: '+4 Kart' },
        { id: 'packetloss', name: 'Packet Loss', layer: 0, type: 'draw2', desc: '+2 Kart' },
        { id: 'upgrade', name: 'Network Upgrade', layer: 0, type: 'swap', desc: 'El Değiştir' }
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

    const createDeck = () => {
        const cards = [];
        let id = 0;

        // Normal katman kartları - her birinden 2 adet
        Object.keys(LAYERS).forEach(layer => {
            LAYERS[layer].cards.forEach(cardName => {
                for (let i = 0; i < 2; i++) {
                    cards.push({
                        id: id++,
                        name: cardName,
                        layer: parseInt(layer),
                        type: 'normal',
                        color: LAYERS[layer].color
                    });
                }
            });
        });

        // Özel kartlar - her birinden 4 adet
        SPECIAL_CARDS.forEach(special => {
            for (let i = 0; i < 4; i++) {
                cards.push({
                    id: id++,
                    name: special.name,
                    layer: special.layer,
                    type: special.type,
                    color: special.layer > 0 ? LAYERS[special.layer].color : '#1f2937',
                    desc: special.desc
                });
            }
        });

        return shuffleDeck(cards);
    };

    const shuffleDeck = (cards) => {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const startGame = () => {
        const newDeck = createDeck();
        const newPlayers = [];

        // Oyunculara kart dağıt
        for (let i = 0; i < playerCount; i++) {
            newPlayers.push({
                id: i,
                name: i === 0 ? 'Siz' : `Oyuncu ${i + 1}`,
                hand: newDeck.splice(0, 7),
                saidLayerUp: false
            });
        }

        // İlk kartı aç (normal bir kart olana kadar)
        let firstCard;
        do {
            firstCard = newDeck.shift();
        } while (firstCard.type !== 'normal');

        setPlayers(newPlayers);
        setDeck(newDeck);
        setDiscardPile([firstCard]);
        setCurrentPlayer(0);
        setDirection(1);
        setGameStarted(true);
        setWinner(null);
        setMessage('Oyun başladı! Sıra sizde.');
        setDrawStack(0);
    };

    const canPlayCard = (card, topCard) => {
        if (drawStack > 0) {
            // +2 veya +4 stacki varsa
            if (card.type === 'draw2' || card.type === 'draw4' || card.type === 'wild') {
                return true;
            }
            return false;
        }

        if (card.type === 'wild' || card.type === 'draw4' || card.type === 'swap') {
            return true;
        }

        return card.layer === topCard.layer || card.name === topCard.name;
    };

    const playCard = (cardIndex) => {
        if (currentPlayer !== 0) return;

        const card = players[0].hand[cardIndex];
        const topCard = discardPile[discardPile.length - 1];

        if (!canPlayCard(card, topCard)) {
            setMessage('Bu kartı oynayamazsınız!');
            return;
        }

        // Kartı oyna
        const newPlayers = [...players];
        const playedCard = newPlayers[0].hand.splice(cardIndex, 1)[0];
        newPlayers[0].saidLayerUp = false;

        setPlayers(newPlayers);
        setDiscardPile([...discardPile, playedCard]);

        // Kartın etkisini uygula
        handleCardEffect(playedCard, newPlayers);
    };

    const handleCardEffect = (card, currentPlayers) => {
        let nextPlayer = (currentPlayer + direction + playerCount) % playerCount;

        switch (card.type) {
            case 'direction':
                setDirection(direction * -1);
                setMessage('Yön değişti!');
                nextPlayer = (currentPlayer + (direction * -1) + playerCount) % playerCount;
                break;

            case 'skip':
                setMessage(`${currentPlayers[nextPlayer].name} pas geçti!`);
                nextPlayer = (nextPlayer + direction + playerCount) % playerCount;
                break;

            case 'draw1all':
                const updatedPlayers = currentPlayers.map((p, i) => {
                    if (i !== currentPlayer) {
                        const newCard = drawCards(1);
                        return { ...p, hand: [...p.hand, ...newCard], saidLayerUp: false };
                    }
                    return p;
                });
                setPlayers(updatedPlayers);
                setMessage('Herkes 1 kart çekti!');
                break;

            case 'wild':
                if (drawStack > 0) {
                    setMessage('Saldırı engellendi!');
                    setDrawStack(0);
                } else {
                    setSelectingColor(true);
                    setMessage('Bir katman seçin!');
                    return;
                }
                break;

            case 'draw2':
                setDrawStack(drawStack + 2);
                setMessage(`+${drawStack + 2} kart saldırısı!`);
                break;

            case 'draw4':
                setDrawStack(drawStack + 4);
                setMessage(`+${drawStack + 4} kart saldırısı!`);
                break;

            case 'swap':
                if (playerCount > 2) {
                    setSelectingPlayer(true);
                    setMessage('El değiştirecek oyuncuyu seçin!');
                    return;
                }
                break;

            default:
                setMessage('');
                break;
        }

        // Kazanan kontrolü
        if (currentPlayers[currentPlayer].hand.length === 0) {
            setWinner(currentPlayers[currentPlayer]);
            setMessage(`${currentPlayers[currentPlayer].name} kazandı! 🎉`);
            return;
        }

        // Layer Up kontrolü
        if (currentPlayers[currentPlayer].hand.length === 1 && !currentPlayers[currentPlayer].saidLayerUp) {
            setTimeout(() => {
                if (Math.random() > 0.3) {
                    sayLayerUp();
                }
            }, 1000);
        }

        setCurrentPlayer(nextPlayer);

        if (nextPlayer !== 0) {
            setTimeout(() => aiTurn(nextPlayer, currentPlayers), 1500);
        }
    };

    const selectColor = (layer) => {
        const topCard = { ...discardPile[discardPile.length - 1] };
        topCard.layer = layer;
        topCard.color = LAYERS[layer].color;

        const newPile = [...discardPile];
        newPile[newPile.length - 1] = topCard;
        setDiscardPile(newPile);

        setSelectingColor(false);
        setMessage(`Katman ${layer} seçildi!`);

        let nextPlayer = (currentPlayer + direction + playerCount) % playerCount;
        setCurrentPlayer(nextPlayer);

        if (nextPlayer !== 0) {
            setTimeout(() => aiTurn(nextPlayer, players), 1500);
        }
    };

    const selectPlayerForSwap = (targetIndex) => {
        if (targetIndex === currentPlayer) return;

        const newPlayers = [...players];
        const temp = newPlayers[currentPlayer].hand;
        newPlayers[currentPlayer].hand = newPlayers[targetIndex].hand;
        newPlayers[targetIndex].hand = temp;

        newPlayers[currentPlayer].saidLayerUp = false;
        newPlayers[targetIndex].saidLayerUp = false;

        setPlayers(newPlayers);
        setSelectingPlayer(false);
        setMessage(`${newPlayers[currentPlayer].name} ve ${newPlayers[targetIndex].name} el değiştirdi!`);

        let nextPlayer = (currentPlayer + direction + playerCount) % playerCount;
        setCurrentPlayer(nextPlayer);

        if (nextPlayer !== 0) {
            setTimeout(() => aiTurn(nextPlayer, newPlayers), 1500);
        }
    };

    const drawCards = (count) => {
        const drawn = [];
        const newDeck = [...deck];

        for (let i = 0; i < count; i++) {
            if (newDeck.length === 0) {
                const pile = [...discardPile];
                const top = pile.pop();
                setDiscardPile([top]);
                newDeck.push(...shuffleDeck(pile));
            }
            drawn.push(newDeck.shift());
        }

        setDeck(newDeck);
        return drawn;
    };

    const drawCard = () => {
        if (currentPlayer !== 0) return;

        if (drawStack > 0) {
            const newPlayers = [...players];
            const drawn = drawCards(drawStack);
            newPlayers[0].hand.push(...drawn);
            newPlayers[0].saidLayerUp = false;
            setPlayers(newPlayers);
            setMessage(`${drawStack} kart çektiniz!`);
            setDrawStack(0);

            let nextPlayer = (currentPlayer + direction + playerCount) % playerCount;
            setCurrentPlayer(nextPlayer);

            if (nextPlayer !== 0) {
                setTimeout(() => aiTurn(nextPlayer, newPlayers), 1500);
            }
            return;
        }

        const newPlayers = [...players];
        const drawn = drawCards(1);
        newPlayers[0].hand.push(...drawn);
        newPlayers[0].saidLayerUp = false;
        setPlayers(newPlayers);

        const topCard = discardPile[discardPile.length - 1];
        if (canPlayCard(drawn[0], topCard)) {
            setMessage('Çektiğiniz kartı oynayabilirsiniz!');
        } else {
            setMessage('Çektiğiniz kart uymuyor, pas geçtiniz.');
            let nextPlayer = (currentPlayer + direction + playerCount) % playerCount;
            setCurrentPlayer(nextPlayer);

            if (nextPlayer !== 0) {
                setTimeout(() => aiTurn(nextPlayer, newPlayers), 1500);
            }
        }
    };

    const sayLayerUp = () => {
        if (players[0].hand.length === 1 && !players[0].saidLayerUp) {
            const newPlayers = [...players];
            newPlayers[0].saidLayerUp = true;
            setPlayers(newPlayers);
            setMessage('Layer Up! 📡');
        }
    };

    const aiTurn = (playerIndex, currentPlayers) => {
        const player = currentPlayers[playerIndex];
        const topCard = discardPile[discardPile.length - 1];

        // Layer Up kontrolü
        if (player.hand.length === 1 && !player.saidLayerUp && Math.random() > 0.2) {
            const newPlayers = [...currentPlayers];
            newPlayers[playerIndex].saidLayerUp = true;
            setPlayers(newPlayers);
            setMessage(`${player.name}: Layer Up! 📡`);
            setTimeout(() => aiTurn(playerIndex, newPlayers), 800);
            return;
        }

        // +2/+4 stacki varsa
        if (drawStack > 0) {
            const defenseCard = player.hand.findIndex(c =>
                c.type === 'draw2' || c.type === 'draw4' || c.type === 'wild'
            );

            if (defenseCard !== -1) {
                const newPlayers = [...currentPlayers];
                const card = newPlayers[playerIndex].hand.splice(defenseCard, 1)[0];
                setPlayers(newPlayers);
                setDiscardPile([...discardPile, card]);

                if (card.type === 'wild') {
                    setDrawStack(0);
                    setMessage(`${player.name} Firewall ile saldırıyı engelledi!`);
                    const randomLayer = Math.floor(Math.random() * 7) + 1;
                    setTimeout(() => {
                        const topCard = { ...discardPile[discardPile.length - 1] };
                        topCard.layer = randomLayer;
                        topCard.color = LAYERS[randomLayer].color;
                        const newPile = [...discardPile];
                        newPile[newPile.length - 1] = topCard;
                        setDiscardPile(newPile);

                        let nextPlayer = (playerIndex + direction + playerCount) % playerCount;
                        setCurrentPlayer(nextPlayer);
                        if (nextPlayer !== 0) {
                            setTimeout(() => aiTurn(nextPlayer, newPlayers), 1500);
                        }
                    }, 1000);
                    return;
                } else if (card.type === 'draw2') {
                    setDrawStack(drawStack + 2);
                    setMessage(`${player.name} +2 ile karşılık verdi! Toplam: +${drawStack + 2}`);
                } else if (card.type === 'draw4') {
                    setDrawStack(drawStack + 4);
                    setMessage(`${player.name} +4 ile karşılık verdi! Toplam: +${drawStack + 4}`);
                }

                let nextPlayer = (playerIndex + direction + playerCount) % playerCount;
                setCurrentPlayer(nextPlayer);
                if (nextPlayer !== 0) {
                    setTimeout(() => aiTurn(nextPlayer, newPlayers), 1500);
                }
                return;
            } else {
                const newPlayers = [...currentPlayers];
                const drawn = drawCards(drawStack);
                newPlayers[playerIndex].hand.push(...drawn);
                newPlayers[playerIndex].saidLayerUp = false;
                setPlayers(newPlayers);
                setMessage(`${player.name} ${drawStack} kart çekti!`);
                setDrawStack(0);

                let nextPlayer = (playerIndex + direction + playerCount) % playerCount;
                setCurrentPlayer(nextPlayer);
                if (nextPlayer !== 0) {
                    setTimeout(() => aiTurn(nextPlayer, newPlayers), 1500);
                }
                return;
            }
        }

        // Oynayabilecek kart ara
        const playableIndex = player.hand.findIndex(c => canPlayCard(c, topCard));

        if (playableIndex !== -1) {
            const newPlayers = [...currentPlayers];
            const card = newPlayers[playerIndex].hand.splice(playableIndex, 1)[0];
            newPlayers[playerIndex].saidLayerUp = false;
            setPlayers(newPlayers);
            setDiscardPile([...discardPile, card]);
            setMessage(`${player.name} ${card.name} oynadı.`);

            // Kazanan kontrolü
            if (newPlayers[playerIndex].hand.length === 0) {
                setWinner(newPlayers[playerIndex]);
                setMessage(`${player.name} kazandı! 🎉`);
                return;
            }

            // Kart efekti
            setTimeout(() => {
                let nextPlayer = (playerIndex + direction + playerCount) % playerCount;

                switch (card.type) {
                    case 'direction':
                        setDirection(direction * -1);
                        nextPlayer = (playerIndex + (direction * -1) + playerCount) % playerCount;
                        setMessage(`${player.name} yönü değiştirdi!`);
                        break;

                    case 'skip':
                        nextPlayer = (nextPlayer + direction + playerCount) % playerCount;
                        setMessage(`${player.name} bir sonraki oyuncuyu pas geçti!`);
                        break;

                    case 'draw1all':
                        const updatedPlayers = newPlayers.map((p, i) => {
                            if (i !== playerIndex) {
                                const newCard = drawCards(1);
                                return { ...p, hand: [...p.hand, ...newCard], saidLayerUp: false };
                            }
                            return p;
                        });
                        setPlayers(updatedPlayers);
                        setMessage(`${player.name} herkese 1 kart çektirdi!`);
                        break;

                    case 'wild':
                        const randomLayer = Math.floor(Math.random() * 7) + 1;
                        const topCard = { ...discardPile[discardPile.length - 1] };
                        topCard.layer = randomLayer;
                        topCard.color = LAYERS[randomLayer].color;
                        const newPile = [...discardPile];
                        newPile[newPile.length - 1] = topCard;
                        setDiscardPile(newPile);
                        setMessage(`${player.name} Firewall oynadı ve Katman ${randomLayer} seçti!`);
                        break;

                    case 'draw2':
                        setDrawStack(2);
                        setMessage(`${player.name} +2 kart saldırısı başlattı!`);
                        break;

                    case 'draw4':
                        setDrawStack(4);
                        setMessage(`${player.name} DDoS saldırısı başlattı! +4 kart!`);
                        break;

                    case 'swap':
                        if (playerCount > 2) {
                            let targetIndex;
                            do {
                                targetIndex = Math.floor(Math.random() * playerCount);
                            } while (targetIndex === playerIndex);

                            const temp = newPlayers[playerIndex].hand;
                            newPlayers[playerIndex].hand = newPlayers[targetIndex].hand;
                            newPlayers[targetIndex].hand = temp;
                            newPlayers[playerIndex].saidLayerUp = false;
                            newPlayers[targetIndex].saidLayerUp = false;
                            setPlayers(newPlayers);
                            setMessage(`${player.name} ve ${newPlayers[targetIndex].name} el değiştirdi!`);
                        }
                        break;
                }

                setCurrentPlayer(nextPlayer);
                if (nextPlayer !== 0) {
                    setTimeout(() => aiTurn(nextPlayer, newPlayers), 1500);
                }
            }, 1000);
        } else {
            const newPlayers = [...currentPlayers];
            const drawn = drawCards(1);
            newPlayers[playerIndex].hand.push(...drawn);
            newPlayers[playerIndex].saidLayerUp = false;
            setPlayers(newPlayers);
            setMessage(`${player.name} kart çekti.`);

            setTimeout(() => {
                let nextPlayer = (playerIndex + direction + playerCount) % playerCount;
                setCurrentPlayer(nextPlayer);
                if (nextPlayer !== 0) {
                    setTimeout(() => aiTurn(nextPlayer, newPlayers), 1500);
                }
            }, 1000);
        }
    };

    const Card = ({ card, onClick, small = false, highlight = false }) => (
        <div
            onClick={onClick}
            className={`${small ? 'w-16 h-24' : 'w-20 h-32'} rounded-lg shadow-lg cursor-pointer transition-all transform hover:scale-110 hover:-translate-y-2 border-4 ${
                highlight ? 'border-yellow-400 ring-4 ring-yellow-300' : 'border-white'
            }`}
            style={{ backgroundColor: card.color }}
        >
            <div className="h-full flex flex-col items-center justify-between p-2 text-white">
                <div className={`font-bold ${small ? 'text-xs' : 'text-sm'}`}>
                    {card.layer > 0 ? `L${card.layer}` : '★'}
                </div>
                <div className={`text-center font-bold ${small ? 'text-xs' : 'text-sm'} leading-tight`}>
                    {card.name}
                </div>
                {card.desc && (
                    <div className={`${small ? 'text-xs' : 'text-xs'} text-center opacity-90`}>
                        {card.desc}
                    </div>
                )}
                <div className={`font-bold ${small ? 'text-xs' : 'text-sm'}`}>
                    {card.layer > 0 ? `L${card.layer}` : '★'}
                </div>
            </div>
        </div>
    );

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-2">
                            Layer Up!
                        </h1>
                        <p className="text-xl text-gray-600">"Yığını Tırman, Veriyi Ulaştır!"</p>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <Users className="text-indigo-600" />
                            <label className="text-lg font-semibold">Oyuncu Sayısı:</label>
                            <select
                                value={playerCount}
                                onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                                className="px-4 py-2 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500"
                            >
                                {[2, 3, 4, 5, 6].map(n => (
                                    <option key={n} value={n}>{n} Oyuncu</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-4 rounded-xl font-bold text-xl hover:from-indigo-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg mb-4"
                    >
                        Oyunu Başlat
                    </button>

                    <button
                        onClick={() => setShowRules(!showRules)}
                        className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                        <HelpCircle size={20} />
                        Oyun Kuralları
                    </button>

                    {showRules && (
                        <div className="mt-6 bg-gray-50 p-6 rounded-xl text-sm space-y-3">
                            <h3 className="font-bold text-lg mb-2">Nasıl Oynanır?</h3>
                            <ul className="space-y-2 list-disc list-inside">
                                <li><strong>Amaç:</strong> Elinizdeki tüm kartları ilk bitiren kazanır!</li>
                                <li><strong>Eşleştirme:</strong> Aynı katman (renk) veya aynı kart adıyla oynayın.</li>
                                <li><strong>Router:</strong> Oyun yönünü tersine çevirir.</li>
                                <li><strong>Switch:</strong> Sıradaki oyuncuyu pas geçirir.</li>
                                <li><strong>Hub:</strong> Herkese 1 kart çektirir.</li>
                                <li><strong>Firewall:</strong> Joker kart, herhangi bir kata dönüştürür.</li>
                                <li><strong>DDoS Attack:</strong> Sıradaki oyuncu 4 kart çeker.</li>
                                <li><strong>Packet Loss:</strong> Sıradaki oyuncu 2 kart çeker.</li>
                                <li><strong>Network Upgrade:</strong> Seçtiğiniz bir oyuncu ile el değiştirir.</li>
                                <li><strong>Layer Up!</strong> Tek kartınız kaldığında butona basın!</li>
                            </ul>
                        </div>
                    )}

                    <div className="mt-8 grid grid-cols-7 gap-2">
                        {Object.keys(LAYERS).map(layer => (
                            <div key={layer} className="text-center">
                                <div
                                    className="w-full h-12 rounded-lg mb-1"
                                    style={{ backgroundColor: LAYERS[layer].color }}
                                />
                                <div className="text-xs font-semibold">L{layer}</div>
                                <div className="text-xs text-gray-600">{LAYERS[layer].name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (winner) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
                    <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-4">
                        {winner.name} Kazandı! 🎉
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Tebrikler! Tüm katmanları başarıyla geçtiniz!
                    </p>
                    <button
                        onClick={() => {
                            setGameStarted(false);
                            setWinner(null);
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-4 px-8 rounded-xl font-bold text-xl hover:from-indigo-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                        Yeni Oyun
                    </button>
                </div>
            </div>
        );
    }

    const topCard = discardPile[discardPile.length - 1];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Üst bilgi */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-white">Layer