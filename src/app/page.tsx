import Image from "next/image";
import TeamScore from "./components/TeamScore";
import ScoreBoard from "./components/ScoreBoard";
import UserForm from "./components/UserForm";
import GameComponent from "./components/GameComponent";
import { getPlayersAndScores } from "./actions";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between pt-6 gap-12">
      {/* <TeamScore /> */}
      <h1 className="text-2xl font-bold text-tenOrange text-center">
        Welcome to
        <br />
        <span className="text-4xl">Gameday Guess</span>
      </h1>
      <GameComponent />
      <details className="bg-tenOrange text-white p-2 rounded-lg">
        <summary className="hover:cursor-pointer">Click for game rules</summary>
        <ol className="list-decimal list-inside text-centlefter mt-2 space-y-2">
          <li>Enter the amount of points UT will score in this game.</li>
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
