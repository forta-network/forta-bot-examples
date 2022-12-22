import logging
import sys


def setup_custom_logger(name):
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    # Set transformer pkg's logging level to critical to prevent logs raising exceptions in the initialize function.
    logging.getLogger("transformers").setLevel(logging.ERROR)
    logging.getLogger("torch").setLevel(logging.ERROR)

    logger = logging.getLogger("root")
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)

    return logger


logger = setup_custom_logger("root")
