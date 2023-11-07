const autoCompleteConfig = {
    renderOption(movie) {
        const imgSrc = movie.Poster == 'N/A' ? '' : movie.Poster;
        return `
        <img src="${imgSrc}" />
        ${movie.Title}
       (${movie.Year})
        `;
    },
    inputValue(movie) {
        return movie.Title;
    },
    async fetchData(searchTerm) {
        const response = await axios.get('https://www.omdbapi.com/', {
            params: {
                apikey: '571e774',
                s: searchTerm,
            },
        });

        if (response.data.Error) {
            return [];
        }
        return response.data.Search;
    },
};
createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector('#left-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
    },
});
createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector('#right-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
    },
});

let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, summaryElement, side) => {
    const response = await axios.get('https://www.omdbapi.com/', {
        params: {
            apikey: '571e774',
            i: movie.imdbID,
        },
    });

    summaryElement.innerHTML = movieTemplate(response.data);

    if (side === 'left') {
        leftMovie = response.data;
    } else {
        rightMovie = response.data;
    }

    const runComparison = () => {
        const leftSideStats = document.querySelectorAll('#left-summary .notification');
        const rightSideStats = document.querySelectorAll('#right-summary .notification');
        const summary = document.querySelector('#summary');
        const summaryHeader = document.querySelector('#summaryHeader');
        const summaryText = document.querySelector('#summaryText');
        summary.classList.add('is-hidden');
        let leftTotal = 0;
        let rightTotal = 0;
        leftSideStats.forEach((leftStat, index) => {
            const rightStat = rightSideStats[index];
            let leftSideValue = parseFloat(leftStat.dataset.value);
            let rightSideValue = parseFloat(rightStat.dataset.value);
            if (isNaN(leftSideValue)) leftSideValue = 0;
            if (isNaN(rightSideValue)) rightSideValue = 0;
            console.log(leftSideValue, rightSideValue);
            if (rightSideValue > leftSideValue) {
                // RIGHT SIDE WINS
                rightTotal++;
                setStyles(rightStat, leftStat);
            } else if (leftSideValue > rightSideValue) {
                // LEFT SIDE WINS
                leftTotal++;
                setStyles(leftStat, rightStat);
            } else if (rightSideValue === leftSideValue) {
                // DRAW
                setStyles(leftStat, rightStat, true);
            }
            console.log(leftTotal, rightTotal);
        });

        summary.classList.remove('is-hidden');
        summaryHeader.innerHTML = `${leftTotal} - ${rightTotal}`;
        if (leftTotal > rightTotal) {
            summaryText.innerHTML = `${leftMovie.Title} wins!`;
        } else if (rightTotal > leftTotal) {
            summaryText.innerHTML = `${rightMovie.Title} wins!`;
        } else {
            summaryText.innerHTML = "It's a draw!";
        }
    };

    const setStyles = (winner, loser, draw = false) => {
        if (!draw) {
            winner.classList.add('is-primary');
            winner.classList.remove('is-warning');
            winner.classList.remove('is-danger');
            loser.classList.add('is-danger');
            loser.classList.remove('is-primary');
            loser.classList.remove('is-warning');
        } else {
            winner.classList.add('is-warning');
            winner.classList.remove('is-primary');
            winner.classList.remove('is-danger');
            loser.classList.add('is-warning');
            loser.classList.remove('is-primary');
            loser.classList.remove('is-danger');
        }
    };

    if (leftMovie && rightMovie) {
        runComparison();
    }
};

const movieTemplate = (movieDetail) => {
    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
    const metaScore = parseInt(movieDetail.Metascore);
    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));

    const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
        const value = parseInt(word);
        if (isNaN(value)) {
            return prev;
        } else {
            return prev + value;
        }
    }, 0);

    return `
    <article class="media">
        <figure class="media-left">
            <p class="image">
                <img src="${movieDetail.Poster}" />
            </p>
        </figure>
        <div class="media-content">
            <div class="content">
                <h1>${movieDetail.Title}</h1>
                <h4>${movieDetail.Genre}</h4>
                <p>${movieDetail.Plot}</p>
            </div>
        </div>
        </article>
        <article data-value=${awards} class="notification is-primary">
            <p class="title">${movieDetail.Awards}</p>
            <p class="subtitle">Awards</p>
        </article>
        <article data-value=${dollars} class="notification is-primary">
            <p class="title">${movieDetail.BoxOffice}</p>
            <p class="subtitle">BoxOffice</p>
        </article>
        <article data-value=${metaScore} class="notification is-primary">
            <p class="title">${movieDetail.Metascore}</p>
            <p class="subtitle">Metascore</p>
        </article>
        <article data-value=${imdbRating} class="notification is-primary">
            <p class="title">${movieDetail.imdbRating}</p>
            <p class="subtitle">IMDB Rating</p>
        </article>
        <article data-value=${imdbVotes} class="notification is-primary">
            <p class="title">${movieDetail.imdbVotes}</p>
            <p class="subtitle">IMDB Votes</p>
        </article>
    `;
};
