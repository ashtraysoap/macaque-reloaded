from numpy import mean

def mockup_metric(hyps, refs):
    return [100] * len(hyps)

SUPPORTED_METRICS = [
    "BLEU",
    "BLEU1",
    "BLEU2",
    "BLEU3",
    "BLEU4",
    "METEOR"
]

EVALUATORS = {
    "BLEU": mockup_metric,
    "BLEU1": mockup_metric,
    "BLEU2": mockup_metric,
    "BLEU3": mockup_metric,
    "BLEU4": mockup_metric,
    "METEOR": mockup_metric
}

def evaluate(metric, hypotheses, references):
    if not metric in SUPPORTED_METRICS:
        raise RuntimeError("Unsupported metric type", metric)

    evaluator = EVALUATORS[metric]
    scores = evaluator(hypotheses, references)
    return scores, mean(scores)
