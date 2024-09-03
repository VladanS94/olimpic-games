import React, { useState } from "react";
import axios from "axios";

function App() {
  const [results, setResults] = useState(null);

  const handleSimulate = async () => {
    try {
      const response = await axios.get("http://localhost:5000/results");
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching simulation results:", error);
    }
  };

  const renderGroupResults = (groupName, groupData) => {
    if (
      groupName === "newHatGroup" ||
      groupName === "quarterFinalResults" ||
      groupName === "semiFinalResults" ||
      groupName === "finalResult" ||
      groupName === "thirdPlaceResult" ||
      groupName === "secondPlace" ||
      groupName === "semiFinalists" ||
      groupName === "secondPlace" ||
      groupName === "champion"
    ) {
      return null;
    }

    if (
      !groupData ||
      !groupData.matchResults ||
      !groupData.pointsTable ||
      !groupData.pointsStats
    ) {
      return <p key={groupName}>Invalid data for {groupName}</p>;
    }

    return (
      <div key={groupName}>
        <h2 className="group-title">{groupName}</h2>
        <ul>
          {groupData.matchResults.map((item, index) => (
            <li key={index}>
              {item.match}: Winner is {item.winner}
            </li>
          ))}
        </ul>
        <h3 className="table-points-title">Points Table {groupName}</h3>
        <ol>
          {groupData.pointsTable.map(([team, points], index) => (
            <li className="table-points-list" key={index}>
              {team}: {points} {" / "}
              {groupData.pointsStats[team]?.scored} | {"/"}
              {groupData.pointsStats[team]?.received} | {" / "}
              {groupData.pointsStats[team]?.difference}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  const renderNewHatGroup = () => {
    if (!results || !results.newHatGroup) {
      return null;
    }

    return (
      <div>
        <h2>New Hat Group</h2>
        <ol className="new-hat-group">
          {results.newHatGroup.map(([team, points], index) => (
            <li key={index}>
              {team}: {points} points
            </li>
          ))}
        </ol>
      </div>
    );
  };

  const renderKnockoutResults = () => {
    const quarterFinalResults = results?.quarterFinalResults.map((quarter) => {
      return quarter;
    });

    const semiFinalistsResults = results?.semiFinalResults.map((semi) => {
      return semi;
    });

    const thirdPlaceMatch = results?.thirdPlaceResult;

    const finalResult = results?.finalResult;

    const thirdPlace = results?.thirdPlaceResult;

    return (
      <div>
        <h2>Knockout Stage Results</h2>
        <h3>Quarterfinals</h3>
        <ul>
          {quarterFinalResults?.map((match, index) => (
            <li key={index}>
              {match.round}: {match.team1} {match.score1} - {match.score2}{" "}
              {match.team2}: Winner is {match.winner}
            </li>
          ))}
        </ul>
        <h3>Semi-Finals</h3>
        <ul>
          {semiFinalistsResults?.map((match, index) => (
            <li key={index}>
              {match.round}: {match.team1} {match.score1} - {match.score2}{" "}
              {match.team2}: Winner is {match.winner}
            </li>
          ))}
        </ul>
        <h3>Third Place</h3>
        <p>
          {thirdPlace?.round}: {thirdPlace?.team1} {thirdPlace?.score1} -{" "}
          {thirdPlace?.score2} {thirdPlace?.team2}: Winner is{" "}
          {thirdPlace?.winner}
        </p>
        <h3>Final</h3>
        <p>
          {finalResult?.round}: {finalResult?.team1} {finalResult?.score1} -{" "}
          {finalResult?.score2} {finalResult?.team2}: Champion is{" "}
          {finalResult?.champion}
        </p>

        <h3>Medals</h3>

        <p>1.{finalResult?.champion}</p>
        <p>2.{results?.secondPlace}</p>
        <p>3.{thirdPlaceMatch?.winner}</p>
      </div>
    );
  };
  return (
    <div className="App">
      <h1>Olympic Basketball Tournament Simulation</h1>
      <button onClick={handleSimulate}>Simulate Tournament</button>
      <div className="group-stage">
        {results &&
          Object.entries(results).map(([groupName, groupData]) =>
            renderGroupResults(groupName, groupData)
          )}
      </div>
      {renderNewHatGroup()}
      {renderKnockoutResults()}
    </div>
  );
}

export default App;
