export type SemesterData = Record<string, string[]>;
export type YearData = Record<string, SemesterData>;
export type BranchData = Record<string, YearData>;
export type UniversityData = Record<string, BranchData>;

// Centralized Subject Database mapped exactly by: university -> branch -> year -> semester
const centralizedDatabase: UniversityData = {
  'JNTU': {
    'CSE': {
      '1st Year': {
        'Sem 1': ['Mathematics-I', 'Engineering Physics', 'Programming for Problem Solving'],
        'Sem 2': ['Mathematics-II', 'Engineering Chemistry', 'Data Structures']
      },
      '2nd Year': {
        'Sem 1': ['OOPs with Java', 'Digital Logic Design', 'DBMS'],
        'Sem 2': ['Computer Organization', 'Operating Systems', 'Design and Analysis of Algorithms']
      },
      '3rd Year': {
        'Sem 1': ['Computer Networks', 'Software Engineering', 'Automata Theory'],
        'Sem 2': ['Machine Learning', 'Compiler Design', 'Web Technologies']
      },
      '4th Year': {
        'Sem 1': ['Cloud Computing', 'Cryptography and Network Security'],
        'Sem 2': ['Project Work', 'Seminar']
      }
    },
    'ECE': {
      '1st Year': {
        'Sem 1': ['Mathematics-I', 'Engineering Physics', 'Basic Electrical Engineering'],
        'Sem 2': ['Mathematics-II', 'Engineering Chemistry', 'Electronic Devices']
      },
      '2nd Year': {
        'Sem 1': ['Signals and Systems', 'Network Theory', 'Digital System Design'],
        'Sem 2': ['Analog and Digital Communications', 'Microprocessors', 'Control Systems']
      }
    },
    'MECH': {
      '1st Year': {
        'Sem 1': ['Mathematics-I', 'Physics', 'Engineering Mechanics'],
        'Sem 2': ['Mathematics-II', 'Chemistry', 'Engineering Graphics']
      },
      '2nd Year': {
        'Sem 1': ['Thermodynamics', 'Fluid Mechanics', 'Material Science'],
        'Sem 2': ['Kinematics of Machinery', 'Manufacturing Processes', 'Applied Thermodynamics']
      }
    },
    'CIVIL': {
      '1st Year': {
        'Sem 1': ['Mathematics-I', 'Physics', 'Engineering Mechanics'],
        'Sem 2': ['Mathematics-II', 'Chemistry', 'Engineering Graphics']
      },
      '2nd Year': {
        'Sem 1': ['Strength of Materials', 'Surveying', 'Fluid Mechanics'],
        'Sem 2': ['Structural Analysis', 'Geotechnical Engineering', 'Environmental Engineering']
      }
    }
  },
  'KLU': {
    'CSE': {
      '1st Year': {
        'Sem 1': ['Calculus for Engineers', 'Physics for Computing', 'Intro to Programming in C'],
        'Sem 2': ['Linear Algebra', 'Engineering Chemistry', 'Object Oriented Programming']
      },
      '2nd Year': {
        'Sem 1': ['Data Structures', 'Digital Logic Design', 'DBMS'],
        'Sem 2': ['Design and Analysis of Algorithms', 'Operating Systems', 'Computer Networks']
      }
    },
    'CSIT': {
      '1st Year': {
        'Sem 1': ['Calculus for Engineers', 'Physics for Computing', 'Intro to IT'],
        'Sem 2': ['Linear Algebra', 'Engineering Chemistry', 'Python Programming']
      }
    }
  },
  'VIT': {
    'CSE': {
      '1st Year': {
        'Sem 1': ['Engineering Calculus', 'Engineering Physics', 'Problem Solving with C'],
        'Sem 2': ['Differential Equations', 'Engineering Chemistry', 'Data Structures and Algorithms']
      },
      '2nd Year': {
        'Sem 1': ['Java Programming', 'Digital Logic', 'Database Systems'],
        'Sem 2': ['Algorithms', 'Operating Systems', 'Microprocessors']
      }
    },
    'EEE': {
      '1st Year': {
        'Sem 1': ['Engineering Calculus', 'Engineering Physics', 'Basic Electrical Engineering'],
        'Sem 2': ['Differential Equations', 'Engineering Chemistry', 'Circuit Theory']
      }
    }
  }
};

export const academicData = {
  universities: Object.keys(centralizedDatabase),
  
  getBranches: (university: string): string[] => {
    if (!university || !centralizedDatabase[university]) return [];
    return Object.keys(centralizedDatabase[university]);
  },

  getYears: (university: string, branch: string): string[] => {
    if (!university || !branch || !centralizedDatabase[university]?.[branch]) return [];
    return Object.keys(centralizedDatabase[university][branch]);
  },

  getSemesters: (university: string, branch: string, year: string): string[] => {
    if (!university || !branch || !year || !centralizedDatabase[university]?.[branch]?.[year]) return [];
    return Object.keys(centralizedDatabase[university][branch][year]);
  },

  getSubjects: (university: string, branch: string, year: string, semester: string): string[] => {
    if (!university || !branch || !year || !semester) return [];
    return centralizedDatabase[university]?.[branch]?.[year]?.[semester] || [];
  }
};
