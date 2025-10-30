class Tweet {
  private text: string;
  time: Date;

  constructor(tweet_text: string, tweet_time: string) {
    this.text = tweet_text;
    this.time = new Date(tweet_time); //, "ddd MMM D HH:mm:ss Z YYYY"
  }

  // TWEET CATEGORIES (1 POINT) - count the number of tweets in each category
  //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
  get source(): string {
    //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
    const t = this.text.toLowerCase().trim();

    // completed event
    if (
      t.startsWith("just completed") ||
      t.includes("completed a") ||
      t.includes("just posted")
    ) {
      return "completed_event";
    }

    // live event
    if (
      t.startsWith("just posted") ||
      t.includes("live on") ||
      t.includes("right now") ||
      t.includes("come join me") ||
      t.includes("live workout") ||
      t.includes("live activity")
    ) {
      return "live_event";
    }

    // achievement
    if (
      t.startsWith("i'm proud to have reached") ||
      t.includes("i just reached") ||
      t.includes("achieved") ||
      t.includes("achievement") ||
      t.includes("personal record") ||
      t.includes("goal") ||
      t.includes("new record") ||
      t.includes("pr")
    ) {
      return "achievement";
    }

    // miscellaneous
    if (t.includes("runkeeper") || t.includes("random")) {
      return "miscellaneous";
    }

    return "unknown";
  }

  // USER-WRITTEN TWEETS (1 POINT) - how much of the tweets have written text
  //returns a boolean, whether the text includes any content written by the person tweeting.
  get written(): boolean {
    //TODO: identify whether the tweet is written
    return this.writtenText.trim().length > 0;
  }

  get writtenText(): string {
    let s = this.text;

    const linkIdx = s.indexOf("http");
    if (linkIdx >= 0) s = s.slice(0, linkIdx);

    s = s
      .split("#RunKeeper")
      .join("")
      .split("#runkeeper")
      .join("")
      .split("@RunKeeper")
      .join("")
      .split("@runkeeper")
      .join("");

    const lower = s.toLowerCase();
    const phrases = ["with runkeeper", "using runkeeper", "via runkeeper"];
    let endIdx = -1;
    let phraseLen = 0;
    for (const p of phrases) {
      const idx = lower.indexOf(p);
      if (idx >= 0) {
        endIdx = idx;
        phraseLen = p.length;
        break;
      }
    }

    let tail = endIdx >= 0 ? s.slice(endIdx + phraseLen) : s;

    const seps = [" - ", ": ", " | ", " — ", " – "];
    let cut = -1;
    let sepLen = 0;
    for (const sep of seps) {
      const i = tail.lastIndexOf(sep);
      if (i > cut) {
        cut = i;
        sepLen = sep.length;
      }
    }
    if (cut === -1) {
      return "";
    }
    tail = tail.slice(cut + sepLen);

    tail = tail.trim();
    while (tail.indexOf("  ") !== -1) tail = tail.replace("  ", " ");

    const t = tail.toLowerCase();
    const cannedStarts = ["check it out", "more here", "see details"];
    for (const c of cannedStarts) {
      if (t.startsWith(c)) return "";
    }

    let hasLetter = false;
    for (let i = 0; i < tail.length; i++) {
      const ch = tail[i];
      if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z")) {
        hasLetter = true;
        break;
      }
    }
    if (!hasLetter) return "";

    return tail;
  }

  // ACTIVITY TYPE + DISTANCE (2 POINT) - parse the activity type from the text of the tweet
  get activityType(): string {
    if (this.source !== "completed_event") return "unknown";

    const t = this.text.toLowerCase();

    if (t.includes(" run ") || t.endsWith(" run") || t.includes(" running"))
      return "Run";
    if (t.includes(" walk") || t.includes(" walking")) return "Walk";
    if (
      t.includes(" bike") ||
      t.includes(" biking") ||
      t.includes(" cycling") ||
      t.includes(" ride")
    )
      return "Bike";
    if (t.includes(" hike")) return "Hike";
    if (t.includes(" swim")) return "Swim";
    if (t.includes(" yoga")) return "Yoga";
    if (t.includes(" elliptical")) return "Elliptical";
    if (t.includes(" snowboard")) return "Snowboarding";
    if (t.includes(" row") || t.includes(" rowing")) return "Row";
    if (t.includes(" skateboard") || t.includes(" skating")) return "Skate";

    return "Other";
  }

  // ACTIVITY TYPE + DISTANCE (2 POINT) - parse the activity type from the text of the tweet
  get distance(): number {
    if (this.source != "completed_event") {
      return 0;
    }
    //TODO: prase the distance from the text of the tweet
    const lowered = this.text.toLowerCase();
    const parts = lowered.trim().split(" ");
    for (let i = 0; i < parts.length - 1; i++) {
      const val = parseFloat(parts[i]);
      const unit = parts[i + 1];
      if (!isNaN(val) && (unit === "mi" || unit === "km")) {
        if (unit === "mi") return val;
        return val * 0.621371;
      }
    }
    return 0;
  }

  getHTMLTableRow(rowNumber: number): string {
    //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
    const activityDisplay = this.activityType
      ? this.activityType.toLowerCase()
      : "";

    const linkedText = this.text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank">$1</a>'
    );

    return `
      <tr>
        <td>${rowNumber}</td>
        <td>${activityDisplay}</td>
        <td>${linkedText}</td>
      </tr>
    `;
  }
}
