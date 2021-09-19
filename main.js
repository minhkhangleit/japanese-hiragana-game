// Varible in game
const randomPosition = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
const gameZone = document.getElementById('game-zone');
const bubbleZone = document.getElementById('bubble-zone');
const scoreElement = document.getElementById('score');
const arrowElement = document.getElementById('arrow');
const levelElement = document.getElementById('level');
const startButton = document.getElementsByClassName('start-game');
const formInput = document.getElementById('form-input');
const inputData = document.getElementById('input-data');
const arrow = document.getElementById('arrow-shoot');
const scoreGameOver = document.getElementById('game-over-score');
var wordRuningList = [];
var score = 0;
var isGameOver = false;
var gameIsRunning = false;
var arrowClick = 3;
var isArrowClick = false;
var interValGameRuning;
var intervalTime = TIME_INTERVAL_START;
var levelGame = 0;
var currentLevel = 0;

//Start game
function startGame() {
    //Initial variable
    gameZone.style.cursor = 'not-allowed';
    isArrowClick = false;
    arrowClick = 3;
    score = 0;
    gameIsRunning = true;
    isGameOver = false;
    updateScore();
    updateArrow();
    
    // Render bubble
    bubbleZone.appendChild(createRandomBubble());
    interValGameRuning = setInterval(function() {
        if(score < SCORE_CHANGE_LEVEL_1) {
            levelGame = 0;
        }else if (score < SCORE_CHANGE_LEVEL_2) {
            levelGame = 1;
        }else if (score < SCORE_CHANGE_LEVEL_3) {
            levelGame = 2;
        }else {
            levelGame = 3;
        }
        resetInterval(levelGame);
        bubbleZone.appendChild(createRandomBubble());
    }, intervalTime);
}

// Function reset level when levelup
function resetInterval(level) {
    //max level 3
    if(level != currentLevel) {
        updateLevel(level)
        const durationTime = intervalTime - (levelGame * TIME_LEVEL_INTERVAL_MINUS) // level: 1 => 1500 - 1 * 300;
        clearInterval(interValGameRuning)
        interValGameRuning = setInterval(function() {
            if(score < SCORE_CHANGE_LEVEL_1) {
                levelGame = 0;
            }else if (score < SCORE_CHANGE_LEVEL_2) {
                levelGame = 1;
            }else if (score < SCORE_CHANGE_LEVEL_3) {
                levelGame = 2;
            }else {
                levelGame = 3;
            }
            resetInterval(levelGame);
            bubbleZone.appendChild(createRandomBubble());
        }, durationTime);
        currentLevel = level;
    }
}

//Function create bubble
function createRandomBubble () {
    //Initital attribute bubble
    const bubble = document.createElement('div');
    let wordRandom = JPWord[Math.floor(Math.random()*JPWord.length)];
    while(checkWordIsRunning(wordRandom.key)) {
        wordRandom = JPWord[Math.floor(Math.random()*JPWord.length)];
    }
    var scoreBubble = wordRandom.score;
    const randomID = Math.floor(Math.random() * 99999999999999);
    const position = randomPosition[Math.floor(Math.random()*randomPosition.length)];
    const probabilityBoom = Math.floor(Math.random()*100);
    const probabilityStar = Math.floor(Math.random()*100);
    const isBubbleBoom = probabilityBoom <= PROBABILITY_BOOM;
    const starBubble = probabilityStar <= PROBABILITY_STAR;
    var duration = TIME_DURATION_START - (levelGame * TIME_LEVEL_DURATION_MINUS);
    // Minimum duration
    if(duration < MINUMIM_TIME_DURATION) {
        duration = MINUMIM_TIME_DURATION;
    }
    
    wordRuningList.push(wordRandom.key);

    //Check and setting bubble classification
    if(isBubbleBoom) {
        bubble.classList.add('boom');
    }else{
        if(starBubble) {
            bubble.classList.add('star');
            scoreBubble *= 2;
        }
        bubble.addEventListener('click', function (){
            shootBubbleByArrow(wordRandom.key)
        });
    }
    
    //Setting data check DOM bubble
    bubble.setAttribute('data-score', scoreBubble)
    bubble.setAttribute('data-id', randomID)
    bubble.classList.add('bubble')
    bubble.id = 'bubble-'+wordRandom.key;

    //Setting random position
    bubble.style.cssText = `
        left: ${position}%;
    `

    //Render in game zone
    bubble.appendChild(document.createTextNode(wordRandom.word))
    
    //Setting Animation
    bubble.animate([
        // keyframes
        { transform: 'translateY(0px)' },
        { transform: `translateY(${RED_LINE_POSITION - BUBBLE_SIZE}px)` }
        ], {
        // timing options
        duration: duration,
        });
    setTimeout(function() {
        bubbleHasFloor(wordRandom.key, randomID);
    },duration)
    
    return bubble;
}

//Function check bubble hit a floor
function bubbleHasFloor(bubble_key, bubble_id) {
    const bubbleAvailable = document.getElementById('bubble-' + bubble_key);
    if(bubbleAvailable && !isGameOver) {
        const isBubbleBoom = bubbleAvailable.classList.contains('boom');
        const isBubbleId = bubbleAvailable.dataset.id == bubble_id;
        if(isBubbleId && isBubbleBoom) {
            bubbleAvailable.remove();
            filterWordRuning(bubble_key);
        }
        else if (isBubbleId) {
            isGameOver = true;
            gameOver();
        }
    }
}

// Game over funtion
function gameOver() {
    console.log('Game Over');
    gameZone.style.cursor = 'none';
    gameIsRunning = false;
    clearBubbleOnScreen();
    clearInterval(interValGameRuning);
    showModalGameOver();
}

// Clear all bubble when game over
function clearBubbleOnScreen() {
    const bubbleList = Array.from(document.getElementsByClassName('bubble'));
    wordRuningList = [];
    bubbleList.forEach(function(bubble) {
        bubble.remove();
    })
}

//Check bubble word availiabe
function checkWordIsRunning(word) {
    return wordRuningList.some(function(item) {
        return item == word;
    });
}

//Shoot bubble by arrow or score
function shootBubbleByArrow(bubble_id) {
    const bubbleAvailable = document.getElementById('bubble-' + bubble_id);
    if(bubbleAvailable && isArrowClick) {
        if(arrowClick <= 3 && arrowClick > 0) {
            bubbleAvailable.remove();
            updateArrow(true);
            filterWordRuning(bubble_id);
        }
        else if (score >= 10) {
            updateScore(-ARROW_CHANGE_SCORE);
            bubbleAvailable.remove();
            filterWordRuning(bubble_id);
        }
    }
}

//Remove bubble word after remove
function filterWordRuning (bubble_id) {
    wordRuningList = wordRuningList.filter(function(item){
        return item != bubble_id; 
    });
}

//Update score to client
function updateScore (scoreInput) {
    if(scoreInput) {
        score = score + scoreInput;
    }
    scoreElement.innerText = `Score: ${score}`;
}

//Update arrow free to client
function updateArrow (minusArrow) {
    if(minusArrow) {
        arrowClick -= 1;
    }
    arrowElement.innerText = `Arrow: ${arrowClick}`;
}

//Update level to client
function updateLevel (level) {
    if(level != currentLevel) {
        levelElement.innerText = `Level: ${levelGame}`;
    }
}

//Game Over show modal
function showModalGameOver(){
    scoreGameOver.innerText = score;
    $('#modal-game-over').modal('show');
}

//Set event for button start game
Array.from(startButton).forEach(function(button) {
    button.addEventListener('click', function(){
        if(!gameIsRunning)
        startGame();
    })
});

//Set event submit for input form
formInput.addEventListener('submit', function(e){
    e.preventDefault();
    const keyValue = inputData.value;
    if(checkWordIsRunning(keyValue)) {
        const bubbleAvailable = document.getElementById('bubble-' + keyValue);
        if(bubbleAvailable && bubbleAvailable.classList.contains('boom')) {
            gameOver();
        }
        else if(bubbleAvailable) {
            updateScore(parseInt(bubbleAvailable.dataset.score));
            filterWordRuning(keyValue);
            bubbleAvailable.remove();
        }
    }
    inputData.value = '';
})

//Set event click arrow spells
arrow.addEventListener('click', function(){
    if(gameIsRunning) {
        isArrowClick = !isArrowClick;
        if(isArrowClick) {
            gameZone.style.cursor = 'nw-resize';
        }else{
            gameZone.style.cursor = 'not-allowed';
        }
    }
})