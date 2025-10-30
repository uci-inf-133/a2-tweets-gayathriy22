let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
  //Do not proceed if no tweets loaded
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  //TODO: Filter to just the written tweets
  const tweet_array = runkeeper_tweets.map(
    (t) => new Tweet(t.text, t.created_at)
  );
  writtenTweets = tweet_array.filter((t) => t.written);
}

function addEventHandlerForSearch() {
  //TODO: Search the written tweets as text is entered into the search box, and add them to the table
  const searchInput = document.getElementById("textFilter");
  const resultsTableBody = document.getElementById("tweetTable");
  const searchCountSpan = document.getElementById("searchCount");
  const searchTextSpan = document.getElementById("searchText");

  function renderResults() {
    const query = searchInput.value.toLowerCase().trim();
    resultsTableBody.innerHTML = "";

    if (query === "") {
      searchCountSpan.textContent = "0";
      searchTextSpan.textContent = "";
      return;
    }

    const matches = writtenTweets.filter((t) =>
      t.text.toLowerCase().includes(query)
    );

    searchCountSpan.textContent = String(matches.length);
    searchTextSpan.textContent = query;
    matches.forEach((tweet, idx) => {
      const rowHTML = tweet.getHTMLTableRow(idx + 1);
      resultsTableBody.insertAdjacentHTML("beforeend", rowHTML);
    });
  }

  searchInput.addEventListener("input", renderResults);

  renderResults();
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  addEventHandlerForSearch();
  loadSavedRunkeeperTweets().then(parseTweets);
});
