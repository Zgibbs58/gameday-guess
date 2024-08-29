import Image from "next/image";
import TeamScore from "./components/TeamScore";
import ScoreBoard from "./components/ScoreBoard";

const players: { name: string; score: number }[] = [
  { name: "Scott", score: 73 },
  { name: "Scott", score: 65 },
  // { name: "Scott", score: 55 },
  // { name: "Scott", score: 43 },
  // { name: "Scott", score: 90 },
  // { name: "Scott", score: 30 },
];

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between">
      {/* <TeamScore /> */}
      <h1 className="text-3xl font-bold text-tenOrange text-center">
        Welcome to
        <br />
        <span className="text-5xl">Gameday Guess</span>
      </h1>
      {players.length >= 6 ? (
        <ScoreBoard players={players} teamScore={50} />
      ) : (
        <>
          <form className="flex flex-col justify-center gap-2 py-10 text-smokeGray">
            <input
              className="border-2 focus:outline-tenOrange rounded-sm"
              type="text"
              id="name"
              placeholder="Enter your name"
              minLength={2}
              maxLength={10}
              required
            />
            <input
              className="border-2 focus:outline-tenOrange rounded-sm"
              type="number"
              id="score"
              placeholder="Enter your guess"
              min={0}
              max={400}
              required
            />
            <button className="bg-tenOrange text-white rounded-xl" type="submit">
              Submit
            </button>
          </form>
          <ScoreBoard players={players} teamScore={50} />
        </>
      )}
      <details className="pt-12">
        <summary>Click for game rules</summary>
        <ol className="list-decimal list-inside text-centlefter">
          <li>Enter the ammount of points UT will score in this game.</li>
          <li>If UT&apos;s score gets higher than your guess, you lose.</li>
          <li>Closest score still in play at the end wins.</li>
        </ol>
      </details>
    </main>
  );
}

//request example for all football games of 2024
//https://ncaa-api.henrygd.me/scoreboard/football/fbs/2024

// {
//       "game": {
//         "gameID": "36896",
//         "away": {
//           "score": "",
//           "names": {
//             "char6": "CHAT",
//             "short": "Chattanooga",
//             "seo": "chattanooga",
//             "full": "University of Tennessee at Chattanooga"
//           },
//           "winner": false,
//           "seed": "",
//           "description": "(0-0)",
//           "rank": "",
//           "conferences": [
//             {
//               "conferenceName": "SoCon",
//               "conferenceSeo": "socon"
//             }
//           ]
//         },
//         "finalMessage": "",
//         "bracketRound": "",
//         "title": "Tennessee Chattanooga",
//         "contestName": "",
//         "url": "/game/6306364",
//         "network": "",
//         "home": {
//           "score": "",
//           "names": {
//             "char6": "TENN",
//             "short": "Tennessee",
//             "seo": "tennessee",
//             "full": "University of Tennessee, Knoxville"
//           },
//           "winner": false,
//           "seed": "",
//           "description": "(0-0)",
//           "rank": "15",
//           "conferences": [
//             {
//               "conferenceName": "SEC",
//               "conferenceSeo": "sec"
//             },
//             {
//               "conferenceName": "Top 25",
//               "conferenceSeo": "top-25"
//             }
//           ]
//         },
//         "liveVideoEnabled": false,
//         "startTime": "12:45PM ET",
//         "startTimeEpoch": "1725122700",
//         "bracketId": "",
//         "gameState": "pre",
//         "startDate": "08-31-2024",
//         "currentPeriod": "",
//         "videoState": "",
//         "bracketRegion": "",
//         "contestClock": ""
//       }
//     },
