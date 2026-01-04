import { Question } from '@/types';

export const questions: Question[] = [
  // FRESH FROM THE OVEN (Beginner) - 7 questions
  {
    id: 'ffo_001',
    tier: 'Fresh from the Oven',
    question: 'What does "proofing" mean in bread baking?',
    options: ['Mixing ingredients together', 'The final rise before baking', 'Cooling the bread', 'Adding salt to dough'],
    correct: 1,
    explanation: 'Proofing is the final rise of shaped dough before it goes into the oven.',
    category: 'Terminology',
  },
  {
    id: 'ffo_002',
    tier: 'Fresh from the Oven',
    question: 'What is a sourdough "starter"?',
    options: ['A type of oven', 'Fermented flour and water mixture', 'A bread pan', 'Commercial yeast'],
    correct: 1,
    explanation: 'A starter is a fermented mixture of flour and water that contains wild yeast and bacteria used to leaven bread.',
    category: 'Terminology',
  },
  {
    id: 'ffo_003',
    tier: 'Fresh from the Oven',
    question: 'What shape is a "boule"?',
    options: ['Long and thin', 'Square', 'Round', 'Braided'],
    correct: 2,
    explanation: 'Boule means "ball" in French - it\'s a round loaf of bread.',
    category: 'Terminology',
  },
  {
    id: 'ffo_004',
    tier: 'Fresh from the Oven',
    question: 'What tool is used to score bread before baking?',
    options: ['Whisk', 'Lame (blade)', 'Rolling pin', 'Thermometer'],
    correct: 1,
    explanation: 'A lame is a blade used to score (cut) the top of bread dough before baking.',
    category: 'Equipment',
  },
  {
    id: 'ffo_005',
    tier: 'Fresh from the Oven',
    question: 'What makes bread rise?',
    options: ['Salt', 'Yeast producing gas', 'Water', 'Heat alone'],
    correct: 1,
    explanation: 'Yeast consumes sugars and produces carbon dioxide gas, which gets trapped in the gluten network and makes bread rise.',
    category: 'Science',
  },
  {
    id: 'ffo_006',
    tier: 'Fresh from the Oven',
    question: 'Why do bakers score bread before baking?',
    options: ['For decoration only', 'To control expansion in the oven', 'To add flavor', 'To make it cook faster'],
    correct: 1,
    explanation: 'Scoring controls where the bread expands during baking, preventing random tears and creating an attractive appearance.',
    category: 'Techniques',
  },
  {
    id: 'ffo_007',
    tier: 'Fresh from the Oven',
    question: 'What is a banneton?',
    options: ['A type of flour', 'A proofing basket', 'An oven thermometer', 'A mixing bowl'],
    correct: 1,
    explanation: 'A banneton is a basket used to support bread dough during its final proof, giving it shape and a decorative pattern.',
    category: 'Equipment',
  },

  // CRUSTY VETERAN (Intermediate) - 7 questions
  {
    id: 'cv_001',
    tier: 'Crusty Veteran',
    question: 'What is autolyse?',
    options: ['A type of yeast', 'Resting flour and water before adding other ingredients', 'Baking at high temperature', 'Shaping technique'],
    correct: 1,
    explanation: 'Autolyse is a rest period where flour and water are mixed and left to hydrate before adding salt and leavening, which improves gluten development.',
    category: 'Techniques',
  },
  {
    id: 'cv_002',
    tier: 'Crusty Veteran',
    question: 'What is the windowpane test?',
    options: ['Checking oven temperature', 'Stretching dough thin to check gluten development', 'Testing bread doneness', 'Measuring hydration'],
    correct: 1,
    explanation: 'The windowpane test involves stretching a piece of dough thin enough to see light through it, indicating proper gluten development.',
    category: 'Techniques',
  },
  {
    id: 'cv_003',
    tier: 'Crusty Veteran',
    question: 'Calculate: 500g flour with 375g water equals what hydration percentage?',
    options: ['65%', '70%', '75%', '80%'],
    correct: 2,
    explanation: 'Hydration = (water weight / flour weight) × 100. So 375/500 × 100 = 75%.',
    category: 'Science',
  },
  {
    id: 'cv_004',
    tier: 'Crusty Veteran',
    question: 'Your dough is tearing during shaping. What\'s the most likely cause?',
    options: ['Too much water', 'Under-developed gluten', 'Oven too hot', 'Not enough salt'],
    correct: 1,
    explanation: 'Tearing during shaping usually indicates the gluten hasn\'t developed enough. The dough needs more time or more folds.',
    category: 'Troubleshooting',
  },
  {
    id: 'cv_005',
    tier: 'Crusty Veteran',
    question: 'What is a cold retard?',
    options: ['A frozen starter', 'Overnight fermentation in refrigerator', 'Cooling bread too fast', 'A shaping mistake'],
    correct: 1,
    explanation: 'Cold retard means slowing down fermentation by placing dough in the refrigerator, typically overnight, which develops flavor.',
    category: 'Techniques',
  },
  {
    id: 'cv_006',
    tier: 'Crusty Veteran',
    question: 'What does it mean if your starter smells like alcohol?',
    options: ['It\'s perfectly ready', 'It\'s hungry and needs feeding', 'It\'s dead', 'It has too much water'],
    correct: 1,
    explanation: 'An alcohol smell indicates the starter has consumed its food and is hungry. It needs to be fed.',
    category: 'Troubleshooting',
  },
  {
    id: 'cv_007',
    tier: 'Crusty Veteran',
    question: 'What\'s the difference between bread flour and all-purpose flour?',
    options: ['Color', 'Bread flour has more protein', 'Bread flour is sweeter', 'No difference'],
    correct: 1,
    explanation: 'Bread flour has higher protein content (12-14%) than all-purpose flour (10-12%), which creates more gluten for better structure.',
    category: 'Ingredients',
  },

  // MASTER BAKER (Advanced) - 6 questions
  {
    id: 'mb_001',
    tier: 'Master Baker',
    question: 'What is the ideal dough temperature after mixing?',
    options: ['65-68°F (18-20°C)', '75-78°F (24-26°C)', '85-88°F (29-31°C)', '95-98°F (35-37°C)'],
    correct: 1,
    explanation: 'The ideal final dough temperature is typically 75-78°F (24-26°C) for optimal fermentation activity.',
    category: 'Science',
  },
  {
    id: 'mb_002',
    tier: 'Master Baker',
    question: 'What causes the "ear" on a well-scored loaf?',
    options: ['High hydration only', 'Steam lifting the scored flap during oven spring', 'Using a Dutch oven', 'Cold dough'],
    correct: 1,
    explanation: 'The ear forms when steam keeps the scored area flexible while the bread rapidly expands, lifting the flap before it sets.',
    category: 'Science',
  },
  {
    id: 'mb_003',
    tier: 'Master Baker',
    question: 'What is tang zhong?',
    options: ['A Chinese bread type', 'A cooked flour paste for soft Asian breads', 'A fermentation technique', 'A shaping method'],
    correct: 1,
    explanation: 'Tang zhong is a water roux (cooked flour paste) used in Asian milk breads to create an exceptionally soft, fluffy texture.',
    category: 'Techniques',
  },
  {
    id: 'mb_004',
    tier: 'Master Baker',
    question: 'What distinguishes San Francisco sourdough\'s unique flavor?',
    options: ['The flour used', 'Lactobacillus sanfranciscensis bacteria', 'The water', 'Baking temperature'],
    correct: 1,
    explanation: 'San Francisco sourdough gets its distinctive tangy flavor from Lactobacillus sanfranciscensis, a bacteria native to the region.',
    category: 'History & Culture',
  },
  {
    id: 'mb_005',
    tier: 'Master Baker',
    question: 'At what temperature does starch gelatinization occur in bread?',
    options: ['100-120°F (38-49°C)', '150-180°F (65-82°C)', '200-212°F (93-100°C)', '250-275°F (121-135°C)'],
    correct: 1,
    explanation: 'Starch gelatinization occurs around 150-180°F (65-82°C), when starch granules absorb water and swell, setting the crumb structure.',
    category: 'Science',
  },
  {
    id: 'mb_006',
    tier: 'Master Baker',
    question: 'What is "fool\'s crumb"?',
    options: ['Perfectly even holes', 'Open crumb from poor fermentation, not skill', 'A dense, tight crumb', 'Crumb with tunneling'],
    correct: 1,
    explanation: 'Fool\'s crumb refers to large, irregular holes that result from poor fermentation or handling, not intentional technique.',
    category: 'Troubleshooting',
  },
];

export const getQuestionsByTier = (tier: string): Question[] => {
  return questions.filter(q => q.tier === tier);
};

export const getRandomQuestions = (tier: string, count: number): Question[] => {
  const tierQuestions = getQuestionsByTier(tier);
  const shuffled = [...tierQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
