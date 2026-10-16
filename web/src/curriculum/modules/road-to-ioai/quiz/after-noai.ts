import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'road-to-ioai.after-noai.1',
    prompt: 'About the top 60 NOAI 2027 finalists are invited to the NTU stage. Which sequence matches the published 2027 timeline?',
    options: [
      'Selection Test on Sat 8 May, four Saturday training sessions, then a camp on 14–18 June',
      'Residential camp on 14–18 June, then a Selection Test on Sat 8 May for the best campers',
      'Selection Test on Fri 5 March, results in early April, then the residential camp in May',
      'Four Saturday training sessions in April, the Selection Test in June, then IOAI in August',
    ],
    answer: 0,
    explanation:
      'NTU\'s Selection Test is on Saturday 8 May 2027, followed by Saturday training on 22 and 29 May and 5 and 12 June, and a residential camp on 14–18 June, before IOAI in Singapore on 4–10 July. Friday 5 March is the NOAI Final, not an NTU test, and IOAI moved from August (2026) to July in 2027.',
    difficulty: 'beginner',
  },
  {
    id: 'road-to-ioai.after-noai.2',
    prompt: 'Based on the tests NTU released from 2024 and 2025, what is the Selection Test most likely to ask you to do?',
    options: [
      'Complete the missing lines of a working baseline notebook, improve it on a real dataset with a GPU, and explain your choices',
      'Answer harder multiple-choice questions on the same five domains as the Prelim, in 90 minutes, without a calculator or notes',
      'Implement three classic algorithms from scratch in NumPy on a CPU, with each function checked against fixed expected outputs',
      'Present a research project you prepared at home to a panel of NTU professors, who mark its originality and presentation',
    ],
    answer: 0,
    explanation:
      'The released tests (CIFAR-10 with ResNet-18, U-Net segmentation on Pascal VOC, a survey prediction task, toxic-comment detection) all gave a runnable baseline with a few lines blanked out, then marked open-ended improvement and short written answers. From-scratch algorithms checked against fixed outputs describe the NOAI Final, and MCQs describe the Prelim.',
    difficulty: 'beginner',
  },
  {
    id: 'road-to-ioai.after-noai.3',
    prompt:
      'An IOAI task is scored by accuracy. The baseline gets $0.40$, the Scientific Committee\'s expert solution $1.00$, and the best contestant $0.85$. You get $0.65$. Using $\\text{score} = \\dfrac{S - \\text{Min}}{\\text{Max} - \\text{Min}} \\times 100$ with $\\text{Max} = \\max(0.9 \\times \\text{SC},\\ \\text{best})$, what is your task score?',
    options: ['50', '55.6', '41.7', '65'],
    answer: 0,
    explanation:
      '$0.9 \\times 1.00 = 0.90$ beats the best contestant\'s $0.85$, so $\\text{Max} = 0.90$. Then $\\dfrac{0.65 - 0.40}{0.90 - 0.40} = \\dfrac{0.25}{0.50} = 0.5$, a score of 50. Using $0.85$ as the finish line gives $0.25 / 0.45 \\approx 55.6$, and using the full expert score $1.00$ gives $0.25 / 0.60 \\approx 41.7$; 65 is just your raw accuracy.',
    difficulty: 'intermediate',
  },
  {
    id: 'road-to-ioai.after-noai.4',
    prompt:
      'IOAI\'s individual contest has two days with three tasks each, and medals go by total score: gold to at least $1/12$ of contestants, gold or silver to at least $1/4$, any medal to at least $1/2$. With 360 contestants and no ties, how many **silver** medals are awarded?',
    options: ['60', '90', '30', '120'],
    answer: 0,
    explanation:
      'Gold: $360 \\div 12 = 30$. Gold or silver together: $360 \\div 4 = 90$, so silver is $90 - 30 = 60$. 90 forgets that the quarter already includes the golds, 30 is the number of golds, not silvers, and 120 is $360 \\div 3$, which is not one of the rule\'s fractions.',
    difficulty: 'intermediate',
  },
  {
    id: 'road-to-ioai.after-noai.5',
    prompt: 'Which of these students could be selected for Singapore\'s IOAI 2027 team, if they did well enough at NTU?',
    options: [
      'A Permanent Resident in JC1, aged 17, who won Bronze at the NOAI Final',
      'A Singapore Citizen in polytechnic who turned 21 in March 2027',
      'An Indonesian student at a Singapore polytechnic who won NOAI Gold',
      'A Singapore Citizen who also sat another country\'s final IOAI selection in 2027',
    ],
    answer: 0,
    explanation:
      'Singapore\'s team is open to Singapore Citizens and Permanent Residents, and IOAI requires contestants to be 20 or younger on 1 July 2027; a NOAI Bronze is no barrier because NTU re-ranks everyone it invites. The 21-year-old is over the age limit, the Indonesian student is not a Citizen or PR, and IOAI forbids attempting the final selection of more than one country in the same year.',
    difficulty: 'beginner',
  },
]

export default questions
