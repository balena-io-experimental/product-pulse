// Dummy date values - don't expect them to make sense
exports.sampleResponse = {
  legend: [0.2, 0.6, 0.9],
  data: {
    maintenance: {
      score: 0.58,
      details: [
        {
          criterion: "activity",
          description: "Has had 1 commit(s) in last 4 weeks",
          value: 6,
          score: 1,
          weight: 0.35,
          pass: true,
        },
        {
          criterion: "issues",
          description:
            "Percentage of issues that are open is less than 50% in last 3 months",
          value: 0.72,
          score: 0.72,
          weight: 0.3,
          pass: false,
        },
        {
          criterion: "organization",
          description: "20% of issues have labels in last 3 months",
          value: 0.24,
          score: 0.24,
          weight: 0.05,
          pass: true,
        },
        {
          criterion: "communication",
          description:
            "70% of issues have responses from maintainers in last 3 months",
          value: 0,
          score: 0,
          weight: 0.15,
          pass: false,
        },
        {
          criterion: "architecture",
          description: "Contains an ARCHITECTURE.md",
          value: 0,
          score: 0,
          weight: 0.15,
          pass: false,
        },
      ],
    },
    direction: {
      score: 0.4,
      details: [
        {
          criterion: "guidelines",
          description: "Has a CONTRIBUTING.md file",
          value: 0,
          score: 0,
          weight: 0.1,
          pass: false,
        },
        {
          criterion: "governance",
          description:
            ">=50% of closed PRs are reviewed or commented by core contributors",
          value: 0,
          score: 0,
          weight: 0.5,
          pass: false,
        },
        {
          criterion: "commits",
          description: ">=80% of commits are from core contributors",
          value: 1,
          score: 1,
          weight: 0.3,
          pass: true,
        },
        {
          criterion: "issues",
          description: "Has more than 0 issues assigned recently",
          value: 3,
          score: 1,
          weight: 0.1,
          pass: true,
        },
      ],
    },
    community: {
      score: 0.54,
      details: [
        {
          criterion: "sentiment",
          description: "Has at least 5 stars",
          value: 136,
          score: 1,
          weight: 0.25,
          pass: true,
        },
        {
          criterion: "development",
          description: "Has at least 5 forks",
          value: 57,
          score: 1,
          weight: 0.1,
          pass: true,
        },
        {
          criterion: "contributions",
          description:
            "15% of commits and PRs created by users not in core contributors in last 3 months",
          value: 0.07,
          score: 0.07,
          weight: 0.325,
          pass: false,
        },
        {
          criterion: "engagement",
          description:
            "30% of issues created by users not in core contributors in last 3 months",
          value: 0.52,
          score: 0.52,
          weight: 0.325,
          pass: true,
        },
      ],
    },
  }
};
