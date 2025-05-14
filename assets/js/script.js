document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const difficultySelect = document.getElementById('difficulty');
    const themeSelect = document.getElementById('theme');
    const cardsContainer = document.querySelector('.cards-container');
    const timerDisplay = document.querySelector('#timer');
    const clicksDisplay = document.querySelector('#clicks');
    const pairsLeftDisplay = document.querySelector('#pairs-left');
    let timer;
    let clicks = 0;
    let pairsMatched = 0;
    let totalPairs = 0;
    let flippedCards = [];
    let cardData = [];
    let gameTimer = 60; // Default timer for "easy" difficulty

    const fetchPokemonData = async () => {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1500');
        const data = await response.json();
        return data.results;
    };

    const generateGameData = async () => {
        const pokemonList = await fetchPokemonData();
        const selectedPokemons = [];
        while (selectedPokemons.length < totalPairs) {
            const randomIndex = Math.floor(Math.random() * pokemonList.length);
            const pokemon = pokemonList[randomIndex];
            if (!selectedPokemons.includes(pokemon.name)) {
                selectedPokemons.push(pokemon.name);
            }
        }
        cardData = selectedPokemons.map(pokemon => ({
            name: pokemon,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonList.find(p => p.name === pokemon).url.split('/')[6]}.png`
        }));
    };

    const startGame = async () => {
        clicks = 0;
        pairsMatched = 0;
        flippedCards = [];
        clearInterval(timer);
        gameTimer = difficultySelect.value === 'easy' ? 60 : (difficultySelect.value === 'medium' ? 45 : 30);
        timerDisplay.textContent = gameTimer;
        totalPairs = difficultySelect.value === 'easy' ? 6 : (difficultySelect.value === 'medium' ? 8 : 10);
        pairsLeftDisplay.textContent = totalPairs;

        await generateGameData();
        createCards();
        startTimer();
    };

    const startTimer = () => {
        timer = setInterval(() => {
            if (gameTimer > 0) {
                gameTimer--;
                timerDisplay.textContent = gameTimer;
            } else {
                clearInterval(timer);
                alert("Game Over! Time's up!");
            }
        }, 1000);
    };

    const createCards = () => {
        cardsContainer.innerHTML = '';
        const shuffledCards = [...cardData, ...cardData].sort(() => Math.random() - 0.5);
        shuffledCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back">
                        <img src="${card.image}" alt="${card.name}">
                    </div>
                </div>
            `;
            cardsContainer.appendChild(cardElement);
        });

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => flipCard(card));
        });
    };

    const flipCard = (card) => {
        if (flippedCards.length === 2 || card.classList.contains('flipped')) return;
        card.classList.add('flipped');
        flippedCards.push(card);
        clicks++;
        clicksDisplay.textContent = clicks;

        if (flippedCards.length === 2) {
            checkMatch();
        }
    };

    const checkMatch = () => {
        const [firstCard, secondCard] = flippedCards;
        const firstPokemon = firstCard.querySelector('.card-back img').src;
        const secondPokemon = secondCard.querySelector('.card-back img').src;

        if (firstPokemon === secondPokemon) {
            pairsMatched++;
            pairsLeftDisplay.textContent = totalPairs - pairsMatched;
            flippedCards = [];

            if (pairsMatched === totalPairs) {
                alert("You win! All pairs matched.");
            }
        } else {
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    };

    const resetGame = () => {
        cardsContainer.innerHTML = '';
        timerDisplay.textContent = 60;
        clicksDisplay.textContent = 0;
        pairsLeftDisplay.textContent = totalPairs;
    };

    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    themeSelect.addEventListener('change', (e) => document.body.className = e.target.value + '-theme');
});
