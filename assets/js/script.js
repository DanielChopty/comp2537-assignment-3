document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const difficultySelect = document.getElementById('difficulty');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const cardsContainer = document.querySelector('.cards-container');
    const timerDisplay = document.querySelector('#timer');
    const clicksDisplay = document.querySelector('#clicks');
    const pairsLeftDisplay = document.querySelector('#pairs-left');
    const totalPairsDisplay = document.querySelector('#total-pairs');
    const matchesDisplay = document.querySelector('#matches');
    
    let timer;
    let gameTimer = 0;  // Timer variable to track remaining time
    let clicks = 0;
    let pairsMatched = 0;
    let totalPairs = 0; // Default total pairs
    let flippedCards = [];
    let gameStarted = false;  // Track if the game has started

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

    const createCards = () => {
        const shuffledCards = [...cardData, ...cardData].sort(() => Math.random() - 0.5);
        cardsContainer.innerHTML = '';
        
        shuffledCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.setAttribute('data-id', card.id);

            cardElement.innerHTML = `
                <div class="card-inner flipped"> <!-- Keep card flipped initially -->
                    <div class="card-front"></div>
                    <div class="card-back">
                        <img src="${card.image}" alt="${card.name}" />
                    </div>
                </div>
            `;
            cardsContainer.appendChild(cardElement);
        });

        // Set the grid layout based on selected difficulty
        const difficulty = difficultySelect.value;
        if (difficulty === 'easy') {
            cardsContainer.classList.add('easy');
            cardsContainer.classList.remove('medium', 'hard');
        } else if (difficulty === 'medium') {
            cardsContainer.classList.add('medium');
            cardsContainer.classList.remove('easy', 'hard');
        } else if (difficulty === 'hard') {
            cardsContainer.classList.add('hard');
            cardsContainer.classList.remove('easy', 'medium');
        }

        // Add event listeners to all cards
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
            setTimeout(() => checkMatch(), 500); // Delay for animation
        }
    };

    const checkMatch = () => {
        const [firstCard, secondCard] = flippedCards;
        const firstCardImage = firstCard.querySelector('.card-back img').src;
        const secondCardImage = secondCard.querySelector('.card-back img').src;

        // Check if the two cards are the same (match)
        if (firstCardImage === secondCardImage) {
            pairsMatched++;
            pairsLeftDisplay.textContent = totalPairs - pairsMatched;
            matchesDisplay.textContent = pairsMatched;
            flippedCards = [];
            if (pairsMatched === totalPairs) {
                alert("You win!");
                stopTimer();  // Stop the timer if all pairs are matched
            }
        } else {
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    };

    const updateStats = () => {
        totalPairsDisplay.textContent = totalPairs;
        pairsLeftDisplay.textContent = totalPairs - pairsMatched;
        clicksDisplay.textContent = clicks;
        matchesDisplay.textContent = pairsMatched;
    };

    const startTimer = () => {
        timer = setInterval(() => {
            if (gameTimer > 0) {
                gameTimer--;
                timerDisplay.textContent = `${gameTimer}s`;
            } else {
                clearInterval(timer);
                alert("Game over! Time's up!");
                stopTimer();
            }
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timer);
        gameStarted = false;
    };

    const resetGame = () => {
        cardsContainer.innerHTML = '';
        flippedCards = [];
        pairsMatched = 0;
        clicks = 0;
        
        // Reset timer based on selected difficulty
        const difficulty = difficultySelect.value;
        if (difficulty === 'easy') {
            gameTimer = 120;
        } else if (difficulty === 'medium') {
            gameTimer = 90;
        } else if (difficulty === 'hard') {
            gameTimer = 60;
        }
        timerDisplay.textContent = `${gameTimer}s`; // Set timer display to initial time

        // Reset total pairs based on difficulty
        if (difficulty === 'easy') {
            totalPairs = 6;
        } else if (difficulty === 'medium') {
            totalPairs = 8;
        } else if (difficulty === 'hard') {
            totalPairs = 10;
        }
        pairsLeftDisplay.textContent = totalPairs;
        clicksDisplay.textContent = clicks;
        matchesDisplay.textContent = pairsMatched;

        stopTimer(); // Stop timer when reset
    };

    const startGame = async () => {
        if (gameStarted) return; // Prevent starting again while the game is running
        
        gameStarted = true;  // Mark game as started
        pairsMatched = 0;
        flippedCards = [];
        clicks = 0;
        document.getElementById('clicks').textContent = clicks;

        const difficulty = difficultySelect.value;

        // Set initial game timer based on difficulty
        if (difficulty === 'easy') {
            gameTimer = 120;
        } else if (difficulty === 'medium') {
            gameTimer = 90;
        } else if (difficulty === 'hard') {
            gameTimer = 60;
        }

        // Set total pairs based on difficulty
        if (difficulty === 'easy') {
            totalPairs = 6;
        } else if (difficulty === 'medium') {
            totalPairs = 8;
        } else if (difficulty === 'hard') {
            totalPairs = 10;
        }
        document.getElementById('pairs-left').textContent = totalPairs;

        await generateGameData();
        createCards();
        startTimer();
    };

    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);

    // Theme toggle
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
    });
});
