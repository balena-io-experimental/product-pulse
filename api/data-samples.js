// balena-io/balena-cli
const balenaCli = {
  legend: [0.2, 0.6, 0.9],
  data: {
    maintenance: {
      score: 0.53,
      details: [
        {
          criterion: "activity",
          description: "Has had 1 commit(s) in last 4 weeks",
          value: 20,
          score: 1,
          weight: 0.35,
          pass: true,
        },
        {
          criterion: "issues",
          description:
            "Percentage of issues that are open is less than 50% in last 3 months",
          value: 0.52,
          score: 0.52,
          weight: 0.3,
          pass: false,
        },
        {
          criterion: "organization",
          description: "20% of issues have labels in last 3 months",
          value: 0.44,
          score: 0.44,
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
      score: 0.47,
      details: [
        {
          criterion: "guidelines",
          description: "Has a CONTRIBUTING.md file",
          value: 1,
          score: 1,
          weight: 0.1,
          pass: true,
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
          value: 0.91,
          score: 0.91,
          weight: 0.3,
          pass: true,
        },
        {
          criterion: "issues",
          description: "Has more than 0 issues assigned recently",
          value: 14,
          score: 1,
          weight: 0.1,
          pass: true,
        },
      ],
    },
    community: {
      score: 0.55,
      details: [
        {
          criterion: "sentiment",
          description: "Has at least 5 stars",
          value: 927,
          score: 1,
          weight: 0.25,
          pass: true,
        },
        {
          criterion: "3rd party development",
          description: "Has at least 5 forks",
          value: 104,
          score: 1,
          weight: 0.1,
          pass: true,
        },
        {
          criterion: "contributions",
          description:
            "15% of commits and PRs created by users not in core contributors in last 3 months",
          value: 0.14,
          score: 0.14,
          weight: 0.325,
          pass: false,
        },
        {
          criterion: "engagement",
          description:
            "30% of issues created by users not in core contributors in last 3 months",
          value: 0.48,
          score: 0.48,
          weight: 0.325,
          pass: true,
        },
      ],
    },
  },
};

// balenalabs/balena-sound
const balenaSound = {
  legend: [0.2, 0.6, 0.9],
  data: {
    maintenance: {
      score: 0.69,
      details: [
        {
          criterion: "activity",
          description: "Has had 1 commit(s) in last 4 weeks",
          value: 2,
          score: 1,
          weight: 0.35,
          pass: true,
        },
        {
          criterion: "issues",
          description:
            "Percentage of issues that are open is less than 50% in last 3 months",
          value: 0.49,
          score: 0.49,
          weight: 0.3,
          pass: true,
        },
        {
          criterion: "organization",
          description: "20% of issues have labels in last 3 months",
          value: 0.85,
          score: 0.85,
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
          value: 1,
          score: 1,
          weight: 0.15,
          pass: true,
        },
      ],
    },
    direction: {
      score: 0.5,
      details: [
        {
          criterion: "guidelines",
          description: "Has a CONTRIBUTING.md file",
          value: 1,
          score: 1,
          weight: 0.1,
          pass: true,
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
      score: 0.64,
      details: [
        {
          criterion: "sentiment",
          description: "Has at least 5 stars",
          value: 1909,
          score: 1,
          weight: 0.25,
          pass: true,
        },
        {
          criterion: "3rd party development",
          description: "Has at least 5 forks",
          value: 357,
          score: 1,
          weight: 0.1,
          pass: true,
        },
        {
          criterion: "contributions",
          description:
            "15% of commits and PRs created by users not in core contributors in last 3 months",
          value: 0,
          score: 0,
          weight: 0.325,
          pass: false,
        },
        {
          criterion: "engagement",
          description:
            "30% of issues created by users not in core contributors in last 3 months",
          value: 0.88,
          score: 0.88,
          weight: 0.325,
          pass: true,
        },
      ],
    },
  },
};

// docker/cli
const dockerCli = {
  legend: [0.2, 0.6, 0.9],
  data: {
    maintenance: {
      score: 0.58,
      details: [
        {
          criterion: "activity",
          description: "Has had 1 commit(s) in last 4 weeks",
          value: 50,
          score: 1,
          weight: 0.35,
          pass: true,
        },
        {
          criterion: "issues",
          description:
            "Percentage of issues that are open is less than 50% in last 3 months",
          value: 0.65,
          score: 0.65,
          weight: 0.3,
          pass: false,
        },
        {
          criterion: "organization",
          description: "20% of issues have labels in last 3 months",
          value: 0.61,
          score: 0.61,
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
      score: 0.47,
      details: [
        {
          criterion: "guidelines",
          description: "Has a CONTRIBUTING.md file",
          value: 1,
          score: 1,
          weight: 0.1,
          pass: true,
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
          value: 0.91,
          score: 0.91,
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
      score: 0.73,
      details: [
        {
          criterion: "sentiment",
          description: "Has at least 5 stars",
          value: 3391,
          score: 1,
          weight: 0.25,
          pass: true,
        },
        {
          criterion: "3rd party development",
          description: "Has at least 5 forks",
          value: 1482,
          score: 1,
          weight: 0.1,
          pass: true,
        },
        {
          criterion: "contributions",
          description:
            "15% of commits and PRs created by users not in core contributors in last 3 months",
          value: 0.24,
          score: 0.24,
          weight: 0.325,
          pass: true,
        },
        {
          criterion: "engagement",
          description:
            "30% of issues created by users not in core contributors in last 3 months",
          value: 0.94,
          score: 0.94,
          weight: 0.325,
          pass: true,
        },
      ],
    },
  },
};

// BurntSushi/ripgrep
const ripgrep = {
  legend: [0.2, 0.6, 0.9],
  data: {
    maintenance: {
      score: 0.51,
      details: [
        {
          criterion: "activity",
          description: "Has had 1 commit(s) in last 4 weeks",
          value: 2,
          score: 1,
          weight: 0.35,
          pass: true,
        },
        {
          criterion: "issues",
          description:
            "Percentage of issues that are open is less than 50% in last 3 months",
          value: 0.42,
          score: 0.42,
          weight: 0.3,
          pass: true,
        },
        {
          criterion: "organization",
          description: "20% of issues have labels in last 3 months",
          value: 0.61,
          score: 0.61,
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
      score: 0.3,
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
          value: 0,
          score: 0,
          weight: 0.1,
          pass: false,
        },
      ],
    },
    community: {
      score: 0.78,
      details: [
        {
          criterion: "sentiment",
          description: "Has at least 5 stars",
          value: 30806,
          score: 1,
          weight: 0.25,
          pass: true,
        },
        {
          criterion: "3rd party development",
          description: "Has at least 5 forks",
          value: 1381,
          score: 1,
          weight: 0.1,
          pass: true,
        },
        {
          criterion: "contributions",
          description:
            "15% of commits and PRs created by users not in core contributors in last 3 months",
          value: 0.42,
          score: 0.42,
          weight: 0.325,
          pass: true,
        },
        {
          criterion: "engagement",
          description:
            "30% of issues created by users not in core contributors in last 3 months",
          value: 0.89,
          score: 0.89,
          weight: 0.325,
          pass: true,
        },
      ],
    },
  },
};

// cywang117/poe-base-item-downloader
const cywang117 = {
  legend: [0.2, 0.6, 0.9],
  data: {
    maintenance: {
      score: null,
      details: [
        {
          criterion: "activity",
          description: "Has had 1 commit(s) in last 4 weeks",
          value: 0,
          score: 0,
          weight: 0.35,
          pass: false,
        },
        {
          criterion: "issues",
          description:
            "Percentage of issues that are open is less than 50% in last 3 months",
          value: null,
          score: null,
          weight: 0.3,
          pass: false,
        },
        {
          criterion: "organization",
          description: "20% of issues have labels in last 3 months",
          value: null,
          score: null,
          weight: 0.05,
          pass: false,
        },
        {
          criterion: "communication",
          description:
            "70% of issues have responses from maintainers in last 3 months",
          value: null,
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
      score: null,
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
          value: null,
          score: null,
          weight: 0.5,
          pass: false,
        },
        {
          criterion: "commits",
          description: ">=80% of commits are from core contributors",
          value: null,
          score: null,
          weight: 0.3,
          pass: false,
        },
        {
          criterion: "issues",
          description: "Has more than 0 issues assigned recently",
          value: 0,
          score: 0,
          weight: 0.1,
          pass: false,
        },
      ],
    },
    community: {
      score: null,
      details: [
        {
          criterion: "sentiment",
          description: "Has at least 5 stars",
          value: 5,
          score: 1,
          weight: 0.25,
          pass: true,
        },
        {
          criterion: "3rd party development",
          description: "Has at least 5 forks",
          value: 0,
          score: 0,
          weight: 0.1,
          pass: false,
        },
        {
          criterion: "contributions",
          description:
            "15% of commits and PRs created by users not in core contributors in last 3 months",
          value: null,
          score: null,
          weight: 0.325,
          pass: false,
        },
        {
          criterion: "engagement",
          description:
            "30% of issues created by users not in core contributors in last 3 months",
          value: null,
          score: null,
          weight: 0.325,
          pass: false,
        },
      ],
    },
  },
};
