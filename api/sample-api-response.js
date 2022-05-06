// Dummy date values - don't expect them to make sense
exports.sampleResponse = {
    legend: [ model.DANGER_CUTOFF, model.WARNING_CUTOFF ],
    data: {
      maintenance: {
        score: 0.5,
        details: [
          { 
            criterion: 'activity', 
            description: 'Description 1', 
            score: 0.4, 
            weight: 0.3, 
            pass: true 
          },
          { 
            criterion: 'issues', 
            description: 'Description 2',
            score: 0.2,
            weight: 0.3,
            pass: false
          },
          {
            criterion: 'organization',
            description: 'Description 3',
            score: 0.7,
            weight: 0.1,
            pass: true
          },
          {
            criterion: 'communication',
            description: 'Description 4',
            score: 0.5,
            weight: 0.2,
            pass: true
          },
          {
            criterion: 'architecture',
            description: 'Description 5',
            score: 0,
            weight: 0.4,
            pass: false
          }
        ]
      },
      direction: {
        score: 0.8,
        details: [
          {
            criterion: 'guidelines',
            description: 'Description 6',
            score: 1,
            weight: 0.1,
            pass: true
          },
          {
            criterion: 'engagement',
            description: 'Description 7',
            score: 0.5,
            weight: 0.2,
            pass: false
          },
          {
            criterion: 'contribution',
            description: 'Description 8',
            score: 0.8,
            weight: 0.2,
            pass: true
          },
          {
            criterion: 'assignment',
            description: 'Description 9',
            score: 0.2,
            weight: 0.2,
            pass: false
          }
        ]
      },
      community: {
        score: 0.1,
        details: [
          {
            criterion: 'criteria 1',
            description: 'Description 10',
            score: 0.1,
            weight: 0.2,
            pass: false
          },
          {
            criterion: 'criteria 2',
            description: 'Description 11',
            score: 0.2,
            weight: 0.2,
            pass: false
          },
          {
            criterion: 'criteria 3',
            description: 'Description 12',
            score: 0.3,
            weight: 0.2,
            pass: false
          },
          {
            criterion: 'criteria 4',
            description: 'Description 13',
            score: 0.2,
            weight: 0.2,
            pass: false
          },
          {
            criterion: 'criteria 5',
            description: 'Description 14',
            score: 0.1,
            weight: 0.2,
            pass: false
          },
        ]
      }
    }
  }