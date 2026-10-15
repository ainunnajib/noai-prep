import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ml-systems-and-tradeoffs.lifecycle-and-deployment.1',
    prompt:
      'A team automates its daily retraining. Which component\'s job is to run the extract, clean, feature, train and evaluate steps in the right order every night, and to retry a step that fails?',
    options: ['An orchestrator such as Airflow', 'A model registry such as MLflow\'s registry', 'An experiment tracker such as Weights & Biases', 'A monitoring dashboard such as Grafana'],
    answer: 0,
    explanation:
      'Scheduling steps, running them in order and retrying failures is orchestration. A model registry stores model versions and their stage (staging, production); an experiment tracker records each run\'s config, seed and metrics; a dashboard displays live metrics. All four are part of MLOps, but only the orchestrator runs the pipeline.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-systems-and-tradeoffs.lifecycle-and-deployment.2',
    prompt: 'Which of these predictions needs **real-time** inference rather than a scheduled batch job?',
    options: [
      'Approving or blocking a contactless card payment while it is being tapped',
      'Forecasting next week\'s passenger numbers for every MRT station',
      'Choosing which customers to phone in tomorrow\'s retention campaign',
      'Building each user\'s "recommended for you" list for a morning email',
    ],
    answer: 0,
    explanation:
      'A payment does not exist until the card is tapped, and the decision is needed within a fraction of a second, so it must be scored on arrival. The other three use inputs that are known in advance and can wait hours, so one cheap batch job (for example overnight) serves them all.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-systems-and-tradeoffs.lifecycle-and-deployment.3',
    prompt: 'What does the last line print?',
    code: 'class Clip(nn.Module):\n    def forward(self, x):\n        if x.max() > 10:\n            return x / x.max() * 10\n        return x\n\nmodel = Clip()\ntraced = torch.jit.trace(model, torch.tensor([1.0, 2.0]))\nprint(traced(torch.tensor([5.0, 20.0])))',
    options: ['`tensor([ 5., 20.])`', '`tensor([ 2.5000, 10.0000])`', '`tensor([0.2500, 1.0000])`', 'An error: `torch.jit.trace` cannot export a model that contains `if`'],
    answer: 0,
    explanation:
      'Tracing runs the model once on `[1.0, 2.0]`, whose maximum is 2, so only the `return x` path is recorded and the `if` is frozen. The traced model therefore returns `[5, 20]` unchanged. `[2.5, 10]` is what the original model (or `torch.jit.script`, which keeps the branch) returns. Tracing does not fail; it only warns, which is why the bug is easy to miss.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-systems-and-tradeoffs.lifecycle-and-deployment.4',
    prompt:
      'A team retrains a model every week. They keep every week\'s weights file and the git commit of their code. Each run uses a new random seed that is not logged, and the training table is overwritten each night. An auditor asks them to **retrain** week 3\'s model and get identical weights. What stops them?',
    options: [
      'They no longer have week 3\'s data snapshot or its random seed',
      'Nothing: the weights and the commit are enough to retrain it exactly',
      'They no longer have week 3\'s weights or its preprocessing code',
      'They no longer have week 3\'s validation accuracy or its loss curve',
    ],
    answer: 0,
    explanation:
      'Retraining identically needs the same data, code, config, seed and library versions. The code (commit) survives, but the week-3 data was overwritten and its seed was never recorded, so a retrain gives a different model. The saved weights let them reload and re-run week 3\'s predictions, which is a different request. Metrics describe a model; they cannot recreate it.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-systems-and-tradeoffs.lifecycle-and-deployment.5',
    prompt:
      'A loan model is monitored weekly. Repayment labels arrive 12 weeks after a loan is approved. In week 10 a downturn makes applicants with the same income default more often, while the applicants\' incomes and the model\'s approval rate stay exactly as before. What is the earliest week in which monitoring can reveal the problem?',
    options: ['Week 22', 'Week 10', 'Week 11', 'Never, because monitoring only checks inputs and predictions'],
    answer: 0,
    explanation:
      'This is concept drift: $P(y \\mid x)$ changed while $P(x)$ did not, so the input and approval-rate monitors stay quiet. Only the outcome (default rate) can show it, and the first affected loans, from week 10, get their labels in week $10 + 12 = 22$. Weeks 10 and 11 would be right for data drift, which is visible in the inputs straight away.',
    difficulty: 'intermediate',
  },
]

export default questions
