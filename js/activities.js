function dayName(d) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

function parseTweets(runkeeper_tweets) {
  //Do not proceed if no tweets loaded
  if (runkeeper_tweets === undefined) {
    window.alert("No tweets returned");
    return;
  }

  tweet_array = runkeeper_tweets.map(function (tweet) {
    return new Tweet(tweet.text, tweet.created_at);
  });

  //TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
  // ACTIVITY TYPE + DISTANCE (2 POINT) - parse the activity type from the text of the tweet

  const completed = tweet_array
    .filter((t) => t.source === "completed_event")
    .map((t) => ({
      activity: t.activityType,
      distance: t.distance,
      day: dayName(t.time),
      date: t.time,
    }))
    // keep only distance-based activities (distance > 0)
    .filter(
      (r) =>
        r.distance > 0 && r.activity !== "unknown" && r.activity !== "Other"
    );

  // --- counts by activity ---
  // total number of unique activities
  const allCompleted = tweet_array.filter(
    (t) => t.source === "completed_event"
  );
  const uniqueTypes = new Set(
    allCompleted.map((t) => t.activityType).filter((a) => a && a !== "unknown") // keep real labels; include Yoga/etc.
  );
  const totalTypes = uniqueTypes.size;
  document.getElementById("numberActivities").textContent = totalTypes;

  // Top 3 activities
  const counts = {};
  for (const r of completed) {
    counts[r.activity] = (counts[r.activity] || 0) + 1;
  }
  const byFreq = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top3 = byFreq.slice(0, 3).map(([a]) => a);

  const countData = byFreq.map(([activity, count]) => ({
    activity: activity,
    count: count,
  }));

  let activityNode = document.getElementById("activityVis");
  if (!activityNode) {
    activityNode = document.createElement("div");
    activityNode.id = "activityVis";
    const mainEl = document.querySelector("main") || document.body;
    mainEl.insertBefore(activityNode, mainEl.firstChild);
  }

  const activity_vis_spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Number of tweets per activity type.",
    data: {
      values: countData,
    },
    mark: "bar",
    encoding: {
      x: {
        field: "activity",
        type: "nominal",
        sort: "-y",
        title: "Activity type",
      },
      y: {
        field: "count",
        type: "quantitative",
        title: "Number of tweets",
      },
      tooltip: [
        { field: "activity", title: "Activity type" },
        { field: "count", title: "Tweets" },
      ],
    },
  };
  vegaEmbed("#activityVis", activity_vis_spec, { actions: false });

  // dom updates
  document.getElementById("firstMost").textContent = top3[0] || "—";
  document.getElementById("secondMost").textContent = top3[1] || "—";
  document.getElementById("thirdMost").textContent = top3[2] || "—";

  document.getElementById("longestActivityType").textContent = "bike";
  document.getElementById("shortestActivityType").textContent = "walk";
  document.getElementById("weekdayOrWeekendLonger").textContent = "weekends";

  //TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
  //Use those visualizations to answer the questions about which activities tended to be longest and when.

  const top3Data = completed.filter((r) => top3.includes(r.activity));
  const rawData = top3Data.map((r) => ({
    day: r.day,
    distance: r.distance,
    activity: r.activity,
  }));

  let top3Node = document.getElementById("top3Vis");
  if (!top3Node) {
    top3Node = document.createElement("div");
    top3Node.id = "top3Vis";
    (document.querySelector("main") || document.body).appendChild(top3Node);
  }

  let btn = document.getElementById("aggregate");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "aggregate";
    btn.type = "button";
    btn.textContent = "Show means";
    // put button just before the chart
    (document.querySelector("main") || document.body).insertBefore(
      btn,
      top3Node
    );
  }

  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // PLOT 1: all individual activities (raw distances)
  const rawSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description:
      "All distances for the 3 most tweeted-about activities by day of week.",
    data: { values: rawData },
    mark: "point",
    encoding: {
      x: {
        field: "day",
        type: "nominal",
        sort: dayOrder,
        title: "time (day)",
      },
      y: {
        field: "distance",
        type: "quantitative",
        title: "distance",
      },
      color: {
        field: "activity",
        type: "nominal",
        title: "activityType",
      },
      tooltip: [
        { field: "activity", title: "activityType" },
        { field: "day", title: "day" },
        { field: "distance", type: "quantitative", title: "distance" },
      ],
    },
  };

  // PLOT 2: mean distance per activity per day
  const aggSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description:
      "Mean distance for each of the 3 most tweeted-about activities by day of week.",
    data: { values: rawData },
    mark: "point",
    encoding: {
      x: {
        field: "day",
        type: "nominal",
        sort: dayOrder,
        title: "time (day)",
      },
      y: {
        aggregate: "mean",
        field: "distance",
        type: "quantitative",
        title: "Mean of distance",
      },
      color: {
        field: "activity",
        type: "nominal",
        title: "activityType",
      },
      tooltip: [
        { field: "activity", title: "activityType" },
        { field: "day", title: "day" },
        {
          aggregate: "mean",
          field: "distance",
          type: "quantitative",
          title: "Mean of distance",
        },
      ],
    },
  };

  vegaEmbed("#top3Vis", rawSpec, { actions: false });
  let showingAgg = false;
  btn.addEventListener("click", () => {
    showingAgg = !showingAgg;

    if (showingAgg) {
      vegaEmbed("#top3Vis", aggSpec, { actions: false });
      btn.textContent = "Show all activities";
    } else {
      vegaEmbed("#top3Vis", rawSpec, { actions: false });
      btn.textContent = "Show means";
    }
  });
}

//Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function (event) {
  loadSavedRunkeeperTweets().then(parseTweets);
});
