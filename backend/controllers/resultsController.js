const fs = require("fs");

const groups = JSON.parse(
  fs.readFileSync("./data/groups.json", {
    encoding: "utf8",
    flag: "r",
  })
);

const exibitions = JSON.parse(
  fs.readFileSync("./data/exibitions.json", {
    encoding: "utf-8",
    flag: "r",
  })
);

exports.getTurnamentResults = async (req, res, next) => {
  const simulateMatch = (
    team1,
    team2,
    pointsTable,
    headToHead,
    pointsStats
  ) => {
    const totalRanking = team1.FIBARanking + team2.FIBARanking;
    const team1Weight = (totalRanking - team1.FIBARanking) / totalRanking;
    const team2Weight = (totalRanking - team2.FIBARanking) / totalRanking;

    const baseScore = 80;
    const variability = 20;
    const randomScore = Math.floor(Math.random() * variability) + baseScore;

    let team1Score, team2Score, winner;

    if (Math.random() < team1Weight) {
      team1Score = randomScore + Math.floor(Math.random() * 10);
      team2Score = randomScore - Math.floor(Math.random() * 10);
      winner = team1.Team;

      pointsTable[team1.Team] += 2;
      pointsTable[team2.Team] += 1;
    } else {
      team2Score = randomScore + Math.floor(Math.random() * 10);
      team1Score = randomScore - Math.floor(Math.random() * 10);
      winner = team2.Team;

      pointsTable[team2.Team] += 2;
      pointsTable[team1.Team] += 1;
    }

    headToHead[team1.Team] = headToHead[team1.Team] || {};
    headToHead[team2.Team] = headToHead[team2.Team] || {};
    headToHead[team1.Team][team2.Team] = winner;
    headToHead[team2.Team][team1.Team] = winner;

    pointsStats[team1.Team].scored += team1Score;
    pointsStats[team1.Team].received += team2Score;
    pointsStats[team2.Team].scored += team2Score;
    pointsStats[team2.Team].received += team1Score;

    return {
      match: `${team1.Team} ${team1Score} : ${team2Score} ${team2.Team}`,
      winner,
    };
  };

  const simulateGroupStage = (group) => {
    const pointsTable = {};
    const pointsStats = {};
    const headToHead = {};
    const matchResults = [];
    const teams = group.map((team) => team.Team);

    teams.forEach((team) => {
      pointsTable[team] = 0;
      pointsStats[team] = { scored: 0, received: 0, difference: 0 };
    });

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const team1 = group[i];
        const team2 = group[j];
        const result = simulateMatch(
          team1,
          team2,
          pointsTable,
          headToHead,
          pointsStats
        );
        matchResults.push(result);
      }
    }

    Object.keys(pointsStats).forEach((team) => {
      pointsStats[team].difference =
        pointsStats[team].scored - pointsStats[team].received;
    });

    const tableFinalPoints = Object.entries(pointsTable).sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      } else {
        const teamA = a[0];
        const teamB = b[0];
        if (headToHead[teamA][teamB] === teamA) {
          return -1;
        } else {
          return 1;
        }
      }
    });

    return { matchResults, pointsTable: tableFinalPoints, pointsStats };
  };

  const createNewGroups = (group1, group2, group3) => {
    let newGroups = [];
    for (let i = 0; i < 3; i++) {
      newGroups[i] = [
        group1.pointsTable[i],
        group2.pointsTable[i],
        group3.pointsTable[i],
      ];
    }

    return [...newGroups[0], ...newGroups[1], ...newGroups[2]];
  };

  const groupAResults = simulateGroupStage(groups.A);
  const groupBResults = simulateGroupStage(groups.B);
  const groupCResults = simulateGroupStage(groups.C);

  const newHatGroup = createNewGroups(
    groupAResults,
    groupBResults,
    groupCResults
  );

  const sortedTeams = newHatGroup.sort((a, b) => b[1] - a[1]);

  const simulateMatchKnockOut = (team1, team2) => {
    const score1 = Math.floor(Math.random() * 50) + 70;
    const score2 = Math.floor(Math.random() * 50) + 70;
    return { team1, team2, score1, score2 };
  };

  const createKnockoutStage = (teams) => {
    const matchups = [
      { match: `${teams[0][0]} vs ${teams[7][0]}`, round: "Quarterfinals" },
      { match: `${teams[1][0]} vs ${teams[6][0]}`, round: "Quarterfinals" },
      { match: `${teams[2][0]} vs ${teams[5][0]}`, round: "Quarterfinals" },
      { match: `${teams[3][0]} vs ${teams[4][0]}`, round: "Quarterfinals" },
    ];

    const quarterFinalResults = matchups.map(({ match, round }) => {
      const [team1, team2] = match.split(" vs ");
      const { score1, score2 } = simulateMatchKnockOut(team1, team2);
      const winner = score1 > score2 ? team1 : team2;
      return {
        round,
        team1,
        score1,
        team2,
        score2,
        winner,
        loser: score1 > score2 ? team2 : team1,
      };
    });

    const semiFinals = [
      {
        match: `${quarterFinalResults[0].winner} vs ${quarterFinalResults[1].winner}`,
        round: "Semi-Finals",
      },
      {
        match: `${quarterFinalResults[2].winner} vs ${quarterFinalResults[3].winner}`,
        round: "Semi-Finals",
      },
    ];

    const semiFinalResults = semiFinals.map(({ match, round }) => {
      const [team1, team2] = match.split(" vs ");
      const { score1, score2 } = simulateMatchKnockOut(team1, team2);
      const winner = score1 > score2 ? team1 : team2;
      const loser = score1 > score2 ? team2 : team1;
      return { round, team1, score1, team2, score2, winner, loser };
    });

    // Simulate Final
    const finalMatch = `${semiFinalResults[0].winner} vs ${semiFinalResults[1].winner}`;
    const { score1, score2 } = simulateMatchKnockOut(
      semiFinalResults[0].winner,
      semiFinalResults[1].winner
    );
    const champion =
      score1 > score2 ? semiFinalResults[0].winner : semiFinalResults[1].winner;
    const finalResult = {
      round: "Final",
      team1: semiFinalResults[0].winner,
      score1,
      team2: semiFinalResults[1].winner,
      score2,
      champion,
    };

    // Simulate Third Place Match between the losers of the semi-finals
    const thirdPlaceMatch = `${semiFinalResults[0].loser} vs ${semiFinalResults[1].loser}`;
    const { score1: thirdPlaceScore1, score2: thirdPlaceScore2 } =
      simulateMatchKnockOut(
        semiFinalResults[0].loser,
        semiFinalResults[1].loser
      );
    const thirdPlaceWinner =
      thirdPlaceScore1 > thirdPlaceScore2
        ? semiFinalResults[0].loser
        : semiFinalResults[1].loser;

    const thirdPlaceResult = {
      round: "Third Place",
      team1: semiFinalResults[0].loser,
      score1: thirdPlaceScore1,
      team2: semiFinalResults[1].loser,
      score2: thirdPlaceScore2,
      winner: thirdPlaceWinner,
    };

    return {
      quarterFinalResults,
      semiFinalResults,
      finalResult,
      thirdPlaceResult,
      secondPlace: finalResult.team2,
      semiFinalists: [semiFinalResults[0].winner, semiFinalResults[1].winner],
      champion: finalResult.champion,
    };
  };

  // Example usage
  const results = createKnockoutStage(sortedTeams);
  res.json({
    groupA: groupAResults,
    groupB: groupBResults,
    groupC: groupCResults,
    newHatGroup,
    quarterFinalResults: results.quarterFinalResults,
    semiFinalResults: results.semiFinalResults,
    finalResult: results.finalResult,
    thirdPlaceResult: results.thirdPlaceResult,
    secondPlace: results.secondPlace,
    semiFinalists: results.semiFinalists,
    champion: results.champion,
  });
};
