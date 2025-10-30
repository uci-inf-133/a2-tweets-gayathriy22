function parseTweets(runkeeper_tweets) {
  //Do not proceed if no tweets loaded
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  tweet_array = runkeeper_tweets.map(function (tweet) {
    return new Tweet(tweet.text, tweet.created_at);
  });

  // TWEET DATES (1 POINT) - find the earliest/latest tweetS
  let earliestTweet = tweet_array[0];
  let latestTweet = tweet_array[0];
  tweet_array.forEach(function (tweet) {
    if (tweet.time < earliestTweet.time) {
      earliestTweet = tweet;
    }
    if (tweet.time > latestTweet.time) {
      latestTweet = tweet;
    }
  });

  firstDate = earliestTweet.time.toUTCString();
  lastDate = latestTweet.time.toUTCString();

  firstDate = earliestTweet.time.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  lastDate = latestTweet.time.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });


  document.getElementById("firstDate").textContent = firstDate;
  document.getElementById("lastDate").textContent = lastDate;

  // TWEET CATEGORIES (1 POINT) - count the number of tweets in each category
  // --- count tweet categories ---
  let completedCount = 0;
  let liveCount = 0;
  let achievementCount = 0;
  let miscCount = 0;

  tweet_array.forEach(function (tweet) {
    if (tweet.source === "completed_event") completedCount++;
    else if (tweet.source === "live_event") liveCount++;
    else if (tweet.source === "achievement") achievementCount++;
    else if (tweet.source === "miscellaneous") miscCount++;
  });

  const total = tweet_array.length;

  // calculate percentages with math.js formatting
  const completedPercent =
    math.format((completedCount / total) * 100, {
      notation: "fixed",
      precision: 2,
    }) + "%";
  const livePercent =
    math.format((liveCount / total) * 100, {
      notation: "fixed",
      precision: 2,
    }) + "%";
  const achievementPercent =
    math.format((achievementCount / total) * 100, {
      notation: "fixed",
      precision: 2,
    }) + "%";
  const miscPercent =
    math.format((miscCount / total) * 100, {
      notation: "fixed",
      precision: 2,
    }) + "%";

  console.log(`Completed Events: ${completedCount} (${completedPercent})`);
  console.log(`Live Events: ${liveCount} (${livePercent})`);
  console.log(`Achievements: ${achievementCount} (${achievementPercent})`);
  console.log(`Miscellaneous: ${miscCount} (${miscPercent})`);

  // update HTML spans
  document.getElementById("numberTweets").textContent = total;
  Array.from(document.getElementsByClassName("completedEvents")).forEach(
    function (element) {
      element.textContent = completedCount;
    }
  );
  Array.from(document.getElementsByClassName("liveEvents")).forEach(function (
    element
  ) {
    element.textContent = liveCount;
  });
  Array.from(document.getElementsByClassName("achievements")).forEach(function (
    element
  ) {
    element.textContent = achievementCount;
  });
  Array.from(document.getElementsByClassName("miscellaneous")).forEach(
    function (element) {
      element.textContent = miscCount;
    }
  );
  Array.from(document.getElementsByClassName("completedEventsPct")).forEach(
    function (element) {
      element.textContent = completedPercent;
    }
  );
  Array.from(document.getElementsByClassName("liveEventsPct")).forEach(
    function (element) {
      element.textContent = livePercent;
    }
  );
  Array.from(document.getElementsByClassName("achievementsPct")).forEach(
    function (element) {
      element.textContent = achievementPercent;
    }
  );
  Array.from(document.getElementsByClassName("miscellaneousPct")).forEach(
    function (element) {
      element.textContent = miscPercent;
    }
  );

  // USER-WRITTEN TWEETS (1 POINT) - count the number of user-written tweets
  const completedTweets = tweet_array.filter(
    (t) => t.source === "completed_event"
  );
  const writtenCount = completedTweets.filter((t) => t.written).length;

  const writtenPct =
    math.format((writtenCount / Math.max(1, completedTweets.length)) * 100, {
      notation: "fixed",
      precision: 2,
    }) + "%";

  document
    .querySelectorAll(".completedEvents")
    .forEach((n) => (n.textContent = String(completedTweets.length)));
  document
    .querySelectorAll(".written")
    .forEach((n) => (n.textContent = String(writtenCount)));
  document
    .querySelectorAll(".writtenPct")
    .forEach((n) => (n.textContent = String(writtenPct)));

  //This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
  //It works correctly, your task is to update the text of the other tags in the HTML file!
  document.getElementById("numberTweets").innerText = tweet_array.length;
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
  loadSavedRunkeeperTweets().then(parseTweets);
});
