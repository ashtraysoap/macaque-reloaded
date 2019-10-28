from numpy import mean as np_mean
from neuralmonkey.evaluators.bleu import BLEUEvaluator

def mockup_metric(hyps, refs):
    """Computes mockup metric scores."""
    
    return [100] * len(hyps)

SUPPORTED_METRICS = [
    "BLEU",
    "METEOR",
    "chrf3"
]


"""A mapping from metric names to the evaluating function."""
EVALUATORS = {
    "BLEU": lambda h, r : BLEUEvaluator().bleu(h, r),
    "METEOR": mockup_metric,
    "chrf3": mockup_metric
}

def evaluate(metric, hypotheses, references):
    """Evaluates a metric on hypotheses given references.

    Args:
        metric: The string name of the metric to be evaluated. Has to 
            be one of: BLEU.
        hypotheses: A list of hypotheses. Each hypothesis is a list of 
            string tokens.
        references: A list of lists of references. There can be multiple
            references for an example. A reference is a list of string tokens.
    Returns:
        A tuple (scores, mean), containing a list of score for all instances
        and the average value for the whole dataset.
    """
    if not metric in SUPPORTED_METRICS:
        raise RuntimeError("Unsupported metric type", metric)

    evaluator = EVALUATORS[metric]
    # evaluate the metric for each instance separately
    scores = [evaluator([h], [r]) for (h, r) in zip(hypotheses, references)]
    print(scores)
    # TODO: check that mean == numpy.mean(scores)
    mean = evaluator(hypotheses, references)
    return scores, mean
