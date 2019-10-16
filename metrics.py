from numpy import mean as np_mean
from neuralmonkey.evaluators.bleu import BLEUEvaluator

def mockup_metric(hyps, refs):
    return [100] * len(hyps)

SUPPORTED_METRICS = [
    "BLEU",
    "METEOR",
    "chrf3"
]

EVALUATORS = {
    "BLEU": lambda h, r : BLEUEvaluator().bleu(h, r),
    "METEOR": mockup_metric,
    "chrf3": mockup_metric
}

def evaluate(metric, hypotheses, references):
    if not metric in SUPPORTED_METRICS:
        raise RuntimeError("Unsupported metric type", metric)

    evaluator = EVALUATORS[metric]
    # evaluate the metric for each insance separately
    scores = [evaluator([h], [r]) for (h, r) in zip(hypotheses, references)]
    print(scores)
    # TODO: check that mean == numpy.mean(scores)
    mean = evaluator(hypotheses, references)
    return scores, mean
